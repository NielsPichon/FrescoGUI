
from os import kill
import time
import signal
import atexit
import logging
from queue import Queue, Empty
from typing import NoReturn
from multiprocessing import Process, Event
from multiprocessing import Queue as pQueue
from multiprocessing.connection import Connection

from axifresco.axifresco import Axifresco, Point, json_to_shapes, draw, Status


axi_thread = None
PAUSE = Event()
ABORT = Event()
draw_q = pQueue()

class RequestTypes:
    draw: str = 'draw'
    stop: str = 'stop'
    pause_resume: str = 'pause'
    reset: str = 'reset'
    home: str = 'home'

def is_axidraw_alive():
    return axi_thread is not None and axi_thread.is_alive()

def axidraw_runner(draw_q: pQueue, pause_event: Event, abort_event: Event, status_pipe: Connection):
    # create the axidraw handler and set the resolution
    ax = Axifresco({}, resolution=20,
                   unsafe=True,
                   pause_event=pause_event,
                   abort_event=abort_event,
                   status_pipe=status_pipe)

    def exit_cleanly():
        logging.info('Shutting down the axidraw before exiting...')
        try:
            ax.close()
        except Exception as e:
            logging.error(f'Something wrong occured when trying to exit cleanly:\n{e}')

    # try exiting cleanly. Will most likely fail to do so because of
    # how the terminate instruction works.
    signal.signal(signal.SIGINT, exit_cleanly)
    signal.signal(signal.SIGTERM, exit_cleanly)
    atexit.register(exit_cleanly)

    try:
        while True:
            if ax.status == Status.STOPPED and draw_q.qsize() > 0:
                data = draw_q.get()

                status_pipe.send({
                    'state': Status.PLAYING,
                    'message': 'Starting a new drawing. Pre-processing shapes...',
                    'progress': 0
                })

                # process the data
                global_config = data['config']
                shapes = data['drawing']
                config = global_config['axidraw_options']
                spline_res = global_config['spline_res']
                margin = global_config['margin']
                optimize = global_config['optimize']
                format = global_config['format']
                activeLayers = global_config['layers']
                smoothTrajectory = global_config['smoothTrajectory']

                shapes, aspect_ratio = json_to_shapes(shapes)
                shapes = [s for s in shapes if s.layer in activeLayers]

                ax.set_format(Point(format['x'], format['y']))
                ax.set_config(config)
                ax.resolution = spline_res

                draw(
                    shapes,
                    aspect_ratio,
                    ax,
                    margin,
                    optimize,
                    smooth_trajectory=False,
                    preview=False,
                    use_v2=smoothTrajectory
                )
            else:
                time.sleep(0.2)
    except:
        pass
    finally:
        exit_cleanly()

def draw_request(data, status_pipe: Connection):
    global axi_thread

    # Only create a new process if none is running
    if axi_thread is None or not axi_thread.is_alive():
        axi_thread = Process(target=axidraw_runner, args=(draw_q, PAUSE, ABORT, status_pipe,), daemon=True)
        axi_thread.start()

    # put the data
    draw_q.put(data)

    # unset any pause or abort instruction
    PAUSE.clear()
    ABORT.clear()

def kill_axidraw(status_pipe: Connection):
    status_pipe.send({
            'state': Status.STOPPED,
            'message': 'Axidraw has been stopped. Press play to draw.',
            'progress': 0
    })
    clear_draw_q()
    axi_thread.terminate()

def stop_draw(data, status_pipe: Connection):
    logging.info('Stopping axidraw...')
    global axi_thread

    if is_axidraw_alive():
        kill_axidraw(status_pipe=status_pipe)
        # because the axidraw will most likely have not
        # exited cleanly, reset it.
        reset_axidraw({}, status_pipe)
        clear_draw_q()
    else:
        logging.warning('The axidraw process is already stopped.')

def pause_resume(data, status_pipe: Connection):
    if axi_thread is None or not axi_thread.is_alive():
        logging.warning('Cannot pause/resume draw as the axidraw thread is dead.')

    if PAUSE.is_set():
        logging.info('Resuming draw...')
        PAUSE.clear()
        status_pipe.send({
            'state': Status.PLAYING,
            'message': 'Resuming draw...',
            'progress': 0
        })
    else:
        logging.info('Pausing draw...')
        PAUSE.set()
        status_pipe.send({
            'state': Status.PAUSED,
            'message': 'Axidraw paused. Press Play to resume or Home to send the draw head home.',
            'progress': 0
        })

def reset_axidraw(data, status_pipe: Connection):
    global axi_thread
    if is_axidraw_alive():
        logging.warning('Axidraw is not stopped. Stopping it first.')
        kill_axidraw(status_pipe=status_pipe)
        time.sleep(0.2)

    logging.info('Resetting the axidraw...')
    ax = Axifresco(config={}, unsafe=True, reset=True)
    ax.stop_motors()
    ax.axidraw.disconnect()
    status_pipe.send({
            'state': Status.STOPPED,
            'message': 'Axidraw has been stopped. Press play to draw.',
            'progress': 0
    })

def clear_draw_q():
    try:
        while True:
            draw_q.get_nowait()
    except Empty:
        pass

def go_home(data, status_pipe: Connection):
    if PAUSE.is_set():
        logging.info('Aborting and sending axidraw home')
        ABORT.set()
        clear_draw_q()
        status_pipe.send({
            'state': Status.STOPPED,
            'message': 'Axidraw has been sent home. Press play to draw.',
            'progress': 0
        })
    else:
        logging.error('Axidraw is not stopped. Can\'t send home')


process_request = {
    RequestTypes.draw: draw_request,
    RequestTypes.stop: stop_draw,
    RequestTypes.pause_resume: pause_resume,
    RequestTypes.reset: reset_axidraw,
    RequestTypes.home: go_home,
}

def request_processor(q: Queue, status_pipe: Connection) -> NoReturn:
    """
    Process runner for the axidraw server
    """
    try:
        logging.info('Ready to boogie!')
        while 1:
            request, data = q.get()
            try:
                process_request[request](data, status_pipe)
            except Exception as e:
                logging.error(f'Something went terribly wrong:\n{e}')
                raise e
            time.sleep(0.01)

    except KeyboardInterrupt:
        stop_draw()
        exit(0)

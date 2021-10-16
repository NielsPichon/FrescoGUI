
import atexit
from os import stat
import time
import signal
from typing import NoReturn, List, Dict
from multiprocessing import Process, Event
from multiprocessing.connection import Connection
from queue import Queue

from AxiFresco.axifresco import Axifresco, Point, json_to_shapes, draw, Status


axi_thread = None
PAUSE = Event()
ABORT = Event()

class RequestTypes:
    draw: str = 'draw'
    stop: str = 'stop'
    pause_resume: str = 'pause'
    reset: str = 'reset'
    home: str = 'home'

def axidraw_runner(data, pause_event: Event, abort_event: Event, status_pipe: Connection):
    # process the data
    global_config = data['config']
    shapes = data['drawing']
    config = global_config['axidraw_options']
    spline_res = global_config['spline_res']
    margin = global_config['margin']
    optimize = global_config['optimize']
    format = global_config['format']
    activeLayers = global_config['layers']

    print(shapes)

    shapes, aspect_ratio = json_to_shapes(shapes)

    shapes = [s for s in shapes if s.layer in activeLayers]

    # create the axidraw handler and set the resolution
    ax = Axifresco(config, resolution=spline_res,
                   unsafe=True,
                   pause_event=pause_event,
                   abort_event=abort_event,
                   status_pipe=status_pipe)
    ax.set_format(Point(format['x'], format['y']))

    def exit_cleanly():
        print('Shutting down the axidraw before exiting...')
        try:
            ax.close()
        except Exception as e:
            print ('Something wrong occured when trying to exit cleanly:\n', e)

    # try exiting cleanly. Will most likely fail to do so because of 
    # how the terminate instruction works.
    signal.signal(signal.SIGINT, exit_cleanly)
    signal.signal(signal.SIGTERM, exit_cleanly)
    atexit.register(exit_cleanly)

    # draw the shapes
    draw(shapes, aspect_ratio, ax, margin, optimize, preview=False)

    # stop the axidraw
    exit_cleanly()

def draw_request(data, status_pipe: Connection):
    print('Drawing...')
    global axi_thread

    # if a thread is already running then we don't want to
    # do anything else
    if axi_thread is not None and axi_thread.is_alive():
        print('Axidraw is already running. Will ignore request')
        return

    # update status
    status_pipe.send({
        'state': Status.PLAYING,
        'message': 'Drawing starts. Pre-processing data...',
        'progress': 0
    })

    # start a new process which draws
    axi_thread = Process(target=axidraw_runner, args=(data, PAUSE, ABORT, status_pipe,), daemon=True)
    PAUSE.clear()
    ABORT.clear()
    axi_thread.start()

def stop_draw(data, status_pipe: Connection):
    print('Stopping axidraw...')
    global axi_thread

    if axi_thread is not None and axi_thread.is_alive():
        status_pipe.send({
                'state': Status.STOPPED,
                'message': 'Axidraw has been stopped. Press play to draw.',
                'progress': 0
        })  
        axi_thread.terminate()
        # because the axidraw will most likely have not 
        # exited cleanly, reset it.
        reset_axidraw({}, status_pipe)

def pause_resume(data, status_pipe: Connection):
    if PAUSE.is_set():
        print('Resuming draw...')
        PAUSE.clear()
    else:
        print('Pausing draw...')
        PAUSE.set()
        status_pipe.send({
            'state': Status.PAUSED,
            'message': 'Axidraw paused. Press Play to resume or Home to send the draw head home.',
            'progress': 0
        })

def reset_axidraw(data, status_pipe: Connection):
    global axi_thread
    if axi_thread and axi_thread.is_alive():
        return

    print('Resetting the axidraw...')
    ax = Axifresco(config={}, unsafe=True, reset=True)
    ax.stop_motors()
    ax.axidraw.disconnect()
    status_pipe.send({
            'state': Status.STOPPED,
            'message': 'Axidraw has been stopped. Press play to draw.',
            'progress': 0
    })

def go_home(data, status_pipe: Connection):
    if PAUSE.is_set():
        print('Aborting and sending axidraw home')
        ABORT.set()
        status_pipe.send({
            'state': Status.STOPPED,
            'message': 'Axidraw has been sent home. Press play to draw.',
            'progress': 0
        })
    else:
        print('Axidraw is not stopped. Can\'t send home')
    

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
        print('Ready to boogie!')
        print(q)
        while 1:
            request, data = q.get()
            process_request[request](data, status_pipe)
            time.sleep(0.01)

    except KeyboardInterrupt:
        stop_draw()
        exit(0)

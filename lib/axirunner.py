
import argparse
import atexit
import time
import signal
from typing import NoReturn, List, Dict
from multiprocessing import Queue, Process, Event

from AxiFresco.axifresco import Axifresco, Point, json_to_shapes, draw


axi_thread = None
PAUSE = Event()

class RequestTypes:
    draw: str = 'draw'
    stop: str = 'stop'
    pause_resume: str = 'pause'

def axidraw_runner(data, pause_event):
    # process the data
    global_config = data['config']
    shapes = data['drawing']
    config = global_config['axidraw_options']
    spline_res = global_config['spline_res']
    margin = global_config['margin']
    optimize = global_config['optimize']
    format = global_config['format']
    
    shapes, aspect_ratio = json_to_shapes(shapes)

    # create the axidraw handler and set the resolution
    ax = Axifresco(config, resolution=spline_res,
                   unsafe=True,
                   pause_event=pause_event)
    ax.set_format(Point(format['x'], format['y']))

    # make sure that no matter what we'll exit cleanly
    def exit_cleanly():
        print('Shutting down the axidraw before exiting...')
        try:
            ax.close()
        except Exception as e:
            print ('Something wrong occured when trying to exit cleanly:\n', e)

    signal.signal(signal.SIGINT, exit_cleanly)
    signal.signal(signal.SIGTERM, exit_cleanly)
    signal.signal(signal.SIGKILL, exit_cleanly)
    atexit.register(exit_cleanly)

    # draw the shapes
    draw(shapes, aspect_ratio, ax, margin, optimize, preview=False)

    # stop the axidraw
    exit_cleanly()

def draw_request(data):
    print('Got some data to draw', data)
    return
    global axi_thread

    # if a thread is already running then we don't want to
    # do anything else
    if axi_thread is not None and axi_thread.is_alive():
        print('Axidraw is already running. Will ignore request')
        return

    # start a new process which draws
    axi_thread = Process(target=axidraw_runner, args=(data, PAUSE,), daemon=True)
    PAUSE.clear()
    axi_thread.start()

def stop_draw(*args):
    print('Stopping...')
    global axi_thread

    if axi_thread is not None and axi_thread.is_alive():
        axi_thread.terminate()

def pause_resume(*args):
    if PAUSE.is_set():
        print('Resuming...')
        PAUSE.clear()
    else:
        print('Pausing...')
        PAUSE.set()

process_request = {
    RequestTypes.draw: draw_request,
    RequestTypes.stop: stop_draw,
    RequestTypes.pause_resume: pause_resume
}

def request_processor(q: Queue) -> NoReturn:
    """
    Process runner for the axidraw server
    """
    try:
        while 1:
            request, data = q.get()
            process_request[request](data)
            time.sleep(0.01)

    except KeyboardInterrupt:
        stop_draw()
        exit(0)

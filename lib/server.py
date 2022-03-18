import json
import time
import queue
import logging
import threading
import webbrowser
from multiprocessing import Process, Pipe
from http.server import SimpleHTTPRequestHandler, HTTPServer

from flask import Flask, request
from flask_restful import Api
from flask_cors import CORS, cross_origin

from lib.axirunner import RequestTypes, request_processor
from axifresco.axifresco import Status

PORT = 8000

app = Flask(__name__)
api = Api(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/draw', methods=['POST'])
@cross_origin()
def draw():
    logging.debug("Got a new draw request")
    try:
        draw_data = json.loads(request.data.decode())
        app.config['Queue'].put((RequestTypes.draw, draw_data))
    except:
        return "invalid data"
    return "sent"

@app.route('/stop', methods=['POST'])
@cross_origin()
def stop():
    logging.debug('Got a request to stop immediatly')
    app.config['Queue'].put((RequestTypes.stop, ''))
    return "sent"

@app.route('/pause', methods=['POST'])
@cross_origin()
def pause():
    logging.debug('Got a request to pause/resume')
    app.config['Queue'].put((RequestTypes.pause_resume, ''))
    return "sent"

@app.route('/home', methods=['POST'])
@cross_origin()
def home():
    logging.debug('Got a request to send axidraw home')
    app.config['Queue'].put((RequestTypes.home, ''))
    return "sent"

@app.route('/reset', methods=['POST'])
@cross_origin()
def reset():
    logging.debug('Got a request to stop motors')
    app.config['Queue'].put((RequestTypes.reset, ''))
    return "sent"


@app.route('/status', methods=['GET'])
@cross_origin()
def status():
    if app.config['StatusQueue'].poll():
        received = app.config['StatusQueue'].recv()
        return received
    else:
        return ''

def app_runner():
    app.run()

def run_html_server():
    web_server = HTTPServer(('', PORT), SimpleHTTPRequestHandler)

    try:
        logging.info(f'HTML server opened at http://localhost:{PORT}/')
        web_server.serve_forever()
    except KeyboardInterrupt:
        pass

    web_server.server_close()
    logging.info('HTML server was correctly shut down.')

def get_browser() -> webbrowser.BaseBrowser:
    browsers = [
        'windows-default',
        'firefox',
        'chrome',
        'macosx',
        'opera'
    ]

    for candidate in browsers:
        try:
            browser = webbrowser.get(candidate)
            return browser
        except:
            pass
    raise Exception('Could not find any available internet browser')

app.logger.disabled = True
log = logging.getLogger('werkzeug').disabled = True


if __name__ == '__main__':
    # set log level and logging to a log file and stderr
    formatter = logging.Formatter("%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s")
    handlers = [
        logging.FileHandler('debug.log', mode='w', encoding='utf-8'),
        logging.StreamHandler()
    ]
    for h in handlers:
        h.setFormatter(formatter)
    logging.basicConfig(
        handlers=handlers,
        level=logging.DEBUG
    )

    rqst_q = queue.Queue()
    app.config['Queue'] = rqst_q
    status_rcv, status_pipe = Pipe() # we always want the latest known status
    app.config['StatusQueue'] = status_rcv
    last_status = {
        'status': Status.STOPPED,
        'message': 'Press play to draw.',
        'progress': 0
    }
    app.config['LastStatus'] = last_status

    logging.info('Starting python server...')
    app_proc = threading.Thread(target=app_runner, daemon=True)
    app_proc.start()

    # wait for server initialisation
    time.sleep(1.0)

    logging.info('Starting HTML server...')
    web_server_proc = Process(target=run_html_server, daemon=True).start()
    time.sleep(1.0)
    browser = get_browser()
    browser.open(f'http://localhost:{PORT}/')

    # run axidraw handler
    logging.info('Starting axidraw handler...')
    request_processor(rqst_q, status_pipe)

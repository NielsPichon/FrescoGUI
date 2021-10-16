from multiprocessing import Process
import threading
import queue
import json
import time
from http.server import SimpleHTTPRequestHandler, HTTPServer
import webbrowser

from flask import Flask, request
from flask_restful import Api
from flask_cors import CORS, cross_origin

from lib.axirunner import RequestTypes, request_processor
from AxiFresco.axifresco import Status


PORT = 8000

app = Flask(__name__)
app = Flask(__name__)
api = Api(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/draw', methods=['POST'])
@cross_origin()
def draw():
    print("Got a new draw request")
    try:
        draw_data = json.loads(request.data.decode())
        app.config['Queue'].put((RequestTypes.draw, draw_data))
    except:
        return "invalid data"
    return "sent"

@app.route('/stop', methods=['POST'])
@cross_origin()
def stop():
    print('Got a request to stop immediatly')
    app.config['Queue'].put((RequestTypes.stop, ''))
    return "sent"

@app.route('/pause', methods=['POST'])
@cross_origin()
def pause():
    print('Got a request to pause/resume')
    app.config['Queue'].put((RequestTypes.pause_resume, ''))
    return "sent"

@app.route('/home', methods=['POST'])
@cross_origin()
def home():
    print('Got a request to send axidraw home')
    app.config['Queue'].put((RequestTypes.home, ''))
    return "sent"

@app.route('/status', methods=['GET'])
@cross_origin()
def get_status():
    if not app.config['StatusQueue'].empty():
        app.config['LastStatus'] = app.config['StatusQueue'].get()

    return app.config['LastStatus']
    

def app_runner():
    app.run()

def run_html_server():
    web_server = HTTPServer(('', PORT), SimpleHTTPRequestHandler)
    
    try:
        print(f'HTML server opened at http://localhost:{PORT}/')
        web_server.serve_forever()
    except KeyboardInterrupt:
        pass

    web_server.server_close()
    print('HTML server was correctly shut down.')

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


if __name__ == '__main__':
    rqst_q = queue.Queue()
    app.config['Queue'] = rqst_q
    status_q = queue.LifoQueue() # we always want the latest known status
    app.config['StatusQueue'] = status_q
    last_status = {
        'status': Status.STOPPED,
        'message': 'Press play to draw.',
        'progress': 0
    }
    app.config['LastStatus'] = last_status

    print('Starting python server...')
    app_proc = threading.Thread(target=app_runner, daemon=True)
    app_proc.start()
    
    # wait for server initialisation
    time.sleep(1.0)

    print('Starting HTML server...')
    web_server_proc = Process(target=run_html_server, daemon=True).start()
    time.sleep(1.0)
    browser = get_browser()
    browser.open(f'http://localhost:{PORT}/')

    # run axidraw handler
    print('Starting axidraw handler...')
    request_processor(rqst_q, status_q)

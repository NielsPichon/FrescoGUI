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
    print(app.config['Queue'])
    app.config['Queue'].put((RequestTypes.pause_resume, ''))
    return "sent"

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
    q = queue.Queue()
    app.config['Queue'] = q

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
    request_processor(q)

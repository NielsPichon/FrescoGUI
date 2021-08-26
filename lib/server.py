from multiprocessing import Queue, Process
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
api = Api(app)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

browsers = [
    'windows-default',
    'firefox',
    'chrome',
    'macosx',
    'opera'
]

@app.route('/draw', methods=['POST'])
@cross_origin()
def draw():
    print("Got a new draw request")
    try:
        draw_data = json.loads(request.data.decode())
        q.put((RequestTypes.draw, draw_data))
    except:
        return "invalid data"
    return "sent"

@app.route('/stop', methods=['POST'])
@cross_origin()
def stop():
    print('Got a request to stop immediatly')
    q.put((RequestTypes.stop, ''))
    return "sent"

@app.route('/pause', methods=['POST'])
@cross_origin()
def pause():
    print('Got a request to pause/resume')
    q.put((RequestTypes.pause_resume, ''))
    return "sent"

def app_runner(q: Queue):
    app.run()

def run_html_server():
    web_server = HTTPServer(('', PORT), SimpleHTTPRequestHandler)
    
    try:
        print(f'HTML server opened at http://0.0.0.0:{PORT}')
        web_server.serve_forever()
    except KeyboardInterrupt:
        pass

    web_server.server_close()
    print('HTML server was correctly shut down.')

def get_browser() -> webbrowser.BaseBrowser:
    for candidate in browsers:
        try:
            browser = webbrowser.get(candidate)
            return browser
        except:
            pass
    raise Exception('Could not find any available internet browser')


if __name__ == '__main__':
    # init the queue to communicate betwen the 
    # sever and the axidraw manager
    q = Queue()

    print('Starting python server...')
    app_proc = Process(target=app_runner, args=(q,), daemon=True).start()
    
    # wait for server initialisation
    time.sleep(1.0)

    print('Starting HTML server...')
    web_server_proc = Process(target=run_html_server, daemon=True).start()
    time.sleep(1.0)
    browser = get_browser()
    browser.open(f'http://0.0.0.0:{PORT}')

    # run axidraw handler
    print('Starting axidraw handler...')
    request_processor(q)

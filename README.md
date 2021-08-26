# FrescoGUI

Welcome! This is a GUI to use with an axidraw to draw Fresco json files.


# Setup
Clone this repository, then,
On linux:
    `./setup.sh`
On windows:
    Coming soon..

# Running
Add your sketch somewhere within this directory or its subdiresctories.
Make sure it imports the p5.Fresco `utils.js` and `shapes.js` scripts
at the very least. 

On linux:
    `./AxiFresco`
On windows:
    Coming soon...

Then navigate to whatever sketch you want to draw. When all is fine, press `a`.
A new tab should open with your drawing previewed on the left.
Firefox and Chrome may block the new tab
so make sure to allow it.

If you want to use the GUI with a pre-existing file,
simply lauch the `axidraw.html` file right after
opening the server and load your file in the option pannel.

# Architecture notes
There is an HTML server which handles all html requests and which will allow
running the p5.js/p5.Fresco sketches and all.
This one talks on port 8000. Then there is a Flask python server which
handles requests from the html page. It talks on port 5000.
The Flask server will q commands, q that is then read by a dequeueing
thread which owns the axidraw manager.
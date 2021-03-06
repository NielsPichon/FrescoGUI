let axidrawStatus = {
    state: 'stopped', // playing/stopped/paused
    message: 'Press play to draw.', // any string
    progress: 0 //0-100 int
};

let doOnce = true;

let shouldUpdateStatus = false;

function sendSynchronousRequest(data, endpoint, type="POST") {
    let r = new XMLHttpRequest();
    r.open(type, "http://127.0.0.1:5000/" + endpoint, false);
    r.send(JSON.stringify(data));

    return r.status;
}

function sendRequest(data, endpoint, type="POST") {
    let r = new XMLHttpRequest();
    r.open(type, "http://127.0.0.1:5000/" + endpoint, true);
    r.onreadystatechange = function () {
        if (r.readyState != 4 || r.status != 200) return;
    };
    r.send(JSON.stringify(data));
}

function getRequest(endpoint) {
    let r = new XMLHttpRequest();
    r.open('GET', "http://127.0.0.1:5000/" + endpoint, false);
    r.send(null);
    return r.responseText;
}

function sendDrawRequest() {
    if (doOnce) {
        doOnce = false;
        alert('Please move the axidraw to home position');
    }

    sendRequest({
        config: formatConfig(),
        drawing: prepareJSONData(),
    }, "draw");
    console.log('Sent drawing and config to axidraw');
}
 
function sendPauseResumeRequest() {
    sendRequest({}, "pause");
    console.log('Sent pause request');
}

function sendStopRequest() {
    sendRequest({}, "stop")
    console.log('Sent stop request');
    doOnce = true;
}

function sendResetRequest(synchronous=false) {
    if (synchronous) {
        sendSynchronousRequest({}, "reset")
    }
    else {
        sendRequest({}, "reset")
    }
    console.log('Sent motor stop request');
    doOnce = true;
}

function sendHomeRequest() {
    sendRequest({}, "home")
    console.log('Sent go home request');
}

function sendSecondaryAction() {
    let icon = document.getElementById('secondary-bttn-icon');
    if (icon.className == 'fas fa-pause') {
        icon.className = 'fas fa-home';
        sendPauseResumeRequest();
    }
    else {
        icon.className = 'fas fa-pause';
        sendHomeRequest();
    }
}

function sendDrawResumeRequest() {
    shouldUpdateStatus = true;
    let icon = document.getElementById('secondary-bttn-icon');
    if (icon.className == 'fas fa-home') {
        sendPauseResumeRequest();
    }
    else {
        sendDrawRequest();
        document.getElementById('secondary-bttn').disabled = false;
    }
}

function prepareJSONData() {
    // if (currentText == '') {
    //     return currentJSONData;
    // }
    // else {
    let shapes = [...currentShapes, ...textShapes];
    return JSON.parse(shapesToJSON(shapes));
    // }
}

function updateStatus(status) {
    axidrawStatus = status;

    setStatusMessage(status.message);

    if (status.state == 'stopped') {
        // disable pause/home button
        pauseIcon = document.getElementById('secondary-bttn-icon');
        pauseIcon.className = 'fas fa-pause';
        pauseIcon.disabled = true;
        pauseBttn = document.getElementById('secondary-bttn');
        pauseBttn.disabled = true;
        
        // enable power button
        offBttn = document.getElementById('off-bttn');
        offBttn.disabled = false;
        offIcon = document.getElementById('off-bttn-icon');
        offIcon.disabled = false;

        hideProgressBar();
        shouldUpdateStatus = false;
    }
    else if (status.state == 'paused') {
        showProgressBar();
        // enable power button
        offBttn = document.getElementById('off-bttn');
        offBttn.disabled = false;
        offBttnIcon = document.getElementById('off-bttn-icon');
        offBttnIcon.disabled = false;
    }
    else if (status.state = 'playing') {
        showProgressBar();
        setProgressPercentage(status.progress)
        // disable power button
        offBttn = document.getElementById('off-bttn');
        offBttn.disabled = true;
    }
}

function getStatus() {
    let response = getRequest("status");
    let status;
    if (response !== '') {
        eval('status = ' + response)
    }

    if (status) {
        updateStatus(status);
    }
}

function formatConfig() {
    // let margins = currentMargins;
    // if (currentText != '') {
    //     margins = [0, 0, 0, 0];
    // }

    return {
        axidraw_options: axidraw_options,
        spline_res: currentSplineResolution,
        margin: 0, // we always encode the margins into the shapes
                   // to be sure that what we draw is what we see
        optimize: optimize,
        smoothTrajectory: smoothTrajectory,
        format: {x: currentFormat[0], y: currentFormat[1]},
        layers: selectedLayers
    }
}

function maybeGetStatus() {
    // if (shouldUpdateStatus) {
        getStatus();
    // }
}

const statusUpdater = window.setInterval(maybeGetStatus, 500);

function downloadJSONFile(content, fileName) {
    let a = document.createElement("a");
    let file = new Blob([content], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function exportSettings() {
    console.log('Got an export request')
    let config = formatConfig();
    config.text = currentText;
    config.textSize = titleSize;
    config.textPos = titleBottomMargin;
    config.margins = currentMargins; // the margins in the format config settings 
                                     // have been encoded into the shapes if there is some text.
                                     // We don't wnat that for config exports, only for drawing.
    let jsonData = {settings: config, drawing: currentJSONData}

    downloadJSONFile(JSON.stringify(jsonData), 'fresco_drawing.json');
}

function loadJSONFile(path) {
    const response = fetch(path);
    console.log(response);
    return response.json();
}

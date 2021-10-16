let axidrawStatus = {
    state: 'stopped', //playing/stopped/paused
    message: 'Press play to draw.', // any string
    progress: 0 //0-100 int
};

let shouldUpdateStatus = false;

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
    sendRequest({
        config: formatConfig(),
        drawing: currentJSONData,
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
}

function sendResetRequest() {
    sendRequest({}, "reset")
    console.log('Sent reset request');
}

function sendHomeRequest() {
    sendRequest({}, "home")
    console.log('Sent reset request');
}

function sendSecondaryAction() {
    let icon = document.getElementById('secondary-bttn-icon');
    if (icon.className == 'fas fa-pause') {
        icon.className = 'fas fa-home';
        document.getElementById('secondary-bttn-icon').className = 'fas fa-home';
        sendPauseResumeRequest();
    }
    else {
        icon.className = 'fas fa-pause';
        document.getElementById('secondary-bttn-icon').className = 'fas fa-pause';
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

function updateStatus(status) {
    axidrawStatus = status;

    setStatusMessage(status.message);

    if (status.state == 'stopped') {
        document.getElementById('secondary-bttn-icon').className = 'fas fa-pause';
        document.getElementById('secondary-bttn').disabled = true;
        hideProgressBar();
        shouldUpdateStatus = false;
    }
    else if (status.state == 'paused') {
        showProgressBar();
    }
    else if (status.state = 'playing') {
        showProgressBar();
        setProgressPercentage(status.progress)
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
    return {
        axidraw_options: axidraw_options,
        spline_res: currentSplineResolution,
        margin: currentMargins[0],
        optimize: optimize,
        format: {x: currentFormat[0], y: currentFormat[1]},
        layers: selectedLayers
    }
}

function maybeGetStatus() {
    if (shouldUpdateStatus) {
        getStatus();
    }
}

const statusUpdater = window.setInterval(maybeGetStatus, 500);

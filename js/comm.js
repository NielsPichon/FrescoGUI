let axidrawStatus = {
    state: 'stopped', //playing/stopped/paused
    message: 'Press play to run.', // any string
    progress: 0 //0-100 int
};

let shouldUpdateStatus = false;

function sendRequest(data, endpoint) {
    let r = new XMLHttpRequest();
    r.open("POST", "http://127.0.0.1:5000/" + endpoint, true);
    r.onreadystatechange = function () {
        if (r.readyState != 4 || r.status != 200) return;
    };
    r.send(JSON.stringify(data));
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
    let secondaryBttn = document.getElementById('secondary-bttn-icon');
    if (secondaryBttn.className == 'fas fa-pause') {
        secondaryBttn.className = 'fas fa-home';
        sendPauseResumeRequest();
    }
    else {
        secondaryBttn.className = 'fas fa-pause';
        sendHomeRequest();
    }
}

function sendDrawResumeRequest() {
    shouldUpdateStatus = true;
    let secondaryBttn = document.getElementById('secondary-bttn-icon');
    if (secondaryBttn.className == 'fas fa-home') {
        sendPauseResumeRequest();
    }
    else {
        sendDrawRequest();
    }
}

function updateStatus(status) {
    axidrawStatus = status;

    setStatusMessage(status.message);

    if (status.state == 'stopped') {
        let secondaryBttn = document.getElementById('secondary-bttn');
        document.getElementById('secondary-bttn-icon').className = 'fas fa-pause';
        secondaryBttn.disabled = true;
        hideProgressBar();
        shouldUpdateStatus = false;
    }
    else if (status.state == 'paused') {
        document.getElementById('secondary-bttn-icon').className = 'fas fa-home';
        showProgressBar();
    }
    else if (status.state = 'playing') {
        document.getElementById('secondary-bttn-icon').className = 'fas fa-pause';
        secondaryBttn.false = true;
        showProgressBar();
        setProgressPercentage(status.progress)
    }
}

function getStatus() {
    let status = sendRequest({}, "status");

    if (status) {
        updateStatus(status);
    }
}

function formatConfig() {
    return {
        axidraw_options: axidraw_options,
        spline_res: currentSplineResolution,
        margin: currentMargin,
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

const statusUpdater = window.setInterval(maybeGetStatus, 200);

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


function formatConfig() {
    return {
        axidraw_options: axidraw_options,
        spline_res: currentSplineResolution,
        margin: currentMargin,
        optimize: optimize,
        format: {x: currentFormat[0], y: currentFormat[1]},
    }
}
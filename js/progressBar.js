function hideProgressBar() {
    document.getElementById('progress-text').hidden = true;
    document.getElementById('progress-bar').hidden = true;
    document.getElementById('progress-bar-front').hidden = true;
}

function showProgressBar() {
    document.getElementById('progress-text').hidden = false;
    document.getElementById('progress-bar').hidden = false;
    document.getElementById('progress-bar-front').hidden = false;
}

function setProgressBarFill(percentage) {
    document.getElementById('progress-bar-front').style.width = (percentage / 100 * 450) + 'px';
}

function setProgressText(percentage) {
    document.getElementById('progress-text').textContent = percentage + '\%';
}

function setProgressPercentage(percentage) {
    setProgressBarFill(percentage);
    setProgressText(percentage);
}

function setStatusMessage(message){
    document.getElementById('status-msg').textContent = message;
}

function createProgressBar() {
    let status = document.getElementById('status');
    
    let msg = document.createElement('span');
    msg.className = 'statusMessage';
    msg.id = 'status-msg';
    msg.textContent = axidrawStatus.message;
    status.appendChild(msg);

    let row = document.createElement('div');
    row.className = 'progressRow';
    row.id = 'progress-row';
    status.appendChild(row);

    let bar = document.createElement('div');
    bar.className = 'progressBar';
    bar.id = 'progress-bar';
    row.appendChild(bar);

    let barFront = document.createElement('div');
    barFront.className = 'progressBarFront';
    barFront.id = 'progress-bar-front';
    bar.appendChild(barFront);

    let text = document.createElement('p');
    text.className = 'progressPercentage';
    text.id = 'progress-text';
    row.appendChild(text);

    setProgressPercentage(0)
    hideProgressBar();
}

createProgressBar();
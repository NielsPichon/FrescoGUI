let linked = true;

function toggleLink() {
    let link = document.getElementById('link-icon');
    if (link.className == 'fas fa-link') {
        linked = false;
        link.className = 'fas fa-unlink';
    }
    else if (link.className == 'fas fa-unlink') {
        linked = true;
        link.className = 'fas fa-link';
    }
}

function clipMargin(value, idx) {
    value = Math.max(0, value)

    if (idx < 2) {
        value = Math.min(currentFormat[1] / 2 - 1, value);
    }
    else {
        value = Math.min(currentFormat[0] /2 - 1, value);
    }

    return Math.floor(value);
}

function marginChange(id, idx) {
    let newMargin = document.getElementById(id).value;
    newMargin = clipMargin(newMargin, idx);

    let buffer = [0, 0, 0, 0];
    
    if (linked) {
        let extra = newMargin - currentMargins[idx];
        let ratioChange = true;
        while (ratioChange) {
            ratioChange = false;
            for (let i = 0; i < 4; i++) {
                if (i != idx) {
                    let newVal = currentMargins[i] + extra;
                    buffer[i] = clipMargin(newVal);
                    if (buffer[i] != newVal) {
                        extra = buffer[i] - currentMargins[i];
                        ratioChange = true;
                        break;
                    }
                }
            }
        }
        buffer[idx] = currentMargins[idx] + extra;

        for (let i = 0; i < 4; i++) {
            currentMargins[i] = buffer[i];
        }
    }
    else {
        currentMargins[idx] = newMargin;
    }

    setMargins();
    updateDrawing();
}

function setMargins() {
    document.getElementById('top-margin').value = currentMargins[0];
    document.getElementById('bottom-margin').value = currentMargins[1];
    document.getElementById('left-margin').value = currentMargins[2];
    document.getElementById('right-margin').value = currentMargins[3];
}

function createLinkIcon(parentId) {
    let link = document.createElement('div');
    link.className = 'link';
    link.onclick = toggleLink;
    document.getElementById(parentId).appendChild(link);

    let icon = document.createElement('i');
    icon.className = "fas fa-link";
    icon.id = 'link-icon';
    link.appendChild(icon);
}

function createMarginRow(id) {
    let row = document.createElement('div');
    row.className = 'crossRow';
    row.id = id;
    document.getElementById('cross').appendChild(row);
}

function createMarginBox(parentId, id, idx) {
    let box = document.createElement('div');
    box.className = 'sizebox';
    document.getElementById(parentId).appendChild(box);

    let input = document.createElement('input');
    input.className = 'sizeboxText';
    input.value = currentMargins[idx];
    input.type = 'text';
    input.id = id;
    input.onchange = () => marginChange(id, idx);
    box.appendChild(input);
}




createMarginRow('top-cross-row');
createMarginBox('top-cross-row', 'top-margin', 0);
createMarginRow('mid-cross-row');
createMarginBox('mid-cross-row', 'left-margin', 2);
createLinkIcon('mid-cross-row');
createMarginBox('mid-cross-row', 'right-margin', 3);
createMarginRow('bottom-cross-row');
createMarginBox('bottom-cross-row', 'bottom-margin', 1);

let activeButton = null;

function deselectFormat(id) {
    if (id != null) {
        document.getElementById('format-card-' + id).className = 'sizeCard';
    }
}

function selectFormat(id) {
    document.getElementById('format-card-' + id).className = 'sizeCard selected';
}

function createFormatButton(text, format, selected=false) {
    sizeCard = document.createElement('button');
    if (selected) {
        sizeCard.className = 'sizeCard selected';
        activeButton = text;
    }
    else {
        sizeCard.className = 'sizeCard';
    }
    sizeCard.id = 'format-card-' + text;
    document.getElementById('top-format-row').appendChild(sizeCard);

    span = document.createElement('span');
    span.className = 'sizeCardText';
    span.textContent = text;
    span.id = 'format-text-' + text;
    sizeCard.appendChild(span);

    sizeCard.onclick = () => {
        if (currentFormat !== text) {
            deselectFormat(activeButton);
            activeButton = text;
            selectFormat(activeButton);
            setCustomSize(...format);
            updateFormat(format);
        }
    }
}

function onCustomFormatChange() {
    let w = document.getElementById('widthBox');
    let width = Number(w.text);
    let h = document.getElementById('heightBox');
    let height = Number(h.text);

    if (width != currentFormat[0] || height != currentFormat[1]) {
        deselectFormat(activeButton);
        activeButton = null;
        updateFormat([width, height]);
    }
}

function createCustomFormatButtom() {
    sizeCard = document.createElement('div');
    sizeCard.id = 'format-card-custom';
    sizeCard.className = 'customSize';
    document.getElementById('format').appendChild(sizeCard);

    let widthBox = document.createElement('div');
    widthBox.className = 'sizeBox';
    sizeCard.appendChild(widthBox);

    let width = document.createElement('input');
    width.type = 'number';
    width.value = formats.a3[0];
    width.id = 'widthBox';
    width.className = 'sizeArea';
    widthBox.appendChild(width);

    let p = document.createElement('p');
    p.textContent = 'x';
    sizeCard.appendChild(p);

    let heightBox = document.createElement('div');
    heightBox.className = 'sizeBox';
    sizeCard.appendChild(heightBox);

    let height = document.createElement('input');
    height.type = 'number';
    height.value = formats.a3[1];
    height.id = 'heightBox';
    height.className = 'sizeArea';
    heightBox.appendChild(height);

    let p2 = document.createElement('p');
    p2.textContent = 'mm';
    sizeCard.appendChild(p2);
}


function setCustomSize(width, height) {
    document.getElementById('widthBox').text = width;
    document.getElementById('heightBox').text = height;
}

function setDefaultFormat() {
    deselectFormat('A4')
    deselectFormat('A5')
    deselectFormat('A3')

    if (currentFormat[0] == formats.a4[0] && currentFormat[1] == formats.a4[1]) {
        selectFormat('A4');
    }
    else if(currentFormat[0] == formats.a3[0] && currentFormat[1] == formats.a3[1]) {
        selectFormat('A3');
    }
    else if (currentFormat[0] == formats.a5[0] && currentFormat[1] == formats.a5[1]) {
        selectFormat('A5');
    }
    setCustomSize(...currentFormat);
}

topRow = document.createElement('div');
topRow.className = 'topRow';
topRow.id = 'top-format-row';
document.getElementById('format').appendChild(topRow);

createFormatButton('A3', currentFormat, true);
createFormatButton('A4', formats.a4);
createFormatButton('A5', formats.a5);
createCustomFormatButtom();

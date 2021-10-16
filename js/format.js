let activeButton = null;

function deselectFormat(id) {
    if (id != null) {
        let className = 'sizeCard';
        if (id === 'custom')
        {
            className = 'customSize';
        }        
        document.getElementById('format-card-' + id).className = className;
    }
}

function selectFormat(id) {
    let className = 'sizeCard selected';
    if (id === 'custom')
    {
        className = 'customSize selected';
    }
    document.getElementById('format-card-' + id).className = className;
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
            updateFormat(format);
        }
    }
}

function createCustomFormatButtom() {
    sizeCard = document.createElement('button');
    sizeCard.id = 'format-card-custom';
    sizeCard.className = 'customSize';
    document.getElementById('format').appendChild(sizeCard);

    span = document.createElement('span');
    span.className = 'sizeCardText';
    span.textContent = 'Custom';
    span.id = 'format-text-custom';
    sizeCard.appendChild(span);


    sizeCard.onclick = () => {
        if (currentFormat !== 'custom') {
            deselectFormat(activeButton);
            activeButton = 'custom';
            selectFormat(activeButton);
            updateDrawing();
        }
    }
}

topRow = document.createElement('div');
topRow.className = 'topRow';
topRow.id = 'top-format-row';
document.getElementById('format').appendChild(topRow);

createFormatButton('A3', currentFormat, true);
createFormatButton('A4', formats.a4);
createFormatButton('A5', formats.a5);
createCustomFormatButtom();

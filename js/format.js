let activeButton = null;

function deselectFormat(id) {
    if (activeButton != null) {
        document.getElementById('format-card-' + id).className = 'sizeCard';
    }
}

function selectFormat(id) {
    document.getElementById('format-card-' + id).className = 'sizeCard selected';
}

function createFormatButton(text, format, selected=false) {
    sizeCard = document.createElement('div');
    if (selected) {
        sizeCard.className = 'sizeCard selected';
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
            currentFormat = format;
            deselectFormat(activeButton);
            activeButton = text;
            selectFormat(activeButton);
            updateDrawing();
        }
    }
}

createFormatButton('A3', currentFormat, true);
createFormatButton('A4', currentFormat);
createFormatButton('A5', currentFormat);

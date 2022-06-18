let activeButton = null;

function deselectFormat(id) {
    if (id != null) {
        let className = 'sizeCard';     
        document.getElementById('format-card-' + id).className = className;
    }
}

function selectFormat(id) {
    let className = 'sizeCard selected';
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
            updateFormat([...format]);
            setFormatFields();
        }
    }
}


function createCustomSizeBox(idx) {
    let box = document.createElement('div');
    box.className = 'sizebox';
    document.getElementById('format-card-custom').appendChild(box);

    let input = document.createElement('input');
    input.className = 'sizeboxText';
    input.value = currentFormat[idx];
    input.type = 'text';
    input.id = 'custom-size-input-' + String(idx);
    input.onchange = () => {
        currentFormat[idx] = Number(document.getElementById(input.id).value);
        updateFormat(currentFormat);
        setDefaultFormat()
    };
    box.appendChild(input);
}
function createCustomFormatFields() {
    sizeCard = document.createElement('div');
    sizeCard.id = 'format-card-custom';
    sizeCard.className = 'customSize';
    document.getElementById('format').appendChild(sizeCard);

    createCustomSizeBox(0);

    width = document.createElement('p');
    width.textContent = 'mm';
    width.className = 'p formatText';
    sizeCard.appendChild(width);

    divider = document.createElement('p');
    divider.textContent = 'X';
    divider.className = 'p formatDivider';
    sizeCard.appendChild(divider);

    createCustomSizeBox(1);

    height = document.createElement('p');
    height.textContent = 'mm';
    height.className = 'p formatText';
    sizeCard.appendChild(height);
}

function setFormatFields() {
    document.getElementById('custom-size-input-0').value = currentFormat[0];
    document.getElementById('custom-size-input-1').value = currentFormat[1];
}

function setDefaultFormat() {
    deselectFormat('A4')
    deselectFormat('A5')
    deselectFormat('A3')

    if (currentFormat[0] === formats.a4[0] && currentFormat[1] === formats.a4[1]) {
        selectFormat('A4');
        console.log('A4')
    }
    else if(currentFormat[0] === formats.a3[0] && currentFormat[1] === formats.a3[1]) {
        selectFormat('A3');
        console.log('A3')
    }
    else if (currentFormat[0] === formats.a5[0] && currentFormat[1] === formats.a5[1]) {
        selectFormat('A5');
        console.log('A5')
    }

    setFormatFields();
}

topRow = document.createElement('div');
topRow.className = 'topRow';
topRow.id = 'top-format-row';
document.getElementById('format').appendChild(topRow);

createFormatButton('A3', formats.a3, true);
createFormatButton('A4', formats.a4);
createFormatButton('A5', formats.a5);
createCustomFormatFields();

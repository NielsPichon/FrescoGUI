function createTextBox(parentId) {
    let div = document.createElement("div");
    div.className = 'optionPercent'
    document.getElementById(parentId).appendChild(div);

    let p = document.createElement('p');
    p.textContent = 'Title';
    div.appendChild(p);

    let box = document.createElement('div');
    box.className = 'textBox';
    div.appendChild(box);

    let input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.id = 'textBox';
    input.className = 'textArea';
    input.onchange = () => {
        updateText(input.value)
    };

    box.appendChild(input);
}

function setTextDefaults() {
    document.getElementById('fontsize').value = titleSize;
    document.getElementById('textpos').value = titleBottomMargin;
    document.getElementById('textBox').value = currentText;
}

createTextBox('text-settings');
createPercentBox('text-settings', 'Font size', 'titleSize', 'fontsize', 1, 100, updateText);
createPercentBox('text-settings', 'Vertical Position (mm)', 'titleBottomMargin', 'textpos', 5, 420, updateText);

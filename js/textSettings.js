function createTextBox(parentId) {
    let div = document.createElement("div");
    div.className = 'optionPercent'
    document.getElementById(parentId).appendChild(div);

    let p = document.createElement('p');
    p.textContent = 'Title';
    div.appendChild(p);

    let box = document.createElement('div');
    box.className = 'percentBox';
    div.appendChild(box);

    let input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.onchange = () => {
        updateText(input.value)
    };

    box.appendChild(input);
}

createTextBox('text-settings');
createPercentBox('text-settings', 'Font size', 'titleSize', 1, 100, updateText);
createPercentBox('text-settings', 'Vertical Position (mm)', 'titleBottomMargin', 5, 420, updateText);

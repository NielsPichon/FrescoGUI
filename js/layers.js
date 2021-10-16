const defaultLayerColors = [
    '#3a86ff',
    '#ffbe0b',
    '#fb5607',
    '#ff006e',
    '#8338ec',
]

const darkGray = '#9FB3C5';
const lightGray = '#F7FAFD';

let globalColor = '#2B8EFC';

let layerColors = [];

function createEyecon(parent, idx, callback) {
    let div = document.createElement('div');
    div.className = 'eyecon';
    div.id = 'eyecon-' + idx;
    parent.appendChild(div);

    let i = document.createElement('i');
    i.className = 'fas fa-eye';
    i.id = 'icon-' + idx;
    i.onclick = () => {
        if (i.className == 'fas fa-eye') {
            callback(false);
        }
        else {
            callback(true);
        }
    }
    div.appendChild(i);
}

function toggleVisibility(visible, idx, update=true) {
    let layerIdx = selectedLayers.indexOf(idx)
    if (visible && layerIdx < 0) {
        document.getElementById('layer-name-' + idx).className = '';
        document.getElementById('layer-color-' + idx).style.backgroundColor = layerColors[idx];
        document.getElementById('icon-' + idx).className = 'fas fa-eye';
        document.getElementById('eyecon-' + idx).className = 'eyecon';
        selectedLayers.push(idx);
        if (update) {
            toggleAllEyecon(true);
        }
    }
    else if (layerIdx >= 0) {
        document.getElementById('layer-name-' + idx).className = 'disabled';
        document.getElementById('layer-color-' + idx).style.backgroundColor = '#9FB3C5';
        document.getElementById('icon-' + idx).className = 'fas fa-eye-slash';
        document.getElementById('eyecon-' + idx).className = 'eyecon-disabled';
        selectedLayers.splice(layerIdx, 1);
    }

    if (update) {
        updateDrawing();
    }
}

function toggleAllEyecon(visible) {
    if (visible) {
        document.getElementById('icon-all').className = 'fas fa-eye';
        document.getElementById('eyecon-all').className = 'eyecon';
    }
    else {
        document.getElementById('icon-all').className = 'fas fa-eye-slash';
        document.getElementById('eyecon-all').className = 'eyecon-disabled';
    }
}


function toggleAllLayers(visible) {
    toggleAllEyecon(visible)
    let layers = [...Array(currentLastLayer + 1).keys()];
    layers.forEach(l => {
        toggleVisibility(visible, l, false)
    });
    updateDrawing();
}

function createColorPickerObject(parent, id, clr, storeColor) {
    let colorPicker = document.createElement('button');
    colorPicker.className = 'colorPicker';
    colorPicker.id = id;
    colorPicker.style.backgroundColor = clr;
    if (storeColor) {
        layerColors.push(clr);
    }
    colorPicker.onclick = () => {console.log('color picker of layer ' + idx + ' clicked')}
    parent.appendChild(colorPicker);
}

function createLayer(parentId, idx) {
    li = document.createElement('li');
    li.className = 'layer';
    li.id = 'layer-' + idx;
    document.getElementById(parentId).appendChild(li);

    let left = document.createElement('div');
    left.className = 'layerLeft';
    li.appendChild(left);

    createColorPickerObject(left, 'layer-color-' + idx, defaultLayerColors[idx % defaultLayerColors.length], true);

    let p = document.createElement('p');
    p.id = 'layer-name-' + idx;
    p.textContent = 'Layer ' + idx;
    left.appendChild(p);

    let callback = (visible => toggleVisibility(visible, idx));
    createEyecon(li, idx, callback);

    setLayerColor(idx, layerColors[idx], false);
}

function createApplyAll(parentId) {
    let div = document.createElement('div');
    div.className = 'applyAll';
    document.getElementById(parentId).appendChild(div);

    let clrDiv = document.createElement('div');
    clrDiv.className = 'colorDiv';
    div.appendChild(clrDiv);

    let input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'tickbox';
    input.id = 'colorCheckbox';
    clrDiv.appendChild(input);

    
    
    input.onclick = () => {
        if (input.checked) {
            createColorPickerObject(clrDiv, 'global-picker', globalColor, false);
            clrPicker = document.getElementById('global-picker');
            clrDiv.insertBefore(clrPicker, clrPicker.previousElementSibling);
        }
        else {
            document.getElementById('global-picker').remove();
        }
    }

    let label = document.createElement('label');
    label.htmlFor = 'colorCheckbox';
    label.textContent = 'Apply color to all layers';
    clrDiv.appendChild(label);

    createEyecon(div, 'all', toggleAllLayers);
}

function createLayerList() {
    for (let i = 0; i < currentLastLayer + 1; i++) {
        createLayer('layers-list', i);
    }
}


function addLayers() {
    createApplyAll('layer-settings');
    let ul = document.createElement('ul');
    ul.className = 'layersList';
    ul.id = 'layers-list';
    document.getElementById('layer-settings').appendChild(ul);
    createLayerList();
    updateDrawing();
}



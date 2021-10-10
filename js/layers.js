const defaultLayerColors = [
    '#3a86ff',
    '#ffbe0b',
    '#fb5607',
    '#ff006e',
    '#8338ec',
]

const darkGray = '#9FB3C5';
const lightGray = '#F7FAFD';

let globalColor = '#2B8EFC'

let layerColors = [];

function createEyecon(parent, callback) {
    let div = document.createElement('div');
    div.className = 'eyecon';
    parent.appendChild(div);

    let i = document.createElement('i');
    i.className = 'fas fa-eye';
    i.onclick = () => {
        if (i.className == 'fas fa-eye') {
            i.className = 'fas fa-eye-slash';
            div.className = 'eyecon-disabled';
            callback(false);
        }
        else {
            i.className = 'fas fa-eye';
            div.className = 'eyecon';
            callback(true);
        }
    }
    div.appendChild(i);
}

function toggleVisibility(visible, idx, update = true) {
    let layerIdx = selectedLayers.indexOf(idx)
    if (visible && layerIdx < 0) {
        document.getElementById('layer-name-' + idx).className = '';
        document.getElementById('layer-color-' + idx).style.backgroundColor = layerColors[idx];
        selectedLayers.push(idx);
    }
    else if (layerIdx >= 0) {
        document.getElementById('layer-name-' + idx).className = 'disabled';
        document.getElementById('layer-color-' + idx).style.backgroundColor = '#9FB3C5';
        selectedLayers.splice(layerIdx, 1);
    }

    if (update) {
        updateDrawing();
    }
}

function toggleAllLayers(visible) {
    let layers = [...Array(currentLastLayer + 1).keys()];
    layers.forEach(l => {
        toggleVisibility(visible, l, false)
    });
    updateDrawing();
}

function createColorPicker(parent, id, color, storeColor) {
    let colorPicker = document.createElement('button');
    colorPicker.className = 'colorPicker';
    colorPicker.id = id;
    colorPicker.style.backgroundColor = color;
    if (storeColor) {
        layerColors.push(color);
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

    createColorPicker(left, 'layer-color-' + idx, defaultLayerColors[idx % defaultLayerColors.length], true);

    let p = document.createElement('p');
    p.id = 'layer-name-' + idx;
    p.textContent = 'Layer ' + idx;
    left.appendChild(p);

    let callback = (visible => toggleVisibility(visible, idx));
    createEyecon(li, callback);
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

    
    createColorPicker(clrDiv, 'global-picker', globalColor, false);
    document.getElementById('global-picker').style.visibility = 'hidden';
    
    input.onclick = () => {
        if (input.checked) {
            document.getElementById('global-picker').style.visibility = 'visible';
        }
        else {
            document.getElementById('global-picker').style.visibility = 'hidden';
        }
    }

    let label = document.createElement('label');
    label.for = 'colorCheckbox';
    label.textContent = 'Apply color to all layers';
    clrDiv.appendChild(label);

    createEyecon(div, toggleAllLayers);
}

function createLayerList() {
    for (let i = 0; i < currentLastLayer; i++) {
        createLayer('layers-list', i);
    }
}


createApplyAll('layer-settings');

let ul = document.createElement('ul');
ul.className = 'layersList';
ul.id = 'layers-list';
document.getElementById('layer-settings').appendChild(ul);
createLayerList()

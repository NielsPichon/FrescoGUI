function addOption(value, text, select) {
    let option = document.createElement('option');
    option.value = value;
    option.text = text;
    select.appendChild(option);
}

function createDropDown() {
    let div = document.createElement("div");
    div.className = 'optionPercent'
    document.getElementById('advanced-options').appendChild(div);
    
    let p = document.createElement('p');
    p.textContent = 'Model';
    div.appendChild(p);
    
    let select = document.createElement('select');
    select.id = 'select';
    select.onchange = () => {
        axidraw_options.model = select.value;
        console.log(axidraw_options.model);
    };
    div.appendChild(select);

    let models = {
        1: 'AxiDraw V2/V3',
        2: 'AxiDraw V3/A3 or SE/A3',
        3: 'AxiDraw V3 XLX',
        4: 'AxiDraw Minikit',
    }

    for (let k in models) {
        addOption(k, models[k], select);
    }
    
    select.value = axidraw_options.model;
}

function setAxidrawModelDropdown() {
    document.getElementById('select').value = axidraw_options.model;
}

createDropDown();

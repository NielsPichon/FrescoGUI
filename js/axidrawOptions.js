function createPercentBox (parentId, text, defaultValue, id, increment=5, maxValue=100, extraCallbackFunc=null) {
    let div = document.createElement("div");
    div.className = 'optionPercent'
    document.getElementById(parentId).appendChild(div);

    let p = document.createElement('p');
    p.textContent = text;
    div.appendChild(p);

    let box = document.createElement('div');
    box.className = 'percentBox';
    div.appendChild(box);

    let callback = (v => {
        let nuVal = Math.min(maxValue, Math.max(0, v));
        eval(defaultValue + '=' + nuVal);
        input.value = nuVal;
        if (extraCallbackFunc != null) {
            extraCallbackFunc();
        }
    });

    let plusCallback = () => {
        callback(parseInt(input.value) + increment);
    }

    let minusCallback = () => {
        callback(parseInt(input.value) - increment);
    }

    let minus = document.createElement('i');
    minus.className = "fas fa-minus sign";
    minus.onclick = minusCallback;
    box.appendChild(minus);

    let input = document.createElement('input');
    input.id = id;
    input.type = 'text';
    eval('input.value = ' + defaultValue);
    input.onchange = () => {
        callback(parseInt(input.value));
    }
    box.appendChild(input)

    let plus = document.createElement('i');
    plus.className = "fas fa-plus sign";
    plus.onclick = plusCallback;
    box.appendChild(plus);
}

function setParametersDefault() {
    document.getElementById('pendown').value = axidraw_options.speed_pendown
    document.getElementById('penup').value = axidraw_options.speed_penup
    document.getElementById('accel').value = axidraw_options.accel
    document.getElementById('posup').value = axidraw_options.pen_pos_up
    document.getElementById('posdown').value = axidraw_options.pen_pos_down
}

createPercentBox('axidraw-settings', 'Writing/Drawing speed (%)', 'axidraw_options.speed_pendown', 'pendown');
createPercentBox('axidraw-settings', 'In air speed (%)', 'axidraw_options.speed_penup', 'penup');
createPercentBox('axidraw-settings', 'Acceleration (%)', 'axidraw_options.accel', 'accel');
createPercentBox('axidraw-settings', 'Pen height when UP (%)', 'axidraw_options.pen_pos_up', 'posup');
createPercentBox('axidraw-settings', 'Pen height when DOWN (%)', 'axidraw_options.pen_pos_down', 'posdown');

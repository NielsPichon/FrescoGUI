function createPercentBox (parentId, text, defaultValue) {
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
        let nuVal = Math.min(100, Math.max(0, v));
        console.log(v, nuVal);
        eval(defaultValue + '=' + nuVal);
        input.value = nuVal;
    });

    let plusCallback = () => {
        callback(parseInt(input.value) + 5);
        console.log(axidraw_options.speed_penup)
    }

    let minusCallback = () => {
        callback(parseInt(input.value) - 5);
        console.log(axidraw_options.speed_penup)
    }

    let minus = document.createElement('i');
    minus.className = "fas fa-minus sign";
    minus.onclick = minusCallback;
    box.appendChild(minus);

    let input = document.createElement('input');
    input.type = 'text';
    eval('input.value = ' + defaultValue);
    box.appendChild(input)

    let plus = document.createElement('i');
    plus.className = "fas fa-plus sign";
    plus.onclick = plusCallback;
    box.appendChild(plus);
}

createPercentBox('axidraw-settings', 'Writing/Drawing speed (%)', 'axidraw_options.speed_pendown');
createPercentBox('axidraw-settings', 'In air speed (%)', 'axidraw_options.speed_penup');
createPercentBox('axidraw-settings', 'Acceleration (%)', 'axidraw_options.accel')
createPercentBox('axidraw-settings', 'Pen height when UP (%)', 'axidraw_options.pen_pos_up');
createPercentBox('axidraw-settings', 'Pen height when DOWN (%)', 'axidraw_options.pen_pos_down');

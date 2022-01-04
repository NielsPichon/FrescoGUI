// very loosely inspired by https://codepen.io/interactive/pen/iaEbK

let mouseOverColorPicker = false;
let pickerdownRainbow = false;
let pickerdownBoard = false;
let pickerh = 0;
let pickers = 0;
let pickerv = 0;

function destroyColorPicker() {
    let picker = document.getElementById('color-picker-pannel');
    if (picker) {
        document.body.removeChild(picker);
        mouseOverColorPicker = false;
    }
}

function hsv2rgb(h, s, v) {
    let r, g, b;
    let i;
    let f, p, q, t;
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
    s /= 100;
    v /= 100;
    if(s == 0) {
        r = g = b = v;
        return {r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255)};
    }
    h /= 60;
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
    switch(i) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break; 
        case 2: r = p; g = v; b = t; break; 
        case 3: r = p; g = q; b = v; break; 
        case 4: r = t; g = p; b = v; break; 
        default: r = v; g = p; b = q;
        }
    return {r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255)};
}

function rgb2hex(rgb) {
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return '#' + hex(rgb.r) + hex(rgb.g) + hex(rgb.b);
}

function hex2hsv(hex) {
    hex = hex.substring(1); // remove leading #
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    let max = Math.max.apply(Math, [r,g,b]);
    let min = Math.min.apply(Math, [r,g,b]);
    let chr = max - min;
    hue = 0;
    val = max;
    sat = 0;
    if (val > 0) {
        sat = chr / val;
        if (sat > 0) {
            if (r == max) {
                hue = 60*(((g-min)-(b-min))/chr);
                if (hue < 0) {hue += 360;}
            } else if (g == max) { 
                hue = 120+60*(((b-min)-(r-min))/chr); 
            } else if (b == max) { 
                hue = 250+60*(((r-min)-(g-min))/chr); 
            }
        } 
    }
    return {h: hue, s: Math.round(sat*100), v: Math.round(val*100)}
}

function hue2css(h) {
    let rgb = hsv2rgb(h, 100, 100);
    let rgbStr = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
    return 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1)),'
        + 'linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0)),'
        + 'linear-gradient(to right, ' + rgbStr + ', ' + rgbStr + ')';
}

function createNewColorPicker(posX, posY, layerRGBColor, colorUpdateCallback) {
    // make sure no other color picker exists
    destroyColorPicker();

    let layerHexColor = rgb2hex(layerRGBColor);
    let hsv = hex2hsv(layerHexColor);
    pickerh = hsv.h;
    pickers = hsv.s;
    pickerv = hsv.v;


    mouseOverColorPicker = true;
    let div = document.createElement('div');
    div.id = 'color-picker-pannel';
    div.className = 'color-picker-pannel';
    div.style.left = (posX + 8).toString() + 'px';
    div.style.top = (posY + 8).toString() + 'px';
    div.onmouseover = () => mouseOverColorPicker = true;
    div.onmouseout = () => mouseOverColorPicker = false;
    document.body.appendChild(div);

    // add color name
    let colorName = document.createElement('h2');
    colorName.textContent = layerHexColor;
    div.appendChild(colorName);

    // create the color board
    let colorBoard = document.createElement('div');
    colorBoard.className = 'colorboard';
    colorBoard.style.background = hue2css(pickerh);
    div.appendChild(colorBoard);

    // create the picker circle
    let pickerCircle = document.createElement('div');
    pickerCircle.className = 'picker-circle';
    pickerCircle.style.left = (pickers * colorBoard.offsetWidth / 100 + colorBoard.offsetLeft).toString() + 'px';
    pickerCircle.style.top = ((100 - pickerv) * colorBoard.offsetHeight / 100 + colorBoard.offsetTop).toString() + 'px';
    div.appendChild(pickerCircle);

    // create the rainbow hue strip
    let rainbow = document.createElement('div');
    rainbow.className = 'rainbow';
    div.appendChild(rainbow);

    // create the hue handle
    let hueHandle = document.createElement('div');
    hueHandle.className = 'hue-handle';
    hueHandle.style.left = (pickerh * rainbow.offsetWidth / 360 + rainbow.offsetLeft).toString() + 'px';
    hueHandle.style.top = (rainbow.offsetTop - 2).toString() + 'px';
    div.appendChild(hueHandle);

    function update() {
        let rgb = hsv2rgb(pickerh, pickers, pickerv);
        let hex = rgb2hex(rgb);

        colorName.textContent = hex;

        colorUpdateCallback(hex);
    }

    function updateColorBoard(event) {
        let relTop = event.offsetY;
        let relLeft = event.offsetX;
        pickers = 100 *  relLeft / colorBoard.offsetWidth;
        pickerv = 100 - 100 * (relTop / colorBoard.offsetHeight);
        
        pickerCircle.style.left = (event.pageX - div.offsetLeft).toString() + 'px';
        pickerCircle.style.top = (event.pageY - div.offsetTop).toString() + 'px';

        update();
    }

    function updateRainbow(event) {
        pickerh = 360 * event.offsetX / rainbow.offsetWidth;
        colorBoard.style.background = hue2css(pickerh);
        
        hueHandle.style.left = (event.pageX - div.offsetLeft).toString() + 'px';
        update();
    }

    rainbow.onmousedown = (event) => {
        updateRainbow(event);
        pickerdownRainbow = true;
    };
    rainbow.onmousemove = (event) => {
        if (pickerdownRainbow) {
            updateRainbow(event);
        }
    };
    rainbow.onmouseup = () => pickerdownRainbow = false;
    hueHandle.onmouseup = () => pickerdownRainbow = false;
    hueHandle.onmousedown = () => pickerdownRainbow = true;

    colorBoard.onmousedown = (event) => {
        updateColorBoard(event);
        pickerdownBoard = true;
    };
    colorBoard.onmousemove = (event) => {
        if (pickerdownBoard) {
            updateColorBoard(event);
        }
    };
    colorBoard.onmouseup = () => pickerdownBoard = false;
    pickerCircle.onmouseup = () => pickerdownBoard = false;
    pickerCircle.onmousedown = () => pickerdownBoard = true;
}

document.body.onclick = () => {
    if (!mouseOverColorPicker) {
        destroyColorPicker();
    }
}

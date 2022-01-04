function createSlider() {
    let container = document.getElementById('slider-container');

    let div = document.createElement('div');
    div.className = 'rangeFigRow';

    let rangeFig1 = document.createElement('p');
    rangeFig1.textContent = '2';
    let rangeFig2 = document.createElement('p');
    rangeFig2.textContent = '30';
    
    let number = document.createElement('p');
    number.textContent = currentSplineResolution;
    number.className = 'slider-number-hidden';
    
    div.appendChild(rangeFig1);
    div.appendChild(number)
    div.appendChild(rangeFig2);
    container.appendChild(div);

    let slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 2;
    slider.max = 30;
    slider.value = currentSplineResolution;
    slider.className = 'slider';
    slider.id = 'spline';
    slider.name = 'slide';
    slider.step = 1;
    slider.onchange = () => {
        updateResolution(document.getElementById('spline').value);
    }
    slider.oninput = () => {
        number.textContent = slider.value;
    }
    container.appendChild(slider);

    container.onmouseover = () => number.className = 'slider-number';
    container.onmouseout = () => number.className = 'slider-number-hidden';
}

createSlider();

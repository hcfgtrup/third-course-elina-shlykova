let value = 0;

const valueElement = document.getElementById('value');
const statusElement = document.getElementById('status');

function render() {
    valueElement.textContent = value;

    if (value > 0) {
        statusElement.textContent = 'Число положительное';
        statusElement.style.color = 'green';
    } else if (value < 0) {
        statusElement.textContent = 'Число отрицательное';
        statusElement.style.color = 'red';
    } else {
        statusElement.textContent = 'Число равно нулю';
        statusElement.style.color = '#555';
    }
}

document.getElementById('increase').addEventListener('click', () => {
    value += 1;
    render();
});

document.getElementById('decrease').addEventListener('click', () => {
    value -= 1;
    render();
});

document.getElementById('reset').addEventListener('click', () => {
    value = 0;
    render();
});

render();
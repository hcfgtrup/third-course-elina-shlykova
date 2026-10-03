const values = [];

const input = document.getElementById('numberInput');
const addBtn = document.getElementById('addBtn');
const removeLastBtn = document.getElementById('removeLastBtn');
const clearBtn = document.getElementById('clearBtn');
const numberList = document.getElementById('numberList');

function getStatistics(arr) {
    if (arr.length === 0) {
        return { count: 0, sum: 0, average: 0, min: null, max: null };
    }

    const count = arr.length;
    const sum = arr.reduce((acc, val) => acc + val, 0);
    const average = sum / count;
    const min = Math.min(...arr);
    const max = Math.max(...arr);

    return { count, sum, average, min, max };
}

function render() {
    numberList.innerHTML = '';

    values.forEach(value => {
        const li = document.createElement('li');
        li.textContent = value;
        numberList.appendChild(li);
    });

    const stats = getStatistics(values);
    document.getElementById('count').textContent = stats.count;
    document.getElementById('sum').textContent = stats.sum;
    document.getElementById('average').textContent = stats.count > 0 ? stats.average.toFixed(2) : '0';
    document.getElementById('min').textContent = stats.min !== null ? stats.min : '—';
    document.getElementById('max').textContent = stats.max !== null ? stats.max : '—';
}

function addValue(value) {
    values.push(value);
    render();
}

function removeLastValue() {
    values.pop();
    render();
}

function clearValues() {
    values.length = 0;
    render();
}

addBtn.addEventListener('click', () => {
    const value = Number(input.value);
    
    if (!Number.isFinite(value)) {
        alert('Пожалуйста, введите корректное число!');
        return;
    }
    
    addValue(value);
    input.value = '';
    input.focus();
});

removeLastBtn.addEventListener('click', removeLastValue);
clearBtn.addEventListener('click', clearValues);

render();
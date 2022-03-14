const FORM = document.querySelector('form');
const ADD_BTN = document.querySelector('#add-btn')
const SUBMIT_BTN = document.querySelector('#submit-btn')

FORM.addEventListener('submit', submit);

async function submit(e) {
    e.preventDefault();

    const inputs = document.querySelectorAll('form>div>input');
    const ids = Object.values(inputs).map(a => a.value);

    if (!ids.length) {
        return alert('Seznam je prázdný. Vyplňte nejméně jednu píseň.')
    }

    const body = { ids };

    const check = await fetch('/api/songs/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    })

    if (check.status !== 200) {
        const checkResult = await check.json();
        return alert(`Nepodařilo se načíst písně: ${checkResult}`);
    }

    document.location.href = `./presentation?ids=${ids.join(',')}`;
}

ADD_BTN.addEventListener('click', () => {
    FORM.insertBefore(getNewInput(), ADD_BTN);
})

function getNewInput() {
    const id = Date.now();
    const container = document.createElement('div');
    container.id = `id${id}`;
    const input = document.createElement('input');
    input.type = 'number';
    input.onwheel = () => false;
    input.required = true;
    const removeBtn = document.createElement('div');
    removeBtn.innerText = '-';
    removeBtn.id = 'remove-btn';
    removeBtn.classList.add('btn');
    removeBtn.addEventListener('click', () => {
        const el = document.querySelector(`#id${id}`);
        el.remove();
    })

    //compose elements
    container.appendChild(input);
    container.appendChild(removeBtn);
    return container;
}

// init first input
FORM.insertBefore(getNewInput(), ADD_BTN);
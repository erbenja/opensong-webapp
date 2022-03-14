const songs = [];
let slides = [];
let currentIndex = 0;
const LYRICS = document.querySelector('#lyrics');
const NUMBER = document.querySelector('#number');
const MOVE_LEFT = document.querySelector('#move-left');
const MOVE_RIGHT = document.querySelector('#move-right');
const EMPTY_SLIDE = {lyrics: '', number: ''}


async function getData() {
    const url = new URL(location);
    let params = new URLSearchParams(url.search);
    let ids = params.get('ids') // 'chrome-instant'
    ids = ids.split(',');

    const body = { ids }

    const check = await fetch('/api/songs/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    })

    if (check.status !== 200) {
        const checkResult = await check.json();
        return alert(`Data not loaded for ids: ${checkResult}`);
    }

    for (let i = 0; i < ids.length; i += 1) {
        const res = await fetch(`/api/songs/${ids[i]}`);
        if (res.status !== 200) {
            alert(`Issue loading ${ids[i]}`);
            continue;
        }
        const song = await res.json();
        songs.push(song);
    }

    return;

}

function formatSlides(songs) {
    const slides = [EMPTY_SLIDE];
    songs.forEach(song => {
        song.presentation.forEach(key => {
            slides.push({ lyrics: song.lyrics[key], number: song.number })
        })
        slides.push(EMPTY_SLIDE);
    })

    slides[slides.length - 1] = { lyrics: '', number: 'konec prezentace' };

    // slides[slides.length - 1].number = 'konec prezentace'

    // replacing double newline on some slides
    return slides.map(slide => { return {...slide, lyrics: slide.lyrics.replaceAll(/\r\n \r\n/g, '\r\n').replaceAll(/^\r\n/g, '')} });
}

function keyPress(e) {
    const { code } = e;
    if (code === 'ArrowRight' || code === 'PageDown') {
        changeIndex(1);
    }
    if (code === 'ArrowLeft' || code === 'PageUp') {
        changeIndex(-1);
    }
}

function changeIndex(steps) {
    console.log('clicked')
    currentIndex += steps;
    currentIndex = Math.max(0, Math.min(currentIndex, slides.length - 1));
    updateSlide(slides[currentIndex]);
}

function updateSlide(slide) {
    LYRICS.innerText = slide.lyrics;
    NUMBER.innerText = slide.number;
    resizeText({ elements: [LYRICS] })
}

getData()
    .then(res => {
        console.log(songs);
        slides = formatSlides(songs);
        console.log(slides);
        window.addEventListener('keydown', keyPress);
        MOVE_LEFT.addEventListener('click', () => { return changeIndex(-1) });
        MOVE_RIGHT.addEventListener('click', () => { return changeIndex(1) });
        updateSlide(slides[currentIndex]);

    })
    .catch(err => console.log(err));




const isOverflown = ({ scrollWidth, clientWidth, scrollHeight, clientHeight }) => scrollWidth > clientWidth || scrollHeight > clientHeight;
// const isOverflown = ({ scrollHeight, clientHeight }) => scrollHeight > clientHeight;
// const isOverflown = ({ scrollWidth, clientWidth }) => scrollWidth > clientWidth;

const resizeText = ({ element, elements, minSize = 10, maxSize = 512, step = 1, unit = 'px' }) => {
    (elements || [element]).forEach(el => {
    let i = minSize
    let overflow = false

        const parent = el.parentNode

    while (!overflow && i < maxSize) {
        el.style.fontSize = `${i}${unit}`
        overflow = isOverflown(parent)

        if (!overflow) i += step
    }

    // revert to last state where no overflow happened
    el.style.fontSize = `${i - step}${unit}`
    })
}

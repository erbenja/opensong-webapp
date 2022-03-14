const songs = [];
let slides = [];
let currentIndex = 0;
const LYRICS = document.querySelector('#lyrics');
const NUMBER = document.querySelector('#number');
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

    return slides;
}

function keyPress(e) {
    if (e.code === 'ArrowRight') {
        currentIndex += 1;
    }
    if (e.code === 'ArrowLeft') {
        currentIndex -= 1;
    }

    currentIndex = Math.max(0, Math.min(currentIndex, slides.length - 1));

    changeSlide(slides[currentIndex]);
}

function changeSlide(slide) {
    LYRICS.innerText = slide.lyrics;
    NUMBER.innerText = slide.number;
}

getData()
    .then(res => {
        console.log(songs);
        slides = formatSlides(songs);
        window.addEventListener('keydown', keyPress);
        changeSlide(slides[currentIndex]);

    })
    .catch(err => console.log(err));

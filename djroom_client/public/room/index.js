let player = undefined;
let playerIsReady = false;
let previousVideoId = undefined;

window.onload = () => playNewVideo(true)

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        playerVars: {'autoplay': 1, 'controls': 1},
        height: '360',
        width: '640',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

async function onPlayerReady(event) {
    playerIsReady = true;
    console.log('ready');
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNewVideo(false);
    }
}

function addNewVideo() {
    let videoInput = document.getElementById('inp');
    let videoLink = videoInput.value;
    let {id, service} = getVideoId(videoLink);
    if (id && service === 'youtube') {
        let requestBody = {videoId: id};
        let request = fetch('/room/video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(requestBody)
        });

        request
            .then(response => response.json())
            .then(result => console.log(result))
            .then(() => alert('Video was added'))
            .then(() => clearInput(videoInput));
    } else {
        alert('Invalid link: ' + videoLink);
    }
}

function clearInput(input) {
    input.value = '';
}

function playNewVideo(firstCall) {
    waitForPlayerIsReady()
        .then(() => getVideoToPlay())
        .then(videoToPlayFirst => {
            previousVideoId = videoToPlayFirst.id;
            if (firstCall) {
                player.mute();
                player.loadVideoById(videoToPlayFirst.id, videoToPlayFirst.startSeconds);
            } else {
                player.loadVideoById(videoToPlayFirst.id);
            }
        });
}

async function waitForPlayerIsReady() {
    while (!playerIsReady) {
        await sleep(200);
    }
}

async function getVideoToPlay() {
    let videoInfo
    while (true) {
        videoInfo = await fetch('/room/video').then(response => response.json());
        if (videoInfo.id !== null && previousVideoId !== videoInfo.id) {
            return videoInfo;
        }
        await sleep(2000);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'update-popup') {
        createPlayer(chrome.extension.getBackgroundPage().videoUrl);
    }
});

createPlayer(chrome.extension.getBackgroundPage().videoUrl);

document.getElementById('goButton').addEventListener('click', (event) => {
    var url = document.getElementById('youtubeUrl').value;
    createPlayer(url);
});

function createPlayer(videoUrl) {
    if (!videoUrl || !isYoutubeLink(videoUrl)) return;    

    var isList = isYoutubeList(videoUrl);
    if (isList) {
        // createListIFrame(videoUrl);
        createVideoIFrame(videoUrl);
    } else {
        createVideoIFrame(videoUrl);
    }
}

function createVideoIFrame(videoUrl) {
    var videoId = getMatch(/v=(.*?)($|&)/gm, videoUrl);
    var autoplay = true;
    
    if (videoId) {
        var iframeUrl = `https://www.youtube.com/embed/${videoId}?&autoplay=${autoplay ? 1 : 0}&rel=0`;
        createIFrame(iframeUrl);
    }
}

function createListIFrame(videoUrl) {    
    var listId = getMatch(/list=(.*?)($|&)/gm, videoUrl);
    var videoIndex = getMatch(/index=(.*?)($|&)/gm, videoUrl);

    videoIndex = getPreviousOrFirst(videoIndex);

    var autoplay = true;

    if (listId) {
        var iframeUrl = `https://www.youtube.com/embed/videoseries?list=${listId}&autoplay=${autoplay ? 1 : 0}&rel=0&index=${videoIndex}`;
        createIFrame(iframeUrl);
    }
}

function createIFrame(iframeUrl) {
    var iframe = document.createElement('iframe');

    iframe.setAttribute('src', iframeUrl);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay; encrypted-media');

    var playerWrapper = document.getElementById('player');
    removeAllChilds(playerWrapper);
    playerWrapper.appendChild(iframe);
}

function getMatch(pattern, searchString) {
    var matches = pattern.exec(searchString);
    if (!matches) return '';
    return matches.length > 1 ? matches[1] : '';
}

// tgbNymZ7vqY

function removeAllChilds(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function getPreviousOrFirst(videoIndex) {
    var tempIndex = 0;
    if (videoIndex) {
        tempIndex = parseInt(videoIndex) - 1;
        tempIndex = tempIndex >= 0 ? tempIndex : 0;
    }
    return tempIndex;
}

function isYoutubeLink(videoUrl) {
    return videoUrl.includes('youtube') && videoUrl.includes('watch');
}

function isYoutubeList(videoUrl) {
    return isYoutubeLink(videoUrl) && videoUrl.includes('list');
}
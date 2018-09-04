var width = 600;
var height = 350;
var windowId;

// чтобы было, для VEVO
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    var foundReferrer = false;
    var fakeReferrer = 'https://www.youtube.com/';

    for (var i = 0, len = details.requestHeaders.length; i < len; i++) {
        if (details.requestHeaders[i].name === 'Referer') {
            details.requestHeaders[i].value = fakeReferrer;
            foundReferrer = true;
            break;
        }
    }

    if (!foundReferrer) {
        details.requestHeaders.push({
            name: 'Referer',
            value: fakeReferrer
        });
    }

    return {
        requestHeaders: details.requestHeaders
    };
},
    {urls: [
        'https://www.youtube.com/embed/*'
    ]},
    ['blocking', 'requestHeaders']
);

chrome.contextMenus.create({
    id: 'playerContextOption',
    title: "Open in player lol", 
    contexts:["link"], 
    onclick: contextMenuClick
});

chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
        openPopup(tabs[0].url);
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url) return;
    
    sendMessage('url-update', tabId);
});

chrome.runtime.onMessage.addListener((request, sender) => {
    if (request.type === 'playerNotification') {
        openPopup(request.options.videoId);
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    sendMessage('tab-focused', activeInfo.tabId);
});

chrome.windows.onRemoved.addListener((id) => {
    if (id === windowId) {
        windowId = undefined;
    }
});

function sendMessage(mesageType, tabId) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.id === tabId && activeTab.url.includes('youtube')) {
            chrome.tabs.sendMessage(activeTab.id, {type: mesageType, options: {
                url: activeTab.url
            }});
        }
    });
}

function getExtensionUrl(url) {
    return chrome.runtime.getURL(url);
}

function openPopup(videoUrl) {
    if (chrome.extension.getBackgroundPage().videoUrl === videoUrl && isWindowExists()) return;

    chrome.extension.getBackgroundPage().videoUrl = videoUrl;
    
    if (isWindowExists()) {
        updatePopup();
    } else {
        createPopup();
    }
}

function isWindowExists() {
    return !!windowId;
}

function createPopup() {
    chrome.windows.create({
        width: width,
        height: height,
        left: screen.availWidth - width,
        top: screen.height - height,
        url: getExtensionUrl('player.html'),
        type: 'popup'
    }, (windowInfo) => {
        windowId = windowInfo.id;
    });
}

function updatePopup() {
    chrome.runtime.sendMessage({type: 'update-popup', options: {}});
    chrome.windows.update(windowId, {
        focused: true
    });
}

function contextMenuClick(options) {
    var url = options.linkUrl;
    if (isYoutubeLink(url)) {
        openPopup(url);
    }
}

function isYoutubeLink(videoUrl) {
    return videoUrl.includes('youtube') && videoUrl.includes('watch');
}
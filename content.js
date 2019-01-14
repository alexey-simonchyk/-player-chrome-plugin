var buttonId = 'playerButtonId';
var menuContainerId = 'menu-container';
var buttonWasCreated = false;
var buttonStyles = "width: 30px; height: 30px; margin-top: 8px; cursor: pointer;";
var buttonImageLink = "https://i.imgur.com/S0nS6dw.png"
addYoutubeButton();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'url-update' || message.type === 'tab-focused') {
        addYoutubeButton();
    }
});

function addYoutubeButton() {
    var url = window.location.href;

    if (!isWatchUrl(url)) return;

    var $menuContainer = $(`#${menuContainerId}`);
    
    if (!$menuContainer.length) {
        repeatButtonCreation();
        return;
    }

    var $button = $(`#${buttonId}`);

    if (!$button.length) {
        $menuContainer.before($(`<img id="${buttonId}" src="${buttonImageLink}" style="${buttonStyles}"/>`));
        repeatButtonCreation();
    } else {
        initButton($button);        
    }
}

function initButton($button) {
    if (buttonWasCreated) return;

    buttonWasCreated = true;

    $button.on('click', () => {
        chrome.runtime.sendMessage({type: 'playerNotification', options: {
            videoId: window.location.href
        }});
    });
}

function repeatButtonCreation() {
    setTimeout(addYoutubeButton, 500);
}

function isWatchUrl(url) {
    return url && url.includes('watch');
}
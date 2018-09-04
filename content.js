var buttonId = 'playerButtonId';
var menuContainerId = 'menu-container';
var buttonWasCreated = false;
addYoutubeButton();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'url-update' || message.type === 'tab-focused') {
        addYoutubeButton();
    }
});

function addYoutubeButton() {
    var url = window.location.href;

    if (!isWatchUrl(url)) return;

    $(document).ready(() => {
        var $menuContainer = $(`#${menuContainerId}`);
        
        if (!$menuContainer.length) {
            repeatButtonCreation();
            return;
        }

        var $button = $(`#${buttonId}`);

        if (!$button.length) {
            $menuContainer.before($(`<div id="${buttonId}">Here</div>`));
            repeatButtonCreation();
        } else {
            initButton($button);        
        }
    });
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

// because youtube is spa application, and blocks can apper after document is ready
function repeatButtonCreation() {
    setTimeout(addYoutubeButton, 500);
}

function isWatchUrl(url) {
    return url && url.includes('watch');
}
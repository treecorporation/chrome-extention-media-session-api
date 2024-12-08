// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updatePlaybackState") {
        chrome.storage.local.set({ playbackState: request.state }, () => {
            console.log("Playback State Updated:", request.state);
            sendResponse({ status: "success" });
        });
    } else if (request.action === "executeAction") {
        // Handle media actions from storage
        const action = request.actionType;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const tab = tabs[0];
                const tabUrl = tab.url;
        
                // chrome:// 또는 chrome-extension:// 페이지에서는 실행하지 않음
                if (!tabUrl || tabUrl.startsWith("chrome://") || tabUrl.startsWith("chrome-extension://")) {
                    console.warn("Invalid context. Skipping script execution for:", tabUrl);
                    return;
                }
        
                // 유효한 URL에서만 스크립트 실행
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: (action) => {
                        const media = document.querySelector("video, audio");
                        if (!media) return;
        
                        switch (action) {
                            case "play":
                                media.play();
                                break;
                            case "pause":
                                media.pause();
                                break;
                            case "volumeUp":
                                media.volume = Math.min(1, media.volume + 0.1);
                                break;
                            case "volumeDown":
                                media.volume = Math.max(0, media.volume - 0.1);
                                break;
                            case "seekForward":
                                media.currentTime += 10;
                                break;
                            case "seekBackward":
                                media.currentTime -= 10;
                                break;
                            default:
                                console.log("Unknown action:", action);
                        }
                    },
                    args: [action],
                }).catch((err) => console.error("Failed to execute script:", err));
            } else {
                console.error("No active tabs found.");
            }
        });
        

        sendResponse({ status: "action executed" });
    } else {
        sendResponse({ status: "unknown action" });
    }

    return true; // Keeps the message channel open for async responses
});

// Listen for action button clicks to open the now-playing page
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("now-playing.html"),
    });
});
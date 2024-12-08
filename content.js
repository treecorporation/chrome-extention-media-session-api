// content.js


let previousMetadata = null;

function checkMediaSession() {
  const media = document.querySelector("video, audio");

  if ("mediaSession" in navigator) {
    const metadata = navigator.mediaSession.metadata;
    if (metadata) {
      const currentMetadata = {
        title: metadata.title || "Unknown Title",
        artist: metadata.artist || "Unknown Artist",
        album: metadata.album || "Unknown Album",
      };

      if (JSON.stringify(currentMetadata) !== JSON.stringify(previousMetadata)) {
        previousMetadata = currentMetadata;

        chrome.storage.local.set({ nowPlaying: currentMetadata }, () => {
          if (chrome.runtime.lastError) {
            console.error("Error updating nowPlaying:", chrome.runtime.lastError);
          } else {
            console.log("Now Playing Updated:", currentMetadata);
          }
        });
      }
    }
  }

  if (media) {
    const isPlaying = !media.paused && !media.ended && media.currentTime > 0;
    const state = isPlaying ? "playing" : "paused";

    chrome.storage.local.set({ playbackState: state }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error updating playbackState:", chrome.runtime.lastError);
      } else {
        console.log("Playback state updated:", state);
      }
    });

    chrome.runtime.sendMessage({ action: "updatePlaybackState", state: state }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
      } else if (response && response.status === "success") {
        console.log("Message sent successfully");
      }
    });
  }
}

setInterval(checkMediaSession, 1000);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const media = document.querySelector("video, audio");
  if (!media) {
    sendResponse({ status: "error", message: "No media found" });
    return true;
  }

  try {
    switch (request.action) {
      case "play":
        media.play().then(() => sendResponse({ status: "success" })).catch(error => sendResponse({ status: "error", message: error.toString() }));
        break;
      case "pause":
        media.pause();
        sendResponse({ status: "success" });
        break;
      case "volumeUp":
        media.volume = Math.min(1, media.volume + 0.1);
        sendResponse({ status: "success" });
        break;
      case "volumeDown":
        media.volume = Math.max(0, media.volume - 0.1);
        sendResponse({ status: "success" });
        break;
      case "seekForward":
        media.currentTime += 10;
        sendResponse({ status: "success" });
        break;
      case "seekBackward":
        media.currentTime -= 10;
        sendResponse({ status: "success" });
        break;
      default:
        console.log("Unknown action:", request.action);
        sendResponse({ status: "error", message: "Unknown action" });
    }
  } catch (error) {
    console.error("Error executing action:", error);
    sendResponse({ status: "error", message: error.toString() });
  }

  return true;
});

console.log("Content script loaded");
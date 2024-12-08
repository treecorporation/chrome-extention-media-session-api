document.addEventListener("DOMContentLoaded", () => {
    function updateNowPlaying() {
        chrome.storage.local.get(["nowPlaying", "playbackState"], (data) => {
            const songInfo = data.nowPlaying || { title: "No Song Playing", artist: "Unknown", album: "Unknown" };
            const playbackState = data.playbackState || "paused";

            document.getElementById("title").textContent = songInfo.title;
            document.getElementById("artist").textContent = songInfo.artist;
            document.getElementById("album").textContent = songInfo.album;

            const playButton = document.getElementById("play");
            const pauseButton = document.getElementById("pause");

            if (playbackState === "playing") {
                playButton.disabled = true;
                pauseButton.disabled = false;
            } else {
                playButton.disabled = false;
                pauseButton.disabled = true;
            }
        });
    }

    // 버튼 클릭 이벤트
    const sendAction = (action) => {
        chrome.storage.local.set({ action }, () => {
            console.log(`Action "${action}" set in storage.`);
        });
    };

    document.getElementById("play").addEventListener("click", () => sendAction("play"));
    document.getElementById("pause").addEventListener("click", () => sendAction("pause"));
    document.getElementById("volume-up").addEventListener("click", () => sendAction("volumeUp"));
    document.getElementById("volume-down").addEventListener("click", () => sendAction("volumeDown"));
    document.getElementById("seek-forward").addEventListener("click", () => sendAction("seekForward"));
    document.getElementById("seek-backward").addEventListener("click", () => sendAction("seekBackward"));

    // 주기적으로 UI 업데이트
    setInterval(updateNowPlaying, 1000);
});

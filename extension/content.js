console.log("De-Clickbait: Extension Loaded");

const API_URL = "http://localhost:8000/fix_title";
let currentVideoID = null;

function getVideoID() {
    const params = new URLSearchParams(window.location.search);
    return params.get("v");
}

async function fixTitle() {
    const videoID = getVideoID();

    if (!videoID || videoID === currentVideoID) return;

    console.log("De-Clickbait: New Video Detected", videoID);
    currentVideoID = videoID;

    const titleElement = await waitForElement("ytd-watch-metadata h1 yt-formatted-string");

    if (!titleElement) {
        console.log("❌ Could not find title element");
        return;
    }

    const originalTitle = titleElement.innerText;
    titleElement.innerText = "Analying content...";
    titleElement.style.opacity = "0.5";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ video_id: videoID })
        });

        const data = await response.json();

        if (data.new_title) {
            console.log("✅ Title Fixed:", data.new_title);
            titleElement.innerText = data.new_title;
            titleElement.style.opacity = "1";
            titleElement.title = `Original: ${originalTitle}`;
            titleElement.style.borderBottom = "2px solid #4CAF50";
        } else {
            console.log("⚠️ No replacement title found.");
            titleElement.innerText = originalTitle;
            titleElement.style.opacity = "1";
        }

    } catch (err) {
        console.error("🔥 API Error:", err);
        titleElement.innerText = originalTitle;
        titleElement.style.opacity = "1";
    }
}

function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => {
            currentVideoID = null;
            fixTitle();
        }, 1000);
    }
}).observe(document, { subtree: true, childList: true });

fixTitle();
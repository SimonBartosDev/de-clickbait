console.log("De-Clickbait: Extension Loaded");

// CONFIG
const API_URL = "http://localhost:8000/fix_title";
let currentVideoID = null;

// 1. Helper to get Video ID from URL
function getVideoID() {
    const params = new URLSearchParams(window.location.search);
    return params.get("v");
}

// 2. Main Logic
async function fixTitle() {
    const videoID = getVideoID();

    // Stop if we aren't on a video page or if we already fixed this video
    if (!videoID || videoID === currentVideoID) return;

    console.log("De-Clickbait: New Video Detected", videoID);
    currentVideoID = videoID; // Mark as processing

    // Wait for the title element to exist (YouTube loads it dynamically)
    const titleElement = await waitForElement("ytd-watch-metadata h1 yt-formatted-string");

    if (!titleElement) {
        console.log("❌ Could not find title element");
        return;
    }

    // Visual Feedback to user
    const originalTitle = titleElement.innerText;
    titleElement.innerText = "Analying content...";
    titleElement.style.opacity = "0.5";

    try {
        // Call Backend
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
            titleElement.title = `Original: ${originalTitle}`; // Tooltip
            titleElement.style.borderBottom = "2px solid #4CAF50"; // Green underline to show it worked
        } else {
            // If error (no transcript), revert
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

// 3. Utility: Wait for an element to appear in the DOM
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

// 4. Initialize & Watch for Navigation
// YouTube is a Single Page App, so we watch for URL changes
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        // URL changed, wait a tiny bit for the new page structure to settle, then run
        setTimeout(() => {
            currentVideoID = null; // Reset tracker
            fixTitle();
        }, 1000);
    }
}).observe(document, { subtree: true, childList: true });

// Run once on initial load
fixTitle();
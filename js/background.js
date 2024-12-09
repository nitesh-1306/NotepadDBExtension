import { GistManager } from './gist_manager.js';

chrome.runtime.onMessage.addListener((message, sendResponse) => {
    console.log("Message received.");
    if (message.action === "uploadGist") {
        console.log("For gist uploading");
        const { token, description, files, isPublic } = message.payload;

        try {
            const gistManager = new GistManager(token);
            gistManager
                .uploadGist(description, files, isPublic)
                .then((response) => {
                    sendResponse({ success: true, data: response });
                })
                .catch((error) => {
                    console.error("Gist Upload Error:", error.message);
                    sendResponse({ success: false, error: error.message });
                });
        } catch (error) {
            console.error("Initialization Error:", error.message);
            sendResponse({ success: false, error: error.message });
        }

        return true;
    }
});

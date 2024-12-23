import { GistManager } from './gist_manager.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "uploadGist") {
        const { token, description, files, isPublic } = message.payload;

        const handleGistUpload = async () => {
            try {
                const gistManager = new GistManager(token);
                const response = await gistManager.uploadGist(description, files, isPublic);
                sendResponse({ success: true, data: response });
            } catch (error) {
                console.error("Gist Upload Error:", error.message);
                sendResponse({ success: false, error: error.message });
            }
        };
        handleGistUpload();

        return true;
    }

    if (message.action === "updateGist") {
        const { pageid, token, description, files, isPublic } = message.payload;

        const handleGistUpdate = async () => {
            try {
                const gistManager = new GistManager(token);
                const response = await gistManager.updateGist(pageid, description, files, isPublic);
                sendResponse({ success: true, data: response });
            } catch (error) {
                console.error("Gist Update Error:", error.message);
                sendResponse({ success: false, error: error.message });
            }
        };
        handleGistUpdate();

        return true;
    }
});

class GistManager {
    constructor(token) {
        if (!token) throw new Error("GitHub token is required.");
        this.token = token;
        this.apiUrl = "https://api.github.com/gists";
    }

    async apiRequest(endpoint, method = "GET", body = null) {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
        };

        const response = await fetch(`${this.apiUrl}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "API request failed");
        }

        return response.json();
    }

    async uploadGist(description, files, isPublic = true) {
        if (!description || !files || Object.keys(files).length === 0) {
            throw new Error("Description and at least one file are required.");
        }

        const data = {
            description,
            public: isPublic,
            files,
        };

        return await this.apiRequest("", "POST", data);
    }

    async downloadGist(gistId) {
        if (!gistId) throw new Error("Gist ID is required.");
        return await this.apiRequest(`/${gistId}`, "GET");
    }
}


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

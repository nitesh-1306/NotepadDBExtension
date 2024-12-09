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

function disableScroll() {
    let scrollTop = window.scrollY || document.documentElement.scrollTop;
    let scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    window.onscroll = function () {
        window.scrollTo(scrollLeft, scrollTop);
    };
}
disableScroll();

function decipher(encrypted_content, key) {
    if (key < 1 || key > 100) {
        throw new Error('Key must be between 1 and 100');
    }

    let result = '';
    for (let i = 0; i < encrypted_content.length; i++) {
        let char = encrypted_content[i];
        if (char.match(/[a-zA-Z]/)) {
            let code = encrypted_content.charCodeAt(i);
            let base = (char >= 'a' && char <= 'z') ? 97 : 65;
            char = String.fromCharCode(((code - base - key + 26) % 26) + base);
        }
        result += char;
    }
    return result;
}

document.addEventListener("DOMContentLoaded", function () {
    const textarea = document.getElementById("textarea");


    let token = "";
    const enc_token = localStorage.getItem("gtoken");
    if (enc_token) {
        const key = parseInt(localStorage.getItem("ekey"));
        const savedToken = decipher(enc_token, key);
        token = savedToken;
    }
    const gistManager = new GistManager(token);

    chrome.storage.local.get(["savedText"], function (result) {
        if (result.savedText) {
            textarea.value = result.savedText;
        }
    });

    let saveTimeout;
    let filename = "test.txt"
    let files = null;

    
    textarea.addEventListener("input", function () {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            files = {
                [filename]: {
                    "content": textarea.value
                }
            };
            chrome.storage.local.set({ savedText: textarea.value }, async function () {
                console.log("Text saved!");
                const response = await gistManager.uploadGist("Test Description from extension", files, false);
                console.log(response);
            });
        }, 500);
    });
});

export class GistManager {
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

    async uploadGist(description, files, isPublic = false) {
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

    async updateGist(gistId, description, files, isPublic = false) {
        if (!gistId) throw new Error("Gist ID is required.");
        if (!description || !files || Object.keys(files).length === 0) {
            throw new Error("Description and at least one file are required.");
        }

        const data = {
            description,
            public: isPublic,
            files,
        };

        return await this.apiRequest(`/${gistId}`, "PATCH", data);
    }

    async downloadGist(gistId) {
        if (!gistId) throw new Error("Gist ID is required.");
        return await this.apiRequest(`/${gistId}`, "GET");
    }
}
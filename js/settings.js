function cipher(content, key) {
    return transform(content, key);
}

function decipher(content, key) {
    return transform(content, -key);
}

function transform(content, shift) {
    return content.split('').map(char => {
        if (/[a-zA-Z]/.test(char)) {
            const base = char >= 'a' ? 97 : 65;
            const code = ((char.charCodeAt(0) - base + shift + 26) % 26) + base;
            return String.fromCharCode(code);
        }
        return char;
    }).join('');
}

document.getElementById("tokenForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const token = document.getElementById("token").value;
    const encrkey = parseInt(document.getElementById("encrkey").value);
    let encrypted_token = cipher(token, encrkey);
    localStorage.setItem("gtoken", encrypted_token);
    localStorage.setItem("ekey", encrkey);
    document.getElementById("message").textContent = "Encrypted Token saved successfully!";

    const files = {
        "Page1.txt": {
            content: "This is a placeholder text.",
        },
    };

    const message = {
        action: "uploadGist",
        payload: {
            token,
            description: "Page no. 1",
            files,
            isPublic: false,
        }
    }
    chrome.runtime.sendMessage(
        message,
        (response) => {
            if (response && response.success) {
                console.log("Gist URL:", response.data);
                localStorage.setItem("page1_id", response.data.id);
            }
        }
    );
});


const enc_token = localStorage.getItem("gtoken");
if (enc_token) {
    const key = parseInt(localStorage.getItem("ekey"));
    const savedToken = decipher(enc_token, key);
    document.getElementById("token").value = savedToken;
    document.getElementById("encrkey").value = key;
}

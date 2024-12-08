
function cipher(content, key) {
    if (key < 1 || key > 100) {
        throw new Error('Key must be between 1 and 100');
    }

    let result = '';
    for (let i = 0; i < content.length; i++) {
        let char = content[i];
        if (char.match(/[a-zA-Z]/)) {
            let code = content.charCodeAt(i);
            let base = (char >= 'a' && char <= 'z') ? 97 : 65;
            char = String.fromCharCode(((code - base + key) % 26) + base);
        }
        result += char;
    }
    return result;
}

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

document.getElementById("tokenForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const token = document.getElementById("token").value;
    const encrkey = parseInt(document.getElementById("encrkey").value);
    let encrypted_token = cipher(token, encrkey);
    localStorage.setItem("gtoken", encrypted_token);
    localStorage.setItem("ekey", encrkey);
    document.getElementById("message").textContent = "Encrypted Token saved successfully!";
});


const enc_token = localStorage.getItem("gtoken");

if (enc_token) {
    const key = parseInt(localStorage.getItem("ekey"));
    const savedToken = decipher(enc_token, key);
    console.log(key, enc_token, savedToken)
    document.getElementById("token").value = savedToken;
    document.getElementById("encrkey").value = key;
}

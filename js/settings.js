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

document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    const body = document.body;

    if (localStorage.getItem('extdarkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('extdarkMode', 'enabled');
        } else {
            localStorage.removeItem('extdarkMode');
        }
    });
});


const enc_token = localStorage.getItem("gtoken");
if (enc_token) {
    const key = parseInt(localStorage.getItem("ekey"));
    const savedToken = decipher(enc_token, key);
    document.getElementById("token").value = savedToken;
    document.getElementById("encrkey").value = key;
}

const folder1Name = localStorage.getItem('folder1') || 'Folder 1';
const folder2Name = localStorage.getItem('folder2') || 'Folder 2';
const folder3Name = localStorage.getItem('folder3') || 'Folder 3';
const folder4Name = localStorage.getItem('folder4') || 'Folder 4';
document.getElementById('folder1').value = folder1Name;
document.getElementById('folder2').value = folder2Name;
document.getElementById('folder3').value = folder3Name;
document.getElementById('folder4').value = folder4Name;


document.getElementById('folderSave').addEventListener('click', function (e) {
    const message = document.getElementById('foldersMessage');
    message.style.opacity = '0';
    const folder1 = document.getElementById('folder1').value;
    const folder2 = document.getElementById('folder2').value;
    const folder3 = document.getElementById('folder3').value;
    const folder4 = document.getElementById('folder4').value;
    localStorage.setItem('folder1', folder1);
    localStorage.setItem('folder2', folder2);
    localStorage.setItem('folder3', folder3);
    localStorage.setItem('folder4', folder4);
    message.textContent = 'Folder names saved successfully!';
    message.style.opacity = '1';
});


document.querySelector('.toggle-password').addEventListener('click', function () {
    const tokenInput = document.querySelector('#token');
    if (tokenInput.type === 'password') {
        tokenInput.type = 'text';
        this.textContent = '👁️‍🗨️';
    } else {
        tokenInput.type = 'password';
        this.textContent = '👁️';
    }
});

const gistid = localStorage.getItem("page1_id");
if (gistid) {
    document.getElementById("gistview").href = 'https://gist.github.com/' + gistid;
}
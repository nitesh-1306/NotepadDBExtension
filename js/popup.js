

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
                    content: textarea.value,
                },
            };
            const message = {
                action: "uploadGist",
                payload: {
                    token,
                    description: "Test Description from extension",
                    files,
                    isPublic: false,
                },
            }
            chrome.storage.local.set({ savedText: textarea.value }, function () {
                console.log("Text saved locally!");
            });
            chrome.runtime.sendMessage(
                message,
                (response) => {
                    if (response && response.success) {
                        console.log("Gist URL:", response.data.html_url);
                    }
                }
            );
        }, 500);
    });

});

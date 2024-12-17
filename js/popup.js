

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


let originalContent = '';
let isSynced = true;
const syncIcons = {
    unsaved: 'fa-exclamation-circle',     // Warning/unsaved state
    savingicon: 'fa-spinner',             // Loading/saving state
    spinning: 'fa-spin',                  // Saving state depiction
    saved: 'fa-check-circle',             // Successfully saved
    error: 'fa-times-circle',             // Error in saving
    default: 'fa-cloud-upload-alt'        // Default upload icon
};



const textarea = document.getElementById('textarea');
const cloudUploadButton = document.getElementById('cloud-upload');
const cloudIcon = cloudUploadButton.querySelector('i');

chrome.storage.local.get(["savedText"], function (result) {
    if (result.savedText) {
        textarea.value = result.savedText;
    }
});

const isContentSynced = localStorage.getItem('content_saved');
if (isContentSynced == 'true') {
    cloudIcon.classList.add(syncIcons.default);
    cloudIcon.setAttribute('title', 'Upload to Cloud');
    console.log('restored to default');
}
else {
    cloudIcon.classList.add(syncIcons.unsaved, 'text-warning');
    cloudIcon.setAttribute('title', 'Unsaved Changes');
    console.log('restored to unsynced');
}

async function updateSyncStatus() {
    const currentContent = textarea.value;
    cloudIcon.className = 'fas';

    if (currentContent !== originalContent) {
        await chromeStorageSet("savedText", textarea.value);
        console.log("Text saved locally!");
        isSynced = false;
        cloudIcon.classList.add(syncIcons.unsaved, 'text-warning');
        cloudIcon.setAttribute('title', 'Unsaved Changes');
        localStorage.setItem('content_saved', false);
        console.log('Set to false');
    } else {
        isSynced = true;
        cloudIcon.classList.add(syncIcons.default);
        cloudIcon.setAttribute('title', 'Upload to Cloud');
        localStorage.setItem('content_saved', true);
        console.log('Set to true');
    }
}

function uploadToCloud() {
    if (cloudIcon.classList.contains(syncIcons.default)) {
        return;
    }
    cloudIcon.className = 'fas';
    cloudIcon.classList.add(syncIcons.savingicon);
    cloudIcon.classList.add(syncIcons.spinning);
    cloudIcon.setAttribute('title', 'Saving...');

    syncToGist().then((uploadSuccessful) => {
        cloudIcon.className = 'fas';
        if (uploadSuccessful) {
            cloudIcon.classList.add(syncIcons.saved, 'text-success');
            cloudIcon.setAttribute('title', 'Saved Successfully');
            localStorage.setItem('content_saved', true);

            originalContent = textarea.value;
            isSynced = true;
        }
        else {
            cloudIcon.classList.add(syncIcons.error, 'text-danger');
            cloudIcon.setAttribute('title', 'Save Failed');
            localStorage.setItem('content_saved', false);
        }
    });
}

function chromeStorageSet(key, value) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => resolve());
    });
}

function sendRuntimeMessage(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => resolve(response));
    });
}

function getToken(){
    let token = "";
    const enc_token = localStorage.getItem("gtoken");
    if (enc_token) {
        const key = parseInt(localStorage.getItem("ekey"));
        token = decipher(enc_token, key);
    }
    return token;
}

async function syncToGist() {
    const filename = "Page1.txt"
    const token = getToken();
    const pageid = localStorage.getItem("page1_id");
    const files = {
        [filename]: {
            content: textarea.value,
        },
    };

    const message = {
        action: "updateGist",
        payload: {
            pageid,
            token,
            description: "Test Description from extension",
            files,
            isPublic: false,
        },
    };

    try {

        const response = await sendRuntimeMessage(message);
        if (response && response.success) {
            console.log("Gist URL:", response.data.html_url);
            return true;
        } else {
            console.error("Failed to update Gist");
            return false;
        }
    } catch (error) {
        console.error("Error in syncToGist:", error);
        return false;
    }
}


textarea.addEventListener('input', updateSyncStatus);
cloudUploadButton.addEventListener('click', uploadToCloud);

originalContent = textarea.value;

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

const state = {
    currentFolder: '1',
    folders: {
        '1': [],
        '2': [],
        '3': [],
        '4': []
    }
};

function loadState() {
    const savedState = localStorage.getItem('stickyNotesState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        Object.assign(state, parsedState);
    }
}

function saveState() {
    localStorage.setItem('stickyNotesState', JSON.stringify(state));
}

function renderNotes() {
    const container = document.querySelector('.notes-container');
    container.innerHTML = '';

    state.folders[state.currentFolder].forEach(note => {
        const noteElement = createNoteElement(note);
        container.appendChild(noteElement);
    });
}

function createNoteElement(note) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note';
    noteDiv.innerHTML = `
    <div class="note-header">
        <span class="note-label" contenteditable="true" data-id="${note.id}">${note.label || 'New Note'}</span>
        <button class="delete-btn" data-id="${note.id}"><i class="fas fa-trash-alt"></i></button>
    </div>
    <div contenteditable="true" class="note-content" data-id="${note.id}">${note.content.replaceAll("\n", "<br>")}</div>
    `;


    const textarea = noteDiv.querySelector('.note-content');
    const label = noteDiv.querySelector('.note-label');
    const deleteBtn = noteDiv.querySelector('.delete-btn');

    textarea.addEventListener('input', (e) => {
        const noteId = parseInt(e.target.dataset.id);
        const noteIndex = state.folders[state.currentFolder].findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
            state.folders[state.currentFolder][noteIndex].content = e.target.innerText;
            saveState();
            contentChanged();
        }
    });

    label.addEventListener('input', (e) => {
        const noteId = parseInt(e.target.dataset.id);
        const noteIndex = state.folders[state.currentFolder].findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
            state.folders[state.currentFolder][noteIndex].label = e.target.innerText;
            saveState();
            contentChanged();
        }
    });

    deleteBtn.addEventListener('click', (e) => {
        const button = e.target.closest('.delete-btn');
        deleteNote(button.dataset.id);
        contentChanged();
    });

    return noteDiv;
}

function deleteNote(noteId) {
    const noteIdNum = parseInt(noteId);
    state.folders[state.currentFolder] = state.folders[state.currentFolder].filter(n => n.id !== noteIdNum);
    saveState();
    renderNotes();
}

function switchFolder(folderId) {
    state.currentFolder = folderId;
    renderNotes();

    document.querySelectorAll('.folder-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.folder === folderId) {
            btn.classList.add('active');
        }
    });
}

function addNewNote() {
    const newNote = {
        id: Date.now(),
        content: '',
        label: 'New Note'
    };
    state.folders[state.currentFolder].push(newNote);
    saveState();
    renderNotes();
}

function init() {
    loadState();
    renderNotes();

    document.querySelectorAll('.folder-btn[data-folder]').forEach(btn => {
        btn.addEventListener('click', () => switchFolder(btn.dataset.folder));
    });

    document.querySelector('.add-note').addEventListener('click', addNewNote);

    document.getElementById("settingsButton").addEventListener("click", () => {
        chrome.runtime.openOptionsPage(() => {
            if (chrome.runtime.lastError) {
                console.error(`Error: ${chrome.runtime.lastError}`);
            }
        });
    });

    const openCalcBtn = document.getElementById('openCalcBtn');
    const calculator = document.getElementById('calculator');
    const overlay = document.getElementById('overlay');

    openCalcBtn.addEventListener('click', () => {
        calculator.classList.add('active');
        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
    });

    overlay.addEventListener('click', () => {
        calculator.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });

    const syncButton = document.getElementById('syncButton');
    let syncInProgress = false;
    syncButton.addEventListener('click', (event) => {
        if (syncInProgress) {
            return;
        };
        syncButton.innerHTML = '<i class="fas fa-sync" title="Sync Notes to Cloud"></i>';
        syncInProgress = true;
        const syncicon = syncButton.querySelector('i');
        syncicon.classList.add('fa-spin');

        syncToGist().then((uploadSuccessful) => {
            syncInProgress = false;
            if (!uploadSuccessful) {
                syncButton.innerHTML = '<i class="fas fa-times-circle" title="Sync Notes to Cloud"></i>';
            }
            else {
                syncButton.innerHTML = '<i class="fas fa-check-circle" title="Sync Notes to Cloud"></i>';
            }

            chrome.alarms.create('resetSyncButton', { delayInMinutes: 0.03 });

            chrome.alarms.onAlarm.addListener((alarm) => {
                if (alarm.name === 'resetSyncButton') {
                    syncButton.innerHTML = '<i class="fas fa-sync" title="Sync Notes to Cloud"></i>';
                }
            });
        });
    });

    const folder1Name = localStorage.getItem('folder1') || 'Folder 1';
    const folder2Name = localStorage.getItem('folder2') || 'Folder 2';
    const folder3Name = localStorage.getItem('folder3') || 'Folder 3';
    const folder4Name = localStorage.getItem('folder4') || 'Folder 4';
    document.getElementById('folder1').innerText = folder1Name.toUpperCase();
    document.getElementById('folder2').innerText = folder2Name.toUpperCase();
    document.getElementById('folder3').innerText = folder3Name.toUpperCase();
    document.getElementById('folder4').innerText = folder4Name.toUpperCase();
}

function getToken() {
    let token = "";
    const enc_token = localStorage.getItem("gtoken");
    if (enc_token) {
        const key = parseInt(localStorage.getItem("ekey"));
        token = decipher(enc_token, key);
    }
    return token;
}

function sendRuntimeMessage(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => resolve(response));
    });
}

function generateSHA256Hash(string) {
    const hash = CryptoJS.SHA256(string);
    return hash.toString(CryptoJS.enc.Hex);
}

async function syncToGist() {
    const files = {
        "Notes.json": {
            content: JSON.stringify(state),
        },
    };
    let hash = generateSHA256Hash(JSON.stringify(files));
    const token = getToken();
    const pageid = localStorage.getItem("page1_id");
    let payload = {
        token,
        description: hash,
        files,
        isPublic: false
    };

    try {
        if (!pageid) {
            const response = await sendRuntimeMessage({
                action: "uploadGist",
                payload
            });

            if (response?.success) {
                localStorage.setItem('page1_id', response.data.id);
                return true;
            }
            return false;
        }

        const remoteContent = await fetchGist(pageid, token);

        if (remoteContent.description === hash) {
            return true;
        }

        const response = await sendRuntimeMessage({
            action: "updateGist",
            payload: { ...payload, pageid }
        });
        return response?.success || false;
    }
    catch (error) {
        console.error("Error in syncToGist:", error);
        return false;
    }
}

async function fetchGist(gistId, token) {
    const url = `https://api.github.com/gists/${gistId}`;
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `token ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch Gist");
    }

    const gist = await response.json();
    return gist;
}


function contentChanged() {
    const syncButton = document.getElementById('syncButton');
    syncButton.innerHTML = '<i class="fas fa-exclamation-circle" title="Click to sync to cloud"></i>';
}

init();

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
    console.log(state.folders);
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
        }
    });

    label.addEventListener('input', (e) => {
        const noteId = parseInt(e.target.dataset.id);
        const noteIndex = state.folders[state.currentFolder].findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
            state.folders[state.currentFolder][noteIndex].label = e.target.innerText;
            saveState();
        }
    });

    deleteBtn.addEventListener('click', (e) => {
        const button = e.target.closest('.delete-btn');
        deleteNote(button.dataset.id);
    });

    return noteDiv;
}

function deleteNote(noteId) {
    const noteIdNum = parseInt(noteId);
    state.folders[state.currentFolder] = state.folders[state.currentFolder].filter(n => n.id !== noteIdNum);
    console.log(state.folders);
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
}

init();
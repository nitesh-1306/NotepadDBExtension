

function applyFormat(wrapper1, wrapper2) {

    let selection = document.getSelection();
    let selectionContents = selection.toString();
    const note = selection.anchorNode.parentElement;

    const formattedText = wrapper1 + selectionContents + wrapper2;

    const start = selection.anchorOffset;
    const end = start + selectionContents.length;

    note.innerText =
        note.innerText.substring(0, start) +
        formattedText +
        note.innerText.substring(end);
}

const boldButton = document.getElementById('bold');
const italicButton = document.getElementById('italic');
const underlineButton = document.getElementById('underline');
const strikeButton = document.getElementById('strike');
const listButton = document.getElementById('list');
const linkButton = document.getElementById('link');

boldButton.addEventListener('click', (event) => {
    applyFormat('<b>','</b>');
});
italicButton.addEventListener('click', (event) => {
    applyFormat('<i>','</i>');
});
underlineButton.addEventListener('click', (event) => {
    applyFormat('<u>','</u>');
});
strikeButton.addEventListener('click', (event) => {
    applyFormat('<s>','</s>');
});
listButton.addEventListener('click', (event) => {
    applyFormat('-');
});
linkButton.addEventListener('click', (event) => {
    applyFormat('<a href="https://google.com">','</a>');
});
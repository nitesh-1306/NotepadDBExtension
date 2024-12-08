function disableScroll() {
    let scrollTop = window.scrollY || document.documentElement.scrollTop;
    let scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    window.onscroll = function () {
        window.scrollTo(scrollLeft, scrollTop);
    };
}
disableScroll();

document.addEventListener("DOMContentLoaded", function () {
    const textarea = document.getElementById("textarea");

    chrome.storage.local.get(["savedText"], function (result) {
        if (result.savedText) {
            textarea.value = result.savedText;
        }
    });

    let saveTimeout;
    textarea.addEventListener("input", function () {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            chrome.storage.local.set({ savedText: textarea.value }, function () {
                console.log("Text saved!");
            });
        }, 500);
    });
});

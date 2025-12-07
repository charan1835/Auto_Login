// content.js
// Popup killer only runs if popupBlockerEnabled toggle is ON.

function nukeUMSPopup() {
    const dialog = document.querySelector('.ui-dialog');
    if (dialog) dialog.remove();

    const overlay = document.querySelector('.ui-widget-overlay');
    if (overlay) overlay.remove();

    const modal = document.querySelector('#divTesting')?.closest('.ui-dialog');
    if (modal) modal.remove();

    // also hide any inline modal-like element just in case
    const inlineModal = document.querySelector('#divTesting');
    if (inlineModal) inlineModal.style.display = 'none';
}

// Check toggle and start interval if enabled
chrome.storage.local.get(["popupBlockerEnabled"], (res) => {
    if (!res.popupBlockerEnabled) {
        // not enabled; do nothing
        return;
    }
    // Start aggressive interval to remove popup if it spawns
    const interval = setInterval(nukeUMSPopup, 300);

    // Also attempt a one-time cleanup on first run
    nukeUMSPopup();

    // If the page unloads, clear the interval
    window.addEventListener('beforeunload', () => clearInterval(interval));
});

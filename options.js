// options.js
// Helpers for base64 conversion
function abToBase64(ab) {
    const u8 = new Uint8Array(ab);
    let binary = "";
    for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
    return btoa(binary);
}
function base64ToAb(b64) {
    const binary = atob(b64);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
    return u8.buffer;
}

// generate an AES-GCM key and return exported raw key (base64)
async function generateAndStoreKey() {
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const raw = await crypto.subtle.exportKey("raw", key);
    const rawB64 = abToBase64(raw);
    await chrome.storage.local.set({ __encryption_key_raw: rawB64 });
    return rawB64;
}

// import a base64 raw key to CryptoKey
async function importKeyFromStorage(rawB64) {
    const raw = base64ToAb(rawB64);
    return crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
}

// encrypt text with a provided CryptoKey -> returns { iv: base64, data: base64 }
async function encryptText(key, text) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(text));
    return {
        iv: abToBase64(iv.buffer),
        data: abToBase64(ct)
    };
}

// decrypt given {iv, data} with CryptoKey
async function decryptText(key, obj) {
    const dec = new TextDecoder();
    const iv = base64ToAb(obj.iv);
    const ct = base64ToAb(obj.data);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, ct);
    return dec.decode(pt);
}

// UI elements
const userField = document.getElementById("username");
const passField = document.getElementById("password");
const saveBtn = document.getElementById("save");
const clearBtn = document.getElementById("clearCreds");
const toggleAuto = document.getElementById("toggleAutoLogin");
const togglePopup = document.getElementById("togglePopupBlocker");
const toggleEnc = document.getElementById("toggleEncryption");

// Load stored settings
chrome.storage.local.get(["username", "password", "encryptedPassword", "autoLoginEnabled", "popupBlockerEnabled", "encryptionEnabled", "__encryption_key_raw"], async (data) => {
    if (data.username) userField.value = data.username;
    if (data.password && !data.encryptedPassword) passField.value = data.password;

    // If stored encryptedPassword, we won't decrypt here automatically for display.
    // We simply inform user that password is stored encrypted.
    if (data.encryptedPassword) {
        passField.placeholder = "Password stored (encrypted)";
    }

    toggleAuto.checked = !!data.autoLoginEnabled;
    togglePopup.checked = !!data.popupBlockerEnabled;
    toggleEnc.checked = !!data.encryptionEnabled;
});

// Save handler
saveBtn.addEventListener("click", async () => {
    const username = userField.value || "";
    const password = passField.value || "";
    const encryptionEnabled = toggleEnc.checked;

    if (!username) {
        alert("Please enter username.");
        return;
    }
    if (!password && !encryptionEnabled) {
        // If encryption is disabled and no password, warn
        if (!confirm("Password is empty. This will clear stored password. Continue?")) return;
    }

    // store toggle states
    const autoLoginEnabled = toggleAuto.checked;
    const popupBlockerEnabled = togglePopup.checked;

    // If encryption enabled:
    if (encryptionEnabled) {
        // ensure key exists
        let { __encryption_key_raw } = await chrome.storage.local.get("__encryption_key_raw");
        if (!__encryption_key_raw) {
            __encryption_key_raw = await generateAndStoreKey();
        }

        let key;
        try {
            key = await importKeyFromStorage(__encryption_key_raw);
        } catch (e) {
            console.error("Encryption key corrupted, resetting...", e);
            await generateAndStoreKey();
            alert("Encryption key was corrupted and has been reset. Please re-enter your password and Save again.");
            return;
        }

        let encObj;
        // Check if we have an existing encrypted password to preserve
        const { encryptedPassword } = await chrome.storage.local.get("encryptedPassword");

        if (!password && encryptedPassword) {
            // User left field empty but we have a stored password -> keep it
            encObj = encryptedPassword;
        } else {
            // Encrypt what user typed (or empty string if really new)
            encObj = await encryptText(key, password);
        }

        await chrome.storage.local.set({
            username,
            encryptedPassword: encObj,
            autoLoginEnabled,
            popupBlockerEnabled,
            encryptionEnabled: true
            // do NOT keep plaintext 'password' field
        });
        alert("Saved (password encrypted locally).");
    } else {
        // store plaintext password (local storage)
        await chrome.storage.local.set({
            username,
            password,
            autoLoginEnabled,
            popupBlockerEnabled,
            encryptionEnabled: false,
            encryptedPassword: null
        });
        alert("Saved.");
    }
});

// Clear credentials completely
clearBtn.addEventListener("click", async () => {
    if (!confirm("Remove username and password from local storage?")) return;
    await chrome.storage.local.remove(["username", "password", "encryptedPassword", "__encryption_key_raw"]);
    userField.value = "";
    passField.value = "";
    passField.placeholder = "";
    alert("Cleared.");
});

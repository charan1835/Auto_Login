// autologin.js

// Helpers (same base64 helpers as options.js)
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

async function importKeyFromStorage(rawB64) {
  const raw = base64ToAb(rawB64);
  return crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
}

async function decryptText(key, obj) {
  const dec = new TextDecoder();
  const iv = base64ToAb(obj.iv);
  const ct = base64ToAb(obj.data);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, ct);
  return dec.decode(pt);
}

function fireAll(el) {
  ["input", "change", "keyup", "keydown", "keypress", "click"].forEach(
    (evt) => el.dispatchEvent(new Event(evt, { bubbles: true }))
  );
}

chrome.storage.local.get(["autoLoginEnabled", "username", "password", "encryptedPassword", "__encryption_key_raw"], async (data) => {
  if (!data.autoLoginEnabled) return;
  const username = data.username || "";
  let password = "";

  if (data.encryptedPassword) {
    // decrypt
    try {
      const rawB64 = data.__encryption_key_raw;
      if (!rawB64) {
        console.warn("Encryption key missing; cannot decrypt password.");
        return;
      }
      const key = await importKeyFromStorage(rawB64);
      password = await decryptText(key, data.encryptedPassword);
    } catch (e) {
      console.error("Failed to decrypt stored password:", e);
      return;
    }
  } else {
    password = data.password || "";
  }

  // If we have username/password, attempt to autofill
  function tryLogin() {
    console.log("LPU Helper: valid config found. Attempting login...");

    const userField = document.querySelector("input[name='username']");
    const passField = document.querySelector("input[name='password']");
    const termsCheck = document.querySelector("input[type='checkbox']");
    // Some versions have different buttons
    const loginBtn = document.querySelector("#loginbtn") || document.querySelector("input[type='submit'], button[type='submit']");

    if (userField && username) {
      console.log("LPU Helper: filling username");
      userField.value = username;
      fireAll(userField);
    }

    if (passField && password) {
      console.log("LPU Helper: filling password");
      passField.value = password;
      fireAll(passField);
    }

    if (termsCheck) {
      console.log("LPU Helper: checking terms");
      termsCheck.checked = true;
      fireAll(termsCheck);
    }

    if (loginBtn) {
      console.log("LPU Helper: enabling login button");
      loginBtn.disabled = false;
      loginBtn.removeAttribute("disabled");
      loginBtn.style.opacity = "1";
      loginBtn.style.pointerEvents = "auto";
    }

    // Try calling site-specific function
    try {
      if (typeof appendUserName === "function") {
        console.log("LPU Helper: calling appendUserName()");
        appendUserName();
      }
    } catch (e) {
      // ignore
    }

    // click login after a short delay
    setTimeout(() => {
      if (loginBtn) {
        console.log("LPU Helper: clicking login button...");
        loginBtn.click();
      } else {
        console.warn("LPU Helper: Login button not found!");
      }
    }, 500); // Check if 100ms was too fast
  }

  // Logic to determine WHEN to run
  if (document.readyState === "complete" || document.readyState === "interactive") {
    // document already loaded
    tryLogin();
  } else {
    window.addEventListener("load", tryLogin);
  }
});

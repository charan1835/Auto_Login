<h1 align="center">🔥 LPU Helper Suite 🔥</h1>
<p align="center">Auto Login for 24Online WiFi + UMS Popup Killer + Settings Panel</p>
<br>

## 🚀 Overview
LPU Helper Suite is a lightweight Chrome extension that automates two of the most painfully repetitive tasks at LPU:

### ✔ Auto Login to **LPU 24Online WiFi**
- Autofills username & password  
- Ticks Terms & Conditions  
- Auto-clicks login  
- Works every time you connect to WiFi  

### ✔ Auto-remove **UMS Pop-up Notifications**
- Removes the annoying dialog that appears on every page refresh  
- Works across all UMS routes  
- Toggle ON/OFF anytime  

All data stays **100% local** inside your browser. Nothing is uploaded or sent anywhere.

---

## 📦 Features

- 🔐 Local storage for login credentials  
- 🔑 Optional AES-GCM password encryption  
- 🎛️ ON/OFF toggles for Auto Login & Popup Killer  
- 🧹 Aggressive UMS popup removal  
- ⚡ Instant auto-login on 24Online page load  
- 🛠 Simple settings UI (`options.html`)  

---

## 📁 Project Structure


(You can add an `icons/` folder if you want custom extension logos.)

---

## 🛠 Installation (Developer Mode)

1. Download the repo as ZIP  
2. Extract it  
3. Open Chrome → go to  

4. Enable **Developer Mode**  
5. Click **Load Unpacked**  
6. Select the folder `lpu-helper-suite/`  

Done.

---

## ⚙ Setting Up Credentials

1. Go to the extension card → **Details**  
2. Click **Extension Options**  
3. Enter:
- Username  
- Password  
4. (Optional) Turn ON encryption  
5. Toggle features ON/OFF  
6. Save  

Stored forever unless manually cleared.

---

## 🧪 How It Works

### 🔥 Auto Login (24Online)
Runs only on:
https://internet.lpu.in/24online/webpages/
ums.lpu.in


It deletes:
- `.ui-dialog`
- `.ui-widget-overlay`
- special inline modal containers  
- hidden popup roots  

Runs every 300ms to make sure no popup survives.

---


## 🔒 Security Notes

- Credentials are stored **locally** using `chrome.storage.local`
- No data leaves the user's device  
- Optional AES-GCM obfuscates stored passwords  
- Not meant to replace a password manager  
- Pure convenience for students, nothing malicious  

---

## 💡 Future Improvements
- Add beautiful UI for settings  
- Add custom icons  
- Add a browser action popup toggle  
- Publish to Chrome Web Store (optional flex)

---

## 🤝 Credits
Built for convenience, sanity, and peace of mind during LPU student life.  
Made with ❤️ by charan.

---


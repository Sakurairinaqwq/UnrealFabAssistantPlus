# ⚡ UnrealFab Auto-Claim Helper Plus (Professional Edition)

[简体中文](../README.md) | English

## Introduction

**UnrealFabAssistantPlus** is a powerful Tampermonkey userscript designed specifically for [Fab.com](https://www.fab.com/). It helps you **automatically scan** and **claim** free assets, adding them to your library effortlessly.

This version (v1.0.0) introduces a **brand new Modern UI**, **Smart Rating Filters**, and significant stability improvements. It is an enhanced iteration based on the [RyensX/UnrealFabAssistant](https://github.com/RyensX/UnrealFabAssistant) project.

### 🌟 Key Features (v1.0.0 Update)

* **🎨 Modern UI Design**:
* **Glassmorphism**: A sleek, dark, semi-transparent interface that blends perfectly with the Fab website.
* **Pill Mode (Minimized)**: Click the minimize button to shrink the panel into a tiny, unobtrusive "Pill" floating in the corner. Click it again to instantly restore the full view.
* **Expanded View**: A taller log area allows you to see more information at a glance.


* **⭐ Smart Rating Filter**:
* **Quality Control**: You can now set a minimum rating threshold (e.g., 3.5 stars). The script will automatically skip assets rated below this value.
* **New Asset Protection**: Assets with **0 reviews** are *never* skipped by the filter, ensuring you don't miss out on brand-new items that haven't been rated yet.


* **🛡️ Stability & Safety**:
* **Ownership Logic Fix**: Uses a "Claim unless proven owned" logic. If the ownership status is unclear, the script attempts to claim it to prevent missing items.
* **"Soul Questioning" (401 Protection)**: If your login session expires (Cookie invalid), the script immediately pauses and shows an alert ("Logged in? Are you sure?"), preventing infinite retry loops that could flag your account.
* **Auto Language Detection**: Automatically detects your browser language (English/Chinese) without needing a manual selection popup.


* **🚀 Multi-Channel & Dual Modes**: Supports Unreal Engine, Unity, UEFN, and MetaHuman channels. Choose between **Fast Mode** (New items only) or **Full Mode** (Deep scan).

## ⚠️ Disclaimer

Please note that any automated tool carries potential risks. By using this script, you acknowledge and accept any consequences resulting from website policy changes, network rate limiting, etc. The script includes a built-in **HTTP 429 (Rate Limit)** handler, but please **use it reasonably**.

## 📥 Installation

### 1. Prerequisites

You need a userscript manager extension for your browser:

* **[Tampermonkey](https://www.tampermonkey.net/)** (Recommended for Chrome/Edge/Firefox)
* **[Violentmonkey](https://violentmonkey.github.io/)**

### 2. Install Script

1. Open your script manager dashboard.
2. Select "Create a new script" (or "+").
3. Copy the full content of the `tampermonkey.js` file from this repository.
4. Paste it into the editor and Save (Ctrl+S).

## 🎮 How to Use

1. **Login**: Ensure you are logged into [Fab.com](https://www.fab.com/).
2. **Refresh**: Refresh any Fab.com page. The script will initialize automatically.
* *Note: Language is detected automatically. You don't need to select it manually.*


3. **Configure**:
* **🎯 Target Channels**: Check the asset types you want to claim (e.g., Unreal Engine, Unity).
* **⚙️ Quality Filter**:
* Check **"Skip Low Rating"** to enable the filter.
* Set the **"Min Score"** (default 3.5). Assets below this score will be ignored.




4. **Start Operation**:
* Click **🚀 Fast Mode (New Only)**: Recommended for daily use. It stops automatically after encountering a few pages of already owned assets.
* Click **🐢 Full Mode (Check All)**: Good for first-time use. It scans every single page available.


5. **Pill Mode**:
* Blocking your view? Click the **－** button in the top-right corner. The panel becomes a small pill.
* Click the pill to expand it back to full size.


6. **Exit**:
* Click the red **✕** button to completely stop and remove the script UI.



## 📊 Dashboard Status

The dashboard updates in real-time:

| Status | Color | Description |
| --- | --- | --- |
| **Scanned** | ⚪ White | Total assets checked in this session. |
| **Success** | 🟢 Green | Free assets successfully claimed and added to your library. |
| **Failed** | 🔴 Red | Claim failed (Network error, No free license available, etc.). |
| **Owned** | 🟠 Orange | Assets you already own, or assets **skipped due to low rating**. |

## ⚙️ Advanced Configuration (Hardcoded)

If you are a developer or have specific needs, you can modify the default values in the `SCRIPT_SETTINGS` object within the code:

```javascript
const SCRIPT_SETTINGS = {
    isFastMode: true,
    maxEmptyPagesLimit: 3,      // Fast Mode: Stop after N consecutive pages of owned items
    enableRatingFilter: false,  // Default filter state
    minRating: 3.5,             // Default rating threshold
    requestDelay: {
        min: 1200,              // Min delay between claims (ms)
        max: 3000,              // Max delay between claims (ms)
    },
    // ...
};

```

## 🛠️ FAQ

* **Q: The UI isn't showing up?**
* A: This version uses the maximum Z-Index (`2147483647`). It should float above everything. If it's not visible, check your browser console (F12) for errors or try refreshing the page.


* **Q: Why are some assets being skipped?**
* A: Check the logs.
* If it says **"⚠️ Low Rating"** (Orange), the asset score is lower than your setting.
* If it counts towards **"Owned"**, you already have it in your library.




* **Q: I see a "Logged in? Are you sure?" popup.**
* A: This is the **401 Protection**. It means your login session (Cookie) has expired or is invalid. The script pauses to protect your account. Please re-login to Fab.com and refresh the page.



---

<p align="center">Enjoy your free assets with UnrealFabAssistantPlus v3.6.0!</p>
<p align="right">Project Iteration: Sakurairinaqwq</p>
<p align="right">Original Author: RyensX</p>

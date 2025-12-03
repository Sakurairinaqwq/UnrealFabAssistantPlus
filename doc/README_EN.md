# UnrealFabAssistant

[简体中文](../README.md) | English

This is the English version of the README.md file for the provided user script `tampermonkey.js`.

-----

# ⚡ UnrealFab Assistant Plus (UnrealFabAssistantPlus)

## Introduction

**UnrealFabAssistantPlus** is a Tampermonkey user script specifically designed for the [Fab.com](https://www.fab.com/) website. Its primary function is to help users **automatically scan** and **auto-claim** free assets, adding them to the user's library.

This script is an enhanced iteration based on the work of [RyensX/UnrealFabAssistant](https://github.com/RyensX/UnrealFabAssistant), and thanks are extended to the original author.

### Key Features

  * **Multi-Channel Support**: Supports scanning and claiming free assets from multiple official channels, including Unreal Engine, Unity, UEFN, and MetaHuman.
  * **Dual Operating Modes**:
      * **Fast Mode (Check for New)**: Only checks recently updated assets. Stops scanning a category when it encounters a configurable number (default 3 pages) of consecutive pages with only owned assets, saving time.
      * **Full Mode (Check All)**: Scans all historical pages to ensure no free assets are missed.
  * **Intelligent Skipping**: Automatically checks asset ownership status and skips items already in your library.
  * **User-Friendly UI**: Provides a floating Dashboard and real-time Logs for easy tracking of the script's status and results.
  * **Multi-Language Support**: Supports Chinese (`zh-CN`) and English (`en-US`) interfaces.
  * **Rate-Limit Handling**: Built-in mechanism to handle HTTP 429 rate limits, ensuring automatic waiting and retrying during large-scale operations.

## ⚠️ Warning

Please be aware that any form of automated operation carries inherent risks. By using this script, you acknowledge and accept potential consequences resulting from changes in website policy, IP rate limiting, etc. Please use the script **responsibly** and **avoid running it too frequently**.

## 📥 Installation and Usage

### 1\. Preparation

You must have a browser extension that supports user scripts installed, such as:

  * **[Tampermonkey](https://www.tampermonkey.net/)** (Recommended)
  * **[Violentmonkey](https://violentmonkey.github.io/)**

### 2\. Script Installation

1.  Copy the entire content of the `tampermonkey.js` file from this repository.
2.  In your Tampermonkey or Violentmonkey extension, select "Create a new script" or a similar option.
3.  Paste the copied code and save the script.
4.  Ensure the script is enabled.

### 3\. How to Use

1.  **Log in to Fab.com**: Ensure you are successfully logged into the Fab.com website, as this is essential for the script to run.
2.  **Refresh the Page**: After logging in, refresh any Fab.com page.
3.  **Language Selection**: The script will first prompt a language selection dialog. Choose **🇺🇸 English (US)** or **🇨🇳 简体中文**.
4.  **Interface Display**: The script interface will appear in the bottom-right corner of the page.
5.  **Select Channels**: In the overlay, check the asset channels you wish to scan (e.g., Unreal Engine, Unity). You can use the **"Select All / Invert Selection"** button for quick adjustments.
6.  **Choose Mode and Start**:
      * Click **🚀 Fast Mode Start (Check for New)** to begin a quick scan.
      * Click **🐢 Full Mode Start (Check All)** to begin a complete scan.
7.  **View Results**: Once the script starts, the overlay will disappear. You can monitor the progress and claiming results in the Logs area in real-time. The Dashboard will display the count of **Scanned**, **Success**, **Failed**, and **Owned** assets.
8.  **Task Completion**: When all tasks are finished, the logs will prompt you to **manually refresh the page** to rerun the script.

## 📊 Status Dashboard

| Status Name | Description | Color |
| :--- | :--- | :--- |
| **Scanned** | The total number of assets the script has checked. | Default |
| **Success** | The number of free assets successfully claimed and added to your library. | Green |
| **Failed** | The number of assets that failed to be claimed due to various reasons (e.g., claim failure, no free license available). | Red |
| **Skipped** | The number of assets the script detected as already owned and skipped. | Orange |

## ⚙️ Configuration Details (Hardcoded)

The following are the hardcoded default settings within the script. You may modify the corresponding values in the script source if needed:

| Setting | Default Value | Description |
| :--- | :--- | :--- |
| `maxEmptyPagesLimit` | 3 | The number of consecutive pages with only owned assets before the script stops scanning the current category in **Fast Mode**. |
| `requestDelay.min` | 1200 ms | The **minimum** random delay time between attempts to claim an asset. |
| `requestDelay.max` | 3000 ms | The **maximum** random delay time between attempts to claim an asset. |
| `retry.limit` | 3 | The maximum number of retries for failed network requests (excluding 429 errors). |
| `retry.delayMs` | 2000 ms | The wait time between retries. |

## 🛠️ Requirements

  * A modern browser (e.g., Chrome, Firefox, Edge)
  * The Tampermonkey or Violentmonkey browser extension
  * A Fab.com account and a valid logged-in session

-----

\<p align="center"\>Thank you for using the script\!\</p\>
\<p align="right"\>Project Iteration by: Sakurairinaqwq\</p\>
\<p align="right"\>Original Author: RyensX\</p\>
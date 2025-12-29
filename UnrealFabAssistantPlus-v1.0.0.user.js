// ==UserScript==
// @name         UnrealFabAssistantPlus
// @namespace    https://github.com/Sakurairinaqwq/UnrealFabAssistantPlus
// @version      v1.0.0
// @description  Fab.com Free Asset Auto-Claim Helper Plus
// @author       Sakurairinaqwq (It is an iteration based on https://github.com/RyensX/UnrealFabAssistant Thanks to https://github.com/RyensX)
// @match        https://www.fab.com/*
// @grant        none
// @license      GPL-3.0
// @icon         https://www.fab.com/favicon.ico
// ==/UserScript==

(function () {
    'use strict';

    // Startup Logging
    console.log("[UnrealFabAssistantPlus] v3.6.0 Initializing...");

    // ==========================================
    // Localization Configuration
    // ==========================================
    const LANGUAGE_PACKS = {
        'en-US': {
            TITLE: '⚡ UnrealFab Helper',
            MINIMIZE: 'Minimize',
            CLOSE: 'Close',
            SCANNED: 'Scanned',
            SUCCESS: 'Success',
            FAILED: 'Failed',
            SKIPPED: 'Owned',
            SCANNING_CHANNELS: '🎯 Target Channels',
            FILTER_SETTINGS: '⚙️ Quality Filter',
            ENABLE_RATING_FILTER: 'Skip Low Rating',
            MIN_RATING_LABEL: 'Min Score:',
            SELECT_ALL_INVERT: 'Select All / Invert',
            FAST_MODE_START: '🚀 Fast Mode',
            FAST_MODE_DETAIL: 'New Only',
            FULL_MODE_START: '🐢 Full Mode',
            FULL_MODE_DETAIL: 'Check All',
            ALERT_NO_CHANNEL: 'Please select at least one channel!',
            AUTH_SOUL_QUESTION: 'Logged in? Are you sure? Check again?',

            // Log Templates
            SCRIPT_START: (mode) => `System initialized | Mode: ${mode}`,
            SELECTED_CHANNELS: (channels) => `Targeting: ${channels}`,
            AUTH_ERROR: '❌ Auth Error: Not logged in or Cookie expired.',
            PROCESSING_CATEGORY: (name) => `\n📂 Category: ${name}`,
            PAGE_SCANNING: (channel, page, items) => `📄 ${channel} [Page ${page}] Scanning ${items} items...`,
            PAGE_FAILED: (name) => `Failed to retrieve data for ${name}.`,
            PAGE_FULLY_OWNED: (count) => `   ↳ Page cleared (Empty streak: ${count})`,
            ITEMS_FOUND: (count) => `   ↳ Discovered ${count} new items!`,
            FAST_MODE_LIMIT: '⏸️ Fast Mode limit reached.',
            RATING_SKIPPED: (title, score, count) => `   ⚠️ Low Rating: ${title} [${score}⭐/${count}]`,

            // Claim Status
            CLAIM_SUCCESS: (title) => `   ✅ Claimed: ${title}`,
            CLAIM_NO_LICENSE: (title) => `   ⚠️ ${title}: No free license found.`,
            CLAIM_FETCH_DETAIL_FAIL: (title) => `   ⚠️ ${title}: Detail fetch failed.`,
            CLAIM_FAILED: (status, title) => `   ❌ Failed (${status}): ${title}`,
            CLAIM_EXCEPTION: (title, error) => `   ❌ Exception: ${title} (${error})`,
            OWNERSHIP_ERROR: 'Ownership check error, assuming unowned.',
            RATE_LIMIT: (wait) => `⏳ Rate Limit (429) - Pausing for ${wait}s...`,
            ALL_FINISHED: (count) => `\n🎉 Operation Complete! Claimed: ${count}`,
            RELOAD_PROMPT: 'Done. Please refresh the page.'
        },

        'zh-CN': {
            TITLE: '⚡ FAB 领取助手',
            MINIMIZE: '最小化',
            CLOSE: '关闭',
            SCANNED: '已扫描',
            SUCCESS: '成功入库',
            FAILED: '失败',
            SKIPPED: '已拥有',
            SCANNING_CHANNELS: '🎯 扫描渠道',
            FILTER_SETTINGS: '⚙️ 质量过滤',
            ENABLE_RATING_FILTER: '跳过低分资产',
            MIN_RATING_LABEL: '最低评分：',
            SELECT_ALL_INVERT: '全选 / 反选',
            FAST_MODE_START: '🚀 快速模式',
            FAST_MODE_DETAIL: '仅检查新品',
            FULL_MODE_START: '🐢 全量模式',
            FULL_MODE_DETAIL: '地毯式搜索',
            ALERT_NO_CHANNEL: '请至少选择一个渠道！',
            AUTH_SOUL_QUESTION: '你登录了？你确定？你再检查一次？',

            // Log Templates
            SCRIPT_START: (mode) => `系统已启动 | 模式：${mode}`,
            SELECTED_CHANNELS: (channels) => `目标渠道：${channels}`,
            AUTH_ERROR: '❌ 鉴权失败：未登录或 Cookie 失效',
            PROCESSING_CATEGORY: (name) => `\n📂 正在处理分类：${name}`,
            PAGE_SCANNING: (channel, page, items) => `📄 ${channel} [第 ${page} 页] 扫描 ${items} 个物品...`,
            PAGE_FAILED: (name) => `获取 ${name} 数据失败`,
            PAGE_FULLY_OWNED: (count) => `   ↳ 本页无新物品（连续空页：${count}）`,
            ITEMS_FOUND: (count) => `   ↳ 发现 ${count} 个新资产！`,
            FAST_MODE_LIMIT: '⏸️ 触发快速模式上限，停止当前分类',
            RATING_SKIPPED: (title, score, count) => `   ⚠️ 评分过低跳过: ${title} [${score}分/${count}评]`,

            // Claim Status
            CLAIM_SUCCESS: (title) => `   ✅ 成功入库：${title}`,
            CLAIM_NO_LICENSE: (title) => `   ⚠️ ${title}: 无免费许可`,
            CLAIM_FETCH_DETAIL_FAIL: (title) => `   ⚠️ ${title}: 详情获取失败`,
            CLAIM_FAILED: (status, title) => `   ❌ 入库失败 (${status})：${title}`,
            CLAIM_EXCEPTION: (title, error) => `   ❌ 异常：${title} (${error})`,
            OWNERSHIP_ERROR: '所有权检查错误，尝试强制领取。',
            RATE_LIMIT: (wait) => `⏳ 触发限流 (429)，暂停 ${wait} 秒...`,
            ALL_FINISHED: (count) => `\n🎉 任务完成！本次入库：${count} 个`,
            RELOAD_PROMPT: '运行结束！请刷新页面重置。'
        }
    };

    // Auto-detect browser language
    let CURRENT_LANG = 'en-US';
    try {
        if (navigator.language && navigator.language.includes('zh')) {
            CURRENT_LANG = 'zh-CN';
        }
    } catch (e) {
        console.warn("[UnrealFabAssistantPlus] Language detection failed, defaulting to EN.");
    }

    // ==========================================
    // Global Settings
    // ==========================================
    const SCRIPT_SETTINGS = {
        isFastMode: true,
        maxEmptyPagesLimit: 3,
        // Rating Filter Config
        enableRatingFilter: false,
        minRating: 3.5,
        // Delay Settings (ms)
        requestDelay: { min: 1200, max: 3000 },
        retry: { limit: 3, delayMs: 2000 }
    };

    const CHANNEL_LIST = [
        { name: 'Unreal Engine', urlParam: 'unreal-engine', isFree: true, isDefaultChecked: true },
        { name: 'Unity', urlParam: 'unity', isFree: true, isDefaultChecked: true },
        { name: 'UEFN', urlParam: 'uefn', isFree: true, isDefaultChecked: true },
        { name: 'MetaHuman', urlParam: 'metahuman', isFree: true, isDefaultChecked: false }
    ];

    // ==========================================
    // Runtime State Tracking
    // ==========================================
    const RUNTIME_STATE = {
        totalScanned: 0,
        successClaimed: 0,
        failedClaims: 0,
        skippedOwned: 0,
        isRunning: false,

        reset() {
            this.totalScanned = 0;
            this.successClaimed = 0;
            this.failedClaims = 0;
            this.skippedOwned = 0;
            this.isRunning = false;
            UserInterface.updateDashboard();
        }
    };

    // ==========================================
    // UI Controller
    // ==========================================
    const UserInterface = {
        rootElement: null,
        logContainer: null,
        dashboardElements: null,
        isWindowMinimized: false,
        AUTO_SCROLL_THRESHOLD: 60,

        getText(key, ...args) {
            const text = LANGUAGE_PACKS[CURRENT_LANG][key];
            if (typeof text === 'function') {
                return text(...args);
            }
            return text || LANGUAGE_PACKS['en-US'][key] || key;
        },

        init() {
            try {
                this.injectStyles();
                this.renderInterface();
                console.log("[UnrealFabAssistantPlus] UI Initialized.");
            } catch (e) {
                console.error("UI Initialization failed:", e);
                // Fallback alert if UI fails to render
                alert("UnrealFabAssistantPlus UI Error: " + e.message);
            }
        },

        injectStyles() {
            const css = `
                /* Main Container Styles - Professional Dark Mode */
                #fab-helper-root {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    font-size: 14px;
                    line-height: 1.5;
                    position: fixed;
                    bottom: 60px;
                    right: 40px;
                    width: 500px;
                    height: 75vh;
                    max-height: 850px;
                    min-height: 400px;
                    background: rgba(25, 25, 30, 0.98);
                    color: #e0e0e0;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.05);
                    z-index: 2147483647; /* Max Z-Index to prevent overlay issues */
                    display: flex;
                    flex-direction: column;
                    transition: width 0.3s, height 0.3s;
                    overflow: hidden;
                }

                /* Minimized 'Pill' State */
                #fab-helper-root.minimized {
                    width: 220px !important;
                    height: 60px !important;
                    min-height: 0 !important;
                    bottom: 40px;
                    right: 40px;
                    padding: 0;
                    border-radius: 50px;
                    background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
                    box-shadow: 0 10px 30px rgba(76, 175, 80, 0.5);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Header adjustments in minimized mode */
                #fab-helper-root.minimized .fh-header {
                    background: transparent;
                    padding: 0;
                    border: none;
                    width: 100%;
                    justify-content: center;
                }

                #fab-helper-root.minimized .fh-title {
                    color: white;
                    font-size: 15px;
                    margin: 0;
                    text-shadow: none;
                    white-space: nowrap;
                }

                /* Hide content when minimized */
                #fab-helper-root.minimized .fh-controls,
                #fab-helper-root.minimized .fh-dashboard,
                #fab-helper-root.minimized .fh-logs,
                #fab-helper-root.minimized .fh-overlay {
                    display: none !important;
                }

                /* Header & Controls */
                .fh-header {
                    padding: 16px 24px;
                    background: rgba(255, 255, 255, 0.05);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    user-select: none;
                }

                .fh-title {
                    font-weight: 800;
                    color: #4CAF50;
                    font-size: 16px;
                }

                .fh-controls {
                    display: flex;
                    gap: 8px;
                }

                .fh-controls button {
                    background: rgba(255,255,255,0.05);
                    border: none;
                    color: #aaa;
                    cursor: pointer;
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

                .fh-controls button:hover {
                    background: rgba(255,255,255,0.2);
                    color: white;
                }

                /* Red Close Button */
                #fh-close-btn:hover {
                    background: #ff4757 !important;
                    color: white !important;
                }

                /* Dashboard Stats */
                .fh-dashboard {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    padding: 16px 24px;
                }

                .fh-stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: rgba(0,0,0,0.3);
                    padding: 10px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .fh-stat-val {
                    font-weight: 800;
                    font-size: 18px;
                    color: #fff;
                    margin-bottom: 2px;
                }

                .fh-stat-label {
                    color: #888;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                /* Log Console */
                .fh-logs {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px 24px;
                    background: rgba(0,0,0,0.2);
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 13px;
                }

                .fh-logs::-webkit-scrollbar {
                    width: 6px;
                }

                .fh-logs::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.15);
                    border-radius: 3px;
                }

                .fh-log-entry {
                    margin-bottom: 6px;
                    padding-bottom: 6px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                /* Settings Overlay */
                .fh-overlay {
                    position: absolute;
                    top: 62px;
                    left: 0;
                    width: 100%;
                    height: calc(100% - 62px);
                    background: #19191e;
                    padding: 20px 24px;
                    box-sizing: border-box;
                    z-index: 10;
                    overflow-y: auto;
                    border-radius: 0 0 20px 20px;
                    display: flex;
                    flex-direction: column;
                }

                .fh-section-title {
                    color: #4CAF50;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    margin: 20px 0 10px;
                    border-bottom: 1px solid rgba(76, 175, 80, 0.3);
                    padding-bottom: 5px;
                }

                .fh-section-title:first-child {
                    margin-top: 0;
                }

                .fh-channel-list {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 15px;
                }

                .fh-channel-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                    cursor: pointer;
                    color: #ccc;
                }

                .fh-channel-item:hover {
                    background: rgba(255,255,255,0.1);
                    color: white;
                }

                .fh-channel-item input {
                    accent-color: #4CAF50;
                    transform: scale(1.2);
                    cursor: pointer;
                }

                .fh-settings-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255,255,255,0.05);
                    padding: 12px 16px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }

                .fh-input-num {
                    width: 50px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 5px;
                    text-align: center;
                    border-radius: 6px;
                }

                .fh-btn-group {
                    display: flex;
                    gap: 12px;
                    margin-top: auto;
                }

                .fh-btn {
                    flex: 1;
                    padding: 14px;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .fh-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-green { background: #4CAF50; }
                .btn-blue { background: #2196F3; }
                .btn-gray {
                    width: 100%;
                    padding: 10px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    border: none;
                    color: #ddd;
                    cursor: pointer;
                    font-weight: 600;
                }
            `;
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        },

        renderInterface() {
            this.rootElement = document.createElement('div');
            this.rootElement.id = 'fab-helper-root';

            const channelCheckboxesHTML = CHANNEL_LIST.map(c => `
                <label class="fh-channel-item">
                    <input type="checkbox" data-url="${c.urlParam}" ${c.isDefaultChecked ? 'checked' : ''}>
                    ${c.name}
                </label>
            `).join('');

            this.rootElement.innerHTML = `
                <div class="fh-header">
                    <div class="fh-title">${this.getText('TITLE')}</div>
                    <div class="fh-controls">
                        <button id="fh-min-btn" title="${this.getText('MINIMIZE')}">－</button>
                        <button id="fh-close-btn" title="${this.getText('CLOSE')}">✕</button>
                    </div>
                </div>

                <div class="fh-dashboard">
                    <div class="fh-stat-item"><span class="fh-stat-val" id="stat-scanned">0</span><span class="fh-stat-label">${this.getText('SCANNED')}</span></div>
                    <div class="fh-stat-item"><span class="fh-stat-val" style="color:#4CAF50" id="stat-success">0</span><span class="fh-stat-label">${this.getText('SUCCESS')}</span></div>
                    <div class="fh-stat-item"><span class="fh-stat-val" style="color:#ff6b6b" id="stat-failed">0</span><span class="fh-stat-label">${this.getText('FAILED')}</span></div>
                    <div class="fh-stat-item"><span class="fh-stat-val" style="color:#FF9800" id="stat-skipped">0</span><span class="fh-stat-label">${this.getText('SKIPPED')}</span></div>
                </div>

                <div class="fh-logs" id="fh-logs"></div>

                <div class="fh-overlay" id="fh-overlay">
                    <div class="fh-section-title">${this.getText('SCANNING_CHANNELS')}</div>
                    <div class="fh-channel-list">${channelCheckboxesHTML}</div>
                    <button class="btn-gray" id="btn-select-all">${this.getText('SELECT_ALL_INVERT')}</button>

                    <div class="fh-section-title">${this.getText('FILTER_SETTINGS')}</div>
                    <div class="fh-settings-row">
                        <label style="display:flex;align-items:center;cursor:pointer;color:#e0e0e0;font-size:13px;">
                            <input type="checkbox" id="setting-rating-enable" style="margin-right:10px;accent-color:#4CAF50;transform:scale(1.2);">
                            ${this.getText('ENABLE_RATING_FILTER')}
                        </label>
                        <div id="rating-input-container" style="opacity:0.4; pointer-events:none; transition:opacity 0.2s; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:12px;color:#ccc;">${this.getText('MIN_RATING_LABEL')}</span>
                            <input type="number" id="setting-rating-val" class="fh-input-num" value="3.5" step="0.1" min="0" max="5">
                        </div>
                    </div>

                    <div class="fh-btn-group">
                        <button class="fh-btn btn-green" id="btn-fast">
                            <span>${this.getText('FAST_MODE_START')}</span>
                            <small>${this.getText('FAST_MODE_DETAIL')}</small>
                        </button>
                        <button class="fh-btn btn-blue" id="btn-full">
                            <span>${this.getText('FULL_MODE_START')}</span>
                            <small>${this.getText('FULL_MODE_DETAIL')}</small>
                        </button>
                    </div>
                </div>
            `;

            // Append to body with a simple check
            if (document.body) {
                document.body.appendChild(this.rootElement);
            } else {
                console.error("Document body not available. UI injection deferred.");
                setTimeout(() => { if(document.body) document.body.appendChild(this.rootElement); }, 1500);
            }

            this.logContainer = this.rootElement.querySelector('#fh-logs');
            this.dashboardElements = {
                scanned: this.rootElement.querySelector('#stat-scanned'),
                success: this.rootElement.querySelector('#stat-success'),
                failed: this.rootElement.querySelector('#stat-failed'),
                skipped: this.rootElement.querySelector('#stat-skipped'),
            };

            this.bindEvents();
        },

        bindEvents() {
            const els = this.rootElement;
            if(!els) return;

            // Minimize toggle on container click (only works when minimized)
            els.onclick = (e) => {
                if (this.isWindowMinimized) {
                    this.toggleMinimize();
                    e.stopPropagation();
                }
            };

            // Prevent event propagation for internal clicks
            els.querySelector('.fh-dashboard').onclick = (e) => e.stopPropagation();
            els.querySelector('.fh-logs').onclick = (e) => e.stopPropagation();
            els.querySelector('.fh-overlay').onclick = (e) => e.stopPropagation();

            // Header Button Events
            els.querySelector('#fh-close-btn').onclick = (e) => {
                e.stopPropagation();
                if(confirm("Exit Helper?")) els.remove();
            };

            els.querySelector('#fh-min-btn').onclick = (e) => {
                e.stopPropagation();
                this.toggleMinimize();
            };

            els.querySelector('#btn-select-all').onclick = () => this.toggleAllChannels();
            els.querySelector('#btn-fast').onclick = () => this.prepareAndStart(true);
            els.querySelector('#btn-full').onclick = () => this.prepareAndStart(false);

            // Rating Checkbox Toggle
            const ratingCheck = els.querySelector('#setting-rating-enable');
            const ratingContainer = els.querySelector('#rating-input-container');
            ratingCheck.onchange = (e) => {
                ratingContainer.style.opacity = e.target.checked ? '1' : '0.4';
                ratingContainer.style.pointerEvents = e.target.checked ? 'auto' : 'none';
            };
        },

        toggleAllChannels() {
            const checkboxes = this.rootElement.querySelectorAll('.fh-channel-list input[type="checkbox"]');
            const currentState = checkboxes[0]?.checked ?? false;
            checkboxes.forEach(cb => cb.checked = !currentState);
        },

        prepareAndStart(isFastMode) {
            const selectedChannels = [];
            this.rootElement.querySelectorAll('.fh-channel-list input[type="checkbox"]:checked').forEach(cb => {
                const channel = CHANNEL_LIST.find(c => c.urlParam === cb.dataset.url);
                if (channel) selectedChannels.push(channel);
            });

            if (selectedChannels.length === 0) {
                alert(this.getText('ALERT_NO_CHANNEL'));
                return;
            }

            // Apply settings
            SCRIPT_SETTINGS.enableRatingFilter = this.rootElement.querySelector('#setting-rating-enable').checked;
            SCRIPT_SETTINGS.minRating = parseFloat(this.rootElement.querySelector('#setting-rating-val').value) || 3.5;

            // Hide overlay to show logs
            const overlay = this.rootElement.querySelector('#fh-overlay');
            if (overlay) overlay.style.display = 'none';

            CoreLogic.start(isFastMode, selectedChannels).finally(() => {
                this.log('info', this.getText('RELOAD_PROMPT'));
            });
        },

        toggleMinimize() {
            this.isWindowMinimized = !this.isWindowMinimized;
            if (this.isWindowMinimized) {
                this.rootElement.classList.add('minimized');
            } else {
                this.rootElement.classList.remove('minimized');
            }
        },

        updateDashboard() {
            if (!this.dashboardElements) return;
            this.dashboardElements.scanned.textContent = RUNTIME_STATE.totalScanned;
            this.dashboardElements.success.textContent = RUNTIME_STATE.successClaimed;
            this.dashboardElements.failed.textContent = RUNTIME_STATE.failedClaims;
            this.dashboardElements.skipped.textContent = RUNTIME_STATE.skippedOwned;
        },

        log(type, message, detail) {
            if (!this.logContainer) return;
            const shouldScroll = this.logContainer.scrollHeight - this.logContainer.clientHeight <= this.logContainer.scrollTop + this.AUTO_SCROLL_THRESHOLD;
            const entry = document.createElement('div');
            entry.className = 'fh-log-entry';

            let color = '#ccc';
            let icon = '•'; // Simple clean icon

            switch (type) {
                case 'success': color = '#4CAF50'; icon = '✓'; break;
                case 'warn':    color = '#FFC107'; icon = '!'; break;
                case 'error':   color = '#ff6b6b'; icon = 'x'; break;
                case 'info':    color = '#2196F3'; icon = 'i'; break;
            }

            const time = new Date().toLocaleTimeString([], { hour12: false });
            entry.innerHTML = `<span style="color:#666;font-size:11px;margin-right:8px">[${time}]</span><span style="color:${color}">${icon} ${message}</span>`;
            if (detail) entry.innerHTML += ` <span style="color:#888">(${detail})</span>`;

            this.logContainer.appendChild(entry);

            if (shouldScroll) {
                this.logContainer.scrollTop = this.logContainer.scrollHeight;
            }
        }
    };

    // ==========================================
    // Core Business Logic
    // ==========================================
    const CoreLogic = {
        defaultHeaders: {},

        async start(isFastMode, selectedChannels) {
            SCRIPT_SETTINGS.isFastMode = isFastMode;
            RUNTIME_STATE.reset();
            RUNTIME_STATE.isRunning = true;

            const modeText = isFastMode ? UserInterface.getText('FAST_MODE_START') : UserInterface.getText('FULL_MODE_START');
            UserInterface.log('info', UserInterface.getText('SCRIPT_START', modeText));

            try {
                this.initializeAuthentication();
            } catch (e) {
                RUNTIME_STATE.isRunning = false;
                alert(UserInterface.getText('AUTH_SOUL_QUESTION'));
                return UserInterface.log('error', UserInterface.getText('AUTH_ERROR'));
            }

            for (const channel of selectedChannels) {
                if (!RUNTIME_STATE.isRunning) break;
                UserInterface.log('info', UserInterface.getText('PROCESSING_CATEGORY', channel.name));
                await this.processChannelPages(channel);
                await this.sleep(2000);
            }
            UserInterface.log('success', UserInterface.getText('ALL_FINISHED', RUNTIME_STATE.successClaimed));
            RUNTIME_STATE.isRunning = false;
        },

        initializeAuthentication() {
            const csrfToken = this.getCookie('fab_csrftoken');
            if (!csrfToken) throw new Error("Auth failed.");
            this.defaultHeaders = {
                "x-csrftoken": csrfToken,
                "x-requested-with": "XMLHttpRequest",
                "accept": "application/json",
                "content-type": "application/x-www-form-urlencoded"
            };
        },

        async processChannelPages(channel) {
            let nextCursor = null;
            let pageNum = 1;
            let emptyPagesCount = 0;
            const baseUrl = `https://www.fab.com/i/listings/search?channels=${channel.urlParam}&is_free=${channel.isFree ? 1 : 0}&sort_by=-createdAt`;

            do {
                if (!RUNTIME_STATE.isRunning) break;
                const url = `${baseUrl}${nextCursor ? `&cursor=${nextCursor}` : ''}`;
                const data = await this.fetchWithRetry(url);

                if (!data || !data.results) {
                    UserInterface.log('error', UserInterface.getText('PAGE_FAILED', channel.name));
                    break;
                }

                nextCursor = data.cursors?.next;
                const items = data.results;
                if (items.length === 0) break;

                UserInterface.log('log', UserInterface.getText('PAGE_SCANNING', channel.name, pageNum, items.length));

                const uids = items.map(i => i.uid);
                const ownershipStatus = await this.checkOwnership(uids);

                // Only filter items that are explicitly owned (true).
                // Items with false/undefined ownership status should be attempted.
                let pendingItems = items.filter(item => ownershipStatus[item.uid] !== true);

                RUNTIME_STATE.totalScanned += items.length;
                RUNTIME_STATE.skippedOwned += (items.length - pendingItems.length);

                // Apply Rating Filter if enabled
                if (SCRIPT_SETTINGS.enableRatingFilter && pendingItems.length > 0) {
                     pendingItems = pendingItems.filter(item => {
                         const rating = item.average_rating || item.averageRating || item.ratingScore;
                         const count = item.review_count || item.reviewCount || 0;

                         // Skip only if item has reviews AND rating is below threshold
                         if (count > 0 && rating !== undefined && rating < SCRIPT_SETTINGS.minRating) {
                             UserInterface.log('warn', UserInterface.getText('RATING_SKIPPED', item.title, rating.toFixed(1), count));
                             return false;
                         }
                         return true;
                     });
                }

                UserInterface.updateDashboard();

                if (pendingItems.length === 0) {
                    emptyPagesCount++;
                    UserInterface.log('log', UserInterface.getText('PAGE_FULLY_OWNED', emptyPagesCount));
                } else {
                    emptyPagesCount = 0;
                    UserInterface.log('info', UserInterface.getText('ITEMS_FOUND', pendingItems.length));
                    for (const item of pendingItems) {
                        if (!RUNTIME_STATE.isRunning) return;
                        await this.claimItem(item);
                        await this.sleep(this.randomDelay());
                    }
                }

                if (SCRIPT_SETTINGS.isFastMode && emptyPagesCount >= SCRIPT_SETTINGS.maxEmptyPagesLimit) {
                    UserInterface.log('warn', UserInterface.getText('FAST_MODE_LIMIT'));
                    break;
                }
                pageNum++;
                await this.sleep(1000);
            } while (nextCursor && RUNTIME_STATE.isRunning);
        },

        async claimItem(item) {
            try {
                const details = await this.fetchWithRetry(`https://www.fab.com/i/listings/${item.uid}`);
                if (!details || !details.licenses) {
                    UserInterface.log('warn', UserInterface.getText('CLAIM_FETCH_DETAIL_FAIL', item.title));
                    return;
                }

                // Secondary Deep Rating Check (Double verification)
                if (SCRIPT_SETTINGS.enableRatingFilter) {
                    const rating = details.averageRating || details.average_rating || 0;
                    const count = details.reviewCount || details.review_count || 0;
                    if (count > 0 && rating < SCRIPT_SETTINGS.minRating) {
                        UserInterface.log('warn', UserInterface.getText('RATING_SKIPPED', item.title, rating.toFixed(1), count));
                        return;
                    }
                }

                const freeLicense = details.licenses.find(l => l.priceTier?.price === 0 && l.slug === 'professional') ||
                                    details.licenses.find(l => l.priceTier?.price === 0) ||
                                    details.licenses.find(l => l.discount?.amount === l.price);

                if (!freeLicense) {
                    UserInterface.log('warn', UserInterface.getText('CLAIM_NO_LICENSE', item.title));
                    return;
                }

                const formData = new FormData();
                formData.append('offer_id', freeLicense.offerId);

                const res = await fetch(`https://www.fab.com/i/listings/${item.uid}/add-to-library`, {
                    method: 'POST',
                    headers: { ...this.defaultHeaders, "accept": "application/json" },
                    body: formData
                });

                if (res.status === 204 || res.status === 200) {
                    UserInterface.log('success', UserInterface.getText('CLAIM_SUCCESS', item.title));
                    RUNTIME_STATE.successClaimed++;
                } else {
                    UserInterface.log('error', UserInterface.getText('CLAIM_FAILED', res.status, item.title));
                    RUNTIME_STATE.failedClaims++;
                }
            } catch (e) {
                UserInterface.log('error', UserInterface.getText('CLAIM_EXCEPTION', item.title, e.message || e));
                RUNTIME_STATE.failedClaims++;
            } finally {
                UserInterface.updateDashboard();
            }
        },

        async checkOwnership(uids) {
            if (!uids.length) return {};
            try {
                const query = uids.map(id => `listing_ids=${id}`).join('&');
                const data = await this.fetchWithRetry(`https://www.fab.com/i/users/me/listings-states?${query}`);
                return Array.isArray(data) ? data.reduce((acc, item) => ({ ...acc, [item.uid]: item.acquired }), {}) : {};
            } catch (e) {
                return {};
            }
        },

        async fetchWithRetry(url, options = {}, retries = SCRIPT_SETTINGS.retry.limit) {
            options.headers = { ...this.defaultHeaders, ...options.headers };
            for (let i = 0; i < retries; i++) {
                try {
                    const res = await fetch(url, options);
                    if (res.status === 401) {
                        alert(UserInterface.getText('AUTH_SOUL_QUESTION'));
                        throw new Error("Auth failed");
                    }
                    if (res.status === 429) {
                        const w = (i + 1) * 5000;
                        UserInterface.log('warn', UserInterface.getText('RATE_LIMIT', w/1000));
                        await this.sleep(w);
                        continue;
                    }
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return await res.json();
                } catch (e) {
                    if (e.message.includes("Auth")) throw e;
                    if (i === retries - 1) return null;
                    await this.sleep(SCRIPT_SETTINGS.retry.delayMs);
                }
            }
            return null;
        },

        getCookie(name) {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? match[2] : null;
        },

        sleep(ms) {
            return new Promise(r => setTimeout(r, ms));
        },

        randomDelay() {
            const { min, max } = SCRIPT_SETTINGS.requestDelay;
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    };

    // Initialize the script
    UserInterface.init();
})();


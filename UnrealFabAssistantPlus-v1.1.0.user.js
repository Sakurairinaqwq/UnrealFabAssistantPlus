// ==UserScript==
// @name         UnrealFabAssistantPlus
// @namespace    https://github.com/Sakurairinaqwq/UnrealFabAssistantPlus
// @version      v3.2.2
// @description  Fab.com Free Asset Auto-Claim Helper Plus
// @author       Sakurairinaqwq (It is an iteration based on https://github.com/RyensX/UnrealFabAssistant Thanks to https://github.com/RyensX)
// @match        https://www.fab.com/*
// @grant        none
// @license      GPL-3.0
// ==/UserScript==

/**
 * (function () { ... })(); 是一个立即执行函数表达式 (IIFE)，用于创建一个私有作用域，防止污染全局环境。
 * The (function () { ... })(); is an Immediately Invoked Function Expression (IIFE)
 * used to create a private scope and prevent polluting the global environment.
 */
(function () {
    'use strict';

    // ==========================================
    // 🌍 LANGUAGE PACKS / 语言包
    // ==========================================
    /**
     * LANGUAGE_PACKS: 存储所有 UI 文本的本地化字符串。
     * LANGUAGE_PACKS: Stores localized strings for all UI texts.
     */
    const LANGUAGE_PACKS = {
        'en-US': {
            // General
            TITLE: '⚡ UnrealFab Helper v3.2.2',
            MINIMIZE: 'Minimize/Restore',
            CLOSE: 'Close',

            // Dashboard
            SCANNED: 'Scanned',
            SUCCESS: 'Success',
            FAILED: 'Failed',
            SKIPPED: 'Owned',

            // Overlay
            SCANNING_CHANNELS: '✅ Scanning Channels:',
            SELECT_ALL_INVERT: 'Select All / Invert Selection',
            FAST_MODE_START: '🚀 Fast Mode Start',
            FAST_MODE_DETAIL: '(Check for New)',
            FULL_MODE_START: '🐢 Full Mode Start',
            FULL_MODE_DETAIL: '(Check All)',
            ALERT_NO_CHANNEL: 'Please select at least one channel to scan!',

            // Logs
            SCRIPT_START: (mode) => `Script started | Mode: ${mode}`,
            SELECTED_CHANNELS: (channels) => `🚀 Selected Channels: ${channels}`,
            AUTH_ERROR: '❌ Not logged in or Cookie expired. Please refresh the page and try again.',
            PROCESSING_CATEGORY: (name) => `\n📂 Processing category: ${name}`,
            PAGE_SCANNING: (channel, page, items) => `📄 ${channel} Page ${page}: Scanning ${items} items...`,
            PAGE_FAILED: (name) => `Failed to get page data for ${name}, stopping this category.`,
            PAGE_FULLY_OWNED: (count) => `   ↳ Page fully owned (Consecutive empty pages: ${count})`,
            ITEMS_FOUND: (count) => `   ↳ Found ${count} new items!`,
            FAST_MODE_LIMIT: '⏸️ Fast Mode limit triggered (Max empty pages reached), skipping further pages.',
            CLAIM_SUCCESS: (title) => `   ✅ Claimed successfully: ${title}`,
            CLAIM_NO_LICENSE: (title) => `   ⚠️ ${title}: No free license available.`,
            CLAIM_FETCH_DETAIL_FAIL: (title) => `   ⚠️ ${title}: Failed to get details or licenses.`,
            CLAIM_FAILED: (status, title) => `   ❌ Claim failed (${status}): ${title}`,
            CLAIM_EXCEPTION: (title, error) => `   ❌ Exception during claim: ${title} (${error})`,
            OWNERSHIP_ERROR: 'Error checking ownership status, assuming no ownership for safety.',
            RATE_LIMIT: (wait) => `⏳ Rate limit triggered (429), waiting for ${wait}s before retrying...`,
            ALL_FINISHED: (count) => `\n🎉 All tasks completed! Successfully claimed: ${count}`,
            RELOAD_PROMPT: 'All tasks finished! Please refresh the page manually to rerun.'
        },

        'zh-CN': {
            // General
            TITLE: '⚡ UnrealFab 领取助手 v3.2.2',
            MINIMIZE: '最小化/还原',
            CLOSE: '关闭',

            // Dashboard
            SCANNED: '已扫描',
            SUCCESS: '成功入库',
            FAILED: '失败',
            SKIPPED: '已拥有',

            // Overlay
            SCANNING_CHANNELS: '✅ 扫描渠道：',
            SELECT_ALL_INVERT: '全选 / 反选',
            FAST_MODE_START: '🚀 快速模式启动',
            FAST_MODE_DETAIL: '(仅检查新品)',
            FULL_MODE_START: '🐢 全量模式启动',
            FULL_MODE_DETAIL: '(检查所有)',
            ALERT_NO_CHANNEL: '请至少选择一个要扫描的渠道！',

            // Logs
            SCRIPT_START: (mode) => `脚本已启动 | 模式：${mode}`,
            SELECTED_CHANNELS: (channels) => `🚀 已选择渠道：${channels}`,
            AUTH_ERROR: '❌ 未登录或 Cookie 失效，请刷新页面后重试',
            PROCESSING_CATEGORY: (name) => `\n📂 正在处理分类：${name}`,
            PAGE_SCANNING: (channel, page, items) => `📄 ${channel} 第 ${page} 页：扫描 ${items} 个资产...`,
            PAGE_FAILED: (name) => `获取 ${name} 页面数据失败，停止当前分类`,
            PAGE_FULLY_OWNED: (count) => `   ↳ 本页资产均已拥有（连续空页：${count}）`,
            ITEMS_FOUND: (count) => `   ↳ 发现 ${count} 个新资产！`,
            FAST_MODE_LIMIT: '⏸️ 快速模式限制触发（达到最大空页数），跳过后续页面',
            CLAIM_SUCCESS: (title) => `   ✅ 成功入库：${title}`,
            CLAIM_NO_LICENSE: (title) => `   ⚠️ ${title}: 无免费许可可用`,
            CLAIM_FETCH_DETAIL_FAIL: (title) => `   ⚠️ ${title}: 获取详情或许可失败`,
            CLAIM_FAILED: (status, title) => `   ❌ 入库失败 (${status})：${title}`,
            CLAIM_EXCEPTION: (title, error) => `   ❌ 领取时发生异常：${title} (${error})`,
            OWNERSHIP_ERROR: '检查拥有状态出错，为安全起见假设未拥有。',
            RATE_LIMIT: (wait) => `⏳ 触发限流 (429)，等待 ${wait} 秒后重试...`,
            ALL_FINISHED: (count) => `\n🎉 所有任务完成！成功入库：${count} 个`,
            RELOAD_PROMPT: '所有任务完成！请手动刷新页面重新运行。'
        }
    };

    let CURRENT_LANG = 'en-US';

    // ==========================================
    // ⚙️ GLOBAL CONFIGURATION / 全局配置
    // ==========================================
    const SCRIPT_SETTINGS = {
        isFastMode: true,
        maxEmptyPagesLimit: 3,
        requestDelay: {
            min: 1200,
            max: 3000,
        },
        retry: {
            limit: 3,
            delayMs: 2000,
        }
    };

    // 🌐 SCANNING CHANNELS / 可扫描的渠道列表配置
    const CHANNEL_LIST = [
        { name: 'Unreal Engine', urlParam: 'unreal-engine', isFree: true, isDefaultChecked: true },
        { name: 'Unity', urlParam: 'unity', isFree: true, isDefaultChecked: true },
        { name: 'UEFN', urlParam: 'uefn', isFree: true, isDefaultChecked: true },
        { name: 'MetaHuman', urlParam: 'metahuman', isFree: true, isDefaultChecked: false }
    ];

    // ==========================================
    // 📊 STATE MANAGEMENT / 状态管理
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
    // 🎨 UI MODULE / UI 界面模块
    // ==========================================
    const UserInterface = {
        rootElement: null,
        logContainer: null,
        dashboardElements: null,
        isWindowMinimized: false,
        AUTO_SCROLL_THRESHOLD: 50,

        getText(key, ...args) {
            const text = LANGUAGE_PACKS[CURRENT_LANG][key];
            if (typeof text === 'function') {
                return text(...args);
            }
            return text || LANGUAGE_PACKS['en-US'][key] || key;
        },

        init() {
            this.injectStyles();
            // 启动时先等待语言选择
            LanguageSelector.show().then(selectedLang => {
                CURRENT_LANG = selectedLang;
                this.renderInterface();
            });
        },

        injectStyles() {
            const css = `
                /* 🚀 UI 放大优化 & 位置调整 / UI Scaling Optimization & Position Adjustment */
                #fab-helper-root {
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    font-size: 14px; line-height: 1.4; position: fixed;
                    /* 底部距离调整为 100px */
                    bottom: 100px;
                    right: 50px; width: 500px;
                    max-height: calc(100vh - 150px);
                    background: #1e1e1e; color: #e0e0e0;
                    border-radius: 8px; border: 1px solid #333;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.6);
                    z-index: 999999; display: flex; flex-direction: column;
                    transition: all 0.3s ease;
                }

                /* ------------------------------------------- */
                /* 🌐 语言选择器样式优化 / Language Selector Style Optimization */
                /* ------------------------------------------- */
                #language-selector-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.8); /* 半透明黑色背景 */
                    z-index: 1000000;
                    display: flex; justify-content: center; align-items: center;
                }

                #language-selector {
                    width: 350px;
                    padding: 30px;
                    background: #252526; /* 使用比根元素更深的背景 */
                    color: #e0e0e0;
                    border-radius: 12px;
                    box-shadow: 0 15px 50px rgba(0,0,0,0.9); /* 更明显的阴影 */
                    text-align: center;
                    border: 1px solid #4CAF50; /* 突出主题色边框 */
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                #language-selector h3 {
                    color: #4CAF50;
                    margin-top: 0;
                    font-size: 18px;
                    border-bottom: 1px solid #333;
                    padding-bottom: 10px;
                    font-weight: 700;
                }

                .language-buttons {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                }

                #language-selector button {
                    padding: 12px 25px;
                    margin: 0;
                    border: none;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                    color: white;
                    flex: 1; /* 平分空间 */
                    /* 使用与 Fast Mode 相似的绿色渐变 */
                    background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
                    transition: transform 0.1s, opacity 0.2s, box-shadow 0.2s;
                }
                #language-selector button:hover {
                    opacity: 0.9;
                    box-shadow: 0 0 15px rgba(76, 175, 80, 0.5); /* 绿色光影效果 */
                }
                #language-selector button:active {
                    transform: scale(0.98);
                }
                /* ------------------------------------------- */


                .fh-header { padding: 12px 18px; background: #252526; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0; user-select: none; }
                .fh-title { font-weight: 700; color: #4CAF50; font-size: 16px; }
                .fh-controls button { background: none; border: none; color: #888; cursor: pointer; font-size: 18px; padding: 0 8px; transition: color 0.2s; }
                .fh-controls button:hover { color: #fff; }
                .fh-dashboard { display: grid; grid-template-columns: repeat(4, 1fr); padding: 10px 12px; background: #2d2d2d; border-bottom: 1px solid #333; text-align: center; font-size: 13px; }
                .fh-stat-item { display: flex; flex-direction: column; }
                .fh-stat-val { font-weight: bold; font-size: 18px; color: #fff; }
                .fh-stat-label { color: #888; font-size: 11px; text-transform: uppercase; }
                .fh-logs { flex: 1; overflow-y: auto; padding: 12px; background: #1e1e1e; font-family: 'Consolas', monospace; font-size: 13px; height: 280px; }
                .fh-logs::-webkit-scrollbar { width: 8px; }
                .fh-logs::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
                .fh-log-entry { margin-bottom: 5px; border-bottom: 1px dashed #2a2a2a; padding-bottom: 3px; }
                .fh-time { color: #666; margin-right: 10px; font-size: 12px; }
                .fh-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(20, 20, 20, 0.95); display: flex; flex-direction: column; justify-content: flex-start; align-items: center; gap: 15px; z-index: 10; border-radius: 8px; padding: 20px; }
                .fh-top-controls, .fh-bottom-controls { display: flex; width: 100%; justify-content: center; gap: 15px; margin-bottom: 5px; }

                .fh-btn {
                    padding: 12px 0; border: none; border-radius: 4px;
                    font-weight: 600; cursor: pointer; color: white;
                    flex-grow: 1; min-width: 150px;
                    transition: transform 0.1s, opacity 0.2s;
                    display: flex; align-items: center; justify-content: center;
                }
                .fh-btn:hover:not(:disabled) { opacity: 0.9; }
                .fh-btn:active:not(:disabled) { transform: scale(0.98); }
                .fh-btn:disabled { cursor: not-allowed; opacity: 0.5; }
                .btn-green { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); }
                .btn-blue { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); }
                .fh-btn small { font-weight: normal; margin-left: 10px; opacity: 0.8; font-size: 12px; }

                #btn-select-all {
                    padding: 8px 12px; border: none; border-radius: 4px;
                    font-size: 13px; font-weight: 600; cursor: pointer; color: white;
                    margin-top: 0px;
                    min-width: 150px;
                    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                    transition: opacity 0.2s;
                }
                #btn-select-all:hover { opacity: 0.9; }

                .fh-channel-list { padding: 15px; background: #2d2d2d; border-radius: 4px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 20px; flex-grow: 1; }
                .fh-channel-item { display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; }
                .fh-channel-item input[type="checkbox"] { margin-right: 6px; transform: scale(1.1); }
                #fab-helper-root.minimized { height: 48px; overflow: hidden; }
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
                    <input type="checkbox" id="channel-${c.urlParam}"
                           data-url="${c.urlParam}"
                           ${c.isDefaultChecked ? 'checked' : ''}>
                    ${c.name}
                </label>
            `).join('');

            this.rootElement.innerHTML = `
                <div class="fh-header">
                    <div class="fh-title">${this.getText('TITLE')}</div>
                    <div class="fh-controls">
                        <button id="fh-min-btn" title="${this.getText('MINIMIZE')}">➖</button>
                        <button id="fh-close-btn" title="${this.getText('CLOSE')}">✕</button>
                    </div>
                </div>

                <div class="fh-dashboard">
                    <div class="fh-stat-item"><span class="fh-stat-val" id="stat-scanned">0</span><span class="fh-stat-label">${this.getText('SCANNED')}</span></div>
                    <div class="fh-stat-item"><span class="fh-stat-val" style="color:#4CAF50" id="stat-success">0</span><span class="fh-stat-label">${this.getText('SUCCESS')}</span></div>
                    <div class="fh-stat-item"><span class="fh-stat-val" style="color:#f44336" id="stat-failed">0</span><span class="fh-stat-label">${this.getText('FAILED')}</span></div>
                    <div class="fh-stat-item"><span class="fh-stat-val" style="color:#FF9800" id="stat-skipped">0</span><span class="fh-stat-label">${this.getText('SKIPPED')}</span></div>
                </div>

                <div class="fh-logs" id="fh-logs"></div>

                <div class="fh-overlay" id="fh-overlay">

                    <div class="fh-top-controls">
                        <div style="color:#e0e0e0; font-size:15px; margin-right: 15px; white-space: nowrap; align-self: flex-start; padding-top: 15px;">${this.getText('SCANNING_CHANNELS')}</div>

                        <div class="fh-channel-list">
                            ${channelCheckboxesHTML}
                        </div>
                    </div>

                    <button id="btn-select-all">
                        ${this.getText('SELECT_ALL_INVERT')}
                    </button>

                    <div class="fh-bottom-controls">
                        <button class="fh-btn btn-green" id="btn-fast">
                            ${this.getText('FAST_MODE_START')} <small>${this.getText('FAST_MODE_DETAIL')}</small>
                        </button>
                        <button class="fh-btn btn-blue" id="btn-full">
                            ${this.getText('FULL_MODE_START')} <small>${this.getText('FULL_MODE_DETAIL')}</small>
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(this.rootElement);

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
            this.rootElement.querySelector('#fh-close-btn').onclick = () => this.rootElement.remove();
            this.rootElement.querySelector('#fh-min-btn').onclick = () => this.toggleMinimize();
            this.rootElement.querySelector('#btn-select-all').onclick = () => this.toggleAllChannels();
            this.rootElement.querySelector('#btn-fast').onclick = () => this.startScan(true);
            this.rootElement.querySelector('#btn-full').onclick = () => this.startScan(false);
        },

        toggleAllChannels() {
            const checkboxes = this.rootElement.querySelectorAll('.fh-channel-list input[type="checkbox"]');
            const currentState = checkboxes[0]?.checked ?? false;
            checkboxes.forEach(cb => cb.checked = !currentState);
        },

        startScan(isFastMode) {
            const selectedChannels = [];
            const checkboxes = this.rootElement.querySelectorAll('.fh-channel-list input[type="checkbox"]:checked');

            checkboxes.forEach(cb => {
                const channel = CHANNEL_LIST.find(c => c.urlParam === cb.dataset.url);
                if (channel) selectedChannels.push(channel);
            });

            if (selectedChannels.length === 0) {
                alert(this.getText('ALERT_NO_CHANNEL'));
                return;
            }

            this.rootElement.querySelectorAll('.fh-btn').forEach(btn => btn.disabled = true);
            const overlay = this.rootElement.querySelector('#fh-overlay');
            if (overlay) overlay.remove();

            CoreLogic.start(isFastMode, selectedChannels).finally(() => {
                this.log('info', this.getText('RELOAD_PROMPT'));
                this.rootElement.querySelectorAll('.fh-btn').forEach(btn => btn.disabled = false);
            });
        },

        toggleMinimize() {
            this.isWindowMinimized = !this.isWindowMinimized;
            if (this.isWindowMinimized) {
                this.rootElement.classList.add('minimized');
                this.rootElement.querySelector('#fh-min-btn').textContent = '⬜';
            } else {
                this.rootElement.classList.remove('minimized');
                this.rootElement.querySelector('#fh-min-btn').textContent = '➖';
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
            let icon = '';

            switch (type) {
                case 'success': color = '#4CAF50'; icon = '✅ '; break;
                case 'warn':    color = '#FFC107'; icon = '⚠️ '; break;
                case 'error':   color = '#f44336'; icon = '❌ '; break;
                case 'info':    color = '#2196F3'; icon = 'ℹ️ '; break;
                default:        color = '#ccc'; icon = '📄 '; break;
            }

            const time = new Date().toLocaleTimeString([], { hour12: false });
            let formattedMessage = message;
            if (detail) {
                 formattedMessage += ` (${detail})`;
            }

            entry.innerHTML = `<span class="fh-time">[${time}]</span><span style="color:${color}">${icon}${formattedMessage}</span>`;

            this.logContainer.appendChild(entry);

            if (shouldScroll) {
                this.logContainer.scrollTop = this.logContainer.scrollHeight;
            }
        }
    };

    // ==========================================
    // 🌐 LANGUAGE SELECTOR MODULE / 语言选择器模块
    // ==========================================
    const LanguageSelector = {
        /**
         * 显示语言选择对话框。
         * Displays the language selection dialog.
         * @returns {Promise<string>} 用户选择的语言代码 / Selected language code by the user.
         */
        show() {
            return new Promise(resolve => {
                const overlay = document.createElement('div');
                overlay.id = 'language-selector-overlay'; // 整个屏幕的半透明背景

                overlay.innerHTML = `
                    <div id="language-selector">
                        <h3>请选择您的语言 | Please Select Your Language</h3>
                        <div class="language-buttons">
                            <button data-lang="zh-CN">🇨🇳 简体中文</button>
                            <button data-lang="en-US">🇺🇸 English (US)</button>
                        </div>
                    </div>
                `;

                document.body.appendChild(overlay);

                // 绑定点击事件，移除选择器并解析 Promise
                overlay.querySelectorAll('button').forEach(button => {
                    button.onclick = () => {
                        const lang = button.dataset.lang;
                        overlay.remove(); // 移除整个 overlay
                        resolve(lang);
                    };
                });
            });
        }
    };

    // ==========================================
    // 🧠 CORE LOGIC MODULE / 核心逻辑模块
    // ==========================================
    const CoreLogic = {
        defaultHeaders: {},

        async start(isFastMode, selectedChannels) {
            SCRIPT_SETTINGS.isFastMode = isFastMode;
            RUNTIME_STATE.reset();
            RUNTIME_STATE.isRunning = true;

            const modeText = isFastMode ? UserInterface.getText('FAST_MODE_START') : UserInterface.getText('FULL_MODE_START');
            UserInterface.log('info', UserInterface.getText('SCRIPT_START', modeText));
            UserInterface.log('info', UserInterface.getText('SELECTED_CHANNELS', selectedChannels.map(c => c.name).join(', ')));

            try {
                this.initializeAuthentication();
            } catch (e) {
                RUNTIME_STATE.isRunning = false;
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
            if (!csrfToken) {
                throw new Error("Auth failed.");
            }

            this.defaultHeaders = {
                "x-csrftoken": csrfToken,
                "x-requested-with": "XMLHttpRequest",
                "accept": "application/json",
                "content-type": "application/x-www-form-urlencoded"
            };
        },

        async processChannelPages(channel) {
            let nextCursor = null;
            let emptyPagesCount = 0;
            let pageNum = 1;

            const baseUrl = `https://www.fab.com/i/listings/search?channels=${channel.urlParam}&is_free=${channel.isFree ? 1 : 0}&sort_by=-createdAt`;

            do {
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
                const pendingItems = items.filter(item => ownershipStatus[item.uid] === false);

                RUNTIME_STATE.totalScanned += items.length;
                RUNTIME_STATE.skippedOwned += (items.length - pendingItems.length);
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

                const freeLicense = details.licenses.find(l => l.priceTier?.price === 0 && l.slug === 'professional') ||
                                    details.licenses.find(l => l.priceTier?.price === 0) ||
                                    details.licenses.find(l => l.discount?.amount === l.price);

                if (!freeLicense) {
                    UserInterface.log('warn', UserInterface.getText('CLAIM_NO_LICENSE', item.title));
                    return;
                }

                const formData = new FormData();
                formData.append('offer_id', freeLicense.offerId);

                const claimHeaders = {
                    "x-csrftoken": this.defaultHeaders["x-csrftoken"],
                    "x-requested-with": "XMLHttpRequest",
                    "accept": "application/json"
                };

                const res = await fetch(`https://www.fab.com/i/listings/${item.uid}/add-to-library`, {
                    method: 'POST',
                    headers: claimHeaders,
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
                const url = `https://www.fab.com/i/users/me/listings-states?${query}`;

                const data = await this.fetchWithRetry(url);

                return Array.isArray(data) ? data.reduce((acc, item) => ({ ...acc, [item.uid]: item.acquired }), {}) : {};
            } catch (e) {
                UserInterface.log('error', UserInterface.getText('OWNERSHIP_ERROR'));
                return {};
            }
        },

        async fetchWithRetry(url, options = {}, retries = SCRIPT_SETTINGS.retry.limit) {
            options.headers = { ...this.defaultHeaders, ...options.headers };

            for (let i = 0; i < retries; i++) {
                try {
                    const res = await fetch(url, options);

                    if (res.status === 401) throw new Error("Unauthorized (401) - Auth failed.");

                    if (res.status === 429) {
                        const waitTime = (i + 1) * 5000;
                        UserInterface.log('warn', UserInterface.getText('RATE_LIMIT', waitTime/1000));
                        await this.sleep(waitTime);
                        continue;
                    }

                    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

                    return await res.json();
                } catch (e) {
                    if (i === retries - 1) {
                        UserInterface.log('error', `Final request failed: ${url} (${e.message})`);
                        return null;
                    }
                    await this.sleep(SCRIPT_SETTINGS.retry.delayMs);
                }
            }
            return null;
        },

        getCookie(name) {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? match[2] : null;
        },

        sleep(ms) { return new Promise(r => setTimeout(r, ms)); },

        randomDelay() {
            const { min, max } = SCRIPT_SETTINGS.requestDelay;
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    };

    // 🚀 SCRIPT ENTRY POINT / 脚本启动点
    UserInterface.init();

})();

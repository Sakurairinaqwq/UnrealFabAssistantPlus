// ==UserScript==
// @name         UnrealFabAssistantPlus
// @namespace    https://github.com/Sakurairinaqwq/UnrealFabAssistantPlus
// @version      v1.2.0
// @description  Fab.com Free Asset Auto-Claim Helper Plus (No-Flicker Animation) - Quixel Fix
// @author       Sakurairinaqwq (It is an iteration based on https://github.com/RyensX/UnrealFabAssistant Thanks to https://github.com/RyensX)
// @match        https://www.fab.com/*
// @grant        none
// @license      GPL-3.0
// @icon         https://www.fab.com/favicon.ico
// ==/UserScript==

(function () {
    'use strict';

    console.log("[UnrealFabAssistantPlus] v1.2.0 Initializing...");

    // ==========================================
    // Localization Configuration
    // ==========================================
    const LANGUAGE_PACKS = {
        'en-US': {
            TITLE: '⚡ Fab Assistant',
            MINIMIZE: 'Min',
            CLOSE: 'Close',
            SCANNED: 'Scanned',
            SUCCESS: 'Claimed',
            FAILED: 'Failed',
            SKIPPED: 'Owned',
            SCANNING_CHANNELS: 'Targets',
            FILTER_SETTINGS: 'Preferences',
            ENABLE_RATING_FILTER: 'Rating Filter',
            MIN_RATING_LABEL: 'Min Score',
            VISUAL_FILTER_LABEL: 'Hide Owned (Visual)',
            SELECT_ALL_INVERT: 'Toggle All',
            FAST_MODE_START: '🚀 Fast Scan',
            FAST_MODE_DETAIL: 'New Items Only',
            FULL_MODE_START: '🐢 Deep Scan',
            FULL_MODE_DETAIL: 'Check Everything',
            ALERT_NO_CHANNEL: 'Please select at least one channel!',
            AUTH_TITLE: 'Session Expired',
            AUTH_MSG: 'Logged in? Check again?',
            AUTH_RELOAD: 'Reload Page',
            SCRIPT_START: (mode) => `System ready | Mode: ${mode}`,
            PROCESSING_CATEGORY: (name) => `\n📂 Category: ${name}`,
            PAGE_SCANNING: (channel, page, items) => `📄 ${channel} [Page ${page}] Found ${items} items...`,
            PAGE_FULLY_OWNED: (count) => `   ↳ Page cleared (Streak: ${count})`,
            ITEMS_FOUND: (count) => `   ↳ New assets detected: ${count}`,
            FAST_MODE_LIMIT: '⏸️ Fast Mode limit reached.',
            RATING_SKIPPED: (title, score, count) => `   ⚠️ Low Rating: ${title} [${score}⭐]`,
            CLAIM_SUCCESS: (title) => `   ✅ Added: ${title}`,
            CLAIM_FAILED: (status, title) => `   ❌ Error (${status}): ${title}`,
            ALL_FINISHED: (count) => `\n🎉 Finished! Total Claimed: ${count}`,
            RELOAD_PROMPT: 'Done. Please refresh.',
            DEBUG_URL: (url) => `   🔧 API URL: ${url}`
        },
        'zh-CN': {
            TITLE: '⚡ FAB 助手 Pro',
            MINIMIZE: '最小化',
            CLOSE: '关闭',
            SCANNED: '已扫描',
            SUCCESS: '已入库',
            FAILED: '失败',
            SKIPPED: '已拥有',
            SCANNING_CHANNELS: '目标渠道',
            FILTER_SETTINGS: '偏好设置',
            ENABLE_RATING_FILTER: '评分过滤',
            MIN_RATING_LABEL: '最低分',
            VISUAL_FILTER_LABEL: '视觉隐藏已拥有',
            SELECT_ALL_INVERT: '全选 / 反选',
            FAST_MODE_START: '🚀 极速领取',
            FAST_MODE_DETAIL: '仅检查新品 (推荐)',
            FULL_MODE_START: '🐢 深度扫描',
            FULL_MODE_DETAIL: '全站地毯式检查',
            ALERT_NO_CHANNEL: '请至少选择一个渠道！',
            AUTH_TITLE: '⚠️ 登录失效',
            AUTH_MSG: '请检查登录状态',
            AUTH_RELOAD: '刷新重试',
            SCRIPT_START: (mode) => `系统就绪 | 模式：${mode}`,
            PROCESSING_CATEGORY: (name) => `\n📂 正在处理：${name}`,
            PAGE_SCANNING: (channel, page, items) => `📄 ${channel} [第 ${page} 页] 扫描 ${items} 个物品...`,
            PAGE_FULLY_OWNED: (count) => `   ↳ 本页无新物品（连续空页：${count}）`,
            ITEMS_FOUND: (count) => `   ↳ 发现 ${count} 个新资产！`,
            FAST_MODE_LIMIT: '⏸️ 触发上限，停止当前分类',
            RATING_SKIPPED: (title, score, count) => `   ⚠️ 低分跳过: ${title} [${score}分]`,
            CLAIM_SUCCESS: (title) => `   ✅ 成功入库：${title}`,
            CLAIM_FAILED: (status, title) => `   ❌ 失败 (${status})：${title}`,
            ALL_FINISHED: (count) => `\n🎉 任务完成！本次入库：${count} 个`,
            RELOAD_PROMPT: '运行结束！建议刷新页面。',
            DEBUG_URL: (url) => `   🔧 调试链接: ${url}`
        }
    };

    const wrapLogText = (lang, key, ...args) => {
         const pack = LANGUAGE_PACKS[lang] || LANGUAGE_PACKS['en-US'];
         const val = pack[key] || LANGUAGE_PACKS['en-US'][key];
         return typeof val === 'function' ? val(...args) : val;
    };

    let CURRENT_LANG = 'en-US';

    // ==========================================
    // Global Settings
    // ==========================================
    const SCRIPT_SETTINGS = {
        isFastMode: true,
        maxEmptyPagesLimit: 3,
        enableRatingFilter: false,
        minRating: 3.5,
        requestDelay: { min: 1200, max: 3000 },
        retry: { limit: 3, delayMs: 2000 }
    };

    // FIXED: Changed Quixel to use 'search' type to avoid 0 results issue
    const CHANNEL_LIST = [
        { name: 'Unreal Engine', urlParam: 'unreal-engine', type: 'channel', isFree: true, isDefaultChecked: true },
        { name: 'Quixel Megascans', urlParam: 'Quixel Megascans', type: 'search', isFree: true, isDefaultChecked: true }, // Changed type to 'search'
        { name: 'Unity', urlParam: 'unity', type: 'channel', isFree: true, isDefaultChecked: true },
        { name: 'UEFN', urlParam: 'uefn', type: 'channel', isFree: true, isDefaultChecked: true },
        { name: 'MetaHuman', urlParam: 'metahuman', type: 'channel', isFree: true, isDefaultChecked: false }
    ];

    // ==========================================
    // Runtime State
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
    // Visual Filter
    // ==========================================
    const VisualFilter = {
        isEnabled: false,
        observer: null,
        debounceTimer: null,
        keywords: ['已保存在我的库中', '已拥有', 'OWNED', 'IN LIBRARY', 'PURCHASED'],

        init() {
            this.observer = new MutationObserver(() => {
                if (!this.isEnabled) return;
                if (this.debounceTimer) clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => this.process(), 150);
            });
            this.observer.observe(document.body, { childList: true, subtree: true });
        },

        toggle(enable) {
            this.isEnabled = enable;
            if (enable) this.process();
            else this.restore();
        },

        process() {
            const potentialBadges = [
                ...document.querySelectorAll('.fabkit-Typography--intent-success'),
                ...document.querySelectorAll('.edsicon-check-circle-filled')
            ];

            const textDivs = document.querySelectorAll('div[class*="fabkit-Typography"]');
            textDivs.forEach(div => {
                 if(div.offsetParent === null) return;
                 const text = (div.innerText || "").replace(/\s/g, '');
                 if (this.keywords.some(kw => text.includes(kw))) potentialBadges.push(div);
            });

            potentialBadges.forEach(el => this.hideRealCard(el));
        },

        hideRealCard(targetElement) {
            let current = targetElement.parentElement;
            let levels = 0;
            while (current && levels < 12) {
                const hasImage = current.querySelector('img');
                const hasLink = current.querySelector('a[href*="/listings/"]');
                if ((hasImage && hasLink) || current.tagName === 'LI') {
                    if (current.style.display !== 'none') {
                        current.dataset.fabHelperHidden = "true";
                        current.style.display = 'none';
                    }
                    return;
                }
                current = current.parentElement;
                levels++;
            }
        },

        restore() {
            document.querySelectorAll('[data-fab-helper-hidden="true"]').forEach(card => {
                card.style.display = '';
                delete card.dataset.fabHelperHidden;
            });
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
            return wrapLogText(CURRENT_LANG, key, ...args);
        },

        async init() {
            this.injectStyles();
            const selectedLang = await LanguageSelector.show();
            CURRENT_LANG = selectedLang;
            this.renderInterface();
        },

        injectStyles() {
            const css = `
                :root {
                    --fh-bg: rgba(20, 22, 28, 0.92);
                    --fh-border: rgba(255, 255, 255, 0.08);
                    --fh-accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    --fh-success-text: #69f0ae;
                    --fh-card-bg: rgba(255, 255, 255, 0.04);
                    --fh-card-hover: rgba(255, 255, 255, 0.08);
                    --fh-font: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    --fh-width: 420px;
                }

                @keyframes fh-pop-in {
                    0% { opacity: 0; transform: scale(0.9) translateY(20px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }

                @keyframes fh-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(79, 172, 254, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(79, 172, 254, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(79, 172, 254, 0); }
                }

                #fab-helper-root {
                    font-family: var(--fh-font);
                    position: fixed;
                    bottom: 40px;
                    right: 40px;
                    width: var(--fh-width);
                    height: auto;
                    max-height: 80vh;
                    background: var(--fh-bg);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid var(--fh-border);
                    border-radius: 24px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                    z-index: 2147483647;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: fh-pop-in 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards;
                    color: #fff;
                    will-change: width, height, border-radius;
                    transition:
                        width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                        height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                        border-radius 0.4s ease,
                        background 0.4s;
                }

                #fab-helper-root.minimized {
                    width: 60px !important;
                    height: 60px !important;
                    min-height: 0 !important;
                    border-radius: 50%;
                    cursor: pointer;
                    background: var(--fh-accent-gradient);
                    border-color: transparent;
                }

                .fh-content-wrapper, .fh-header {
                    width: var(--fh-width);
                    min-width: var(--fh-width);
                    transition: opacity 0.2s ease, visibility 0.2s;
                    opacity: 1;
                    visibility: visible;
                }

                #fab-helper-root.minimized .fh-content-wrapper,
                #fab-helper-root.minimized .fh-header {
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                }

                #fab-helper-root::after {
                    content: '⚡';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    font-size: 24px;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    pointer-events: none;
                }

                #fab-helper-root.minimized::after {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                    animation: fh-pulse 2s infinite 0.5s;
                }

                .fh-header {
                    padding: 18px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--fh-border);
                    background: rgba(255,255,255,0.02);
                    box-sizing: border-box;
                }

                .fh-title {
                    font-weight: 700;
                    font-size: 16px;
                    background: var(--fh-accent-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                }

                .fh-window-ctrls button {
                    background: transparent;
                    border: none;
                    color: rgba(255,255,255,0.4);
                    cursor: pointer;
                    padding: 4px;
                    margin-left: 8px;
                    transition: 0.2s;
                    border-radius: 4px;
                }
                .fh-window-ctrls button:hover { color: #fff; background: rgba(255,255,255,0.1); }

                .fh-content-wrapper {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                    box-sizing: border-box;
                }

                .fh-dashboard {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    padding: 20px 24px 10px;
                }

                .fh-stat {
                    background: var(--fh-card-bg);
                    border-radius: 12px;
                    padding: 10px 5px;
                    text-align: center;
                    transition: 0.2s;
                    border: 1px solid transparent;
                }
                .fh-stat:hover { background: var(--fh-card-hover); transform: translateY(-2px); border-color: rgba(255,255,255,0.1); }
                .fh-stat-num { display: block; font-size: 20px; font-weight: 800; margin-bottom: 4px; }
                .fh-stat-label { font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.5); font-weight: 600; }

                .fh-settings-area { padding: 10px 24px 20px; flex-shrink: 0; }
                .fh-section-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3); margin: 15px 0 8px; text-transform: uppercase; letter-spacing: 1px; }

                .fh-channel-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
                .fh-channel-card {
                    background: var(--fh-card-bg);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 8px;
                    padding: 10px 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: 0.2s;
                    font-size: 13px;
                    user-select: none;
                }
                .fh-channel-card:hover { background: var(--fh-card-hover); }
                .fh-channel-card input { accent-color: #4facfe; transform: scale(1.1); }

                .fh-row {
                    display: flex; justify-content: space-between; align-items: center;
                    background: var(--fh-card-bg); padding: 12px; border-radius: 10px; margin-bottom: 8px;
                }
                .fh-row label { display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer; }
                .fh-input-sm {
                    background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2);
                    color: white; border-radius: 6px; padding: 4px 8px; width: 50px; text-align: center;
                }

                .fh-actions { display: flex; gap: 12px; margin-top: 15px; }
                .fh-btn {
                    flex: 1; padding: 14px; border-radius: 12px; border: none; font-weight: 700; color: white; cursor: pointer;
                    position: relative; overflow: hidden; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; line-height: 1.2;
                }
                .fh-btn span { font-size: 14px; }
                .fh-btn small { font-size: 10px; opacity: 0.8; font-weight: 500; }
                .fh-btn:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
                .fh-btn:active { transform: scale(0.98); }
                .btn-fast { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3); }
                .btn-full { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3); }
                .btn-text { background: transparent; color: rgba(255,255,255,0.5); width: 100%; padding: 6px; font-size: 11px; border: none; cursor: pointer; }
                .btn-text:hover { color: #fff; text-decoration: underline; }

                .fh-logs {
                    flex: 1; min-height: 120px; overflow-y: auto; padding: 0 24px;
                    font-family: 'Consolas', monospace; font-size: 12px; color: rgba(255,255,255,0.7);
                    border-top: 1px solid var(--fh-border); background: rgba(0,0,0,0.1);
                }
                .fh-log-entry { padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }

                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px); z-index: 999999; display: flex; justify-content: center; align-items: center; }
                .modal-box { background: #1e2025; padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); text-align: center; color: white; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .modal-btn { margin: 10px; padding: 10px 20px; border-radius: 8px; border:none; cursor: pointer; font-weight: bold; background: #333; color: white; }
                .modal-btn:hover { background: #4facfe; }
            `;
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        },

        renderInterface() {
            this.rootElement = document.createElement('div');
            this.rootElement.id = 'fab-helper-root';

            const channelHTML = CHANNEL_LIST.map(c => `
                <label class="fh-channel-card">
                    <input type="checkbox" data-url="${c.urlParam}" ${c.isDefaultChecked ? 'checked' : ''}>
                    <span>${c.name}</span>
                </label>
            `).join('');

            this.rootElement.innerHTML = `
                <div class="fh-header">
                    <div class="fh-title">${this.getText('TITLE')}</div>
                    <div class="fh-window-ctrls">
                        <button id="fh-min-btn">－</button>
                        <button id="fh-close-btn">✕</button>
                    </div>
                </div>

                <div class="fh-content-wrapper">
                    <div class="fh-dashboard">
                        <div class="fh-stat">
                            <span class="fh-stat-num" id="stat-scanned">0</span>
                            <span class="fh-stat-label">${this.getText('SCANNED')}</span>
                        </div>
                        <div class="fh-stat">
                            <span class="fh-stat-num" style="color:var(--fh-success-text)" id="stat-success">0</span>
                            <span class="fh-stat-label">${this.getText('SUCCESS')}</span>
                        </div>
                        <div class="fh-stat">
                            <span class="fh-stat-num" style="color:#ff6b6b" id="stat-failed">0</span>
                            <span class="fh-stat-label">${this.getText('FAILED')}</span>
                        </div>
                        <div class="fh-stat">
                            <span class="fh-stat-num" style="color:#ffd166" id="stat-skipped">0</span>
                            <span class="fh-stat-label">${this.getText('SKIPPED')}</span>
                        </div>
                    </div>

                    <div class="fh-logs" id="fh-logs">
                        <div class="fh-log-entry" style="color:#888; text-align:center; padding-top:20px;">
                            --- Ready to start ---
                        </div>
                    </div>

                    <div class="fh-settings-area">
                        <div class="fh-section-label">${this.getText('SCANNING_CHANNELS')}</div>
                        <div class="fh-channel-grid">
                            ${channelHTML}
                        </div>
                        <button class="btn-text" id="btn-select-all">${this.getText('SELECT_ALL_INVERT')}</button>

                        <div class="fh-section-label">${this.getText('FILTER_SETTINGS')}</div>

                        <div class="fh-row">
                            <label>
                                <input type="checkbox" id="setting-visual-hide-owned">
                                ${this.getText('VISUAL_FILTER_LABEL')}
                            </label>
                        </div>

                        <div class="fh-row">
                            <label>
                                <input type="checkbox" id="setting-rating-enable">
                                ${this.getText('ENABLE_RATING_FILTER')}
                            </label>
                            <input type="number" id="setting-rating-val" class="fh-input-sm" value="3.5" step="0.1" min="0" max="5">
                        </div>

                        <div class="fh-actions">
                            <button class="fh-btn btn-fast" id="btn-fast">
                                <span>${this.getText('FAST_MODE_START')}</span>
                                <small>${this.getText('FAST_MODE_DETAIL')}</small>
                            </button>
                            <button class="fh-btn btn-full" id="btn-full">
                                <span>${this.getText('FULL_MODE_START')}</span>
                                <small>${this.getText('FULL_MODE_DETAIL')}</small>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            if (document.body) {
                document.body.appendChild(this.rootElement);
            } else {
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
            if (!els) return;

            const toggleMin = () => {
                this.isWindowMinimized = !this.isWindowMinimized;
                els.classList.toggle('minimized', this.isWindowMinimized);
            };

            els.onclick = (e) => {
                if (this.isWindowMinimized) {
                    toggleMin(); e.stopPropagation();
                }
            };

            els.querySelector('#fh-min-btn').onclick = (e) => { e.stopPropagation(); toggleMin(); };
            els.querySelector('#fh-close-btn').onclick = (e) => { e.stopPropagation(); if (confirm("Close Helper?")) els.remove(); };

            els.querySelector('#btn-fast').onclick = () => this.prepareAndStart(true);
            els.querySelector('#btn-full').onclick = () => this.prepareAndStart(false);

            els.querySelector('#btn-select-all').onclick = () => {
                const boxes = els.querySelectorAll('.fh-channel-grid input');
                const state = !boxes[0].checked;
                boxes.forEach(b => b.checked = state);
            };

            const ratingCheck = els.querySelector('#setting-rating-enable');
            const ratingVal = els.querySelector('#setting-rating-val');
            const updateRatingUI = () => { ratingVal.style.opacity = ratingCheck.checked ? '1' : '0.3'; };
            ratingCheck.onchange = updateRatingUI;
            updateRatingUI();

            els.querySelector('#setting-visual-hide-owned').onchange = (e) => {
                VisualFilter.toggle(e.target.checked);
            };
        },

        prepareAndStart(isFastMode) {
            const selectedChannels = [];
            this.rootElement.querySelectorAll('.fh-channel-grid input:checked').forEach(cb => {
                const channel = CHANNEL_LIST.find(c => c.urlParam === cb.dataset.url);
                if (channel) selectedChannels.push(channel);
            });

            if (selectedChannels.length === 0) {
                alert(this.getText('ALERT_NO_CHANNEL'));
                return;
            }

            SCRIPT_SETTINGS.enableRatingFilter = this.rootElement.querySelector('#setting-rating-enable').checked;
            SCRIPT_SETTINGS.minRating = parseFloat(this.rootElement.querySelector('#setting-rating-val').value) || 3.5;

            this.logContainer.innerHTML = '';

            CoreLogic.start(isFastMode, selectedChannels).finally(() => {
                this.log('info', this.getText('RELOAD_PROMPT'));
            });
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
            const entry = document.createElement('div');
            entry.className = 'fh-log-entry';

            let color = '#ccc';
            let icon = '•';
            switch (type) {
                case 'success': color = '#69f0ae'; icon = '✓'; break;
                case 'warn':    color = '#ffd166'; icon = '!'; break;
                case 'error':   color = '#ff6b6b'; icon = 'x'; break;
                case 'info':    color = '#4facfe'; icon = 'i'; break;
            }

            const time = new Date().toLocaleTimeString([], { hour12: false });
            entry.innerHTML = `<span style="color:#555;margin-right:8px">[${time}]</span><span style="color:${color}">${icon} ${message}</span>`;
            if (detail) entry.innerHTML += ` <span style="color:#777">(${detail})</span>`;

            this.logContainer.appendChild(entry);
            this.logContainer.scrollTop = this.logContainer.scrollHeight;
        }
    };

    const CoreLogic = {
        defaultHeaders: {},
        async start(isFastMode, selectedChannels) {
            SCRIPT_SETTINGS.isFastMode = isFastMode;
            RUNTIME_STATE.reset();
            RUNTIME_STATE.isRunning = true;
            const modeText = isFastMode ? UserInterface.getText('FAST_MODE_START') : UserInterface.getText('FULL_MODE_START');
            UserInterface.log('info', UserInterface.getText('SCRIPT_START', modeText));
            try { this.initializeAuthentication(); } catch (e) { RUNTIME_STATE.isRunning = false; UserInterface.showAuthModal(); return; }
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
            this.defaultHeaders = { "x-csrftoken": csrfToken, "x-requested-with": "XMLHttpRequest", "accept": "application/json", "content-type": "application/x-www-form-urlencoded" };
        },
        async processChannelPages(channel) {
            let nextCursor = null;
            let pageNum = 1;
            let emptyPagesCount = 0;

            // FIXED: Logic to handle search query vs channels to ensure results
            let baseUrl = `https://www.fab.com/i/listings/search?is_free=${channel.isFree ? 1 : 0}&sort_by=-createdAt`;
            if (channel.type === 'search') {
                 // Using 'q' is much more reliable than 'seller' which needs UUIDs sometimes
                 baseUrl += `&q=${encodeURIComponent(channel.urlParam)}`;
            } else {
                 baseUrl += `&channels=${channel.urlParam}`;
            }

            do {
                if (!RUNTIME_STATE.isRunning) break;
                const url = `${baseUrl}${nextCursor ? `&cursor=${nextCursor}` : ''}`;
                // DEBUG: Log the URL to console (hidden from UI but visible in F12)
                console.log(`[UnrealFabAssistantPlus] Fetching: ${url}`);

                const data = await this.fetchWithRetry(url);
                if (!data || !data.results) {
                    UserInterface.log('error', UserInterface.getText('PAGE_FAILED', channel.name));
                    UserInterface.log('info', UserInterface.getText('DEBUG_URL', url));
                    break;
                }

                nextCursor = data.cursors?.next;
                const items = data.results;

                if (items.length === 0) {
                     // If first page is empty, it means search failed
                     if (pageNum === 1) {
                         UserInterface.log('warn', `Found 0 items. Check channel/search config.`);
                         UserInterface.log('info', UserInterface.getText('DEBUG_URL', url));
                     }
                     break;
                }

                UserInterface.log('log', UserInterface.getText('PAGE_SCANNING', channel.name, pageNum, items.length));
                const uids = items.map(i => i.uid);
                const ownershipStatus = await this.checkOwnership(uids);
                let pendingItems = items.filter(item => ownershipStatus[item.uid] !== true);
                RUNTIME_STATE.totalScanned += items.length;
                RUNTIME_STATE.skippedOwned += (items.length - pendingItems.length);
                if (SCRIPT_SETTINGS.enableRatingFilter && pendingItems.length > 0) {
                     pendingItems = pendingItems.filter(item => {
                         const rating = item.average_rating || item.averageRating || item.ratingScore;
                         const count = item.review_count || item.reviewCount || 0;
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
                if (SCRIPT_SETTINGS.isFastMode && emptyPagesCount >= SCRIPT_SETTINGS.maxEmptyPagesLimit) { UserInterface.log('warn', UserInterface.getText('FAST_MODE_LIMIT')); break; }
                pageNum++;
                await this.sleep(1000);
            } while (nextCursor && RUNTIME_STATE.isRunning);
        },
        async claimItem(item) {
            try {
                const details = await this.fetchWithRetry(`https://www.fab.com/i/listings/${item.uid}`);
                if (!details || !details.licenses) { UserInterface.log('warn', UserInterface.getText('CLAIM_FETCH_DETAIL_FAIL', item.title)); return; }
                if (SCRIPT_SETTINGS.enableRatingFilter) {
                    const rating = details.averageRating || details.average_rating || 0;
                    const count = details.reviewCount || details.review_count || 0;
                    if (count > 0 && rating < SCRIPT_SETTINGS.minRating) { UserInterface.log('warn', UserInterface.getText('RATING_SKIPPED', item.title, rating.toFixed(1), count)); return; }
                }
                const freeLicense = details.licenses.find(l => l.priceTier?.price === 0) || details.licenses.find(l => l.discount?.amount === l.price);
                if (!freeLicense) { UserInterface.log('warn', UserInterface.getText('CLAIM_NO_LICENSE', item.title)); return; }
                const params = new URLSearchParams();
                params.append('offer_id', freeLicense.offerId);
                const res = await fetch(`https://www.fab.com/i/listings/${item.uid}/add-to-library`, {
                    method: 'POST',
                    headers: { ...this.defaultHeaders, "accept": "application/json" },
                    body: params
                });
                if (res.status === 204 || res.status === 200) { UserInterface.log('success', UserInterface.getText('CLAIM_SUCCESS', item.title)); RUNTIME_STATE.successClaimed++; }
                else { UserInterface.log('error', UserInterface.getText('CLAIM_FAILED', res.status, item.title)); RUNTIME_STATE.failedClaims++; }
            } catch (e) { UserInterface.log('error', UserInterface.getText('CLAIM_EXCEPTION', item.title, e.message || e)); RUNTIME_STATE.failedClaims++; }
            finally { UserInterface.updateDashboard(); }
        },
        async checkOwnership(uids) {
            if (!uids.length) return {};
            try {
                const query = uids.map(id => `listing_ids=${id}`).join('&');
                const data = await this.fetchWithRetry(`https://www.fab.com/i/users/me/listings-states?${query}`);
                return Array.isArray(data) ? data.reduce((acc, item) => ({ ...acc, [item.uid]: item.acquired }), {}) : {};
            } catch (e) { return {}; }
        },
        async fetchWithRetry(url, options = {}, retries = SCRIPT_SETTINGS.retry.limit) {
            options.headers = { ...this.defaultHeaders, ...options.headers };
            for (let i = 0; i < retries; i++) {
                try {
                    const res = await fetch(url, options);
                    if (res.status === 401) { RUNTIME_STATE.isRunning = false; UserInterface.showAuthModal(); throw new Error("Auth failed"); }
                    if (res.status === 429) { const w = (i + 1) * 5000; UserInterface.log('warn', UserInterface.getText('RATE_LIMIT', w/1000)); await this.sleep(w); continue; }
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return await res.json();
                } catch (e) { if (e.message.includes("Auth")) throw e; if (i === retries - 1) return null; await this.sleep(SCRIPT_SETTINGS.retry.delayMs); }
            }
            return null;
        },
        getCookie(name) { const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)')); return match ? match[2] : null; },
        sleep(ms) { return new Promise(r => setTimeout(r, ms)); },
        randomDelay() { const { min, max } = SCRIPT_SETTINGS.requestDelay; return Math.floor(Math.random() * (max - min + 1) + min); }
    };

    const LanguageSelector = {
        show() {
            return new Promise(resolve => {
                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay';
                overlay.innerHTML = `
                    <div class="modal-box">
                        <h3>Select Language / 选择语言</h3>
                        <div style="margin-top:20px;display:flex;gap:15px;">
                            <button class="modal-btn" data-lang="zh-CN">🇨🇳 简体中文</button>
                            <button class="modal-btn" data-lang="en-US">🇺🇸 English (US)</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(overlay);
                overlay.querySelectorAll('button').forEach(btn => {
                    btn.onclick = () => { const lang = btn.dataset.lang; overlay.remove(); resolve(lang); };
                });
            });
        }
    };

    VisualFilter.init();
    UserInterface.init();
})();

// ==UserScript==
// @name         网页图片大师 — 摸鱼神器 | 显隐切换 | 中心缩放 | 多图钉图 | 阅兵阵列 | 悬停预览 | 统计面板
// @version      100
// @description  优雅方块倒计时；防误触静止触发；滚轮缩放/拖动放大图；放大离开方式选项；钉图模式
// @author       fxalll
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-body
// @license      MIT
// @namespace    https://greasyfork.org/users/1043548
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ij48L2NpcmNsZT48cG9seWdvbiBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWdvbj48L3N2Zz4=
// @downloadURL https://update.greasyfork.org/scripts/496216/%E7%BD%91%E9%A1%B5%E5%9B%BE%E7%89%87%E5%A4%A7%E5%B8%88%20%E2%80%94%20%E6%91%B8%E9%B1%BC%E7%A5%9E%E5%99%A8%20%7C%20%E6%98%BE%E9%9A%90%E5%88%87%E6%8D%A2%20%7C%20%E4%B8%AD%E5%BF%83%E7%BC%A9%E6%94%BE%20%7C%20%E5%A4%9A%E5%9B%BE%E9%92%89%E5%9B%BE%20%7C%20%E9%98%85%E5%85%B5%E9%98%B5%E5%88%97%20%7C%20%E6%82%AC%E5%81%9C%E9%A2%84%E8%A7%88%20%7C%20%E7%BB%9F%E8%AE%A1%E9%9D%A2%E6%9D%BF.user.js
// @updateURL https://update.greasyfork.org/scripts/496216/%E7%BD%91%E9%A1%B5%E5%9B%BE%E7%89%87%E5%A4%A7%E5%B8%88%20%E2%80%94%20%E6%91%B8%E9%B1%BC%E7%A5%9E%E5%99%A8%20%7C%20%E6%98%BE%E9%9A%90%E5%88%87%E6%8D%A2%20%7C%20%E4%B8%AD%E5%BF%83%E7%BC%A9%E6%94%BE%20%7C%20%E5%A4%9A%E5%9B%BE%E9%92%89%E5%9B%BE%20%7C%20%E9%98%85%E5%85%B5%E9%98%B5%E5%88%97%20%7C%20%E6%82%AC%E5%81%9C%E9%A2%84%E8%A7%88%20%7C%20%E7%BB%9F%E8%AE%A1%E9%9D%A2%E6%9D%BF.meta.js
// ==/UserScript==

(function () {
  'use strict';

  // --- 1. 配置管理 ---
  const defaultConfig = {
    showOutline: true,
    hoverOnly: false,
    hoverShowImg: true,
    autoSnap: true,
    autoHideIdle: true,
    zoomMode: 'middle',
    zoomLeaveMode: 'button',
    zoomPinMode: false,
    displayTime: false,
    displaySeconds: false,
    displayCount: true,
    displayTotal: false,
    displayPercent: false,
    displayHost: false,
    displayMemory: false,
    displayLoadTime: false,
    displayResCount: false,
    displayMouseDistance: false,
    displayClickCount: false,
    displayScrollDist: false,
    displayReadChars: false,
    displayAdCount: false,
    statsRange: 'session',
    disableAnimation: false,
  };

  // 记录被永久隐藏的网站列表
  function getPermaHiddenSites() {
    const saved = localStorage.getItem('nopic_perma_hidden_sites');
    return saved ? JSON.parse(saved) : [];
  }
  function setPermaHiddenSites(list) {
    localStorage.setItem('nopic_perma_hidden_sites', JSON.stringify(list));
  }

  // 阅兵模式过滤配置（按网页独立记忆）
  function getParadeFilterConfig() {
    const key = 'nopic_parade_filter_' + location.host;
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    return { minW: 1, minH: 1, maxW: 9999, maxH: 9999, enabled: false };
  }
  function setParadeFilterConfig(cfg) {
    localStorage.setItem('nopic_parade_filter_' + location.host, JSON.stringify(cfg));
  }
  let paradeFilter = getParadeFilterConfig();

  function getLocalConfig(key) {
    const val = localStorage.getItem('nopic_local_' + key);
    return val !== null ? JSON.parse(val) : defaultConfig[key];
  }
  function setLocalConfig(key, value) {
    localStorage.setItem('nopic_local_' + key, JSON.stringify(value));
  }

  function getGlobalConfig(key) {
    const settings = GM_getValue('nopic_global_settings', {});
    return settings[key] !== undefined ? settings[key] : defaultConfig[key];
  }
  function setGlobalConfig(key, value) {
    const settings = GM_getValue('nopic_global_settings', {});
    settings[key] = value;
    GM_setValue('nopic_global_settings', settings);
  }

  let showOutlineConfig = getLocalConfig('showOutline');
  let hoverOnlyConfig = getLocalConfig('hoverOnly');
  let hoverShowImgConfig = getLocalConfig('hoverShowImg');
  let autoSnapConfig = getLocalConfig('autoSnap');
  let autoHideIdleConfig = getLocalConfig('autoHideIdle');
  let zoomModeConfig = getLocalConfig('zoomMode');
  let zoomLeaveModeConfig = getLocalConfig('zoomLeaveMode');
  let zoomPinModeConfig = getLocalConfig('zoomPinMode');
let disableAnimationConfig = getLocalConfig('disableAnimation');
  let statsRangeConfig = getGlobalConfig('statsRange');

  let configs = {
    time: getGlobalConfig('displayTime'),
    seconds: getGlobalConfig('displaySeconds'),
    count: getGlobalConfig('displayCount'),
    total: getGlobalConfig('displayTotal'),
    percent: getGlobalConfig('displayPercent'),
    host: getGlobalConfig('displayHost'),
    memory: getGlobalConfig('displayMemory'),
    loadTime: getGlobalConfig('displayLoadTime'),
    resCount: getGlobalConfig('displayResCount'),
    mouseDistance: getGlobalConfig('displayMouseDistance'),
    clickCount: getGlobalConfig('displayClickCount'),
    scrollDist: getGlobalConfig('displayScrollDist'),
    readChars: getGlobalConfig('displayReadChars'),
    adCount: getGlobalConfig('displayAdCount')
  };

  let isUISelfHidden = false;
  let isSleeping = false;
  let sleepTimer = null;
  let sleepBgTimer = null;
  let lastHiddenCount = -1;
  let glowTimer = null;

  // === 阅兵模式 ===
  let isParadeMode = false;
  let paradeOverlay = null;
  let paradeHeader = null;
  let paradeClones = new Map(); // el -> { clone, originalRect, targetPos }
  let paradeDragState = {
    isDragging: false,
    wasDragged: false,
    startX: 0,
    startY: 0,
    startScreenLeft: 0,
    startScreenTop: 0,
    currentEl: null
  };
  let paradeSavedBodyOverflow = '';
  let paradeSavedHtmlOverflow = '';
  let paradeZIndexCounter = 10;
  let paradeMenuItem = null;

  window.imgHidenSet = null;
  let imageControls = new Map();
  let imageOutlines = new Map();
  let imageZoomControls = new Map();

  let hoverZoomTimers = new Map();
  let imageTimers = new Map();
  let lastGlobalMouseX = 0,
    lastGlobalMouseY = 0;

  // 拖拽状态变量
  let isDraggingClone = false;
  let wasDragged = false;
  let dragStartX = 0,
    dragStartY = 0,
    dragStartLeft = 0,
    dragStartTop = 0;
  let draggedCloneEl = null; // 当前正在拖动的克隆图对应的原始元素

  // 钉图模式：记录每个放大元素的克隆信息
  let zoomedClones = new Map(); // el -> { clone, controls, wrapper }
  let pinZIndexCounter = 10;

  // --- 2. 样式定义 ---
  let spinnerTimer = null;
  const debounceTriggerSpinner = () => {
    clearTimeout(spinnerTimer);
    spinnerTimer = setTimeout(() => {
      triggerSpinner();
    }, 100);
  };

  const style = document.createElement('style');
  style.id = 'nopic-injected-styles';
  style.innerHTML = `
/* 图片隐藏效果 - 排除克隆体 */
img:not(.nopic-clone), svg:not(.nopic-clone), .nopic-has-bg:not(.nopic-clone) {
    transition: filter 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease !important;
}
.nopic-animation-disabled img:not(.nopic-clone),
.nopic-animation-disabled svg:not(.nopic-clone),
/* 禁用动画：所有图片元素（无论显示还是隐藏）都无过渡 */
.nopic-animation-disabled img:not(.nopic-clone),
.nopic-animation-disabled svg:not(.nopic-clone),
.nopic-animation-disabled .nopic-has-bg:not(.nopic-clone) {
    transition: none !important;
}
.nopic-hidden {
    filter: blur(25px) !important;
    opacity: 0 !important;
    pointer-events: none !important;
}
.nopic-animation-disabled .nopic-hidden {
    filter: blur(25px) !important;
    opacity: 0 !important;
}

        /* 跳出式放大容器 */
        #nopic-zoom-container {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            z-index: 2147483640; background: rgba(0, 0, 0, 0);
            pointer-events: none;
            transition: background 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #nopic-zoom-container.active { background: rgba(0, 0, 0, 0.6); pointer-events: auto; }

        /* 放大克隆图 */
        .nopic-clone {
            position: fixed !important;
            display: block !important; visibility: visible !important; opacity: 1 !important;
            filter: none !important; border-radius: 4px !important;
            background-color: #fff !important;
            outline: none !important;
            object-fit: contain !important;
            background-size: contain !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            margin: 0 !important; padding: 0 !important;
            z-index: 1;
            pointer-events: auto !important;
            transition: none !important;
            cursor: grab !important;
        }
        #nopic-zoom-container * { outline: none !important; }

        .nopic-zoom-controls {
            position: fixed; top: 20px; right: 20px;
            display: flex; gap: 10px; z-index: 2147483641;
            opacity: 0; transition: opacity 0.3s 0.15s;
        }
        #nopic-zoom-container.active .nopic-zoom-controls { opacity: 1; }

        .nopic-zoom-controls .nopic-float-btn {
            width: 40px !important; height: 40px !important;
            min-width: 40px !important; min-height: 40px !important;
            max-width: 40px !important; max-height: 40px !important;
            font-size: 16px !important;
            transform: none !important; scale: none !important;
            opacity: 1 !important; pointer-events: auto !important;
            background: rgba(255,255,255,0.2) !important; backdrop-filter: blur(10px) !important; color: #fff !important;
            border-radius: 6px !important; border: none !important;
            position: relative !important;
            display: flex !important; align-items: center !important; justify-content: center !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
            cursor: pointer !important; user-select: none !important;
        }
        .nopic-zoom-controls .nopic-float-btn:hover { background: rgba(255,255,255,0.4) !important; }

        /* 钉图模式下的关闭按钮（每张图独立） */
        .nopic-pin-close-btn {
            position: absolute !important;
            width: 24px !important; height: 24px !important;
            background: rgba(0,0,0,0.6) !important;
            backdrop-filter: blur(4px) !important;
            color: #fff !important;
            border-radius: 50% !important;
            display: flex !important; align-items: center !important; justify-content: center !important;
            font-size: 14px !important; cursor: pointer !important; z-index: 2147483642 !important;
            pointer-events: auto !important; opacity: 0; transition: opacity 0.2s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
            top: -10px; right: -10px;
        }
        .nopic-pin-close-btn:hover { background: rgba(255,50,50,0.8) !important; opacity: 1 !important; }
        .nopic-clone:hover + .nopic-pin-close-btn,
        .nopic-pin-close-btn:hover { opacity: 1 !important; }

        /* 虚线框 */
        .nopic-outline-box {
            position: absolute !important; z-index: 10; pointer-events: none; box-sizing: border-box;
            border-radius: 4px; transition: opacity 0.5s, background-position 0.5s; opacity: 0;
            background-image: linear-gradient(90deg, #919191 50%, transparent 50%), linear-gradient(90deg, #919191 50%, transparent 50%),
                              linear-gradient(0deg, #919191 50%, transparent 50%), linear-gradient(0deg, #919191 50%, transparent 50%);
            background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
            background-size: 15px 2px, 15px 2px, 2px 15px, 2px 15px; background-position: 0 0, 0 100%, 0 0, 100% 0;
        }
            .nopic-animation-disabled .nopic-outline-box {
    transition: none !important;
}
        .nopic-outline-active { opacity: 1 !important; background-position: 30px 0, -30px 100%, 0 -30px, 100% 30px !important; }

        /* 单个图片浮动按钮 */
        .nopic-float-btn {
            display: flex; align-items: center; justify-content: center; position: absolute !important; z-index: 11;
            background: #4f4f4f; color: #fff; cursor: pointer; border-radius: 6px; user-select: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); opacity: 0; transform: scale(0.7); pointer-events: none;
            transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s;
        }
        .nopic-float-btn:hover { background: #2f2f2f !important; }
        .nopic-btn-active { opacity: 1 !important; transform: scale(1) !important; pointer-events: auto !important; }

        /* 方块倒计时 */
        .nopic-countdown-box {
            position: fixed;
            width: 24px; height: 24px;
            border-radius: 4px;
            background: rgba(50, 50, 50, 0.45);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.25);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            pointer-events: none; z-index: 2147483638;
            opacity: 0; transform-origin: center center;
        }
        .nopic-countdown-box.counting {
            opacity: 1;
            animation: nopic-box-pulse 1s forwards;
        }
        @keyframes nopic-box-pulse {
            0% { transform: scale(1); opacity: 0.7; animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
            66% { transform: scale(0.8); opacity: 0.7; animation-timing-function: cubic-bezier(0.4, 0, 1, 1); }
            100% { transform: scale(1.5); opacity: 0; }
        }

        /* 主仪表盘 */
        #nopic-widget {
            position: fixed; z-index: 2147483647; cursor: grab; user-select: none;
            min-width: 42px; min-height: 28px; width: auto; padding: 6px 10px;
            border-radius: 14px;
            background: rgba(25, 25, 30, 0.72);
            backdrop-filter: blur(24px) saturate(180%);
            box-shadow: 0 4px 20px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.1);
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
            transition: left 0.4s cubic-bezier(0.2, 1, 0.3, 1), top 0.4s cubic-bezier(0.2, 1, 0.3, 1),
                opacity 0.3s, border-radius 0.4s, padding 0.3s, min-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.8s ease;
        }
        #nopic-widget.snap-left { border-radius: 0 14px 14px 0; }
        #nopic-widget.snap-right { border-radius: 14px 0 0 14px; }
        #nopic-widget.dragging { transition: none !important; cursor: grabbing; }
        #nopic-widget.sleeping { min-height: 20px !important; width: 20px !important; min-width: 20px !important; padding: 4px; }
        #nopic-widget.sleeping.transparent-bg { background: transparent !important; backdrop-filter: none !important; box-shadow: none !important; }
#nopic-widget.sleeping.snap-left {
    padding: 4px 4px 4px 0;
    left: 0 !important;
    right: auto !important;
}
#nopic-widget.sleeping.snap-right {
    padding: 4px 0 4px 4px;
    left: auto !important;
    right: 0 !important;
}
        #nopic-widget.sleeping #nopic-content { opacity: 0; height: 0; margin: 0; pointer-events: none; }

        #nopic-lamp {
            width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
            background: transparent !important; box-sizing: border-box; transition: none; align-self: center;
        }
        #nopic-lamp.on { border: 3.8px solid #4caf50; background: #4caf50; }
        #nopic-lamp.off { border: 3.8px solid #f44336; background: #f44336; }
        #nopic-lamp.spinning {
            border-width: 1.5px; border-style: solid; border-color: rgba(76, 175, 80, 0.2); border-top-color: #4caf50;
            opacity: 1 !important; animation: nopic-spinner-rotate 0.5s linear infinite;
        }
        #nopic-widget.sleeping #nopic-lamp { animation: nopic-sleep-breathe 6s 0s infinite ease-in-out; }
        #nopic-widget.sleeping #nopic-lamp.spinning { animation: nopic-spinner-rotate 0.5s linear infinite !important; }
        @keyframes nopic-spinner-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        #nopic-lamp.glowing { box-shadow: 0 0 8px 1px rgba(76, 175, 80, 0.6); transition: box-shadow 0.8s ease-out; }
        #nopic-widget.sleeping.snap-left #nopic-lamp { align-self: flex-end; margin-right: 3px; }
        #nopic-widget.sleeping.snap-right #nopic-lamp { align-self: flex-start; margin-left: 3px; }
        #nopic-widget.sleeping #nopic-lamp { width: 6px; height: 6px; opacity: 1; animation: nopic-sleep-breathe 6s 0s infinite ease-in-out; }
        @keyframes nopic-sleep-breathe { 0% { opacity: 1; } 50% { opacity: 1; } 100% { opacity: 1; } }

        #nopic-content {
            font-size: 11px; line-height: 1.4; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
            width: 100%; pointer-events: none; white-space: nowrap; height: auto; opacity: 1;
            transition: opacity 0.3s, height 0.3s; display: flex; flex-direction: column; gap: 1px;
        }
        .stat-row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .stat-label { color: rgba(255,255,255,0.7); text-align: left; margin-right: 8px; }
        .stat-value { color: rgba(255,255,255,0.95); text-align: right; font-weight: 500; }

        #nopic-menu {
            position: fixed; z-index: 2147483646; pointer-events: none; opacity: 0;
            transform: translateX(-10px) scale(0.95); transition: opacity 0.2s ease, transform 0.2s ease;
            background: rgba(30, 30, 35, 0.9); backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.15); border-radius: 12px;
            padding: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            display: flex; flex-direction: column; gap: 2px; min-width: 170px;
        }
        #nopic-menu.active { opacity: 1; pointer-events: auto; transform: translateX(0) scale(1); }
        .nopic-menu-item {
            display: flex; justify-content: space-between; align-items: center; padding: 6px 10px;
            border-radius: 6px; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.9);
            background: transparent; transition: background 0.2s; cursor: pointer;
        }
        .nopic-menu-item:hover { background: rgba(255,255,255,0.15); }
        .nopic-switch { width: 28px; height: 16px; border-radius: 8px; background: rgba(255,255,255,0.2); position: relative; transition: background 0.3s; flex-shrink: 0; }
        .nopic-switch.on { background: #3b82f6; }
        .nopic-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.2); transition: transform 0.2s ease; }
        .nopic-switch.on::after { transform: translateX(12px); }
        .nopic-submenu-trigger::after { content: '›'; font-size: 16px; margin-left: 8px; opacity: 0.7; }
        .nopic-menu-separator { font-size: 10px; color: rgba(255,255,255,0.4); padding: 4px 10px; margin-top: 4px; cursor: default; border-top: 1px solid rgba(255,255,255,0.1); }

        #nopic-submenu {
            position: absolute; display: none; left: 100%; top: -6px; margin-left: 4px;
            background: rgba(30, 30, 35, 0.95); backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            min-width: 170px; max-width: 220px; flex-direction: column; gap: 2px; z-index: 2147483647; max-height: 420px; overflow-y: auto; scrollbar-width: none;
        }
            #nopic-settings-submenu {
  position: absolute; display: none; top: 0;
  background: rgba(30, 30, 35, 0.95); backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  min-width: 170px; max-width: 220px; flex-direction: column; gap: 2px; z-index: 2147483647; max-height: 420px; overflow-y: auto; scrollbar-width: none;
}
#nopic-settings-submenu::-webkit-scrollbar { display: none; }

#nopic-display-submenu {
  position: absolute; display: none; top: 0;
  background: rgba(30, 30, 35, 0.95); backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  min-width: 170px; max-width: 220px; flex-direction: column; gap: 2px; z-index: 2147483647; max-height: 420px; overflow-y: auto; scrollbar-width: none;
}
#nopic-display-submenu::-webkit-scrollbar { display: none; }
#nopic-settings-submenu.left-side { left: auto; right: 100%; margin-left: 0; margin-right: 4px; }
#nopic-display-submenu {
  position: absolute; display: none; left: 100%; top: 0; margin-left: 4px;
  background: rgba(30, 30, 35, 0.95); backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  min-width: 170px; max-width: 220px; flex-direction: column; gap: 2px; z-index: 2147483647; max-height: 420px; overflow-y: auto; scrollbar-width: none;
}
#nopic-display-submenu::-webkit-scrollbar { display: none; }
#nopic-display-submenu.left-side { left: auto; right: 100%; margin-left: 0; margin-right: 4px; }
            #nopic-settings-submenu {
  position: absolute; display: none; left: 100%; top: -6px; margin-left: 4px;
  background: rgba(30, 30, 35, 0.95); backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  min-width: 170px; max-width: 220px; flex-direction: column; gap: 2px; z-index: 2147483647; max-height: 420px; overflow-y: auto; scrollbar-width: none;
}
#nopic-settings-submenu::-webkit-scrollbar { display: none; }
#nopic-settings-submenu.left-side { left: auto; right: 100%; margin-left: 0; margin-right: 4px; }

#nopic-display-submenu {
  position: absolute; display: none; left: 100%; top: -6px; margin-left: 4px;
  background: rgba(30, 30, 35, 0.95); backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  min-width: 170px; max-width: 220px; flex-direction: column; gap: 2px; z-index: 2147483647; max-height: 420px; overflow-y: auto; scrollbar-width: none;
}
#nopic-display-submenu::-webkit-scrollbar { display: none; }
#nopic-display-submenu.left-side { left: auto; right: 100%; margin-left: 0; margin-right: 4px; }
        #nopic-submenu::-webkit-scrollbar { display: none; }
        #nopic-submenu.left-side { left: auto; right: 100%; margin-left: 0; margin-right: 4px; }
        .nopic-submenu-item { display: flex; align-items: center; padding: 6px 8px; border-radius: 6px; cursor: pointer; font-size: 12px; color: rgba(255,255,255,0.8); transition: background 0.2s; }
        .nopic-submenu-item:hover { background: rgba(255,255,255,0.1); }
        .nopic-checkbox { width: 14px; height: 14px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); margin-right: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
        .nopic-checkbox.checked { background: #3b82f6; border-color: #3b82f6; }
        .nopic-checkbox svg { width: 10px; height: 10px; fill: none; stroke: white; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; opacity: 0; transition: opacity 0.2s; }
        .nopic-checkbox.checked svg { opacity: 1; }
        .nopic-hide-item { color: #f87171; font-size: 11px; text-align: center; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 4px; }

        .nopic-range-container { padding: 4px; margin-top: 4px; background: rgba(0,0,0,0.15); border-radius: 6px; margin-bottom: 2px; }
        .nopic-range-switcher { display: flex; justify-content: space-between; border-radius: 4px; overflow: hidden; }
        .nopic-range-btn { font-size: 10px; padding: 3px 4px; cursor: pointer; color: rgba(255,255,255,0.6); flex: 1; text-align: center; transition: background 0.2s; border-radius: 4px; }
        .nopic-range-btn:hover { background: rgba(255,255,255,0.05); }
        .nopic-range-btn.active { background: #3b82f6; color: white; }

        /* ===== 阅兵模式 ===== */
        /* 过滤面板 */
        .nopic-parade-size-label {
  position: absolute !important;
  bottom: -20px !important;  /* 从-18改成-20，再往下一点 */
  left: 0 !important;
  right: 0 !important;
  text-align: center !important;
  font-size: 10px !important;
  color: rgba(255,255,255,0.55) !important;  /* 稍微亮一点 */
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif !important;
  pointer-events: none !important;
  white-space: nowrap !important;
  z-index: 2 !important;
  line-height: 1 !important;
}
.nopic-parade-filter-panel {
  position: fixed; right: 20px; top: 64px;
  z-index: 2147483636;
  background: rgba(10, 10, 12, 0.85);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px; padding: 14px;
  color: rgba(255,255,255,0.9);
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  width: 180px;
  opacity: 0; pointer-events: none; transform: translateY(-8px);
  transition: opacity 0.25s, transform 0.25s;
}
.nopic-parade-filter-panel.active { opacity: 1; pointer-events: auto; transform: translateY(0); }
.nopic-parade-filter-panel .pf-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.nopic-parade-filter-panel .pf-row:last-child { margin-bottom: 0; margin-top: 10px; }
.nopic-parade-filter-panel label { color: rgba(255,255,255,0.6); font-size: 11px; }
.nopic-parade-filter-panel input {
  width: 58px; background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 4px;
  color: #fff; font-size: 12px; padding: 3px 6px; text-align: right;
}
.nopic-parade-filter-panel input:focus { outline: none; border-color: #60a5fa; }
.nopic-parade-filter-panel .pf-switch {
  width: 28px; height: 16px; border-radius: 8px;
  background: rgba(255,255,255,0.2); position: relative; cursor: pointer; transition: background 0.3s;
}
.nopic-parade-filter-panel .pf-switch.on { background: #3b82f6; }
.nopic-parade-filter-panel .pf-switch::after {
  content: ''; position: absolute; top: 2px; left: 2px;
  width: 12px; height: 12px; border-radius: 50%; background: white;
  transition: transform 0.2s;
}
.nopic-parade-filter-panel .pf-switch.on::after { transform: translateX(12px); }
.nopic-parade-filter-panel .pf-apply {
  width: 100%; padding: 5px 0; text-align: center;
  background: rgba(96,165,250,0.2); color: #60a5fa;
  border: 1px solid rgba(96,165,250,0.4); border-radius: 6px;
  cursor: pointer; font-size: 11px; transition: background 0.2s;
}
.nopic-parade-filter-panel .pf-apply:hover { background: rgba(96,165,250,0.35); }

/* 过滤按钮（放在 header 里） */
.nopic-parade-filter-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.1); border-radius: 8px;
  cursor: pointer; font-size: 14px; color: rgba(255,255,255,0.8);
  transition: background 0.2s, color 0.2s; margin-left: 8px;
}
.nopic-parade-filter-btn:hover { background: rgba(96,165,250,0.3); color: #fff; }
.nopic-parade-filter-btn.active { background: rgba(96,165,250,0.4); color: #60a5fa; }
#nopic-parade-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 2147483630;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  overflow-y: auto; overflow-x: hidden;
  opacity: 0; transition: opacity 0.4s ease;
}
#nopic-parade-overlay.active { opacity: 1; }
#nopic-parade-overlay::-webkit-scrollbar { width: 5px; }
#nopic-parade-overlay::-webkit-scrollbar-track { background: transparent; }
#nopic-parade-overlay::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 3px; }
.nopic-parade-content { position: relative; width: 100%; min-height: 100%; }
.nopic-parade-content * { outline: none !important; }

.nopic-parade-clone {
  position: absolute !important;
  display: block !important; visibility: visible !important; opacity: 1 !important;
  filter: none !important; border-radius: 6px !important;
  background-color: #18181b !important;
  outline: none !important; border: none !important;
  object-fit: contain !important;
  background-size: contain !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  margin: 0 !important; padding: 0 !important;
  z-index: 1;
  pointer-events: auto !important;
  transition: none !important;
  cursor: grab !important;
  box-sizing: border-box !important;
  max-width: none !important; max-height: none !important;
  min-width: 0 !important; min-height: 0 !important;
  transform: none !important;
}

#nopic-parade-header {
  position: fixed; top: 0; left: 0; right: 0;
  height: 48px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px;
  background: rgba(10, 10, 12, 0.72);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  color: rgba(255,255,255,0.9);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 13px; font-weight: 500; z-index: 2147483635;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  opacity: 0; transition: opacity 0.4s 0.15s ease;
  pointer-events: none;
}
#nopic-parade-header.active { opacity: 1; pointer-events: auto; }
.nopic-parade-title { letter-spacing: 0.3px; }
.nopic-parade-title strong { color: #60a5fa; font-weight: 600; }
.nopic-parade-close-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.1); border-radius: 8px;
  cursor: pointer; font-size: 16px; color: rgba(255,255,255,0.8);
  transition: background 0.2s, color 0.2s; pointer-events: auto;
}
.nopic-parade-close-btn:hover { background: rgba(239,68,68,0.55); color: #fff; }
/* 确认弹窗 */
#nopic-confirm-modal {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    z-index: 2147483647; pointer-events: none; opacity: 0;
    transition: opacity 0.25s ease;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0, 0, 0, 0.5);
}
#nopic-confirm-modal.active { pointer-events: auto; opacity: 1; }
.nopic-confirm-box {
    background: rgba(30, 30, 35, 0.95);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 14px; padding: 24px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    min-width: 280px; max-width: 340px;
    color: #fff; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    transform: scale(0.95); transition: transform 0.25s ease;
}
#nopic-confirm-modal.active .nopic-confirm-box { transform: scale(1); }
.nopic-confirm-title { font-size: 16px; font-weight: 600; margin-bottom: 10px; }
.nopic-confirm-text { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; margin-bottom: 20px; }
.nopic-confirm-btns { display: flex; gap: 10px; justify-content: flex-end; }
.nopic-confirm-btn {
    padding: 7px 16px; border-radius: 8px; font-size: 13px;
    cursor: pointer; border: none; font-weight: 500;
    transition: background 0.2s; user-select: none;
}
.nopic-confirm-btn.cancel { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
.nopic-confirm-btn.cancel:hover { background: rgba(255,255,255,0.2); }
.nopic-confirm-btn.danger { background: rgba(248,113,113,0.2); color: #f87171; border: 1px solid rgba(248,113,113,0.3); }
.nopic-confirm-btn.danger:hover { background: rgba(248,113,113,0.35); }
    `;
  document.head.appendChild(style);

  // --- 3. 跳出式放大核心逻辑 ---
  let zoomContainer = document.createElement('div');
  zoomContainer.id = 'nopic-zoom-container';
  document.documentElement.appendChild(zoomContainer);

  let zoomCooldown = false;

  function startCountdownIndicator(el) {
    removeCountdownIndicator(el, true);
    const outline = imageOutlines.get(el);
    if (outline) outline.style.display = 'none';

    let box = document.createElement('div');
    box.className = 'nopic-countdown-box';
    document.documentElement.appendChild(box);
    imageTimers.set(el, box);

    function updatePos(e) {
      if (!box.parentNode) return;
      box.style.left = e.clientX - 12 + 'px';
      box.style.top = e.clientY - 12 + 'px';
    }
    el._nopicMoveHandler = updatePos;
    document.addEventListener('mousemove', updatePos);
    updatePos({ clientX: lastGlobalMouseX, clientY: lastGlobalMouseY });

    requestAnimationFrame(() => {
      box.classList.add('counting');
    });
  }

  function removeCountdownIndicator(el, immediate) {
    const box = imageTimers.get(el);
    const outline = imageOutlines.get(el);
    if (outline) outline.style.display = '';
    if (el._nopicMoveHandler) {
      document.removeEventListener('mousemove', el._nopicMoveHandler);
      delete el._nopicMoveHandler;
    }
    if (box) {
      if (immediate) {
        box.remove();
      } else {
        box.style.opacity = '0';
        box.addEventListener('transitionend', function handler() {
          box.removeEventListener('transitionend', handler);
          if (box.parentNode) box.remove();
        });
        setTimeout(() => {
          if (box.parentNode) box.remove();
        }, 300);
      }
      imageTimers.delete(el);
    }
  }

  function startHoverZoomTimer(el) {
    if (document.querySelector('.nopic-clone') && !zoomPinModeConfig) return;
    cancelHoverZoomTimer(el, true);
    if (zoomCooldown || el._isZoomed) return;
    const isHidden = el.dataset.isHidden === 'true';
    const shouldZoom = hoverShowImgConfig || (!hoverShowImgConfig && !isHidden);
    if (!shouldZoom) return;

    const timerId = setTimeout(() => {
      hoverZoomTimers.delete(el);
      startCountdownIndicator(el);
      const animTimer = setTimeout(() => {
        removeCountdownIndicator(el, true);
        if (el.isHovering && !el._isZoomed && !zoomCooldown) {
          zoomIn(el, imageControls.get(el), imageZoomControls.get(el), true);
        }
        hoverZoomTimers.delete(el);
      }, 1000);
      hoverZoomTimers.set(el, animTimer);
    }, 1000);

    hoverZoomTimers.set(el, timerId);
  }

  function restartHoverZoomTimer(el) {
    if (document.querySelector('.nopic-clone') && !zoomPinModeConfig) return;
    if (zoomCooldown || el._isZoomed) return;
    const isHidden = el.dataset.isHidden === 'true';
    const shouldZoom = hoverShowImgConfig || (!hoverShowImgConfig && !isHidden);
    if (!shouldZoom) return;

    clearTimeout(hoverZoomTimers.get(el));

    const box = imageTimers.get(el);
    if (box) {
      box.classList.remove('counting');
      void box.offsetWidth;
      box.classList.add('counting');
    } else {
      startCountdownIndicator(el);
    }

    const animTimer = setTimeout(() => {
      removeCountdownIndicator(el, true);
      if (el.isHovering && !el._isZoomed && !zoomCooldown) {
        zoomIn(el, imageControls.get(el), imageZoomControls.get(el), true);
      }
      hoverZoomTimers.delete(el);
    }, 1000);
    hoverZoomTimers.set(el, animTimer);
  }

  function cancelHoverZoomTimer(el, immediate) {
    const timerId = hoverZoomTimers.get(el);
    if (timerId) {
      clearTimeout(timerId);
      hoverZoomTimers.delete(el);
    }
    removeCountdownIndicator(el, immediate || false);
  }

  function getCloneAtPoint(x, y) {
    const clones = Array.from(zoomContainer.querySelectorAll('.nopic-clone'));
    // 按 z-index 从高到低排序，确保先找到最上层的
    clones.sort((a, b) => {
      const za = parseInt(window.getComputedStyle(a).zIndex) || 0;
      const zb = parseInt(window.getComputedStyle(b).zIndex) || 0;
      return zb - za;
    });
    for (const clone of clones) {
      const rect = clone.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return clone;
      }
    }
    return null;
  }

  // 根据克隆图找到对应的原始元素
  function getElByClone(clone) {
    for (const [el, info] of zoomedClones) {
      if (info.clone === clone) return el;
    }
    return null;
  }

  // ==============================
  // 阅兵模式
  // ==============================

  function getParadeCloneAtPoint(x, y) {
    if (!paradeOverlay) return null;
    const clones = Array.from(paradeOverlay.querySelectorAll('.nopic-parade-clone'));
    clones.sort((a, b) => {
      const wa = a.parentElement;
      const wb = b.parentElement;
      const za = wa ? parseInt(wa.style.zIndex) || 0 : 0;
      const zb = wb ? parseInt(wb.style.zIndex) || 0 : 0;
      return zb - za;
    });
    for (const clone of clones) {
      const r = clone.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return clone;
    }
    return null;
  }

  function getParadeElByClone(clone) {
    for (const [el, info] of paradeClones) {
      if (info.clone === clone) return el;
    }
    return null;
  }

  function enterParadeMode() {
    if (isParadeMode) {
      exitParadeMode();
      return;
    }
    paradeZIndexCounter = 10;

    // 先关闭所有已有的钉图/放大
    imageControls.forEach((btn, el) => {
      if (el._isZoomed) zoomOut(el);
    });

    const imageData = [];

    // 直接从 DOM 收集，不依赖 imageControls
    const allImages = document.querySelectorAll(
      'img:not(.nopic-clone):not(.nopic-parade-clone), svg:not(.nopic-clone):not(.nopic-parade-clone), [style*="background-image"]:not(.nopic-clone):not(.nopic-parade-clone)'
    );
    allImages.forEach(el => {
      if (!el.isConnected) return;
      if (el.id === 'nopic-about-img' || el.closest('#nopic-about-modal')) return;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (paradeFilter.enabled) {
          const naturalW = Math.round(rect.width) || el.offsetWidth;
          const naturalH = Math.round(rect.height) || el.offsetHeight;
          if (
            naturalW < paradeFilter.minW ||
            naturalW > paradeFilter.maxW ||
            naturalH < paradeFilter.minH ||
            naturalH > paradeFilter.maxH
          )
            return;
        }
        const wasHidden = el.dataset.isHidden === 'true';
        imageData.push({ el, wasHidden });
      }
    });
    if (imageData.length === 0) return;

    isParadeMode = true;
    const paradeBtn = document.querySelector('[data-action="paradeMode"]');
    if (paradeBtn) paradeBtn.textContent = '退出阅兵模式';

    // 阻止页面滚动
    paradeSavedBodyOverflow = document.body.style.overflow;
    paradeSavedHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // 【第一步】取消所有图片隐藏状态，虚线消失
    imageData.forEach(({ el, wasHidden }) => {
      el._paradeWasHidden = wasHidden; // 记录原状态
      if (wasHidden) {
        el.classList.remove('nopic-hidden');
        el.dataset.isHidden = 'false';
        const outline = imageOutlines.get(el);
        if (outline) outline.style.display = 'none';
        const btn = imageControls.get(el);
        if (btn) btn.innerText = '隐';
      }
    });

    // 等待显现动画完成（0.5s）
    setTimeout(() => {
      if (!isParadeMode) return; // 防御性检查

      // 【第二步】收集最新位置并创建克隆图
      const layoutData = [];
      imageData.forEach(({ el }) => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          layoutData.push({
            el,
            rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
          });
        }
      });
      if (layoutData.length === 0) {
        exitParadeMode();
        return;
      }

      // ---- 计算网格布局 ----
      const GAP = 28;
      const HEADER_H = 48;
      const SIDE_PAD = 28;
      const TOP_PAD = HEADER_H + 20;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxRowW = vw - SIDE_PAD * 2;

      const TEMP_H = 200;
      let tempRows = 0,
        tempRowW = 0;
      layoutData.forEach(({ rect }) => {
        const w = TEMP_H * (rect.width / rect.height);
        if (tempRowW + GAP + w > maxRowW && tempRowW > 0) {
          tempRows++;
          tempRowW = w + GAP;
        } else {
          tempRowW += w + (tempRowW > 0 ? GAP : 0);
        }
      });
      if (tempRowW > 0) tempRows++;

      const availH = vh - TOP_PAD - 20;
      const UNI_H = Math.min(
        280,
        Math.max(80, Math.floor((availH - Math.max(0, tempRows - 1) * GAP) / Math.max(1, tempRows)))
      );

      const rows = [];
      let curRow = [];
      let curRowW = 0;
      layoutData.forEach(({ el, rect }) => {
        const tw = UNI_H * (rect.width / rect.height);
        if (curRow.length > 0 && curRowW + GAP + tw > maxRowW) {
          rows.push([...curRow]);
          curRow = [];
          curRowW = 0;
        }
        curRow.push({ el, rect, tw, th: UNI_H });
        curRowW += tw + (curRow.length > 1 ? GAP : 0);
      });
      if (curRow.length > 0) rows.push(curRow);

      let curY = TOP_PAD;
      const positions = new Map();
      rows.forEach(row => {
        const totalW = row.reduce((s, it, i) => s + it.tw + (i > 0 ? GAP : 0), 0);
        let curX = Math.max(SIDE_PAD, (vw - totalW) / 2);
        row.forEach(it => {
          positions.set(it.el, { left: curX, top: curY, width: it.tw, height: it.th });
          curX += it.tw + GAP;
        });
        curY += UNI_H + GAP;
      });
      const totalH = curY + 36;

      // ---- 创建遮罩层 ----
      paradeOverlay = document.createElement('div');
      paradeOverlay.id = 'nopic-parade-overlay';
      const content = document.createElement('div');
      content.className = 'nopic-parade-content';
      content.style.height = totalH + 'px';

      // ---- 创建顶部状态栏 ----
      paradeHeader = document.createElement('div');
      paradeHeader.id = 'nopic-parade-header';
      const titleSpan = document.createElement('span');
      titleSpan.className = 'nopic-parade-title';
      titleSpan.innerHTML =
        '阅兵模式 · 共 <strong>' +
        imageData.length +
        '</strong> 张图片' +
        (paradeFilter.enabled
          ? ' <span style="color:#60a5fa;font-size:11px;">(已过滤)</span>'
          : '');

      const closeBtn = document.createElement('div');
      closeBtn.className = 'nopic-parade-close-btn';
      closeBtn.innerHTML = '✕';
      closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        exitParadeMode();
      });
      paradeHeader.appendChild(titleSpan);
      paradeHeader.appendChild(closeBtn);

      // ---- 创建克隆图（初始位置=原图屏幕位置） ----
      layoutData.forEach(({ el, rect }) => {
        const tp = positions.get(el);
        el._paradeSavedVisibility = el.style.visibility;
        el.style.visibility = 'hidden';
        el._isParadeZoomed = true;

        // 创建包装器，用于承载克隆图和尺寸标签
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.left = rect.left + 'px';
        wrapper.style.top = rect.top + 'px';
        wrapper.style.width = rect.width + 'px';
        wrapper.style.height = rect.height + 'px';
        wrapper.style.zIndex = String(++paradeZIndexCounter);
        wrapper.style.transition = 'none';

        const clone = el.cloneNode(true);
        clone.id = '';
        clone.classList.remove(
          'nopic-hidden',
          'nopic-has-bg',
          'nopic-outline-box',
          'nopic-float-btn'
        );
        clone.classList.add('nopic-parade-clone');
        clone.style.setProperty('display', 'block', 'important');
        clone.style.setProperty('visibility', 'visible', 'important');
        clone.style.setProperty('opacity', '1', 'important');
        clone.style.setProperty('filter', 'none', 'important');
        clone.style.setProperty('border', 'none', 'important');

        clone.style.left = '0';
        clone.style.top = '0';
        clone.style.width = '100%';
        clone.style.height = '100%';
        clone.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
        clone.style.setProperty('z-index', '1', 'important');

        // 尺寸标签 - 显示图片在页面的渲染尺寸
        const sizeLabel = document.createElement('div');
        sizeLabel.className = 'nopic-parade-size-label';
        sizeLabel.textContent = Math.round(rect.width) + '×' + Math.round(rect.height);

        wrapper.appendChild(clone);
        wrapper.appendChild(sizeLabel);
        content.appendChild(wrapper);

        // 保存 wrapper 引用，方便后续动画操作
        paradeClones.set(el, { clone, wrapper, originalRect: rect, targetPos: tp, sizeLabel });
      });

      paradeOverlay.appendChild(content);
      document.documentElement.appendChild(paradeOverlay);
      document.documentElement.appendChild(paradeHeader);

      // ---- 激活遮罩 + 飞入动画 ----
      requestAnimationFrame(() => {
        paradeOverlay.classList.add('active');
        paradeHeader.classList.add('active');
        requestAnimationFrame(() => {
          // 使用与退出动画一致的平滑标准缓动，时间延长至 0.6s
          const ez = 'cubic-bezier(0.4, 0, 0.2, 1)';
          paradeClones.forEach(({ clone, wrapper, targetPos: tp, sizeLabel }) => {
            wrapper.style.transition =
              'left 0.6s ' + ez + ', top 0.6s ' + ez + ', width 0.6s ' + ez + ', height 0.6s ' + ez;
            wrapper.style.left = tp.left + 'px';
            wrapper.style.top = tp.top + 'px';
            wrapper.style.width = tp.width + 'px';
            wrapper.style.height = tp.height + 'px';
            clone.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.1), 0 6px 24px rgba(0,0,0,0.45)';
          });
        });
      });

      // ---- 阅兵模式交互事件 ----
      paradeOverlay.addEventListener('click', e => {
        if (paradeDragState.wasDragged) {
          paradeDragState.wasDragged = false;
          return;
        }
        if (e.target === paradeOverlay || e.target.classList.contains('nopic-parade-content')) {
          exitParadeMode();
        }
      });

      paradeOverlay.addEventListener(
        'mousedown',
        e => {
          if (e.button !== 1) return;
          const clone = getParadeCloneAtPoint(e.clientX, e.clientY);
          if (clone) {
            e.preventDefault();
            e.stopPropagation();
            const el = getParadeElByClone(clone);
            if (el) paradeZoomOutSingle(el);
          }
        },
        true
      );
      paradeOverlay.addEventListener(
        'auxclick',
        e => {
          if (e.button === 1) {
            e.preventDefault();
            e.stopPropagation();
          }
        },
        true
      );

      paradeOverlay.addEventListener(
        'wheel',
        e => {
          const clone = getParadeCloneAtPoint(e.clientX, e.clientY);
          if (!clone) return;
          e.preventDefault();
          e.stopPropagation();

          // 找到 clone 所在的 wrapper
          const wrapper = clone.parentElement;
          if (!wrapper) return;

          wrapper.style.zIndex = String(++paradeZIndexCounter);

          const rect = clone.getBoundingClientRect();
          const step = e.deltaY < 0 ? 1.1 : 0.9;
          const nw = rect.width * step;
          const nh = rect.height * step;

          const scrollLeft = paradeOverlay.scrollLeft;
          const scrollTop = paradeOverlay.scrollTop;
          const centerX = rect.left + rect.width / 2 + scrollLeft;
          const centerY = rect.top + rect.height / 2 + scrollTop;

          const newLeft = centerX - nw / 2;
          const newTop = centerY - nh / 2;

          wrapper.style.transition = 'none';
          wrapper.style.left = newLeft + 'px';
          wrapper.style.top = newTop + 'px';
          wrapper.style.width = nw + 'px';
          wrapper.style.height = nh + 'px';
        },
        { passive: false }
      );

      paradeOverlay.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        const clone = getParadeCloneAtPoint(e.clientX, e.clientY);
        if (!clone) return;
        e.preventDefault();

        const wrapper = clone.parentElement;
        if (wrapper) wrapper.style.zIndex = String(++paradeZIndexCounter);

        paradeDragState.isDragging = true;
        paradeDragState.wasDragged = false;
        paradeDragState.startX = e.clientX;
        paradeDragState.startY = e.clientY;
        paradeDragState.startScreenLeft = parseFloat(wrapper.style.left) - paradeOverlay.scrollLeft;
        paradeDragState.startScreenTop = parseFloat(wrapper.style.top) - paradeOverlay.scrollTop;
        paradeDragState.currentEl = getParadeElByClone(clone);
        clone.style.setProperty('transition', 'none', 'important');
        clone.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', paradeDragMoveHandler);
      document.addEventListener('mouseup', paradeDragUpHandler);
    }, 100); // 等待图片显现动画完成
  }

  // 拖拽移动处理函数（独立定义，方便注销）
  function paradeDragMoveHandler(e) {
    if (!paradeDragState.isDragging || !paradeDragState.currentEl) return;
    const info = paradeClones.get(paradeDragState.currentEl);
    if (!info) return;
    const wrapper = info.wrapper;
    const dx = e.clientX - paradeDragState.startX;
    const dy = e.clientY - paradeDragState.startY;

    // 拖动时禁用过渡，确保跟手
    wrapper.style.transition = 'none';

    wrapper.style.left = paradeDragState.startScreenLeft + dx + paradeOverlay.scrollLeft + 'px';
    wrapper.style.top = paradeDragState.startScreenTop + dy + paradeOverlay.scrollTop + 'px';
    if (Math.hypot(dx, dy) > 3) paradeDragState.wasDragged = true;
  }

  function paradeDragUpHandler(e) {
    if (!paradeDragState.isDragging) return;
    const info = paradeClones.get(paradeDragState.currentEl);
    if (info && info.clone) info.clone.style.cursor = 'grab';
    paradeDragState.isDragging = false;
    paradeDragState.currentEl = null;
  }

  // ===== 退出阅兵模式 =====
  function exitParadeMode() {
    if (!isParadeMode) return;
    isParadeMode = false;
    const paradeBtn = document.querySelector('[data-action="paradeMode"]');
    if (paradeBtn) paradeBtn.textContent = '开启阅兵模式';

    // 注销拖拽监听
    document.removeEventListener('mousemove', paradeDragMoveHandler);
    document.removeEventListener('mouseup', paradeDragUpHandler);

    const scrollLeft = paradeOverlay.scrollLeft;
    const scrollTop = paradeOverlay.scrollTop;

    // 第一步：克隆图飞回原位
    paradeClones.forEach(({ clone, wrapper, originalRect: rect, targetPos: tp, sizeLabel }, el) => {
      if (!el.isConnected) {
        wrapper.remove();
        return;
      }

      const curRect = el.getBoundingClientRect();
      const flyLeft = curRect.left + scrollLeft;
      const flyTop = curRect.top + scrollTop;

      const ez = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
      wrapper.style.transition =
        'left 0.55s ' + ez + ', top 0.55s ' + ez + ', width 0.55s ' + ez + ', height 0.55s ' + ez;
      wrapper.style.left = flyLeft + 'px';
      wrapper.style.top = flyTop + 'px';
      wrapper.style.width = curRect.width + 'px';
      wrapper.style.height = curRect.height + 'px';
      clone.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
      clone.style.pointerEvents = 'none';
    });

    // 第二步：等飞回动画彻底结束后(550ms)，再淡出遮罩
    setTimeout(() => {
      if (paradeOverlay) paradeOverlay.classList.remove('active');
      if (paradeHeader) paradeHeader.classList.remove('active');

      // 第三步：等遮罩淡出后(300ms)，清理DOM并恢复原图状态
      setTimeout(() => {
        paradeClones.forEach(({ wrapper }, el) => {
          if (el.isConnected) {
            el.style.visibility =
              el._paradeSavedVisibility !== undefined ? el._paradeSavedVisibility : '';
            delete el._paradeSavedVisibility;
            delete el._isParadeZoomed;

            if (el._paradeWasHidden) {
              el.classList.add('nopic-hidden');
              el.dataset.isHidden = 'true';
              const outline = imageOutlines.get(el);
              if (outline) outline.style.display = '';
              const btn = imageControls.get(el);
              if (btn) btn.innerText = '显';
              delete el._paradeWasHidden;
              syncElementPosition(el);
            }
          }
          if (wrapper && wrapper.parentNode) wrapper.remove();
        });
        paradeClones.clear();

        if (paradeOverlay && paradeOverlay.parentNode) paradeOverlay.remove();
        paradeOverlay = null;
        if (paradeHeader && paradeHeader.parentNode) paradeHeader.remove();
        paradeHeader = null;

        // 恢复页面滚动
        document.body.style.overflow = paradeSavedBodyOverflow;
        document.documentElement.style.overflow = paradeSavedHtmlOverflow;
      }, 300); // 遮罩淡出时间
    }, 550); // 飞回动画时间
    updateAllUI();
  }

  // ===== 单图飞回原位（阅兵模式下中键点击） =====
  function paradeZoomOutSingle(el) {
    const info = paradeClones.get(el);
    if (!info) return;
    const { clone, originalRect: rect, targetPos: tp } = info;

    if (!el.isConnected) {
      clone.remove();
      paradeClones.delete(el);
      delete el._isParadeZoomed;
      if (paradeClones.size === 0) exitParadeMode();
      return;
    }

    const curRect = el.getBoundingClientRect();
    const scrollLeft = paradeOverlay.scrollLeft;
    const scrollTop = paradeOverlay.scrollTop;
    const flyLeft = curRect.left + scrollLeft;
    const flyTop = curRect.top + scrollTop;

    const ez = 'cubic-bezier(0.25, 0.1, 0.25, 1)'; // 更平滑的减速曲线
    clone.style.setProperty(
      'transition',
      'left 0.45s ' +
        ez +
        ', top 0.45s ' +
        ez +
        ', width 0.45s ' +
        ez +
        ', height 0.45s ' +
        ez +
        ', box-shadow 0.45s ' +
        ez,
      'important'
    );

    clone.style.left = flyLeft + 'px';
    clone.style.top = flyTop + 'px';
    clone.style.width = curRect.width + 'px';
    clone.style.height = curRect.height + 'px';
    clone.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
    clone.style.pointerEvents = 'none';

    setTimeout(() => {
      const info = paradeClones.get(el);
      if (info && info.wrapper && info.wrapper.parentNode) info.wrapper.remove();
      paradeClones.delete(el);

      // 恢复原图可见
      el.style.visibility =
        el._paradeSavedVisibility !== undefined ? el._paradeSavedVisibility : '';
      delete el._paradeSavedVisibility;
      delete el._isParadeZoomed;

      // 还原原来隐藏的状态
      if (el._paradeWasHidden) {
        el.classList.add('nopic-hidden');
        el.dataset.isHidden = 'true';
        const outline = imageOutlines.get(el);
        if (outline) outline.style.display = '';
        const btn = imageControls.get(el);
        if (btn) btn.innerText = '显';
        delete el._paradeWasHidden;
        syncElementPosition(el);
      }

      if (paradeClones.size === 0) exitParadeMode();
    }, 500); // 延长清理时间，确保动画完成
  }

  function zoomIn(el, btn, zoomBtn, fromHover) {
    if (el._isZoomed || zoomCooldown) return;
    if (isParadeMode) return; // 确保有这行
    cancelHoverZoomTimer(el, true);
    el._isZoomed = true;

    const outline = imageOutlines.get(el);
    if (outline) outline.style.display = 'none';

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      el._isZoomed = false;
      return;
    }

    el._savedVisibility = el.style.visibility;
    el.style.visibility = 'hidden';

    let clone = el.cloneNode(true);
    clone.id = '';
    clone.classList.remove('nopic-hidden', 'nopic-has-bg', 'nopic-outline-box', 'nopic-float-btn');
    clone.classList.add('nopic-clone');

    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';

    const vw = window.innerWidth * 0.9;
    const vh = window.innerHeight * 0.9;
    const targetScale = Math.min(vw / rect.width, vh / rect.height, 5);
    const targetWidth = rect.width * targetScale;
    const targetHeight = rect.height * targetScale;
    const targetLeft = (window.innerWidth - targetWidth) / 2;
    const targetTop = (window.innerHeight - targetHeight) / 2;

    // 钉图模式：不清空容器，支持多图共存
    if (!zoomPinModeConfig) {
      zoomContainer.innerHTML = '';
      zoomContainer.classList.add('active');
    }

    zoomContainer.appendChild(clone);

    // 钉图模式：添加独立关闭按钮
    let closeBtn = null;
    if (zoomPinModeConfig) {
      closeBtn = document.createElement('div');
      closeBtn.className = 'nopic-pin-close-btn';
      closeBtn.innerHTML = '×';
      closeBtn.style.transition = 'none';
      closeBtn.style.left = 'auto';
      closeBtn.style.top = '-10px';
      closeBtn.style.right = '-10px';
      closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        zoomOut(el);
      });
      clone.appendChild(closeBtn); // 塞进 clone 里，跟着走
    } else {
      // 聚焦模式：顶部控制栏
      let showCloseBtn = !fromHover || (fromHover && zoomLeaveModeConfig === 'button');
      if (showCloseBtn) {
        let controlPanel = document.createElement('div');
        controlPanel.className = 'nopic-zoom-controls';
        let closeBtn2 = document.createElement('div');
        closeBtn2.className = 'nopic-float-btn';
        closeBtn2.innerHTML = '×';
        closeBtn2.style.fontSize = '20px';
        closeBtn2.addEventListener('click', e => {
          e.stopPropagation();
          zoomOut(el);
        });
        controlPanel.appendChild(closeBtn2);
        zoomContainer.appendChild(controlPanel);
      }
    }

    // 记录克隆信息
    zoomedClones.set(el, { clone: clone, closeBtn: closeBtn });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
        clone.style.setProperty(
          'transition',
          'left 0.45s ' +
            easing +
            ', top 0.45s ' +
            easing +
            ', width 0.45s ' +
            easing +
            ', height 0.45s ' +
            easing +
            ', box-shadow 0.45s ' +
            easing,
          'important'
        );

        clone.style.left = targetLeft + 'px';
        clone.style.top = targetTop + 'px';
        clone.style.width = targetWidth + 'px';
        clone.style.height = targetHeight + 'px';
        clone.style.boxShadow = zoomPinModeConfig
          ? '0 0 0 1px rgba(255,255,255,0.2), 0 15px 50px rgba(0,0,0,0.8)'
          : '0 25px 80px rgba(0,0,0,0.5)';
      });
    });
  }

  function zoomOut(el) {
    if (!el._isZoomed) return;
    el._isZoomed = false;

    const info = zoomedClones.get(el);
    const clone = info ? info.clone : null;
    const closeBtn = info ? info.closeBtn : null;

    if (clone && el.isConnected) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        // === 原有逻辑：原位置还在，飞回原位（一字未动） ===
        const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
        clone.style.setProperty(
          'transition',
          'left 0.35s ' +
            easing +
            ', top 0.35s ' +
            easing +
            ', width 0.35s ' +
            easing +
            ', height 0.35s ' +
            easing +
            ', box-shadow 0.35s ' +
            easing +
            ', opacity 0.25s ease',
          'important'
        );
        clone.style.left = rect.left + 'px';
        clone.style.top = rect.top + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        clone.style.opacity = '0';
        clone.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
      } else {
        // === 新增逻辑：原图位置无效，原地高斯模糊+透明度降低 ===
        const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
        clone.style.setProperty(
          'transition',
          'filter 0.4s ' + easing + ', opacity 0.4s ' + easing,
          'important'
        );
        clone.style.setProperty('filter', 'blur(20px)', 'important');
        clone.style.setProperty('opacity', '0', 'important');
      }
    } else if (clone) {
      // === 新增逻辑：原图已不在文档流，原地高斯模糊+透明度降低 ===
      const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
      clone.style.setProperty(
        'transition',
        'filter 0.4s ' + easing + ', opacity 0.4s ' + easing,
        'important'
      );
      clone.style.setProperty('filter', 'blur(20px)', 'important');
      clone.style.setProperty('opacity', '0', 'important');
    }

    if (!zoomPinModeConfig) {
      zoomContainer.classList.remove('active');
    }
    zoomCooldown = true;
    setTimeout(() => {
      zoomCooldown = false;
    }, 300);

    setTimeout(() => {
      if (el._savedVisibility !== undefined) el.style.visibility = el._savedVisibility;
      delete el._savedVisibility;
      const outline = imageOutlines.get(el);
      if (outline) outline.style.display = '';

      if (clone && clone.parentNode) clone.remove();
      zoomedClones.delete(el);
    }, 450); // 延长一点时间，确保模糊动画播完再移除DOM
  }

  // 滚轮缩放 - 钉图模式下精准定位到鼠标下的图
  zoomContainer.addEventListener(
    'wheel',
    e => {
      let clone = getCloneAtPoint(e.clientX, e.clientY);

      // 非钉图模式（聚焦模式）：只要有放大图，滚轮在容器任何位置都有效，作用于当前唯一图
      if (!clone && !zoomPinModeConfig) {
        const clones = zoomContainer.querySelectorAll('.nopic-clone');
        if (clones.length > 0) clone = clones[clones.length - 1];
      }

      if (!clone) {
        // 钉图模式下且鼠标不在任何图上，不拦截，让页面滚动
        if (zoomPinModeConfig) return;
        // 聚焦模式下没有图也不处理
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      clone.style.zIndex = ++pinZIndexCounter;

      const rect = clone.getBoundingClientRect();
      const scaleStep = e.deltaY < 0 ? 1.1 : 0.9;
      let newWidth = rect.width * scaleStep;
      let newHeight = rect.height * scaleStep;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const newLeft = centerX - newWidth / 2;
      const newTop = centerY - newHeight / 2;

      clone.style.setProperty('transition', 'none', 'important');
      clone.style.left = newLeft + 'px';
      clone.style.top = newTop + 'px';
      clone.style.width = newWidth + 'px';
      clone.style.height = newHeight + 'px';
    },
    { passive: false }
  );

  // 拖动逻辑 - 支持多图独立拖动
  zoomContainer.addEventListener('mousedown', e => {
    const clone = getCloneAtPoint(e.clientX, e.clientY);
    if (!clone || e.button !== 0) return;
    e.preventDefault();
    clone.style.zIndex = ++pinZIndexCounter;
    isDraggingClone = true;
    wasDragged = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartLeft = parseFloat(clone.style.left);
    dragStartTop = parseFloat(clone.style.top);
    draggedCloneEl = getElByClone(clone);
    clone.style.setProperty('transition', 'none', 'important');
    clone.style.cursor = 'grabbing !important';
    zoomContainer.style.cursor = 'grabbing';
  });

  document.addEventListener('mouseup', e => {
    if (!isDraggingClone) return;
    isDraggingClone = false;
    const clone = draggedCloneEl ? zoomedClones.get(draggedCloneEl)?.clone : null;
    if (clone) clone.style.cursor = 'grab !important';
    zoomContainer.style.cursor = '';
    if (Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY) > 3) wasDragged = true;
    draggedCloneEl = null;
  });

  document.addEventListener('mousemove', e => {
    if (!isDraggingClone || !draggedCloneEl) return;
    const info = zoomedClones.get(draggedCloneEl);
    if (!info || !info.clone) return;
    const clone = info.clone;
    const newLeft = dragStartLeft + e.clientX - dragStartX;
    const newTop = dragStartTop + e.clientY - dragStartY;
    clone.style.left = newLeft + 'px';
    clone.style.top = newTop + 'px';
  });

  // 鼠标移出检测 - 仅聚焦模式且"离开图片"选项时生效
  zoomContainer.addEventListener('mousemove', e => {
    if (isDraggingClone) return;
    if (zoomModeConfig === 'hover' && zoomLeaveModeConfig === 'leave' && !zoomPinModeConfig) {
      if (zoomCooldown) return;
      const clone = zoomContainer.querySelector('.nopic-clone');
      if (clone) {
        const rect = clone.getBoundingClientRect();
        const margin = 5;
        const isOutside =
          e.clientX < rect.left - margin ||
          e.clientX > rect.right + margin ||
          e.clientY < rect.top - margin ||
          e.clientY > rect.bottom + margin;
        if (isOutside) {
          imageControls.forEach((btn, el) => {
            if (el._isZoomed) zoomOut(el);
          });
        }
      }
    }
  });

  zoomContainer.addEventListener('click', e => {
    if (wasDragged) {
      wasDragged = false;
      e.stopPropagation();
      return;
    }
    // 点击放大图片本身也能关闭（钉图模式和聚焦模式都支持）
    const clickedClone = e.target.closest('.nopic-clone');
    if (clickedClone) {
      const el = getElByClone(clickedClone);
      if (el && el._isZoomed) {
        zoomOut(el);
        e.stopPropagation();
        return;
      }
    }
    // 聚焦模式下点击空白区关闭
    if (e.target === zoomContainer && !zoomPinModeConfig) {
      zoomedClones.forEach((info, el) => {
        if (el._isZoomed) zoomOut(el);
      });
    }
  });

  // --- 4. 图片控制逻辑 ---
  const syncElementPosition = el => {
    const btn = imageControls.get(el),
      outline = imageOutlines.get(el),
      zoomBtn = imageZoomControls.get(el);
    if (!el || !el.isConnected) {
      btn?.remove();
      outline?.remove();
      zoomBtn?.remove();
      imageControls.delete(el);
      imageOutlines.delete(el);
      imageZoomControls.delete(el);
      cancelHoverZoomTimer(el, true);
      return;
    }
    let top = el.offsetTop,
      left = el.offsetLeft;
    const width = el.offsetWidth,
      height = el.offsetHeight;
    if (outline && outline.parentElement) {
      const parent = outline.parentElement,
        imgRect = el.getBoundingClientRect(),
        parentRect = parent.getBoundingClientRect();
      const pStyle = window.getComputedStyle(parent);
      top =
        imgRect.top - parentRect.top + parent.scrollTop - (parseFloat(pStyle.borderTopWidth) || 0);
      left =
        imgRect.left -
        parentRect.left +
        parent.scrollLeft -
        (parseFloat(pStyle.borderLeftWidth) || 0);
    }
    if (width <= 0 || height <= 0) {
      if (btn) btn.style.display = 'none';
      if (outline) outline.style.display = 'none';
      if (zoomBtn) zoomBtn.style.display = 'none';
      return;
    } else {
      if (btn) btn.style.display = 'flex';
      if (outline) outline.style.display = 'block';
      if (zoomBtn) zoomBtn.style.display = 'flex';
    }
    if (btn) {
      btn.style.left = left + 6 + 'px';
      btn.style.top = top + 6 + 'px';
    }
    if (zoomBtn) {
      const btnWidth = parseFloat(btn.style.width) || 30;
      zoomBtn.style.left = left + 6 + btnWidth + 4 + 'px';
      zoomBtn.style.top = top + 6 + 'px';
    }
    if (outline) {
      outline.style.left = left + 'px';
      outline.style.top = top + 'px';
      outline.style.width = width + 'px';
      outline.style.height = height + 'px';
      const isHidden = el.dataset.isHidden === 'true';
      if (isHidden) {
        hoverShowImgConfig && el.isHovering
          ? el.classList.remove('nopic-hidden')
          : !el.classList.contains('nopic-hidden') && el.classList.add('nopic-hidden');
      } else {
        el.classList.remove('nopic-hidden');
      }
      const effectiveHover = !!(el.isHovering || el._btnHovering);
      let shouldBeVisible = isHidden && showOutlineConfig && (!hoverOnlyConfig || effectiveHover);
      if (hoverShowImgConfig && effectiveHover) shouldBeVisible = false;
      outline.classList.toggle('nopic-outline-active', !!shouldBeVisible);
      const showBtn = !!effectiveHover && !hoverShowImgConfig;
      btn.classList.toggle('nopic-btn-active', showBtn);
      if (zoomBtn) {
        const showZoomBtn = showBtn && el.dataset.isHidden !== 'true';
        zoomBtn.classList.toggle('nopic-btn-active', !!showZoomBtn);
      }
    }
  };

  document.addEventListener('mousemove', e => {
    lastGlobalMouseX = e.clientX;
    lastGlobalMouseY = e.clientY;
    if (window.imgHidenSet === null) return;
    // ★【修改1】阅兵模式下屏蔽原页面hover逻辑
    if (isParadeMode) return;
    // 钉图模式下，鼠标在克隆图上时不触发原图hover逻辑
    if (getCloneAtPoint(e.clientX, e.clientY)) return;
    if (document.querySelector('.nopic-clone') && !zoomPinModeConfig) return;
    imageControls.forEach((btn, el) => {
      if (el._isZoomed) return;
      const rect = el.getBoundingClientRect();
      const wasHovering = el.isHovering;
      const margin = 10;
      let isInsideImage =
        e.clientX >= rect.left - margin &&
        e.clientX <= rect.right + margin &&
        e.clientY >= rect.top - margin &&
        e.clientY <= rect.bottom + margin;
      let isInsideBtnArea = false;
      if (!isInsideImage) {
        // 只有"关闭悬停显图 + 点击放大"时，才扩大可触碰区域到"放"按钮
        const expandHitArea = zoomModeConfig === 'click' && !hoverShowImgConfig;
        const hitAreaWidth = expandHitArea ? 104 : 4;
        isInsideBtnArea =
          e.clientX >= rect.left + 4 &&
          e.clientX <= rect.left + hitAreaWidth &&
          e.clientY >= rect.top + 4 &&
          e.clientY <= rect.top + hitAreaWidth;
      }
      const isInside = isInsideImage || isInsideBtnArea;

      if (zoomModeConfig === 'hover') {
        if (isInside) {
          if (!wasHovering) {
            el.isHovering = true;
            startHoverZoomTimer(el);
          } else {
            if (imageTimers.has(el)) {
              restartHoverZoomTimer(el);
            } else if (hoverZoomTimers.has(el)) {
              startHoverZoomTimer(el);
            }
          }
          syncElementPosition(el);
        } else if (!isInside && wasHovering) {
          el.isHovering = false;
          cancelHoverZoomTimer(el, false);
          syncElementPosition(el);
        }
      } else {
        if (isInside !== wasHovering) {
          el.isHovering = isInside;
          syncElementPosition(el);
        }
      }
    });
  });

  // 中键 mousedown：处理放大/关闭
  document.addEventListener(
    'mousedown',
    e => {
      if (e.button !== 1) return;
      if (window.imgHidenSet === null) return;
      // ★【修改2】阅兵模式下的中键由遮罩层事件处理，此处不干预
      if (isParadeMode) return;

      const clone = getCloneAtPoint(e.clientX, e.clientY);
      if (clone) {
        e.preventDefault();
        e.stopPropagation();
        const el = getElByClone(clone);
        if (el && el._isZoomed) zoomOut(el);
        return;
      }

      let targetEl = null;
      imageControls.forEach((btn, el) => {
        if (el._isZoomed) return;
        const rect = el.getBoundingClientRect();
        const margin = 10;
        if (
          e.clientX >= rect.left - margin &&
          e.clientX <= rect.right + margin &&
          e.clientY >= rect.top - margin &&
          e.clientY <= rect.bottom + margin
        ) {
          targetEl = el;
        }
      });

      if (targetEl && zoomModeConfig === 'middle') {
        e.preventDefault();
        e.stopPropagation();
        const isHidden = targetEl.dataset.isHidden === 'true';
        const shouldZoom = hoverShowImgConfig || (!hoverShowImgConfig && !isHidden);
        if (shouldZoom && !targetEl._isZoomed && !zoomCooldown) {
          const btn = imageControls.get(targetEl);
          const zoomBtn = imageZoomControls.get(targetEl);
          zoomIn(targetEl, btn, zoomBtn, false);
        }
        return;
      }

      if (!zoomPinModeConfig && document.querySelector('.nopic-clone')) {
        e.preventDefault();
        e.stopPropagation();
        imageControls.forEach((btn, el) => {
          if (el._isZoomed) zoomOut(el);
        });
      }
    },
    true
  );

  // 中键 auxclick：兜底阻止默认行为
  document.addEventListener(
    'auxclick',
    e => {
      if (e.button !== 1) return;

      const clone = getCloneAtPoint(e.clientX, e.clientY);
      if (clone) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      let hitImage = false;
      imageControls.forEach((btn, el) => {
        const rect = el.getBoundingClientRect();
        const margin = 10;
        if (
          e.clientX >= rect.left - margin &&
          e.clientX <= rect.right + margin &&
          e.clientY >= rect.top - margin &&
          e.clientY <= rect.bottom + margin
        ) {
          hitImage = true;
        }
      });

      if (hitImage) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  let createControlButton = function (el) {
    if (imageControls.has(el)) return;
    // 跳过赞助二维码和关于弹窗内的图片
    if (el.id === 'nopic-about-img' || el.closest('#nopic-about-modal')) return;
    let imgStyle = window.getComputedStyle(el),
      parent;
    if (imgStyle.position !== 'absolute' && imgStyle.position !== 'fixed')
      parent = el.parentElement || document.body;
    else parent = el.offsetParent || document.body;
    if (window.getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    const rect = el.getBoundingClientRect(),
      baseSize = Math.max(20, Math.min(32, Math.min(rect.width, rect.height) * 0.4));
    let imgZ = imgStyle.zIndex,
      targetZ = imgZ !== 'auto' && !isNaN(imgZ) ? parseInt(imgZ) : 1;

    let outline = document.createElement('div');
    outline.className = 'nopic-outline-box';
    outline.style.zIndex = targetZ;
    parent.appendChild(outline);
    imageOutlines.set(el, outline);

    let button = document.createElement('div');
    button.className = 'nopic-float-btn';
    button.innerText = '显';
    button.style.width = baseSize * 1.2 + 'px';
    button.style.height = baseSize + 'px';
    button.style.fontSize = Math.max(11, baseSize * 0.5) + 'px';
    button.style.zIndex = targetZ + 1;
    button.addEventListener('mouseenter', () => {
      el._btnHovering = true;
      syncElementPosition(el);
    });
    button.addEventListener('mouseleave', () => {
      el._btnHovering = false;
      const rect = el.getBoundingClientRect();
      const inImg =
        lastGlobalMouseX >= rect.left - 10 &&
        lastGlobalMouseX <= rect.right + 10 &&
        lastGlobalMouseY >= rect.top - 10 &&
        lastGlobalMouseY <= rect.bottom + 10;
      const inBtnArea =
        lastGlobalMouseX >= rect.left + 4 &&
        lastGlobalMouseX <= rect.left + 104 &&
        lastGlobalMouseY >= rect.top + 4 &&
        lastGlobalMouseY <= rect.top + 40;
      if (!inImg && !inBtnArea) {
        el.isHovering = false;
        if (zoomModeConfig === 'hover') cancelHoverZoomTimer(el, false);
      }
      syncElementPosition(el);
    });
    button.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      const isCurrentlyHidden = el.dataset.isHidden === 'true';
      el.dataset.isHidden = isCurrentlyHidden ? 'false' : 'true';
      button.innerText = isCurrentlyHidden ? '隐' : '显';
      syncElementPosition(el);
      if (!isCurrentlyHidden && zoomModeConfig === 'hover') {
        const rect = el.getBoundingClientRect();
        if (
          lastGlobalMouseX >= rect.left &&
          lastGlobalMouseX <= rect.right &&
          lastGlobalMouseY >= rect.top &&
          lastGlobalMouseY <= rect.bottom
        ) {
          startHoverZoomTimer(el);
        }
      }
    });
    parent.appendChild(button);
    imageControls.set(el, button);

    // 只有在【点击放大】或【悬停放大且开启悬停显图】时才生成"放"按钮
    if (zoomModeConfig === 'click' || (zoomModeConfig === 'hover' && hoverShowImgConfig)) {
      let zoomBtn = document.createElement('div');
      zoomBtn.className = 'nopic-float-btn';
      zoomBtn.innerText = '放';
      zoomBtn.style.width = baseSize * 1.2 + 'px';
      zoomBtn.style.height = baseSize + 'px';
      zoomBtn.style.fontSize = Math.max(11, baseSize * 0.5) + 'px';
      zoomBtn.style.zIndex = targetZ + 1;
      zoomBtn.addEventListener('mouseenter', () => {
        el._btnHovering = true;
        syncElementPosition(el);
      });
      zoomBtn.addEventListener('mouseleave', () => {
        el._btnHovering = false;
        const rect = el.getBoundingClientRect();
        const inImg =
          lastGlobalMouseX >= rect.left - 10 &&
          lastGlobalMouseX <= rect.right + 10 &&
          lastGlobalMouseY >= rect.top - 10 &&
          lastGlobalMouseY <= rect.bottom + 10;
        const inBtnArea =
          lastGlobalMouseX >= rect.left + 4 &&
          lastGlobalMouseX <= rect.left + 104 &&
          lastGlobalMouseY >= rect.top + 4 &&
          lastGlobalMouseY <= rect.top + 40;
        if (!inImg && !inBtnArea) {
          el.isHovering = false;
        }
        syncElementPosition(el);
      });
      zoomBtn.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        if (!el._isZoomed) {
          if (el.dataset.isHidden === 'true') {
            el.dataset.isHidden = 'false';
            button.innerText = '隐';
            el.classList.remove('nopic-hidden');
            syncElementPosition(el);
          }
          zoomIn(el, button, zoomBtn);
        } else {
          zoomOut(el);
        }
      });
      parent.appendChild(zoomBtn);
      imageZoomControls.set(el, zoomBtn);
    }

    el.dataset.isHidden = 'true';
    if (window.getComputedStyle(el).backgroundImage !== 'none') el.classList.add('nopic-has-bg');
    el.classList.add('nopic-hidden');
    syncElementPosition(el);
    debounceTriggerSpinner();
  };

  let imgHiden = function () {
    if (!document.getElementById('nopic-injected-styles')) document.head.appendChild(style);
        // 新增：根据配置切换动画禁用类
    if (disableAnimationConfig) {
        document.body.classList.add('nopic-animation-disabled');
    } else {
        document.body.classList.remove('nopic-animation-disabled');
    }
    imageControls.forEach((btn, el) => {
      if (!el.isConnected) {
        btn?.remove();
        imageOutlines.get(el)?.remove();
        imageZoomControls.get(el)?.remove();
        imageControls.delete(el);
        imageOutlines.delete(el);
        imageZoomControls.delete(el);
        cancelHoverZoomTimer(el, true);
      } else {
        syncElementPosition(el);
      }
    });
    // ★【修改3】排除阅兵克隆图，防止被重复控制
    document
      .querySelectorAll(
        'img:not(.nopic-clone):not(.nopic-parade-clone), svg:not(.nopic-clone):not(.nopic-parade-clone), .nopic-has-bg:not(.nopic-clone):not(.nopic-parade-clone), [style*="background-image"]:not(.nopic-clone):not(.nopic-parade-clone)'
      )
      .forEach(el => {
        // 跳过赞助二维码和关于弹窗内的图片
        if (el.id === 'nopic-about-img' || el.closest('#nopic-about-modal')) return;
        const bg = window.getComputedStyle(el).backgroundImage,
          isTarget =
            el.tagName === 'IMG' ||
            el.tagName === 'SVG' ||
            (bg && bg !== 'none' && bg.includes('url'));
        if (isTarget) {
          const rect = el.getBoundingClientRect();
          const hasText =
            (el.tagName === 'DIV' || el.tagName === 'SPAN') && el.innerText.trim().length > 0;
          if (rect.width > 15 && rect.height > 15 && !hasText && !imageControls.has(el))
            createControlButton(el);
        }
      });
  };

  let imgShown = function () {
    if (isParadeMode) exitParadeMode();
    hoverZoomTimers.forEach((timerId, el) => clearTimeout(timerId));
    hoverZoomTimers.clear();
    imageTimers.forEach((svg, el) => {
      if (svg.parentNode) svg.remove();
    });
    imageTimers.clear();
    imageControls.forEach((btn, el) => {
        if (disableAnimationConfig) {
    el.style.setProperty('transition', 'none', 'important');
  } else {
      el.style.removeProperty('transition');
    }
      el.classList.remove('nopic-hidden');
      el.dataset.isHidden = 'false';
      btn.remove();
      if (el._isZoomed) zoomOut(el);
      const zoomBtn = imageZoomControls.get(el);
      if (zoomBtn) zoomBtn.remove();
    });
    imageOutlines.forEach(otl => otl.remove());
    imageControls.clear();
    imageOutlines.clear();
    imageZoomControls.clear();
    document.body.classList.remove('nopic-animation-disabled');
  };

  const triggerImmediateCheck = () => {
    if (window.imgHidenSet !== null) {
      setTimeout(imgHiden, 50);
      setTimeout(imgHiden, 300);
    }
  };
  window.addEventListener('popstate', triggerImmediateCheck);
  history.pushState = (function () {
    const o = history.pushState;
    return function () {
      o.apply(this, arguments);
      triggerImmediateCheck();
    };
  })();
  history.replaceState = (function () {
    const o = history.replaceState;
    return function () {
      o.apply(this, arguments);
      triggerImmediateCheck();
    };
  })();
  document.addEventListener(
    'load',
    e => {
      if (window.imgHidenSet !== null && (e.target.tagName === 'IMG' || e.target.tagName === 'SVG'))
        imgHiden();
    },
    true
  );

  // --- 5. 数据统计引擎 ---
  const PX_TO_METER = 3779.5275590551;
  let sessionData = { mouse: 0, click: 0, scroll: 0, read: 0 };
  let globalData = {
    today: { mouse: 0, click: 0, scroll: 0, read: 0 }
  };
  let pendingDeltas = { mouse: 0, click: 0, scroll: 0, read: 0 };
  let lastMouseX = null,
    lastMouseY = null,
    lastScrollTop = 0,
    adCount = 0,
    charDensity = 0;

  function loadGlobalStats() {
    try {
      const saved = GM_getValue('nopic_global_stats_v1');
      if (saved && saved.data) {
        const now = new Date();
        const lastDate = new Date(saved.lastUpdate);
        globalData = saved.data;
        if (!isSameDay(now, lastDate)) {
          globalData.today = { mouse: 0, click: 0, scroll: 0, read: 0 };
        }
      }
    } catch (e) {
      console.error('Load stats error', e);
    }
  }
  function saveGlobalStats() {
    const stored = GM_getValue('nopic_global_stats_v1');
    let latestData =
      stored && stored.data
        ? stored.data
        : {
            today: { mouse: 0, click: 0, scroll: 0, read: 0 }
          };
    ['mouse', 'click', 'scroll', 'read'].forEach(key => {
      if (pendingDeltas[key] > 0) {
        latestData.today[key] = (latestData.today[key] || 0) + pendingDeltas[key];
      }
    });
    pendingDeltas = { mouse: 0, click: 0, scroll: 0, read: 0 };
    globalData = latestData;
    GM_setValue('nopic_global_stats_v1', { lastUpdate: Date.now(), data: latestData });
  }
  function isSameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
  loadGlobalStats();

  function updateStat(key, value) {
    sessionData[key] = (sessionData[key] || 0) + value;
    pendingDeltas[key] = (pendingDeltas[key] || 0) + value;
    globalData.today[key] = (globalData.today[key] || 0) + value;
  }
  function updateCharDensity() {
    const scrollH = document.documentElement.scrollHeight;
    if (scrollH < 100) return;
    charDensity = document.body.innerText.replace(/\s/g, '').length / scrollH;
  }
  document.addEventListener('mousemove', e => {
    if (lastMouseX !== undefined)
      updateStat('mouse', Math.hypot(e.clientX - lastMouseX, e.clientY - lastMouseY));
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    if (Math.random() < 0.05) saveGlobalStats();
  });

  document.addEventListener('click', e => {
    if (
      e.target.closest('#nopic-widget') ||
      e.target.closest('#nopic-menu') ||
      e.target.closest('#nopic-zoom-container')
    )
      return;
    updateStat('click', 1);
    saveGlobalStats();
  });

  document.addEventListener('scroll', () => {
    const st = window.scrollY;
    const delta = Math.abs(st - lastScrollTop);
    if (delta < 2000) {
      updateStat('scroll', delta);
      updateStat('read', delta * charDensity);
    }
    lastScrollTop = st;
    saveGlobalStats();
  });
  setInterval(updateCharDensity, 2000);
  updateCharDensity();
  function estimateAds() {
    if (!configs.adCount) return;
    let count = 0;
    const iframes = document.querySelectorAll('iframe');
    const keywords = ['ad', 'adv', 'promo', 'banner', 'google_ads', 'doubleclick', 'ecma', 'ssp'];
    iframes.forEach(f => {
      const src = f.src || '',
        id = f.id || '',
        cls = f.className || '';
      if (keywords.some(k => src.includes(k) || id.includes(k) || cls.includes(k))) count++;
    });
    document.querySelectorAll('img[src*="ad"], img[class*="ad"]').forEach(el => {
      if (el.offsetWidth > 1) count++;
    });
    adCount = count;
  }
  setInterval(estimateAds, 3000);

  // --- 6. 仪表盘 UI ---
  const widget = document.createElement('div');
  widget.id = 'nopic-widget';
  const lamp = document.createElement('div');
  lamp.id = 'nopic-lamp';
  const contentDiv = document.createElement('div');
  contentDiv.id = 'nopic-content';
  widget.appendChild(lamp);
  widget.appendChild(contentDiv);

  const menu = document.createElement('div');
  menu.id = 'nopic-menu';
  menu.innerHTML = `
    <div class="nopic-menu-item" data-action="paradeMode" style="justify-content:center;color:rgba(96,165,250,0.95);border:1px solid rgba(96,165,250,0.4);border-radius:6px;margin-top:4px;">开启阅兵模式</div>
    <div class="nopic-menu-separator"></div>
    <div class="nopic-menu-item nopic-submenu-trigger" data-submenu="settings" style="justify-content:space-between;"><span>设置</span></div>
    <div class="nopic-menu-item" data-action="about">关于</div>
    <div class="nopic-menu-item nopic-hide-item" data-action="hide" style="margin-top:4px;">隐藏面板 (Alt+H)</div>
    <div class="nopic-menu-item nopic-hide-item" data-action="permaHide" style="margin-top:2px;color:#f87171;">永久隐藏此站</div>
  `;

  const settingsSubmenu = document.createElement('div');
  settingsSubmenu.id = 'nopic-settings-submenu';
  settingsSubmenu.className = 'nopic-submenu';
  settingsSubmenu.innerHTML = `
    <div class="nopic-menu-item" data-submenu-trigger="displayContent" style="justify-content:space-between;"><span>显示内容</span><span style="font-size:14px;opacity:0.6;">›</span></div>
    <div class="nopic-menu-separator">界面设置</div>
    <div class="nopic-menu-item"><span>自动贴边</span><div class="nopic-switch" data-key="autoSnap"></div></div>
    <div class="nopic-menu-item"><span>自动休眠</span><div class="nopic-switch" data-key="autoHideIdle"></div></div>
    <div class="nopic-menu-separator">图片控制</div>
    <div class="nopic-menu-item"><span>虚线辅助</span><div class="nopic-switch" data-key="outline"></div></div>
    <div class="nopic-menu-item"><span>仅悬停显示</span><div class="nopic-switch" data-key="hoverOnly"></div></div>
    <div class="nopic-menu-item"><span>悬停显图</span><div class="nopic-switch" data-key="hoverShowImg"></div></div>
    <div class="nopic-menu-item"><span>禁用动画</span><div class="nopic-switch" data-key="disableAnimation"></div></div>
    <div class="nopic-menu-separator">图片放大</div>
    <div class="nopic-menu-item" style="flex-direction: column; align-items: stretch;">
        <span style="margin-bottom: 4px;">放大图片方式</span>
        <div class="nopic-range-container" style="margin:0; padding:2px;">
            <div class="nopic-range-switcher">
                <div class="nopic-range-btn" data-zoom="off">关</div>
                <div class="nopic-range-btn" data-zoom="hover">悬停</div>
                <div class="nopic-range-btn" data-zoom="middle">中键</div>
                <div class="nopic-range-btn" data-zoom="click">点击</div>
            </div>
        </div>
    </div>
    <div class="nopic-menu-item" id="nopic-leave-options" style="flex-direction: column; align-items: stretch;">
        <span style="margin-bottom: 4px;">还原图片方式</span>
        <div class="nopic-range-container" style="margin:0; padding:2px;">
            <div class="nopic-range-switcher">
                <div class="nopic-range-btn" data-leave="leave">离开图片</div>
                <div class="nopic-range-btn" data-leave="button">仅靠按钮</div>
            </div>
        </div>
    </div>
    <div class="nopic-menu-item"><span>钉图模式</span><div class="nopic-switch" data-key="zoomPinMode"></div></div>
    <div class="nopic-menu-separator">图片阅兵</div>
    <div class="nopic-menu-item" id="nopic-parade-filter-row" style="flex-direction:column;align-items:stretch;padding:8px 10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:11px;color:rgba(255,255,255,0.7);">过滤尺寸</span>
        <div class="nopic-switch" id="nopic-parade-filter-toggle"></div>
      </div>
      <div id="nopic-parade-filter-inputs" style="display:none;gap:6px;flex-direction:column;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:10px;color:rgba(255,255,255,0.5);">最小宽</span>
          <input id="nopic-pf-minW" type="number" min="1" max="9999" style="width:60px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#fff;font-size:11px;padding:2px 6px;text-align:right;">
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:10px;color:rgba(255,255,255,0.5);">最小高</span>
          <input id="nopic-pf-minH" type="number" min="1" max="9999" style="width:60px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#fff;font-size:11px;padding:2px 6px;text-align:right;">
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:10px;color:rgba(255,255,255,0.5);">最大宽</span>
          <input id="nopic-pf-maxW" type="number" min="1" max="9999" style="width:60px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#fff;font-size:11px;padding:2px 6px;text-align:right;">
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:10px;color:rgba(255,255,255,0.5);">最大高</span>
          <input id="nopic-pf-maxH" type="number" min="1" max="9999" style="width:60px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#fff;font-size:11px;padding:2px 6px;text-align:right;">
        </div>
      </div>
    </div>
  `;

  const displaySubmenu = document.createElement('div');
  displaySubmenu.id = 'nopic-display-submenu';
  displaySubmenu.className = 'nopic-submenu';
  displaySubmenu.innerHTML = `
    <div class="nopic-menu-separator">基础</div>
    <div class="nopic-submenu-item" data-key="displayTime"><div class="nopic-checkbox">...</div>时间</div>
    <div class="nopic-submenu-item" data-key="displaySeconds"><div class="nopic-checkbox">...</div>秒</div>
    <div class="nopic-submenu-item" data-key="displayHost"><div class="nopic-checkbox">...</div>域名</div>
    <div class="nopic-menu-separator">图片统计</div>
    <div class="nopic-submenu-item" data-key="displayCount"><div class="nopic-checkbox">...</div>隐藏数量</div>
    <div class="nopic-submenu-item" data-key="displayTotal"><div class="nopic-checkbox">...</div>图片总数</div>
    <div class="nopic-submenu-item" data-key="displayPercent"><div class="nopic-checkbox">...</div>隐藏占比</div>
    <div class="nopic-submenu-item" data-key="displayAdCount"><div class="nopic-checkbox">...</div>疑似广告</div>
    <div class="nopic-menu-separator">性能监控</div>
    <div class="nopic-submenu-item" data-key="displayMemory"><div class="nopic-checkbox">...</div>内存占用</div>
    <div class="nopic-submenu-item" data-key="displayLoadTime"><div class="nopic-checkbox">...</div>加载耗时</div>
    <div class="nopic-submenu-item" data-key="displayResCount"><div class="nopic-checkbox">...</div>资源请求数</div>
    <div class="nopic-menu-separator">用户行为</div>
    <div class="nopic-range-container">
        <div class="nopic-range-switcher">
            <div class="nopic-range-btn" data-range="session">本次</div><div class="nopic-range-btn" data-range="today">今日</div>
        </div>
    </div>
    <div class="nopic-submenu-item" data-key="displayMouseDistance"><div class="nopic-checkbox">...</div>鼠标距离</div>
    <div class="nopic-submenu-item" data-key="displayClickCount"><div class="nopic-checkbox">...</div>点击次数</div>
    <div class="nopic-submenu-item" data-key="displayScrollDist"><div class="nopic-checkbox">...</div>滚动距离</div>
    <div class="nopic-submenu-item" data-key="displayReadChars"><div class="nopic-checkbox">...</div>阅读字数</div>
  `;
  displaySubmenu
    .querySelectorAll('.nopic-checkbox')
    .forEach(
      c =>
        (c.innerHTML =
          '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>')
    );
  menu.appendChild(settingsSubmenu);
  menu.appendChild(displaySubmenu);

  document.documentElement.appendChild(widget);
  document.documentElement.appendChild(menu);

function applySnapPosition(isInit) {
  let offsetX =
    localStorage.getItem('nopicPanelXOffset') !== null
      ? parseFloat(localStorage.getItem('nopicPanelXOffset'))
      : 0;
  let offsetY =
    localStorage.getItem('nopicPanelYOffset') !== null
      ? parseFloat(localStorage.getItem('nopicPanelYOffset'))
      : 0;

  widget.classList.remove('snap-left', 'snap-right');

  if (autoSnapConfig) {
    // 关键修复：如果当前已经在右边（right:0 或 left:auto），保持贴右
    let currentlyOnRight = widget.style.right === '0' || widget.style.left === 'auto';

    let snapToRight = isInit
      ? offsetX > 0
      : (currentlyOnRight || widget.offsetLeft > document.documentElement.clientWidth / 2);

    if (snapToRight) {
      widget.classList.add('snap-right');
      if (isInit) {
        widget.style.left = 'auto';
        widget.style.right = '0';
      } else {
        widget.style.left = document.documentElement.clientWidth - widget.offsetWidth + 'px';
        widget.style.right = 'auto';
      }
    } else {
      widget.classList.add('snap-left');
      widget.style.left = '0';
      widget.style.right = 'auto';
    }
  } else {
    let currentX = document.documentElement.clientWidth / 2 + offsetX;
    widget.style.left =
      Math.max(0, Math.min(document.documentElement.clientWidth - widget.offsetWidth, currentX)) +
      'px';
    widget.style.right = 'auto';
  }

  let currentY = window.innerHeight / 2 + offsetY;
  widget.style.top =
    Math.max(0, Math.min(window.innerHeight - widget.offsetHeight, currentY)) + 'px';
}
  applySnapPosition(true);

  let isDragging = false,
    startMouseX,
    startMouseY,
    startElemX,
    startElemY,
    mouseDownTime = 0;
  let isHovering = false,
    hoverTimer = null;

  function updateAllUI() {
    settingsSubmenu.querySelector('[data-key="disableAnimation"]').classList.toggle('on', disableAnimationConfig);
    settingsSubmenu.querySelector('[data-key="outline"]').classList.toggle('on', showOutlineConfig);
    settingsSubmenu.querySelector('[data-key="hoverOnly"]').classList.toggle('on', hoverOnlyConfig);
    settingsSubmenu
      .querySelector('[data-key="hoverShowImg"]')
      .classList.toggle('on', hoverShowImgConfig);
    settingsSubmenu.querySelector('[data-key="autoSnap"]').classList.toggle('on', autoSnapConfig);
    settingsSubmenu
      .querySelector('[data-key="autoHideIdle"]')
      .classList.toggle('on', autoHideIdleConfig);
    settingsSubmenu
      .querySelector('[data-key="zoomPinMode"]')
      .classList.toggle('on', zoomPinModeConfig);
    const clickZoomBtn = settingsSubmenu.querySelector('.nopic-range-btn[data-zoom="click"]');
    if (clickZoomBtn) clickZoomBtn.style.display = hoverShowImgConfig ? 'none' : '';
    if (hoverShowImgConfig && zoomModeConfig === 'click') {
      zoomModeConfig = 'hover';
      setLocalConfig('zoomMode', zoomModeConfig);
    }
    settingsSubmenu
      .querySelectorAll('.nopic-range-btn[data-zoom]')
      .forEach(btn => btn.classList.toggle('active', btn.dataset.zoom === zoomModeConfig));
    settingsSubmenu
      .querySelectorAll('.nopic-range-btn[data-leave]')
      .forEach(btn => btn.classList.toggle('active', btn.dataset.leave === zoomLeaveModeConfig));
    displaySubmenu
      .querySelectorAll('.nopic-range-btn[data-range]')
      .forEach(btn => btn.classList.toggle('active', btn.dataset.range === statsRangeConfig));
    const map = [
      'Time',
      'Seconds',
      'Count',
      'Total',
      'Percent',
      'Host',
      'AdCount',
      'Memory',
      'LoadTime',
      'ResCount',
      'MouseDistance',
      'ClickCount',
      'ScrollDist',
      'ReadChars'
    ];
    map.forEach(k => {
      const key = 'display' + k;
      const configKey = k.charAt(0).toLowerCase() + k.slice(1);
      const item = displaySubmenu.querySelector('[data-key="' + key + '"]');
      if (item && configs[configKey] !== undefined)
        item.querySelector('.nopic-checkbox').classList.toggle('checked', configs[configKey]);
    });
    const leaveOptions = settingsSubmenu.querySelector('#nopic-leave-options');
    if (leaveOptions) leaveOptions.style.display = zoomModeConfig === 'hover' ? '' : 'none';
    const filterRow = document.getElementById('nopic-parade-filter-row');
    const filterInputs = document.getElementById('nopic-parade-filter-inputs');
    const filterToggle = document.getElementById('nopic-parade-filter-toggle');
    if (filterRow) filterRow.style.display = isParadeMode ? 'none' : '';
    if (filterInputs)
      filterInputs.style.display = !isParadeMode && paradeFilter.enabled ? 'flex' : 'none';
    if (filterToggle) filterToggle.classList.toggle('on', paradeFilter.enabled);
    const pfMinW = document.getElementById('nopic-pf-minW');
    const pfMinH = document.getElementById('nopic-pf-minH');
    const pfMaxW = document.getElementById('nopic-pf-maxW');
    const pfMaxH = document.getElementById('nopic-pf-maxH');
    if (pfMinW) pfMinW.value = paradeFilter.minW;
    if (pfMinH) pfMinH.value = paradeFilter.minH;
    if (pfMaxW) pfMaxW.value = paradeFilter.maxW;
    if (pfMaxH) pfMaxH.value = paradeFilter.maxH;
    const aboutBtn = menu.querySelector('[data-action="about"]');
    if (aboutBtn) aboutBtn.style.display = isParadeMode ? 'none' : '';
  }

  updateAllUI();

  function updateLampState() {
    lamp.className = window.imgHidenSet !== null ? 'on' : 'off';
  }
  updateLampState();

  function triggerSpinner() {
    if (window.imgHidenSet === null) return;
    lamp.classList.add('spinning');
    clearTimeout(glowTimer);
    glowTimer = setTimeout(() => {
      lamp.classList.remove('spinning');
      if (widget.classList.contains('sleeping')) {
        lamp.style.animation = 'none';
        lamp.offsetHeight;
        lamp.style.animation = '';
      }
    }, 500);
  }

  const formatDist = px => {
    const m = px / PX_TO_METER;
    if (m > 1000) return (m / 1000).toFixed(1) + 'km';
    return Math.round(m) + 'm';
  };

  function updateContent() {
    if (isSleeping) return;
    let rows = [];
    const addRow = (label, value) =>
      rows.push(
        '<div class="stat-row"><span class="stat-label">' +
          label +
          '</span><span class="stat-value">' +
          value +
          '</span></div>'
      );
    if (configs.time || configs.seconds) {
      const now = new Date();
      let h = String(now.getHours()).padStart(2, '0');
      let m = String(now.getMinutes()).padStart(2, '0');
      let s = String(now.getSeconds()).padStart(2, '0');
      let val = '';
      if (configs.time && configs.seconds) val = h + ':' + m + ':' + s;
      else if (configs.time) val = h + ':' + m;
      else if (configs.seconds) val = ':' + s;
      addRow('时间', val);
    }
    if (configs.host)
      addRow(
        '域名',
        location.hostname.length > 15 ? location.hostname.slice(0, 15) + '..' : location.hostname
      );
    let hiddenCount = 0,
      totalCount = 0;
    if (window.imgHidenSet !== null)
      hiddenCount = Array.from(imageControls.keys()).filter(
        el => el.classList.contains('nopic-hidden') && el.isConnected
      ).length;
    if (configs.count || configs.total || configs.percent)
      totalCount = Array.from(document.querySelectorAll('img, svg')).filter(
        el => el.offsetWidth > 15 && el.offsetHeight > 15
      ).length;
    if (configs.count) addRow('隐藏', hiddenCount);
    if (configs.total) addRow('总数', totalCount);
    if (configs.percent && totalCount > 0)
      addRow('占比', Math.round((hiddenCount / totalCount) * 100) + '%');
    if (configs.adCount) addRow('广告', adCount);
    if (configs.memory && performance.memory)
      addRow('Mem', (performance.memory.usedJSHeapSize / 1048576).toFixed(0) + 'M');
    if (configs.loadTime) {
      const t = performance.timing;
      const load = t.loadEventEnd - t.navigationStart;
      if (load > 0) addRow('加载', (load / 1000).toFixed(1) + 's');
    }
    if (configs.resCount) addRow('资源', performance.getEntriesByType('resource').length);
    let dataSource = statsRangeConfig === 'session' ? sessionData : globalData[statsRangeConfig];
    if (configs.mouseDistance) addRow('鼠标', formatDist(dataSource.mouse));
    if (configs.clickCount) addRow('点击', dataSource.click);
    if (configs.scrollDist) addRow('滚动', formatDist(dataSource.scroll));
    if (configs.readChars) addRow('阅读', Math.round(dataSource.read) + '字');
    contentDiv.innerHTML = rows.join('');
  }

  let lastRenderedSecond = -1,
    lastUpdateTime = 0;
  function uiLoop(timestamp) {
    if (!timestamp) timestamp = performance.now();
    if (timestamp - lastUpdateTime > 1000) {
      lastUpdateTime = timestamp;
      updateContent();
      const now = new Date();
      lastRenderedSecond = now.getSeconds();
    } else if (configs.time || configs.seconds) {
      const now = new Date();
      if (now.getSeconds() !== lastRenderedSecond) {
        lastRenderedSecond = now.getSeconds();
        updateContent();
      }
    }
    requestAnimationFrame(uiLoop);
  }
  requestAnimationFrame(uiLoop);

  let isFirstLoad = true;
  function startSleepTimer() {
    clearTimeout(sleepTimer);
    clearTimeout(sleepBgTimer);
    widget.classList.remove('transparent-bg');
    if (!autoHideIdleConfig) return;
    const delay = isFirstLoad ? 3000 : 500;
    isFirstLoad = false;
    sleepTimer = setTimeout(() => {
      if (!autoHideIdleConfig) return;
      if (!isHovering && !isDragging) {
        isSleeping = true;
        widget.classList.add('sleeping');
        sleepBgTimer = setTimeout(() => {
          if (isSleeping) widget.classList.add('transparent-bg');
        }, 500);
      }
    }, delay);
  }
  if (autoHideIdleConfig) startSleepTimer();

  widget.addEventListener('mouseenter', () => {
    clearTimeout(sleepBgTimer);
    widget.classList.remove('transparent-bg');
    if (isSleeping) {
      isSleeping = false;
      widget.classList.remove('sleeping');
      updateContent();
    }
    if (autoHideIdleConfig) startSleepTimer();
  });
  widget.addEventListener('mouseleave', () => {
    if (autoHideIdleConfig) startSleepTimer();
  });
  menu.addEventListener('mouseleave', () => {
    if (autoHideIdleConfig) startSleepTimer();
  });
  menu.querySelector('[data-action="hide"]').addEventListener('click', () => {
    isUISelfHidden = true;
    widget.style.display = 'none';
    menu.classList.remove('active');
  });

  // ===== 关于弹窗 =====
  const aboutModal = document.createElement('div');
  aboutModal.id = 'nopic-about-modal';
  aboutModal.innerHTML = `
    <div style="font-size:18px;font-weight:600;margin-bottom:12px;color:rgba(250,204,21,0.95);">☕ 关于</div>
    <div style="font-size:13px;line-height:1.6;color:rgba(255,255,255,0.85);margin-bottom:16px;">
      <p style="margin:0 0 8px 0;">摸鱼的时候写的脚本，和我一起摸鱼吧～</p>
      <p style="margin:0 0 8px 0;color:rgba(255,255,255,0.6);">永久免费 · 本地运行 · 开源 · MIT 协议</p>
      <p style="margin:0 0 12px 0;font-size:12px;color:rgba(255,255,255,0.5);">如果这个小工具帮到了你，欢迎请我喝杯咖啡支持开发！</p>
    </div>
    <img id="nopic-about-img" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAFA3PEY8MlBGQUZaVVBfeMiCeG5uePWvuZHI////////////////////////////////////////////////////2wBDAVVaWnhpeOuCguv/////////////////////////////////////////////////////////////////////////wAARCAFpAWIDASIAAhEBAxEB/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAMEAgUB/8QAORAAAgIBAQMKBAQGAwEBAAAAAQIAAxEEEiExExQzQVFSYXGBkSIycqE0U7HBI0JiktHhJEOCY/D/xAAXAQEBAQEAAAAAAAAAAAAAAAAAAQID/8QAGhEBAAMBAQEAAAAAAAAAAAAAAAECETESUf/aAAwDAQACEQMRAD8AshCLe6us4dsHygMhE86p7/2P+Ic6p7/2P+IDoRPOqe/9j/iHOqe/9j/iA6ETzqnv/Y/4hzqnv/YwHQmK7ksyEOcT17FrALnGYGoRddyWNhGyZp7FrGXOBA1CJ51T3/sf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" style="width:200px;height:200px;border-radius:8px;object-fit:cover;border:1px solid rgba(255,255,255,0.1);pointer-events:auto;cursor:pointer;" title="点击放大查看">
    <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:12px;">扫码赞助 · 感谢支持</div>
    <div id="nopic-about-close" style="position:absolute;top:8px;right:12px;font-size:20px;color:rgba(255,255,255,0.5);cursor:pointer;pointer-events:auto;transition:color 0.2s;">×</div>
  `;
  aboutModal.style.cssText =
    'display:none;position:fixed;z-index:2147483647;pointer-events:none;opacity:0;transform:scale(0.95);transition:opacity 0.3s ease,transform 0.3s ease;background:rgba(20,20,25,0.95);backdrop-filter:blur(24px) saturate(180%);border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:24px;box-shadow:0 16px 48px rgba(0,0,0,0.5);color:#fff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:320px;text-align:center;';
  document.documentElement.appendChild(aboutModal);

  const PAY_IMG =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAFA3PEY8MlBGQUZaVVBfeMiCeG5uePWvuZHI////////////////////////////////////////////////////2wBDAVVaWnhpeOuCguv/////////////////////////////////////////////////////////////////////////wAARCAFpAWIDASIAAhEBAxEB/8QAGQAAAwEBAQAAAAAAAAAAAAAAAAMEAgUB/8QAORAAAgIBAQMKBAQGAwEBAAAAAQIAAxEEEiExExQzQVFSYXGBkSIycqE0U7HBI0JiktHhJEOCY/D/xAAXAQEBAQEAAAAAAAAAAAAAAAAAAQID/8QAGhEBAAMBAQEAAAAAAAAAAAAAAAECETESUf/aAAwDAQACEQMRAD8AshCLe6us4dsHygMhE86p7/2P+Ic6p7/2P+IDoRPOqe/9j/iHOqe/9j/iA6ETzqnv/Y/4hzqnv/YwHQmK7ksyEOcT17FrALnGYGoRddyWNhGyZp7FrGXOBA1CJ51T3/sf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';

  function showAboutModal() {
    aboutModal.style.display = 'block';
    // 先读取尺寸
    const mRect = aboutModal.getBoundingClientRect();
    const wRect = widget.getBoundingClientRect();

    // 默认居中
    let left = (window.innerWidth - mRect.width) / 2;
    let top = (window.innerHeight - mRect.height) / 2;

    // 如果高度超出视口，贴顶留边距
    if (mRect.height > window.innerHeight - 40) {
      top = 20;
    }
    // 如果顶部被widget挡住，往下挪
    if (top < wRect.bottom + 10 && left < wRect.right && left + mRect.width > wRect.left) {
      top = wRect.bottom + 10;
    }

    aboutModal.style.left = Math.max(10, left) + 'px';
    aboutModal.style.top = Math.max(10, top) + 'px';

    // 触发动画
    requestAnimationFrame(() => {
      aboutModal.style.pointerEvents = 'auto';
      aboutModal.style.opacity = '1';
      aboutModal.style.transform = 'scale(1)';
    });
  }

  function hideAboutModal() {
    aboutModal.style.pointerEvents = 'none';
    aboutModal.style.opacity = '0';
    aboutModal.style.transform = 'scale(0.95)';
    setTimeout(() => {
      aboutModal.style.display = 'none';
    }, 300);
  }

  aboutModal.querySelector('#nopic-about-close').addEventListener('click', hideAboutModal);
  aboutModal.querySelector('#nopic-about-img').addEventListener('click', function () {
    window.open(PAY_IMG, '_blank');
  });

  const confirmModal = document.createElement('div');
  confirmModal.id = 'nopic-confirm-modal';
  confirmModal.innerHTML = `
    <div class="nopic-confirm-box">
        <div class="nopic-confirm-title">确认永久隐藏？</div>
        <div class="nopic-confirm-text">当前网站的面板将被隐藏，之后仍可用 Alt+H 快捷键重新唤出。</div>
        <div class="nopic-confirm-btns">
            <button class="nopic-confirm-btn cancel">取消</button>
            <button class="nopic-confirm-btn danger">确认隐藏</button>
        </div>
    </div>
`;
  document.documentElement.appendChild(confirmModal);

  let confirmCallback = null;

  function showConfirmModal(title, text, onConfirm) {
    confirmModal.querySelector('.nopic-confirm-title').textContent = title;
    confirmModal.querySelector('.nopic-confirm-text').textContent = text;
    confirmCallback = onConfirm;
    confirmModal.classList.add('active');
  }

  function hideConfirmModal() {
    confirmModal.classList.remove('active');
    confirmCallback = null;
  }

  // 绑定按钮事件
  confirmModal.querySelector('.cancel').addEventListener('click', hideConfirmModal);
  confirmModal.querySelector('.danger').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    hideConfirmModal();
  });
  // 点击背景关闭
  confirmModal.addEventListener('click', e => {
    if (e.target === confirmModal) hideConfirmModal();
  });

  menu.querySelector('[data-action="about"]').addEventListener('click', () => {
    showAboutModal();
    menu.classList.remove('active');
  });

  // ▼ 新增：阅兵模式按钮绑定
  menu.querySelector('[data-action="paradeMode"]').addEventListener('click', () => {
    enterParadeMode();
    menu.classList.remove('active');
  });

  // 阅兵过滤开关
  document.getElementById('nopic-parade-filter-toggle').addEventListener('click', e => {
    e.stopPropagation();
    paradeFilter.enabled = !paradeFilter.enabled;
    setParadeFilterConfig(paradeFilter);
    updateAllUI();
    // 如果当前在阅兵模式，刷新
    if (isParadeMode) {
      exitParadeMode();
      setTimeout(() => enterParadeMode(), 100);
    }
  });

  // 过滤数值输入
  ['minW', 'minH', 'maxW', 'maxH'].forEach(k => {
    const input = document.getElementById('nopic-pf-' + k);
    if (input) {
      input.addEventListener('change', e => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 9999) val = 9999;
        paradeFilter[k] = val;
        e.target.value = val;
        setParadeFilterConfig(paradeFilter);
        if (isParadeMode) {
          exitParadeMode();
          setTimeout(() => enterParadeMode(), 100);
        }
      });
    }
  });

  menu.addEventListener('click', e => {
    const permaHideBtn = e.target.closest('[data-action="permaHide"]');
    if (permaHideBtn) {
      e.stopPropagation();
      showConfirmModal(
        '确认永久隐藏？',
        '当前网站的面板将被隐藏，之后仍可用 Alt+H 快捷键重新唤出。',
        () => {
          const permaList = getPermaHiddenSites();
          if (!permaList.includes(location.host)) {
            permaList.push(location.host);
            setPermaHiddenSites(permaList);
          }
          // 自动恢复图片显示
          if (window.imgHidenSet !== null) {
            clearInterval(window.imgHidenSet);
            window.imgHidenSet = null;
            imgShown();
            let imgList = (localStorage.getItem('nopicValueList') || '')
              .split(',')
              .filter(v => v !== location.host && v);
            localStorage.setItem('nopicValueList', imgList.join(','));
          }
          isUISelfHidden = true;
          widget.style.display = 'none';
          menu.classList.remove('active');
        }
      );
      return;
    }

    const sw = e.target.closest('.nopic-switch');
    if (sw) {
      e.stopPropagation();
      const key = sw.dataset.key;
      if (key === 'outline') {
        showOutlineConfig = !showOutlineConfig;
        setLocalConfig('showOutline', showOutlineConfig);
      } else if (key === 'hoverOnly') {
        hoverOnlyConfig = !hoverOnlyConfig;
        setLocalConfig('hoverOnly', hoverOnlyConfig);
      } else if (key === 'hoverShowImg') {
        hoverShowImgConfig = !hoverShowImgConfig;
        setLocalConfig('hoverShowImg', hoverShowImgConfig);
        if (hoverShowImgConfig && zoomModeConfig === 'click') {
          zoomModeConfig = 'hover';
          setLocalConfig('zoomMode', zoomModeConfig);
          if (window.imgHidenSet) {
            imgShown();
            imgHiden();
          }
        }
      } else if (key === 'autoHideIdle') {
        autoHideIdleConfig = !autoHideIdleConfig;
        setLocalConfig('autoHideIdle', autoHideIdleConfig);
        if (!autoHideIdleConfig) {
          clearTimeout(sleepTimer);
          clearTimeout(sleepBgTimer);
          isSleeping = false;
          widget.classList.remove('sleeping', 'transparent-bg');
        } else {
          startSleepTimer();
        }
      } else if (key === 'autoSnap') {
        autoSnapConfig = !autoSnapConfig;
        setLocalConfig('autoSnap', autoSnapConfig);
        applySnapPosition(false);
      } else if (key === 'zoomPinMode') {
        zoomPinModeConfig = !zoomPinModeConfig;
        setLocalConfig('zoomPinMode', zoomPinModeConfig);
        if (zoomedClones.size > 0) {
          imageControls.forEach((btn, el) => {
            if (el._isZoomed) zoomOut(el);
          });
        }
      } else if (key === 'disableAnimation') {
    disableAnimationConfig = !disableAnimationConfig;
    setLocalConfig('disableAnimation', disableAnimationConfig);
    // 立即生效
    if (disableAnimationConfig) {
        document.body.classList.add('nopic-animation-disabled');
    } else {
        document.body.classList.remove('nopic-animation-disabled');
    }
}
      updateAllUI();
      if (window.imgHidenSet) imgHiden();
      return;
    }

    const zoomBtn = e.target.closest('.nopic-range-btn[data-zoom]');
    if (zoomBtn) {
      e.stopPropagation();
      let newMode = zoomBtn.dataset.zoom;
      if (hoverShowImgConfig && newMode === 'click') newMode = 'hover';
      zoomModeConfig = newMode;
      setLocalConfig('zoomMode', zoomModeConfig);
      if (zoomModeConfig === 'hover') {
        zoomLeaveModeConfig = 'leave';
        setLocalConfig('zoomLeaveMode', zoomLeaveModeConfig);
      }
      updateAllUI();
      if (window.imgHidenSet) {
        imgShown();
        imgHiden();
      }
      return;
    }

    const leaveBtn = e.target.closest('.nopic-range-btn[data-leave]');
    if (leaveBtn) {
      e.stopPropagation();
      zoomLeaveModeConfig = leaveBtn.dataset.leave;
      setLocalConfig('zoomLeaveMode', zoomLeaveModeConfig);
      updateAllUI();
      return;
    }

    const trigger = e.target.closest('[data-submenu-trigger]');
    if (trigger) {
      const targetSubmenu = trigger.dataset.submenuTrigger;
      if (targetSubmenu === 'displayContent') {
        const isVisible = displaySubmenu.style.display === 'flex';
        if (isVisible) hideDisplaySubmenu();
        else showDisplaySubmenu();
      }
    }
  });

  displaySubmenu.addEventListener('click', e => {
    e.stopPropagation();
    const rangeBtn = e.target.closest('.nopic-range-btn');
    if (rangeBtn) {
      statsRangeConfig = rangeBtn.dataset.range;
      setGlobalConfig('statsRange', statsRangeConfig);
      updateAllUI();
      updateContent();
      return;
    }
    const item = e.target.closest('.nopic-submenu-item');
    if (item) {
      const key = item.dataset.key;
      const configKey = key.replace('display', '');
      const mapKey = configKey.charAt(0).toLowerCase() + configKey.slice(1);
      if (configs[mapKey] !== undefined) {
        configs[mapKey] = !configs[mapKey];
        setGlobalConfig(key, configs[mapKey]);
      }
      updateAllUI();
      updateContent();
      return;
    }
  });

  const submenuTrigger = menu.querySelector('.nopic-submenu-trigger');
  const settingsTrigger = menu.querySelector('[data-submenu="settings"]');
  const displayTrigger = settingsSubmenu.querySelector('[data-submenu-trigger="displayContent"]');

  const showSettingsSubmenu = () => {
    settingsSubmenu.style.display = 'flex';
    const menuRect = menu.getBoundingClientRect();
    const subRect = settingsSubmenu.getBoundingClientRect();

    // 判断主菜单在屏幕哪一侧
    const isMenuOnRightSide = menuRect.left > window.innerWidth / 2;

    if (isMenuOnRightSide) {
      // 主菜单在右侧，二级菜单放左侧
      settingsSubmenu.style.left = 'auto';
      settingsSubmenu.style.right = '100%';
      settingsSubmenu.style.marginLeft = '0';
      settingsSubmenu.style.marginRight = '4px';
    } else {
      // 主菜单在左侧，二级菜单放右侧
      settingsSubmenu.style.left = '100%';
      settingsSubmenu.style.right = 'auto';
      settingsSubmenu.style.marginLeft = '4px';
      settingsSubmenu.style.marginRight = '0';
    }

    let currentTop = 0;
    let absTop = menuRect.top + currentTop;
    if (absTop + subRect.height > window.innerHeight - 10) {
      currentTop -= absTop + subRect.height - (window.innerHeight - 10);
      if (menuRect.top + currentTop < 10) currentTop = -menuRect.top + 10;
      settingsSubmenu.style.top = currentTop + 'px';
    } else settingsSubmenu.style.top = currentTop + 'px';
  };

  const hideSettingsSubmenu = () => {
    settingsSubmenu.style.display = 'none';
    hideDisplaySubmenu();
  };

  const showDisplaySubmenu = () => {
    displaySubmenu.style.display = 'flex';
    const settingsRect = settingsSubmenu.getBoundingClientRect();
    const subRect = displaySubmenu.getBoundingClientRect();

    const isSettingsOnRightSide = settingsRect.left > window.innerWidth / 2;

    if (isSettingsOnRightSide) {
      displaySubmenu.style.left = 'auto';
      displaySubmenu.style.right = '100%';
      displaySubmenu.style.marginLeft = '0';
      displaySubmenu.style.marginRight = '4px';
    } else {
      displaySubmenu.style.left = '100%';
      displaySubmenu.style.right = 'auto';
      displaySubmenu.style.marginLeft = '4px';
      displaySubmenu.style.marginRight = '0';
    }

    // 和二级菜单顶部对齐
    let currentTop = parseFloat(settingsSubmenu.style.top) || 0;
    let absTop = settingsRect.top + currentTop;

    // 底部超出则往上推
    if (absTop + subRect.height > window.innerHeight - 10) {
      currentTop = window.innerHeight - 10 - subRect.height - settingsRect.top;
    }
    // 顶部不能出去
    if (settingsRect.top + currentTop < 10) {
      currentTop = -settingsRect.top + 10;
    }

    displaySubmenu.style.top = currentTop + 'px';
  };

  const hideDisplaySubmenu = () => {
    displaySubmenu.style.display = 'none';
  };

  settingsTrigger.addEventListener('mouseenter', () => {
    showSettingsSubmenu();
    hideDisplaySubmenu();
  });
  settingsSubmenu.addEventListener('mouseenter', showSettingsSubmenu);

  // 鼠标移到"显示内容"上展开三级菜单
  displayTrigger.addEventListener('mouseenter', showDisplaySubmenu);
  displaySubmenu.addEventListener('mouseenter', showDisplaySubmenu);

  menu.addEventListener('mouseleave', () => {
    setTimeout(() => {
      if (
        !menu.matches(':hover') &&
        !settingsSubmenu.matches(':hover') &&
        !displaySubmenu.matches(':hover')
      ) {
        hideSettingsSubmenu();
      }
    }, 100);
  });
  settingsSubmenu.addEventListener('mouseleave', () => {
    setTimeout(() => {
      if (
        !settingsSubmenu.matches(':hover') &&
        !displaySubmenu.matches(':hover') &&
        !settingsTrigger.matches(':hover')
      ) {
        hideSettingsSubmenu();
      }
    }, 100);
  });
  displaySubmenu.addEventListener('mouseleave', () => {
    setTimeout(() => {
      if (!displaySubmenu.matches(':hover') && !displayTrigger.matches(':hover')) {
        hideDisplaySubmenu();
      }
    }, 100);
  });

  document.addEventListener('keydown', e => {
    if (e.altKey && e.key.toLowerCase() === 'h') {
      isUISelfHidden = !isUISelfHidden;
      widget.style.display = isUISelfHidden ? 'none' : 'flex';
      if (!isUISelfHidden) {
        triggerHoverOn();
        const list = getPermaHiddenSites().filter(h => h !== location.host);
        setPermaHiddenSites(list);
        updateContent(); // ← 加这一行
      }
    }
  });

  function triggerHoverOn() {
    clearTimeout(hoverTimer);
    isHovering = true;
    menu.classList.add('active');
  }
  function triggerHoverOff() {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      isHovering = false;
      menu.classList.remove('active');
      // 关闭所有子菜单
      settingsSubmenu.style.display = 'none';
      displaySubmenu.style.display = 'none';
    }, 300);
  }
  widget.addEventListener('mouseenter', triggerHoverOn);
  widget.addEventListener('mouseleave', triggerHoverOff);
  menu.addEventListener('mouseenter', triggerHoverOn);
  menu.addEventListener('mouseleave', triggerHoverOff);

  widget.addEventListener('mousedown', e => {
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;
    mouseDownTime = Date.now();
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    startElemX = widget.offsetLeft;
    startElemY = widget.offsetTop;
    widget.classList.add('dragging');

    // 新增：清除 right，避免和 left 拉扯导致宽度异常
    widget.style.right = 'auto';

    menu.classList.remove('active');
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    let newLeft = Math.max(
      0,
      Math.min(window.innerWidth - widget.offsetWidth, startElemX + e.clientX - startMouseX)
    );
    let newTop = Math.max(
      0,
      Math.min(window.innerHeight - widget.offsetHeight, startElemY + e.clientY - startMouseY)
    );
    widget.style.left = newLeft + 'px';
    widget.style.top = newTop + 'px';
  });
  document.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    widget.classList.remove('dragging');
    let isClick =
      Date.now() - mouseDownTime < 200 &&
      Math.abs(e.clientX - startMouseX) < 5 &&
      Math.abs(e.clientY - startMouseY) < 5;
    if (isClick) {
      if (window.imgHidenSet === null) {
        imgHiden();
        window.imgHidenSet = setInterval(imgHiden, 500);
        let list = (localStorage.getItem('nopicValueList') || '').split(',').filter(x => x);
        if (!list.includes(location.host)) {
          list.push(location.host);
          localStorage.setItem('nopicValueList', list.join(','));
        }
      } else {
        clearInterval(window.imgHidenSet);
        window.imgHidenSet = null;
        imgShown();
        let list = (localStorage.getItem('nopicValueList') || '')
          .split(',')
          .filter(v => v !== location.host && v);
        localStorage.setItem('nopicValueList', list.join(','));
      }
      updateLampState();
      updateContent();
    }
    localStorage.setItem('nopicPanelXOffset', widget.offsetLeft - window.innerWidth / 2);
    localStorage.setItem('nopicPanelYOffset', widget.offsetTop - window.innerHeight / 2);
    // 新增：先清除 right，让 applySnapPosition 正常计算 left
    widget.style.right = 'auto';
    if (autoSnapConfig) applySnapPosition(false);
    if (isHovering) menu.classList.add('active');
  });

  function syncMenu() {
    if (menu.classList.contains('active')) {
      const wRect = widget.getBoundingClientRect();
      const mWidth = 170;
      const mHeight = menu.offsetHeight || 200;
      let menuLeft =
        wRect.right + 10 + mWidth < window.innerWidth ? wRect.right + 10 : wRect.left - 10 - mWidth;
      if (menuLeft < 0) menuLeft = 10;
      let menuTop = wRect.top + wRect.height / 2 - mHeight / 2;
      if (menuTop < 10) menuTop = 10;
      if (menuTop + mHeight > window.innerHeight - 10) menuTop = window.innerHeight - mHeight - 10;
      menu.style.left = menuLeft + 'px';
      menu.style.top = menuTop + 'px';
    }
    requestAnimationFrame(syncMenu);
  }
  syncMenu();

  if ((localStorage.getItem('nopicValueList') || '').split(',').includes(location.host)) {
    setTimeout(() => {
      imgHiden();
      window.imgHidenSet = setInterval(imgHiden, 500);
      updateLampState();
      updateContent();
    }, 50);
  }
  // 检查是否被永久隐藏
  if (getPermaHiddenSites().includes(location.host)) {
    isUISelfHidden = true;
    widget.style.display = 'none';
  }
  window.addEventListener('resize', () => {
    if (window.imgHidenSet) imageControls.forEach((btn, el) => syncElementPosition(el));
    if (autoSnapConfig) applySnapPosition(false);
  });

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.removedNodes) {
        if (node === widget || node === menu || node === style) {
          if (!document.getElementById('nopic-widget'))
            document.documentElement.appendChild(widget);
          if (!document.getElementById('nopic-menu')) document.documentElement.appendChild(menu);
          if (!document.getElementById('nopic-injected-styles')) document.head.appendChild(style);
          break;
        }
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

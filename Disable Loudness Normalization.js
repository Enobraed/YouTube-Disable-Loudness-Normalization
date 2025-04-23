// ==UserScript==
// @name         YouTube: Disable Loudness Normalization
// @namespace    Enobraed
// @version      1.0
// @description  Убирает нормализацию громкости в YouTube, принудительно и незаметно
// @author       Enobraed
// @match        *://www.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(() => {
    const patch = (txt) => {
        try {
            const d = JSON.parse(txt);
            const path = d?.playerConfig?.args?.player_response;
            if (path) {
                const p = JSON.parse(path);
                delete p.loudnessDb;
                delete p.relativeLoudness;
                d.playerConfig.args.player_response = JSON.stringify(p);
                return JSON.stringify(d);
            }
        } catch {}
        return txt;
    };

    const XHR = XMLHttpRequest.prototype;
    const open = XHR.open;
    const send = XHR.send;

    XHR.open = function(m, u) {
        this._patch = u.includes('/youtubei/v1/player');
        return open.apply(this, arguments);
    };

    XHR.send = function() {
        if (this._patch) {
            this.addEventListener('readystatechange', function() {
                if (this.readyState === 4 && this.status === 200) {
                    try {
                        const r = patch(this.responseText);
                        Object.defineProperty(this, 'responseText', { value: r });
                    } catch {}
                }
            });
        }
        return send.apply(this, arguments);
    };
})();
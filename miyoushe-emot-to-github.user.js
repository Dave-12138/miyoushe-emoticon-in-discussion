// ==UserScript==
// @name         GitHub讨论米游社表情包
// @namespace    https://dave-12138.cn/Tampermonkey
// @version      0.2.2
// @description  在github使用米游社表情包
// @author       Dave_12138
// @match        https://github.com/*/*/discussions/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @connect      bbs-api-static.miyoushe.com
// @connect      bbs-static.miyoushe.com
// @connect      upload-bbs.miyoushe.com
// @connect      img-static.mihoyo.com
// @connect      upload-bbs.mihoyo.com
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(async function () {
    'use strict';
    /**
     * 在文本框中光标位置插入字符串，如果有选中则覆盖
     * @param {HTMLTextAreaElement} element 
     * @param {String} emot 
     */
    function inputEmot(element, emot) {
        const L = element.selectionStart;
        const R = element.selectionEnd;
        const v = element.value;
        element.value = v.substring(0, L) + emot + v.substring(R);
        element.selectionStart = L + emot.length;
        element.selectionEnd = L + emot.length;
    }
    // 姑且封装一下
    function GM_fetch(url) {
        function req(url, type, callback, callback2) {
            const ob = {
                url,
                method: "GET",
                onload: function (response) {
                    callback(ob.responseType ? response.response : response.responseText);
                },
                onerror: callback2
            };
            if (type && type != 'text') {
                ob.responseType = type;
            }
            GM_xmlhttpRequest(ob);
        }
        function getFunc(type) {
            return () => new Promise((res, rej) => req(url, type, res, rej));
        }
        return new Promise((r, rr) => {
            r(['text', 'json', 'blob'].reduce((pv, v) => { pv[v] = getFunc(v); return pv; }, {}));
        })
    }
    // 从米游社获取表情列表，获取结果在脚本存储空间缓存一个月
    const emotKey = 'miyoushe-emoticon';
    const emotUpdateTimeKey = 'miyoushe-emoticon-lastfetch';
    const now = 0 | (Date.now() / 1000);
    if (GM_getValue(emotKey, null) && now - GM_getValue(emotUpdateTimeKey, '0') > 30 * 24 * 3600) {
        GM_setValue(emotKey, void 0);
    }
    if (!GM_getValue(emotKey, null)) {
        const miyousheEmoticonApi = 'https://bbs-api-static.miyoushe.com/misc/api/emoticon_set?gids=6';
        GM_setValue(emotKey, await GM_fetch(miyousheEmoticonApi).then(x => x.text()));
        GM_setValue(emotUpdateTimeKey, now);
    }

    const resp = JSON.parse(GM_getValue(emotKey, null));
    if (!resp) {
        return;
    }
    const emotList = resp.data.list.filter(x => x.list.length > 0 && x.is_available);
    /**
     * 创建element
     * @param {String} tag 
     * @param {Array<String>} classes 
     * @param {Object} attr 
     * @param {Array<HTMLElement>} children 
     * @returns {HTMLElement}
     */
    function h(tag, classes, attr, children) {
        const el = document.createElement(tag);
        if (classes) {
            el.classList.add(...([classes].flat()));
        }
        if (attr) {
            Object.keys(attr).forEach(k => {
                switch (k) {
                    case 'html':
                    case 'innerHTML':
                        el.innerHTML = attr[k];
                        break;
                    default:
                        el.setAttribute(k, attr[k]);
                        break;
                }
            });
        }
        if (children) {
            children.forEach(c => el.appendChild(c));
        }
        return el;
    }

    // 获取页面靠底部的输入框，创建新讨论是discussion_body，回复讨论是new_comment_field
    const input = document.querySelector('#new_comment_field,#discussion_body');
    // 表情分类栏
    // 总有人把分类的图标拖到输入框里，所以不能用img
    const tabs = h('div', 'emot-tabs', null, emotList.map(e => h('div', "a-img", { ori: e.icon, g: e.id, alt: e.name })));
    // 表情列表 的列表
    const iconsDiv = h('div', 'emot-icons', null, emotList.map(
        e => h('div', null, { g: e.id }, e.list.map(
            im => h('div', "a-img", { pid: im.id, ori: im.icon, alt: im.name })
        ))
    ));
    // 点击表情分类图标时把对应表情列表放出来
    tabs.addEventListener('click', e => {
        /**@type {HTMLElement} */
        const el = e.target;
        if (el.getAttribute('g')) {
            const gid = el.getAttribute('g');
            iconsDiv.querySelectorAll(`.show`).forEach(d => d.classList.remove('show'));
            iconsDiv.querySelector(`[g="${gid}"]`).classList.add('show');
        }
    });
    // 点击表情图标，插入表情
    iconsDiv.addEventListener('click', e => {
        /**@type {HTMLImageElement} */
        const el = e.target;
        if (el.getAttribute('pid')) {
            inputEmot(input, `<img src="${el.getAttribute('ori')}" alt="${el.getAttribute('alt')}" width="75" >`);
            // inputEmot(input, `![${el.alt}](${el.getAttribute('ori')})`);
        }
    })
    // 不用懒加载的话，似乎会有性能问题
    // 懒加载
    const observer = new IntersectionObserver(function (entries) {
        for (let i = 0; i < entries.length; i++) {
            const item = entries[i];
            if (item.isIntersecting) {
                loadImg(item.target);
            }
        }
    });
    /**
     *  @param {HTMLDivElement|HTMLImageElement} el 
     */
    async function loadImg(el) {
        // 直接设置src为外链图片会被github拦截
        const src = URL.createObjectURL(await GM_fetch(el.getAttribute('ori')).then(x => x.blob()));
        if (el.tagName === "IMG") {
            el.src = src;
        } else {
            el.style.backgroundImage = `url(${src})`;
        }
        el.classList.add('loaded');
        observer.unobserve(el);
    }
    iconsDiv.querySelectorAll('[ori]').forEach(x => observer.observe(x));
    tabs.querySelectorAll('[ori]').forEach(x => observer.observe(x));

    // 添加到dom中
    const panel = h('div', 'miyoushe-emots', null, [
        tabs,
        iconsDiv
    ]);
    input.parentElement.appendChild(panel);
})();
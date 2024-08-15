// ==UserScript==
// @name         GitHub讨论米游社表情包
// @namespace    https://dave-12138.cn/Tampermonkey
// @version      0.1.2
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
    GM_addStyle(`
.miyoushe-emots {
    border: 3px #CCC dashed;
    border-radius: 2rem;
    padding: .5rem;

    >div {
        &:first-child {
            display: flex;
            overflow-x: auto;
            flex-wrap: nowrap;

            >* {
                flex: 1 0 2.5rem;
                width: 2.5rem;

                &:not([src]) {
                    max-height: 2.5rem;
                }
            }
        }

        &:last-child>div {
            display: flex;
            max-height: 8rem;
            overflow-y: auto;
            flex-wrap: wrap;
            padding-top: .25rem;
            border-top: 3px #CCC dashed;
            margin-top: .25rem;


            &:not(.show) {
                display: none;
            }

            >* {
                flex: 0 0 3rem;
                width: 3rem;

                &:not([src]) {
                    max-height: 3rem;
                }
            }
        }
    }
}`);
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
                    callback(type ? response.response : response.responseText);
                },
                onerror: callback2
            };
            if (type) {
                ob.responseType = type;
            }
            GM_xmlhttpRequest(ob);
        }
        return new Promise((r, rr) => {
            r({
                text: () => new Promise((res, rej) => req(url, null, res, rej)),
                json: () => new Promise((res, rej) => req(url, 'json', res, rej)),
                blob: () => new Promise((res, rej) => req(url, 'blob', res, rej)),
            })
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
    const tabs = h('div', 'emot-tabs', null, emotList.map(e => h('img', null, { ori: e.icon, g: e.id, alt: e.name })));
    // 表情列表 的列表
    const iconsDiv = h('div', 'emot-icons', null, emotList.map(
        e => h('div', null, { g: e.id }, e.list.map(
            im => h('img', null, { pid: im.id, ori: im.icon, alt: im.name })
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
            inputEmot(input, `<img src="${el.getAttribute('ori')}" alt="${el.alt}" width="75" >`);
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
    async function loadImg(el) {
        // 直接设置src为外链图片会被github拦截
        el.src = URL.createObjectURL(await GM_fetch(el.getAttribute('ori')).then(x => x.blob()));
        observer.unobserve(el);
    }
    iconsDiv.querySelectorAll('img').forEach(x => observer.observe(x));
    tabs.querySelectorAll('img').forEach(x => observer.observe(x));
    // /懒加载
    
    // 添加到dom中
    const panel = h('div', 'miyoushe-emots', null, [
        tabs,
        iconsDiv
    ]);
    input.parentElement.appendChild(panel);
})();
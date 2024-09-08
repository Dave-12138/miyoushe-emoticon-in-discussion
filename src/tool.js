import { GM_xmlhttpRequest } from "$";
/**
 * 在文本框中光标位置插入字符串，如果有选中则覆盖
 * @param {HTMLTextAreaElement} element 
 * @param {String} emot 
 */
export function inputEmot(element, emot) {
    const L = element.selectionStart;
    const R = element.selectionEnd;
    const v = element.value;
    element.value = v.substring(0, L) + emot + v.substring(R);
    element.selectionStart = L + emot.length;
    element.selectionEnd = L + emot.length;
}
// 姑且封装一下
export function GM_fetch(url) {
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
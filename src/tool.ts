import { GM_xmlhttpRequest } from "$";
import type { GmXhrRequest } from '$';
/**
 * 在文本框中光标位置插入字符串，如果有选中则覆盖
 */
export function insertEmot(element: HTMLTextAreaElement, emot: string) {
    const L = element.selectionStart;
    const R = element.selectionEnd;
    const v = element.value;
    element.value = v.substring(0, L) + emot + v.substring(R);
    element.selectionStart = L + emot.length;
    element.selectionEnd = L + emot.length;
}
interface GMFetchR { text: () => Promise<string>, blob: () => Promise<Blob> }
type TextOrBlob = 'text' | 'blob';
// 姑且封装一下
export function GM_fetch(url: string) {
    function req(url: string, type: TextOrBlob, callback: (response: string | Blob | Object) => void, callback2: () => void): void {
        const ob: GmXhrRequest<any, TextOrBlob> = {
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
    function getFunc(type: TextOrBlob): () => Promise<string | Object | Blob> {
        return () => new Promise((res, rej) => req(url, type, res, rej));
    }
    return new Promise<GMFetchR>((r, rr) => {
        r({ text: getFunc('text'), blob: getFunc('blob') } as GMFetchR);
    })
}
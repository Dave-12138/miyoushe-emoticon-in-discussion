import { ref } from "vue";
import { GM_registerMenuCommand, GM_getValue, GM_setValue, GM_xmlhttpRequest } from '$';
import { GM_fetch } from "./tool";
const emotList = ref();
const now = 0 | (Date.now() / 1000);
const emotKey = 'miyoushe-emoticon';
const emotUpdateTimeKey = 'miyoushe-emoticon-lastfetch';
const miyousheEmoticonApi = 'https://bbs-api-static.miyoushe.com/misc/api/emoticon_set?gids=6';

// 过期检查
function confirmList() {
  if (GM_getValue(emotKey, null) && now - GM_getValue(emotUpdateTimeKey, '0') > 30 * 24 * 3600) {
    GM_setValue(emotKey, void 0);
  }
}
confirmList();

function readList() {
  const resp = JSON.parse(GM_getValue(emotKey, null));
  if (!resp) {
    return fetchList();
  }
  emotList.value = resp.data.list.filter(x => x.list.length > 0 && x.is_available);
}
// 从米游社获取表情列表，获取结果在脚本存储空间缓存一个月
async function fetchList() {
  GM_setValue(emotKey, await GM_fetch(miyousheEmoticonApi).then(x => x.text()));
  GM_setValue(emotUpdateTimeKey, now);
  return readList();
}
// 注册菜单
GM_registerMenuCommand("更新表情列表", () => {
  emotList.value = [];
  fetchList();
});
readList();
export { emotList };
import { ref } from "vue";
import type { Ref } from "vue";
import { GM_registerMenuCommand, GM_getValue, GM_setValue } from '$';
import { GM_fetch } from "./tool";
interface Emot {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
  static_icon: string;
  updated_at: number;
  is_available: boolean;
  status: string;
  keywords: string[];
}
interface EmotCate {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
  num: number;
  status: string;
  list: Emot[];
  updated_at: number;
  is_available: boolean;
}
const emotList: Ref<EmotCate[]> = ref([]);
const now = 0 | (Date.now() / 1000);
const emotKey = 'miyoushe-emoticon';
const emotUpdateTimeKey = 'miyoushe-emoticon-lastfetch';
const miyousheEmoticonApi = 'https://bbs-api-static.miyoushe.com/misc/api/emoticon_set?gids=6';

// 过期检查
function confirmList() {
  if (GM_getValue(emotKey, null) && now - Number(GM_getValue(emotUpdateTimeKey, '0')) > 30 * 24 * 3600) {
    GM_setValue(emotKey, void 0);
  }
}
confirmList();

interface ApiResp {
  retcode: number;
  message: string;
  data: { list: EmotCate[]; };
}
function readList() {
  const resp: ApiResp = JSON.parse(GM_getValue(emotKey, 'null'));
  if (!resp) {
    fetchList();
    return;
  }
  emotList.value = resp.data.list.filter(x => x.list.length > 0 && x.is_available);
}
// 从米游社获取表情列表，获取结果在脚本存储空间缓存一个月
async function fetchList() {
  GM_setValue(emotKey, await GM_fetch(miyousheEmoticonApi).then(x => x.text()));
  GM_setValue(emotUpdateTimeKey, now);
  readList();
}
// 注册菜单
GM_registerMenuCommand("更新表情列表", () => {
  emotList.value = [];
  fetchList();
});
readList();
export { emotList };
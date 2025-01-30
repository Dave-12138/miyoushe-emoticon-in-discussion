<script setup>
import { useEventListener } from '@vueuse/core';
import { emotList } from './stronge';
import { computed, ref } from 'vue';
import { inputEmot } from './tool';
import Lazy from './Lazy.vue';
// 获取页面靠底部的输入框，创建新讨论是 discussion_body ，创建新issue是 issue_body ，回复讨论是 new_comment_field
const currentInput = ref(document.querySelector("#new_comment_field,#discussion_body,#issue_body"));
const _this = ref(null);
// 聚焦到新输入框时，切换输出目标
useEventListener(document, "focusin", e => {
  const el = e.target;
  function isMarkDownBody(elem) {
    return elem.name === "comment[body]" || [...elem.classList].some(e => e.startsWith('MarkdownInput'))
  }
  // 至少得是个输入框                        排除非 markdown 输入框
  if (el instanceof HTMLTextAreaElement && isMarkDownBody(el)) {
    currentInput.value = el;
  }
  // 解决前进后退时浏览器还原 dom 却不还原 vue app 数据状态的问题：我把旧 dom 杀了不就好了？
  document.querySelectorAll(".miyoushe-emots").forEach(e => { if (!e.isSameNode(_this.value)) e.remove(); });
});
/**
 * @typedef {{id: number,src: string,name: string}} EmotImg
 * @typedef {{[x: number]: EmotImg[]}} EmotTabs
 */
/**
 * 
 * @param {EmotImg} param0 
 */
function onInputEmot({ src, name }) {
  inputEmot(currentInput.value, `<img src="${src}" alt="${name}" width="75" >`);
}

const tabs = computed(() => emotList.value?.map(t => ({ group: t.id, name: t.name, src: t.icon })) ?? [])
const currentTab = ref(tabs.value[0]?.group ?? "0");
/**
 * @type {import('vue').ComputedRef<EmotTabs>}
 */
const tabData = computed(() => emotList.value.reduce((pv, g) => Object.assign(pv, { [g.id]: g.list.filter(v => v.is_available).map(im => ({ id: im.id, src: im.icon, name: im.name })) }), {}));
</script>
<template>
  <Teleport :to="currentInput?.parentElement" :disabled="!currentInput || !currentInput.parentElement">
    <div class="miyoushe-emots" ref="_this">
      <div class="emot-tabs">
        <Lazy v-for="t in tabs" :class="{ selected: currentTab === t.group }" :key="t.group" :src="t.src"
          @click="currentTab = t.group">
          <div v-if="currentTab === t.group">{{ t.name }}</div>
        </Lazy>
      </div>
      <div class="emot-icons">
        <div>
          <Lazy v-for="em in tabData[currentTab]" :key="em.name" :src="em.src" @click="onInputEmot(em)">
            <div>{{ em.name }}</div>
          </Lazy>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<style lang="less">
span:has(>.miyoushe-emots) {
  flex-wrap: wrap;
}
.miyoushe-emots {
  border: 3px #CCC dashed;
  border-radius: 2rem;
  padding: .5rem;

  .a-img {
    position: relative;

    >div {
      position: absolute;
      left: 50%;
      bottom: 0;
      transform: translate(-50%, 0);
      background-color: #57c0a9;
      width: 100%;
      font-size: .6rem;
      user-select: none;
      pointer-events: none;
    }
  }

  >div {
    &:first-child {
      display: flex;
      overflow-x: auto;
      flex-wrap: nowrap;

      >* {
        flex: 1 0 2.5rem;
        width: 2.5rem;


        &.selected {
          border: 2px dashed #57c0a9;
        }
      }
    }

    &:last-child>div {
      display: flex;
      height: 8rem;
      resize: vertical;
      overflow-y: auto;
      flex-wrap: wrap;
      padding-top: .25rem;
      border-top: 3px #CCC dashed;
      margin-top: .25rem;


      >* {
        flex: 0 1 12.5%;
        width: 3rem;

        @media (max-width:992px) {
          flex: 0 1 19.8%
        }

        &:not(:hover)>div {
          display: none;
        }
      }
    }
  }
}
</style>
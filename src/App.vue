<script setup>
import { useEventListener } from '@vueuse/core';
import { emotList } from './stronge';
import { computed, ref } from 'vue';
import { inputEmot } from './tool';
import Lazy from './Lazy.vue';
// 获取页面靠底部的输入框，创建新讨论是 discussion_body ，创建新issue是 issue_body ，回复讨论是 new_comment_field
const currentInput = ref(document.querySelector("#new_comment_field,#discussion_body,#issue_body"));
// 聚焦到新输入框时，切换输出目标
useEventListener(document, "focusin", e => {
  const el = e.target;
  if (el instanceof HTMLTextAreaElement) {
    currentInput.value = el;
  }
});
function onInputEmot(src, name) {
  inputEmot(currentInput.value, `<img src="${src}" alt="${name}" width="75" >`)
}

const tabs = computed(() => emotList.value?.map(t => ({ group: t.id, name: t.name, src: t.icon })) ?? [])
const currentTab = ref(tabs.value[0]?.group ?? "0");
const tabData = computed(() => emotList.value.map(g => {
  return {
    [g.id]: g.list.map(im => ({ id: im.id, src: im.icon, name: im.name }))
  }
}).reduce((pv, v) => Object.assign(pv, v), {}));
</script>
<template>
  <Teleport :to="currentInput.parentElement" :disabled="!currentInput || !currentInput.parentElement">
    <div class="miyoushe-emots">
      <div class="emot-tabs">
        <Lazy v-for="t in tabs" :key="t.group" :title="t.name" :src="t.src" @click=" currentTab = t.group"></Lazy>
      </div>
      <div class="emot-icons">
        <div>
          <Lazy v-for="em in tabData[currentTab]" :src="em.src" :title="em.name" @click="onInputEmot(em.src, em.name)">
          </Lazy>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<style lang="less">
.miyoushe-emots {
  border: 3px #CCC dashed;
  border-radius: 2rem;
  padding: .5rem;

  .a-img {
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;

    &::after {
      content: "";
      pointer-events: none;
      display: block;
      width: 100%;
      padding-bottom: 100%;
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

        &:not(.loaded) {
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


      // &:not(.show) {
      //   display: none;
      // }

      >* {
        flex: 0 0 3rem;
        width: 3rem;

        &:not(.loaded) {
          max-height: 3rem;
        }
      }
    }
  }
}
</style>
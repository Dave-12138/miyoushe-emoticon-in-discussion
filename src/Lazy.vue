<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import type { Ref } from "vue";
import { GM_fetch } from "./tool";
function loadImg(el: Element) {
    (el as unknown as { loadme: () => void }).loadme?.();
    observer.unobserve(el);
}
// 不用懒加载的话，似乎会有性能问题
// 懒加载
const observer = new IntersectionObserver(function (entries) {
    entries.forEach(item => {
        if (item && item.isIntersecting) {
            loadImg(item.target);
        }
    })
    // for (let i = 0; i < entries.length; i++) {
    //     const item = entries[i];
    //     if (item && item.isIntersecting) {
    //         loadImg(item.target);
    //     }
    // }
});
const imgCache: Record<string, string> = {};
async function cacheImgFetch(src: string) {
    return imgCache[src] ?? (imgCache[src] = URL.createObjectURL(await GM_fetch(src).then(x => x.blob())));
}
export default defineComponent({
    props: {
        src: String,
    },
    setup(props, { expose }) {
        const url = ref("");
        const loaded = ref(0);
        async function loadme() {
            url.value = await cacheImgFetch(props.src ?? "");
            loaded.value = 1;
        }
        const el: Ref<HTMLDivElement | null> = ref(null);
        onMounted(() => {
            if (el.value) {
                observer.observe(el.value);
                Object.assign(el.value, { loadme });
            }
        })
        watch(() => props.src, () => {
            if (loaded.value) {
                loaded.value = 0;
                observer.observe(el.value as Element);
            }
        });
        expose();
        return { el, url, loaded };
    }
});
</script>
<template>
    <div ref="el" class="a-img" :class="{ loaded }" :style="{ backgroundImage: `url(${url})` }">
        <slot></slot>
    </div>
</template>
<style lang="less">
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
</style>
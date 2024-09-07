<script>
import { defineComponent, onMounted, ref, watch } from "vue";
import { GM_fetch } from "./tool";
function loadImg(el) {
    el.loadme?.();
    observer.unobserve(el);
}
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
const imgCache = {};
async function cacheImgFetch(src) {
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
            url.value = await cacheImgFetch(props.src);
            loaded.value = 1;
        }
        const el = ref(null);
        onMounted(() => {
            observer.observe(el.value);
            el.value.loadme = loadme;
        })
        watch(() => props.src, () => {
            if (loaded.value) {
                loaded.value = 0;
                observer.observe(el.value);
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
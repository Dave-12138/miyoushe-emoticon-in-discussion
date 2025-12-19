import { defineConfig } from 'vite'
import Monkey, { cdn } from 'vite-plugin-monkey';
import vue from "@vitejs/plugin-vue";


export default defineConfig((config) => {
  return {
    plugins: [
      vue(),
      Monkey({
        entry: "src/index.ts",
        userscript: {
          name: "GitHub讨论米游社表情包",
          match: [
            "https://github.com/*",
            "https://github.com/",
          ],
          connect: [
            "bbs-api-static.miyoushe.com",
            "bbs-static.miyoushe.com",
            "upload-bbs.miyoushe.com",
            "img-static.mihoyo.com",
            "upload-bbs.mihoyo.com"
          ],
          icon: "https://www.google.com/s2/favicons?sz=64&domain=github.com",
          namespace: "https://dave-12138.cn/Tampermonkey",
        },
        build: {
          metaFileName: true,
          externalGlobals: {
            vue: cdn.baomitu('Vue', 'vue.global.prod.js'),
          },
        }
      })
    ],
    build: {
      // minify: true
    }
  }
})
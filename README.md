## GitHub讨论米游社表情包
用户脚本，需要使用脚本管理器加载，用于在github讨论、issue使用米游社表情包。


1. 装脚本首先需要一个脚本管理器（比如[某猴](https://www.tampermonkey.net/)）（当然，你的浏览器可能自带脚本支持）
2. 然后，[安装脚本](https://dave-12138.cn/static/Tampermonkey/miyoushe-emot-to-github.user.js) *(该链接对非中国大陆IP有cloudflare人机验证，如遇访问困难请尝试关闭代理，或直接下载本仓库并运行`publish.bat`获得脚本`out.user.js`后**自行导入**)*
3. 访问任意一个讨论/issue页面，等待本脚本的UI加载出来（如图所示）。如果有弹窗询问跨域许可，点击`总是允许此域名`
![图1](./readme/image1.png)
4. 上面一排表情图片是分类按钮，点击任意分类按钮展开对应分类。
![图2](./readme/image2.png)
5. 点击下方的表情图标，会将表情（就是那个&lt;img&gt;标签）填入输入框。
![图3](./readme/image3.png)

> [!important]
> 如果你看见Uploading字样，说明你用错了：不要拖拽！不要拖拽！不要拖拽！
> 不要复制图片链接地址，那不是真实地址！


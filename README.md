# Tao Wang · Academic homepage

网站：https://taowangcs.github.io/

使用 [PRISM](https://github.com/xyjoey/PRISM) 模板（MIT License），使用英文多页面导航，保留 Pages CMS 表单编辑。

## 日常更新（手机也可以）

1. 打开 https://app.pagescms.org/，使用 GitHub 登录，选择 `taowangcs/taowangcs.github.io` 和 `main`。
2. 从左侧选择个人资料、近况、教育经历、项目、论文或荣誉。
3. 修改后保存。GitHub Actions 会自动构建发布，通常需要几分钟。
4. 打开主页刷新查看。若没有更新，在仓库 Actions 中查看最新运行是否成功。

个人照片可在“个人资料”中上传。暂时没有照片时显示 TW 占位图；没有条目的栏目保持占位，不添加虚构成果。

## 内容与模板

- `content/*.json`：唯一的日常内容来源，由 Pages CMS 编辑。
- `.pages.yml`：后台表单配置。
- `scripts/sync-content.mjs`：构建时将 JSON 转为 PRISM 的 TOML / Markdown，并复制上传图片。
- `src/`：PRISM 页面组件，保留原模板的布局、动画、深色模式。
- `media/`：上传照片等资源；构建时复制至 `public/media/`。
- `content/*.toml` 和 `content/*.md`：自动生成，请勿手动编辑，会被下一次构建覆盖。

论文当前使用 PRISM 原生卡片显示，保留作者、会议/期刊和 Paper / Code / Project 链接，与原来的表单字段一致。模板内的 BibTeX 组件仍保留，但当前表单不生成 BibTeX，不使用论文筛选功能。

## 本地开发

需要 Node.js 22 或更新版本。

```sh
npm ci
npm test
npm run dev
```

`npm run build` 生成静态网站到 `out/`，通过 `.github/workflows/deploy.yml` 发布到 GitHub Pages。

模板改动：个人内容转换、照片占位、后台入口、使用本机字体替代模板作者的远程字体、手机教育卡片换行。未使用模板示例内容。旧版网站保留在 Git 提交历史中。

模板来源版本：`f2748db9821e98ed487eee5104ce4cc282aa8c1e`。保留上游 MIT 授权文件 `LICENSE`。

# Tao Wang · Academic Homepage

英文单页学术主页，使用 GitHub Pages 托管，Pages CMS 提供网页内容编辑。

目标地址：<https://taowangcs.github.io/>。

## 日常更新（不需要改代码）

1. 打开 <https://app.pagescms.org/>，用 `taowangcs` 登录。
2. 首次使用时，安装 Pages CMS GitHub App，仅选择 `taowangcs.github.io` 这个网站仓库。
3. 打开网站仓库的 `main` 分支。左侧显示个人资料、近况、教育经历、项目、论文、荣誉六个编辑入口。
4. 修改表单并保存。添加条目后，将最新的条目排在最上方。简介用空行分段，内容填写英文。
5. 保存会触发自动发布。等待仓库 Actions 中的 `Publish academic homepage` 成功后，再刷新网站；更新不是即时生效的。

个人照片在“个人资料 / About”中上传；没有上传时，首页显示照片占位。项目、论文、荣誉在没有条目时保留栏目标题。图片支持 JPG、JPEG、PNG、WebP。

不要向网站仓库或媒体库上传隐私资料。此仓库及网站均为公开内容。

## 首次部署

1. 在 `taowangcs` 下创建公开仓库 `taowangcs.github.io`，默认分支为 `main`。
2. 上传本项目源文件（包括 `.pages.yml` 和 `.github/workflows/deploy.yml`）。
3. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
4. 在 **Actions → Publish academic homepage → Run workflow** 执行首次发布，或提交一次内容更新。
5. 确认部署成功后访问目标网址，并完成 Pages CMS 首次登录。

## 本地预览

只需要 Python 3，无需安装第三方依赖：

```sh
python3 build.py
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

访问 <http://127.0.0.1:4173/>。修改内容或样式后重新执行 `python3 build.py` 并刷新浏览器。

## 文件说明

- `content/*.json`：个人资料及各栏目的内容；由 Pages CMS 编辑。
- `.pages.yml`：后台表单配置（官方文档：<https://pagescms.org/docs/configuration/>）。
- `media/`：上传的照片。
- `templates/index.html`、`assets/style.css`：网页结构与样式。
- `build.py`：把内容生成为完整静态 HTML，文字内容不依赖 JavaScript。
- `.github/workflows/deploy.yml`：自动构建与发布。
- `dist/`：本地生成结果，不提交到仓库；线上只发布该目录。

所有文本在构建时进行 HTML 转义，外部链接只接受 HTTP/HTTPS。构建失败时不会覆盖上一次成功发布的网站；可在 Actions 中查看出错信息。

页面排版参考用户提供的学术主页，代码独立编写，未复制教师照片、校徽或论文条目。

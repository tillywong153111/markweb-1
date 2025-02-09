# Markdown待办事项管理系统

这是一个基于React和Firebase的待办事项管理系统，支持Markdown格式的内容编辑，并具有历史记录功能。

## 功能特点

- 用户认证（注册/登录）
- Markdown格式的待办事项
- 支持导入Markdown文件
- 自动保存历史记录
- 响应式设计，支持移动端和桌面端
- 简洁优雅的界面设计

## 技术栈

- React + Vite
- Firebase (认证和数据库)
- TailwindCSS
- React Markdown

## 开始使用

1. 克隆项目并安装依赖：

```bash
git clone <repository-url>
cd todo-app
npm install
```

2. 配置Firebase：

- 在[Firebase控制台](https://console.firebase.google.com/)创建新项目
- 启用Email/Password认证
- 创建Firestore数据库
- 复制项目配置信息

3. 配置环境变量：

在项目根目录创建`.env`文件，添加以下内容：

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

4. 启动开发服务器：

```bash
npm run dev
```

## 部署

1. 构建项目：

```bash
npm run build
```

2. 部署到你选择的托管服务（如Firebase Hosting、Vercel等）

## 使用说明

1. 注册/登录：
   - 使用邮箱和密码注册新账户
   - 使用已有账户登录

2. 添加待办事项：
   - 在文本框中输入Markdown格式的内容
   - 点击"添加"按钮保存

3. 导入Markdown文件：
   - 点击"选择文件"按钮
   - 选择本地的Markdown文件
   - 文件内容会自动加载到编辑框中

4. 管理待办事项：
   - 编辑：点击待办事项的"编辑"按钮
   - 删除：点击待办事项的"删除"按钮
   - 查看历史：点击"查看历史记录"按钮
   - 从历史记录恢复：在历史记录中点击"恢复此版本"

## 注意事项

- 确保Firebase配置信息正确
- 在生产环境中妥善保管环境变量
- 定期备份重要数据

## 贡献

欢迎提交Issue和Pull Request！

## 许可

MIT License


我从Firebase配置继续完成
# Maze Solver Web

这是迷宫解决器的 Web 版本,使用 TypeScript 和 React 实现。

## 功能

1. 上传迷宫图片
2. 处理迷宫图片并生成迷宫数组
3. 使用 A\*算法解决迷宫
4. 在画布上显示迷宫和解决方案
5. 支持手动选择迷宫的入口和出口

## 安装

确保你已经安装了 Node.js 和 npm。然后,在 `web` 目录下运行以下命令安装依赖:

```bash
npm install
```

## 使用方法

1. 启动开发服务器:

```bash
npm start
```

这将在 `http://localhost:9000` 启动应用程序。

2. 构建生产版本:

```bash
npm run build
```

这将在 `dist` 目录下生成生产版本的文件。

## 项目结构

- `src/`: 源代码目录
  - `components/`: React 组件
  - `services/`: 业务逻辑服务
  - `utils/`: 工具函数
  - `App.tsx`: 主应用组件
  - `index.tsx`: 应用入口点
- `public/`: 静态文件目录
- `package.json`: 项目配置和依赖
- `tsconfig.json`: TypeScript 配置
- `webpack.config.js`: Webpack 配置

## 开发

1. 修改 `src` 目录下的文件以添加新功能或修复 bug。
2. 使用 `npm start` 启动开 ��� 服务器,查看更改。
3. 使用 `npm run build` 构建生产版本。

## 注意事项

- 确保上传的迷宫图片清晰,墙壁和通道有明显的颜色区分。
- 当前实现使用简化的图像处理逻辑。如果需要更复杂的图像处理,可能需要使用专门的 JavaScript 图像处理库或在服务器端实现处理逻辑。

## 贡献

欢迎提交问题和拉取请求来改进这个项目。

## 许可证

本项目采用 MIT 许可证。

# baibai-next

百百型 QQ 机器人重构版，基于 OneBot11 协议反向 WebSocket 连接。

## 目录结构

```
baibai-next/
├── config.js              # 主配置文件（端口、数据库、路径）
├── config.example.js      # 配置示例
├── secret.example.json    # 管理面板认证配置示例
├── package.json
├── scripts/
│   └── init-db.js         # 数据库初始化脚本
└── src/
    ├── index.js            # 入口文件
    ├── bot/
    │   ├── BotManager.js   # WebSocket 连接管理（接受 LLBot 反向 WS 连接）
    │   └── ApiWrapper.js   # OneBot11 API 统一调用封装
    ├── core/
    │   ├── context.js      # 消息上下文（ctx 对象构建、reply 封装）
    │   ├── middleware.js    # 中间件（cl_chat 存储、内容预处理）
    │   └── router.js       # 模块路由器（按注册顺序依次匹配）
    ├── db/
    │   └── mongo.js        # MongoDB 单例连接
    ├── utils/
    │   ├── renderImage.js  # HTML→图片渲染（node-html-to-image 封装）
    │   └── imageToBase64.js
    ├── admin/
    │   ├── access.js       # 群组/用户访问控制规则（持久化到 MongoDB）
    │   ├── index.js        # 管理面板 Express 路由
    │   └── panel.html      # 管理面板 SPA 页面
    └── modules/
        ├── calculator/     # 计算器（1+1=2）
        ├── phrase/         # 词条记录（a|b → 记住 a 回复 b）
        ├── jrrp/           # 今日运势
        ├── jrzz/           # 今日猪猪
        ├── menu/           # 群菜单管理
        ├── chp/            # 彩虹屁
        ├── ruawork/        # 茹娅上班时间
        ├── calendar/       # 日历模块
        ├── mabinogi/       # 洛奇相关（占位，待迁移）
        └── draw/           # 绘图 nb/nbp/nbp2（占位，待迁移）
```

## 快速开始

### 1. 安装依赖

```bash
cd baibai-next
npm install
```

### 2. 配置

复制配置文件并根据实际环境修改：

```bash
cp config.example.js config.js
cp .secret.example.json .secret.json
```

**config.js** 主要配置项：
- `port` — 监听端口，默认 10086
- `mongoUrl` — MongoDB 连接字符串
- `imageSendDir` — 生成图片存放目录
- `botSelfIds` — 机器人自身 QQ 号集合（用于过滤自身消息）

**secret.json** 管理面板认证：
```json
{
  "adminUsername": "your_username",
  "adminPassword": "your_password"
}
```

### 3. 初始化数据库

```bash
npm run init-db
```

此脚本会创建所有必需的集合并建立索引。旧版数据库可以直接沿用。

### 4. 启动

```bash
npm start
```

### 5. 连接机器人

LLBot 通过反向 WebSocket 连接到：

```
ws://{host}:10086/baibaiws/{botId}
```

其中 `botId` 是用于标识不同机器人实例的 ID（如端口号或 QQ 号）。

### 6. 管理面板

浏览器访问 `http://localhost:10086/admin`，使用 `secret.json` 中配置的账号密码登录。

功能：
- 查看在线机器人状态
- 群组访问控制（白名单/黑名单模式切换）
- 用户封禁管理

## 模块系统

每个模块位于 `src/modules/` 下，导出以下结构：

```js
module.exports = {
  name: 'module-name',
  match(content, ctx) { return true/false },
  async handle(ctx) { ctx.reply('回复内容') }
}
```

也可以导出数组（多命令模块）：

```js
module.exports = [
  { name: 'cmd1', match: c => c === 'cmd1', handle(ctx) { ... } },
  { name: 'cmd2', match: c => c === 'cmd2', handle(ctx) { ... } }
]
```

### ctx 上下文对象

| 属性 | 说明 |
|------|------|
| `ctx.content` | 消息文本（已预处理） |
| `ctx.groupId` | 群号 |
| `ctx.userId` | 发送者 QQ |
| `ctx.userName` | 发送者昵称/群名片 |
| `ctx.groupName` | 群名称 |
| `ctx.messageType` | `'group'` 或 `'private'` |
| `ctx.botId` | 当前机器人标识 |
| `ctx.raw` | 原始 OneBot11 事件 |
| `ctx.api` | OneBot11 API 封装 |
| `ctx.reply(msg)` | 快捷回复 |

### ctx.api 可用方法

```js
await ctx.api.sendGroupMsg(botId, groupId, message)
await ctx.api.sendPrivateMsg(botId, userId, message)
await ctx.api.getGroupInfo(botId, groupId)
await ctx.api.getGroupMemberList(botId, groupId)
await ctx.api.getGroupMemberInfo(botId, groupId, userId)
await ctx.api.getStrangerInfo(botId, userId)
await ctx.api.callApi(botId, action, params)  // 通用 API 调用
```

## 待迁移模块

以下模块已建立占位文件，提供了详细的迁移说明注释：

### 洛奇相关 (`src/modules/mabinogi/index.js`)
- opt / opts — 释放查询
- mbi / mbd / mbc — 配方查询
- meu — 装备升级
- mbtv / mbtvs — 洛奇TV
- mbcd / mbcds — 洛奇CD
- mbzz / mbzzs — 洛奇转转
- bosswork — Boss 时间表
- gacha — 洛奇蛋池/来一发/十连
- smuggler — 走私查询
- live-inspect — 洛奇查房

### 绘图 (`src/modules/draw/index.js`)
- nb / banana — 标准绘图
- nbp — 高级绘图
- nbp2 — 小豆包绘图

迁移步骤见各占位文件中的注释。

## 与旧版的主要区别

| 项目 | 旧版 (baibaibot) | 新版 (baibai-next) |
|------|-------------------|---------------------|
| 入口 | baibai2.js (3000+ 行) | 模块化路由 |
| WS 路径 | `/lagrange/:bot_name` | `/baibaiws/:botId` |
| API 调用 | 分散在各处 | 统一 `ApiWrapper` |
| 群限制 | 硬编码 if 判断 | 管理面板 + MongoDB 持久化 |
| 数据库连接 | 各模块各自连接 | 单例 `getClient()` |
| 配置 | 分散多处 | `config.js` + `secret.json` |
| 消息存储 | 同 cl_chat | 同 cl_chat（兼容） |

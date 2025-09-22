# Ave Wallet Extension

一个类似 MetaMask 的现代浏览器插件，使用 Plasmo、Tailwind CSS、shadcn/ui 和 OKX-Web3-JS-Wallet-SDK 构建。

## 功能特性

### 🔐 钱包管理
- 创建新钱包（支持助记词导入）
- 安全解锁/锁定钱包
- 多账户管理
- 私钥和助记词安全存储

### 💰 交易功能
- 发送以太坊交易
- 实时余额查询
- 交易历史记录
- Gas 费用估算

### 🌐 网络支持
- 以太坊主网
- 以太坊测试网（Sepolia）
- Polygon 主网
- 自定义网络支持

### 🔒 安全特性
- 密码强度验证
- 登录尝试限制
- 会话超时管理
- 数据加密存储
- 交易参数验证

### 🎨 用户界面
- 现代化设计
- 深色/浅色主题
- 响应式布局
- 无障碍访问

### 🔌 dApp 集成
- EIP-1193 标准支持
- MetaMask 兼容性
- 事件监听器
- 消息签名

## 技术栈

- **Plasmo** - 现代浏览器扩展框架
- **React 18** - 用户界面库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 实用优先的 CSS 框架
- **shadcn/ui** - 高质量 UI 组件
- **OKX-Web3-JS-Wallet-SDK** - OKX 官方钱包 SDK
- **Chrome Extension API** - 浏览器扩展功能

## 项目结构

```
ave-wallet-extension/
├── package.json                 # 项目依赖和脚本
├── tsconfig.json               # TypeScript 配置
├── tailwind.config.js          # Tailwind CSS 配置
├── postcss.config.js           # PostCSS 配置
├── components.json             # shadcn/ui 组件配置
├── popup.tsx                   # 扩展弹窗界面
├── options.tsx                 # 扩展选项页面
├── background.ts               # 后台脚本
├── contents/
│   └── inject.ts              # 内容脚本
├── src/
│   ├── styles/
│   │   └── globals.css        # 全局样式
│   ├── lib/
│   │   ├── utils.ts           # 工具函数
│   │   └── wallet-manager.ts  # 钱包管理核心
│   ├── types/
│   │   └── wallet.ts          # 类型定义
│   ├── hooks/
│   │   └── useWallet.ts       # 钱包状态管理 Hook
│   ├── components/
│   │   ├── ui/                # 基础 UI 组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── select.tsx
│   │   ├── wallet/            # 钱包相关组件
│   │   │   ├── AccountCard.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── NetworkSelector.tsx
│   │   │   ├── WalletSetup.tsx
│   │   │   └── UnlockWallet.tsx
│   │   └── WalletProvider.tsx # 钱包上下文提供者
└── README.md                   # 项目文档
```

## 快速开始

### 环境要求

- Node.js (v16 或更高版本)
- npm 或 yarn

### 安装

1. 克隆仓库：
```bash
git clone <repository-url>
cd ave-wallet-extension
```

2. 安装依赖：
```bash
npm install
```

3. 开发模式：
```bash
npm run dev
```

4. 构建生产版本：
```bash
npm run build
```

### 加载扩展

1. 打开 Chrome/Edge 浏览器
2. 访问 `chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `build` 文件夹

## 开发指南

### 可用脚本

- `npm run dev` - 启动开发模式，支持热重载
- `npm run build` - 构建生产版本
- `npm run package` - 打包扩展程序
- `npm run lint` - 运行 ESLint 检查
- `npm run type-check` - 运行 TypeScript 类型检查

### 添加 shadcn/ui 组件

```bash
npm run ui:add <component-name>
```

### 项目架构

#### 后台脚本 (background.ts)
- 钱包状态管理
- 消息传递处理
- 存储操作
- 网络通信

#### 内容脚本 (contents/inject.ts)
- 向网页注入钱包提供者
- 启用 dApp 集成
- 处理页面与扩展的通信

#### 弹窗界面 (popup.tsx)
- 钱包概览和账户管理
- 交易发送界面
- 网络选择
- 设置访问

#### 选项页面 (options.tsx)
- 高级钱包设置
- 网络配置
- 安全偏好
- 关于信息

## 功能说明

### 钱包管理
- 创建新钱包
- 导入现有钱包
- 密码保护
- 账户切换

### 交易功能
- 发送交易
- 交易历史
- Gas 费用管理
- 交易状态跟踪

### 网络支持
- 多网络配置
- 网络切换
- 自定义 RPC
- 区块浏览器集成

### dApp 集成
- 网页钱包提供者
- 标准以太坊 API
- 连接/断开功能
- 事件监听

## API 参考

### 钱包管理器 (WalletManager)

```typescript
class WalletManager {
  // 创建钱包
  async createWallet(password: string, mnemonic?: string): Promise<WalletAccount>
  
  // 解锁钱包
  async unlockWallet(password: string): Promise<boolean>
  
  // 锁定钱包
  async lockWallet(): Promise<void>
  
  // 获取账户
  async getAccounts(): Promise<WalletAccount[]>
  
  // 获取余额
  async getBalance(address: string): Promise<string>
  
  // 发送交易
  async sendTransaction(params: SendTransactionParams): Promise<Transaction>
  
  // 获取网络
  async getNetworks(): Promise<Network[]>
  
  // 切换网络
  async setCurrentNetwork(networkId: string): Promise<void>
}
```

### 安全管理器 (SecurityManager)

```typescript
class SecurityManager {
  // 验证密码
  static async validatePassword(password: string): Promise<{isValid: boolean, error?: string}>
  
  // 验证助记词
  static async validateMnemonic(mnemonic: string): Promise<{isValid: boolean, error?: string}>
  
  // 验证地址
  static async validateAddress(address: string): Promise<{isValid: boolean, error?: string}>
  
  // 验证交易
  static async validateTransaction(transaction: any): Promise<{isValid: boolean, error?: string}>
  
  // 加密数据
  static async encryptData(data: string, password: string): Promise<string>
  
  // 解密数据
  static async decryptData(encryptedData: string, password: string): Promise<string>
}
```

## dApp 集成

### 检测钱包

```javascript
if (window.aveWallet) {
  console.log('Ave Wallet detected!')
} else {
  console.log('Ave Wallet not found')
}
```

### 连接钱包

```javascript
try {
  const accounts = await window.aveWallet.connect()
  console.log('Connected accounts:', accounts)
} catch (error) {
  console.error('Connection failed:', error)
}
```

### 发送交易

```javascript
try {
  const txHash = await window.aveWallet.sendTransaction({
    to: '0x...',
    value: '0x1000000000000000000', // 1 ETH in wei
    gasPrice: '0x3b9aca00' // 1 gwei
  })
  console.log('Transaction hash:', txHash)
} catch (error) {
  console.error('Transaction failed:', error)
}
```

### 监听事件

```javascript
// 监听账户变化
window.aveWallet.on('accountsChanged', (accounts) => {
  console.log('Accounts changed:', accounts)
})

// 监听网络变化
window.aveWallet.on('chainChanged', (chainId) => {
  console.log('Chain changed:', chainId)
})
```

## 使用指南

### 创建钱包

1. 打开扩展弹窗
2. 点击"创建新钱包"
3. 设置强密码（至少8位，包含大小写字母和数字）
4. 可选择导入现有助记词
5. 保存助记词（重要！）

### 解锁钱包

1. 输入密码
2. 系统会验证密码强度
3. 超过5次失败尝试将锁定15分钟

### 发送交易

1. 确保钱包已解锁
2. 切换到"发送"标签
3. 输入接收地址和金额
4. 确认交易详情
5. 输入密码确认

### 管理设置

1. 点击设置图标
2. 配置安全选项
3. 选择默认网络
4. 管理主题和通知

## 安全特性

- 密码强度验证
- 登录尝试限制（5次失败后锁定15分钟）
- 会话超时管理（30分钟无操作自动锁定）
- 数据加密存储
- 交易参数验证
- 私钥安全存储

## 贡献指南

1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 添加测试（如适用）
5. 提交拉取请求

## 许可证

本项目采用 MIT 许可证 - 查看 LICENSE 文件了解详情。

## 支持

如有问题和支持需求，请在仓库中创建 issue。

## 路线图

- [ ] 硬件钱包支持
- [ ] 多签名钱包
- [ ] DeFi 协议集成
- [ ] NFT 支持
- [ ] 移动端适配
- [ ] 更多区块链网络支持

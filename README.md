# fun.pump

## 技术栈和工具

- Solidity (Writing Smart Contracts & Tests)
- Javascript (Next.js & Testing)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [Ethers.js](https://docs.ethers.io/v5/) (Blockchain Interaction)
- [Next.js](https://nextjs.org/) (Frontend Framework)

## 我使用的node版本
`v22.13.0`

## 运行代码
### 克隆项目

### 安装所需包
`$ npm install`

### 运行测试
`$ npx hardhat test`

### 启动本地区块链
`$ npx hardhat node`

### 部署合约
部署合约

`$ npx hardhat ignition deploy ignition/modules/Factory.js --network localhost`

部署合约后，对部署的合约进行重置。

`$ npx hardhat ignition deploy ignition/modules/Factory.js --network localhost --reset`

### 前端启动
`$ npm run dev`
// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");

const FEE = ethers.parseUnits("0.01", 18);

module.exports = buildModule("FactoryModule", (m) => {
    const fee = m.getParameter("fee", FEE);
    
    const factory = m.contract("Factory", [fee]);

    return { factory };
})
//部署合约
//npx hardhat ignition deploy ignition/modules/Factory.js --network localhost
//如果reset之前已经部署了合约
//npx hardhat ignition deploy ignition/modules/Factory.js --network localhost --reset
//运行next.js
//npm run dev
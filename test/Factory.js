const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Factory", function () {

    const FEE = ethers.parseUnits("0.01", 18);
    async function deployFactoryFixture() {
        //获取账户
        const [deployer, creator, buyer] = await ethers.getSigners();
        //获取合约
        const Factory = await ethers.getContractFactory("Factory");
        //部署合约
        const factory = await Factory.deploy(FEE);
        //创建token
        const transaction = await factory.connect(creator).create("Pump", "X2N", {value: FEE});
        //确保交易完成，再执行后续代码
        await transaction.wait();

        //获取第一个token，tokens为token数组
        const tokenAddress = await factory.tokens(0);
        const token = await ethers.getContractAt("Token", tokenAddress);

        return { factory, token, deployer, creator ,buyer};
    }
    async function buyTokenFixture() {
        const { factory, token, creator , buyer } = await deployFactoryFixture();
        const AMOUNT = ethers.parseUnits("10000", 18);
        const COST = ethers.parseUnits("1", 18);
        
        //买token
        const transaction = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, {value: COST});
        //确保交易完成，再执行后续代码
        await transaction.wait();
        return { factory, token, creator, buyer};
    }
    describe("Deployment", function () {
        it("Should set the fee", async function () {
            const { factory } = await loadFixture(deployFactoryFixture);
            expect(await factory.fee()).to.equal(FEE);
        })
        it("Should set the owner", async function () {
            const { factory,deployer } = await loadFixture(deployFactoryFixture);
            expect(await factory.owner()).to.equal(deployer.address);
        })
    })
    describe("Creating", function () {
        it("Should set the owner", async function () {
            const { factory,token } = await loadFixture(deployFactoryFixture);
            expect(await token.owner()).to.equal(await factory.getAddress());
        })
        it("Should set the creator", async function () {
            const { token,creator } = await loadFixture(deployFactoryFixture);
            expect(await token.creator()).to.equal(creator.address);
        })
        it("Should set the supply", async function () {
            const { factory,token } = await loadFixture(deployFactoryFixture);
            const totalSupply = ethers.parseUnits("1000000", 18);
            expect(await token.balanceOf(await factory.getAddress())).to.equal(totalSupply);
        })
        it("Should update ETH balance", async function () {
            const { factory } = await loadFixture(deployFactoryFixture);
            const balance = await ethers.provider.getBalance(await factory.getAddress());
            expect(balance).to.equal(FEE);
        })
        it("Should create the sale", async function () {
            const { factory,token,creator} = await loadFixture(deployFactoryFixture);
            const  count = await factory.totalTokens();
            expect(count).to.equal(1);

            const sale = await factory.getTokenSale(0);
            //console.log(sale);

            expect(sale.token).to.equal(await token.getAddress());
            expect(sale.creator).to.equal(creator.address);
            expect(sale.sold).to.equal(0);
            expect(sale.raised).to.equal(0);
            expect(sale.isOpen).to.equal(true);
        })
    })
    describe("Buying", function () {
        const AMOUNT = ethers.parseUnits("10000", 18);
        const COST = ethers.parseUnits("1", 18);
        //buyer买token，将ETH转入到合约中，检查合约收到的ETH
        it("Should update ETH balance", async function () {
            const { factory } = await loadFixture(buyTokenFixture);
            const balance = await ethers.provider.getBalance(await factory.getAddress());
            expect(balance).to.equal(FEE + COST);
        })
        //buyer买token，检查buyer收到的token
        it("Should update token balance", async function () {
            const {token, buyer} = await loadFixture(buyTokenFixture);
            const balance = await token.balanceOf(buyer.address);
            expect(balance).to.equal(AMOUNT);
        })
        //更新token sale
        it("Should update token sale", async function () {
            const { factory, token } = await loadFixture(buyTokenFixture);
            const sale = await factory.tokenToSale(await token.getAddress());
            expect(sale.sold).to.equal(AMOUNT);
            expect(sale.raised).to.equal(COST);
            expect(sale.isOpen).to.equal(true);
        })
        it("Should increase base cost", async function () {
            const { factory, token } = await loadFixture(buyTokenFixture);
            const sale = await factory.tokenToSale(await token.getAddress());
            const cost = await factory.getCost(sale.sold);
            //sold为10000,带入getCost计算 0.0001 + 0.0001 = 0.0002
            expect(cost).to.be.equal(ethers.parseUnits("0.0002"));

        })

    })
    describe("Depositing", function () {
        const AMOUNT = ethers.parseUnits("10000", 18);
        const COST = ethers.parseUnits("2", 18);
        it("Sale should be closed and successful deposits", async function (){
            const { factory, token, creator, buyer} = await loadFixture(buyTokenFixture);
            
            //Buy tokens again to reach the target
            const buyTx = await factory.connect(buyer).buy(await token.getAddress(), AMOUNT, {value: COST});
            await buyTx.wait();

            const sale = await factory.tokenToSale(await token.getAddress());
            expect(sale.isOpen).to.equal(false);

            const depositTx = await factory.connect(creator).deposit(await token.getAddress());
            await depositTx.wait();

            const balance = await token.balanceOf(creator.address);
            expect(balance).to.equal(ethers.parseUnits("980000",18));


        })
    })
    describe("Withdrawing Fee", function (){
        //部署合约，提交了FEE
        //然后再将FEE进行撤回
        it("Should update ETH balances", async function(){
            const { factory, deployer} = await loadFixture(deployFactoryFixture);
            const transaction = await factory.connect(deployer).withdraw(FEE);
            await transaction.wait();

            const balance = await ethers.provider.getBalance(await factory.getAddress());
            
            expect(balance).to.equal(0);
        })
    })
})
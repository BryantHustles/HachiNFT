const HachiWallet = artifacts.require("HACHIWallet");

const { balance } = require("@openzeppelin/test-helpers");
const chai = require("./setupchai.js.js.js");
const BN = web3.utils.BN;
const expect = chai.expect;

const ethBalance = web3.utils.toWei("1","Ether");
var beginningBalance = 0;
var endingBalance = 0;

require("dotenv").config({path: "/Users/bryantbackus/Documents/ABackusCryptoDynasty/Projects/.env"});

contract("HACHI Wallet", async (accounts) => {

    //Get Accounts
    const [deployerAccount, Account2, Account3, Account4, Account5, Account6, Account7, Account8, Account9, Account10] = accounts;

    //Run Tests
    it("Should have a balance greater than zero", async() => {
        let instance = await HachiWallet.deployed();
        await web3.eth.sendTransaction({from: deployerAccount,to: instance.address, value: web3.utils.toWei("1","Ether")});

        const balance = parseInt(await web3.eth.getBalance(instance.address),10);
        return expect(balance).to.be.greaterThan(0);
    })
    
    it("balance Owed to deployer", async() => {
        let instance = await HachiWallet.deployed();
        const balanceOwed = ethBalance*0.25;
        const readOwed = await instance.viewBalanceOwed();
        return expect(readOwed).to.be.a.bignumber.equal(new BN(balanceOwed.toString()));
    })

    it("balance Owed to Account2", async() => {
        let instance = await HachiWallet.deployed();
        const balanceOwed = ethBalance*0.25;
        const readOwed = await instance.viewBalanceOwed({from: Account2});
        return expect(readOwed).to.be.a.bignumber.equal(new BN(balanceOwed.toString()));
    })

    it("balance Owed to Account3", async() => {
        let instance = await HachiWallet.deployed();
        const balanceOwed = ethBalance*0.5;
        const readOwed = await instance.viewBalanceOwed({from: Account3});
        return expect(readOwed).to.be.a.bignumber.equal(new BN(balanceOwed.toString()));
    })

    it("Non Shareholder cannot view balances", async() => {
        let instance = await HachiWallet.deployed();
        return expect(instance.viewBalanceOwed({from: Account4})).to.eventually.be.rejected;
    })

    it("Non Shareholder cannot call easy Release", async() => {
        let instance = await HachiWallet.deployed();
        return expect(instance.easyRelease({from: Account4})).to.eventually.be.rejected;
    })

    it("Easy release can be called by a shareholder", async() => {
        let instance = await HachiWallet.deployed();
        beginningBalance = parseInt(await web3.eth.getBalance(deployerAccount),10);
        return expect(instance.easyRelease({from: deployerAccount})).to.eventually.be.fulfilled;
    })

    it("Shareholder balance increases when easy release is called", async() => {
        endingBalance = parseInt(await web3.eth.getBalance(deployerAccount),10);
        expect(endingBalance).to.be.greaterThan(0);
        return expect(endingBalance).to.be.greaterThan(beginningBalance);
    })

    it("Balance owed to deployer should be 0", async() => {
        let instance = await HachiWallet.deployed();
        const balance = await instance.viewBalanceOwed({from: deployerAccount});
        return expect(balance).to.be.a.bignumber.equal(new BN("0"));
    })
    
    
     it("Non Owner cannot call release", async() => {
        let instance = await HachiWallet.deployed();
        return expect(instance.release(Account2,{from: Account3})).to.eventually.be.rejected;

    })
    
     it("Owner can call release", async() => {
        let instance = await HachiWallet.deployed();
        return expect(instance.release(Account2,{from: deployerAccount})).to.eventually.be.fulfilled;

    })

    it("Balance owed to Account2 should be 0", async() => {
        let instance = await HachiWallet.deployed();
        const balance = await instance.viewBalanceOwed({from: Account2})
        return expect(balance).to.be.a.bignumber.equal(new BN("0"));
    })
    
    it("total shares is correct", async() => {
        let instance = await HachiWallet.deployed();
        const shares = await instance.totalShares();
        return expect(shares).to.be.a.bignumber.equal(new BN("4"));

    })

    it("total released matches up", async() => {
        let instance = await HachiWallet.deployed();
        const balanceOwed = ethBalance*0.5
        const released = await instance.totalReleased();
        return expect(released).to.be.a.bignumber.equal(new BN(balanceOwed.toString()));

    })

    it("Deployer Shares Correct", async() => {
        let instance = await HachiWallet.deployed();
        const shares = await instance.shares(deployerAccount);
        return expect(shares).to.be.a.bignumber.equal(new BN("1"));
    })
    
    it("Account2 Shares Correct", async() => {
        let instance = await HachiWallet.deployed();
        const shares = await instance.shares(Account2);
        return expect(shares).to.be.a.bignumber.equal(new BN("1"));
    })

    it("Account3 Shares Correct", async() => {
        let instance = await HachiWallet.deployed();
        const shares = await instance.shares(Account3);
        return expect(shares).to.be.a.bignumber.equal(new BN("2"));
    })

    it("Non-ShareHolder can call shares", async() => {
        let instance = await HachiWallet.deployed();
        const shares = await instance.shares(deployerAccount,{from: Account7});
        return expect(shares).to.be.a.bignumber.equal(new BN("1"));
    })

    it("Payee index called by non-shareholder", async() => {
        let instance = await HachiWallet.deployed();
        expect(instance.payee(0)).to.eventually.be.fulfilled;
        return expect(instance.payee(0)).to.eventually.be.equal(deployerAccount.toString());
    })

    it("Payee index correct deployer", async() => {
        let instance = await HachiWallet.deployed();
        return expect(instance.payee(0)).to.eventually.be.equal(deployerAccount.toString());
    })

    it("Payee index correct deployer", async() => {
        let instance = await HachiWallet.deployed();
        return expect(instance.payee(1)).to.eventually.be.equal(Account2.toString());
    })

    it("Payee index correct deployer", async() => {
        let instance = await HachiWallet.deployed();
        return expect(instance.payee(2)).to.eventually.be.equal(Account3.toString());
    })

    it("Payee index non-assigned gets rejected", async() => {
        let instance = await HachiWallet.deployed();
        return expect(instance.payee(3)).to.eventually.be.rejected;
    })

    it("Released to deployer correct", async() => {
        let instance = await HachiWallet.deployed();
        const balanceOwed = ethBalance*0.25
        const balance = await instance.released(deployerAccount);
        return expect(balance).to.be.a.bignumber.equal(new BN(balanceOwed.toString()));
    })

    it("Released to Account2 correct", async() => {
        let instance = await HachiWallet.deployed();
        const balanceOwed = ethBalance*0.25
        const balance = await instance.released(Account2)
        return expect(balance).to.be.a.bignumber.equal(new BN(balanceOwed.toString()));
    })

    it("Released to Account3 correct", async() => {
        let instance = await HachiWallet.deployed();
        const balance = await instance.released(Account3);
        return await expect(balance).to.be.a.bignumber.equal(new BN("0"));
    })
});
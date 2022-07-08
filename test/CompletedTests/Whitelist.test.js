const HachiWhitelist = artifacts.require("HACHIWhitelist");
const { default: MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({path: "/Users/bryantbackus/Documents/ABackusCryptoDynasty/Projects/.env"});


contract("HACHI Whitelist", async (accounts) => {

    const [deployerAccount, Account2, Account3, Account4, Account5, Account6, Account7, Account8, Account9, Account10] = accounts;

    //Setup Merkle Tree 1
    var whiteListAddresses = [deployerAccount, Account2, Account3, Account4, Account5];

    var leafNodes = whiteListAddresses.map(_addr => keccak256(_addr));
    var merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});

    //Setup Merkle Tree 2
    const whiteListAddresses2 = [deployerAccount, Account2, Account3]
    var leafNodes2 = whiteListAddresses2.map(_addr => keccak256(_addr));
    const merkleTree2 = new MerkleTree(leafNodes2, keccak256, {sortPairs: true});

    //Run Tests

    it("Should have the merkle Root set", async() => {
        let instance = await HachiWhitelist.deployed();
        return expect(instance.merkleRoot()).to.eventually.have.string("0x" + merkleTree.getRoot().toString('hex'));
    })

    it("Owner Should be the dployer account", async() => {
        let instance = await HachiWhitelist.deployed();
        return expect(instance.owner()).to.eventually.equal(deployerAccount)  
    })


    it("Should verify an account on the whitelist", async() => {
        let instance = await HachiWhitelist.deployed();

        const claimingLeaf = keccak256(Account4);
        const hexProof = merkleTree.getHexProof(claimingLeaf);

        return expect(instance.verifyWhitelist(hexProof,Account4)).to.eventually.be.true;
    })

    it("Should reject an account not on the whitelist", async() => {
        let instance = await HachiWhitelist.deployed();

        const claimingLeaf = keccak256(Account10);
        const hexProof = merkleTree.getHexProof(claimingLeaf);

        return expect(instance.verifyWhitelist(hexProof,Account10)).to.eventually.be.false;
    })

    it("Should be able to change the merkle Root", async() => {
        let instance = await HachiWhitelist.deployed();
        const initialRoot = instance.merkleRoot();

        expect(instance.setMerkleRoot("0x" + merkleTree2.getRoot().toString('hex'))).to.eventually.be.fulfilled;

        const updatedRoot = instance.merkleRoot();

        return expect(initialRoot).to.not.equal(updatedRoot);
    })
    
    it("Non-Owner should not be able to set URI", async() => {
        let instance = await HachiWhitelist.deployed();

        return expect(instance.setMerkleRoot("0x" + merkleTree.getRoot().toString('hex'),{from: Account5})).to.eventually.be.rejected;
    })

    it("Should reject a previously whitlisted account not on the whitelist", async() => {
        let instance = await HachiWhitelist.deployed();

        const claimingLeaf = keccak256(Account4);
        const hexProof = merkleTree2.getHexProof(claimingLeaf);
        
        return expect(instance.verifyWhitelist(hexProof,Account4)).to.eventually.be.false;
    })

    it("Non-Owner should not be able to transfer ownership", async() => {
        let instance = await HachiWhitelist.deployed();

        return expect(instance.transferOwnership(Account2, {from: Account2})).to.eventually.be.rejected;
    })

    it("Non-Owner should not be able to reounce ownership", async() => {
        let instance = await HachiWhitelist.deployed();

        return expect(instance.renounceOwnership({from: Account2})).to.eventually.be.rejected;
    })

    it("Owner can transfer Ownership", async() => {
        let instance = await HachiWhitelist.deployed();

        expect(instance.owner()).to.eventually.equal(deployerAccount);
        return expect(instance.transferOwnership(Account2,{from: deployerAccount})).to.eventually.be.fulfilled;
    })

    it("Ownership should be transferred", async() => {
        let instance = await HachiWhitelist.deployed();

        return expect(instance.owner()).to.eventually.equal(Account2);
    })

    it("Owner can renounce Ownership", async() => {
        let instance = await HachiWhitelist.deployed();

        return expect(instance.renounceOwnership({from: Account2})).to.eventually.be.fulfilled;
    })

    it("Ownership has been renounced", async() => {
        let instance = await HachiWhitelist.deployed();

        return expect(instance.owner()).to.eventually.equal("0x0000000000000000000000000000000000000000");
    })
    
});
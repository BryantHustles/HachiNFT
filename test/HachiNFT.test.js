const HachiToken = artifacts.require("HACHINFT");

const keccak256 = require("keccak256");
const { default: MerkleTree } = require("merkletreejs");
const ethSigUtil = require('eth-sig-util');
const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

require("dotenv").config({path: "/Users/bryantbackus/Documents/ABackusCryptoDynasty/Projects/.env"});

//From Openzepplin
const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

//Layout Struct types
const domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
]

const ticket = [
    { name: "to", type: "address" },
    { name: "amounts", type: "uint256[]" },
    { name: "merkleProof", type: "bytes32[]" },
]

contract("HACHI NFT", async(accounts) => {
    //Accounts and Keys
    const [deployerAccount, Account2, Account3, Account4, Account5, Account6, Account7, Account8, Account9, Account10] = accounts;
    const keys = process.env.privateKeys.split(",").map(element => element.trim());

    //Create Merkle Tree
    let whitelist = accounts.slice(0,5);
    let leafNodes = whitelist.map(_addr => keccak256(_addr));
    let merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
    
    // Data Structs
    let domainData = {
        name: "HachiNftSig",
        version: "1",
        chainId: 1337,
        verifyingContract: ""
    };

    let HachiTicket = {
        "to": "",
        "amounts": [],
        "merkleProof": []
    };

    context("Public Mint False Pause False", async() => {
        var instance

        before(async() => {
            instance = await HachiToken.deployed();
            await instance.unpause();
        });

        context("Using Deployer Account", async() => {

            it("Verification fails if signed data does not match inputs", async function () {
                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account2;
                HachiTicket.amounts = [1,1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(deployerAccount));

                let data = {
                    types: {
                        EIP712Domain: domain,
                        HachiTicket: ticket,
                    },
                    primaryType: "HachiTicket",
                    domain: domainData,
                    message: HachiTicket
                }

                //Get Signature
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[0],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(
                instance.mintHachi([deployerAccount,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend})
                ).to.eventually.be.rejected;
            });

            it("Rejected if not enough funds sent", async function () {
                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account2;
                HachiTicket.amounts = [1,1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(deployerAccount));

                let data = {
                    types: {
                        EIP712Domain: domain,
                        HachiTicket: ticket,
                    },
                    primaryType: "HachiTicket",
                    domain: domainData,
                    message: HachiTicket
                }

                //Get Signature
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[0],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(
                instance.mintHachi([ HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend})
                ).to.eventually.be.rejected;

            });

            it("Rejected if any single quantity in amounts array has quantity greater than 1", async function () {
                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = deployerAccount;
                HachiTicket.amounts = [1,2,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(deployerAccount));

                let data = {
                    types: {
                        EIP712Domain: domain,
                        HachiTicket: ticket,
                    },
                    primaryType: "HachiTicket",
                    domain: domainData,
                    message: HachiTicket
                }

                //Get Signature
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[0],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(
                    instance.mintHachi([ HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend})
                    ).to.eventually.be.rejected;
            });

            it("Rejected if any single quantity in amounts array has quantity less than 1", async function () {
                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = deployerAccount;
                HachiTicket.amounts = [1,1,0];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(deployerAccount));

                let data = {
                    types: {
                        EIP712Domain: domain,
                        HachiTicket: ticket,
                    },
                    primaryType: "HachiTicket",
                    domain: domainData,
                    message: HachiTicket
                }

                //Get Signature
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[0],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(
                    instance.mintHachi([ HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend})
                    ).to.eventually.be.rejected;
            });

            it("Cannot mint to zero address", async function () {
                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = ZERO_ADDRESS;
                HachiTicket.amounts = [1,1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(deployerAccount));

                let data = {
                    types: {
                        EIP712Domain: domain,
                        HachiTicket: ticket,
                    },
                    primaryType: "HachiTicket",
                    domain: domainData,
                    message: HachiTicket
                }

                //Get Signature
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[0],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(
                    instance.mintHachi([ ZERO_ADDRESS,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend})
                    ).to.eventually.be.rejected;

            });

            it("Cannot mint more than address mint limit", async function () {
                 //Set struct data
                 domainData.verifyingContract = instance.address;
                 HachiTicket.to = deployerAccount;
                 HachiTicket.amounts = [1,1,1,1];
                 HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(deployerAccount));
 
                 let data = {
                     types: {
                         EIP712Domain: domain,
                         HachiTicket: ticket,
                     },
                     primaryType: "HachiTicket",
                     domain: domainData,
                     message: HachiTicket
                 }
 
                 //Get Signature
                 let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[0],"hex"), {data});
 
                 //Determine wei to Send
                 const mintPrice = await instance.mintPrice()
                 let weiToSend = mintPrice*HachiTicket.amounts.length
 
                 //Mint
                 expect(instance.paused()).to.eventually.be.false;
                 return expect(
                     instance.mintHachi([ HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend})
                     ).to.eventually.be.rejected;
            });

            it("Empty Amounts array will mint but no tokens will be given out", async function () {
                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = deployerAccount;
                HachiTicket.amounts = [];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(deployerAccount));

                let data = {
                    types: {
                        EIP712Domain: domain,
                        HachiTicket: ticket,
                    },
                    primaryType: "HachiTicket",
                    domain: domainData,
                    message: HachiTicket
                }

                //Get Signature
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[0],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                expect(
                    instance.mintHachi([ HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend})
                    ).to.eventually.be.fulfilled;

                let balance = await instance.balanceOfBatch([deployerAccount,deployerAccount,deployerAccount],[1,2,3]);

                expect(balance[0]).to.be.a.bignumber.equal(new BN("0"))
                expect(balance[1]).to.be.a.bignumber.equal(new BN("0"))
                return expect(balance[2]).to.be.a.bignumber.equal(new BN("0"))                
            });

            it("Cannot mint more than mint Limit", async function () {
                await instance.updateMintLimit(2);
                
                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = deployerAccount;
                HachiTicket.amounts = [1,1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(deployerAccount));

                let data = {
                    types: {
                        EIP712Domain: domain,
                        HachiTicket: ticket,
                    },
                    primaryType: "HachiTicket",
                    domain: domainData,
                    message: HachiTicket
                }

                //Get Signature
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[0],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(
                    instance.mintHachi([ HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend})
                    ).to.eventually.be.rejected;
            });

            it("3 tokens can be minted by whitelister (Use Deployer Account)", async() => {
                await instance.updateMintLimit(8000);

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = deployerAccount;
                HachiTicket.amounts = [1,1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(deployerAccount));

                let data = {
                    types: {
                        EIP712Domain: domain,
                        HachiTicket: ticket,
                    },
                    primaryType: "HachiTicket",
                    domain: domainData,
                    message: HachiTicket
                }

                //Get Signature
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[0],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                await expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend})).to.eventually.be.fulfilled;
            })

            it('Token balance of deployer should be first 3 tokens with quantity 1', async function () {
                let balance = await instance.balanceOfBatch([deployerAccount,deployerAccount,deployerAccount],[1,2,3]);

                expect(balance[0]).to.be.a.bignumber.equal(new BN("1"))
                expect(balance[1]).to.be.a.bignumber.equal(new BN("1"))
                return expect(balance[2]).to.be.a.bignumber.equal(new BN("1"))
            })

            it('Whitelist user cannot mint more than the mint limit (Deployer Account mints 1 more)', async function () {
                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = deployerAccount;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(deployerAccount));
    
                let data = {
                    types: {
                        EIP712Domain: domain,
                        HachiTicket: ticket,
                    },
                    primaryType: "HachiTicket",
                    domain: domainData,
                    message: HachiTicket
                }
    
                //Get Signature
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[0],"hex"), {data});
    
                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length
    
                //Mint
                expect(instance.paused()).to.eventually.be.false;
                await await expectRevert(
                    instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend}),
                    "Address mint limit reached"
                );
            });

            it("Minter can send minted tokens to whatever address they like", async function () {
                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = deployerAccount;
                HachiTicket.amounts = [1,1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account2));

                let data = {
                    types: {
                        EIP712Domain: domain,
                        HachiTicket: ticket,
                    },
                    primaryType: "HachiTicket",
                    domain: domainData,
                    message: HachiTicket
                }

                //Get Signature
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[1],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([deployerAccount,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account2, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("After account 2 minted and sent to Deployer account, check token IDs", async() => {
                let balance = await instance.balanceOfBatch([deployerAccount,deployerAccount,deployerAccount],[4,5,6]);

                expect(balance[0]).to.be.a.bignumber.equal(new BN("1"))
                expect(balance[1]).to.be.a.bignumber.equal(new BN("1"))
                return expect(balance[2]).to.be.a.bignumber.equal(new BN("1"))
            });

        });
    });
});




/*
context('when unpaused', function () {

    it("", async function () {

    });
    
    it('can perform normal process in non-pause', async function () {
        let instance = await HachiToken.deployed();
      expect(await instance.()).to.be.bignumber.equal('0');

      await this.pausable.normalProcess();
      expect(await this.pausable.count()).to.be.bignumber.equal('1');
    });

    it('cannot take drastic measure in non-pause', async function () {
      await expectRevert(this.pausable.drasticMeasure(),
        'Pausable: not paused',
      );
      expect(await this.pausable.drasticMeasureTaken()).to.equal(false);
    });

it("Public mint should be false", async() => {
        let instance = await HachiToken.deployed();
        await expect(instance.publicMint()).to.eventually.be.false;
    })

    describe('Minting', async() => {

    })

    describe('Transferring', async() => {

    })
    */
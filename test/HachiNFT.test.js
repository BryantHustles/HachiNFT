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
const exp = require("constants");
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

    var instance

    before(async() => {
        instance = await HachiToken.deployed();
    });

    context("Public Mint False Pause True", async() => {

        context("Minting", async() => {

            it("Deployer cannot mint", async() => {
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
                expect(instance.paused()).to.eventually.be.true;
                await expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend})).to.eventually.be.rejected
            });

            it("Account 2 cannot mint", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account2;
                HachiTicket.amounts = [1];
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
                expect(instance.paused()).to.eventually.be.true;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account2, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 3 cannot mint", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account3;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account3));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[2],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.true;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account3, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 4 cannot mint", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account4;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account4));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[3],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.true;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account4, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 5 cannot mint", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account5;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account5));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[4],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.true;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account5, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 6 cannot mint", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account6;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account6));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[5],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.true;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account6, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 7 cannot mint", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account7;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account7));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[6],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.true;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account7, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 8 cannot mint", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account8;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account8));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[7],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.true;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account8, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 9 cannot mint", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account9;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account9));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[8],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.true;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account9, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 10 cannot mint", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account10;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account10));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[9],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.true;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account10, value: weiToSend})).to.eventually.be.rejected;
            });
        })

        context("Transfers", async() => {

            it("Cannot Transfer with 0 balance - Account: Deployer Token: 0")
        })

    })

    context("Public Mint False Pause False", async() => {

        before(async() => {
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

            it("Cannot pass empty amounts array.", async function () {
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
                return expect(
                    instance.mintHachi([ HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend})
                    ).to.eventually.be.rejected;          
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
            });

            it('Token balance of deployer should be first 3 tokens with quantity 1', async function () {
                let balance = await instance.balanceOfBatch([deployerAccount,deployerAccount,deployerAccount],[1,2,3]);

                expect(balance[0]).to.be.a.bignumber.equal(new BN("1"))
                expect(balance[1]).to.be.a.bignumber.equal(new BN("1"))
                return expect(balance[2]).to.be.a.bignumber.equal(new BN("1"))
            });

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

        context("Using Other whitelisted Accounts", async() => {

            it("Account 2 cannot mint after previously minting 3 regardless of destination.", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account2;
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
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: deployerAccount, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 3 can mint 1.", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account3;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account3));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[2],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account3, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 4 can mint 2.", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account4;
                HachiTicket.amounts = [1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account4));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[3],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account4, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 5 can mint 3.", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account5;
                HachiTicket.amounts = [1,1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account5));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[4],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account5, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 3 can mint 2 more.", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account3;
                HachiTicket.amounts = [1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account3));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[2],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account3, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 4 can mint 1 more.", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account4;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account4));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[3],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account4, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 3 can no longer mint.", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account3;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account3));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[2],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account3, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 4 can no longer mint.", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account4;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account4));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[3],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account4, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 5 can no longer mint.", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account5;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account5));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[4],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account5, value: weiToSend})).to.eventually.be.rejected;
            });

        });

        context("Using other non-whitelisted Accounts", async() => {

            it("Account 6 cannot mint (1).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account6;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account6));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[5],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account6, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 7 cannot mint (2).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account7;
                HachiTicket.amounts = [1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account7));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[6],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account7, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 8 cannot mint (3).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account8;
                HachiTicket.amounts = [1,1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account8));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[7],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account8, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 9 cannot mint (2).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account9;
                HachiTicket.amounts = [1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account9));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[8],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account9, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 10 cannot mint (1).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account10;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account10));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[9],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account10, value: weiToSend})).to.eventually.be.rejected;
            });
        });
    });

    describe("Setting Public Mint", async() => {

        it("Update public mint", async() => {
            await expect(instance.updatePublicMint(true)).to.eventually.be.fulfilled;
            let pMint = await instance.publicMint();
            return expect(pMint).to.be.true;
        });
    });

    context("Public Mint True Pause False", async() => {

        describe("Check accounts that previsouly could not mint", async() => {

            it("Account 6 can mint (1).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account6;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account6));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[5],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account6, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 7 can mint (2).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account7;
                HachiTicket.amounts = [1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account7));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[6],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account7, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 8 can mint (3).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account8;
                HachiTicket.amounts = [1,1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account8));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[7],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account8, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 9 can mint (2).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account9;
                HachiTicket.amounts = [1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account9));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[8],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account9, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 10 can mint (1).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account10;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account10));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[9],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account10, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 6 can mint more (2).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account6;
                HachiTicket.amounts = [1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account6));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[5],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account6, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 7 can mint more (1).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account7;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account7));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[6],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account7, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 8 cannot mint more (1).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account8;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account8));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[7],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account8, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 9 can mint more (1).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account9;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account9));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[8],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account9, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 10 can mint more (2).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account10;
                HachiTicket.amounts = [1,1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account10));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[9],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account10, value: weiToSend})).to.eventually.be.fulfilled;
            });

            it("Account 6 cannot mint more (1).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account6;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account6));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[5],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account6, value: weiToSend})).to.eventually.be.rejected;
            });

            it("Account 10 cannot mint more (1).", async() => {

                //Set struct data
                domainData.verifyingContract = instance.address;
                HachiTicket.to = Account10;
                HachiTicket.amounts = [1];
                HachiTicket.merkleProof = merkleTree.getHexProof(keccak256(Account10));

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
                let sig = ethSigUtil.signTypedData_v4(Buffer.from(keys[9],"hex"), {data});

                //Determine wei to Send
                const mintPrice = await instance.mintPrice()
                let weiToSend = mintPrice*HachiTicket.amounts.length

                //Mint
                expect(instance.paused()).to.eventually.be.false;
                return expect(instance.mintHachi([HachiTicket.to,HachiTicket.amounts,HachiTicket.merkleProof,sig],{from: Account10, value: weiToSend})).to.eventually.be.rejected;
            });
        })
    });
});
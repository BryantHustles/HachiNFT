const HachiToken = artifacts.require("HACHINFT");

const keccak256 = require("keccak256");
const { default: MerkleTree } = require("merkletreejs");
const ethSigUtil = require('eth-sig-util');
const chai = require("../setupchai.js");
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

    describe("Pre-Mint + Mint Tests", async() => {

        context("Public Mint False Pause True", async() => {
            describe("Checking Initial State", async() => {
                it("Paused True", async() => {
                    return expect(instance.paused()).to.eventually.be.true;
                });
                
                it("Public Mint false", async() => {
                    return expect(instance.publicMint()).to.eventually.be.false;
                });
            });

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
            });

            context("Single Transfers", async() => {

                it("Cannot Transfer with 0 balance - Account: Deployer Token: 0 Quant: 0", async() => {
                    return  expect(instance.safeTransferFrom(deployerAccount,Account2,0,0,"",{from: deployerAccount})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: Deployer Token: 0 Quant: 1", async() => {
                    return  expect(instance.safeTransferFrom(deployerAccount,Account3,0,1,"",{from: deployerAccount})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 2 Token: 1 Quant: 0", async() => {
                    return  expect(instance.safeTransferFrom(Account2,Account3,0,0,"",{from: Account2})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 2 Token: 0 Quant: 1", async() => {
                    return  expect(instance.safeTransferFrom(Account2,deployerAccount,0,1,"",{from: Account2})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 5 Token: 4 Quant: 0", async() => {
                    return  expect(instance.safeTransferFrom(Account5,Account2,4,0,"",{from: Account5})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 5 Token: 5 Quant: 3", async() => {
                    return  expect(instance.safeTransferFrom(Account5,deployerAccount,5,3,"",{from: Account5})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 10 Token: 100 Quant: 2", async() => {
                    return  expect(instance.safeTransferFrom(Account10,Account3,100,2,"",{from: Account10})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 7 Token: 50 Quant: 1 (Sent to self)", async() => {
                    return  expect(instance.safeTransferFrom(Account7,Account7,50,1,"",{from: Account7})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 8 Token: 70 Quant: 1", async() => {
                    return  expect(instance.safeTransferFrom(Account8,Account7,70,1,"",{from: Account8})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 4 Token: 324 Quant: 20", async() => {
                    return  expect(instance.safeTransferFrom(Account4,Account2,324,20,"",{from: Account4})).to.eventually.be.rejected;
                });
            });
            
            context("Batch Transfers", async() => {
                
                it("Cannot Transfer with 0 balance - Account: deployer Tokens: 0,1,2 Quants: 0,0,0", async() => {
                    return  expect(instance.safeBatchTransferFrom(deployerAccount,Account2,[0,1,2],[0,0,0],"",{from: deployerAccount})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: deployer Tokens: 0,1,2 Quants: 1,1,1", async() => {
                    return  expect(instance.safeBatchTransferFrom(deployerAccount,Account2,[0,1,2],[0,0,0],"",{from: deployerAccount})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 4 Tokens: 2,3,4 Quants: 0,0,0", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account4,deployerAccount,[2,3,4],[0,0,0],"",{from: Account4})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 4 Tokens: 2,3,4 Quants: 1,1,1", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account4,deployerAccount,[2,3,4],[1,1,1],"",{from: Account4})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 4 Tokens: 2,3,4 Quants: 1,2,3", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account4,deployerAccount,[2,3,4],[1,2,3],"",{from: Account4})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 6 Tokens: 5,6,7 Quants: 0,0,0", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account6,deployerAccount,[5,6,7],[0,0,0],"",{from: Account6})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 6 Tokens: 5,6,7 Quants: 1,0,1", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account6,Account2,[5,6,7],[1,0,1],"",{from: Account6})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 6 Tokens: 7,8,9 Quants: 0,0,0 (Sent to self)", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account6,Account6,[7,8,9],[0,0,0],"",{from: Account6})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 10 Tokens: 0,0,0 Quants: 0,0,0", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account10,Account2,[0,0,0],[0,0,0],"",{from: Account10})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 10 Tokens: 1,1,1 Quants: 0,0,0", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account10,Account2,[1,1,1],[0,0,0],"",{from: Account10})).to.eventually.be.rejected;
                });
            });

        })

        context("Public Mint True Pause True", async() => {

            before(async() => {
                await instance.updatePublicMint(true);
            });

            describe("Checking Initial State", async() => {
                it("Paused True", async() => {
                    return expect(instance.paused()).to.eventually.be.true;
                });
                
                it("Public Mint True", async() => {
                    return expect(instance.publicMint()).to.eventually.be.true;
                });
            });

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
            });

            context("Single Transfers", async() => {

                it("Cannot Transfer with 0 balance - Account: Deployer Token: 0 Quant: 0", async() => {
                    return  expect(instance.safeTransferFrom(deployerAccount,Account2,0,0,"",{from: deployerAccount})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: Deployer Token: 0 Quant: 1", async() => {
                    return  expect(instance.safeTransferFrom(deployerAccount,Account3,0,1,"",{from: deployerAccount})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 2 Token: 1 Quant: 0", async() => {
                    return  expect(instance.safeTransferFrom(Account2,Account3,0,0,"",{from: Account2})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 2 Token: 0 Quant: 1", async() => {
                    return  expect(instance.safeTransferFrom(Account2,deployerAccount,0,1,"",{from: Account2})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 5 Token: 4 Quant: 0", async() => {
                    return  expect(instance.safeTransferFrom(Account5,Account2,4,0,"",{from: Account5})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 5 Token: 5 Quant: 3", async() => {
                    return  expect(instance.safeTransferFrom(Account5,deployerAccount,5,3,"",{from: Account5})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 10 Token: 100 Quant: 2", async() => {
                    return  expect(instance.safeTransferFrom(Account10,Account3,100,2,"",{from: Account10})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 7 Token: 50 Quant: 1 (Sent to self)", async() => {
                    return  expect(instance.safeTransferFrom(Account7,Account7,50,1,"",{from: Account7})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 8 Token: 70 Quant: 1", async() => {
                    return  expect(instance.safeTransferFrom(Account8,Account7,70,1,"",{from: Account8})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 4 Token: 324 Quant: 20", async() => {
                    return  expect(instance.safeTransferFrom(Account4,Account2,324,20,"",{from: Account4})).to.eventually.be.rejected;
                });
            });
            
            context("Batch Transfers", async() => {
                
                it("Cannot Transfer with 0 balance - Account: deployer Tokens: 0,1,2 Quants: 0,0,0", async() => {
                    return  expect(instance.safeBatchTransferFrom(deployerAccount,Account2,[0,1,2],[0,0,0],"",{from: deployerAccount})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: deployer Tokens: 0,1,2 Quants: 1,1,1", async() => {
                    return  expect(instance.safeBatchTransferFrom(deployerAccount,Account2,[0,1,2],[0,0,0],"",{from: deployerAccount})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 4 Tokens: 2,3,4 Quants: 0,0,0", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account4,deployerAccount,[2,3,4],[0,0,0],"",{from: Account4})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 4 Tokens: 2,3,4 Quants: 1,1,1", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account4,deployerAccount,[2,3,4],[1,1,1],"",{from: Account4})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 4 Tokens: 2,3,4 Quants: 1,2,3", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account4,deployerAccount,[2,3,4],[1,2,3],"",{from: Account4})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 6 Tokens: 5,6,7 Quants: 0,0,0", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account6,deployerAccount,[5,6,7],[0,0,0],"",{from: Account6})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 6 Tokens: 5,6,7 Quants: 1,0,1", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account6,Account2,[5,6,7],[1,0,1],"",{from: Account6})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 6 Tokens: 7,8,9 Quants: 0,0,0 (Sent to self)", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account6,Account6,[7,8,9],[0,0,0],"",{from: Account6})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 10 Tokens: 0,0,0 Quants: 0,0,0", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account10,Account2,[0,0,0],[0,0,0],"",{from: Account10})).to.eventually.be.rejected;
                });

                it("Cannot Transfer with 0 balance - Account: 10 Tokens: 1,1,1 Quants: 0,0,0", async() => {
                    return  expect(instance.safeBatchTransferFrom(Account10,Account2,[1,1,1],[0,0,0],"",{from: Account10})).to.eventually.be.rejected;
                });
            });

        })

        context("Public Mint False Pause False", async() => {

            before(async() => {
                await instance.unpause();
                await instance.updatePublicMint(false);
            });

            describe("Checking State", async() => {
                it("Paused False", async() => {
                    return expect(instance.paused()).to.eventually.be.false;
                });
                
                it("Public Mint False", async() => {
                    return expect(instance.publicMint()).to.eventually.be.false;
                });
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

                it("Minter can send minted tokens to whatever address they like (Account 2 mints to Deployer)", async function () {
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

        context("Public Mint True Pause False", async() => {

            before(async() => {
                await instance.updatePublicMint(true);
            });

            describe("Checking State", async() => {
                it("Paused False", async() => {
                    return expect(instance.paused()).to.eventually.be.false;
                });
                
                it("Public Mint True", async() => {
                    return expect(instance.publicMint()).to.eventually.be.true;
                });
            });

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

    describe("Post-Mint Tests", async() => {
        
        context("Public Mint False Pause True", async() => {
            before(async() => {
                await instance.updatePublicMint(false);
                await instance.pause();
            });

            describe("Checking State", async() => {
                it("Paused False", async() => {
                    return expect(instance.paused()).to.eventually.be.true;
                });
                
                it("Public Mint false", async() => {
                    return expect(instance.publicMint()).to.eventually.be.false;
                });
            });

            context("Can transfer during pause", async() => {

                context("Transactions that should be rejected.", async() => {

                    context("Single Transfers.", async() => {

                        it("Cannot Transfer Token Account does not have - Token: 7 From: Deployer To: Account2", async() => {
                            return  expect(instance.safeTransferFrom(deployerAccount,Account2,7,1,[],{from: deployerAccount})).to.eventually.be.rejected;
                        });

                        it("Cannot Transfer quantity greater than 0 - Token: 1 From: Deployer To: Account2", async() => {
                            return  expect(instance.safeTransferFrom(deployerAccount,Account2,1,2,[],{from: deployerAccount})).to.eventually.be.rejected;
                        });

                        it("Cannot Transfer for another account by default - Token: 1 From: Deployer To: Account2 Transferred by Account3", async() => {
                            return  expect(instance.safeTransferFrom(deployerAccount,Account2,1,1,[],{from: Account3})).to.eventually.be.rejected;
                        });

                        it("Cannot Transfer from another account to own wallet - Token: 1 From: Deployer To: Account2 Transferred by Account3", async() => {
                            return  expect(instance.safeTransferFrom(deployerAccount,Account2,1,1,[],{from: Account2})).to.eventually.be.rejected;
                        });

                    });

                    context("Batch Transfers.", async() => {

                        it("Cannot Transfer Token Account does not have - Token: [7,8,9] From: Deployer To: Account2", async() => {
                            return  expect(instance.safeBatchTransferFrom(deployerAccount,Account2,[7,8,9],[1,1,1],[],{from: deployerAccount})).to.eventually.be.rejected;
                        });

                        it("Cannot Transfer quantity greater than 0 - Token: [1,2,3] From: Deployer To: Account2", async() => {
                            return  expect(instance.safeBatchTransferFrom(deployerAccount,Account2,[1,2,3],[2,3,4],[],{from: deployerAccount})).to.eventually.be.rejected;
                        });

                        it("Cannot Transfer where 1 quantity greater than 0 - Token: [1,2,3] From: Deployer To: Account2", async() => {
                            return  expect(instance.safeBatchTransferFrom(deployerAccount,Account2,[1,2,3],[1,3,1],[],{from: deployerAccount})).to.eventually.be.rejected;
                        });

                        it("Cannot Transfer for another account by default - Token: [1,2,3] From: Deployer To: Account2 Transferred by Account3", async() => {
                            return  expect(instance.safeBatchTransferFrom(deployerAccount,Account2,[1,2,3],[1,1,1],[],{from: Account3})).to.eventually.be.rejected;
                        });

                        it("Cannot Transfer from another account to own wallet - Token: [1,2,3] From: Deployer To: Account2 Transferred by Account3", async() => {
                            return  expect(instance.safeBatchTransferFrom(deployerAccount,Account2,[1,2,3],[1,1,1],[],{from: Account2})).to.eventually.be.rejected;
                        });
                    });
                });

                context("Transactions that should succeed", async() => {

                    context("Single Transfers.", async() => {
                        it("Can Transfer Token to self - Token: 1 From: Deployer To: Deployer", async() => {
                            return  expect(instance.safeTransferFrom(deployerAccount,deployerAccount,1,1,[],{from: deployerAccount})).to.eventually.be.fulfilled;
                        });

                        it("Can Transfer quantity of 0 - Token: 1 From: Deployer To: Account2", async() => {
                            return  expect(instance.safeTransferFrom(deployerAccount,Account2,1,0,[],{from: deployerAccount})).to.eventually.be.fulfilled;
                        });

                        it("Transfer Token 1: From: Deployer To: Account2", async() => {
                            return  expect(instance.safeTransferFrom(deployerAccount,Account2,1,1,[],{from: deployerAccount})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Token 2: From: Deployer To: Account3", async() => {
                            return  expect(instance.safeTransferFrom(deployerAccount,Account3,2,1,[],{from: deployerAccount})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Token 3: From: Deployer To: Account4", async() => {
                            return  expect(instance.safeTransferFrom(deployerAccount,Account4,3,1,[],{from: deployerAccount})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Token 7: From: Account3 To: Account5", async() => {
                            return  expect(instance.safeTransferFrom(Account3,Account5,7,1,[],{from: Account3})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Token 9: From: Account4 To: Account2", async() => {
                            return  expect(instance.safeTransferFrom(Account4,Account2,9,1,[],{from: Account4})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Token 11: From: Account5 To: Account2", async() => {
                            return  expect(instance.safeTransferFrom(Account5,Account2,11,1,[],{from: Account5})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Token 16: From: Account6 To: Account4", async() => {
                            return  expect(instance.safeTransferFrom(Account6,Account4,16,1,[],{from: Account6})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Token 20: From: Account8 To: Account5", async() => {
                            return  expect(instance.safeTransferFrom(Account8,Account5,20,1,[],{from: Account8})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Token 24: From: Account10 To: Account7", async() => {
                            return  expect(instance.safeTransferFrom(Account10,Account7,24,1,[],{from: Account10})).to.eventually.be.fulfilled;
                        });
                    });
        
                    context("Batch Transfers.", async() => {

                        it("Can Transfer Token to self - Token: [4,5,6] From: Deployer To: Deployer", async() => {
                            return  expect(instance.safeBatchTransferFrom(deployerAccount,deployerAccount,[4,5,6],[1,1,1],[],{from: deployerAccount})).to.eventually.be.fulfilled;
                        });

                        it("Can Transfer quantity of 0 - Token: [4,5] From: Deployer To: Account2", async() => {
                            return  expect(instance.safeBatchTransferFrom(deployerAccount,Account2,[4,5],[0,0],[],{from: deployerAccount})).to.eventually.be.fulfilled;
                        });

                        it("Can Transfer where one quantity is 0 - Token: [22,23] From: Deployer To: Account3", async() => {
                            return  expect(instance.safeBatchTransferFrom(Account9,Account10,[22,23],[0,1],[],{from: Account9})).to.eventually.be.fulfilled;
                        });
                        
                        it("Transfer Tokens: [4,5,6] From: deployer To: Account2", async() => {
                            return  expect(instance.safeBatchTransferFrom(deployerAccount,Account2,[4,5,6],[1,1,1],[],{from: deployerAccount})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Tokens: [9,11] From: Account2 To: Account10", async() => {
                            return  expect(instance.safeBatchTransferFrom(Account2,Account10,[9,11],[1,1],[],{from: Account2})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Tokens: [2,14] From: Account3 To: deployer", async() => {
                            return  expect(instance.safeBatchTransferFrom(Account3,deployerAccount,[2,14],[1,1],[],{from: Account3})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Tokens: [3,8,15] From: Account4 To: Account3", async() => {
                            return  expect(instance.safeBatchTransferFrom(Account4,Account3,[3,8,15],[1,1,1],[],{from: Account4})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Tokens: [10,20] From: Account5 To: Account4", async() => {
                            return  expect(instance.safeBatchTransferFrom(Account5,Account4,[10,20],[1,1],[],{from: Account5})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Tokens: [25] From: Account6 To: Account5", async() => {
                            return  expect(instance.safeBatchTransferFrom(Account6,Account5,[25],[1],[],{from: Account6})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Tokens: [17,18,24,27] From: Account7 To: Account6", async() => {
                            return  expect(instance.safeBatchTransferFrom(Account7,Account6,[17,18,24,27],[1,1,1,1],[],{from: Account7})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Tokens: [19,21] From: Account8 To: Account7", async() => {
                            return  expect(instance.safeBatchTransferFrom(Account8,Account7,[19,21],[1,1],[],{from: Account8})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Tokens: [22,28] From: Account9 To: Account8", async() => {
                            return  expect(instance.safeBatchTransferFrom(Account9,Account8,[22,28],[1,1],[],{from: Account9})).to.eventually.be.fulfilled;
                        });
        
                        it("Transfer Tokens: [29,30,11] From: Account10 To: Account9", async() => {
                            return  expect(instance.safeBatchTransferFrom(Account10,Account9,[29,30,11],[1,1,1],[],{from: Account10})).to.eventually.be.fulfilled;
                        });
                    });

                    context("Check balances.", async() => {

                    });
                });
            });
        });

        context("Public Mint False Pause False", async() => {

            before(async() => {
                await instance.unpause();    
            });

            describe("Checking State", async() => {
                it("Paused False", async() => {
                    return expect(instance.paused()).to.eventually.be.false;
                });
                
                it("Public Mint false", async() => {
                    return expect(instance.publicMint()).to.eventually.be.false;
                });
            });

            context("Can transfer while unpaused", async() => {

                context("Single Transfers", async() => {
                    it("Can Transfer Token 14: From: Deployer To: Account8", async() => {
                        return  expect(instance.safeTransferFrom(deployerAccount,Account8,14,1,[],{from: deployerAccount})).to.eventually.be.fulfilled;
                    });

                    it("Can Transfer Token 8: From: Account3 To: deployer", async() => {
                        return  expect(instance.safeTransferFrom(Account3,deployerAccount,8,1,[],{from: Account3})).to.eventually.be.fulfilled;
                    });

                    it("Can Transfer Token 27: From: Account6 To: deployer", async() => {
                        return  expect(instance.safeTransferFrom(Account6,deployerAccount,27,1,[],{from: Account6})).to.eventually.be.fulfilled;
                    });

                    it("Can Transfer Token 30: From: Account9 To: Account6", async() => {
                        return  expect(instance.safeTransferFrom(Account9,Account6,30,1,[],{from: Account9})).to.eventually.be.fulfilled;
                    });

                });

                context("Batch Transfers", async() => {
                    
                    it("Can Transfer Tokens: [5,6] From: Account2 To: Account10", async() => {
                        return  expect(instance.safeBatchTransferFrom(Account2,Account10,[5,6],[1,1],[],{from: Account2})).to.eventually.be.fulfilled;
                    });

                    it("Can Transfer Tokens: [10,20] From: Account4 To: Account2", async() => {
                        return  expect(instance.safeBatchTransferFrom(Account4,Account2,[10,20],[1,1],[],{from: Account4})).to.eventually.be.fulfilled;
                    });

                    it("Can Transfer Tokens: [19] From: Account7 To: Account4", async() => {
                        return  expect(instance.safeBatchTransferFrom(Account7,Account4,[19],[1],[],{from: Account7})).to.eventually.be.fulfilled;
                    });

                    it("Can Transfer Tokens: [5,6,9,23] From: Account10 To: Account4", async() => {
                        return  expect(instance.safeBatchTransferFrom(Account10,Account4,[5,6,9,23],[1,1,1,1],[],{from: Account10})).to.eventually.be.fulfilled;
                    });
                });                
            });
        });

        context("Public Mint True Pause False", async() => {

            before(async() => {
                await instance.updatePublicMint(true);   
            });

            describe("Checking State", async() => {
                it("Paused False", async() => {
                    return expect(instance.paused()).to.eventually.be.false;
                });
                
                it("Public Mint false", async() => {
                    return expect(instance.publicMint()).to.eventually.be.true;
                });
            });

            context("Public mint should have no bearing on transfers", async() => {

                context("Single Transfers", async() => {

                    it("Can Transfer Token 27: From: Deployer To: Account4", async() => {
                        return  expect(instance.safeTransferFrom(deployerAccount,Account4,27,1,[],{from: deployerAccount})).to.eventually.be.fulfilled;
                    });

                    it("Can Transfer Token 28: From: Account8 To: Account6", async() => {
                        return  expect(instance.safeTransferFrom(Account8,Account6,28,1,[],{from: Account8})).to.eventually.be.fulfilled;
                    });
                });

                context("Batch Transfers", async() => {

                    it("Can Transfer Tokens: [4,20] From: Account2 To: Account5", async() => {
                        return  expect(instance.safeBatchTransferFrom(Account2,Account5,[4,20],[1,1],[],{from: Account2})).to.eventually.be.fulfilled;
                    });

                    it("Can Transfer Tokens: [11,29] From: Account9 To: Account8", async() => {
                        return  expect(instance.safeBatchTransferFrom(Account9,Account8,[11,29],[1,1],[],{from: Account9})).to.eventually.be.fulfilled;
                    });
                });
            });
        });

        let one

        describe("Accounts can check their own balances", async() => {

            before(async() => {
                one = new BN("1")
            })

            it("Check deployer balance", async() => {
                let balance = await instance.balanceOfBatch([deployerAccount,deployerAccount],[2,8],{from: deployerAccount});
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return 
            });

            it("Check Account2 balance", async() => {
                let balance = await instance.balanceOfBatch([Account2,Account2],[1,10],{from: Account2});
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return 
            });

            it("Check Account3 balance", async() => {
                let balance = await instance.balanceOfBatch([Account3,Account3,Account3],[3,13,15],{from: Account3});
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return
            });

            it("Check Account4 balance", async() => {
                let balance = await instance.balanceOfBatch([Account4,Account4,Account4,Account4,Account4,Account4,Account4],[5,6,9,16,19,23,27],{from: Account4})
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return
            });

            it("Check Account5 balance", async() => {
                let balance = await instance.balanceOfBatch([Account5,Account5,Account5,Account5,Account5],[4,7,12,20,25],{from: Account5})
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return
            });

            it("Check Account6 balance", async() => {
                let balance = await instance.balanceOfBatch([Account6,Account6,Account6,Account6,Account6,Account6],[17,18,24,26,30,28],{from: Account6})
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return
            });

            it("Check Account7 balance", async() => {
                let balance = await instance.balanceOf(Account7,21,{from: Account7});
                return expect(balance).to.be.a.bignumber.equal(new BN("1"));
            });

            it("Check Account8 balance", async() => {
                let balance = await instance.balanceOfBatch([Account8,Account8,Account8,Account8],[14,22,11,29],{from: Account8})
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return
            });

        });

        describe("Accounts can check balances of other accounts", async() => {

            before(async() => {
                one = new BN("1")
            })

            it("Check deployer balance", async() => {
                let balance = await instance.balanceOfBatch([deployerAccount,deployerAccount],[2,8],{from: Account2});
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return 
            });

            it("Check Account2 balance", async() => {
                let balance = await instance.balanceOfBatch([Account2,Account2],[1,10],{from: Account4});
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return 
            });

            it("Check Account3 balance", async() => {
                let balance = await instance.balanceOfBatch([Account3,Account3,Account3],[3,13,15],{from: Account6});
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return
            });

            it("Check Account4 balance", async() => {
                let balance = await instance.balanceOfBatch([Account4,Account4,Account4,Account4,Account4,Account4,Account4],[5,6,9,16,19,23,27],{from: Account9})
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return
            });

            it("Check Account5 balance", async() => {
                let balance = await instance.balanceOfBatch([Account5,Account5,Account5,Account5,Account5],[4,7,12,20,25],{from: Account8})
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return
            });

            it("Check Account6 balance", async() => {
                let balance = await instance.balanceOfBatch([Account6,Account6,Account6,Account6,Account6,Account6],[17,18,24,26,30,28],{from: Account8})
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return
            });

            it("Check Account7 balance", async() => {
                let balance = await instance.balanceOf(Account7,21,{from: Account10});
                return expect(balance).to.be.a.bignumber.equal(new BN("1"));
            });

            it("Check Account8 balance", async() => {
                let balance = await instance.balanceOfBatch([Account8,Account8,Account8,Account8],[14,22,11,29],{from: Account8})
                for (const quant of balance) {
                    expect(quant).to.be.a.bignumber.equal(one);
                };
                return
            });

        });
    });
});
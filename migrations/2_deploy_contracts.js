var Wallet = artifacts.require("HACHIWallet");
var Whitelist = artifacts.require("HACHIWhitelist");
var HachiNFT = artifacts.require("HACHINFT");

require("dotenv").config({path: "../../.env"});

const readMerkleTree = require("../client/src/Whitelist/ReadMerkleTree");
const treeJSON = require("../client/src/Whitelist/merkleTree.json");

module.exports = async function(deployer) {

    let addr = await web3.eth.getAccounts();

    const [deployerAccount, Account2, Account3] = addr;

    const merkleTree = readMerkleTree(treeJSON);
    const rootHash = merkleTree.getRoot();

    await deployer.deploy(Wallet,[deployerAccount,Account2,Account3],[1,1,2]);
    await deployer.deploy(Whitelist,rootHash);

    let WalletInstance = await Wallet.deployed();
    let WhitelistInstance = await Whitelist.deployed()

    await deployer.deploy(HachiNFT,process.env.HachiIpfs,WhitelistInstance.address,WalletInstance.address);
}
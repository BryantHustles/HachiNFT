const { default: MerkleTree } = require("merkletreejs");

var Wallet = artifacts.require("HACHIWallet");
var Whitelist = artifacts.require("HACHIWhitelist");
var HachiNFT = artifacts.require("HACHINFT");
const IPFSLink = "ipfs://QmQ6tZha8rMRE1SjdfjWGDZiUrzPcRfxxESDHuQABbZDS8?"

require("dotenv").config({path: "../../.env"});

const keccak256 = require("keccak256");

module.exports = async function(deployer) {

    let addr = await web3.eth.getAccounts();

    const [deployerAccount, Account2, Account3, Account4, Account5, Account6, Account7, Account8, Account9, Account10] = addr;

    let  whiteListAddresses = [deployerAccount, Account2, Account3, Account4, Account5];

    const leafNodes = whiteListAddresses.map(_addr => keccak256(_addr));
    const merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
    const rootHash = merkleTree.getRoot();

    await deployer.deploy(Wallet,[deployerAccount,Account2,Account3],[1,1,2]);
    await deployer.deploy(Whitelist,rootHash);

    let WalletInstance = await Wallet.deployed();
    let WhitelistInstance = await Whitelist.deployed()

    await deployer.deploy(HachiNFT,IPFSLink,WhitelistInstance.address,WalletInstance.address);
}
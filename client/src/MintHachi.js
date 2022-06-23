const Wallet = require("./contracts/HACHIWallet.json");
const Whitelist = require("./contracts/HACHIWhitelist.json");
const HachiNFT = require("./contracts/HACHINFT.json");
const Web3 = require("web3");
const keccak256 = require("keccak256");
const { default: MerkleTree } = require("merkletreejs");
const ethSigUtil = require('eth-sig-util');
const BN = Web3.utils.BN;


const prvtKeys = [
    "c2c3dd82890bfb952d963e5f0b149f934e3dbe8366b97334e62de094cbeec0d5",
    "e61d27bf676bbb0d087528c99f0e1684841b5dc8ec66a34a5ff27ea43fad138b",
    "c0b26139a7009bd3921e390db2bea8af48b69db124897e68ea5e59559ca9d4ad"
]
const amounts = [1];

const init1 = async () => {

    const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:8545");
    const web3 = new Web3(provider);

    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts().then(console.log());
    const [deployerAccount, Account2, Account3, Account4, Account5, Account6, Account7, Account8, Account9, Account10] = accounts;

    // Get the network ID
    networkId = await web3.eth.net.getId();

    //Set Contract Instances
    nftInstance = new web3.eth.Contract(
        HachiNFT.abi,
        HachiNFT.networks[networkId] && HachiNFT.networks[networkId].address,
    );

    whitelistInstance = new web3.eth.Contract(
        Whitelist.abi,
        Whitelist.networks[networkId] && Whitelist.networks[networkId].address,
    );

    walletInstance = new web3.eth.Contract(
        Wallet.abi,
        Wallet.networks[networkId] && Wallet.networks[networkId].address,
    );

    
    //Get whitelist accounts and merkle proof
    let whiteListAddresses = [deployerAccount, Account2, Account3, Account4, Account5];

    const leafNodes = whiteListAddresses.map(_addr => keccak256(_addr));
    const merkleTree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
    const claimingLeaf = keccak256(deployerAccount);
    const hexProof = merkleTree.getHexProof(claimingLeaf);

    //Get Sender
    const signer = deployerAccount;

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

    //Create data structs

    const domainData = {
        name: "HachiNftSig",
        version: "1",
        chainId: await web3.eth.getChainId(),//Come back and hardcode the ID later
        verifyingContract: await nftInstance.options.address
    };

    const HachiTicket = {
        "to": signer,
        "amounts": amounts,
        "merkleProof": hexProof
    };

    //Layout Variables

    data = {
        types: {
            EIP712Domain: domain,
            HachiTicket: ticket,
        },
        primaryType: "HachiTicket",
        domain: domainData,
        message: HachiTicket
    };

    //Get Transaction Signature

    const sig = ethSigUtil.signTypedData_v4(Buffer.from(prvtKeys[0], 'hex'), {data});

    console.log(sig)
    
    //Send Transaction

    const mintQuantity = amounts.length;
    const mintCost = web3.utils.toWei("0.1","ether");
    const totalCost = mintCost*mintQuantity;

    // web3.eth.accounts.wallet.add(prvtKeys[0]);
    //const tx = await nftInstance.methods.mintHachi([signer,amounts,hexProof,sig])

    // receipt = await nftInstance.methods.mintHachi(([signer,amounts,hexProof,sig])).send(
    //     {
    //         from: signer,
    //         gasPrice: await web3.eth.getGasPrice(),
    //         gas: 80000,//await tx.estimateGas({from: signer}), 
    //         value: totalCost    
    //     }).then(
    //         console.log(await nftInstance.methods.balanceOf(signer,1).call({from: signer}))
    //     )

    // console.log(receipt)

    // const receipt = await web3.eth.signTransaction(
    //     {
    //         from: signer,
    //         to: nftInstance.options.address,
    //         data: tx.encodeABI(),
    //         gas: await tx.estimateGas({from: signer}),
    //         gasPrice: await web3.eth.getGasPrice(),
    //         nonce: await web3.eth.getTransactionCount(signer),
    //         value: totalCost*10
    //     }
    // );


    //Test Pausing functionality
    // if (await nftInstance.methods.paused().call({from: signer}) == true) {
    //     await nftInstance.methods.unpause().send({from: signer});
    //     await nftInstance.methods.paused().call({from: signer}).then(console.log)
    // } else {
    //     await nftInstance.methods.pause().send({from: signer});
    //     await nftInstance.methods.paused().call({from: signer}).then(console.log)
    // }

   await web3.eth.sendTransaction({from: Account10,to: walletInstance.options.address, value: web3.utils.toWei("1","Ether")})

   const balance = parseInt(await web3.eth.getBalance(walletInstance.options.address),10)
    console.log(web3.utils.BN(balance))
}

init1();
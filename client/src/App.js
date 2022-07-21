import React, { Component } from "react";
import Token from "./contracts/HACHINFT";
import Wallet from "./contracts/HachiWallet"
import Whitelist from "./contracts/HachiWhitelist"
import getWeb3 from "./getWeb3";
import { ethers } from "ethers";
import "./App.css";
import treeJSON from "./Whitelist/merkleTree.json"
import Cookies from 'universal-cookie';

//Cookies
const cookies = new Cookies();

//Merkle Tree
const readMerkleTree = require("./Whitelist/ReadMerkleTree");
const keccak256 = require("keccak256");

class App extends Component {
  state = { 
    loaded:false, 
    mintLimit:0, 
    readMintLimit:0, 
    addressMintLimit:0, 
    readAddressMintLimit:0, 
    mintPrice:0, 
    readMintPrice:0, 
    isPublicMint:false,
    isPaused:false, 
    metaReveal:false,
    readUri:"",
    tokenNumber:null,
    tokenURI:"",
    balanceCheckSingleAddress:"",
    balanceCheckSingleTokenNumber:null,
    balanceCheckSingleQuant:null,
    balanceCheckBatchAddress:"",
    balanceCheckBatchTokenNumbers:"",
    balanceCheckBatchQuant:"",
    mintQuantity:0,
    connectedAccounts:[],
    activeBalance:null,
    activeAddress:"",
    ownedTokens:[],
    ownedTokenMap: {},
    permission: false,
    TransferSingleTo: "",
    TransferSingleId: "",
    TransferBatchTo: "",
    TransferBatchIds: "",
    defualtRoyalty: null,
    defualtUri: "",
    MetaUri: "",
    newOwnerNFT: "",
    newOwnerWhitelist: "",
    newOwnerWallet: "",
    merkleRoot: "",
    whitelistOwner: "",
    newMerkleRoot: "",
    walletOwner: "",
    walletBalanceOwed: 0,
    walletBalance: 0,
    walletShares: 0,
    walletReleased: 0,
    WalletPayeeIndex: 0,
    WalletReleasedToAddress: "",
    WalletSharesAddress: "",
    WalletPayeeAddress: "",
    WalletReleasedTo: "",
    WalletShares: 0,
    releaseAddress: ""
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();
      this.networkId = await this.web3.eth.net.getId()

      // Use web3 to get the user's accounts.
       this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.tokenInstance = new this.web3.eth.Contract(
        Token.abi,
        Token.networks[this.networkId] && Token.networks[this.networkId].address,
      );

      this.walletInstance = new this.web3.eth.Contract(
        Wallet.abi,
        Wallet.networks[this.networkId] && Wallet.networks[this.networkId].address,
      );

      this.whitelistInstance = new this.web3.eth.Contract(
        Whitelist.abi,
        Whitelist.networks[this.networkId] && Whitelist.networks[this.networkId].address,
      );

      this.merkleTree = readMerkleTree(treeJSON);

      //Layout Struct types
      this.domain = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ];

      this.ticket = [
        { name: "to", type: "address" },
        { name: "amounts", type: "uint256[]" },
        { name: "merkleProof", type: "bytes32[]" },
      ];

      // Data Structs
      this.domainData = {
        name: "HachiNftSig",
        version: "1",
        chainId: await this.web3.eth.getChainId(),// Hardcode later on
        verifyingContract: await this.tokenInstance.options.address
      };

      this.HachiTicket = {
        "to": "",
        "amounts": [],
        "merkleProof": []
      };

      //Start listeners
      this.listenForAccountChanged();
      this.listenForChainChanged();
      
      //Set State
      this.setState({loaded:true},this.handleOnLoad);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  //#############################################################
  //NFT Contract Call Functions
  //#############################################################

  refreshStateData = async() => {
    let mintLimit = await this.tokenInstance.methods.mintLimit().call();
    let addressMintLimit = await this.tokenInstance.methods.addressMintLimit().call();
    let mintPrice = this.web3.utils.fromWei(await this.tokenInstance.methods.mintPrice().call(), "ether");
    let isPublicMint = await this.tokenInstance.methods.publicMint().call();
    let isPaused = await this.tokenInstance.methods.paused().call();
    let URI = await this.tokenInstance.methods.contractURI().call();
    let metaReveal = await this.tokenInstance.methods.metaDataReveal().call()
  
    this.setState({
      readMintLimit:mintLimit,
      readAddressMintLimit:addressMintLimit,
      readMintPrice:mintPrice,
      isPublicMint:isPublicMint,
      isPaused:isPaused,
      readUri:URI,
      metaReveal:metaReveal
    });
  };

  handleGetTokenURI = async(_token) => {
    let URI  = await this.tokenInstance.methods.uri(_token).call();
    return URI
  };

  handleGetQueriedTokenURI = async() => {
    this.setState({tokenURI:await this.handleGetTokenURI(this.state.tokenNumber)});
  };

  handleBalanceOfSingle = async() => {
    let balance = await this.tokenInstance.methods.balanceOf(this.state.balanceCheckSingleAddress,this.state.balanceCheckSingleTokenNumber).call();
    this.setState({balanceCheckSingleQuant:balance});
  }

  handleBalanceOfBatch = async() => {
    let balance = await this.tokenInstance.methods.balanceOfBatch(this.state.balanceCheckBatchAddress.split(','),this.state.balanceCheckBatchTokenNumbers.split(',')).call();
    let output = ""

    for (let i=0; i<balance.length; i++) {
      output = output + "Token " + this.state.balanceCheckBatchTokenNumbers.split(',')[i] + ": " + balance[i] + ", "
  }
    output = output.substring(0,output.length - 2).trim()
    this.setState({balanceCheckBatchQuant:output});
  }

  //#############################################################
  //NFT Contract Function Interactions
  //#############################################################

  handleMintHachi = async() => {
    //Create amounts array
    let _amounts = []
    for (let i = 0; i < this.state.mintQuantity; i++) {
      _amounts.push(1);
    };

    //Set Sender
    let _sender = this.state.activeAddress

    //Create Ticket and add data
    let _ticket = this.HachiTicket;
    _ticket.to = _sender;
    _ticket.amounts = _amounts;
    _ticket.merkleProof = this.merkleTree.getHexProof(keccak256(_sender));

    let _data = JSON.stringify({
      domain: this.domainData,
      message: _ticket,
      primaryType: "HachiTicket",
      types: {
        EIP712Domain: this.domain,
        HachiTicket: this.ticket,
      } 
    });

    //determine Wei to send
    let _cost = this.web3.utils.toWei(this.state.readMintPrice,"ether") * this.state.mintQuantity;

    //Get account signature
    const method = "eth_signTypedData_v4"
    const params = [_sender, _data]

    let _sig = null

    await this.web3.currentProvider.send(
      {method, params, _sender},
      function (err, result) {
        if (err) return console.dir(err);
        if (result.error) {
          alert(result.error.message);
        }
        if (result.error) return console.error('ERROR', result);
        console.log('TYPED SIGNED:' + JSON.stringify(result.result));
        _sig = result.result
    });

    //Mint Hachi
    let _mintParams = [_ticket.to,_ticket.amounts,_ticket.merkleProof,_sig]

    await this.tokenInstance.methods.mintHachi(_mintParams).send(
      {from: _sender, value: _cost},
      function (err, result) {
        if (err) return console.dir(err);
        if (result.error) {
          alert(result.error.message);
        }
        if (result.error) return console.error('ERROR', result);
      });
  };

  handleTransferSingle = async() => {
    await this.tokenInstance.methods.safeTransferFrom(this.state.activeAddress,this.state.TransferSingleTo,this.state.TransferSingleId,1,[]).send({from: this.state.activeAddress});
  };

  handleTransferBatch = async() => {
    let iDs = this.state.TransferBatchIds.split(',');
    let amounts = []

    for (let i = 0; i < iDs.length; i++) {
      amounts.push(1);
    };

    await this.tokenInstance.methods.safeBatchTransferFrom(this.state.activeAddress,this.state.TransferBatchTo,iDs,amounts,[]).send({from: this.state.activeAddress});
  };

  handleSetDefaultRoyalty = async() => {
    await this.tokenInstance.methods.setDefaultRoyalty(this.walletInstance._address,this.state.defualtRoyalty).send({from: this.state.activeAddress});  
  };
  handleSetGenericMetadata = async() => {
    await this.tokenInstance.methods.setGenericMeta(this.state.defualtUri).send({from: this.state.activeAddress});
  };
  handleSetMetaData = async() => {
    await this.tokenInstance.methods.setURI(this.state.MetaUri).send({from: this.state.activeAddress});
  };
  handleTransferOwnership = async() => {
    await this.tokenInstance.methods.transferOwnership(this.state.newOwnerNFT).send({from: this.state.activeAddress});
  };
  handleRenounceOwnership = async() => {
    await this.tokenInstance.methods.renounceOwnership().send({from: this.state.activeAddress});
  };

  //#############################################################
  //NFT Contract Update Variables
  //#############################################################

  handleUpdateMintLimit = async() => {
    await this.tokenInstance.methods.updateMintLimit(this.state.mintLimit).send({from: this.state.activeAddress});
    await this.refreshStateData();
  };

  handleUpdateAddressMintLimit = async() => {
    await this.tokenInstance.methods.updateAddressMintLimit(this.state.addressMintLimit).send({from: this.state.activeAddress});
    await this.refreshStateData();
  };

  handleUpdateMintPrice = async() => {
    await this.tokenInstance.methods.updateMintPrice(this.web3.utils.toWei(this.state.mintPrice,"ether")).send({from: this.state.activeAddress});
    await this.refreshStateData();
  };

  handleUpdatePublicMintTrue = async() => {
    await this.tokenInstance.methods.updatePublicMint(true).send({from: this.state.activeAddress});
    await this.refreshStateData();
  };

  handleUpdatePublicMintFalse = async() => {
    await this.tokenInstance.methods.updatePublicMint(false).send({from: this.state.activeAddress});
    await this.refreshStateData();
  };

  handleUpdatePause = async() => {
    await this.tokenInstance.methods.pause().send({from: this.state.activeAddress});
    await this.refreshStateData();
  };

  handleUpdateUnpause = async() => {
    await this.tokenInstance.methods.unpause().send({from: this.state.activeAddress});
    await this.refreshStateData();
  };

  handleUpdateRevealTrue = async() => {
    await this.tokenInstance.methods.revealMetaData().send({from: this.state.activeAddress});
    await this.refreshStateData();
  };

  //#############################################################
  //Determine NFT's Owned by Account Functions
  //#############################################################

  handleGetOwnedTokens = async() => {
    let _owned = []
    let _transferredFrom = []
    this.setState({
      ownedTokens: null,
      ownedTokenMap: null
    })

    //Get tokens transferrred to Address
    await this.tokenInstance.getPastEvents('TransferBatch', {
      filter: {
        to: this.state.activeAddress
      },
      fromBlock: 'earliest',
      toBlock: 'latest'
    })
    .then(function(events){
      for (let i = 0; i < events.length; i++) {
        _owned = _owned.concat(events[i].returnValues.ids);
      };
    });

    await this.tokenInstance.getPastEvents('TransferSingle', {
      filter: {
        to: this.state.activeAddress
      },
      fromBlock: 'earliest',
      toBlock: 'latest'
    })
    .then(function(events){
      for (let i = 0; i < events.length; i++) {
        _owned.push(events[i].returnValues.id)
      };
    });

    //Get tokens transferred from address
    await this.tokenInstance.getPastEvents('TransferBatch', {
      filter: {
        from: this.state.activeAddress
      },
      fromBlock: 'earliest',
      toBlock: 'latest'
    })
    .then(function(events){
      for (let i = 0; i < events.length; i++) {
        _transferredFrom = _transferredFrom.concat(events[i].returnValues.ids);
      };
    });

    await this.tokenInstance.getPastEvents('TransferSingle', {
      filter: {
        from: this.state.activeAddress
      },
      fromBlock: 'earliest',
      toBlock: 'latest'
    })
    .then(function(events){
      for (let i = 0; i < events.length; i++) {
        _transferredFrom.push(events[i].returnValues.id)
      };
    });

    //Determine tokens currentl owned
    _owned.sort()
    _transferredFrom.sort()

    for (let i = 0; _transferredFrom.length > 0; i++) {
      if (i > _transferredFrom) {
        i = 0;
      };
      for (let j = 0; _transferredFrom.length > 0; j++) {
        if (j > _owned.length) {
          j = 0;
        }
        if (_transferredFrom[i] === _owned[j]) {
          _transferredFrom.splice(i, 1)
          _owned.splice(j,1)
        };
      };
    };
    this.setState({ownedTokens: _owned})
    return _owned
  };

  handleGetOwnedTokenData  = async() => {

    let _ownedTokens = await this.handleGetOwnedTokens();
    let _uriMap = {};

    for (let i = 0; i<_ownedTokens.length; i++) {

      let _uri = await this.handleGetTokenURI(_ownedTokens[i]);
      let _response = await fetch(_uri);
      let _json = await _response.json();

      _uriMap[_ownedTokens[i]] = {
        url: _uri,
        metaData: _json
      };
    };

    this.setState({ownedTokenMap: _uriMap})

    return _uriMap
  };

  //#############################################################
  //Whitelist Contract Read Functions
  //#############################################################

  handleRefreshWhitelistInfo = async() => {
    let root = await this.whitelistInstance.methods.merkleRoot().call();
    let owner = await this.whitelistInstance.methods.owner().call();

    this.setState({
      merkleRoot:root,
      whitelistOwner:owner
    });
  };

  //#############################################################
  //Whitelist Contract Interaction Functions
  //#############################################################

  handleTransferOwnershipwhitelist = async() => {
    await this.whitelistInstance.methods.transferOwnership(this.state.newOwnerWhitelist).send({from: this.state.activeAddress});
    this.state.newOwnerWhitelist = ""
  };

  handleRenounceOwnershipWhitelist = async() => {
    await this.whitelistInstance.methods.renounceOwnership().send({from: this.state.activeAddress});
  };

  handleupdateMerkleRoot = async() => {
    await this.whitelistInstance.methods.setMerkleRoot(this.state.newMerkleRoot).send({from: this.state.activeAddress});
    this.state.newMerkleRoot = ""
    await this.handleRefreshWhitelistInfo();
  }

  //#############################################################
  //Wallet Contract Read Functions
  //#############################################################

  handleRefreshWalletInfo = async() => {
    let owner = await this.walletInstance.methods.owner().call();
    let balance = this.web3.utils.fromWei(await this.web3.eth.getBalance(this.walletInstance._address),"ether");
    let Shares = await this.walletInstance.methods.totalShares().call();
    let released = this.web3.utils.fromWei(await this.walletInstance.methods.totalReleased().call(),"ether");
    let balanceOwed = 0;
    if (this.state.activeAddress != null && this.state.activeAddress !== "") {
      balanceOwed = this.web3.utils.fromWei(await this.walletInstance.methods.viewBalanceOwed().call({from: this.state.activeAddress}),"ether");
    };

    this.setState({
      walletOwner:owner,
      walletBalance:balance,
      walletBalanceOwed:balanceOwed,
      walletShares:Shares,
      walletReleased:released
    });
  };

  handleGetPayee = async() => {
    let payee = await this.walletInstance.methods.payee(this.state.WalletPayeeIndex-1).call()
    this.setState({WalletPayeeAddress:payee})
  };

  handleReleasedTo = async() => {
    let released = await this.walletInstance.methods.released(this.state.WalletReleasedToAddress).call()
    this.setState({WalletReleasedTo:released})
  };

  handleGetShares = async() => {
    let shares = await this.walletInstance.methods.shares(this.state.WalletSharesAddress).call()
    this.setState({WalletShares:shares})
  };

  //#############################################################
  //Wallet Contract Interaction Functions
  //#############################################################

  handleTransferOwnershipWallet = async() => {
    await this.walletInstance.methods.transferOwnership(this.state.newOwnerWallet).send({from: this.state.activeAddress});
    this.state.newOwnerWallet = ""
  };

  handleRenounceOwnershipWallet = async() => {
    await this.walletInstance.methods.renounceOwnership().send({from: this.state.activeAddress});
  };

  handleRelease = async() => {
    await this.walletInstance.methods.release(this.state.releaseAddress).send({from: this.state.activeAddress});
  };

  handleEasyRelease = async() => {
      await this.walletInstance.methods.release().send({from: this.state.activeAddress});
  };
  
  //#############################################################
  //Web Page Helper Functions
  //#############################################################

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleLoadImages = async(_tokenDataObject) => {
    let frame = document.getElementById("owned hachis")

    while (frame.lastElementChild) {
      frame.removeChild(frame.lastElementChild);
    };

    frame.className = "Frame"

    let keys = Object.keys(_tokenDataObject)

    let img = null

    for (let i = 0; i < keys.length; i++) {
      img = document.createElement('img');
      img.src = _tokenDataObject[keys[i]].metaData.image;
      img.id = _tokenDataObject[keys[i]].metaData.name;
      img.className = "Hachi-Image"
      frame.appendChild(img);
      img = null
    }
    
    frame.hidden = false
  };

  handleOnLoad = async() => {
    let permissions = cookies.get('Permissions');

    if (typeof permissions !== 'undefined') {
      let parentCapability = permissions[0].parentCapability;
      let permissiontype = permissions[0].caveats[0].type;
      let address = permissions[0].caveats[0].value[0];

      if (window.ethereum &&
      parentCapability === "eth_accounts" && 
      permissiontype === "restrictReturnedAccounts" &&
      this.web3.utils.isAddress(address)
      ) {
        this.handleRequestAccounts();
        this.handleSwitchConnectButton();
        } else {
          cookies.remove("Permissions",{
            path: "\\"
          });
        };    
      };

    this.refreshStateData()
    this.handleRefreshWhitelistInfo()
    this.handleRefreshWalletInfo()
  };

  handlePrintState = async() => {
    console.log(this.state);
  };

  handlePrintPermissionsCookie = async() => {
    console.log(cookies.get('Permissions'));
  };

  handleLoadOwnedTokens = async() => {
    let _tokenData = await this.handleGetOwnedTokenData();

    if (Object.keys(_tokenData).length > 0){
      await this.handleLoadImages(_tokenData);
    }
  };

  handleSwitchConnectButton = async() => {
    let connectButton = document.getElementById("ConnectButton");
    connectButton.hidden = true

    let disconnectButton = document.getElementById("disconnectButton");
    disconnectButton.hidden = false
  };

  handleDisconnect = async() => {
    cookies.remove("Permissions",{
      path: "\\"
    });

    this.setState({
      activeAddress: ""
    });

    let ownedFrame = document.getElementById("owned hachis");
    ownedFrame.hidden = true

    let connectButton = document.getElementById("ConnectButton");
    connectButton.hidden = false

    let disconnectButton = document.getElementById("disconnectButton");
    disconnectButton.hidden = true
  };

  //#############################################################
  //Meta Mask Functions
  //#############################################################
  
  handleConnect = async() => {
    if (window.ethereum) {
      window.ethereum
      .request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      })
      .then((permissions) => {
        const accountsPermission = permissions.find(
          (permission) => permission.parentCapability === 'eth_accounts'
        );
        cookies.set("Permissions",permissions,{
          path: "\\",
          maxAge: 86400,
        });

        if (accountsPermission) {
          console.log('eth_accounts permission successfully requested!');
          this.setState({
            permission:true
          });
        };

        this.handleRequestAccounts();
        this.handleSwitchConnectButton();
      })
      .catch((error) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log('Permissions needed to continue.');
        } else {
          console.error(error);
        }
      });
    } 
    else {
      alert("install metamask extension!!");
    }
  };

  handleRequestAccounts = async() => {
    window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then((res) => {
      this.accountChangeHandler(res[0]).then(() => {
        this.handleLoadOwnedTokens();
      }).catch((error) => {
        if (error.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log('Please connect to MetaMask.');
        } else {
          console.error(error);
        };
      });
    });
  };

  accountChangeHandler = async(account) => {
    // Setting an address data
    this.setState({
      activeAddress: account
    });
    console.log("Active Account: ", account)

    if (this.state.permission) {
      // Setting a balance
      this.getbalance(account)
      let _tokenData = await this.handleGetOwnedTokenData();

      if (Object.keys(_tokenData).length > 0){
        await this.handleLoadImages(_tokenData);
      };
    };
  };

  // getbalance function for getting a balance in
  // a right format with help of ethers
  getbalance = async(address) => {
    // Requesting balance method
    window.ethereum
    .request({ 
      method: "eth_getBalance", 
      params: [address, "latest"] 
    })
    .then((balance) => {
      // Setting balance
      this.setState({
        activeBalance: ethers.utils.formatEther(balance)
      })
      console.log("Balance: ", this.state.activeBalance, " Eth")
    }).catch((error) => {
      console.log(error);
    });
  };

  //#############################################################
  //Event Listener Functions
  //#############################################################

  listenForAccountChanged = async() => {
    window.ethereum.on('accountsChanged', (accounts) => {
      //Use a cookiw to keep account present
      window.location.reload();
    });
  };
  
  listenForChainChanged = async() => {
    window.ethereum.on('chainChanged', (chainId) => {
      // Handle the new chain.
      // Correctly handling chain changes can be complicated.
      // We recommend reloading the page unless you have good reason not to.
      window.location.reload();
   });
  };

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App" style={{backgroundColor:"#CCD9FF"}}>
        <div>
          <h1>Hachi NFT Home Page</h1>
        </div>
        <div>
          <button className="Connect-Button" id="ConnectButton" hidden={false} onClick={this.handleConnect}>Connect</button>
          <button className="Disconnect-Button" id="disconnectButton" hidden={true} onClick={this.handleDisconnect}>Disconnect</button>
          <br></br><br></br>
        </div>
        <div>
          <u>Active Account</u>
          <br></br><br></br>
          {this.state.activeAddress}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridGap: 10 }}>      
          <div>
            <div>
              <h2>Token Tools</h2>
            </div>
            <div className="Generic-Box">
              <h3>Mint Your Hachi</h3>
              Amount to Mint : <input type="number" min="1" max={this.state.readAddressMintLimit} placeholder="1" name="mintQuantity" value={this.state.mintQuantity} onChange={this.handleInputChange}></input>
              <button onClick={this.handleMintHachi}>Mint Hachi</button>
            </div>
            <br></br>
            <div>
              <h2>Check balances</h2>
              <div className="Generic-Box">
                <h3>Check Single Token Balance</h3>
                <div>
                  Address : <input type="text" placeholder="0x000..." name="balanceCheckSingleAddress" onChange={this.handleInputChange}></input>
                  &nbsp;
                  <br></br>
                  Token Number : <input type="number" placeholder="1" min="1" max={this.state.readMintLimit} name="balanceCheckSingleTokenNumber" onChange={this.handleInputChange}></input>
                  &nbsp;
                  <br></br>
                  <button onClick={this.handleBalanceOfSingle}>Get Balance</button>
                  <br></br>
                  Quantity: {this.state.balanceCheckSingleQuant}
                </div>
              </div>
              <div className="Generic-Box">
                <h3>Check Batch Token balances</h3>
                <div>
                  Multiple Inputs can be separated by commas
                  <br></br>
                  NOTE: Length of Addresses and token number CSV strings must be the same!
                  <br></br><br></br>
                  Adresses : <input type="text" placeholder="0x000..,0x001..,0x002.." name="balanceCheckBatchAddress" onChange={this.handleInputChange}></input>
                  &nbsp;<br></br>
                  Tokens : <input type="text" placeholder="1,200,3405"  name="balanceCheckBatchTokenNumbers" onChange={this.handleInputChange}></input>
                  &nbsp;<br></br>
                  <button onClick={this.handleBalanceOfBatch}>Get Balances</button>
                  <br></br>
                  Quantities: {this.state.balanceCheckBatchQuant}
                </div>
              </div>
            </div>
            <br></br>
            <div>
              <h2>Transfer Hachi</h2>
            </div>
            <div>
              <div className="Generic-Box">
                <h3>Transfer Single</h3>
                <div> 
                  To: Address&nbsp;
                  <input type="text" name="TransferSingleTo" placeholder="0x000..." onChange={this.handleInputChange}></input>
                  <br></br>
                  Token ID:&nbsp;
                  <input type="number" name="TransferSingleId" min="1" max={this.state.readMintLimit} placeholder="1" onChange={this.handleInputChange}></input>
                  <br></br>
                  <button type="submit" onClick={this.handleTransferSingle}>Transfer</button>
                </div>
              </div>
                <div className="Generic-Box">
                <h3>Transfer Batch</h3>
                NOTE: Only input a single Addresses. Token numbers should be a CSV string!
                <br></br><br></br>
                <div>
                  To Address:&nbsp;
                  <input type="text" name="TransferBatchTo" placeholder="0x000" onChange={this.handleInputChange}></input>
                  <br></br>
                  Token ids:&nbsp;
                  <input type="text" name="TransferBatchIds" placeholder="1,200,3405" onChange={this.handleInputChange}></input>
                  <br></br>
                  <button type="submit" onClick={this.handleTransferBatch}>Transfer</button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2>Hachi Dashboard</h2>
            <div className="Dashboard-Box">
              <h3>Contracts Info</h3>
              <p><u>Contract Address</u><br></br>
              {this.tokenInstance._address}
              <br></br>
              <u>Whitelist Address</u><br></br>
              {this.whitelistInstance._address}
              <br></br>
              <u>Wallet Address</u><br></br>
              {this.walletInstance._address}
              <br></br>
              <u>Contract URI</u><br></br>
              {this.state.readUri}
              <br></br>
              </p>
            </div>
            <div>
              <h2>Currently Owned Hachis</h2>
              <br></br>
            </div>
            <div id="owned hachis" hidden = {true}>              
            </div>
          </div>
          <div>
            <h2>Administrative Tools</h2>
            <div>
              <h3>NFT Contract</h3>
              <div className="Generic-Box">
                <h4>Current Info</h4>
                <div>
                  <u>Mint Limit</u>
                  <br></br>
                  {this.state.readMintLimit} Hachis<br></br>
                  <u>Address Mint Limit</u> 
                  <br></br>
                  {this.state.readAddressMintLimit} Hachis<br></br>
                  <u>Mint Price</u> 
                  <br></br>
                  {this.state.readMintPrice} Eth<br></br>
                  <u>Public Mint</u> 
                  <br></br>
                  {this.state.isPublicMint.toString()}<br></br>
                  <u>Paused</u> 
                  <br></br>
                  {this.state.isPaused.toString()}<br></br>
                  <u>Meta Reveal</u> 
                  <br></br>
                  {this.state.metaReveal.toString()}<br></br><br></br>
                  <button onClick={this.refreshStateData}>Refresh</button>
                </div>
              </div>
              <div>
                <h4>Update Contract Variables</h4>
                <div className="Generic-Box">
                  Update Mint Limit : <input type="number" placeholder={this.state.readMintLimit} name="mintLimit" onChange={this.handleInputChange}></input>
                  <button onClick={this.handleUpdateMintLimit}>Update</button>
                  <br></br>
                  Update Address Mint Limit : <input type="number" placeholder={this.state.readAddressMintLimit} name="addressMintLimit" onChange={this.handleInputChange}></input>
                  <button onClick={this.handleUpdateAddressMintLimit}>Update</button>
                  <br></br>
                  Update Mint Price (Eth) : <input type="number" placeholder={this.state.readMintPrice} name="mintPrice" onChange={this.handleInputChange}></input>
                  <button onClick={this.handleUpdateMintPrice}>Update</button>
                  <br></br>
                  <u>Set Public Mint</u><br></br>
                  <button onClick={this.handleUpdatePublicMintTrue}>Set True</button>
                  <button onClick={this.handleUpdatePublicMintFalse}>Set False</button>
                  <br></br>
                  <u>Set Paused</u><br></br>
                  <button onClick={this.handleUpdatePause}>Pause</button>
                  <button onClick={this.handleUpdateUnpause}>Unpause</button>
                  <br></br>
                  <u>Reveal Meta Data</u><br></br>
                  <button onClick={this.handleUpdateRevealTrue}>Reveal</button>
                </div>
              </div>
              <div>
                <h4>Update Contract Info</h4>
                <div className="Generic-Box">
                  Set Default Royalty:&nbsp;
                  <input type="number" placeholder="100" min="1" max="10000" name="defualtRoyalty" width="auto" onChange={this.handleInputChange}></input>
                  &nbsp;
                  <button onClick={this.handleSetDefaultRoyalty}>Set Royalty</button>
                  <br></br>
                  Update Generic MetaData URI:&nbsp;
                  <input type="text" placeholder="https://wwww.URI.com/uri.json" name="defualtUri" width="auto" onChange={this.handleInputChange}></input>
                  &nbsp;
                  <button onClick={this.handleSetGenericMetadata}>Set Generic URI</button>
                  <br></br>
                  Set MetaData URI:&nbsp;
                  <input type="text" placeholder="https://wwww.URI.com/uri.json" name="MetaUri" width="auto" onChange={this.handleInputChange}></input>
                  &nbsp;
                  <button onClick={this.handleSetMetaData}>Set URI</button>
                  <br></br>
                  Transfer Ownership To:&nbsp;
                  <input type="text" placeholder="0x0000..." name="newOwnerNFT" onChange={this.handleInputChange}></input>
                  &nbsp;
                  <button onClick={this.handleTransferOwnership}>Transfer Ownership</button>
                  <br></br><br></br>
                  <button onClick={this.handleRenounceOwnership}>Renounce Ownership</button>
                </div>
              </div>
              <div>
                <h4>Read Other Contract info</h4>
                <div className="Generic-Box">
                  Token Number : <input type="number" placeholder="1" min="1" max={this.state.readMintLimit} name="tokenNumber" onChange={this.handleInputChange}></input>
                  <button onClick={this.handleGetQueriedTokenURI}>Get URI</button>
                  <br></br>
                  Token URI : {this.state.tokenURI}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridGap: 10 }}>
          <div >
            <h2>Whitelist</h2>
            <div>
              <div className="Generic-Box">
                <h3>Info</h3>
                <div>
                  <u>Owner</u><br></br>
                  {this.state.whitelistOwner}<br></br>
                  <u>Merkle root</u> <br></br>
                  {this.state.merkleRoot}<br></br>
                </div>
                <button onClick={this.handleRefreshWhitelistInfo}>Refresh</button>
              </div>
              <div className="Generic-Box">
                <h4>Update Functions</h4>
                <div>
                  Set Merkle Root:&nbsp;
                  <input  type="text" placeholder="0xjnd8923hb39fbb29db" name="newMerkleRoot" onChange={this.handleInputChange}></input>
                  <button onClick={this.handleupdateMerkleRoot}>Update</button>
                  <br></br>
                  Transfer Ownership To:&nbsp;
                  <input type="text" placeholder="0x0000..." name="newOwnerWhitelist" onChange={this.handleInputChange}></input>
                  &nbsp;
                  <button onClick={this.handleTransferOwnershipwhitelist}>Transfer Ownership</button>
                  <br></br><br></br>
                  <button onClick={this.handleRenounceOwnershipWhitelist}>Renounce Ownership</button>
                </div>
              </div>
            </div>
          </div> 
          <div>
            <h2>Wallet</h2>
            <div className="Generic-Box">
              <h3>Payment Contract Info</h3>
              <div>
              <u>Owner</u><br></br>
                {this.state.walletOwner}<br></br>
                <u>Balance</u><br></br>
                {this.state.walletBalance} Eth<br></br>
                <u>Balance Owed</u><br></br>
                {this.state.walletBalanceOwed} Eth<br></br>
                <u>Total Shares</u><br></br>
                {this.state.walletShares}<br></br>
                <u>Total Released</u><br></br>
                {this.state.walletReleased}<br></br><br></br>
                <button onClick={this.handleRefreshWalletInfo}>Refresh Data</button>
              </div>
            </div>
            <div className="Generic-Box">
              <h3>Read Contract Info Functions</h3>
              <div>
                Payee Index:&nbsp;
                <input type="number" placeholder="1" min="1" name="WalletPayeeIndex" onChange={this.handleInputChange}></input>
                &nbsp;
                <button onClick={this.handleGetPayee}>Get Payee</button>
                <br></br>
                Payee Address:&nbsp;
                {this.state.WalletPayeeAddress}
                <br></br><br></br>
                Released To Address:&nbsp;
                <input type="text" placeholder="0x0000..." name="WalletReleasedToAddress" onChange={this.handleInputChange}></input>
                &nbsp;
                <button onClick={this.handleReleasedTo}>Get Released Amount</button>
                <br></br>
                Amount released to Address:&nbsp;
                {this.state.WalletReleasedTo}
                <br></br><br></br>
                Shares Address:&nbsp;
                <input type="text" placeholder="0x0000..." name="WalletSharesAddress" onChange={this.handleInputChange}></input>
                &nbsp;
                <button onClick={this.handleGetShares}>Get Number of Shares</button>
                <br></br>
                Number of Shares:&nbsp;
                {this.state.WalletShares}
              </div>
            </div>
            <div className="Generic-Box">
              <h3>Update Wallet Contract Functions</h3>
              <div>
              Transfer Ownership To:&nbsp;
                  <input type="text" placeholder="0x0000..." name="newOwnerWallet" onChange={this.handleInputChange}></input>
                  &nbsp;
                  <button onClick={this.handleTransferOwnershipWallet}>Transfer Ownership</button>
                  <br></br><br></br>
                  <button onClick={this.handleRenounceOwnershipWallet}>Renounce Ownership</button>
              </div>
            </div>
            <div className="Generic-Box">
              <h3>Request Payment</h3>
              <div>
                Account to Release:&nbsp;
                <input type="text" placeholder="0x0000..." name="releaseAddress" onChange={this.handleInputChange}></input>
                &nbsp;
                <button onClick={this.handleRelease}>Release Funds</button>
                <br></br><br></br>
                <button onClick={this.handleEasyRelease}>Easy Release</button>
              </div>
            </div> 
          </div>   
        </div>
        <div>
        <button hidden={true} onClick={this.handlePrintState}>Print State</button>
        <button hidden={true} onClick={this.handlePrintPermissionsCookie}>Print Permissions Cookie</button>
        </div>        
      </div>
    );
  }
}

export default App;

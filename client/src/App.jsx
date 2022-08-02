//Web Page Imports
import React, { Component } from "react";
import "./App.css";
import Cookies from 'universal-cookie';

//Contract Imports
import Token from "./contracts/HACHINFT";
import Wallet from "./contracts/HachiWallet"
import Whitelist from "./contracts/HachiWhitelist"

//Web3 imports
import getWeb3 from "./getWeb3";
import { ethers } from "ethers";

//Wallet Connect Imports
import NodeWalletConnect from "@walletconnect/node";
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";

//Components
import HeaderTabContent from "./components/HeaderTabContent"
import Header from "./components/Header"
import Dashboard from "./components/Dashboard"
import ConnectWallet from "./components/ConnectWallet"
import TokenTools from "./components/TokenTools"
import WhitelistTools from "./components/WhitelistTools";
import WalletTools from "./components/WalletTools";
import AdminTools from "./components/AdminTools";
import DeveloperTools from "./components/DeveloperTools"

//Wallet Connect
// Create connector
const walletConnector = new NodeWalletConnect(
  {
    bridge: "https://bridge.walletconnect.org", // Required
  },
  {
    clientMeta: {
      description: "WalletConnect NodeJS Client",
      url: "https://nodejs.org/en/",
      icons: ["https://nodejs.org/static/images/logo.svg"],
      name: "WalletConnect",
    },
  }
);

//Cookies
const cookies = new Cookies();

//Network Info
const networkId = 4;

class App extends Component {
  state = { 
    loaded:false, 
    readMintLimit:0, 
    readAddressMintLimit:0, 
    readMintPrice:0, 
    readUri:"",
    connectedAccounts:[],
    activeBalance:null,
    activeAddress:"",
    ownedTokenMap: {},
    permission: false,
    contractUri: "",
    connection: "",
    wallet: ""
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Get the contract instance.
      this.tokenInstance = new this.web3.eth.Contract(
        Token.abi,
        Token.networks[networkId] && Token.networks[networkId].address,
      );

      this.walletInstance = new this.web3.eth.Contract(
        Wallet.abi,
        Wallet.networks[networkId] && Wallet.networks[networkId].address,
      );

      this.whitelistInstance = new this.web3.eth.Contract(
        Whitelist.abi,
        Whitelist.networks[networkId] && Whitelist.networks[networkId].address,
      );

      //Start listeners
      this.listenForAccountChanged();
      this.listenForChainChanged();
      this.listenForMint();
      this.listenForSingleTransfer();
      this.listenForBatchTransfer();
      this.listenForConnectRequest();
      this.listenForWalletConnectRequest();
      this.listenForWalletConnectDisconnect();
      
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
  //Component Helper Functions
  //#############################################################

  componentSetState = async(_stateUpdates) => {
    this.setState(_stateUpdates);
  }

  //#############################################################
  //NFT Contract Call Functions
  //#############################################################

  refreshURI = async() => {
    let URI = await this.tokenInstance.methods.contractURI().call();

    this.setState({
      readUri:URI
    });
  };

  handleGetTokenURI = async(_token) => {
    let URI  = await this.tokenInstance.methods.uri(_token).call();
    return URI
  };

  //#############################################################
  //Determine NFT's Owned by Account Functions
  //#############################################################

  handleGetOwnedTokens = async(_account) => {
    let _owned = []
    let _transferredFrom = []

    //Get tokens transferrred to Address
    await this.tokenInstance.getPastEvents('TransferBatch', {
      filter: {
        to: _account
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
        to: _account
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
        from: _account
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
        from: _account
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

    return _owned
  };

  handleGetOwnedTokenData  = async(_account) => {

    await this.setState({
      ownedTokenMap: null
    })

    let generic = require("./components/Support_Files/genericMetaData.json");
    let _ownedTokens = await this.handleGetOwnedTokens(_account);

    let _uriMap = {};

    for (let i = 0; i<_ownedTokens.length; i++) {
      let _uri = await this.handleGetTokenURI(_ownedTokens[i]);
      if (_uri.startsWith("ipfs://")) {
        _uri = _uri.replace("ipfs://","https://ipfs.io/ipfs/")
      };

      await fetch(_uri)
      .then(async response => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = (data && data.message) || response.status;
          return Promise.reject(error);
        }
        _uriMap[_ownedTokens[i]] = {
          url: _uri,
          metaData: data
        };
      })
      .catch(error => {
        console.error('There was an error fetching token metadata! Using Genric metadata', error);
        _uriMap[_ownedTokens[i]] = {
          url: _uri,
          metaData: generic
        };
      });
    };

    this.setState({ownedTokenMap: _uriMap})

    return _uriMap
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

  handleLoadImages = (_tokenDataObject) => {
    let frame = document.getElementById("owned hachis")

    while (frame.lastElementChild) {
      frame.removeChild(frame.lastElementChild);
    };

    frame.className = "Frame"

    let keys = Object.keys(_tokenDataObject)

    let img = null

    for (let i = 0; i < keys.length; i++) {
      img = document.createElement('img');

      let src = _tokenDataObject[keys[i]].metaData.image;

      if (src.startsWith("ipfs://")) {
        src = src.replace("ipfs://","https://ipfs.io/ipfs/")
      };

      img.src = src;
      img.id = _tokenDataObject[keys[i]].metaData.name;
      img.className = "Hachi-Image"
      frame.appendChild(img);
      img = null
    };
    
    frame.hidden = false
  };

  handleOnLoad = async() => {
    let permissions = cookies.get('Permissions');

    if (typeof permissions !== 'undefined') {

      if (permissions.type === "Metamask") {
        let parentCapability = permissions[0].parentCapability;
        let permissiontype = permissions[0].caveats[0].type;
        let address = permissions[0].caveats[0].value[0];

        if (window.ethereum &&
        parentCapability === "eth_accounts" && 
        permissiontype === "restrictReturnedAccounts" &&
        this.web3.utils.isAddress(address)
        ) {
          this.handleRequestAccounts()
          .then(async() => {
            this.handleSwitchConnectButton();
          });
        };
      } else if (permissions.type === "Wallet-Connect") {
        if (this.web3.utils.isAddress(permissions.detail.params[0].accounts[0])){
          this.handleSwitchConnectButton();
          this.setState({
            activeAddress: permissions.detail.params[0].accounts[0],
            connection: "Wallet-Connect",
            wallet: permissions.detail.params[0].peerMeta.name
          });
          
          this.handleLoadOwnedTokens(permissions.detail.params[0].accounts[0]);
        };
      } else {
        cookies.remove("Permissions",{
        path: "\\"
        });
      };    
    } else {
      if (walletConnector.connected) {
        walletConnector.killSession();
      };
    };

    this.refreshURI()
    
    document.getElementById("Hachi NFT").style.display = "block";
    document.getElementById("Hachi NFT Button").className += " active";
  };

  handleLoadOwnedTokens = async(_account) => {
    let _tokenData = await this.handleGetOwnedTokenData(_account);

    if (Object.keys(_tokenData).length > 0){
      await this.handleLoadImages(_tokenData);
    }
  };

  //#############################################################
  //Meta Mask Functions
  //#############################################################
  
  handleConnectMetaMask = async() => {
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
        cookies.set("Permissions",{type:"Metamask", detail:permissions},{
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
      this.accountChangeHandler(res[0]).then(async() => {
        await this.handleLoadOwnedTokens(res[0]);
        this.setState({
          connection: "Metamask"
        });
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
    await this.setState({
      activeAddress: account
    });
    console.log("Active Account: ", account)

    if (this.state.permission) {
      // Setting a balance
      await this.getbalance(account)
    };
  };

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
  //Wallet Connect Functions
  //#############################################################

  handleWalletConnectRequest = async() => {

    // Check if connection is already established
    if (!walletConnector.connected) {
      // create new session
      walletConnector.createSession().then(() => {
        // get uri for QR Code modal
        const uri = walletConnector.uri;
        // display QR Code modal
        WalletConnectQRCodeModal.open(
          uri,
          () => {
            console.log("QR Code Modal closed");
          },
          true // isNode = true
        );
      });
    } else {
        console.log("Connection is already present.")
    };
  };

  handleCloseQRModal = () => {
    // Close QR Code Modal
    WalletConnectQRCodeModal.close(
    true // isNode = true
    );
  }

  handleWalletConnect = async(_payload) => {
    if (_payload.params[0].chainId === networkId) { // Change this logic later to ====
      this.setState({
        activeAddress: _payload.params[0].accounts[0],
        connection: "Wallet-Connect",
        wallet: _payload.params[0].peerMeta.name
      });
      cookies.set("Permissions",{type:"Wallet-Connect", detail:_payload},{
        path: "\\",
        maxAge: 864000,
      });
      this.handleCloseQRModal();
      this.handleSwitchConnectButton();
      this.handleLoadOwnedTokens(_payload.params[0].accounts[0]);
    } else {
      console.error("Connection is using Chain ID " + _payload.params[0].chainId + " which is not the correct.");
      alert("Please use the correct Chain ID when connecting");
      this.handleCloseQRModal();
    };
  };


  //#############################################################
  //Event Listener Functions
  //#############################################################

  //General Listners

  listenForConnectRequest = async() => {
    await document.addEventListener("Connect-Wallet-Request", async(event) => {
      event.stopImmediatePropagation();

      let detail = event.detail;
      if (detail === "Metamask") {
        this.handleConnectMetaMask()
      } else if (detail === "Wallet-Connect") {
        this.handleWalletConnectRequest();
      };
    });
  };  

  //Contract Listensers

  listenForMint = async() => {
    this.tokenInstance.events.Mint({
      filter: {
        to: this.state.activeAddress
      },
      fromBlock: "earliest"
    })
    .on("connected", function(subscriptionId){
      console.log("Listen for Mint Subscription ID\n",subscriptionId);
    })
    .on('data', function(event){
      console.log(event);
      window.location.reload();
    })
    .on('error', function(error, receipt) { 
      console.log("\nError\n",error,"\nReceipt\n",receipt);
    });
  };

  listenForSingleTransfer = async() => {
    this.tokenInstance.events.TransferSingle({
      filter: {
        from: this.state.activeAddress
      },
      fromBlock: "earliest"
    })
    .on("connected", function(subscriptionId){
      console.log("Listen for Single Transfer Subscription ID\n",subscriptionId);
    })
    .on('data', function(event){
      let token = event.returnValues.id;
      let address = event.returnValues.to;
      console.log("Token " + token + " has been successfully transferred to " + address);
      // alert("Token " + token + " has been successfully transferred to " + address);
      window.location.reload();
    })
    .on('error', function(error, receipt) { 
      console.log("\nError\n",error,"\nReceipt\n",receipt);
    });
  };

  listenForBatchTransfer = async() => {
    this.tokenInstance.events.TransferBatch({
      filter: {
        from: this.state.activeAddress
      },
      fromBlock: "earliest"
    })
    .on("connected", function(subscriptionId){
      console.log("Listen for Batch Transfer Subscription ID\n",subscriptionId);
    })
    .on('data', function(event){
      let tokens = event.returnValues.ids;
      let address = event.returnValues.to;
      let tokenString = tokens[0];
      for(let i = 1; i < tokens.length; i++){
        tokenString += (" and " + tokens[i]);
      };
      console.log("Tokens " + tokenString + " have been successfully transferred to " + address);
      // alert("Tokens " + tokenString + " have been successfully transferred to " + address);
      window.location.reload();
    })
    .on('error', function(error, receipt) { 
      console.log("\nError\n",error,"\nReceipt\n",receipt);
    });
  };

  //Metamask Listeners

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

  //Wallet Connect Listeners

  listenForWalletConnectRequest = async() => {
    // Subscribe to connection events
    walletConnector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      } else if (payload != null) {
        console.log(payload);
        this.handleWalletConnect(payload);
      };
    });
  };

  listenForWalletConnectDisconnect = async() => {
    walletConnector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      } else {
        console.log(payload);

        let permissions = cookies.get('Permissions');

        if (typeof permissions !== 'undefined') {
          cookies.remove("Permissions",{
          });
        };

        this.setState({
          activeAddress: "",
          connection: "",
          wallet: ""
        });

        let ownedFrame = document.getElementById("owned hachis");
        ownedFrame.hidden = true

        let connectButton = document.getElementById("Connect-Button");
        connectButton.hidden = false

        let disconnectButton = document.getElementById("disconnectButton");
        disconnectButton.hidden = true
      };
    });
  };

//#############################################################
//Handle Connect/ Disconnect Button
//#############################################################

handleSwitchConnectButton = () => {
  let connectButton = document.getElementById("Connect-Button");
  connectButton.hidden = true

  let disconnectButton = document.getElementById("disconnectButton");
  disconnectButton.hidden = false

  let popup = document.getElementById("Connect-Pop-Up");
  popup.className = "global-modal";
};

handleDisconnect = async() => {

  let permissions = cookies.get('Permissions');
  if (this.state.connection === "Metamask") {

  } else if (this.state.connection === "Wallet-Connect") {
      walletConnector.killSession();
  };

  if (typeof permissions !== 'undefined') {
    cookies.remove("Permissions",{
    });
  };

  this.setState({
    activeAddress: "",
    connection: "",
    wallet: ""
  });

  let ownedFrame = document.getElementById("owned hachis");
  ownedFrame.hidden = true

  let connectButton = document.getElementById("Connect-Button");
  connectButton.hidden = false

  let disconnectButton = document.getElementById("disconnectButton");
  disconnectButton.hidden = true
};

//#############################################################
//HTML Code
//#############################################################

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <HeaderTabContent></HeaderTabContent>
        <div>
          <button className="Disconnect-Button" id="disconnectButton" hidden={true} onClick={this.handleDisconnect}>Disconnect</button>
          <ConnectWallet></ConnectWallet>
        </div>
        <Header
        activeAddress = {this.state.activeAddress}
        >
        </Header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridGap: 10 }}>
          <Dashboard
          tokenInstance = {this.tokenInstance}
          whitelistInstance = {this.whitelistInstance}
          walletInstance = {this.walletInstance}
          readUri = {this.state.readUri}
          >
          </Dashboard>
          <div id="Hachi NFT" className="tabcontent">
            <TokenTools 
            readAddressMintLimit = {this.state.readAddressMintLimit}
            readMintLimit = {this.state.readMintLimit}
            readMintPrice = {this.state.readMintPrice}
            tokenAddress = {this.tokenInstance.options.address}
            activeAddress = {this.state.activeAddress}
            connection = {this.state.connection}
            tokenInstance = {this.tokenInstance}
            web3 = {this.web3}
            walletConnector = {walletConnector}
            > 
            </TokenTools>
          </div>
          <div id="Whitelist Tools" className="tabcontent">
            <WhitelistTools
              whitelistInstance = {this.whitelistInstance}
              activeAddress = {this.state.activeAddress}
              >
            </WhitelistTools>
          </div>
          <div id="Wallet Tools" className="tabcontent">
            <WalletTools
              walletInstance = {this.walletInstance}
              activeAddress = {this.state.activeAddress}
              web3 = {this.web3}
            >  
            </WalletTools>
          </div>   
          <div id="Admin Tools" className="tabcontent">
            <AdminTools
            activeAddress = {this.state.activeAddress}
            tokenInstance = {this.tokenInstance}
            walletInstance = {this.walletInstance}
            web3 = {this.web3}
            componentSetState = {this.componentSetState}
            >   
            </AdminTools>
          </div>
        </div>
        <DeveloperTools
        state = {this.state}
        cookies = {cookies}
        >
        </DeveloperTools>       
      </div>
    );
  }
}

export default App;

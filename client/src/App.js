import React, { Component } from "react";
import Token from "./contracts/HACHINFT";
import Wallet from "./contracts/HachiWallet"
import Whitelist from "./contracts/HachiWhitelist"
import getWeb3 from "./getWeb3";
import "./App.css";
import treeJSON from "./Whitelist/merkleTree.json"

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
    balanceCheckBatchQuant:""
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();
      this.networkId = await this.web3.eth.net.getId();

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

      //Example listener
      //this.listenToTokenTransfer()
      this.setState({loaded:true},this.refreshStateData);
      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

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
  }
  
  handleUpdateMintLimit = async() => {
    await this.tokenInstance.methods.updateMintLimit(this.state.mintLimit).send({from: this.accounts[0]});
    await this.refreshStateData();
  };

  handleUpdateAddressMintLimit = async() => {
    await this.tokenInstance.methods.updateAddressMintLimit(this.state.addressMintLimit).send({from: this.accounts[0]});
    await this.refreshStateData();
  };

  handleUpdateMintPrice = async() => {
    await this.tokenInstance.methods.updateMintPrice(this.web3.utils.toWei(this.state.mintPrice,"ether")).send({from: this.accounts[0]});
    await this.refreshStateData();
  };

  handleUpdatePublicMintTrue = async() => {
    await this.tokenInstance.methods.updatePublicMint(true).send({from: this.accounts[0]});
    await this.refreshStateData();
  };

  handleUpdatePublicMintFalse = async() => {
    await this.tokenInstance.methods.updatePublicMint(false).send({from: this.accounts[0]});
    await this.refreshStateData();
  };

  handleUpdatePause = async() => {
    await this.tokenInstance.methods.pause().send({from: this.accounts[0]});
    await this.refreshStateData();
  };

  handleUpdateUnpause = async() => {
    await this.tokenInstance.methods.unpause().send({from: this.accounts[0]});
    await this.refreshStateData();
  };

  handleUpdateRevealTrue = async() => {
    await this.tokenInstance.methods.setMetaDataReveal(true).send({from: this.accounts[0]});
    await this.refreshStateData();
  };

  handleUpdateRevealFalse = async() => {
    await this.tokenInstance.methods.setMetaDataReveal(false).send({from: this.accounts[0]});
    await this.refreshStateData();
  };

  handleGetTokenURI = async() => {
    let URI  = await this.tokenInstance.methods.uri(this.state.tokenNumber).call();
    this.setState({tokenURI:URI});
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

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  // listenToTokenTransfer = async() => {
  //     this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data",this.updateUserTokens)
  //     this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data",this.updateTotalSupply)
  //   }

//   handleMintHachi = async () => {
//       await this.kycContractInstance.methods.setKycCompleted(this.state.mintQuantity).send({from: this.accounts[0]});
//       alert("KYC for " + this.state.mintQuantity+ " is completed")
//   }

//   handlePurchaseTokens = async () => {
//     //await this.web3.eth.sendTransaction({from: this.accounts[0], to: this.state.tokenSaleAddress, value: this.web3.utils.toWei(this.state.tokensToPurchase,"wei"), gas: "1500000"});
//     await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: this.web3.utils.toWei(this.state.tokensToPurchase,"wei")})
// }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App" style={{backgroundColor:"#CCD9FF"}}>

        <div>
          <h1>Hachi NFT Home Page</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridGap: 10 }}>      
          <div>
            <div>
              <h2>Mint Your Hachi</h2>
              Amount to Mint : <input type="number" min="1" max={this.state.readAddressMintLimit} placeholder="1" name="mintQuantity" value={this.state.mintQuantity} onChange={this.handleInputChange}></input>
              <button onClick={this.handleMintHachi}>Mint Hachi</button>
            </div>
            <br></br><br></br><br></br>
            <div>
              <h2>Check balances</h2>
              <div>
                <h3>Check Single Token Balance</h3>
                <div>
                  Address : <input type="text" placeholder="0x000..." name="balanceCheckSingleAddress" onChange={this.handleInputChange}></input>
                  &nbsp;
                  Token Number : <input type="number" placeholder="1" min="1" max={this.state.readMintLimit} name="balanceCheckSingleTokenNumber" onChange={this.handleInputChange}></input>
                  &nbsp;
                  <button onClick={this.handleBalanceOfSingle}>Get Balance</button>
                  <br></br>
                  Quantity: {this.state.balanceCheckSingleQuant}
                </div>
              </div>
              <div>
                <h3>Check Batch Token balances</h3>
                <div>
                  Multiple Inputs can be separated by commas
                  <br></br>
                  NOTE: Length of Addresses and token number CSV strings must be the same!
                  <br></br><br></br>
                  Adresses : <input type="text" placeholder="0x000..,0x001..,0x002.." name="balanceCheckBatchAddress" onChange={this.handleInputChange}></input>
                  &nbsp;
                  Tokens : <input type="text" placeholder="1,200,3405"  name="balanceCheckBatchTokenNumbers" onChange={this.handleInputChange}></input>
                  &nbsp;
                  <button onClick={this.handleBalanceOfBatch}>Get Balances</button>
                  <br></br>
                  Quantities: {this.state.balanceCheckBatchQuant}
                </div>
              </div>
            </div>
            <br></br><br></br><br></br>
            <div>
              <h2>Transfer Hachi</h2>
            </div>
          </div>


          <div>
            <h2>Hachi Dashboard</h2>
            <div>
              <u>Contract Address</u><br></br>
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
            </div>
          </div>

          <div>
            <h2>Administrative Tools</h2>
            <div>
              <h3>NFT Contract</h3>
              <div>
                <h4>Current Info</h4>
                <div>
                  Mint Limit : {this.state.readMintLimit} Hachis<br></br>
                  Address Mint Limit : {this.state.readAddressMintLimit} Hachis<br></br>
                  Mint Price : {this.state.readMintPrice} Eth<br></br>
                  Public Mint : {this.state.isPublicMint.toString()}<br></br>
                  Paused: {this.state.isPaused.toString()}<br></br>
                  Meta Reveal: {this.state.metaReveal.toString()}<br></br>
                  <button onClick={this.refreshStateData}>Refresh</button>
                </div>
              </div>
              <div>
                <h4>Update Contract Info</h4>
                <div>
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
                  <u>Set Meta Reveal</u><br></br>
                  <button onClick={this.handleUpdateRevealTrue}>Reveal True</button>
                  <button onClick={this.handleUpdateRevealFalse}>Reveal False</button>
                </div>
              </div>
              <div>
                <h4>Read Other Contract info</h4>
                <div>
                  Token Number : <input type="number" placeholder="1" min="1" max={this.state.readMintLimit} name="tokenNumber" onChange={this.handleInputChange}></input>
                  <button onClick={this.handleGetTokenURI}>Get URI</button>
                  <br></br>
                  Token URI : {this.state.tokenURI}
                </div>
              </div>
              <div>
                <h3>Whitelist</h3>
                <div>

                </div>
              </div>
              <div>
                <h3>Payment</h3>
                <div>
                  <h4>Update Payment Info</h4>
                  <div>

                  </div>
                </div>
                <div>
                  <h4>Request Payment</h4>
                  <div>

                  </div>
                </div> 
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

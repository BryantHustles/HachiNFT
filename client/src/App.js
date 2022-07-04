import React, { Component } from "react";
import Token from "./contracts/HACHINFT.json";
import Wallet from "./contracts/HachiWallet.json"
import Whitelist from "./contracts/HachiWhitelist.json"
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded:false};//, kycAddress: "0x123", tokensToPurchase: 0, tokenSaleAddress: null, userTokens: 0, totalSupply: 0};

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

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.

      //Example listener
      //this.listenToTokenTransfer()
      this.setState({loaded:true}); //, kycAddress: "0x123", tokensToPurchase: 0, tokenSaleAddress: MyTokenSale.networks[this.networkId].address}, this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }

    //this.updateTotalSupply()
  };


  // updateUserTokens = async() => {
  //   let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
  //   this.setState({userTokens:userTokens});
  // }

  // updateTotalSupply = async() => {
  //   let totalSupply = await this.tokenInstance.methods.totalSupply().call();
  //   this.setState({totalSupply:totalSupply});
  // }

  // listenToTokenTransfer = async() => {
  //   this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data",this.updateUserTokens)
  //   this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data",this.updateTotalSupply)
  // }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

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
      <div className="App">

        <div>
          <h1>Hachi NFT Home Page</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridGap: 10 }}>      
          <div>
            <h2>Mint Your Hachi</h2>
            Amount to Mint : <input type="number" min="1" max="3" placeholder="1" name="mintQuantity" value={this.state.mintQuantity} onChange={this.handleInputChange}></input>
            <button onClick={this.handleMintHachi}>Mint Hachi</button>
          </div>

          <div>
            <h2>Hachi Dashboard</h2>
          </div>

          <div>
            <h2>Administrative Tools</h2>
              <h3>Mint</h3>
                <h4>Current Info Info</h4>
                <h4>Update Mint Info</h4>
              <h3>Whitelist</h3>
              <h3>Payment</h3>
                <h4>Update Payment Info</h4>
                <h4>Request Payment</h4>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

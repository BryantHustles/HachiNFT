import React, { Component } from "react";
import HSTLEToken from "./contracts/HSTLEToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json"
import KycContract from "./contracts/KycContract.json"
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded:false, kycAddress: "0x123", tokensToPurchase: 0, tokenSaleAddress: null, userTokens: 0, totalSupply: 0};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
       this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      this.tokenInstance = new this.web3.eth.Contract(
        HSTLEToken.abi,
        HSTLEToken.networks[this.networkId] && HSTLEToken.networks[this.networkId].address,
      );

      this.networkId = await this.web3.eth.net.getId();
      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
      );

      this.networkId = await this.web3.eth.net.getId();
      this.kycContractInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer()
      this.setState({loaded:true, kycAddress: "0x123", tokensToPurchase: 0, tokenSaleAddress: MyTokenSale.networks[this.networkId].address}, this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }

    this.updateTotalSupply()
  };


  updateUserTokens = async() => {
    let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({userTokens:userTokens});
  }

  updateTotalSupply = async() => {
    let totalSupply = await this.tokenInstance.methods.totalSupply().call();
    this.setState({totalSupply:totalSupply});
  }

  listenToTokenTransfer = async() => {
    this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data",this.updateUserTokens)
    this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data",this.updateTotalSupply)
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleKycWhitelisting = async () => {
      await this.kycContractInstance.methods.setKycCompleted(this.state.kycAddress).send({from: this.accounts[0]});
      alert("KYC for " + this.state.kycAddress+ " is completed")
  }

  handlePurchaseTokens = async () => {
    //await this.web3.eth.sendTransaction({from: this.accounts[0], to: this.state.tokenSaleAddress, value: this.web3.utils.toWei(this.state.tokensToPurchase,"wei"), gas: "1500000"});
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: this.web3.utils.toWei(this.state.tokensToPurchase,"wei")})
}

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div>
          <h1>$HUSTLE Token Sale Page Page</h1>
          <p> Get your Tokens today!</p>
        </div>
        <div>
          <h2>Complete the KYC Below</h2>
          Address to Allow : <input type="text" placeholder="Wallet Address 0x123..." name="kycAddress" value={this.state.kycAddress} onChange={this.handleInputChange}></input>
          <button onClick={this.handleKycWhitelisting}>Submit</button>
        </div>
        <div>
          <h2>Buy your HSTLE Token</h2>
          <h3>Tokens can also be purchased by sending Eth to the following contract address:</h3>
          <p>{this.state.tokenSaleAddress}</p>
          <br></br>
          Tokens to purchase : <input type="number" placeholder="Ex. 100" name="tokensToPurchase" value={this.state.tokensToPurchase} onChange={this.handleInputChange}></input>
          <button onClick={this.handlePurchaseTokens}>Purchase</button>
          <p>You currently have {this.state.userTokens} Hustle Tokens</p>
        </div>
        <div>
          <h2>Current Total Supply of Tokens</h2>
          <p>{this.state.totalSupply}</p>
        </div>
      </div>
    );
  }
}

export default App;

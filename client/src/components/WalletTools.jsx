import "../App.css";
import React, {useState, useEffect} from 'react';

function WalletTools(props) {

    useEffect(() => {
        handleRefreshWalletInfo();
    });

    //State Variables
    let [walletOwner, setwalletOwner] = useState("");
    let [walletBalance, setwalletBalance] = useState(0);
    let [walletBalanceOwed, setwalletBalanceOwed] = useState(0);
    let [walletShares, setwalletShares] = useState(0);
    let [walletReleased, setwalletReleased] = useState(0);
    let [WalletPayeeAddress, setWalletPayeeAddress] = useState("");
    let [WalletReleasedTo, setWalletReleasedTo] = useState("");
    let [WalletShares, setWalletShares] = useState(0);
    let [WalletPayeeIndex, WalletPayeeIndexInput] = useInput({type:"number", placeholder:"1", min:"1", name:"WalletPayeeIndex"});
    let [WalletReleasedToAddress, WalletReleasedToAddressInput] = useInput({type:"text", placeholder:"0x0000...", name:"WalletReleasedToAddress"});
    let [WalletSharesAddress, WalletSharesAddressInput] = useInput({type:"text", placeholder:"0x0000...", name:"WalletSharesAddress"});
    let [newOwnerWallet, newOwnerWalletInput] = useInput({type:"text", placeholder:"0x0000...", name:"newOwnerWallet"});
    let [releaseAddress, releaseAddressInput] = useInput({type:"text", placeholder:"0x0000...", name:"releaseAddress" });

    //#############################################################
    //Wallet Contract Read Functions
    //#############################################################

    async function handleRefreshWalletInfo() {
        let owner = await props.walletInstance.methods.owner().call();
        let balance = props.web3.utils.fromWei(await props.web3.eth.getBalance(props.walletInstance._address),"ether");
        let Shares = await props.walletInstance.methods.totalShares().call();
        let released = props.web3.utils.fromWei(await props.walletInstance.methods.totalReleased().call(),"ether");
        let balanceOwed = 0;
        if (props.activeAddress != null && props.activeAddress !== "") {
        balanceOwed = props.web3.utils.fromWei(await props.walletInstance.methods.viewBalanceOwed().call({from: props.activeAddress}),"ether");
        };

        setwalletOwner(owner);
        setwalletBalance(balance);
        setwalletBalanceOwed(balanceOwed);
        setwalletShares(Shares);
        setwalletReleased(released);
    };

    async function handleGetPayee() {
        let payee = await props.walletInstance.methods.payee(WalletPayeeIndex-1).call()
        setWalletPayeeAddress(payee);
    };

    async function handleReleasedTo() {
        let released = await props.walletInstance.methods.released(WalletReleasedToAddress).call()
        setWalletReleasedTo(props.web3.utils.fromWei(released.toString(),"ether") + " Eth");
    };

    async function handleGetShares() {
        let shares = await props.walletInstance.methods.shares(WalletSharesAddress).call()
        setWalletShares(shares);
    };

    //#############################################################
    //Wallet Contract Interaction Functions
    //#############################################################

    async function handleTransferOwnershipWallet() {
        await props.walletInstance.methods.transferOwnership(newOwnerWallet).send({from: props.activeAddress});
        newOwnerWallet = ""
    };

    async function handleRenounceOwnershipWallet() {
        await props.walletInstance.methods.renounceOwnership().send({from: props.activeAddress});
    };

    async function handleRelease() {
        await props.walletInstance.methods.release(releaseAddress).send({from: props.activeAddress});
    };

    async function handleEasyRelease() {
        await props.walletInstance.methods.release().send({from: props.activeAddress});
    };

    //#############################################################
    //Helper functions
    //#############################################################

    function useInput(opts) {
        const [value, setValue] = useState('');

        const input = <input
        value={value}
        onChange={event => setValue(event.target.value)}
        {...opts}
        />

        return [value, input];
    }

    return (
        <>
        <h2>Wallet</h2>
        <div className="Generic-Box">
            <h3>Payment Contract Info</h3>
            <div>
                <u>Owner</u><br></br>
                {walletOwner}<br></br>
                <u>Balance</u><br></br>
                {walletBalance} Eth<br></br>
                <u>Balance Owed</u><br></br>
                {walletBalanceOwed} Eth<br></br>
                <u>Total Shares</u><br></br>
                {walletShares}<br></br>
                <u>Total Released</u><br></br>
                {walletReleased}<br></br><br></br>
                <button onClick={handleRefreshWalletInfo}>Refresh Data</button>
            </div>
        </div>
        <div className="Generic-Box">
            <h3>Read Contract Info Functions</h3>
            <div>
                Payee Index:&nbsp;
                {WalletPayeeIndexInput}
                &nbsp;
                <button onClick={handleGetPayee}>Get Payee</button>
                <br></br>
                Payee Address:&nbsp;
                {WalletPayeeAddress}
                <br></br><br></br>
                Released To Address:&nbsp;
                {WalletReleasedToAddressInput}
                &nbsp;
                <button onClick={handleReleasedTo}>Get Released Amount</button>
                <br></br>
                Amount released to Address:&nbsp;
                {WalletReleasedTo}
                <br></br><br></br>
                Shares Address:&nbsp;
                {WalletSharesAddressInput}
                &nbsp;
                <button onClick={handleGetShares}>Get Number of Shares</button>
                <br></br>
                Number of Shares:&nbsp;
                {WalletShares}
            </div>
        </div>
        <div className="Generic-Box">
            <h3>Update Wallet Contract Functions</h3>
            <div>
                Transfer Ownership To:&nbsp;
                {newOwnerWalletInput}
                &nbsp;
                <button onClick={handleTransferOwnershipWallet}>Transfer Ownership</button>
                <br></br><br></br>
                <button onClick={handleRenounceOwnershipWallet}>Renounce Ownership</button>
            </div>
        </div>
        <div className="Generic-Box">
            <h3>Request Payment</h3>
            <div>
                Account to Release:&nbsp;
                {releaseAddressInput}
                &nbsp;
                <button onClick={handleRelease}>Release Funds</button>
                <br></br><br></br>
                <button onClick={handleEasyRelease}>Easy Release</button>
            </div>
        </div> 
        </>
    )
}

export default WalletTools
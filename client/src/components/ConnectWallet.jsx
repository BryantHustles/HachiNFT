import "../App.css";

import metaMaskLogo from "../images/metamask.png"
import walletConnectLogo from "../images/WalletConnect.png"

//#############################################################
//Connect Wallet
//#############################################################

function connectMetaMask() {
    document.dispatchEvent(new CustomEvent("Connect-Wallet-Request", { detail: "Metamask" }));
};

function connectWalletConnect() {
    document.dispatchEvent(new CustomEvent("Connect-Wallet-Request", { detail: "Wallet-Connect" }));
};

//#############################################################
//Handle Popup
//#############################################################

function invokePopup() {
    let popup = document.getElementById("Connect-Pop-Up");
    popup.className = "global-modal-show"
}

function handleClose() {
    let popup = document.getElementById("Connect-Pop-Up");
    popup.className = "global-modal"
}

//#############################################################
//Returned code
//#############################################################

function ConnectWallet() {
    return (
        <>
        <div className="global-modal" id="Connect-Pop-Up">
            <div className="overlay">  
            </div>
            <div className="global-modal_contents modal-transition">
                <div className="global-modal-header">
                    <span>
                        <button className="button" onClick={handleClose}>X</button>
                    </span>
                    <br></br>
                    <h3>Please choose a Wallet Provider</h3>
                </div>
                <div className="global-modal-body">
                    <div className="content-left">
                        <button id="choose-metamask" className="btn-flat-trigger" onClick={connectMetaMask}>
                            <img src={metaMaskLogo} alt="" width="100" height="100"/>
                            <br></br>
                            Metamask
                        </button>
                    </div>
                    <div className="content-right">
                        <button id="choose-wallet-connect" className="btn-flat-trigger" onClick={connectWalletConnect}>
                            <img src={walletConnectLogo} alt="" width="100" height="100"/>
                            <br></br>
                            Wallet Connect
                        </button>
                    </div>
                </div>
            </div>
            </div>
        <div className="block center">
            <button id="Connect-Button" className="Connect-Button" onClick={invokePopup}>Connect</button>
        </div>
        
        </>
    );
  };

export default ConnectWallet;
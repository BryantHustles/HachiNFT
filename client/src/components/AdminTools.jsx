import "../App.css";
import React, {useState, useEffect} from 'react';

function AdminTools(props) {

    useEffect(() => {
        refreshStateData();
    });

    //State Variables
    let [readMintLimit, setreadMintLimit] = useState("");
    let [readAddressMintLimit, setreadAddressMintLimit] = useState("");
    let [readMintPrice, setreadMintPrice] = useState("");
    let [isPublicMint, setisPublicMint] = useState("");
    let [isPaused, setisPaused] = useState("");
    let [metaReveal, setmetaReveal] = useState("");
    let [mintLimit, mintLimitInput] = useInput({type:"number", placeholder:readMintLimit, name:"mintLimit"});
    let [addressMintLimit, addressMintLimitInput] = useInput({type:"number", placeholder:readAddressMintLimit, name:"addressMintLimit"});
    let [mintPrice, mintPriceInput] = useInput({type:"number", placeholder:readMintPrice, name:"mintPrice"});
    let [defualtRoyalty, defualtRoyaltyInput] = useInput({type:"number", placeholder:"100", min:"1", max:"10000", name:"defualtRoyalty", width:"auto"});
    let [defualtUri, defualtUriInput] = useInput({type:"text", placeholder:"https://wwww.URI.com/uri.json", name:"defualtUri", width:"auto"});
    let [MetaUri, MetaUriInput] = useInput({type:"text", placeholder:"https://wwww.URI.com/uri.json", name:"MetaUri", width:"auto"});
    let [contractUri, contractUriInput] = useInput({type:"text", placeholder:"https://wwww.URI.com/uri.json", name:"contractUri", width:"auto"});
    let [newOwnerNFT, newOwnerNFTInput] = useInput({type:"text", placeholder:"0x0000...", name:"newOwnerNFT"});

    //#############################################################
    //NFT Contract Call Functions
    //#############################################################

    async function refreshStateData() {
        let mintLimit = await props.tokenInstance.methods.mintLimit().call();
        let addressMintLimit = await props.tokenInstance.methods.addressMintLimit().call();
        let mintPrice = props.web3.utils.fromWei(await props.tokenInstance.methods.mintPrice().call(), "ether");
        let isPublicMint = await props.tokenInstance.methods.publicMint().call();
        let isPaused = await props.tokenInstance.methods.paused().call();
        let metaReveal = await props.tokenInstance.methods.metaDataReveal().call()

        setreadMintLimit(mintLimit);
        setreadAddressMintLimit(addressMintLimit);
        setreadMintPrice(mintPrice);
        setisPublicMint(isPublicMint);
        setisPaused(isPaused);
        setmetaReveal(metaReveal);

        await props.componentSetState({
            readMintLimit: mintLimit, 
            readAddressMintLimit: addressMintLimit, 
            readMintPrice: mintPrice
        });
    };

    //#############################################################
    //NFT Contract Function Interactions
    //#############################################################

    async function handleSetDefaultRoyalty() {
        await props.tokenInstance.methods.setDefaultRoyalty(props.walletInstance._address,defualtRoyalty).send({from: props.activeAddress});  
    };
    async function handleSetGenericMetadata() {
        await props.tokenInstance.methods.setGenericMeta(defualtUri).send({from: props.activeAddress});
    };
    async function handleSetContractURI() {
        await props.tokenInstance.methods.setContractURI(contractUri).send({from: props.activeAddress})
    };
    async function handleSetMetaData() {
        await props.tokenInstance.methods.setURI(MetaUri).send({from: props.activeAddress});
    };
    async function handleTransferOwnership() {
        await props.tokenInstance.methods.transferOwnership(newOwnerNFT).send({from: props.activeAddress});
    };
    async function handleRenounceOwnership() {
        await props.tokenInstance.methods.renounceOwnership().send({from: props.activeAddress});
    };

    //#############################################################
    //NFT Contract Update Variables
    //#############################################################

    async function handleUpdateMintLimit() {
        await props.tokenInstance.methods.updateMintLimit(mintLimit).send({from: props.activeAddress});
        await refreshStateData();
    };

    async function handleUpdateAddressMintLimit() {
        await props.tokenInstance.methods.updateAddressMintLimit(addressMintLimit).send({from: props.activeAddress});
        await refreshStateData();
    };

    async function handleUpdateMintPrice() {
        await props.tokenInstance.methods.updateMintPrice(props.web3.utils.toWei(mintPrice,"ether")).send({from: props.activeAddress});
        await refreshStateData();
    };

    async function handleUpdatePublicMintTrue() {
        await props.tokenInstance.methods.updatePublicMint(true).send({from: props.activeAddress});
        await refreshStateData();
    };

    async function handleUpdatePublicMintFalse() {
        await props.tokenInstance.methods.updatePublicMint(false).send({from: props.activeAddress});
        await refreshStateData();
    };

    async function handleUpdatePause() {
        await props.tokenInstance.methods.pause().send({from: props.activeAddress});
        await refreshStateData();
    };

    async function handleUpdateUnpause() {
        await props.tokenInstance.methods.unpause().send({from: props.activeAddress});
        await refreshStateData();
    };

    async function handleUpdateRevealTrue() {
        await props.tokenInstance.methods.revealMetaData().send({from: props.activeAddress});
        await refreshStateData();
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
        <h2>Administrative Tools</h2>
        <div>
            <h3>NFT Contract</h3>
            <div className="Generic-Box">
                <h4>Current Info</h4>
                <div>
                    <u>Mint Limit</u>
                    <br></br>
                    {readMintLimit} Hachis<br></br>
                    <u>Address Mint Limit</u> 
                    <br></br>
                    {readAddressMintLimit} Hachis<br></br>
                    <u>Mint Price</u> 
                    <br></br>
                    {readMintPrice} Eth<br></br>
                    <u>Public Mint</u> 
                    <br></br>
                    {isPublicMint.toString()}<br></br>
                    <u>Paused</u> 
                    <br></br>
                    {isPaused.toString()}<br></br>
                    <u>Meta Reveal</u> 
                    <br></br>
                    {metaReveal.toString()}<br></br><br></br>
                    <button onClick={refreshStateData}>Refresh</button>
                </div>
            </div>
            <div>
                <h4>Update Contract Variables</h4>
                <div className="Generic-Box">
                    Update Mint Limit : {mintLimitInput}
                    <button onClick={handleUpdateMintLimit}>Update</button>
                    <br></br>
                    Update Address Mint Limit : {addressMintLimitInput}
                    <button onClick={handleUpdateAddressMintLimit}>Update</button>
                    <br></br>
                    Update Mint Price (Eth) : {mintPriceInput}
                    <button onClick={handleUpdateMintPrice}>Update</button>
                    <br></br>
                    <u>Set Public Mint</u><br></br>
                    <button onClick={handleUpdatePublicMintTrue}>Set True</button>
                    <button onClick={handleUpdatePublicMintFalse}>Set False</button>
                    <br></br>
                    <u>Set Paused</u><br></br>
                    <button onClick={handleUpdatePause}>Pause</button>
                    <button onClick={handleUpdateUnpause}>Unpause</button>
                    <br></br>
                    <u>Reveal Meta Data</u><br></br>
                    <button onClick={handleUpdateRevealTrue}>Reveal</button>
                </div>
            </div>
            <div>
                <h4>Update Contract Info</h4>
                <div className="Generic-Box">
                    Set Default Royalty:&nbsp;
                    {defualtRoyaltyInput}
                    &nbsp;
                    <button onClick={handleSetDefaultRoyalty}>Set Royalty</button>
                    <br></br>
                    Update Generic MetaData URI:&nbsp;
                    {defualtUriInput}
                    &nbsp;
                    <button onClick={handleSetGenericMetadata}>Set Generic URI</button>
                    <br></br>
                    Set MetaData URI:&nbsp;
                    {MetaUriInput}
                    &nbsp;
                    <button onClick={handleSetMetaData}>Set URI</button>
                    <br></br>
                    Set Contract URI:&nbsp;
                    {contractUriInput}
                    &nbsp;
                    <button onClick={handleSetContractURI}>Set URI</button>
                    <br></br>
                    Transfer Ownership To:&nbsp;
                    {newOwnerNFTInput}
                    &nbsp;
                    <button onClick={handleTransferOwnership}>Transfer Ownership</button>
                    <br></br><br></br>
                    <button onClick={handleRenounceOwnership}>Renounce Ownership</button>
                </div>
            </div>
        </div>
        </>
    )
}

export default AdminTools
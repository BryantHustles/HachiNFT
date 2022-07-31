import "../App.css";
import React, {useState, useEffect} from 'react';

function WhitelistTools(props) {

    useEffect(() => {
        handleRefreshWhitelistInfo();
    });

    //State Variables
    let [whitelistOwner, setwhitelistOwner] = useState("");
    let [merkleRoot, setmerkleRoot] = useState("");
    let [newMerkleRoot, newMerkleRootInput] = useInput({ type:"text", placeholder:"0xjnd8923hb39fbb29db", name:"newMerkleRoot"});
    let [newOwnerWhitelist, newOwnerWhitelistInput] = useInput({type:"text", placeholder:"0x0000...", name:"newOwnerWhitelist"});

    //#############################################################
    //Whitelist Contract Read Functions
    //#############################################################

    async function handleRefreshWhitelistInfo() {
        let root = await props.whitelistInstance.methods.merkleRoot().call();
        let owner = await props.whitelistInstance.methods.owner().call();

        setmerkleRoot(root);
        setwhitelistOwner(owner);
    };

    //#############################################################
    //Whitelist Contract Interaction Functions
    //#############################################################

    async function handleTransferOwnershipwhitelist() {
        await props.whitelistInstance.methods.transferOwnership(newOwnerWhitelist).send({from: props.activeAddress});
    };

    async function handleRenounceOwnershipWhitelist() {
        await props.whitelistInstance.methods.renounceOwnership().send({from: props.activeAddress});
    };

    async function handleupdateMerkleRoot() {
        await props.whitelistInstance.methods.setMerkleRoot(newMerkleRoot).send({from: props.activeAddress});
        handleRefreshWhitelistInfo();
    }


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
        <h2>Whitelist</h2>
        <div>
            <div className="Generic-Box">
                <h3>Info</h3>
                <div>
                    <u>Owner</u><br></br>
                    {whitelistOwner}<br></br>
                    <u>Merkle root</u> <br></br>
                    {merkleRoot}<br></br>
                </div>
                <button onClick={handleRefreshWhitelistInfo}>Refresh</button>
            </div>
            <div className="Generic-Box">
                <h4>Update Functions</h4>
                <div>
                    Set Merkle Root:&nbsp;
                    {newMerkleRootInput}
                    <button onClick={handleupdateMerkleRoot}>Update</button>
                    <br></br>
                    Transfer Ownership To:&nbsp;
                    {newOwnerWhitelistInput}
                    &nbsp;
                    <button onClick={handleTransferOwnershipwhitelist}>Transfer Ownership</button>
                    <br></br><br></br>
                    <button onClick={handleRenounceOwnershipWhitelist}>Renounce Ownership</button>
                </div>
            </div>
        </div>
        </>
    )
}

export default WhitelistTools
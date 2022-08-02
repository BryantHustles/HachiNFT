import "../App.css";
import React, {useState, useEffect} from 'react';
import treeJSON from "../Whitelist/merkleTree.json"

function TokenTools(props) {

    useEffect(() => {
    });

    //State Variables
    let [mintQuantity, mintQuantityInput] = useInput({type:"number", min:"1", max:props.readAddressMintLimit, placeholder:"1", name:"mintQuantity"});
    let [balanceCheckSingleAddress, balanceCheckSingleAddressInput] = useInput({type:"text", placeholder:"0x000...", name:"balanceCheckSingleAddress"});
    let [balanceCheckSingleTokenNumber, balanceCheckSingleTokenNumberInput] = useInput({type:"number", placeholder:"1", min:"1", max:props.readMintLimit, name:"balanceCheckSingleTokenNumber"});
    let [balanceCheckBatchAddress, balanceCheckBatchAddressInput] = useInput({type:"text", placeholder:"0x000..,0x001..,0x002..", name:"balanceCheckBatchAddress"});
    let [balanceCheckBatchTokenNumbers, balanceCheckBatchTokenNumbersInput] = useInput({type:"text", placeholder:"1,200,3405", name:"balanceCheckBatchTokenNumbers"});
    let [TransferSingleTo, TransferSingleToInput] = useInput({type:"text", name:"TransferSingleTo", placeholder:"0x000..."});
    let [TransferSingleId, TransferSingleIdInput] =useInput({type:"number", name:"TransferSingleId", min:"1", max:props.readMintLimit, placeholder:"1"});
    let [TransferBatchTo, TransferBatchToInput] = useInput({type:"text", name:"TransferBatchTo", placeholder:"0x000"});
    let [TransferBatchIds, TransferBatchIdsInput] = useInput({type:"text", name:"TransferBatchIds", placeholder:"1,200,3405"});
    let [tokenNumber, tokenNumberInput] =useInput({type:"number", placeholder:"1", min:"1", max:props.readMintLimit, name:"tokenNumber"});
    let [balanceCheckBatchQuant, setbalanceCheckBatchQuant] = useState("");
    let [balanceCheckSingleQuant, setbalanceCheckSingleQuant] = useState(0);
    let [tokenURI,settokenURI] = useState("");

    //Merkle Tree
    const readMerkleTree = require("../Whitelist/ReadMerkleTree");
    const keccak256 = require("keccak256");
    const merkleTree = readMerkleTree(treeJSON);

    //Layout Struct types
    let domain = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
    ];

    let ticket = [
        { name: "to", type: "address" },
        { name: "amounts", type: "uint256[]" },
        { name: "merkleProof", type: "bytes32[]" },
    ];

    // Data Structs
    let domainData = {
        name: "HachiNftSig",
        version: "1",
        chainId: 4,
        verifyingContract: props.tokenAddress
    };

    let HachiTicket = {
        "to": "",
        "amounts": [],
        "merkleProof": []
    };

    //#############################################################
    //NFT Contract Function Interactions
    //#############################################################

    async function handleMintHachi() {
        //Create amounts array
        let _amounts = []
        for (let i = 0; i < mintQuantity; i++) {
            _amounts.push(1);
        };
        
        //Set Sender
        let _sender = props.activeAddress
        
        //Create Ticket and add data
        let _ticket = HachiTicket;
        _ticket.to = _sender;
        _ticket.amounts = _amounts;
        _ticket.merkleProof = merkleTree.getHexProof(keccak256(_sender));
        
        let _data = JSON.stringify({
            domain: domainData,
            message: _ticket,
            primaryType: "HachiTicket",
            types: {
            EIP712Domain: domain,
            HachiTicket: ticket,
            } 
        });
        
        //determine Wei to send
        let _cost = props.web3.utils.toWei(props.readMintPrice,"ether") * mintQuantity;

        //Set Params
        const params = [_sender, _data]

        //Get account signature
        const method = "eth_signTypedData_v4"
        let _sig = null
        
        if (props.connection === 'Metamask') {
            
            await props.web3.currentProvider.send(
                {method, params, _sender},
                function (err, result) {
                if (err) return console.dir(err);
                if (result.error) return console.error('ERROR', result);
                console.log('TYPED SIGNED:' + JSON.stringify(result.result));
                _sig = result.result
            });
            
            //Mint Hachi
            let _mintParams = [_ticket.to,_ticket.amounts,_ticket.merkleProof,_sig]
            
            await props.tokenInstance.methods.mintHachi(_mintParams).send(
                {from: _sender, value: _cost},
                function (err, result) {
                if (err) return console.dir(err);
                if (result.error) {
                    result.stopImmediatePropagation()//##########################################
                }
                if (result.error) return console.error('ERROR', result);
            });
        } else if (props.connection === "Wallet-Connect") {
            props.walletConnector
            .signTypedData(params)
            .then((result) => {
                //Start Timeout Function
            
                _sig = result;
                // Returns signature.
                console.log(result);
            }).then(() => {
                //Mint
                let _mintParams = [_ticket.to,_ticket.amounts,_ticket.merkleProof,_sig]

                let mintFuncitonAbiEncoded = props.tokenInstance.methods.mintHachi(_mintParams).encodeABI();

                const tx = {
                    from: props.activeAddress, 
                    to: props.tokenAddress, 
                    data: mintFuncitonAbiEncoded,
                    value: _cost
                  };
                // Send transaction
                props.walletConnector
                .sendTransaction(tx)
                .then((result) => {
                // Returns transaction id (hash)
                console.log(result);
                })
                .catch((error) => {
                // Error returned when rejected
                console.error(error);
                });
                
            })
            .catch((error) => {
                // Error returned when rejected
                console.error(error);
                alert("Mint aborted.");
                return
            });  
        };
    };
    
    async function handleTransferSingle() {
        if (props.connection === 'Metamask') {
            await props.tokenInstance.methods.safeTransferFrom(props.activeAddress,TransferSingleTo,TransferSingleId,1,[]).send({from: props.activeAddress});
        } else if (props.connection === "Wallet-Connect") {
            const tx = {
                from: props.activeAddress, 
                to: props.tokenAddress, 
                data: props.tokenInstance.methods.safeTransferFrom(props.activeAddress,TransferSingleTo,TransferSingleId,1,[]).encodeABI()
              };
            // Send transaction
            props.walletConnector
            .sendTransaction(tx)
            .then((result) => {
            // Returns transaction id (hash)
            console.log(result);
            })
            .catch((error) => {
            // Error returned when rejected
            console.error(error);
            });
        };
    };
    
    async function handleTransferBatch() {
        let iDs = TransferBatchIds.split(',');
        let amounts = []
        
        for (let i = 0; i < iDs.length; i++) {
            amounts.push(1);
        };
        
        if (props.connection === 'Metamask') {
            await props.tokenInstance.methods.safeBatchTransferFrom(props.activeAddress,TransferBatchTo,iDs,amounts,[]).send({from: props.activeAddress});
        } else if (props.connection === "Wallet-Connect") {
            const tx = {
                from: props.activeAddress, 
                to: props.tokenAddress, 
                data: props.tokenInstance.methods.safeBatchTransferFrom(props.activeAddress,TransferBatchTo,iDs,amounts,[]).encodeABI()
              };
            // Send transaction
            props.walletConnector
            .sendTransaction(tx)
            .then((result) => {
            // Returns transaction id (hash)
            console.log(result);
            })
            .catch((error) => {
            // Error returned when rejected
            console.error(error);
            });
        };
    };
    
    //#############################################################
    //NFT Contract Call Functions
    //#############################################################

    async function handleGetQueriedTokenURI() {
        settokenURI(await handleGetTokenURI(tokenNumber));
    }
    
    async function handleBalanceOfSingle() {
        let balance = await props.tokenInstance.methods.balanceOf(balanceCheckSingleAddress,balanceCheckSingleTokenNumber).call();
        setbalanceCheckSingleQuant(balance)
    }
    
    async function handleBalanceOfBatch() {
        let balance = await props.tokenInstance.methods.balanceOfBatch(balanceCheckBatchAddress.split(','),balanceCheckBatchTokenNumbers.split(',')).call();
        let output = ""
        
        for (let i=0; i<balance.length; i++) {
            output = output + "Token " + balanceCheckBatchTokenNumbers.split(',')[i] + ": " + balance[i] + ", "
        }
        output = output.substring(0,output.length - 2).trim()
        setbalanceCheckBatchQuant(output);
    }; 
        
    async function handleGetTokenURI(_token) {
        let URI  = await props.tokenInstance.methods.uri(_token).call();
        return URI
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
    

    //#############################################################
    //HTML
    //#############################################################

    return (
        <>
        <div>
            <h2>Token Tools</h2>
        </div>
        <div className="Generic-Box">
            <h3>Mint Your Hachi</h3>
            Amount to Mint : {mintQuantityInput}
            <button onClick={handleMintHachi}>Mint Hachi</button>
        </div>
        <br></br>
        <div>
            <h2>Check balances</h2>
            <div className="Generic-Box">
                <h3>Check Single Token Balance</h3>
                <div>
                    Address : {balanceCheckSingleAddressInput}
                    &nbsp;
                    <br></br>
                    Token Number : {balanceCheckSingleTokenNumberInput}
                    &nbsp;
                    <br></br>
                    <button onClick={handleBalanceOfSingle}>Get Balance</button>
                    <br></br>
                    Quantity: {balanceCheckSingleQuant}
                </div>
            </div>
            <div className="Generic-Box">
                <h3>Check Batch Token balances</h3>
                <div>
                    Multiple Inputs can be separated by commas
                    <br></br>
                    NOTE: Length of Addresses and token number CSV strings must be the same!
                    <br></br><br></br>
                    Adresses : {balanceCheckBatchAddressInput}
                    &nbsp;<br></br>
                    Tokens : {balanceCheckBatchTokenNumbersInput}
                    &nbsp;<br></br>
                    <button onClick={handleBalanceOfBatch}>Get Balances</button>
                    <br></br>
                    Quantities: {balanceCheckBatchQuant}
                </div>
            </div>
        </div>
        <div>
            <h2>Transfer Hachi</h2>
        </div>
        <div>
            <div className="Generic-Box">
                <h3>Transfer Single</h3>
                <div> 
                    To: Address&nbsp;
                    {TransferSingleToInput}
                    <br></br>
                    Token ID:&nbsp;
                    {TransferSingleIdInput}
                    <br></br>
                    <button type="submit" onClick={handleTransferSingle}>Transfer</button>
                </div>
            </div>
            <div className="Generic-Box">
                <h3>Transfer Batch</h3>
                NOTE: Only input a single Addresses. Token numbers should be a CSV string!
                <br></br><br></br>
                <div>
                    To Address:&nbsp;
                    {TransferBatchToInput}
                    <br></br>
                    Token ids:&nbsp;
                    {TransferBatchIdsInput}
                    <br></br>
                    <button type="submit" onClick={handleTransferBatch}>Transfer</button>
                </div>
            </div>
            <div>
                <h3>Read Other Contract info</h3>
                <div className="Generic-Box">
                    {tokenNumberInput}
                    <button onClick={handleGetQueriedTokenURI}>Get URI</button>
                    <br></br>
                    Token URI : {tokenURI}
                </div>
            </div>
        </div>
        </>
    )
}

export default TokenTools
import "../App.css";
import React, {useEffect} from 'react';

function Dashboard(props) {

    useEffect(() => {
    });

    return (
        <>
        <div>
            <h2>Hachi Dashboard</h2>
            <div className="Dashboard-Box">
                <h3>Contracts Info</h3>
                <p><u>Contract Address</u><br></br>
                {props.tokenInstance._address}
                <br></br>
                <u>Whitelist Address</u><br></br>
                {props.whitelistInstance._address}
                <br></br>
                <u>Wallet Address</u><br></br>
                {props.walletInstance._address}
                <br></br>
                <u>Contract URI</u><br></br>
                {props.readUri}
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
        </>
    )
};

export default Dashboard
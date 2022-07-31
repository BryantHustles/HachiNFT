import "../App.css";
import React from 'react';

function Header(props) {

    return (
        <>
        <div>
            <h1>Hachi NFT</h1>
        </div>
        <div>
            <h4><u>Active Account</u></h4>
            {props.activeAddress}
        </div>   
        </>
    )
};

export default Header
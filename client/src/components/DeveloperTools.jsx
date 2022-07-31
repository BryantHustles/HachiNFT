import "../App.css";
import React from 'react';

function DeveloperTools(props) {

    //#############################################################
    //Debug Functions
    //#############################################################

    async function handlePrintState() {
        console.log(props.state);
    };
    
    async function handlePrintPermissionsCookie() {
        console.log(props.cookies.get('Permissions'));
    };

    return (
        <>
        <div>
          <button hidden={false} onClick={handlePrintState}>Print State</button>
          <button hidden={false} onClick={handlePrintPermissionsCookie}>Print Permissions Cookie</button>
        </div>    
        </>
    )
};

export default DeveloperTools
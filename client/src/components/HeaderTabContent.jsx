import "../App.css";
import React, {useEffect} from 'react';

function HeaderTab() {

    function handlechangeTab(event) {
        const target = event.target;
        const name = target.name;
    
        // Get all elements with class="tabcontent" and hide them
        let tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
        };
    
        // Get all elements with class="tablinks" and remove the class "active"
        let tablinks = document.getElementsByClassName("tablinks");
        for (let i = 0; i < tablinks.length; i++) {
          tablinks[i].className = tablinks[i].className.replace(" active", "");
        };
    
        // Show the current tab, and add an "active" class to the button that opened the tab
        document.getElementById(name).style.display = "block";
        target.className += " active";
      };

    useEffect(() => {
    });

    return (
        <>
        <div className="tab">
            <button className="tablinks" name="Hachi NFT" id="Hachi NFT Button" onClick={handlechangeTab}>Hachi NFT</button>
            <button className="tablinks" name="Whitelist Tools" id="Whitelist Tools Button" onClick={handlechangeTab}>Whitelist Tools</button>
            <button className="tablinks" name="Wallet Tools" id="Wallet Tools Button" onClick={handlechangeTab}>Wallet Tools</button>
            <button className="tablinks" name="Admin Tools" id="Admin Tools Button" onClick={handlechangeTab}>Admin Tools</button>
        </div>    
        </>
    )
};

export default HeaderTab
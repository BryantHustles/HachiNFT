// SPDX-License-Identifier: MIT
/// @title Hachi NFT Wallet Contract and payment splitter
/// @author Bryant Backus

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Implementation of Payment Splitter in a contract to be used by
 * The founders of Hachi NFT
 * See https://github.com/BryantHustles/HachiNFT
 */
contract HachiWallet is PaymentSplitter, Ownable {

    /**
    * @dev Wallet Contract to hold and distribute funds to users.
    * `_address` array of addresses for which payments are split amongst.
    * `_shares` respective shares each address is owed. 
    * A single address is owed their shares / Total Shares.
    * See {PaymentSplitter}.
    * @notice Contract is payable.
    */    
    constructor(
        address[] memory _address, 
        uint256[] memory _shares
    ) payable
    PaymentSplitter(_address, _shares) {
    }

    /**
    * @dev an easy release method that uses msg.Sender to release
    * funds to the requestor.
    * See release function in {PaymentSplitter}
    * @notice Only currently owed funds will get transferred to the user
    */
    function release() public {
        release(payable(msg.sender));
    }

    /**
    * @dev view function that returns amount of funds owed to msg sender
    * @return uint, amount in wei, that is owed to the caller address.
    */
    function viewBalanceOwed() public view returns (uint) {
        uint _shares = shares(msg.sender);
        uint _totalShares = totalShares();
        uint _totalReceived = address(this).balance + totalReleased();
        uint _released = released(msg.sender);

        return (_totalReceived * _shares) / _totalShares - _released;
    }
}
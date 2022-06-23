// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HachiWallet is PaymentSplitter, Ownable {

    constructor(
        address[] memory _address, 
        uint256[] memory _shares
    ) payable
    PaymentSplitter(_address, _shares) {
    }

    function release(address payable account) 
    public 
    onlyOwner
    override(PaymentSplitter) 
    {
        super.release(account);
    }

    function easyRelease() public {
        HachiWallet.release(payable(msg.sender));
    }

    function viewBalanceOwed() public view returns (uint) {
        require(shares(msg.sender) > 0);
        uint _shares = shares(msg.sender);
        uint _totalShares = totalShares();
        uint _totalReceived = address(this).balance + totalReleased();
        uint _released = released(msg.sender);

        return (_totalReceived * _shares) / _totalShares - _released;
    }
}
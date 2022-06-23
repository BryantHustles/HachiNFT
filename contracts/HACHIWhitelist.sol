// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HachiWhitelist is Ownable {
    bytes32 public merkleRoot;

    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function verifyWhitelist(bytes32[] memory _merkleProof, address _signer) public view returns (bool){
        bytes32 _leaf = keccak256(abi.encodePacked(_signer));
        return MerkleProof.verify(_merkleProof, merkleRoot, _leaf);
    }
}
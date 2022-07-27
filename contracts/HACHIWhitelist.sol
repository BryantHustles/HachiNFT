// SPDX-License-Identifier: MIT
/// @title Hachi NFT Whitelist Contract
/// @author Bryant Backus

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Implementation of Merkle Trees and Merkle Proofs to be used in
 * verifying whether users are on the whitelist
 * See https://github.com/BryantHustles/HachiNFT
 */
contract HachiWhitelist is Ownable {
    bytes32 public merkleRoot;

    /**
     * @dev Whitelist Contract to hold Merkle Root and verify whether a user is on the whitelist.
     * `_merkleRoot` is the merkle root of the merkle tree corresponding to
     * the currently set whitelist
     * See {MerkleProof}.
     */
    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    /**
     * @dev Updates the Merkle Root variable held in the contract.
     * @param _merkleRoot New merkle root to update the contract variable with
     * @notice Only the contract owner can call this function. See {Ownable}.
     */
    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
    }

    /**
     * @dev verifies that a given user is in the merkle Tree.
     * @param _merkleProof Merkle Proof corresponding to the user in question.
     * @param _signer address that is to be verified.
     * @return bool, returns true if user is on the whitelist.
     * Returns false if the user is not on the whitelist.
     */
    function verifyWhitelist(bytes32[] memory _merkleProof, address _signer)
        public
        view
        returns (bool)
    {
        bytes32 _leaf = keccak256(abi.encodePacked(_signer));
        return MerkleProof.verify(_merkleProof, merkleRoot, _leaf);
    }
}

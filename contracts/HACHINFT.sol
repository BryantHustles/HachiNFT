// SPDX-License-Identifier: MIT
// Hachi NFT Contracts ERC1155 Contract

pragma solidity ^0.8.11;

import "./HACHIWhitelist.sol";
import "./HACHIWallet.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

/**
 * @dev Implementation of the ERC 1155 standard as an NFT contract
 * See https://github.com/BryantHustles/HachiNFT
 */
contract HACHINFT is ERC1155, EIP712, ERC2981, Ownable, Pausable, ReentrancyGuard {
    string private hachiGenericMetaDataURI = "ipfs://QmbhqqnAxzqArd8nnAeR9bw52dWtLh2huKSqeJg2p1SrWG";
    string private constant SIGNING_DOMAIN = "HachiNftSig";
    string private constant SIGNATURE_VERSION = "1";
    string public contractURI = "ipfs://QmPT1Z3WtAbqiBZwbSFHFk2UE6VRh2JXVpUKp5RE8hC86T";
    string public name = "Hachi NFT";
    string public symbol = "HACHI";

    bool public metaDataReveal;
    bool public publicMint;

    uint public mintPrice = 0.001 ether;
    uint public addressMintLimit = 3;
    uint public mintLimit = 8000;
    uint private tokenIndex = 0;

    mapping(uint256 => uint256) private control;
    mapping(address => uint256) private numberMinted;

    struct HachiTicket {
        address to;
        uint256[]  amounts;
        bytes32[]  merkleProof;
        bytes  signature;
    }

    HachiWhitelist whtlst;
    HachiWallet wllt;
    
    event Mint(address indexed to, uint256[] indexed id, uint256 _value);

    constructor(
        string memory _ipfs,
        HachiWhitelist _whtlst,
        HachiWallet _wllt
        )
        ERC1155(_ipfs)
        EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
            whtlst = _whtlst;
            wllt = _wllt;
            setDefaultRoyalty(address(_wllt), 300);
            _pause();
    }

    receive() external payable {
        payable(wllt).transfer(msg.value);
    }

    function uri(uint256 _tokenId) override public view returns (string memory) {

        if (!metaDataReveal) {
            return hachiGenericMetaDataURI;
        } else {
            return(string(abi.encodePacked(super.uri(_tokenId), Strings.toString(_tokenId))));
        }
    }

    function setGenericMeta(string memory _uri) public onlyOwner {
        hachiGenericMetaDataURI = _uri;
    }

    function revealMetaData() public onlyOwner {
        metaDataReveal = true;
    }

    function setURI(string memory _newuri) public onlyOwner {
        ERC1155._setURI(_newuri);
    }

    function setContractURI(string memory _contractURI) public onlyOwner {
        contractURI = _contractURI;
    }

    function mintHachi(HachiTicket calldata _ticket) public whenNotPaused nonReentrant payable  {
        address _signer = verifySigner(_ticket);
        require(msg.sender == _signer, "Verification Failed");
        uint _length = _ticket.amounts.length;
        require(_length > 0, "Invalid Amounts Input");
        uint[] memory _tokenId = _ticket.amounts;

        require(tokenIndex + _length <= mintLimit, "Sold Out");
        if(!publicMint) {
            require(whtlst.verifyWhitelist(_ticket.merkleProof, _signer), "Not Whitelisted");
        }
        require(numberMinted[_signer] + _length <= addressMintLimit, "Address mint limit reached");
        require(msg.value >= mintPrice*_length, "Insufficient funds");
        for(uint i=0; i<_length; i++){
            require(_ticket.amounts[i] == 1, "Invalid amounts array");
            tokenIndex ++;
            _tokenId[i] = tokenIndex;
        }

        emit Mint(_ticket.to, _tokenId, msg.value);
        numberMinted[_signer] += _length;

        _mintBatch(_ticket.to, _tokenId, _ticket.amounts, "");

        payable(wllt).transfer(msg.value);
    }

    function verifySigner(HachiTicket calldata _ticket) internal view returns (address) {
        bytes32 digest = _hash(_ticket);
        return ECDSA.recover(digest, _ticket.signature);
    }

    function _hash(HachiTicket calldata _ticket) internal view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            keccak256("HachiTicket(address to,uint256[] amounts,bytes32[] merkleProof)"),
            _ticket.to,
            keccak256(abi.encodePacked(_ticket.amounts)),
            keccak256(abi.encodePacked(_ticket.merkleProof))
        )));
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function updateMintLimit(uint _limit) public onlyOwner {
        mintLimit = _limit;
    }

    function updateMintPrice(uint _price) public onlyOwner {
        mintPrice = _price;
    }

    function updateAddressMintLimit(uint _limit) public onlyOwner {
        addressMintLimit = _limit;
    }

    function updatePublicMint(bool _publicMint) public onlyOwner {
        require(_publicMint != publicMint,"input eqaul to state");
        publicMint = _publicMint;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

// import "./HACHILibrary.sol";
// import "./HACHIVerifySigner.sol";
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

//HachiNFT
contract HACHINFT is ERC1155, EIP712, ERC2981, Ownable, Pausable, ReentrancyGuard {
    string private hachiGenericMetaDataURI = "ipfs://QmQ6tZha8rMRE1SjdfjWGDZiUrzPcRfxxESDHuQABbZDS8?";
    string private hachiIPFSMetaDataURI;
    string private constant SIGNING_DOMAIN = "HachiNftSig";
    string private constant SIGNATURE_VERSION = "1";

    bool public metaDataReveal;
    bool public publicMint;

    uint public mintPrice = 0.1 ether;
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
        ERC1155(hachiGenericMetaDataURI)
        EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
            hachiIPFSMetaDataURI = _ipfs; 
            whtlst = _whtlst;
            wllt = _wllt;
            setDefaultRoyalty(address(_wllt), 300);
            _pause();
    }

    receive() external payable {
        payable(wllt).transfer(msg.value);
    }

    function contractURI() public pure returns (string memory) {
        return "https://ipfs.io/ipfs/QmX8w2EPzFhb5uZ9j87V5nVPVV6To1bNLcEKZJry6NzsHb?filename=HachiContractURI.json";
    }

    function uri(uint256 tokenId) override public view returns (string memory) {

        if (!metaDataReveal)
            return hachiGenericMetaDataURI;

        return(string(abi.encodePacked(hachiIPFSMetaDataURI, Strings.toString(tokenId),".json")));
    }

    function setGenericMeta(string memory sampleURI) public onlyOwner {
        hachiGenericMetaDataURI = sampleURI;
    }

    function setMetaDataReveal(bool _reveal) public onlyOwner {
        metaDataReveal = _reveal;
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

    // function deleteDefaultRoyalty() public onlyOwner {
    //     _deleteDefaultRoyalty();
    // }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    // function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) public onlyOwner {
    //     _setTokenRoyalty(tokenId, receiver, feeNumerator);
    // }

    // function resetTokenRoyalty(uint256 tokenId) public onlyOwner {
    //     _resetTokenRoyalty(tokenId);
    // }

    function updateMintLimit(uint _limit) public onlyOwner {
        mintLimit = _limit;
    }

    function updateMintPrice(uint _price) public onlyOwner {
        mintPrice = _price;
    }

    function updateAddressMintLimit(uint _limit) public onlyOwner {
        addressMintLimit = _limit;
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function updatePublicMint(bool _publicMint) public onlyOwner {
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
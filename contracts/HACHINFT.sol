// SPDX-License-Identifier: MIT
// Hachi NFT Contracts ERC1155 Contract.

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
 * @dev Implementation of the ERC 1155 standard as an NFT contract.
 * See https://github.com/BryantHustles/HachiNFT
 */
contract HACHINFT is ERC1155, EIP712, ERC2981, Ownable, Pausable, ReentrancyGuard {
    //Contract token information.
    string public name = "Hachi NFT";
    string public symbol = "HACHI";
    string public contractURI = "ipfs://QmPT1Z3WtAbqiBZwbSFHFk2UE6VRh2JXVpUKp5RE8hC86T";
    string private hachiGenericMetaDataURI = "ipfs://QmbhqqnAxzqArd8nnAeR9bw52dWtLh2huKSqeJg2p1SrWG";
    
    //Domain information for EIP712.
    string private constant SIGNING_DOMAIN = "HachiNftSig";
    string private constant SIGNATURE_VERSION = "1";
    
    //Is metadata revealed?
    bool public metaDataReveal;

    //Is public mint active?
    bool public publicMint;

    //Mint information.
    uint public mintPrice = 0.1 ether;
    uint public addressMintLimit = 3;
    uint public mintLimit = 8000;

    //Starting token ID.
    uint private tokenIndex = 0;

    //Mapping addresses to the number of tokens minted.
    mapping(address => uint256) private numberMinted;

    /**
    * @dev Ticket struct passed to the mint function in order to mint.
    * `address` where the tokens will be sent to
    * `amounts` uint array of 1s. Each 1 indicates 1 nft to be minted
    * Any value other than 1 will cause a revert. The length of the array
    * cannot be longer than the address mint limit
    * `merkleProof` array containing merkle proof used to verify whitelist
    * `signature` signed typed data signature for the data struct
    */
    struct HachiTicket {
        address to;
        uint256[]  amounts;
        bytes32[]  merkleProof;
        bytes  signature;
    }
    //Import the whitelist contract as datatype.
    HachiWhitelist whtlst;

    //Import the wallet contract as datatype.
    HachiWallet wllt;
    
    /**
     * @dev Emitted when `to` mints tokens of `id` paying the value `_value`.
     */
    event Mint(address indexed to, uint256[] indexed id, uint256 _value);

    /**
     * @dev NFT contract employing the ERC1155 standard.
     * See {ERC1155}.
     * See {EIP712} pulls from contract constants.
     * See {ERC2981} for setDefaultRoyalty.
     * See {_pause} for pause.
     * `_ipfs` is the base uri location where the token metadata is kept.
     * `_whtlst` is the address of the whitelist contract.
     * `_wllt` is the address of the address where funds are to be sent.
     */
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

    /**
    * @dev transfers any funds sent to the contract to the wallet address.
    */
    receive() external payable {
        payable(wllt).transfer(msg.value);
    }

    /**
    * @dev returns the uri of where the metadata is stored.
    * If metadata is not revealed, it will return the generic uri.
    * Otherwise, it will return the uri of the requested `_tokenId`
    * @param _tokenId Token Id for which to return the uri.
    * @return string, generic metadata uri if metadata is not revealed.
    * Returns uri of the input token if metadata is revealed.
    */
    function uri(uint256 _tokenId) override public view returns (string memory) {

        if (!metaDataReveal) {
            return hachiGenericMetaDataURI;
        } else {
            return(string(abi.encodePacked(super.uri(_tokenId), Strings.toString(_tokenId))));
        }
    }

    /**
    * @dev Updates the generic metadata uri used before metadata is revealed.
    * @param _uri The uri string to the generic pre-reveal metadata json.
    * @notice Only the contract owner can call this function.
    */
    function setGenericMeta(string memory _uri) public onlyOwner {
        hachiGenericMetaDataURI = _uri;
    }

    /**
    * @dev updates the metadata reveal flag to true, revealing the true.
    * When the flag is false, the uri function returns the generic uri.
    * When the flag is true, the token uri is returned.
    * See {uri}.
    * @notice Only the contract owner can call this function.
    */
    function revealMetaData() public onlyOwner {
        metaDataReveal = true;
    }

    /**
    * @dev Updates the token metadata base uri.
    * @param _newuri String, base uri where token metadata is stored.
    * @notice Only the contract owner can call this function.
    */
    function setURI(string memory _newuri) public onlyOwner {
        ERC1155._setURI(_newuri);
    }

    /**
    * @dev Updates the contract uri location where the contract info json is stored.
    * @param _contractURI The new uri path to the contract metadata json.
    * @notice Only the contract owner can call this function.
    */
    function setContractURI(string memory _contractURI) public onlyOwner {
        contractURI = _contractURI;
    }

    /**
    * @dev mint function used to mint new tokens.
    * Only able to call function when paused is false.
    * When public mint is false, minter must be on the whitelist and provide a valid merkle proof.
    * Value sent must be sufficient based on number minted.
    * Given correct input and correct value sent.
    * @param _ticket HachiTicket type data input to the function
    * @notice See {HachiTicket}
    * Function is non-reentrant
    * Function is payable
    */
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

    /**
    * @dev Helper function used during mint to hash and recover input data
    * for the purpose of verifying the recovered address as the sender.
    * See {EIP712}.
    * @param _ticket HachiTicket type data input to the function. See {HachiTicket}.
    * @return address, the recovered address from the input hash and signature
    */
    function verifySigner(HachiTicket calldata _ticket) internal view returns (address) {
        bytes32 digest = _hash(_ticket);
        return ECDSA.recover(digest, _ticket.signature);
    }

    /**
    * @dev Helper function used in the verifySigner function. Hashes the ticket data
    * according to EIP712 and the hash typed data v4 standard.
    * @param _ticket HachiTicket type data input to the function. See {HachiTicket}.
    * @return bytes32, the hash of the typed data input.
    */
    function _hash(HachiTicket calldata _ticket) internal view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            keccak256("HachiTicket(address to,uint256[] amounts,bytes32[] merkleProof)"),
            _ticket.to,
            keccak256(abi.encodePacked(_ticket.amounts)),
            keccak256(abi.encodePacked(_ticket.merkleProof))
        )));
    }

    /**
    * @dev Updates the default royalty value for all tokens.
    * @param receiver address which will recieve royalties.
    * @param feeNumerator royalty to be collected in basis points.
    * @notice Only the contract owner can call this function.
    */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    /**
    * @dev Updates the total minted tokens allowed.
    * @param _limit uint, new token limit.
    * @notice Only the contract owner can call this function.
    */
    function updateMintLimit(uint _limit) public onlyOwner {
        mintLimit = _limit;
    }

    /**
    * @dev Updates the price required to mint a single token.
    * @param _price uint, new price to set in wei
    * @notice Only the contract owner can call this function.
    */
    function updateMintPrice(uint _price) public onlyOwner {
        mintPrice = _price;
    }

    /**
    * @dev Updates the number of tokens any single address can mint.
    * @param _limit uint, new address limit.
    * @notice Only the contract owner can call this function.
    */
    function updateAddressMintLimit(uint _limit) public onlyOwner {
        addressMintLimit = _limit;
    }

    /**
    * @dev Updates the public mint boolean. When true, merkle proofs are not required to mint.
    * @param _publicMint bool to set variable to.
    * @notice Only the contract owner can call this function.
    */
    function updatePublicMint(bool _publicMint) public onlyOwner {
        require(_publicMint != publicMint,"input eqaul to state");
        publicMint = _publicMint;
    }

    /**
    * @dev Sets the paused variable to true. Functions that use when not paused
    * will start to revert. Functions that use when paused will start to work.
    * @notice Only the contract owner can call this function.
    */
    function pause() public onlyOwner {
        _pause();
    }

    /**
    * @dev Sets the paused variable to false. Functions that use when not paused
    * will start to work. Functions that use when paused will start to revert.
    * @notice Only the contract owner can call this function.
    */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
    @dev used to determine what interfaces are supported.
    @param interfaceId 4 bytes interface id of the interface to be checked.
    */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
# HachiNFT

A comprehensive NFT (Non-Fungible Token) project built on Ethereum using the ERC-1155 standard. HachiNFT features a whitelist system, payment splitting functionality, and a React-based web interface for minting and managing NFTs.

## 🚀 Features

### Smart Contracts
- **ERC-1155 NFT Contract** with advanced minting mechanics
- **Whitelist System** using Merkle trees for gas-efficient verification
- **Payment Splitter** for automatic revenue distribution
- **EIP-712 Typed Data Signatures** for secure minting authorization
- **Royalty Support** (ERC-2981) for secondary market sales
- **Pausable Contract** with admin controls

### Web Application
- **React-based Frontend** with modern UI/UX
- **Multi-Wallet Support** (MetaMask & WalletConnect)
- **Real-time NFT Display** with IPFS metadata integration
- **Admin Dashboard** for contract management
- **Token Transfer Tools** (single and batch)
- **Balance Checking** utilities

## 📁 Project Structure

```
HachiNFT/
├── contracts/                 # Solidity smart contracts
│   ├── HACHINFT.sol          # Main ERC-1155 NFT contract
│   ├── HACHIWallet.sol       # Payment splitter contract
│   ├── HACHIWhitelist.sol    # Merkle tree whitelist contract
│   └── Migrations.sol        # Truffle migrations
├── client/                   # React frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React context providers
│   │   ├── contracts/        # Compiled contract ABIs
│   │   ├── images/           # UI images
│   │   └── Whitelist/        # Merkle tree utilities
├── migrations/               # Truffle deployment scripts
├── test/                     # Contract test suites
└── truffle-config.js         # Truffle configuration
```

## 🔧 Smart Contract Architecture

### HACHINFT Contract
The main NFT contract implementing ERC-1155 standard with:
- **Minting System**: Signature-based minting with whitelist verification
- **Metadata Management**: Pre-reveal and post-reveal URI handling
- **Access Control**: Owner-only administrative functions
- **Security**: ReentrancyGuard and Pausable modifiers
- **Royalties**: Built-in royalty support for marketplaces

### HACHIWallet Contract
Payment splitter contract featuring:
- **Revenue Sharing**: Automatic distribution among multiple payees
- **Flexible Withdrawals**: Individual and batch payment release
- **Transparent Accounting**: View balance owed and payment history

### HACHIWhitelist Contract
Efficient whitelist management using:
- **Merkle Trees**: Gas-efficient whitelist verification
- **Dynamic Updates**: Owner can update whitelist root
- **Proof Verification**: Cryptographic proof validation

## 🛠️ Technology Stack

### Blockchain
- **Solidity** ^0.8.11
- **OpenZeppelin** contracts for security standards
- **Truffle** framework for development and deployment
- **Web3.js** for blockchain interaction

### Frontend
- **React** ^18.1.0
- **Web3.js** for wallet integration
- **WalletConnect** for mobile wallet support
- **Universal Cookies** for session management
- **IPFS** for decentralized metadata storage

### Development Tools
- **Truffle** for contract compilation and deployment
- **Chai** testing framework
- **OpenZeppelin Test Helpers** for contract testing
- **Prettier** for code formatting

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- NPM or Yarn
- Truffle Suite
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BryantHustles/HachiNFT.git
   cd HachiNFT
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   Mneumonic=your_wallet_mnemonic_here
   etherscanApiKey=your_etherscan_api_key
   HachiIpfs=your_base_ipfs_uri
   ```

4. **Compile Contracts**
   ```bash
   truffle compile
   ```

5. **Run Tests**
   ```bash
   truffle test
   ```

6. **Deploy Contracts**
   ```bash
   # Deploy to development network
   truffle migrate --network develop
   
   # Deploy to Rinkeby testnet
   truffle migrate --network rinkby_Infura
   ```

7. **Start the Frontend**
   ```bash
   cd client
   npm start
   ```

## 🎯 Usage

### For Users

1. **Connect Wallet**
   - Click "Connect" button
   - Choose between MetaMask or WalletConnect
   - Approve connection in your wallet

2. **Mint NFTs**
   - Navigate to "Token Tools" tab
   - Specify quantity to mint
   - Click "Mint Hachi" and confirm transaction
   - Pay the required ETH amount

3. **View Your NFTs**
   - Your owned NFTs appear in the dashboard
   - Images load automatically from IPFS

4. **Transfer NFTs**
   - Use single or batch transfer tools
   - Enter recipient address and token IDs
   - Confirm transaction in wallet

### For Administrators

1. **Contract Management**
   - Access "Admin Tools" tab
   - Update mint price, limits, and URIs
   - Pause/unpause contract
   - Reveal metadata when ready

2. **Whitelist Management**
   - Update Merkle root in whitelist contract
   - Toggle public minting on/off

3. **Revenue Management**
   - Check wallet balance and shares
   - Release payments to beneficiaries

## 🔒 Security Features

- **Signature Verification**: EIP-712 typed data signatures prevent unauthorized minting
- **Merkle Proofs**: Gas-efficient whitelist verification
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency stop functionality
- **Access Control**: Owner-only administrative functions

## 🧪 Testing

The project includes comprehensive test suites:

```bash
# Run all tests
truffle test

# Run specific test file
truffle test test/HachiNFT.test.js
```

Test coverage includes:
- Contract deployment and initialization
- Minting functionality and restrictions
- Whitelist verification
- Payment splitting mechanics
- Access control and security

## 🚀 Deployment Networks

Configured for deployment on:
- **Development**: Local Truffle development network
- **Ganache**: Local Ganache instance
- **Rinkeby**: Ethereum testnet (via Infura)
- **Ropsten**: Ethereum testnet (via Infura)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Bryant Backus** - [BryantHustles](https://github.com/BryantHustles)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, issues, or questions:
- Open an issue on GitHub
- Contact the development team

## 🔮 Future Enhancements

- Multi-chain deployment support
- Enhanced metadata features
- Marketplace integration
- Mobile application
- Advanced analytics dashboard

---

*Built with ❤️ for the NFT community*
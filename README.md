# E-DINAR Crypto Staking Platform

A fullstack cryptocurrency staking platform built with React, Node.js, and Web3 integration for the E-DINAR token on the Sepolia testnet.

## Features

- 🏦 **Staking Operations**: Stake, unstake, and claim rewards
- 📊 **Real-time Statistics**: TVL, APY, and active stakers
- 👥 **Referral Program**: Earn 1% of referrals' rewards
- 🎨 **Modern UI**: Black background with gold accents
- 🔗 **Web3 Integration**: Direct blockchain interaction
- 📱 **Responsive Design**: Works on all devices

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Ethers.js
- **Backend**: Node.js, Express.js
- **Blockchain**: Ethereum (Sepolia testnet)
- **Styling**: Custom CSS with gold theme

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet extension
- Sepolia testnet ETH

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crypto-staking-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   The `.env` file is already configured with:
   ```
   REACT_APP_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/Juq8fFcJxh3BIZzT3ZsCb
   REACT_APP_STAKING_CONTRACT_ADDRESS=0xFB45D43199E7De8bc7fa9d9fab1Ee0C76B63f889
   REACT_APP_TOKEN_CONTRACT_ADDRESS=0x6dfF40fB1B7db2b75a12EC3d837aCAe953C4fC88
   REACT_APP_CHAIN_ID=11155111
   REACT_APP_NETWORK_NAME=Sepolia
   REACT_APP_LOGO_URL=https://gateway.pinata.cloud/ipfs/bafkreibdfqqudx7psaaaqhypwiag75ssw2vexwwsmvfsjtokxhexzzhaw4
   ```

## Running the Application

### Development Mode
```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run server  # Backend on port 3001
npm start       # Frontend on port 3000
```

### Production Build
```bash
npm run build
```

## Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **Switch to Sepolia**: Ensure your MetaMask is connected to Sepolia testnet
3. **Stake Tokens**: Enter amount and click "Approve & Stake EDINAR"
4. **Unstake**: Enter amount and click "Unstake"
5. **Claim Rewards**: Click "Claim Rewards" to collect your earnings
6. **Referral Program**: Share your referral link to earn additional rewards

## Contract Addresses

- **Token Contract**: `0x6dfF40fB1B7db2b75a12EC3d837aCAe953C4fC88`
- **Staking Contract**: `0xFB45D43199E7De8bc7fa9d9fab1Ee0C76B63f889`
- **Network**: Sepolia Testnet (Chain ID: 11155111)

## API Endpoints

- `GET /api/platform-stats` - Get platform statistics
- `GET /api/user-stats/:address` - Get user staking information
- `GET /api/token-info` - Get token information
- `GET /api/health` - Health check

## Project Structure

```
crypto-staking-app/
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Main application component
│   ├── App.css         # Application styles
│   ├── index.js        # React entry point
│   └── index.css       # Global styles
├── server/
│   └── index.js        # Express server
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── .env
└── README.md
```

## Features in Detail

### Staking Operations
- **Stake**: Lock your EDINAR tokens to earn rewards
- **Unstake**: Withdraw your staked tokens
- **Claim Rewards**: Collect accumulated staking rewards

### Referral System
- Generate unique referral links
- Earn 1% of your referrals' rewards
- Track referral count and earnings

### Real-time Data
- Live token balances
- Current staking APY
- Total value locked (TVL)
- Active staker count

## Security Features

- MetaMask wallet integration
- Secure Web3 transactions
- Input validation
- Error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

---

**Note**: This application is configured for the Sepolia testnet. Make sure you have testnet ETH and tokens before using the staking features.

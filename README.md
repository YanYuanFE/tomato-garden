# Tomato Garden DApp

A decentralized application (DApp) built on Starknet that gamifies NFT staking through an interactive tomato garden experience. Users can plant, grow, and harvest virtual tomatoes while earning rewards through staking mechanisms.

## ✨ Features

- **🌱 Virtual Garden**: Interactive tomato growing simulation
- **🎨 NFT Integration**: Stake and manage your tomato NFTs
- **🏆 Gamification**: Tasks, achievements, and leaderboards
- **📱 Responsive Design**: Mobile-first UI with modern components
- **🔗 Starknet Integration**: Built on Cairo smart contracts

## 🛠 Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** components
- **React Router** for navigation
- **Starknet React** for blockchain integration

### Smart Contracts
- **Cairo** language on Starknet
- **Scarb** + **Starknet Foundry** for development
- **TomatoNFT**: ERC-721 NFT contract
- **TomatoStaking**: Staking rewards system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm or npm
- Scarb (for smart contracts)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tomato-garden
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Build for production**
   ```bash
   pnpm build
   ```

### Smart Contract Development

1. **Navigate to contracts directory**
   ```bash
   cd contracts
   ```

2. **Build contracts**
   ```bash
   scarb build
   ```

3. **Run tests**
   ```bash
   snforge test
   ```

4. **Deploy contracts**
   ```bash
   ./scripts/deploy.sh
   ```

## 📁 Project Structure

```
tomato-garden/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── tabs/          # Tab-based navigation
│   │   └── ui/            # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # Blockchain service layer
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions
├── contracts/             # Smart contracts
│   ├── src/               # Cairo contract source
│   ├── tests/             # Contract tests
│   ├── services/          # Contract interaction services
│   └── scripts/           # Deployment scripts
└── public/                # Static assets
```

## 🎮 Application Features

### 🌿 Garden Tab
- View and manage your virtual tomato garden
- Plant new tomatoes and watch them grow
- Interactive garden visualization

### 🖼 NFT Tab
- Browse your tomato NFT collection
- View NFT metadata and properties
- Manage NFT ownership

### ✅ Tasks Tab
- Complete daily and weekly challenges
- Earn rewards for achievements
- Track progress and milestones

### 🥇 Leaderboard Tab
- Compare your progress with other players
- View top performers and rankings
- Competitive gaming elements

## 🔧 Development Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm preview               # Preview production build
pnpm lint                  # Run ESLint

# Smart Contracts (in contracts/ directory)
scarb build                # Compile contracts
snforge test              # Run contract tests
./scripts/deploy.sh       # Deploy to testnet
```

## 🌐 Deployment

The application is designed to be deployed on modern hosting platforms:

- **Frontend**: Vercel, Netlify, or similar
- **Smart Contracts**: Starknet testnet/mainnet

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [Starknet Documentation](https://docs.starknet.io/)
- [Cairo Language](https://cairo-lang.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

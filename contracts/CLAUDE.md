# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tomato Garden is a gamified Starknet smart contract application built in Cairo that allows users to stake STRK tokens to grow virtual tomatoes and harvest NFTs. The project implements a modular architecture with two main smart contracts:

1. **TomatoNFT.cairo** - ERC721 NFT contract for tomato collectibles
2. **TomatoStaking.cairo** - Main game logic contract for staking, growing, and harvesting

## Development Commands

### Build and Compilation
```bash
# Compile contracts
scarb build

# Format code
scarb fmt
```

### Testing
```bash
# Run all tests with snforge
snforge test

# Run specific test
snforge test test_plant_tomato

# Verbose output
snforge test -v
```

### Deployment and Interaction
```bash
# Deploy both contracts (requires starkli setup)
./scripts/deploy.sh <network> <account_file> <strk_token_address> <min_stake_amount> <owner_address>

# Interact with contracts
./scripts/interact.sh <action> [parameters...]
# Available actions: plant, water, harvest, info, stage, list, min-stake, approve

# Examples:
./scripts/interact.sh plant sepolia 0x123... 2000000000000000000
./scripts/interact.sh water sepolia 0x123... 1
./scripts/interact.sh harvest sepolia 0x123... 1
```

## Architecture

### Contract Modular Design

The project uses a two-contract modular architecture:

**TomatoNFT Contract (ERC721 + Metadata)**:
- Inherits OpenZeppelin's ERC721Component, SRC5Component, and OwnableComponent
- Manages tomato NFT metadata including growth stage, planting time, staking amount
- Controls authorized minting (only TomatoStaking contract can mint)
- Configurable growth cycle parameters (growth_time_per_stage, max_growth_stage)

**TomatoStaking Contract (Game Logic)**:
- Handles STRK token staking/unstaking mechanics
- Implements tomato planting, watering, and harvesting logic
- Manages user tomato ownership and indexing
- Calculates dynamic growth stages with watering acceleration
- Distributes rewards based on growth stage at harvest

### Key Data Flow

1. **Plant**: User stakes STRK → TomatoStaking calls TomatoNFT.mint_tomato() → Records ownership
2. **Water**: User waters tomato → Updates last_watered timestamp → Accelerates growth calculation
3. **Harvest**: Calculates growth stage → Distributes rewards → Updates metadata with harvest time

### Smart Contract Interactions

- TomatoStaking → STRK Token: `transfer_from()` for staking, `transfer()` for rewards
- TomatoStaking → TomatoNFT: `mint_tomato()`, `get_tomato_metadata()`, `update_tomato_metadata()`
- Growth calculation considers watering with 3x acceleration after watering

### Dependencies

- **OpenZeppelin v2.0.0**: ERC721, SRC5, Ownable components
- **Starknet v2.11.4**: Core blockchain functionality
- **Cairo v2.11.4**: Smart contract language
- **Scarb**: Build system and package management
- **Starknet Foundry**: Testing framework

### Testing Structure

Tests are located in `/tests/` directory:
- `test_tomato_garden.cairo` - Main integration tests
- `test_simple_functions.cairo` - Unit tests for individual functions
- Uses snforge testing framework with fuzz testing configured

### Deployment Configuration

- Network configurations in `config/networks.example.json`
- Deployment artifacts saved in `deployments/` directory
- Supports both Sepolia testnet and mainnet
- STRK token addresses hardcoded for each network

### Growth Mechanics

- Default: 24 hours per growth stage (86400 seconds)
- 5 growth stages: 0 (seed) → 4 (mature/harvestable)
- Watering provides 3x growth acceleration after watering timestamp
- Max growth stage enforced to prevent overflow

### Reward System

- Base reward per stage configurable in TomatoStaking constructor
- Final reward = base_reward_per_stage × current_growth_stage
- Rewards paid from TomatoStaking contract's STRK balance
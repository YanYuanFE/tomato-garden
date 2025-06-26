/**
 * 合约 ABI 定义
 * 在实际使用中，这些 ABI 应该从编译后的合约文件中生成
 */

// TomatoNFT 合约 ABI
export const TOMATO_NFT_ABI = [
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{"type": "core::byte_array::ByteArray"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "symbol", 
    "inputs": [],
    "outputs": [{"type": "core::byte_array::ByteArray"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "balance_of",
    "inputs": [{"name": "owner", "type": "core::starknet::contract_address::ContractAddress"}],
    "outputs": [{"type": "core::integer::u256"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "owner_of",
    "inputs": [{"name": "token_id", "type": "core::integer::u256"}],
    "outputs": [{"type": "core::starknet::contract_address::ContractAddress"}],
    "state_mutability": "view"
  },
  {
    "type": "function", 
    "name": "token_uri",
    "inputs": [{"name": "token_id", "type": "core::integer::u256"}],
    "outputs": [{"type": "core::byte_array::ByteArray"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_tomato_metadata",
    "inputs": [{"name": "token_id", "type": "core::integer::u256"}],
    "outputs": [{"type": "tomato_garden::TomatoNFT::TomatoMetadata"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_tomato_type",
    "inputs": [{"name": "token_id", "type": "core::integer::u256"}],
    "outputs": [{"type": "tomato_garden::TomatoNFT::TomatoType"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {"name": "to", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "token_id", "type": "core::integer::u256"}
    ],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "transfer_from",
    "inputs": [
      {"name": "from", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "to", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "token_id", "type": "core::integer::u256"}
    ],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "mint_tomato",
    "inputs": [
      {"name": "to", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "metadata", "type": "tomato_garden::TomatoNFT::TomatoMetadata"}
    ],
    "outputs": [{"type": "core::integer::u256"}],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "update_tomato_metadata",
    "inputs": [
      {"name": "token_id", "type": "core::integer::u256"},
      {"name": "metadata", "type": "tomato_garden::TomatoNFT::TomatoMetadata"}
    ],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "set_base_uri",
    "inputs": [{"name": "base_uri", "type": "core::byte_array::ByteArray"}],
    "outputs": [],
    "state_mutability": "external"
  },
  // 事件定义
  {
    "type": "event",
    "name": "Transfer",
    "keys": [],
    "data": [
      {"name": "from", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "to", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "token_id", "type": "core::integer::u256"}
    ]
  },
  {
    "type": "event",
    "name": "Approval",
    "keys": [],
    "data": [
      {"name": "owner", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "approved", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "token_id", "type": "core::integer::u256"}
    ]
  }
];

// TomatoStaking 合约 ABI
export const TOMATO_STAKING_ABI = [
  {
    "type": "function",
    "name": "plant_tomato",
    "inputs": [{"name": "stake_amount", "type": "core::integer::u256"}],
    "outputs": [{"type": "core::integer::u256"}],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "water_tomato",
    "inputs": [{"name": "tomato_id", "type": "core::integer::u256"}],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "harvest_tomato",
    "inputs": [{"name": "tomato_id", "type": "core::integer::u256"}],
    "outputs": [{"type": "core::integer::u256"}],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "get_user_tomato_count",
    "inputs": [{"name": "user", "type": "core::starknet::contract_address::ContractAddress"}],
    "outputs": [{"type": "core::integer::u256"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_user_tomato_at_index",
    "inputs": [
      {"name": "user", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "index", "type": "core::integer::u256"}
    ],
    "outputs": [{"type": "core::integer::u256"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_current_growth_stage",
    "inputs": [{"name": "tomato_id", "type": "core::integer::u256"}],
    "outputs": [{"type": "core::integer::u8"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_tomato_last_watered",
    "inputs": [{"name": "tomato_id", "type": "core::integer::u256"}],
    "outputs": [{"type": "core::integer::u64"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_min_stake_amount",
    "inputs": [],
    "outputs": [{"type": "core::integer::u256"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_tomato_type",
    "inputs": [{"name": "tomato_id", "type": "core::integer::u256"}],
    "outputs": [{"type": "tomato_garden::TomatoNFT::TomatoType"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_base_reward_per_stage",
    "inputs": [],
    "outputs": [{"type": "core::integer::u256"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_owner",
    "inputs": [],
    "outputs": [{"type": "core::starknet::contract_address::ContractAddress"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "set_min_stake_amount",
    "inputs": [{"name": "amount", "type": "core::integer::u256"}],
    "outputs": [],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "set_base_reward_per_stage",
    "inputs": [{"name": "reward", "type": "core::integer::u256"}],
    "outputs": [],
    "state_mutability": "external"
  },
  // 事件定义
  {
    "type": "event",
    "name": "TomatoPlanted",
    "keys": [],
    "data": [
      {"name": "user", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "tomato_id", "type": "core::integer::u256"},
      {"name": "stake_amount", "type": "core::integer::u256"}
    ]
  },
  {
    "type": "event",
    "name": "TomatoWatered",
    "keys": [],
    "data": [
      {"name": "user", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "tomato_id", "type": "core::integer::u256"},
      {"name": "mutated", "type": "core::bool"},
      {"name": "new_type", "type": "tomato_garden::TomatoNFT::TomatoType"}
    ]
  },
  {
    "type": "event",
    "name": "TomatoHarvested",
    "keys": [],
    "data": [
      {"name": "user", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "tomato_id", "type": "core::integer::u256"},
      {"name": "reward", "type": "core::integer::u256"},
      {"name": "growth_stage", "type": "core::integer::u8"}
    ]
  }
];

// STRK Token ABI (ERC20)
export const STRK_TOKEN_ABI = [
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{"type": "core::byte_array::ByteArray"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{"type": "core::byte_array::ByteArray"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{"type": "core::integer::u8"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "total_supply",
    "inputs": [],
    "outputs": [{"type": "core::integer::u256"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "balance_of",
    "inputs": [{"name": "account", "type": "core::starknet::contract_address::ContractAddress"}],
    "outputs": [{"type": "core::integer::u256"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {"name": "owner", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "spender", "type": "core::starknet::contract_address::ContractAddress"}
    ],
    "outputs": [{"type": "core::integer::u256"}],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      {"name": "recipient", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "amount", "type": "core::integer::u256"}
    ],
    "outputs": [{"type": "core::bool"}],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "transfer_from",
    "inputs": [
      {"name": "sender", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "recipient", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "amount", "type": "core::integer::u256"}
    ],
    "outputs": [{"type": "core::bool"}],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {"name": "spender", "type": "core::starknet::contract_address::ContractAddress"},
      {"name": "amount", "type": "core::integer::u256"}
    ],
    "outputs": [{"type": "core::bool"}],
    "state_mutability": "external"
  }
];

// ABI 加载器
export const ABI_LOADER = {
  tomatoNFT: TOMATO_NFT_ABI,
  tomatoStaking: TOMATO_STAKING_ABI,
  strkToken: STRK_TOKEN_ABI
};

// 导出所有 ABI
export const ABIS = {
  TOMATO_NFT_ABI,
  TOMATO_STAKING_ABI,
  STRK_TOKEN_ABI,
  ABI_LOADER
};
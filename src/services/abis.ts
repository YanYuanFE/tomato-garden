/**
 * 合约 ABI 定义
 * 在实际使用中，这些 ABI 应该从编译后的合约文件中生成
 */

// TomatoNFT 合约 ABI
export const TOMATO_NFT_ABI = [
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ type: 'core::byte_array::ByteArray' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ type: 'core::byte_array::ByteArray' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'balance_of',
    inputs: [{ name: 'owner', type: 'core::starknet::contract_address::ContractAddress' }],
    outputs: [{ type: 'core::integer::u256' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'owner_of',
    inputs: [{ name: 'token_id', type: 'core::integer::u256' }],
    outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'token_uri',
    inputs: [{ name: 'token_id', type: 'core::integer::u256' }],
    outputs: [{ type: 'core::byte_array::ByteArray' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'get_tomato_metadata',
    inputs: [{ name: 'token_id', type: 'core::integer::u256' }],
    outputs: [{ type: 'tomato_garden::TomatoNFT::TomatoMetadata' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'get_tomato_type',
    inputs: [{ name: 'token_id', type: 'core::integer::u256' }],
    outputs: [{ type: 'tomato_garden::TomatoNFT::TomatoType' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'to', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'token_id', type: 'core::integer::u256' }
    ],
    outputs: [],
    state_mutability: 'external'
  },
  {
    type: 'function',
    name: 'transfer_from',
    inputs: [
      { name: 'from', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'to', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'token_id', type: 'core::integer::u256' }
    ],
    outputs: [],
    state_mutability: 'external'
  },
  {
    type: 'function',
    name: 'mint_tomato',
    inputs: [
      { name: 'to', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'metadata', type: 'tomato_garden::TomatoNFT::TomatoMetadata' }
    ],
    outputs: [{ type: 'core::integer::u256' }],
    state_mutability: 'external'
  },
  {
    type: 'function',
    name: 'update_tomato_metadata',
    inputs: [
      { name: 'token_id', type: 'core::integer::u256' },
      { name: 'metadata', type: 'tomato_garden::TomatoNFT::TomatoMetadata' }
    ],
    outputs: [],
    state_mutability: 'external'
  },
  {
    type: 'function',
    name: 'set_base_uri',
    inputs: [{ name: 'base_uri', type: 'core::byte_array::ByteArray' }],
    outputs: [],
    state_mutability: 'external'
  },
  // 事件定义
  {
    type: 'event',
    name: 'Transfer',
    keys: [],
    data: [
      { name: 'from', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'to', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'token_id', type: 'core::integer::u256' }
    ]
  },
  {
    type: 'event',
    name: 'Approval',
    keys: [],
    data: [
      { name: 'owner', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'approved', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'token_id', type: 'core::integer::u256' }
    ]
  }
];

// TomatoStaking 合约 ABI
export const TOMATO_STAKING_ABI = [
  {
    type: 'impl',
    name: 'TomatoStakingImpl',
    interface_name: 'tomato_garden::TomatoStaking::ITomatoStaking'
  },
  {
    type: 'struct',
    name: 'core::integer::u256',
    members: [
      {
        name: 'low',
        type: 'core::integer::u128'
      },
      {
        name: 'high',
        type: 'core::integer::u128'
      }
    ]
  },
  {
    type: 'enum',
    name: 'tomato_garden::TomatoNFT::TomatoType',
    variants: [
      {
        name: 'Normal',
        type: '()'
      },
      {
        name: 'Yellow',
        type: '()'
      },
      {
        name: 'Purple',
        type: '()'
      },
      {
        name: 'Flame',
        type: '()'
      },
      {
        name: 'Ice',
        type: '()'
      },
      {
        name: 'Rainbow',
        type: '()'
      }
    ]
  },
  {
    type: 'struct',
    name: 'tomato_garden::TomatoNFT::TomatoMetadata',
    members: [
      {
        name: 'growth_stage',
        type: 'core::integer::u8'
      },
      {
        name: 'planted_at',
        type: 'core::integer::u64'
      },
      {
        name: 'harvested_at',
        type: 'core::integer::u64'
      },
      {
        name: 'staked_amount',
        type: 'core::integer::u256'
      },
      {
        name: 'tomato_type',
        type: 'tomato_garden::TomatoNFT::TomatoType'
      }
    ]
  },
  {
    type: 'enum',
    name: 'core::bool',
    variants: [
      {
        name: 'False',
        type: '()'
      },
      {
        name: 'True',
        type: '()'
      }
    ]
  },
  {
    type: 'interface',
    name: 'tomato_garden::TomatoStaking::ITomatoStaking',
    items: [
      {
        type: 'function',
        name: 'plant_tomato',
        inputs: [
          {
            name: 'stake_amount',
            type: 'core::integer::u256'
          }
        ],
        outputs: [
          {
            type: 'core::integer::u256'
          }
        ],
        state_mutability: 'external'
      },
      {
        type: 'function',
        name: 'water_tomato',
        inputs: [
          {
            name: 'tomato_id',
            type: 'core::integer::u256'
          }
        ],
        outputs: [],
        state_mutability: 'external'
      },
      {
        type: 'function',
        name: 'harvest_tomato',
        inputs: [
          {
            name: 'tomato_id',
            type: 'core::integer::u256'
          }
        ],
        outputs: [
          {
            type: 'core::integer::u256'
          }
        ],
        state_mutability: 'external'
      },
      {
        type: 'function',
        name: 'get_user_tomato_count',
        inputs: [
          {
            name: 'user',
            type: 'core::starknet::contract_address::ContractAddress'
          }
        ],
        outputs: [
          {
            type: 'core::integer::u256'
          }
        ],
        state_mutability: 'view'
      },
      {
        type: 'function',
        name: 'get_user_tomato_at_index',
        inputs: [
          {
            name: 'user',
            type: 'core::starknet::contract_address::ContractAddress'
          },
          {
            name: 'index',
            type: 'core::integer::u256'
          }
        ],
        outputs: [
          {
            type: 'core::integer::u256'
          }
        ],
        state_mutability: 'view'
      },
      {
        type: 'function',
        name: 'get_current_growth_stage',
        inputs: [
          {
            name: 'tomato_id',
            type: 'core::integer::u256'
          }
        ],
        outputs: [
          {
            type: 'core::integer::u8'
          }
        ],
        state_mutability: 'view'
      },
      {
        type: 'function',
        name: 'get_tomato_last_watered',
        inputs: [
          {
            name: 'tomato_id',
            type: 'core::integer::u256'
          }
        ],
        outputs: [
          {
            type: 'core::integer::u64'
          }
        ],
        state_mutability: 'view'
      },
      {
        type: 'function',
        name: 'set_min_stake_amount',
        inputs: [
          {
            name: 'amount',
            type: 'core::integer::u256'
          }
        ],
        outputs: [],
        state_mutability: 'external'
      },
      {
        type: 'function',
        name: 'get_min_stake_amount',
        inputs: [],
        outputs: [
          {
            type: 'core::integer::u256'
          }
        ],
        state_mutability: 'view'
      },
      {
        type: 'function',
        name: 'set_tomato_nft_contract',
        inputs: [
          {
            name: 'nft_contract',
            type: 'core::starknet::contract_address::ContractAddress'
          }
        ],
        outputs: [],
        state_mutability: 'external'
      },
      {
        type: 'function',
        name: 'get_tomato_nft_contract',
        inputs: [],
        outputs: [
          {
            type: 'core::starknet::contract_address::ContractAddress'
          }
        ],
        state_mutability: 'view'
      },
      {
        type: 'function',
        name: 'get_tomato_type',
        inputs: [
          {
            name: 'tomato_id',
            type: 'core::integer::u256'
          }
        ],
        outputs: [
          {
            type: 'tomato_garden::TomatoNFT::TomatoType'
          }
        ],
        state_mutability: 'view'
      },
      {
        type: 'function',
        name: 'get_tomato_metadata',
        inputs: [
          {
            name: 'tomato_id',
            type: 'core::integer::u256'
          }
        ],
        outputs: [
          {
            type: 'tomato_garden::TomatoNFT::TomatoMetadata'
          }
        ],
        state_mutability: 'view'
      },
      {
        type: 'function',
        name: 'is_tomato_harvested',
        inputs: [
          {
            name: 'tomato_id',
            type: 'core::integer::u256'
          }
        ],
        outputs: [
          {
            type: 'core::bool'
          }
        ],
        state_mutability: 'view'
      }
    ]
  },
  {
    type: 'impl',
    name: 'OwnableMixinImpl',
    interface_name: 'openzeppelin_access::ownable::interface::OwnableABI'
  },
  {
    type: 'interface',
    name: 'openzeppelin_access::ownable::interface::OwnableABI',
    items: [
      {
        type: 'function',
        name: 'owner',
        inputs: [],
        outputs: [
          {
            type: 'core::starknet::contract_address::ContractAddress'
          }
        ],
        state_mutability: 'view'
      },
      {
        type: 'function',
        name: 'transfer_ownership',
        inputs: [
          {
            name: 'new_owner',
            type: 'core::starknet::contract_address::ContractAddress'
          }
        ],
        outputs: [],
        state_mutability: 'external'
      },
      {
        type: 'function',
        name: 'renounce_ownership',
        inputs: [],
        outputs: [],
        state_mutability: 'external'
      },
      {
        type: 'function',
        name: 'transferOwnership',
        inputs: [
          {
            name: 'newOwner',
            type: 'core::starknet::contract_address::ContractAddress'
          }
        ],
        outputs: [],
        state_mutability: 'external'
      },
      {
        type: 'function',
        name: 'renounceOwnership',
        inputs: [],
        outputs: [],
        state_mutability: 'external'
      }
    ]
  },
  {
    type: 'constructor',
    name: 'constructor',
    inputs: [
      {
        name: 'strk_token_address',
        type: 'core::starknet::contract_address::ContractAddress'
      },
      {
        name: 'tomato_nft_contract',
        type: 'core::starknet::contract_address::ContractAddress'
      },
      {
        name: 'owner',
        type: 'core::starknet::contract_address::ContractAddress'
      },
      {
        name: 'min_stake_amount',
        type: 'core::integer::u256'
      },
      {
        name: 'base_reward_per_stage',
        type: 'core::integer::u256'
      }
    ]
  },
  {
    type: 'event',
    name: 'openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred',
    kind: 'struct',
    members: [
      {
        name: 'previous_owner',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key'
      },
      {
        name: 'new_owner',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key'
      }
    ]
  },
  {
    type: 'event',
    name: 'openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted',
    kind: 'struct',
    members: [
      {
        name: 'previous_owner',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key'
      },
      {
        name: 'new_owner',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key'
      }
    ]
  },
  {
    type: 'event',
    name: 'openzeppelin_access::ownable::ownable::OwnableComponent::Event',
    kind: 'enum',
    variants: [
      {
        name: 'OwnershipTransferred',
        type: 'openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred',
        kind: 'nested'
      },
      {
        name: 'OwnershipTransferStarted',
        type: 'openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted',
        kind: 'nested'
      }
    ]
  },
  {
    type: 'event',
    name: 'tomato_garden::TomatoStaking::TomatoStaking::TomatoPlanted',
    kind: 'struct',
    members: [
      {
        name: 'user',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key'
      },
      {
        name: 'tomato_id',
        type: 'core::integer::u256',
        kind: 'key'
      },
      {
        name: 'stake_amount',
        type: 'core::integer::u256',
        kind: 'data'
      },
      {
        name: 'planted_at',
        type: 'core::integer::u64',
        kind: 'data'
      }
    ]
  },
  {
    type: 'event',
    name: 'tomato_garden::TomatoStaking::TomatoStaking::TomatoWatered',
    kind: 'struct',
    members: [
      {
        name: 'user',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key'
      },
      {
        name: 'tomato_id',
        type: 'core::integer::u256',
        kind: 'key'
      },
      {
        name: 'watered_at',
        type: 'core::integer::u64',
        kind: 'data'
      }
    ]
  },
  {
    type: 'event',
    name: 'tomato_garden::TomatoStaking::TomatoStaking::TomatoHarvested',
    kind: 'struct',
    members: [
      {
        name: 'user',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key'
      },
      {
        name: 'tomato_id',
        type: 'core::integer::u256',
        kind: 'key'
      },
      {
        name: 'reward_amount',
        type: 'core::integer::u256',
        kind: 'data'
      },
      {
        name: 'harvested_at',
        type: 'core::integer::u64',
        kind: 'data'
      }
    ]
  },
  {
    type: 'event',
    name: 'tomato_garden::TomatoStaking::TomatoStaking::MinStakeAmountUpdated',
    kind: 'struct',
    members: [
      {
        name: 'old_amount',
        type: 'core::integer::u256',
        kind: 'data'
      },
      {
        name: 'new_amount',
        type: 'core::integer::u256',
        kind: 'data'
      }
    ]
  },
  {
    type: 'event',
    name: 'tomato_garden::TomatoStaking::TomatoStaking::NFTContractUpdated',
    kind: 'struct',
    members: [
      {
        name: 'old_contract',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key'
      },
      {
        name: 'new_contract',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key'
      }
    ]
  },
  {
    type: 'event',
    name: 'tomato_garden::TomatoStaking::TomatoStaking::TomatoMutated',
    kind: 'struct',
    members: [
      {
        name: 'user',
        type: 'core::starknet::contract_address::ContractAddress',
        kind: 'key'
      },
      {
        name: 'tomato_id',
        type: 'core::integer::u256',
        kind: 'key'
      },
      {
        name: 'old_type',
        type: 'tomato_garden::TomatoNFT::TomatoType',
        kind: 'data'
      },
      {
        name: 'new_type',
        type: 'tomato_garden::TomatoNFT::TomatoType',
        kind: 'data'
      }
    ]
  },
  {
    type: 'event',
    name: 'tomato_garden::TomatoStaking::TomatoStaking::Event',
    kind: 'enum',
    variants: [
      {
        name: 'OwnableEvent',
        type: 'openzeppelin_access::ownable::ownable::OwnableComponent::Event',
        kind: 'flat'
      },
      {
        name: 'TomatoPlanted',
        type: 'tomato_garden::TomatoStaking::TomatoStaking::TomatoPlanted',
        kind: 'nested'
      },
      {
        name: 'TomatoWatered',
        type: 'tomato_garden::TomatoStaking::TomatoStaking::TomatoWatered',
        kind: 'nested'
      },
      {
        name: 'TomatoHarvested',
        type: 'tomato_garden::TomatoStaking::TomatoStaking::TomatoHarvested',
        kind: 'nested'
      },
      {
        name: 'MinStakeAmountUpdated',
        type: 'tomato_garden::TomatoStaking::TomatoStaking::MinStakeAmountUpdated',
        kind: 'nested'
      },
      {
        name: 'NFTContractUpdated',
        type: 'tomato_garden::TomatoStaking::TomatoStaking::NFTContractUpdated',
        kind: 'nested'
      },
      {
        name: 'TomatoMutated',
        type: 'tomato_garden::TomatoStaking::TomatoStaking::TomatoMutated',
        kind: 'nested'
      }
    ]
  }
];

// STRK Token ABI (ERC20)
export const STRK_TOKEN_ABI = [
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ type: 'core::byte_array::ByteArray' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ type: 'core::byte_array::ByteArray' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ type: 'core::integer::u8' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'total_supply',
    inputs: [],
    outputs: [{ type: 'core::integer::u256' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'balance_of',
    inputs: [{ name: 'account', type: 'core::starknet::contract_address::ContractAddress' }],
    outputs: [{ type: 'core::integer::u256' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'spender', type: 'core::starknet::contract_address::ContractAddress' }
    ],
    outputs: [{ type: 'core::integer::u256' }],
    state_mutability: 'view'
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'recipient', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'amount', type: 'core::integer::u256' }
    ],
    outputs: [{ type: 'core::bool' }],
    state_mutability: 'external'
  },
  {
    type: 'function',
    name: 'transfer_from',
    inputs: [
      { name: 'sender', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'recipient', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'amount', type: 'core::integer::u256' }
    ],
    outputs: [{ type: 'core::bool' }],
    state_mutability: 'external'
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'amount', type: 'core::integer::u256' }
    ],
    outputs: [{ type: 'core::bool' }],
    state_mutability: 'external'
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

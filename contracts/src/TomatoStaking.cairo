use starknet::ContractAddress;
use super::TomatoNFT::{ITomatoNFTDispatcher, ITomatoNFTDispatcherTrait, TomatoMetadata, TomatoType};

#[starknet::interface]
pub trait IERC20<TContractState> {
    fn transfer_from(ref self: TContractState, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
}

#[starknet::interface]
pub trait ITomatoStaking<TContractState> {
    fn plant_tomato(ref self: TContractState, stake_amount: u256) -> u256;
    fn water_tomato(ref self: TContractState, tomato_id: u256);
    fn harvest_tomato(ref self: TContractState, tomato_id: u256) -> u256;
    fn get_user_tomato_count(self: @TContractState, user: ContractAddress) -> u256;
    fn get_user_tomato_at_index(self: @TContractState, user: ContractAddress, index: u256) -> u256;
    fn get_current_growth_stage(self: @TContractState, tomato_id: u256) -> u8;
    fn get_tomato_last_watered(self: @TContractState, tomato_id: u256) -> u64;
    fn set_min_stake_amount(ref self: TContractState, amount: u256);
    fn get_min_stake_amount(self: @TContractState) -> u256;
    fn set_tomato_nft_contract(ref self: TContractState, nft_contract: ContractAddress);
    fn get_tomato_nft_contract(self: @TContractState) -> ContractAddress;
    fn get_tomato_type(self: @TContractState, tomato_id: u256) -> TomatoType;
    fn get_tomato_metadata(self: @TContractState, tomato_id: u256) -> TomatoMetadata;
    fn is_tomato_harvested(self: @TContractState, tomato_id: u256) -> bool;
    fn update_base_reward_per_stage(ref self: TContractState, new_base_reward: u256);
    fn get_base_reward_per_stage(self: @TContractState) -> u256;
    fn withdraw_strk(ref self: TContractState, amount: u256);
    fn get_contract_strk_balance(self: @TContractState) -> u256;
}

#[starknet::contract]
mod TomatoStaking {
    use super::{ITomatoStaking, IERC20Dispatcher, IERC20DispatcherTrait, ITomatoNFTDispatcher, ITomatoNFTDispatcherTrait, TomatoMetadata, TomatoType};
    use starknet::{
        ContractAddress, get_caller_address, get_block_timestamp, get_contract_address
    };
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map, StorageMapReadAccess, StorageMapWriteAccess
    };
    use openzeppelin::access::ownable::OwnableComponent;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        
        // STRK 代币合约地址
        strk_token: ContractAddress,
        
        // Tomato NFT 合约地址
        tomato_nft_contract: ContractAddress,
        
        // 最小质押金额
        min_stake_amount: u256,
        
        // 用户番茄计数和索引映射
        user_tomato_count: Map<ContractAddress, u256>,
        user_tomato_at_index: Map<(ContractAddress, u256), u256>,
        
        // 番茄 ID 计数器
        next_tomato_id: u256,
        
        // 番茄所有者映射
        tomato_owner: Map<u256, ContractAddress>,
        
        // 浇水记录
        tomato_last_watered: Map<u256, u64>,
        
        // 收获奖励配置
        base_reward_per_stage: u256,
        
        // 种植期间的番茄元数据存储（未铸造NFT时）
        pending_tomato_metadata: Map<u256, TomatoMetadata>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        TomatoPlanted: TomatoPlanted,
        TomatoWatered: TomatoWatered,
        TomatoHarvested: TomatoHarvested,
        MinStakeAmountUpdated: MinStakeAmountUpdated,
        NFTContractUpdated: NFTContractUpdated,
        TomatoMutated: TomatoMutated,
    }

    #[derive(Drop, starknet::Event)]
    struct TomatoPlanted {
        #[key]
        user: ContractAddress,
        #[key]
        tomato_id: u256,
        stake_amount: u256,
        planted_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct TomatoWatered {
        #[key]
        user: ContractAddress,
        #[key]
        tomato_id: u256,
        watered_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct TomatoHarvested {
        #[key]
        user: ContractAddress,
        #[key]
        tomato_id: u256,
        reward_amount: u256,
        harvested_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct MinStakeAmountUpdated {
        old_amount: u256,
        new_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct NFTContractUpdated {
        #[key]
        old_contract: ContractAddress,
        #[key]
        new_contract: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct TomatoMutated {
        #[key]
        user: ContractAddress,
        #[key]
        tomato_id: u256,
        old_type: TomatoType,
        new_type: TomatoType,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        strk_token_address: ContractAddress,
        tomato_nft_contract: ContractAddress,
        owner: ContractAddress,
        min_stake_amount: u256,
        base_reward_per_stage: u256
    ) {
        // 初始化 Ownable
        self.ownable.initializer(owner);
        
        // 设置合约地址和参数
        self.strk_token.write(strk_token_address);
        self.tomato_nft_contract.write(tomato_nft_contract);
        self.min_stake_amount.write(min_stake_amount);
        self.base_reward_per_stage.write(base_reward_per_stage);
        
        // 初始化番茄 ID 计数器
        self.next_tomato_id.write(1);
    }

    #[abi(embed_v0)]
    impl TomatoStakingImpl of ITomatoStaking<ContractState> {
        fn plant_tomato(ref self: ContractState, stake_amount: u256) -> u256 {
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            
            // 检查最小质押金额
            assert(stake_amount >= self.min_stake_amount.read(), 'Stake amount too low');
            
            // 转移 STRK 代币到合约
            let strk_token = IERC20Dispatcher { contract_address: self.strk_token.read() };
            let success = strk_token.transfer_from(caller, starknet::get_contract_address(), stake_amount);
            assert(success, 'Transfer failed');
            
            // 生成新的番茄 ID
            let tomato_id = self.next_tomato_id.read();
            self.next_tomato_id.write(tomato_id + 1);
            
            // 创建番茄元数据，存储到pending状态（不铸造NFT）
            let metadata = TomatoMetadata {
                growth_stage: 0,
                planted_at: current_time,
                harvested_at: 0,
                staked_amount: stake_amount,
                tomato_type: TomatoType::Normal,
            };
            
            // 存储到pending元数据中，而不是铸造NFT
            self.pending_tomato_metadata.write(tomato_id, metadata);
            
            // 更新用户番茄记录
            let user_count = self.user_tomato_count.read(caller);
            self.user_tomato_at_index.write((caller, user_count), tomato_id);
            self.user_tomato_count.write(caller, user_count + 1);
            
            // 记录番茄所有者
            self.tomato_owner.write(tomato_id, caller);
            
            // 初始化浇水时间
            self.tomato_last_watered.write(tomato_id, current_time);
            
            // 发出事件
            self.emit(TomatoPlanted {
                user: caller,
                tomato_id,
                stake_amount,
                planted_at: current_time,
            });
            
            tomato_id
        }

        fn water_tomato(ref self: ContractState, tomato_id: u256) {
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            
            // 检查番茄所有权
            let owner = self.tomato_owner.read(tomato_id);
            assert(owner == caller, 'Not tomato owner');
            
            // 获取番茄元数据（从 pending 存储中）
            let mut metadata = self.pending_tomato_metadata.read(tomato_id);
            
            // 检查是否已收获
            assert(metadata.harvested_at == 0, 'Tomato already harvested');
            
            // 更新浇水时间
            self.tomato_last_watered.write(tomato_id, current_time);
            
            // 检查变异，只有Normal类型的番茄才能变异
            if metadata.tomato_type == TomatoType::Normal {
                let random_seed = tomato_id + current_time.into();
                let random_num = self._generate_random_number(random_seed);
                
                if self._should_mutate(random_num) {
                    let old_type = metadata.tomato_type;
                    let new_type = self._get_mutation_type(random_num);
                    
                    // 更新番茄类型（在pending存储中）
                    metadata.tomato_type = new_type;
                    self.pending_tomato_metadata.write(tomato_id, metadata);
                    
                    // 发出变异事件
                    self.emit(TomatoMutated {
                        user: caller,
                        tomato_id,
                        old_type,
                        new_type,
                    });
                }
            }
            
            // 发出浇水事件
            self.emit(TomatoWatered {
                user: caller,
                tomato_id,
                watered_at: current_time,
            });
        }

        fn harvest_tomato(ref self: ContractState, tomato_id: u256) -> u256 {
            let caller = get_caller_address();
            let current_time = get_block_timestamp();
            
            // 检查番茄所有权
            let owner = self.tomato_owner.read(tomato_id);
            assert(owner == caller, 'Not tomato owner');
            
            // 获取番茄元数据（从 pending 存储中）
            let metadata = self.pending_tomato_metadata.read(tomato_id);
            
            // 检查是否已收获
            assert(metadata.harvested_at == 0, 'Already harvested');
            
            // 获取当前成长阶段
            let current_stage = self.get_current_growth_stage(tomato_id);
            
            // 计算奖励
            let base_reward = self.base_reward_per_stage.read();
            let stage_multiplier: u256 = current_stage.into();
            let reward_amount = base_reward * stage_multiplier;
            
            // 转移奖励给用户
            let strk_token = IERC20Dispatcher { contract_address: self.strk_token.read() };
            let success = strk_token.transfer(caller, reward_amount);
            assert(success, 'Reward transfer failed');
            
            // 更新番茄元数据，设置收获时间和最终成长阶段
            let final_metadata = TomatoMetadata {
                growth_stage: current_stage,
                planted_at: metadata.planted_at,
                staked_amount: metadata.staked_amount,
                harvested_at: current_time,
                tomato_type: metadata.tomato_type,
            };
            
            // 在收获时铸造NFT
            let nft_contract = ITomatoNFTDispatcher { contract_address: self.tomato_nft_contract.read() };
            nft_contract.mint_tomato(caller, tomato_id, final_metadata);
            
            // 清理pending存储
            let empty_metadata = TomatoMetadata {
                growth_stage: 0,
                planted_at: 0,
                staked_amount: 0,
                harvested_at: 0,
                tomato_type: TomatoType::Normal,
            };
            self.pending_tomato_metadata.write(tomato_id, empty_metadata);
            
            // 发出事件
            self.emit(TomatoHarvested {
                user: caller,
                tomato_id,
                reward_amount,
                harvested_at: current_time,
            });
            
            reward_amount
        }

        fn get_user_tomato_count(self: @ContractState, user: ContractAddress) -> u256 {
            self.user_tomato_count.read(user)
        }

        fn get_user_tomato_at_index(self: @ContractState, user: ContractAddress, index: u256) -> u256 {
            self.user_tomato_at_index.read((user, index))
        }

        fn get_current_growth_stage(self: @ContractState, tomato_id: u256) -> u8 {
            // 获取 NFT 合约的成长周期配置
            let nft_contract = ITomatoNFTDispatcher { contract_address: self.tomato_nft_contract.read() };
            let (growth_time_per_stage, max_growth_stage) = nft_contract.get_growth_cycle_config();
            
            // 先检查pending存储中是否有该番茄（未收获状态）
            let pending_metadata = self.pending_tomato_metadata.read(tomato_id);
            
            let metadata = if pending_metadata.planted_at != 0 {
                // 如果在pending中找到，说明还未收获
                pending_metadata
            } else {
                // 否则从 NFT 合约中获取（已收获状态）
                nft_contract.get_tomato_metadata(tomato_id)
            };
            
            // 如果已收获，返回收获时的阶段
            if metadata.harvested_at != 0 {
                return metadata.growth_stage;
            }
            
            // 计算当前成长阶段，考虑浇水加速效果
            let current_time = get_block_timestamp();
            let time_elapsed = current_time - metadata.planted_at;
            
            // 检查是否浇过水，如果浇过水则从浇水时间开始计算加速效果
            let last_watered = self.tomato_last_watered.read(tomato_id);
            let mut effective_time_elapsed = time_elapsed;
            
            if last_watered != 0 && last_watered > metadata.planted_at {
                 // 浇水前的正常时间
                 let time_before_water = last_watered - metadata.planted_at;
                 // 浇水后的加速时间（3倍速度）
                 let time_after_water = current_time - last_watered;
                 effective_time_elapsed = time_before_water + (time_after_water * 3);
             }
            
            let stages_passed = effective_time_elapsed / growth_time_per_stage;
            let current_stage = metadata.growth_stage + stages_passed.try_into().unwrap_or(0);
            
            if current_stage > max_growth_stage {
                max_growth_stage
            } else {
                current_stage
            }
        }

        fn get_tomato_last_watered(self: @ContractState, tomato_id: u256) -> u64 {
            self.tomato_last_watered.read(tomato_id)
        }

        fn set_min_stake_amount(ref self: ContractState, amount: u256) {
            self.ownable.assert_only_owner();
            let old_amount = self.min_stake_amount.read();
            self.min_stake_amount.write(amount);
            
            self.emit(MinStakeAmountUpdated {
                old_amount,
                new_amount: amount,
            });
        }

        fn get_min_stake_amount(self: @ContractState) -> u256 {
            self.min_stake_amount.read()
        }

        fn set_tomato_nft_contract(ref self: ContractState, nft_contract: ContractAddress) {
            self.ownable.assert_only_owner();
            let old_contract = self.tomato_nft_contract.read();
            self.tomato_nft_contract.write(nft_contract);
            
            self.emit(NFTContractUpdated {
                old_contract,
                new_contract: nft_contract,
            });
        }

        fn get_tomato_nft_contract(self: @ContractState) -> ContractAddress {
            self.tomato_nft_contract.read()
        }

        fn get_tomato_type(self: @ContractState, tomato_id: u256) -> TomatoType {
            // 先检查pending存储中是否有该番茄（未收获状态）
            let pending_metadata = self.pending_tomato_metadata.read(tomato_id);
            
            if pending_metadata.planted_at != 0 {
                // 如果在pending中找到，说明还未收获
                pending_metadata.tomato_type
            } else {
                // 否则从 NFT 合约中获取（已收获状态）
                let nft_contract = ITomatoNFTDispatcher { contract_address: self.tomato_nft_contract.read() };
                nft_contract.get_tomato_type(tomato_id)
            }
        }
        
        fn get_tomato_metadata(self: @ContractState, tomato_id: u256) -> TomatoMetadata {
            // 先检查pending存储中是否有该番茄（未收获状态）
            let pending_metadata = self.pending_tomato_metadata.read(tomato_id);
            
            if pending_metadata.planted_at != 0 {
                // 如果在pending中找到，说明还未收获，返回实时计算的数据
                let current_stage = self.get_current_growth_stage(tomato_id);
                TomatoMetadata {
                    growth_stage: current_stage,
                    planted_at: pending_metadata.planted_at,
                    harvested_at: 0, // 未收获
                    staked_amount: pending_metadata.staked_amount,
                    tomato_type: pending_metadata.tomato_type,
                }
            } else {
                // 否则从 NFT 合约中获取（已收获状态）
                let nft_contract = ITomatoNFTDispatcher { contract_address: self.tomato_nft_contract.read() };
                nft_contract.get_tomato_metadata(tomato_id)
            }
        }
        
        fn is_tomato_harvested(self: @ContractState, tomato_id: u256) -> bool {
            // 先检查pending存储中是否有该番茄
            let pending_metadata = self.pending_tomato_metadata.read(tomato_id);
            
            if pending_metadata.planted_at != 0 {
                // 如果在pending中找到，说明还未收获
                false
            } else {
                // 否则说明已经收获并清理了pending存储
                true
            }
        }

        // 管理员功能：更新每阶段基础奖励
        fn update_base_reward_per_stage(ref self: ContractState, new_base_reward: u256) {
            self.ownable.assert_only_owner();
            self.base_reward_per_stage.write(new_base_reward);
        }

        // 获取当前每阶段基础奖励
        fn get_base_reward_per_stage(self: @ContractState) -> u256 {
            self.base_reward_per_stage.read()
        }

        // 管理员功能：提取合约中的STRK代币
        fn withdraw_strk(ref self: ContractState, amount: u256) {
            self.ownable.assert_only_owner();
            let strk_token = IERC20Dispatcher { contract_address: self.strk_token.read() };
            let success = strk_token.transfer(get_caller_address(), amount);
            assert(success, 'Withdrawal failed');
        }

        // 获取合约STRK余额
        fn get_contract_strk_balance(self: @ContractState) -> u256 {
            let strk_token = IERC20Dispatcher { contract_address: self.strk_token.read() };
            strk_token.balance_of(get_contract_address())
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _generate_random_number(self: @ContractState, seed: u256) -> u256 {
            // 使用多个区块链参数生成伪随机数
            let block_timestamp = get_block_timestamp();
            
            // 组合多个值来生成随机数
            let combined = seed + block_timestamp.into();
            combined % 1000 // 返回0-999的随机数
        }

        fn _get_mutation_type(self: @ContractState, random_num: u256) -> TomatoType {
            // 根据随机数范围确定变异类型
            if random_num < 200 {
                TomatoType::Yellow
            } else if random_num < 400 {
                TomatoType::Purple
            } else if random_num < 600 {
                TomatoType::Flame
            } else if random_num < 800 {
                TomatoType::Ice
            } else {
                TomatoType::Rainbow
            }
        }

        fn _should_mutate(self: @ContractState, random_num: u256) -> bool {
            // 5% 的概率发生变异
            random_num < 50
        }
    }
}
use starknet::ContractAddress;

#[derive(Drop, Copy, Serde, starknet::Store, PartialEq)]
pub enum TomatoType {
    #[default]
    Normal,
    Yellow,
    Purple,
    Flame,
    Ice,
    Rainbow,
}

#[derive(Drop, Copy, Serde, starknet::Store)]
pub struct TomatoMetadata {
    pub growth_stage: u8,
    pub planted_at: u64,
    pub harvested_at: u64,
    pub staked_amount: u256,
    pub tomato_type: TomatoType,
}

#[starknet::interface]
pub trait ITomatoNFT<TContractState> {
    // ERC721 标准函数通过 OpenZeppelin 组件自动提供
    
    // 自定义函数
    fn mint_tomato(ref self: TContractState, to: ContractAddress, tomato_id: u256, metadata: TomatoMetadata);
    fn get_tomato_metadata(self: @TContractState, token_id: u256) -> TomatoMetadata;
    fn update_tomato_metadata(ref self: TContractState, token_id: u256, metadata: TomatoMetadata);
    fn set_growth_cycle_config(ref self: TContractState, growth_time_per_stage: u64, max_growth_stage: u8);
    fn get_growth_cycle_config(self: @TContractState) -> (u64, u8);
    fn update_base_uri(ref self: TContractState, new_base_uri: ByteArray);
    fn set_authorized_minter(ref self: TContractState, minter: ContractAddress);
    fn get_tomato_type(self: @TContractState, token_id: u256) -> TomatoType;
    
    // 重写tokenURI函数以根据TomatoType返回不同的URI
    fn token_uri(self: @TContractState, token_id: u256) -> ByteArray;
    
    // ERC721Metadata 函数
    fn name(self: @TContractState) -> ByteArray;
    fn symbol(self: @TContractState) -> ByteArray;
}

#[starknet::contract]
mod TomatoNFT {
    use super::{ITomatoNFT, TomatoMetadata, TomatoType};
    use starknet::{
        ContractAddress, get_caller_address
    };
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, Map, StorageMapReadAccess, StorageMapWriteAccess
    };
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use openzeppelin::access::ownable::OwnableComponent;

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    // ERC721 - 手动实现以自定义tokenURI
    #[abi(embed_v0)]
    impl ERC721Impl = ERC721Component::ERC721Impl<ContractState>;
    // 注意：我们不嵌入ERC721MetadataImpl，因为我们要自定义token_uri
    #[abi(embed_v0)]  
    impl ERC721CamelOnlyImpl = ERC721Component::ERC721CamelOnlyImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;
    impl ERC721HooksImpl = ERC721HooksEmptyImpl<ContractState>;
    impl SRC5InternalImpl = SRC5Component::InternalImpl<ContractState>;
    
    // Ownable Mixin
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        
        // NFT 元数据
        tomato_metadata: Map<u256, TomatoMetadata>,
        
        // 成长周期配置
        growth_time_per_stage: u64,
        max_growth_stage: u8,
        
        // 授权的铸造者（通常是 TomatoStaking 合约）
        authorized_minter: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        TomatoMinted: TomatoMinted,
        GrowthCycleUpdated: GrowthCycleUpdated,
        MinterUpdated: MinterUpdated,
        TomatoMutated: TomatoMutated,
    }

    #[derive(Drop, starknet::Event)]
    struct TomatoMinted {
        #[key]
        to: ContractAddress,
        #[key]
        token_id: u256,
        growth_stage: u8,
        staked_amount: u256,
        tomato_type: TomatoType,
    }

    #[derive(Drop, starknet::Event)]
    struct GrowthCycleUpdated {
        growth_time_per_stage: u64,
        max_growth_stage: u8,
    }

    #[derive(Drop, starknet::Event)]
    struct MinterUpdated {
        #[key]
        old_minter: ContractAddress,
        #[key]
        new_minter: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct TomatoMutated {
        #[key]
        token_id: u256,
        old_type: TomatoType,
        new_type: TomatoType,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: ByteArray,
        symbol: ByteArray,
        base_uri: ByteArray,
        owner: ContractAddress,
        authorized_minter: ContractAddress,
        growth_time_per_stage: u64,
        max_growth_stage: u8
    ) {
        // 初始化 ERC721
        self.erc721.initializer(name, symbol, base_uri);
        
        // 初始化 Ownable
        self.ownable.initializer(owner);
        
        // 设置成长周期配置
        self.growth_time_per_stage.write(growth_time_per_stage);
        self.max_growth_stage.write(max_growth_stage);
        
        // 设置授权铸造者
        self.authorized_minter.write(authorized_minter);
    }

    #[abi(embed_v0)]
    impl TomatoNFTImpl of ITomatoNFT<ContractState> {
        fn mint_tomato(ref self: ContractState, to: ContractAddress, tomato_id: u256, metadata: TomatoMetadata) {
            // 只有授权的铸造者可以铸造
            let caller = get_caller_address();
            assert(caller == self.authorized_minter.read(), 'Unauthorized minter');
            
            // 铸造 NFT
            self.erc721.mint(to, tomato_id);
            
            // 存储元数据
            self.tomato_metadata.write(tomato_id, metadata);
            
            // 发出事件
            self.emit(TomatoMinted {
                to,
                token_id: tomato_id,
                growth_stage: metadata.growth_stage,
                staked_amount: metadata.staked_amount,
                tomato_type: metadata.tomato_type
            });
        }

        fn get_tomato_metadata(self: @ContractState, token_id: u256) -> TomatoMetadata {
            // 确保 NFT 存在
            assert(self.erc721.exists(token_id), 'Token does not exist');
            self.tomato_metadata.read(token_id)
        }

        fn update_tomato_metadata(ref self: ContractState, token_id: u256, metadata: TomatoMetadata) {
            // 只有授权的铸造者可以更新元数据
            let caller = get_caller_address();
            assert(caller == self.authorized_minter.read(), 'Unauthorized minter');
            
            // 确保 NFT 存在
            assert(self.erc721.exists(token_id), 'Token does not exist');
            
            // 更新元数据
            self.tomato_metadata.write(token_id, metadata);
        }

        fn set_growth_cycle_config(ref self: ContractState, growth_time_per_stage: u64, max_growth_stage: u8) {
            // 只有所有者可以设置
            self.ownable.assert_only_owner();
            
            self.growth_time_per_stage.write(growth_time_per_stage);
            self.max_growth_stage.write(max_growth_stage);
            
            self.emit(GrowthCycleUpdated {
                growth_time_per_stage,
                max_growth_stage
            });
        }

        fn get_growth_cycle_config(self: @ContractState) -> (u64, u8) {
            (
                self.growth_time_per_stage.read(),
                self.max_growth_stage.read()
            )
        }

        fn update_base_uri(ref self: ContractState, new_base_uri: ByteArray) {
            self.ownable.assert_only_owner();
            self.erc721._set_base_uri(new_base_uri);
        }

        fn set_authorized_minter(ref self: ContractState, minter: ContractAddress) {
            self.ownable.assert_only_owner();
            let old_minter = self.authorized_minter.read();
            self.authorized_minter.write(minter);
            
            self.emit(MinterUpdated {
                old_minter,
                new_minter: minter
            });
        }

        fn get_tomato_type(self: @ContractState, token_id: u256) -> TomatoType {
            // 确保 NFT 存在
            assert(self.erc721.exists(token_id), 'Token does not exist');
            let metadata = self.tomato_metadata.read(token_id);
            metadata.tomato_type
        }

        fn token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            // 确保 NFT 存在
            assert(self.erc721.exists(token_id), 'Token does not exist');
            
            // 获取番茄类型
            let metadata = self.tomato_metadata.read(token_id);
            let tomato_type = metadata.tomato_type;
            
            // 获取base_uri
            let base_uri = self.erc721.ERC721_base_uri.read();
            
            // 根据番茄类型获取对应的JSON文件名
            let filename = match tomato_type {
                TomatoType::Normal => "normal.json",
                TomatoType::Yellow => "yellow.json", 
                TomatoType::Purple => "purple.json",
                TomatoType::Flame => "flame.json",
                TomatoType::Ice => "ice.json",
                TomatoType::Rainbow => "rainbow.json",
            };
            
            // 拼接base_uri和文件名
            let mut uri = base_uri;
            uri.append(@filename);
            uri
        }

        fn name(self: @ContractState) -> ByteArray {
            self.erc721.ERC721_name.read()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.erc721.ERC721_symbol.read()
        }
    }
}
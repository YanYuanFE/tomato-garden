#[cfg(test)]
mod tests {
    use starknet::ContractAddress;
    use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};
    use openzeppelin::utils::serde::SerializedAppend;
    use tomato_garden::{ITomatoNFTDispatcher, ITomatoNFTDispatcherTrait, TomatoMetadata, TomatoType};
    use openzeppelin::token::erc721::interface::{IERC721MetadataDispatcher, IERC721MetadataDispatcherTrait};

    fn OWNER() -> ContractAddress {
        'OWNER'.try_into().unwrap()
    }

    fn USER1() -> ContractAddress {
        'USER1'.try_into().unwrap()
    }

    fn deploy_tomato_nft() -> ITomatoNFTDispatcher {
        let contract = declare("TomatoNFT").unwrap().contract_class();
        
        let mut constructor_calldata = array![];
        let name: ByteArray = "Tomato NFT";
        let symbol: ByteArray = "TOMATO";
        let base_uri: ByteArray = "https://api.tomato.garden/metadata/";
        constructor_calldata.append_serde(name);
        constructor_calldata.append_serde(symbol);
        constructor_calldata.append_serde(base_uri);
        constructor_calldata.append_serde(OWNER());
        constructor_calldata.append_serde(OWNER());
        constructor_calldata.append_serde(86400_u64);
        constructor_calldata.append_serde(5_u8);
        
        let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
        ITomatoNFTDispatcher { contract_address }
    }

    #[test]
    fn test_basic_deployment() {
        let nft_contract = deploy_tomato_nft();
        let metadata_contract = IERC721MetadataDispatcher { contract_address: nft_contract.contract_address };
        
        // 验证合约部署成功
        let name = metadata_contract.name();
        assert(name == "Tomato NFT", 'Wrong name');
        
        let symbol = metadata_contract.symbol();
        assert(symbol == "TOMATO", 'Wrong symbol');
    }

    #[test]
    fn test_nft_mint_success() {
        let nft_contract = deploy_tomato_nft();
        
        let token_id: u256 = 1;
        let metadata = TomatoMetadata {
            growth_stage: 0,
            planted_at: 0,
            harvested_at: 0,
            staked_amount: 1000000000000000000, // 1 STRK
            tomato_type: TomatoType::Normal,
        };
        
        start_cheat_caller_address(nft_contract.contract_address, OWNER());
        nft_contract.mint_tomato(USER1(), token_id, metadata);
        stop_cheat_caller_address(nft_contract.contract_address);
        
        // 验证NFT铸造成功
        let retrieved_metadata = nft_contract.get_tomato_metadata(token_id);
        assert(retrieved_metadata.growth_stage == 0, 'Wrong growth stage');
        assert(retrieved_metadata.planted_at == 0, 'Wrong planted time');
        assert(retrieved_metadata.staked_amount == 1000000000000000000, 'Wrong staked amount');
    }
}
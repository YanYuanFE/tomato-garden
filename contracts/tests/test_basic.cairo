#[cfg(test)]
mod tests {
    use starknet::ContractAddress;
    use snforge_std::{declare, ContractClassTrait, DeclareResultTrait};
    use openzeppelin::utils::serde::SerializedAppend;
    use openzeppelin::token::erc721::interface::{IERC721MetadataDispatcher, IERC721MetadataDispatcherTrait};

    fn OWNER() -> ContractAddress {
        'OWNER'.try_into().unwrap()
    }

    #[test]
    fn test_basic_deployment() {
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
        let metadata_contract = IERC721MetadataDispatcher { contract_address };
        
        // 验证合约部署成功
        let name = metadata_contract.name();
        assert(name == "Tomato NFT", 'Wrong name');
    }
}
#!/bin/bash

# 测试tokenURI功能的脚本

NFT_CONTRACT="0x02a2f997b2362468379083841561ddc7f5e5f73fafd581a491ace8922e071a6f"
USER_ADDRESS="0x3d58edcfaf9db330ca1b3b4600bd79cda4003d1b3dd06abe3667290025ee11d"

echo "🧪 测试新的TokenURI功能..."
echo "NFT合约地址: $NFT_CONTRACT"
echo ""

# 测试不同类型的番茄
declare -a tomato_types=("Normal" "Yellow" "Purple" "Flame" "Ice" "Rainbow")

for i in {0..5}; do
    tomato_id=$((i + 1))
    tomato_type=$i
    type_name=${tomato_types[$i]}
    
    echo "🍅 铸造 $type_name 番茄 (ID: $tomato_id, Type: $tomato_type)..."
    
    # 铸造NFT - TomatoMetadata: growth_stage, planted_at, harvested_at, staked_amount, tomato_type
    # 参数: to, tomato_id, metadata(growth_stage, planted_at, harvested_at, staked_amount_low, staked_amount_high, tomato_type)
    sncast --profile new_account invoke \
        --contract-address $NFT_CONTRACT \
        --function mint_tomato \
        --calldata $USER_ADDRESS $tomato_id 4 1000 0 1000000000000000000 0 $tomato_type \
        2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ NFT $tomato_id 铸造成功"
        
        # 等待交易确认
        sleep 2
        
        # 查询tokenURI
        echo "📋 查询TokenURI..."
        TOKEN_URI=$(sncast --profile new_account call \
            --contract-address $NFT_CONTRACT \
            --function token_uri \
            --calldata $tomato_id 2>/dev/null | grep "response:" | cut -d'"' -f2)
        
        if [ ! -z "$TOKEN_URI" ]; then
            echo "🎯 TokenURI: $TOKEN_URI"
        else
            echo "❌ 无法获取TokenURI"
        fi
    else
        echo "❌ NFT $tomato_id 铸造失败"
    fi
    
    echo ""
done

echo "🎉 测试完成！"
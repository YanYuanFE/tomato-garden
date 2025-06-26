#!/bin/bash

# Tomato Garden 合约交互脚本
# 使用方法: ./scripts/interact.sh <action> [parameters...]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 帮助函数
show_help() {
    echo -e "${BLUE}🍅 Tomato Garden 合约交互工具${NC}"
    echo ""
    echo "使用方法: $0 <action> [parameters...]"
    echo ""
    echo "可用操作:"
    echo "  plant <profile> <contract_address> <amount>     - 种植番茄"
    echo "  water <profile> <contract_address> <tomato_id> - 浇水"
    echo "  harvest <profile> <contract_address> <tomato_id> - 收获番茄"
    echo "  info <profile> <contract_address> <tomato_id>  - 查看番茄信息"
    echo "  stage <profile> <contract_address> <tomato_id> - 查看成长阶段"
    echo "  type <profile> <contract_address> <tomato_id>  - 查看番茄类型"
    echo "  metadata <profile> <nft_address> <tomato_id>   - 查看完整元数据"
    echo "  list <profile> <contract_address> <user_address> - 查看用户番茄列表"
    echo "  min-stake <profile> <contract_address>         - 查看最小质押金额"
    echo "  approve <profile> <strk_address> <contract_address> <amount> - 授权STRK代币"
    echo ""
    echo "示例:"
    echo "  $0 plant new_account 0x123... 2000000000000000000"
    echo "  $0 water new_account 0x123... 1"
    echo "  $0 type new_account 0x123... 1"
    echo "  $0 info new_account 0x123... 1"
    echo ""
    echo "注意: amount 以 wei 为单位 (1 STRK = 1000000000000000000 wei)"
    echo "profile 是在 snfoundry.toml 中配置的账户配置名称"
}

# 检查参数
if [ $# -lt 1 ]; then
    show_help
    exit 1
fi

ACTION=$1

# 工具函数
convert_amount_to_felt() {
    local amount=$1
    local low=$(python3 -c "print(hex($amount & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF))")
    local high=$(python3 -c "print(hex($amount >> 128))")
    echo "$low $high"
}

format_wei_to_strk() {
    local wei=$1
    python3 -c "print(f'{$wei / 1e18:.6f} STRK')"
}

format_tomato_type() {
    local type_num=$1
    case $type_num in
        0) echo "🍅 Normal (普通)" ;;
        1) echo "🟡 Yellow (黄色)" ;;
        2) echo "🟣 Purple (紫色)" ;;
        3) echo "🔥 Flame (火焰)" ;;
        4) echo "❄️ Ice (冰霜)" ;;
        5) echo "🌈 Rainbow (彩虹)" ;;
        *) echo "❓ Unknown (未知: $type_num)" ;;
    esac
}

case $ACTION in
    "plant")
        if [ $# -ne 4 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 plant <profile> <contract_address> <amount>"
            exit 1
        fi
        
        PROFILE=$2
        CONTRACT_ADDRESS=$3
        AMOUNT=$4
        
        echo -e "${YELLOW}🌱 种植番茄...${NC}"
        echo "Profile: $PROFILE"
        echo "合约地址: $CONTRACT_ADDRESS"
        echo "质押金额: $(format_wei_to_strk $AMOUNT)"
        echo ""
        
        AMOUNT_PARTS=$(convert_amount_to_felt $AMOUNT)
        
        echo "执行交易..."
        sncast --profile $PROFILE invoke --contract-address $CONTRACT_ADDRESS --function plant_tomato --calldata $AMOUNT_PARTS
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 番茄种植成功!${NC}"
        else
            echo -e "${RED}❌ 番茄种植失败${NC}"
            exit 1
        fi
        ;;
        
    "water")
        if [ $# -ne 4 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 water <network> <contract_address> <tomato_id>"
            exit 1
        fi
        
        NETWORK=$2
        CONTRACT_ADDRESS=$3
        TOMATO_ID=$4
        
        echo -e "${BLUE}💧 浇水中...${NC}"
        echo "网络: $NETWORK"
        echo "合约地址: $CONTRACT_ADDRESS"
        echo "番茄ID: $TOMATO_ID"
        echo ""
        
        # 检查浇水前的类型
        TYPE_BEFORE=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_tomato_type --calldata $TOMATO_ID 2>/dev/null | grep -o '[0-9]*' | head -1)
        
        sncast --url $NETWORK invoke --contract-address $CONTRACT_ADDRESS --function water_tomato --calldata $TOMATO_ID
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 浇水成功!${NC}"
            
            # 检查是否发生变异
            sleep 2
            TYPE_AFTER=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_tomato_type --calldata $TOMATO_ID 2>/dev/null | grep -o '[0-9]*' | head -1)
            
            if [ "$TYPE_BEFORE" != "$TYPE_AFTER" ] && [ ! -z "$TYPE_AFTER" ]; then
                echo -e "${YELLOW}🎉 恭喜！番茄发生了变异！${NC}"
                echo -e "从 $(format_tomato_type $TYPE_BEFORE) 变异为 $(format_tomato_type $TYPE_AFTER)"
            else
                echo -e "${BLUE}💡 提示: 每次浇水都有5%的概率发生变异 (仅限Normal类型)${NC}"
            fi
        else
            echo -e "${RED}❌ 浇水失败${NC}"
            exit 1
        fi
        ;;
        
    "harvest")
        if [ $# -ne 4 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 harvest <network> <contract_address> <tomato_id>"
            exit 1
        fi
        
        NETWORK=$2
        CONTRACT_ADDRESS=$3
        TOMATO_ID=$4
        
        echo -e "${GREEN}🍅 收获番茄...${NC}"
        echo "网络: $NETWORK"
        echo "合约地址: $CONTRACT_ADDRESS"
        echo "番茄ID: $TOMATO_ID"
        echo ""
        
        sncast --url $NETWORK invoke --contract-address $CONTRACT_ADDRESS --function harvest_tomato --calldata $TOMATO_ID
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 番茄收获成功! NFT已铸造到您的账户${NC}"
        else
            echo -e "${RED}❌ 番茄收获失败${NC}"
            exit 1
        fi
        ;;
        
    "info")
        if [ $# -ne 4 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 info <network> <contract_address> <tomato_id>"
            exit 1
        fi
        
        NETWORK=$2
        CONTRACT_ADDRESS=$3
        TOMATO_ID=$4
        
        echo -e "${BLUE}📋 查询番茄信息...${NC}"
        echo "番茄ID: $TOMATO_ID"
        echo ""
        
        RESULT=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_tomato --calldata $TOMATO_ID)
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}📊 番茄信息:${NC}"
            echo "$RESULT"
        else
            echo -e "${RED}❌ 查询失败${NC}"
            exit 1
        fi
        ;;
        
    "stage")
        if [ $# -ne 4 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 stage <network> <contract_address> <tomato_id>"
            exit 1
        fi
        
        NETWORK=$2
        CONTRACT_ADDRESS=$3
        TOMATO_ID=$4
        
        echo -e "${BLUE}🌿 查询成长阶段...${NC}"
        echo "番茄ID: $TOMATO_ID"
        echo ""
        
        STAGE=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_current_growth_stage --calldata $TOMATO_ID)
        
        if [ $? -eq 0 ]; then
            STAGE_NUM=$(echo $STAGE | grep -o '[0-9]*' | head -1)
            case $STAGE_NUM in
                0) STAGE_DESC="🌱 种子期" ;;
                1) STAGE_DESC="🌿 幼苗期" ;;
                2) STAGE_DESC="🍃 成长期" ;;
                3) STAGE_DESC="🌺 开花期" ;;
                4) STAGE_DESC="🍅 成熟期 (可收获)" ;;
                *) STAGE_DESC="未知阶段" ;;
            esac
            
            echo -e "${GREEN}当前成长阶段: $STAGE_NUM - $STAGE_DESC${NC}"
        else
            echo -e "${RED}❌ 查询失败${NC}"
            exit 1
        fi
        ;;
        
    "type")
        if [ $# -ne 4 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 type <profile> <contract_address> <tomato_id>"
            exit 1
        fi
        
        PROFILE=$2
        CONTRACT_ADDRESS=$3
        TOMATO_ID=$4
        
        echo -e "${BLUE}🎨 查询番茄类型...${NC}"
        echo "番茄ID: $TOMATO_ID"
        echo ""
        
        TYPE_RESULT=$(sncast --profile $PROFILE call --contract-address $CONTRACT_ADDRESS --function get_tomato_type --calldata $TOMATO_ID 2>&1)
        
        if [ $? -eq 0 ]; then
            TYPE_NUM=$(echo $TYPE_RESULT | grep -o '[0-9]*' | head -1)
            TYPE_DESC=$(format_tomato_type $TYPE_NUM)
            
            echo -e "${GREEN}番茄类型: $TYPE_DESC${NC}"
            
            # 如果是Normal类型，显示变异提示
            if [ "$TYPE_NUM" = "0" ]; then
                echo -e "${YELLOW}💡 这是普通番茄，浇水时有机会变异为特殊类型！${NC}"
            else
                echo -e "${BLUE}✨ 这是特殊变异番茄，非常珍贵！${NC}"
            fi
        else
            echo -e "${RED}❌ 查询失败: $TYPE_RESULT${NC}"
            exit 1
        fi
        ;;
        
    "metadata")
        if [ $# -ne 4 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 metadata <network> <nft_address> <tomato_id>"
            exit 1
        fi
        
        NETWORK=$2
        NFT_ADDRESS=$3
        TOMATO_ID=$4
        
        echo -e "${BLUE}📊 查询完整元数据...${NC}"
        echo "NFT合约地址: $NFT_ADDRESS"
        echo "番茄ID: $TOMATO_ID"
        echo ""
        
        METADATA_RESULT=$(sncast --url $NETWORK call --contract-address $NFT_ADDRESS --function get_tomato_metadata --calldata $TOMATO_ID 2>&1)
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}📋 完整元数据:${NC}"
            echo "$METADATA_RESULT"
            echo ""
            
            # 尝试解析并格式化输出
            TYPE_NUM=$(echo $METADATA_RESULT | grep -o '[0-9]*' | tail -1)
            if [ ! -z "$TYPE_NUM" ]; then
                echo -e "${BLUE}番茄类型: $(format_tomato_type $TYPE_NUM)${NC}"
            fi
        else
            echo -e "${RED}❌ 查询失败: $METADATA_RESULT${NC}"
            exit 1
        fi
        ;;
        
    "list")
        if [ $# -ne 4 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 list <network> <contract_address> <user_address>"
            exit 1
        fi
        
        NETWORK=$2
        CONTRACT_ADDRESS=$3
        USER_ADDRESS=$4
        
        echo -e "${BLUE}📋 查询用户番茄列表...${NC}"
        echo "用户地址: $USER_ADDRESS"
        echo ""
        
        RESULT=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_user_tomatoes --calldata $USER_ADDRESS)
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}🍅 用户番茄列表:${NC}"
            echo "$RESULT"
        else
            echo -e "${RED}❌ 查询失败${NC}"
            exit 1
        fi
        ;;
        
    "min-stake")
        if [ $# -ne 3 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 min-stake <profile> <contract_address>"
            exit 1
        fi
        
        PROFILE=$2
        CONTRACT_ADDRESS=$3
        
        echo -e "${BLUE}💰 查询最小质押金额...${NC}"
        echo ""
        
        RESULT=$(sncast --profile $PROFILE call --contract-address $CONTRACT_ADDRESS --function get_min_stake_amount)
        
        if [ $? -eq 0 ]; then
            MIN_STAKE=$(echo $RESULT | grep -o '[0-9]*' | head -1)
            echo -e "${GREEN}最小质押金额: $(format_wei_to_strk $MIN_STAKE)${NC}"
        else
            echo -e "${RED}❌ 查询失败${NC}"
            exit 1
        fi
        ;;
        
    "approve")
        if [ $# -ne 5 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 approve <network> <strk_address> <contract_address> <amount>"
            exit 1
        fi
        
        NETWORK=$2
        STRK_ADDRESS=$3
        CONTRACT_ADDRESS=$4
        AMOUNT=$5
        
        echo -e "${YELLOW}✅ 授权STRK代币...${NC}"
        echo "网络: $NETWORK"
        echo "STRK地址: $STRK_ADDRESS"
        echo "合约地址: $CONTRACT_ADDRESS"
        echo "授权金额: $(format_wei_to_strk $AMOUNT)"
        echo ""
        
        AMOUNT_PARTS=$(convert_amount_to_felt $AMOUNT)
        
        sncast --url $NETWORK invoke --contract-address $STRK_ADDRESS --function approve --calldata $CONTRACT_ADDRESS $AMOUNT_PARTS
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ STRK代币授权成功!${NC}"
            echo -e "${YELLOW}💡 现在您可以种植番茄了${NC}"
        else
            echo -e "${RED}❌ 授权失败${NC}"
            exit 1
        fi
        ;;
        
    "help" | "-h" | "--help")
        show_help
        ;;
        
    *)
        echo -e "${RED}❌ 未知操作: $ACTION${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
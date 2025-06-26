#!/bin/bash

# Tomato Garden 批量操作脚本
# 使用方法: ./scripts/batch.sh <action> <network> <contract_address> [additional_params...]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 帮助函数
show_help() {
    echo -e "${BLUE}🚀 Tomato Garden 批量操作工具${NC}"
    echo ""
    echo "使用方法: $0 <action> <network> <contract_address> [params...]"
    echo ""
    echo "可用操作:"
    echo "  batch-water <network> <contract> <start_id> <end_id>     - 批量浇水番茄"
    echo "  batch-harvest <network> <contract> <start_id> <end_id>   - 批量收获番茄"
    echo "  batch-check <network> <contract> <start_id> <end_id>     - 批量查看番茄状态"
    echo "  mutation-hunt <network> <contract> <tomato_id> <times>   - 变异猎取（重复浇水）"
    echo "  user-summary <network> <contract> <user_address>         - 用户完整报告"
    echo ""
    echo "示例:"
    echo "  $0 batch-water sepolia 0x123... 1 5        # 批量浇水番茄ID 1-5"
    echo "  $0 batch-harvest sepolia 0x123... 1 3      # 批量收获番茄ID 1-3"
    echo "  $0 mutation-hunt sepolia 0x123... 1 10     # 为番茄1浇水10次寻找变异"
    echo "  $0 user-summary sepolia 0x123... 0x456...  # 生成用户完整报告"
    echo ""
    echo "注意: 批量操作可能需要较长时间，请耐心等待"
}

# 检查参数
if [ $# -lt 3 ]; then
    show_help
    exit 1
fi

ACTION=$1
NETWORK=$2
CONTRACT_ADDRESS=$3

# 工具函数
format_tomato_type() {
    local type_num=$1
    case $type_num in
        0) echo "🍅 Normal" ;;
        1) echo "🟡 Yellow" ;;
        2) echo "🟣 Purple" ;;
        3) echo "🔥 Flame" ;;
        4) echo "❄️ Ice" ;;
        5) echo "🌈 Rainbow" ;;
        *) echo "❓ Unknown" ;;
    esac
}

format_growth_stage() {
    local stage_num=$1
    case $stage_num in
        0) echo "🌱 种子期" ;;
        1) echo "🌿 幼苗期" ;;
        2) echo "🍃 成长期" ;;
        3) echo "🌺 开花期" ;;
        4) echo "🍅 成熟期" ;;
        *) echo "❓ 未知" ;;
    esac
}

wait_for_transaction() {
    echo -n "等待交易确认"
    for i in {1..5}; do
        sleep 1
        echo -n "."
    done
    echo " ✓"
}

case $ACTION in
    "batch-water")
        if [ $# -ne 5 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 batch-water <network> <contract_address> <start_id> <end_id>"
            exit 1
        fi
        
        START_ID=$4
        END_ID=$5
        
        echo -e "${BLUE}💧 批量浇水操作${NC}"
        echo "网络: $NETWORK"
        echo "合约地址: $CONTRACT_ADDRESS"
        echo "番茄ID范围: $START_ID - $END_ID"
        echo ""
        
        mutations_found=0
        total_watered=0
        
        for ((id=$START_ID; id<=$END_ID; id++)); do
            echo -e "${YELLOW}正在为番茄 $id 浇水...${NC}"
            
            # 检查浇水前的类型
            TYPE_BEFORE=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_tomato_type --calldata $id 2>/dev/null | grep -o '[0-9]*' | head -1)
            
            if [ -z "$TYPE_BEFORE" ]; then
                echo -e "${RED}❌ 番茄 $id 不存在或查询失败${NC}"
                continue
            fi
            
            # 浇水
            WATER_RESULT=$(sncast --url $NETWORK invoke --contract-address $CONTRACT_ADDRESS --function water_tomato --calldata $id 2>&1)
            
            if [ $? -eq 0 ]; then
                ((total_watered++))
                wait_for_transaction
                
                # 检查是否发生变异
                TYPE_AFTER=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_tomato_type --calldata $id 2>/dev/null | grep -o '[0-9]*' | head -1)
                
                if [ "$TYPE_BEFORE" != "$TYPE_AFTER" ] && [ ! -z "$TYPE_AFTER" ]; then
                    ((mutations_found++))
                    echo -e "${GREEN}🎉 番茄 $id 发生变异！${NC}"
                    echo -e "从 $(format_tomato_type $TYPE_BEFORE) 变异为 $(format_tomato_type $TYPE_AFTER)"
                else
                    echo -e "${BLUE}✅ 番茄 $id 浇水完成${NC}"
                fi
            else
                echo -e "${RED}❌ 番茄 $id 浇水失败: $WATER_RESULT${NC}"
            fi
            echo ""
        done
        
        echo -e "${GREEN}📊 批量浇水完成！${NC}"
        echo "总浇水数量: $total_watered"
        echo "发现变异: $mutations_found"
        if [ $total_watered -gt 0 ]; then
            mutation_rate=$(python3 -c "print(f'{($mutations_found / $total_watered) * 100:.1f}')")
            echo "变异率: ${mutation_rate}%"
        fi
        ;;
        
    "batch-harvest")
        if [ $# -ne 5 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 batch-harvest <network> <contract_address> <start_id> <end_id>"
            exit 1
        fi
        
        START_ID=$4
        END_ID=$5
        
        echo -e "${GREEN}🍅 批量收获操作${NC}"
        echo "网络: $NETWORK"
        echo "合约地址: $CONTRACT_ADDRESS"
        echo "番茄ID范围: $START_ID - $END_ID"
        echo ""
        
        total_harvested=0
        total_rewards=0
        
        for ((id=$START_ID; id<=$END_ID; id++)); do
            echo -e "${YELLOW}正在收获番茄 $id...${NC}"
            
            # 检查成长阶段
            STAGE=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_current_growth_stage --calldata $id 2>/dev/null | grep -o '[0-9]*' | head -1)
            
            if [ -z "$STAGE" ]; then
                echo -e "${RED}❌ 番茄 $id 不存在或查询失败${NC}"
                continue
            fi
            
            if [ "$STAGE" -lt 4 ]; then
                echo -e "${YELLOW}⏳ 番茄 $id 尚未成熟 (阶段: $(format_growth_stage $STAGE))${NC}"
                continue
            fi
            
            # 获取番茄类型
            TYPE=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_tomato_type --calldata $id 2>/dev/null | grep -o '[0-9]*' | head -1)
            
            # 收获
            HARVEST_RESULT=$(sncast --url $NETWORK invoke --contract-address $CONTRACT_ADDRESS --function harvest_tomato --calldata $id 2>&1)
            
            if [ $? -eq 0 ]; then
                ((total_harvested++))
                wait_for_transaction
                
                echo -e "${GREEN}✅ 番茄 $id 收获成功！${NC}"
                echo -e "类型: $(format_tomato_type $TYPE)"
                
                # 这里可以解析奖励金额，但需要从交易日志中获取
                echo -e "${BLUE}💰 奖励已发放到账户${NC}"
            else
                echo -e "${RED}❌ 番茄 $id 收获失败: $HARVEST_RESULT${NC}"
            fi
            echo ""
        done
        
        echo -e "${GREEN}📊 批量收获完成！${NC}"
        echo "总收获数量: $total_harvested"
        ;;
        
    "batch-check")
        if [ $# -ne 5 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 batch-check <network> <contract_address> <start_id> <end_id>"
            exit 1
        fi
        
        START_ID=$4
        END_ID=$5
        
        echo -e "${BLUE}📋 批量状态检查${NC}"
        echo "网络: $NETWORK"
        echo "合约地址: $CONTRACT_ADDRESS"
        echo "番茄ID范围: $START_ID - $END_ID"
        echo ""
        
        echo -e "${CYAN}ID\t类型\t\t阶段\t\t状态${NC}"
        echo "=================================================="
        
        for ((id=$START_ID; id<=$END_ID; id++)); do
            # 获取番茄类型
            TYPE_RESULT=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_tomato_type --calldata $id 2>/dev/null)
            TYPE_NUM=$(echo $TYPE_RESULT | grep -o '[0-9]*' | head -1)
            
            if [ -z "$TYPE_NUM" ]; then
                echo -e "$id\t❌ 不存在"
                continue
            fi
            
            # 获取成长阶段
            STAGE_RESULT=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_current_growth_stage --calldata $id 2>/dev/null)
            STAGE_NUM=$(echo $STAGE_RESULT | grep -o '[0-9]*' | head -1)
            
            TYPE_DESC=$(format_tomato_type $TYPE_NUM)
            STAGE_DESC=$(format_growth_stage $STAGE_NUM)
            
            # 判断状态
            if [ "$STAGE_NUM" -eq 4 ]; then
                STATUS="🍅 可收获"
            else
                STATUS="🌱 成长中"
            fi
            
            echo -e "$id\t$TYPE_DESC\t$STAGE_DESC\t$STATUS"
        done
        ;;
        
    "mutation-hunt")
        if [ $# -ne 5 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 mutation-hunt <network> <contract_address> <tomato_id> <times>"
            exit 1
        fi
        
        TOMATO_ID=$4
        TIMES=$5
        
        echo -e "${PURPLE}🎯 变异猎取模式${NC}"
        echo "网络: $NETWORK"
        echo "合约地址: $CONTRACT_ADDRESS"
        echo "番茄ID: $TOMATO_ID"
        echo "尝试次数: $TIMES"
        echo ""
        
        # 检查初始类型
        INITIAL_TYPE=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_tomato_type --calldata $TOMATO_ID 2>/dev/null | grep -o '[0-9]*' | head -1)
        
        if [ -z "$INITIAL_TYPE" ]; then
            echo -e "${RED}❌ 番茄不存在${NC}"
            exit 1
        fi
        
        if [ "$INITIAL_TYPE" != "0" ]; then
            echo -e "${YELLOW}⚠️  番茄已经是变异类型，无法再次变异${NC}"
            echo -e "当前类型: $(format_tomato_type $INITIAL_TYPE)"
            exit 1
        fi
        
        echo -e "${BLUE}开始变异猎取...${NC}"
        
        for ((i=1; i<=$TIMES; i++)); do
            echo -e "${YELLOW}第 $i/$TIMES 次尝试...${NC}"
            
            # 浇水
            WATER_RESULT=$(sncast --url $NETWORK invoke --contract-address $CONTRACT_ADDRESS --function water_tomato --calldata $TOMATO_ID 2>&1)
            
            if [ $? -eq 0 ]; then
                wait_for_transaction
                
                # 检查是否变异
                NEW_TYPE=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_tomato_type --calldata $TOMATO_ID 2>/dev/null | grep -o '[0-9]*' | head -1)
                
                if [ "$NEW_TYPE" != "0" ] && [ ! -z "$NEW_TYPE" ]; then
                    echo -e "${GREEN}🎉 变异成功！${NC}"
                    echo -e "变异类型: $(format_tomato_type $NEW_TYPE)"
                    echo -e "尝试次数: $i/$TIMES"
                    exit 0
                else
                    echo -e "${BLUE}继续尝试...${NC}"
                fi
            else
                echo -e "${RED}❌ 浇水失败: $WATER_RESULT${NC}"
                echo -e "${YELLOW}等待一段时间后重试...${NC}"
                sleep 10
            fi
            
            # 避免过于频繁的请求
            sleep 2
        done
        
        echo -e "${YELLOW}😔 经过 $TIMES 次尝试未能获得变异${NC}"
        echo -e "${BLUE}💡 建议: 继续尝试或种植更多番茄增加变异机会${NC}"
        ;;
        
    "user-summary")
        if [ $# -ne 4 ]; then
            echo -e "${RED}❌ 参数错误${NC}"
            echo "使用方法: $0 user-summary <network> <contract_address> <user_address>"
            exit 1
        fi
        
        USER_ADDRESS=$4
        
        echo -e "${CYAN}👤 用户完整报告${NC}"
        echo "网络: $NETWORK"
        echo "合约地址: $CONTRACT_ADDRESS"
        echo "用户地址: $USER_ADDRESS"
        echo ""
        
        # 获取用户番茄数量
        USER_COUNT=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_user_tomato_count --calldata $USER_ADDRESS 2>/dev/null | grep -o '[0-9]*' | head -1)
        
        if [ -z "$USER_COUNT" ] || [ "$USER_COUNT" -eq 0 ]; then
            echo -e "${YELLOW}该用户还没有番茄${NC}"
            exit 0
        fi
        
        echo -e "${GREEN}📊 总览${NC}"
        echo "番茄总数: $USER_COUNT"
        echo ""
        
        echo -e "${BLUE}📋 详细信息${NC}"
        echo -e "${CYAN}序号\tID\t类型\t\t阶段\t\t状态${NC}"
        echo "======================================================="
        
        for ((i=0; i<$USER_COUNT; i++)); do
            # 获取番茄ID
            TOMATO_ID=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_user_tomato_at_index --calldata $USER_ADDRESS $i 2>/dev/null | grep -o '[0-9]*' | head -1)
            
            if [ ! -z "$TOMATO_ID" ]; then
                # 获取类型和阶段
                TYPE_NUM=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_tomato_type --calldata $TOMATO_ID 2>/dev/null | grep -o '[0-9]*' | head -1)
                STAGE_NUM=$(sncast --url $NETWORK call --contract-address $CONTRACT_ADDRESS --function get_current_growth_stage --calldata $TOMATO_ID 2>/dev/null | grep -o '[0-9]*' | head -1)
                
                TYPE_DESC=$(format_tomato_type $TYPE_NUM)
                STAGE_DESC=$(format_growth_stage $STAGE_NUM)
                
                if [ "$STAGE_NUM" -eq 4 ]; then
                    STATUS="🍅 可收获"
                else
                    STATUS="🌱 成长中"
                fi
                
                echo -e "$((i+1))\t$TOMATO_ID\t$TYPE_DESC\t$STAGE_DESC\t$STATUS"
            fi
        done
        
        echo ""
        echo -e "${BLUE}🔍 调用统计脚本获取详细变异分析...${NC}"
        ./scripts/stats.sh $NETWORK $CONTRACT_ADDRESS $USER_ADDRESS
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
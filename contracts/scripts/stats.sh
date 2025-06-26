#!/bin/bash

# Tomato Garden 变异统计脚本
# 使用方法: ./scripts/stats.sh <network> <staking_contract_address> [user_address]

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
    echo -e "${BLUE}📊 Tomato Garden 变异统计工具${NC}"
    echo ""
    echo "使用方法: $0 <network> <staking_contract_address> [user_address]"
    echo ""
    echo "参数说明:"
    echo "  network                - 网络名称 (mainnet, sepolia)"
    echo "  staking_contract_address - TomatoStaking合约地址"
    echo "  user_address           - 可选，指定用户地址进行统计"
    echo ""
    echo "示例:"
    echo "  $0 sepolia 0x123...     # 统计所有用户的变异情况"
    echo "  $0 sepolia 0x123... 0x456...  # 统计特定用户的变异情况"
    echo ""
    echo "功能:"
    echo "  - 统计不同类型番茄的数量"
    echo "  - 计算变异率"
    echo "  - 显示稀有度排名"
}

# 检查参数
if [ $# -lt 2 ] || [ $# -gt 3 ]; then
    show_help
    exit 1
fi

NETWORK=$1
STAKING_CONTRACT_ADDRESS=$2
USER_ADDRESS=${3:-""}

# 番茄类型转换函数
format_tomato_type() {
    local type_num=$1
    case $type_num in
        0) echo "Normal" ;;
        1) echo "Yellow" ;;
        2) echo "Purple" ;;
        3) echo "Flame" ;;
        4) echo "Ice" ;;
        5) echo "Rainbow" ;;
        *) echo "Unknown" ;;
    esac
}

# 获取番茄类型图标
get_type_icon() {
    local type_num=$1
    case $type_num in
        0) echo "🍅" ;;
        1) echo "🟡" ;;
        2) echo "🟣" ;;
        3) echo "🔥" ;;
        4) echo "❄️" ;;
        5) echo "🌈" ;;
        *) echo "❓" ;;
    esac
}

# 获取稀有度颜色
get_rarity_color() {
    local type_num=$1
    case $type_num in
        0) echo "${NC}" ;;      # 普通 - 无色
        1) echo "${YELLOW}" ;;  # 黄色
        2) echo "${PURPLE}" ;;  # 紫色
        3) echo "${RED}" ;;     # 火焰 - 红色
        4) echo "${CYAN}" ;;    # 冰霜 - 青色
        5) echo "${GREEN}" ;;   # 彩虹 - 绿色
        *) echo "${NC}" ;;
    esac
}

echo -e "${BLUE}📊 Tomato Garden 变异统计分析${NC}"
echo "网络: $NETWORK"
echo "合约地址: $STAKING_CONTRACT_ADDRESS"

if [ ! -z "$USER_ADDRESS" ]; then
    echo "用户地址: $USER_ADDRESS"
fi

echo ""
echo -e "${YELLOW}🔍 正在收集数据...${NC}"

# 初始化统计数组
declare -a type_counts=(0 0 0 0 0 0)
total_tomatoes=0

if [ ! -z "$USER_ADDRESS" ]; then
    # 统计特定用户的番茄
    echo "正在查询用户番茄数量..."
    
    USER_COUNT_RESULT=$(sncast --url $NETWORK call --contract-address $STAKING_CONTRACT_ADDRESS --function get_user_tomato_count --calldata $USER_ADDRESS 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        USER_COUNT=$(echo $USER_COUNT_RESULT | grep -o '[0-9]*' | head -1)
        echo "用户拥有 $USER_COUNT 个番茄"
        
        if [ "$USER_COUNT" -gt 0 ]; then
            echo "正在分析每个番茄的类型..."
            
            for ((i=0; i<$USER_COUNT; i++)); do
                # 获取番茄ID
                TOMATO_ID_RESULT=$(sncast --url $NETWORK call --contract-address $STAKING_CONTRACT_ADDRESS --function get_user_tomato_at_index --calldata $USER_ADDRESS $i 2>/dev/null)
                
                if [ $? -eq 0 ]; then
                    TOMATO_ID=$(echo $TOMATO_ID_RESULT | grep -o '[0-9]*' | head -1)
                    
                    # 获取番茄类型
                    TYPE_RESULT=$(sncast --url $NETWORK call --contract-address $STAKING_CONTRACT_ADDRESS --function get_tomato_type --calldata $TOMATO_ID 2>/dev/null)
                    
                    if [ $? -eq 0 ]; then
                        TYPE_NUM=$(echo $TYPE_RESULT | grep -o '[0-9]*' | head -1)
                        
                        if [ "$TYPE_NUM" -ge 0 ] && [ "$TYPE_NUM" -le 5 ]; then
                            ((type_counts[$TYPE_NUM]++))
                            ((total_tomatoes++))
                            
                            echo -n "."
                        fi
                    fi
                fi
            done
            echo ""
        fi
    else
        echo -e "${RED}❌ 无法查询用户番茄数量${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  全局统计功能需要遍历所有番茄，可能需要较长时间${NC}"
    echo "建议使用特定用户地址进行快速统计"
    echo ""
    
    # 可以通过事件日志来统计，但这里使用简化方案
    echo "正在查询最新番茄ID..."
    # 这里可以实现全局统计逻辑，暂时跳过
    echo -e "${BLUE}💡 全局统计功能开发中，请使用用户地址参数${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}📈 统计结果${NC}"
echo "=================================================="

# 显示统计结果
for i in {0..5}; do
    type_name=$(format_tomato_type $i)
    type_icon=$(get_type_icon $i)
    rarity_color=$(get_rarity_color $i)
    count=${type_counts[$i]}
    
    if [ $total_tomatoes -gt 0 ]; then
        percentage=$(python3 -c "print(f'{($count / $total_tomatoes) * 100:.1f}')")
    else
        percentage="0.0"
    fi
    
    echo -e "${rarity_color}${type_icon} ${type_name}: ${count} 个 (${percentage}%)${NC}"
done

echo ""
echo -e "${BLUE}总番茄数量: $total_tomatoes${NC}"

if [ $total_tomatoes -gt 0 ]; then
    # 计算变异率
    mutated_count=$((total_tomatoes - ${type_counts[0]}))
    mutation_rate=$(python3 -c "print(f'{($mutated_count / $total_tomatoes) * 100:.1f}')")
    
    echo -e "${PURPLE}变异番茄数量: $mutated_count${NC}"
    echo -e "${YELLOW}变异率: ${mutation_rate}%${NC}"
    
    echo ""
    echo -e "${GREEN}🏆 稀有度排名${NC}"
    echo "=================================================="
    
    # 创建稀有度排名
    if [ ${type_counts[5]} -gt 0 ]; then
        echo -e "${GREEN}🌈 Rainbow (彩虹): ${type_counts[5]} 个 - 传说级稀有${NC}"
    fi
    
    if [ ${type_counts[4]} -gt 0 ]; then
        echo -e "${CYAN}❄️  Ice (冰霜): ${type_counts[4]} 个 - 史诗级稀有${NC}"
    fi
    
    if [ ${type_counts[3]} -gt 0 ]; then
        echo -e "${RED}🔥 Flame (火焰): ${type_counts[3]} 个 - 稀有${NC}"
    fi
    
    if [ ${type_counts[2]} -gt 0 ]; then
        echo -e "${PURPLE}🟣 Purple (紫色): ${type_counts[2]} 个 - 不常见${NC}"
    fi
    
    if [ ${type_counts[1]} -gt 0 ]; then
        echo -e "${YELLOW}🟡 Yellow (黄色): ${type_counts[1]} 个 - 不常见${NC}"
    fi
    
    if [ ${type_counts[0]} -gt 0 ]; then
        echo -e "${NC}🍅 Normal (普通): ${type_counts[0]} 个 - 普通${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}💰 收藏价值评估${NC}"
    echo "=================================================="
    
    # 计算收藏价值分数
    collection_score=0
    collection_score=$((collection_score + ${type_counts[1]} * 1))  # Yellow: 1分
    collection_score=$((collection_score + ${type_counts[2]} * 1))  # Purple: 1分
    collection_score=$((collection_score + ${type_counts[3]} * 3))  # Flame: 3分
    collection_score=$((collection_score + ${type_counts[4]} * 5))  # Ice: 5分
    collection_score=$((collection_score + ${type_counts[5]} * 10)) # Rainbow: 10分
    
    echo "收藏价值分数: $collection_score 分"
    
    if [ $collection_score -eq 0 ]; then
        echo -e "${NC}评级: 新手收藏家 🌱${NC}"
    elif [ $collection_score -lt 5 ]; then
        echo -e "${YELLOW}评级: 初级收藏家 🌿${NC}"
    elif [ $collection_score -lt 15 ]; then
        echo -e "${BLUE}评级: 中级收藏家 🍃${NC}"
    elif [ $collection_score -lt 30 ]; then
        echo -e "${PURPLE}评级: 高级收藏家 🌺${NC}"
    else
        echo -e "${GREEN}评级: 传奇收藏家 👑${NC}"
    fi
else
    echo -e "${YELLOW}还没有番茄数据可供统计${NC}"
fi

echo ""
echo -e "${GREEN}✅ 统计完成！${NC}"

if [ ! -z "$USER_ADDRESS" ] && [ $total_tomatoes -gt 0 ]; then
    echo ""
    echo -e "${BLUE}💡 收集建议:${NC}"
    if [ ${type_counts[0]} -gt 0 ]; then
        echo "- 继续浇水Normal番茄，争取更多变异机会"
    fi
    if [ ${type_counts[5]} -eq 0 ]; then
        echo "- 尝试收集传说级Rainbow番茄"
    fi
    if [ ${type_counts[4]} -eq 0 ]; then
        echo "- 寻找史诗级Ice番茄"
    fi
fi
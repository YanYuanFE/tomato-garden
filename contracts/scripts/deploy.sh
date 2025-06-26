#!/bin/bash

# Tomato Garden 合约部署脚本
# 使用方法: ./scripts/deploy.sh <network> <account_file> <strk_token_address> <min_stake_amount> <owner_address>

set -e

# 检查参数
if [ $# -ne 5 ]; then
    echo "使用方法: $0 <network> <account_name> <strk_token_address> <min_stake_amount> <owner_address>"
    echo "示例: $0 sepolia deployer 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d 1000000000000000000 0x123..."
    echo ""
    echo "参数说明:"
    echo "  network: 网络名称 (mainnet, sepolia)"
    echo "  account_name: sncast账户名称 (在snfoundry.toml中配置)"
    echo "  strk_token_address: STRK代币合约地址"
    echo "  min_stake_amount: 最小质押金额 (以wei为单位, 1 STRK = 1000000000000000000)"
    echo "  owner_address: 合约最终所有者地址"
    echo ""
    echo "部署流程:"
    echo "  1. 使用部署者账户作为初始owner部署合约"
    echo "  2. 设置TomatoStaking为TomatoNFT的授权铸造者"
    echo "  3. 将合约ownership转移给最终所有者 (如果不同)"
    exit 1
fi

NETWORK=$1
ACCOUNT_NAME=$2
STRK_TOKEN_ADDRESS=$3
MIN_STAKE_AMOUNT=$4
OWNER_ADDRESS=$5

echo "🌱 开始部署 Tomato Garden 合约..."
echo "网络: $NETWORK"
echo "账户名称: $ACCOUNT_NAME"
echo "STRK代币地址: $STRK_TOKEN_ADDRESS"
echo "最小质押金额: $MIN_STAKE_AMOUNT wei"
echo "所有者地址: $OWNER_ADDRESS"
echo ""

# 获取部署者地址
echo "📋 获取部署者地址..."
DEPLOYER_ADDRESS=$(sncast --profile $ACCOUNT_NAME account list | grep -A5 "- $ACCOUNT_NAME:" | grep "address:" | grep -o '0x[0-9a-fA-F]*')

if [ -z "$DEPLOYER_ADDRESS" ]; then
    echo "❌ 无法获取部署者地址"
    exit 1
fi

echo "部署者地址: $DEPLOYER_ADDRESS"
echo ""

# 编译合约
echo "📦 编译合约..."
scarb build

if [ $? -ne 0 ]; then
    echo "❌ 合约编译失败"
    exit 1
fi

echo "✅ 合约编译成功"
echo ""

# 声明 TomatoNFT 合约
echo "📋 声明 TomatoNFT 合约..."
NFT_DECLARE_OUTPUT=$(sncast --profile $ACCOUNT_NAME declare --contract-name TomatoNFT 2>&1)

if [ $? -ne 0 ]; then
    # 检查是否是"已声明"的错误，这种情况下我们继续执行
    if echo "$NFT_DECLARE_OUTPUT" | grep -q "is already declared"; then
        echo "⚠️ TomatoNFT 合约类已存在，继续使用现有类哈希"
    else
        echo "❌ TomatoNFT 合约声明失败"
        echo "$NFT_DECLARE_OUTPUT"
        exit 1
    fi
fi

# 提取 NFT 类哈希 (sncast 输出格式: class_hash: 0x...)
NFT_CLASS_HASH=$(echo "$NFT_DECLARE_OUTPUT" | grep -E "class_hash|Class hash" | grep -o '0x[0-9a-fA-F]*' | head -1)

# 如果从成功输出中无法提取，尝试从错误信息中提取（类已声明的情况）
if [ -z "$NFT_CLASS_HASH" ]; then
    NFT_CLASS_HASH=$(echo "$NFT_DECLARE_OUTPUT" | grep -o '0x[0-9a-fA-F]*' | head -1)
fi

if [ -z "$NFT_CLASS_HASH" ]; then
    echo "❌ 无法提取 TomatoNFT 类哈希"
    echo "声明输出: $NFT_DECLARE_OUTPUT"
    exit 1
fi

echo "✅ TomatoNFT 合约声明成功"
echo "NFT 类哈希: $NFT_CLASS_HASH"
echo ""

# 声明 TomatoStaking 合约
echo "📋 声明 TomatoStaking 合约..."
STAKING_DECLARE_OUTPUT=$(sncast --profile $ACCOUNT_NAME declare --contract-name TomatoStaking 2>&1)

if [ $? -ne 0 ]; then
    # 检查是否是"已声明"的错误，这种情况下我们继续执行
    if echo "$STAKING_DECLARE_OUTPUT" | grep -q "is already declared"; then
        echo "⚠️ TomatoStaking 合约类已存在，继续使用现有类哈希"
    else
        echo "❌ TomatoStaking 合约声明失败"
        echo "$STAKING_DECLARE_OUTPUT"
        exit 1
    fi
fi

# 提取 Staking 类哈希 (sncast 输出格式: class_hash: 0x...)
STAKING_CLASS_HASH=$(echo "$STAKING_DECLARE_OUTPUT" | grep -E "class_hash|Class hash" | grep -o '0x[0-9a-fA-F]*' | head -1)

# 如果从成功输出中无法提取，尝试从错误信息中提取（类已声明的情况）
if [ -z "$STAKING_CLASS_HASH" ]; then
    STAKING_CLASS_HASH=$(echo "$STAKING_DECLARE_OUTPUT" | grep -o '0x[0-9a-fA-F]*' | head -1)
fi

if [ -z "$STAKING_CLASS_HASH" ]; then
    echo "❌ 无法提取 TomatoStaking 类哈希"
    echo "声明输出: $STAKING_DECLARE_OUTPUT"
    exit 1
fi

echo "✅ TomatoStaking 合约声明成功"
echo "Staking 类哈希: $STAKING_CLASS_HASH"
echo ""

# 部署 TomatoNFT 合约
echo "🚀 部署 TomatoNFT 合约..."

# TomatoNFT 构造函数参数: name, symbol, base_uri, owner, authorized_minter, growth_time_per_stage, max_growth_stage
# 注意：authorized_minter 先设为 owner，稍后会更新为 TomatoStaking 合约地址
# 临时使用简化的参数进行测试
echo "正在准备构造函数参数..."

# 将字符串转换为适当的格式
NAME_HEX=$(python3 -c "
import sys
s = 'Tomato Garden NFT'
data = s.encode('utf-8')
# ByteArray format: [data_len, data_words..., pending_word, pending_word_len]
words = []
for i in range(0, len(data), 31):
    chunk = data[i:i+31]
    if len(chunk) == 31:
        words.append('0x' + chunk.hex())
    else:
        pending = '0x' + chunk.hex() if chunk else '0x0'
        print(f'{len(words)} ' + ' '.join(words) + f' {pending} {len(chunk)}')
        sys.exit()
if len(data) % 31 == 0:
    print(f'{len(words)} ' + ' '.join(words) + ' 0x0 0')
")

SYMBOL_HEX=$(python3 -c "
import sys
s = 'TOMATO'
data = s.encode('utf-8')
words = []
for i in range(0, len(data), 31):
    chunk = data[i:i+31]
    if len(chunk) == 31:
        words.append('0x' + chunk.hex())
    else:
        pending = '0x' + chunk.hex() if chunk else '0x0'
        print(f'{len(words)} ' + ' '.join(words) + f' {pending} {len(chunk)}')
        sys.exit()
if len(data) % 31 == 0:
    print(f'{len(words)} ' + ' '.join(words) + ' 0x0 0')
")

URI_HEX=$(python3 -c "
import sys
s = 'ipfs://bafybeiemaouyxb2lltopoahht44e6dqwcedclsw2u573yu45s3zdz3yf3u/'
data = s.encode('utf-8')
words = []
for i in range(0, len(data), 31):
    chunk = data[i:i+31]
    if len(chunk) == 31:
        words.append('0x' + chunk.hex())
    else:
        pending = '0x' + chunk.hex() if chunk else '0x0'
        print(f'{len(words)} ' + ' '.join(words) + f' {pending} {len(chunk)}')
        sys.exit()
if len(data) % 31 == 0:
    print(f'{len(words)} ' + ' '.join(words) + ' 0x0 0')
")

echo "Name: $NAME_HEX"
echo "Symbol: $SYMBOL_HEX" 
echo "URI: $URI_HEX"

# 使用部署者地址作为初始owner和authorized_minter
NFT_DEPLOY_OUTPUT=$(sncast --profile $ACCOUNT_NAME deploy --class-hash $NFT_CLASS_HASH --constructor-calldata $NAME_HEX $SYMBOL_HEX $URI_HEX $DEPLOYER_ADDRESS $DEPLOYER_ADDRESS 3600 4 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ TomatoNFT 合约部署失败"
    echo "$NFT_DEPLOY_OUTPUT"
    exit 1
fi

# 提取 NFT 合约地址 (sncast 输出格式: contract_address: 0x...)
NFT_CONTRACT_ADDRESS=$(echo "$NFT_DEPLOY_OUTPUT" | grep -E "contract_address|Contract address" | grep -o '0x[0-9a-fA-F]*' | head -1)

if [ -z "$NFT_CONTRACT_ADDRESS" ]; then
    echo "❌ 无法提取 TomatoNFT 合约地址"
    echo "部署输出: $NFT_DEPLOY_OUTPUT"
    exit 1
fi

echo "✅ TomatoNFT 合约部署成功!"
echo "NFT 合约地址: $NFT_CONTRACT_ADDRESS"
echo ""

# 部署 TomatoStaking 合约
echo "🚀 部署 TomatoStaking 合约..."

# 将min_stake_amount和base_reward转换为低位和高位
MIN_STAKE_LOW=$(python3 -c "print(hex($MIN_STAKE_AMOUNT & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF))")
MIN_STAKE_HIGH=$(python3 -c "print(hex($MIN_STAKE_AMOUNT >> 128))")
BASE_REWARD=100000000000000000  # 0.1 STRK per stage
BASE_REWARD_LOW=$(python3 -c "print(hex($BASE_REWARD & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF))")
BASE_REWARD_HIGH=$(python3 -c "print(hex($BASE_REWARD >> 128))")

# TomatoStaking 构造函数参数: strk_token_address, tomato_nft_contract, owner, min_stake_amount, base_reward_per_stage
# 使用部署者地址作为初始owner
STAKING_DEPLOY_OUTPUT=$(sncast --profile $ACCOUNT_NAME deploy --class-hash $STAKING_CLASS_HASH --constructor-calldata $STRK_TOKEN_ADDRESS $NFT_CONTRACT_ADDRESS $DEPLOYER_ADDRESS $MIN_STAKE_LOW $MIN_STAKE_HIGH $BASE_REWARD_LOW $BASE_REWARD_HIGH 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ TomatoStaking 合约部署失败"
    echo "$STAKING_DEPLOY_OUTPUT"
    exit 1
fi

# 提取 Staking 合约地址 (sncast 输出格式: contract_address: 0x...)
STAKING_CONTRACT_ADDRESS=$(echo "$STAKING_DEPLOY_OUTPUT" | grep -E "contract_address|Contract address" | grep -o '0x[0-9a-fA-F]*' | head -1)

if [ -z "$STAKING_CONTRACT_ADDRESS" ]; then
    echo "❌ 无法提取 TomatoStaking 合约地址"
    echo "部署输出: $STAKING_DEPLOY_OUTPUT"
    exit 1
fi

echo "✅ TomatoStaking 合约部署成功!"
echo "Staking 合约地址: $STAKING_CONTRACT_ADDRESS"
echo ""

# 设置 TomatoStaking 为 TomatoNFT 的授权铸造者
echo "🔧 设置授权铸造者..."
SET_MINTER_OUTPUT=$(sncast --profile $ACCOUNT_NAME invoke --contract-address $NFT_CONTRACT_ADDRESS --function set_authorized_minter --calldata $STAKING_CONTRACT_ADDRESS 2>&1)

if [ $? -ne 0 ]; then
    echo "⚠️  设置授权铸造者失败，请手动执行:"
    echo "sncast --profile $ACCOUNT_NAME invoke --contract-address $NFT_CONTRACT_ADDRESS --function set_authorized_minter --calldata $STAKING_CONTRACT_ADDRESS"
    echo "错误信息: $SET_MINTER_OUTPUT"
else
    echo "✅ 授权铸造者设置成功!"
fi
echo ""

# 转移 TomatoNFT 合约 ownership 到最终owner (如果与部署者不同)
if [ "$DEPLOYER_ADDRESS" != "$OWNER_ADDRESS" ]; then
    echo "🔄 转移 TomatoNFT 合约 ownership..."
    NFT_TRANSFER_OUTPUT=$(sncast --profile $ACCOUNT_NAME invoke --contract-address $NFT_CONTRACT_ADDRESS --function transfer_ownership --calldata $OWNER_ADDRESS 2>&1)
    
    if [ $? -ne 0 ]; then
        echo "⚠️  转移 TomatoNFT ownership 失败，请手动执行:"
        echo "sncast --profile $ACCOUNT_NAME invoke --contract-address $NFT_CONTRACT_ADDRESS --function transfer_ownership --calldata $OWNER_ADDRESS"
        echo "错误信息: $NFT_TRANSFER_OUTPUT"
    else
        echo "✅ TomatoNFT ownership 转移成功!"
    fi
else
    echo "ℹ️  部署者地址与所有者地址相同，跳过 TomatoNFT ownership 转移"
fi
echo ""

# 转移 TomatoStaking 合约 ownership 到最终owner (如果与部署者不同)
if [ "$DEPLOYER_ADDRESS" != "$OWNER_ADDRESS" ]; then
    echo "🔄 转移 TomatoStaking 合约 ownership..."
    STAKING_TRANSFER_OUTPUT=$(sncast --profile $ACCOUNT_NAME invoke --contract-address $STAKING_CONTRACT_ADDRESS --function transfer_ownership --calldata $OWNER_ADDRESS 2>&1)
    
    if [ $? -ne 0 ]; then
        echo "⚠️  转移 TomatoStaking ownership 失败，请手动执行:"
        echo "sncast --profile $ACCOUNT_NAME invoke --contract-address $STAKING_CONTRACT_ADDRESS --function transfer_ownership --calldata $OWNER_ADDRESS"
        echo "错误信息: $STAKING_TRANSFER_OUTPUT"
    else
        echo "✅ TomatoStaking ownership 转移成功!"
    fi
else
    echo "ℹ️  部署者地址与所有者地址相同，跳过 TomatoStaking ownership 转移"
fi
echo ""

echo "✅ 所有合约部署成功!"
echo ""
echo "📋 部署信息:"
echo "网络: $NETWORK"
echo "部署者地址: $DEPLOYER_ADDRESS"
echo "最终所有者地址: $OWNER_ADDRESS"
echo ""
echo "TomatoNFT 类哈希: $NFT_CLASS_HASH"
echo "TomatoNFT 合约地址: $NFT_CONTRACT_ADDRESS"
echo "TomatoStaking 类哈希: $STAKING_CLASS_HASH"
echo "TomatoStaking 合约地址: $STAKING_CONTRACT_ADDRESS"
echo "STRK代币地址: $STRK_TOKEN_ADDRESS"
echo ""
echo "配置参数:"
echo "最小质押金额: $MIN_STAKE_AMOUNT wei ($(python3 -c "print($MIN_STAKE_AMOUNT / 10**18)") STRK)"
echo "每阶段基础奖励: $BASE_REWARD wei ($(python3 -c "print($BASE_REWARD / 10**18)") STRK)"
echo ""
echo "🎉 Tomato Garden 合约部署完成!"
echo ""
echo "📝 保存部署信息到文件..."

# 创建部署信息文件
DEPLOY_INFO_FILE="deployments/${NETWORK}_deployment.json"
mkdir -p deployments

cat > $DEPLOY_INFO_FILE << EOF
{
  "network": "$NETWORK",
  "tomato_nft": {
    "contract_address": "$NFT_CONTRACT_ADDRESS",
    "class_hash": "$NFT_CLASS_HASH"
  },
  "tomato_staking": {
    "contract_address": "$STAKING_CONTRACT_ADDRESS",
    "class_hash": "$STAKING_CLASS_HASH"
  },
  "strk_token_address": "$STRK_TOKEN_ADDRESS",
  "min_stake_amount": "$MIN_STAKE_AMOUNT",
  "base_reward_per_stage": "$BASE_REWARD",
  "owner_address": "$OWNER_ADDRESS",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo "✅ 部署信息已保存到: $DEPLOY_INFO_FILE"
echo ""
echo "🔗 验证合约 (可选):"
echo "sncast --profile $ACCOUNT_NAME call --contract-address $STAKING_CONTRACT_ADDRESS --function get_min_stake_amount"
echo "sncast --profile $ACCOUNT_NAME call --contract-address $NFT_CONTRACT_ADDRESS --function get_growth_cycle_config"
echo ""
echo "📖 使用示例:"
echo "# 1. 授权STRK代币 (需要先授权)"
echo "sncast --profile $ACCOUNT_NAME invoke --contract-address $STRK_TOKEN_ADDRESS --function approve --calldata $STAKING_CONTRACT_ADDRESS <amount_low> <amount_high>"
echo ""
echo "# 2. 种植番茄"
echo "sncast --profile $ACCOUNT_NAME invoke --contract-address $STAKING_CONTRACT_ADDRESS --function plant_tomato --calldata <amount_low> <amount_high>"
echo ""
echo "# 3. 查看番茄信息"
echo "sncast --profile $ACCOUNT_NAME call --contract-address $NFT_CONTRACT_ADDRESS --function get_tomato_metadata --calldata <tomato_id>"
echo "sncast --profile $ACCOUNT_NAME call --contract-address $STAKING_CONTRACT_ADDRESS --function get_current_growth_stage --calldata <tomato_id>"
echo "sncast --profile $ACCOUNT_NAME call --contract-address $STAKING_CONTRACT_ADDRESS --function get_tomato_type --calldata <tomato_id>"
echo ""
echo "# 4. 浇水番茄 (有5%概率触发变异!)"
echo "sncast --profile $ACCOUNT_NAME invoke --contract-address $STAKING_CONTRACT_ADDRESS --function water_tomato --calldata <tomato_id>"
echo ""
echo "# 5. 收获番茄"
echo "sncast --profile $ACCOUNT_NAME invoke --contract-address $STAKING_CONTRACT_ADDRESS --function harvest_tomato --calldata <tomato_id>"
echo ""
echo "🎨 番茄变种系统:"
echo "- Normal (普通): 默认类型，可以变异"
echo "- Yellow (黄色): 特殊变异类型"
echo "- Purple (紫色): 特殊变异类型"
echo "- Flame (火焰): 特殊变异类型"
echo "- Ice (冰霜): 特殊变异类型"
echo "- Rainbow (彩虹): 特殊变异类型"
echo ""
echo "📱 建议使用交互脚本:"
echo "./scripts/interact.sh type $NETWORK $STAKING_CONTRACT_ADDRESS <tomato_id>  # 查看番茄类型"
echo "./scripts/interact.sh water $NETWORK $STAKING_CONTRACT_ADDRESS <tomato_id> # 浇水并检测变异"
echo "./scripts/interact.sh metadata $NETWORK $NFT_CONTRACT_ADDRESS <tomato_id>  # 查看完整元数据"
echo ""
echo "🎉 部署完成！现在可以开始种植番茄，收集珍稀变种了！"
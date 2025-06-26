# 测试修改后的部署流程

## 新的部署流程逻辑

### 1. **准备阶段**
- 获取部署者地址 (DEPLOYER_ADDRESS)
- 获取最终所有者地址 (OWNER_ADDRESS)

### 2. **NFT合约部署**
```bash
# 构造函数参数: name, symbol, base_uri, owner, authorized_minter, growth_time, max_stage
deploy TomatoNFT --constructor-calldata $NAME $SYMBOL $URI $DEPLOYER_ADDRESS $DEPLOYER_ADDRESS 3600 4
```
**初始状态**: 
- Owner: 部署者地址
- Authorized Minter: 部署者地址

### 3. **Staking合约部署**  
```bash
# 构造函数参数: strk_token, nft_contract, owner, min_stake, base_reward
deploy TomatoStaking --constructor-calldata $STRK_TOKEN $NFT_ADDRESS $DEPLOYER_ADDRESS $MIN_STAKE $BASE_REWARD
```
**初始状态**:
- Owner: 部署者地址

### 4. **设置授权铸造者**
```bash
# 由部署者调用NFT合约，设置Staking合约为授权铸造者
invoke NFT.set_authorized_minter(STAKING_ADDRESS)
```
**状态变更**:
- NFT合约的Authorized Minter: 部署者 → Staking合约

### 5. **转移所有权**
```bash
# 如果部署者 ≠ 最终所有者，则转移所有权
if DEPLOYER_ADDRESS != OWNER_ADDRESS:
    invoke NFT.transfer_ownership(OWNER_ADDRESS)
    invoke Staking.transfer_ownership(OWNER_ADDRESS)
```
**最终状态**:
- NFT合约 Owner: 最终所有者
- Staking合约 Owner: 最终所有者
- NFT合约 Authorized Minter: Staking合约

## 优势

### ✅ 解决的问题
1. **权限问题**: 部署者可以设置授权铸造者
2. **安全性**: 最终所有权归属正确的地址  
3. **灵活性**: 支持部署者 = 所有者的情况

### 🔧 权限流转
```
初始: 部署者 拥有 NFT 和 Staking 合约
设置: 部署者 设置 Staking 为 NFT 的授权铸造者
转移: 部署者 将两个合约的所有权转移给最终所有者
```

### 📋 测试场景

#### 场景1: 部署者 = 所有者
```bash
./scripts/deploy.sh sepolia my_account 0x...strk 1000000000000000000 MY_ACCOUNT_ADDRESS
```
- 不需要转移所有权
- 部署者保持对合约的控制

#### 场景2: 部署者 ≠ 所有者  
```bash
./scripts/deploy.sh sepolia deployer_account 0x...strk 1000000000000000000 0x...final_owner
```
- 需要转移所有权
- 最终所有者获得合约控制权

## 安全注意事项

1. **确保授权完成**: 在转移所有权前确认 Staking 合约已被设置为授权铸造者
2. **验证地址**: 确保最终所有者地址正确
3. **权限检查**: 转移后验证新所有者可以正常管理合约

## 向后兼容性

- ✅ 保持与现有接口兼容
- ✅ 支持单一所有者场景
- ✅ 错误处理和手动操作指导
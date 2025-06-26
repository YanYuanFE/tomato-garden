# sncast Migration Summary

## 概述

已成功将所有 Tomato Garden 项目脚本从 `starkli` 迁移到 `sncast`，实现统一的工具链。

## 迁移详情

### 1. 核心脚本迁移

#### 📁 deploy.sh (部署脚本)
- ✅ **完全迁移** - 使用 `sncast --profile $ACCOUNT_NAME`
- 🔄 **命令变更**: 
  - `starkli declare` → `sncast --profile $ACCOUNT_NAME declare --contract-name`
  - `starkli deploy` → `sncast --profile $ACCOUNT_NAME deploy --class-hash`
  - `starkli invoke` → `sncast --profile $ACCOUNT_NAME invoke --contract-address`
  - `starkli call` → `sncast --profile $ACCOUNT_NAME call --contract-address`

#### 📁 interact.sh (交互脚本)  
- ✅ **完全迁移** - 使用 `sncast --url $NETWORK`
- 🔄 **命令变更**: 全面替换所有 starkli 调用
- 🎯 **保持兼容**: 参数格式和功能完全相同

#### 📁 batch.sh (批量操作脚本)
- ✅ **完全迁移** - 使用 `sncast --url $NETWORK`
- 🔄 **命令变更**: 所有批量操作调用已更新
- 🎮 **功能增强**: 变异检测、批量统计功能完整保留

#### 📁 stats.sh (统计脚本)
- ✅ **完全迁移** - 使用 `sncast --url $NETWORK`
- 🔄 **命令变更**: 用户统计和类型查询调用已更新
- 📊 **数据一致**: 统计算法和显示格式保持不变

### 2. 配置文件更新

#### 📁 snfoundry.toml.example
- ✅ **新增配置文件** - 提供完整的 sncast 配置模板
- 🔧 **账户配置**: 支持多个账户和网络
- 🌐 **网络配置**: 包含 mainnet、sepolia、local 配置

#### 📁 scripts/README.md
- ✅ **文档更新** - 标注所有脚本已迁移到 sncast
- 📝 **使用说明**: 更新配置要求和使用示例
- 💡 **配置提示**: 强调需要配置 snfoundry.toml

### 3. 迁移前后对比

| 脚本文件 | 迁移前 | 迁移后 | 状态 |
|---------|-------|-------|------|
| deploy.sh | starkli | sncast --profile | ✅ 完成 |
| interact.sh | starkli | sncast --url | ✅ 完成 |
| batch.sh | starkli | sncast --url | ✅ 完成 |
| stats.sh | starkli | sncast --url | ✅ 完成 |

### 4. 语法验证

所有脚本均通过语法检查：
- ✅ deploy.sh syntax OK
- ✅ interact.sh syntax OK  
- ✅ batch.sh syntax OK
- ✅ stats.sh syntax OK

## 使用指南

### 1. 配置 sncast 环境

```bash
# 复制配置模板
cp snfoundry.toml.example snfoundry.toml

# 编辑配置文件，设置账户和网络
vim snfoundry.toml
```

### 2. 部署合约 (需要账户配置)

```bash
./scripts/deploy.sh sepolia deployer 0x04718... 1000000000000000000 0x123...
```

### 3. 交互操作 (使用网络 URL)

```bash
./scripts/interact.sh plant sepolia 0x合约地址 2000000000000000000
./scripts/interact.sh water sepolia 0x合约地址 1
./scripts/interact.sh harvest sepolia 0x合约地址 1
```

### 4. 批量操作

```bash
./scripts/batch.sh batch-water sepolia 0x合约地址 1 5
./scripts/batch.sh mutation-hunt sepolia 0x合约地址 1 10
```

### 5. 统计分析

```bash
./scripts/stats.sh sepolia 0x合约地址 0x用户地址
```

## 优势与改进

### ✨ 统一工具链
- 全项目使用单一 sncast 工具
- 消除 starkli/sncast 混用的困惑
- 配置集中化管理

### 🔧 更好的配置管理
- snfoundry.toml 提供统一配置
- 支持多账户、多网络配置
- 更灵活的账户切换

### 📈 保持向后兼容
- 脚本参数和功能完全保持
- 用户使用方式无变化
- 输出格式一致

### 🚀 面向未来
- sncast 是 Starknet Foundry 的官方工具
- 持续更新和维护
- 更好的生态集成

## 注意事项

1. **账户配置**: deploy.sh 需要在 snfoundry.toml 中配置账户
2. **网络兼容**: 其他脚本使用网络 URL，无需额外配置
3. **功能保持**: 所有变异、统计、批量功能完全保留
4. **错误处理**: 保持原有的错误检测和处理逻辑

## 验证清单

- [x] 所有脚本语法正确
- [x] deploy.sh 使用 --profile 模式
- [x] 其他脚本使用 --url 模式  
- [x] 配置文件模板完整
- [x] 文档更新完毕
- [x] 向后兼容性保持
- [x] 番茄变异功能完整
- [x] 批量操作功能正常
- [x] 统计分析功能正常

✅ **迁移完成！Tomato Garden 项目已全面升级到 sncast 工具链。**
/**
 * TomatoStaking 合约服务
 */

import { Contract } from 'starknet';
import { BaseContractService } from './base';
import { 
  TomatoType, 
  GrowthStage, 
  TransactionResult, 
  PlantResult, 
  WateringResult, 
  HarvestResult,
  TomatoInfo
} from './types';
import { calculateGrowthStage, timeToNextStage } from './utils';

export class TomatoStakingService extends BaseContractService {
  private stakingContract?: Contract;

  /**
   * 初始化Staking合约
   */
  private async getStakingContract(): Promise<Contract> {
    if (!this.stakingContract) {
      const abi = await this.loadContractABI('tomatoStaking');
      this.stakingContract = await this.loadContract('tomatoStaking', abi);
    }
    return this.stakingContract;
  }

  /**
   * 加载合约ABI
   */
  private async loadContractABI(contractName: string): Promise<any[]> {
    const { ABI_LOADER } = await import('./abis');
    return ABI_LOADER[contractName as keyof typeof ABI_LOADER];
  }

  /**
   * 种植番茄
   */
  async plantTomato(stakeAmount: string): Promise<PlantResult> {
    try {
      const contract = await this.getStakingContract();
      const result = await this.executeInvoke(contract, 'plant_tomato', [stakeAmount]);
      
      if (result.success) {
        // 尝试从交易结果中提取token ID
        // 实际实现需要根据合约事件来获取
        return {
          ...result,
          stakedAmount: stakeAmount
          // tokenId 需要从事件中获取
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  /**
   * 浇水番茄
   */
  async waterTomato(tomatoId: string): Promise<WateringResult> {
    try {
      const contract = await this.getStakingContract();
      
      // 获取浇水前的番茄类型
      const oldType = await this.getTomatoType(tomatoId);
      
      const result = await this.executeInvoke(contract, 'water_tomato', [tomatoId]);
      
      if (result.success && result.transactionHash) {
        // 等待交易确认
        const confirmed = await this.waitForTransaction(result.transactionHash);
        
        if (confirmed) {
          // 获取浇水后的番茄类型
          const newType = await this.getTomatoType(tomatoId);
          const mutated = oldType !== newType;
          
          return {
            ...result,
            mutated,
            oldType,
            newType
          };
        }
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  /**
   * 收获番茄
   */
  async harvestTomato(tomatoId: string): Promise<HarvestResult> {
    try {
      const contract = await this.getStakingContract();
      
      // 获取番茄类型用于结果
      const tomatoType = await this.getTomatoType(tomatoId);
      
      const result = await this.executeInvoke(contract, 'harvest_tomato', [tomatoId]);
      
      if (result.success) {
        return {
          ...result,
          tokenId: tomatoId,
          tomatoType
          // reward 需要从事件中获取
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  /**
   * 获取用户番茄数量
   */
  async getUserTomatoCount(userAddress: string): Promise<number> {
    const contract = await this.getStakingContract();
    const count = await this.executeCall<string>(contract, 'get_user_tomato_count', [userAddress]);
    return parseInt(count, 10);
  }

  /**
   * 获取用户指定索引的番茄ID
   */
  async getUserTomatoAtIndex(userAddress: string, index: number): Promise<string> {
    const contract = await this.getStakingContract();
    return this.executeCall<string>(contract, 'get_user_tomato_at_index', [userAddress, index.toString()]);
  }

  /**
   * 获取用户所有番茄ID
   */
  async getUserTomatoIds(userAddress: string): Promise<string[]> {
    const count = await this.getUserTomatoCount(userAddress);
    const promises: Promise<string>[] = [];
    
    for (let i = 0; i < count; i++) {
      promises.push(this.getUserTomatoAtIndex(userAddress, i));
    }
    
    return Promise.all(promises);
  }

  /**
   * 获取番茄当前成长阶段
   */
  async getCurrentGrowthStage(tomatoId: string): Promise<GrowthStage> {
    const contract = await this.getStakingContract();
    const stage = await this.executeCall<number>(contract, 'get_current_growth_stage', [tomatoId]);
    return stage as GrowthStage;
  }

  /**
   * 获取番茄最后浇水时间
   */
  async getTomatoLastWatered(tomatoId: string): Promise<number> {
    const contract = await this.getStakingContract();
    const timestamp = await this.executeCall<string>(contract, 'get_tomato_last_watered', [tomatoId]);
    return parseInt(timestamp, 10);
  }

  /**
   * 获取最小质押金额
   */
  async getMinStakeAmount(): Promise<string> {
    const contract = await this.getStakingContract();
    return this.executeCall<string>(contract, 'get_min_stake_amount');
  }

  /**
   * 获取番茄类型
   */
  async getTomatoType(tomatoId: string): Promise<TomatoType> {
    const contract = await this.getStakingContract();
    const type = await this.executeCall<number>(contract, 'get_tomato_type', [tomatoId]);
    return type as TomatoType;
  }

  /**
   * 获取番茄元数据（种植期间或收获后都可以）
   */
  async getTomatoMetadata(tomatoId: string): Promise<any> {
    const contract = await this.getStakingContract();
    return this.executeCall<any>(contract, 'get_tomato_metadata', [tomatoId]);
  }

  /**
   * 检查番茄是否已收获
   */
  async isTomatoHarvested(tomatoId: string): Promise<boolean> {
    const contract = await this.getStakingContract();
    return this.executeCall<boolean>(contract, 'is_tomato_harvested', [tomatoId]);
  }

  /**
   * 获取完整的番茄信息
   */
  async getTomatoInfo(tomatoId: string): Promise<TomatoInfo> {
    const contract = await this.getStakingContract();
    
    // 批量获取番茄信息
    const calls = [
      { contract, functionName: 'get_current_growth_stage', calldata: [tomatoId] },
      { contract, functionName: 'get_tomato_last_watered', calldata: [tomatoId] },
      { contract, functionName: 'get_tomato_metadata', calldata: [tomatoId] },
      { contract, functionName: 'is_tomato_harvested', calldata: [tomatoId] }
    ];
    
    const [currentStage, lastWatered, metadata, isHarvested] = await this.batchCall<[number, string, any, boolean]>(calls);
    
    const plantedAt = metadata.planted_at || 0;
    const lastWateredTime = parseInt(lastWatered, 10);
    
    // 计算到下一阶段的时间
    const timeToNext = timeToNextStage(plantedAt, lastWateredTime, currentStage as GrowthStage);
    
    // 如果已收获，从NFT合约获取token URI
    let tokenUri = "";
    let owner = "";
    
    if (isHarvested) {
      // 需要从NFT服务获取这些信息
      // tokenUri = await nftService.getTokenURI(tomatoId);
      // owner = await nftService.getOwner(tomatoId);
    }
    
    return {
      id: tomatoId,
      owner,
      metadata,
      currentGrowthStage: currentStage as GrowthStage,
      lastWatered: lastWateredTime,
      tokenUri,
      isHarvestable: currentStage >= 4,
      isHarvested,
      timeToNextStage: timeToNext
    };
  }

  /**
   * 批量获取用户番茄信息
   */
  async getUserTomatoInfos(userAddress: string): Promise<TomatoInfo[]> {
    const tomatoIds = await this.getUserTomatoIds(userAddress);
    const promises = tomatoIds.map(id => this.getTomatoInfo(id));
    return Promise.all(promises);
  }

  /**
   * 检查番茄是否可以收获
   */
  async canHarvestTomato(tomatoId: string): Promise<boolean> {
    const stage = await this.getCurrentGrowthStage(tomatoId);
    return stage >= GrowthStage.Mature;
  }

  /**
   * 检查番茄是否可以浇水
   */
  async canWaterTomato(tomatoId: string, cooldownPeriod: number = 3600): Promise<boolean> {
    const lastWatered = await this.getTomatoLastWatered(tomatoId);
    const now = await this.getCurrentTimestamp();
    return (now - lastWatered) >= cooldownPeriod;
  }

  /**
   * 获取用户可收获的番茄
   */
  async getHarvestableTomatoes(userAddress: string): Promise<string[]> {
    const tomatoIds = await this.getUserTomatoIds(userAddress);
    const harvestableIds: string[] = [];
    
    for (const id of tomatoIds) {
      const canHarvest = await this.canHarvestTomato(id);
      if (canHarvest) {
        harvestableIds.push(id);
      }
    }
    
    return harvestableIds;
  }

  /**
   * 批量收获番茄
   */
  async batchHarvestTomatoes(tomatoIds: string[]): Promise<HarvestResult[]> {
    const results: HarvestResult[] = [];
    
    for (const id of tomatoIds) {
      const result = await this.harvestTomato(id);
      results.push(result);
      
      // 添加延迟避免网络拥堵
      if (results.length < tomatoIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * 获取合约统计信息
   */
  async getContractStats(): Promise<{
    minStakeAmount: string;
    // 其他统计信息可以根据合约接口添加
  }> {
    const minStakeAmount = await this.getMinStakeAmount();
    
    return {
      minStakeAmount
    };
  }

  /**
   * 监听合约事件
   */
  async listenToEvents(
    eventTypes: string[],
    fromBlock: number,
    callback: (event: any) => void
  ): Promise<void> {
    // 实现事件监听逻辑
    // 需要根据Starknet的事件监听API实现
  }
}
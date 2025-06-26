/**
 * Tomato Garden 集成服务
 * 整合 NFT 和 Staking 合约功能，提供统一的 API
 */

import { Account } from 'starknet';
import { TomatoNFTService } from './TomatoNFTService';
import { TomatoStakingService } from './TomatoStakingService';
import {
  TomatoInfo,
  UserStats,
  TomatoType,
  GrowthStage,
  PlantResult,
  WateringResult,
  HarvestResult,
  CollectionStats,
  NetworkStatus
} from './types';
import { calculateMutationRate, calculateCollectionScore, getCollectionLevel, formatSTRK, weiToSTRK } from './utils';

export class TomatoGardenService {
  private nftService: TomatoNFTService;
  private stakingService: TomatoStakingService;

  constructor(network: string = 'sepolia') {
    // this.network = network;
    this.nftService = new TomatoNFTService(network);
    this.stakingService = new TomatoStakingService(network);
  }

  /**
   * 连接账户
   */
  async connectAccount(account: Account): Promise<void> {
    await Promise.all([this.nftService.connectAccount(account), this.stakingService.connectAccount(account)]);
  }

  /**
   * 断开账户连接
   */
  disconnectAccount(): void {
    this.nftService.disconnectAccount();
    this.stakingService.disconnectAccount();
  }

  /**
   * 获取网络状态
   */
  async getNetworkStatus(): Promise<NetworkStatus> {
    return this.stakingService.getNetworkStatus();
  }

  /**
   * 种植番茄
   */
  async plantTomato(stakeAmount: string): Promise<PlantResult> {
    return this.stakingService.plantTomato(stakeAmount);
  }

  /**
   * 浇水番茄
   */
  async waterTomato(tomatoId: string): Promise<WateringResult> {
    return this.stakingService.waterTomato(tomatoId);
  }

  /**
   * 收获番茄
   */
  async harvestTomato(tomatoId: string): Promise<HarvestResult> {
    return this.stakingService.harvestTomato(tomatoId);
  }

  /**
   * 获取完整的番茄信息（合并NFT和Staking数据）
   */
  async getTomatoInfo(tomatoId: string): Promise<TomatoInfo> {
    // 首先从staking合约获取基础信息
    const tomatoInfo = await this.stakingService.getTomatoInfo(tomatoId);

    // 如果已收获，从NFT合约获取额外信息
    if (tomatoInfo.isHarvested) {
      try {
        const [owner, tokenUri] = await Promise.all([
          this.nftService.getOwnerOf(tomatoId),
          this.nftService.getTokenURI(tomatoId)
        ]);

        tomatoInfo.owner = owner;
        tomatoInfo.tokenUri = tokenUri;
      } catch (error) {
        // 如果NFT不存在，保持默认值
        console.warn(`NFT not found for tomato ${tomatoId}:`, error);
      }
    }

    return tomatoInfo;
  }

  /**
   * 获取用户所有番茄信息
   */
  async getUserTomatoInfos(userAddress: string): Promise<TomatoInfo[]> {
    const tomatoIds = await this.stakingService.getUserTomatoIds(userAddress);
    console.log(tomatoIds, 'ids');
    const promises = tomatoIds.map((id) => this.getTomatoInfo(id));
    return Promise.all(promises);
  }

  /**
   * 获取用户已收获的NFT数据
   */
  async getUserHarvestedNFTs(userAddress: string): Promise<TomatoInfo[]> {
    const allTomatoes = await this.getUserTomatoInfos(userAddress);
    return allTomatoes.filter((tomato) => tomato.isHarvested);
  }

  /**
   * 获取用户的NFT收藏详情
   */
  async getUserNFTCollection(userAddress: string): Promise<
    Array<{
      tokenId: string;
      owner: string;
      metadata: any;
      tokenUri: string;
      type: string;
      rarity: string;
      harvestedAt: number;
    }>
  > {
    const harvestedTomatoes = await this.getUserHarvestedNFTs(userAddress);

    return harvestedTomatoes.map((tomato) => ({
      tokenId: tomato.id,
      owner: tomato.owner,
      metadata: tomato.metadata,
      tokenUri: tomato.tokenUri,
      type: this.getTomatoTypeName(tomato.metadata.tomato_type),
      rarity: this.getTomatoRarity(tomato.metadata.tomato_type),
      harvestedAt: tomato.metadata.harvested_at
    }));
  }

  /**
   * 获取番茄类型名称
   */
  private getTomatoTypeName(type: TomatoType): string {
    const typeNames = {
      [TomatoType.Normal]: '普通番茄',
      [TomatoType.Yellow]: '黄色番茄',
      [TomatoType.Purple]: '紫色番茄',
      [TomatoType.Flame]: '火焰番茄',
      [TomatoType.Ice]: '冰霜番茄',
      [TomatoType.Rainbow]: '彩虹番茄'
    };
    return typeNames[type] || '未知';
  }

  /**
   * 获取番茄稀有度
   */
  private getTomatoRarity(type: TomatoType): string {
    const rarities = {
      [TomatoType.Normal]: '普通',
      [TomatoType.Yellow]: '不常见',
      [TomatoType.Purple]: '不常见',
      [TomatoType.Flame]: '稀有',
      [TomatoType.Ice]: '史诗',
      [TomatoType.Rainbow]: '传说'
    };
    return rarities[type] || '未知';
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(userAddress: string): Promise<UserStats> {
    const tomatoes = await this.getUserTomatoInfos(userAddress);

    console.log(tomatoes, 'list');
    const stats: UserStats = {
      totalTomatoes: tomatoes.length,
      harvestableTomatoes: 0,
      tomatoesByType: {
        [TomatoType.Normal]: 0,
        [TomatoType.Yellow]: 0,
        [TomatoType.Purple]: 0,
        [TomatoType.Flame]: 0,
        [TomatoType.Ice]: 0,
        [TomatoType.Rainbow]: 0
      },
      tomatoesByStage: {
        [GrowthStage.Seed]: 0,
        [GrowthStage.Seedling]: 0,
        [GrowthStage.Growing]: 0,
        [GrowthStage.Flowering]: 0,
        [GrowthStage.Mature]: 0
      },
      mutationRate: 0,
      collectionValue: 0,
      totalStaked: '0',
      totalRewards: '0'
    };

    let totalStaked = 0;

    for (const tomato of tomatoes) {
      // 统计类型
      if (tomato.metadata) {
        stats.tomatoesByType[tomato.metadata.tomato_type]++;
      }

      // 统计阶段
      stats.tomatoesByStage[tomato.currentGrowthStage]++;

      // 可收获数量
      if (tomato.isHarvestable) {
        stats.harvestableTomatoes++;
      }

      // 总质押金额
      if (tomato.metadata?.staked_amount) {
        totalStaked += weiToSTRK(tomato.metadata.staked_amount);
      }
    }

    stats.totalStaked = formatSTRK(totalStaked);
    stats.mutationRate = calculateMutationRate(stats.totalTomatoes, stats.tomatoesByType);
    stats.collectionValue = calculateCollectionScore(stats.tomatoesByType);

    return stats;
  }

  /**
   * 获取收藏统计
   */
  async getCollectionStats(userAddress: string): Promise<CollectionStats> {
    const userStats = await this.getUserStats(userAddress);
    const totalTypes = Object.keys(TomatoType).length / 2; // enum 有数字键和字符串键

    const collectedTypes = Object.values(userStats.tomatoesByType).filter((count) => count > 0).length;

    const missingTypes: TomatoType[] = [];
    for (const [type, count] of Object.entries(userStats.tomatoesByType)) {
      if (count === 0) {
        missingTypes.push(parseInt(type) as unknown as TomatoType);
      }
    }

    // 找到最稀有的类型
    let rarest: TomatoType | null = null;
    const rarityOrder = [TomatoType.Rainbow, TomatoType.Ice, TomatoType.Flame, TomatoType.Purple, TomatoType.Yellow];
    for (const type of rarityOrder) {
      if (userStats.tomatoesByType[type] > 0) {
        rarest = type;
        break;
      }
    }

    return {
      totalTypes,
      collectedTypes,
      rarest,
      completionRate: (collectedTypes / totalTypes) * 100,
      missingTypes
    };
  }

  /**
   * 获取可收获的番茄
   */
  async getHarvestableTomatoes(userAddress: string): Promise<string[]> {
    return this.stakingService.getHarvestableTomatoes(userAddress);
  }

  /**
   * 批量收获番茄
   */
  async batchHarvestTomatoes(tomatoIds: string[]): Promise<HarvestResult[]> {
    return this.stakingService.batchHarvestTomatoes(tomatoIds);
  }

  /**
   * 检查番茄是否可以浇水
   */
  async canWaterTomato(tomatoId: string, cooldownPeriod: number = 3600): Promise<boolean> {
    return this.stakingService.canWaterTomato(tomatoId, cooldownPeriod);
  }

  /**
   * 获取最小质押金额
   */
  async getMinStakeAmount(): Promise<string> {
    return this.stakingService.getMinStakeAmount();
  }

  /**
   * 获取合约基本信息
   */
  async getContractInfo(): Promise<{
    nft: { name: string; symbol: string };
    staking: { minStakeAmount: string };
  }> {
    const [nftInfo, stakingInfo] = await Promise.all([
      this.nftService.getContractInfo(),
      this.stakingService.getContractStats()
    ]);

    return {
      nft: nftInfo,
      staking: stakingInfo
    };
  }

  /**
   * 获取用户收藏等级
   */
  async getUserCollectionLevel(userAddress: string): Promise<string> {
    const userStats = await this.getUserStats(userAddress);
    return getCollectionLevel(userStats.collectionValue);
  }

  /**
   * 获取用户番茄按类型分组
   */
  async getUserTomatoesByType(userAddress: string): Promise<Record<TomatoType, TomatoInfo[]>> {
    const tomatoes = await this.getUserTomatoInfos(userAddress);
    const grouped: Record<TomatoType, TomatoInfo[]> = {
      [TomatoType.Normal]: [],
      [TomatoType.Yellow]: [],
      [TomatoType.Purple]: [],
      [TomatoType.Flame]: [],
      [TomatoType.Ice]: [],
      [TomatoType.Rainbow]: []
    };

    for (const tomato of tomatoes) {
      grouped[tomato.metadata.tomato_type].push(tomato);
    }

    return grouped;
  }

  /**
   * 获取用户番茄按阶段分组
   */
  async getUserTomatoesByStage(userAddress: string): Promise<Record<GrowthStage, TomatoInfo[]>> {
    const tomatoes = await this.getUserTomatoInfos(userAddress);
    const grouped: Record<GrowthStage, TomatoInfo[]> = {
      [GrowthStage.Seed]: [],
      [GrowthStage.Seedling]: [],
      [GrowthStage.Growing]: [],
      [GrowthStage.Flowering]: [],
      [GrowthStage.Mature]: []
    };

    for (const tomato of tomatoes) {
      grouped[tomato.currentGrowthStage].push(tomato);
    }

    return grouped;
  }

  /**
   * 计算到下一阶段的时间
   */
  // private calculateTimeToNextStage(plantedAt: number, lastWatered: number, currentStage: GrowthStage): number {
  //   const GROWTH_TIME_PER_STAGE = 86400; // 24小时
  //   const WATERING_ACCELERATION = 3;

  //   if (currentStage >= GrowthStage.Mature) return 0;

  //   const now = Math.floor(Date.now() / 1000);
  //   const nextStage = currentStage + 1;
  //   const requiredTime = nextStage * GROWTH_TIME_PER_STAGE;

  //   let elapsedTime = now - plantedAt;
  //   if (lastWatered > plantedAt) {
  //     const wateredTime = now - lastWatered;
  //     const preWaterTime = lastWatered - plantedAt;
  //     elapsedTime = preWaterTime + wateredTime * WATERING_ACCELERATION;
  //   }

  //   return Math.max(0, requiredTime - elapsedTime);
  // }

  /**
   * 监听合约事件
   */
  // async listenToEvents(eventTypes: string[], fromBlock: number, callback: (event: any) => void): Promise<void> {
  //   // 同时监听NFT和Staking合约的事件
  //   // await Promise.all([
  //   //   this.nftService.listenToTransferEvents(fromBlock, callback)
  //   //   // this.stakingService.listenToEvents(eventTypes, fromBlock, callback)
  //   // ]);
  // }

  /**
   * 获取网络配置
   */
  getNetworkConfig() {
    return this.stakingService.getNetworkConfig();
  }

  /**
   * 获取合约地址
   */
  getContractAddresses() {
    const config = this.getNetworkConfig();
    return {
      nft: config.contracts.tomatoNFT,
      staking: config.contracts.tomatoStaking,
      strk: config.contracts.strkToken
    };
  }
}

/**
 * Tomato Garden 类型定义
 */

// 番茄类型枚举
export enum TomatoType {
  Normal = 0,
  Yellow = 1,
  Purple = 2,
  Flame = 3,
  Ice = 4,
  Rainbow = 5
}

// 番茄类型信息
export interface TomatoTypeInfo {
  name: string;
  chineseName: string;
  emoji: string;
  rarity: string;
  description: string;
  mutationPossible: boolean;
}

export const TOMATO_TYPE_INFO: Record<TomatoType, TomatoTypeInfo> = {
  [TomatoType.Normal]: {
    name: 'Normal',
    chineseName: '普通',
    emoji: '🍅',
    rarity: '普通',
    description: '默认番茄类型，可以通过浇水变异为其他类型',
    mutationPossible: true
  },
  [TomatoType.Yellow]: {
    name: 'Yellow',
    chineseName: '黄色',
    emoji: '🟡',
    rarity: '不常见',
    description: '黄色变异番茄，散发着温暖的金色光芒',
    mutationPossible: false
  },
  [TomatoType.Purple]: {
    name: 'Purple',
    chineseName: '紫色',
    emoji: '🟣',
    rarity: '不常见',
    description: '紫色变异番茄，神秘而优雅',
    mutationPossible: false
  },
  [TomatoType.Flame]: {
    name: 'Flame',
    chineseName: '火焰',
    emoji: '🔥',
    rarity: '稀有',
    description: '火焰番茄，燃烧着炽热的能量',
    mutationPossible: false
  },
  [TomatoType.Ice]: {
    name: 'Ice',
    chineseName: '冰霜',
    emoji: '❄️',
    rarity: '史诗',
    description: '冰霜番茄，散发着冰冷的寒气',
    mutationPossible: false
  },
  [TomatoType.Rainbow]: {
    name: 'Rainbow',
    chineseName: '彩虹',
    emoji: '🌈',
    rarity: '传说',
    description: '彩虹番茄，拥有七彩斑斓的色彩，极其罕见',
    mutationPossible: false
  }
};

// 成长阶段枚举
export enum GrowthStage {
  Seed = 0,
  Seedling = 1,
  Growing = 2,
  Flowering = 3,
  Mature = 4
}

// 成长阶段信息
export interface GrowthStageInfo {
  name: string;
  chineseName: string;
  emoji: string;
  description: string;
  harvestable: boolean;
}

export const GROWTH_STAGE_INFO: Record<GrowthStage, GrowthStageInfo> = {
  [GrowthStage.Seed]: {
    name: 'Seed',
    chineseName: '种子期',
    emoji: '🌱',
    description: '番茄刚刚种植，还是一颗种子',
    harvestable: false
  },
  [GrowthStage.Seedling]: {
    name: 'Seedling',
    chineseName: '幼苗期',
    emoji: '🌿',
    description: '种子发芽，长出了小幼苗',
    harvestable: false
  },
  [GrowthStage.Growing]: {
    name: 'Growing',
    chineseName: '成长期',
    emoji: '🍃',
    description: '幼苗茁壮成长，叶子越来越多',
    harvestable: false
  },
  [GrowthStage.Flowering]: {
    name: 'Flowering',
    chineseName: '开花期',
    emoji: '🌺',
    description: '植物开始开花，即将结果',
    harvestable: false
  },
  [GrowthStage.Mature]: {
    name: 'Mature',
    chineseName: '成熟期',
    emoji: '🍅',
    description: '番茄完全成熟，可以收获为NFT',
    harvestable: true
  }
};

// 番茄元数据
export interface TomatoMetadata {
  growth_stage: number;
  planted_at: number;
  harvested_at: number;
  staked_amount: string;
  tomato_type: TomatoType;
}

// 完整的番茄信息
export interface TomatoInfo {
  id: string;
  owner: string;
  metadata: TomatoMetadata;
  currentGrowthStage: GrowthStage;
  lastWatered: number;
  tokenUri: string;
  isHarvestable: boolean;
  isHarvested: boolean; // 新增：是否已收获（是否已铸造NFT）
  timeToNextStage?: number;
}

// 用户统计信息
export interface UserStats {
  totalTomatoes: number;
  harvestableTomatoes: number;
  tomatoesByType: Record<TomatoType, number>;
  tomatoesByStage: Record<GrowthStage, number>;
  mutationRate: number;
  collectionValue: number;
  totalStaked: string;
  totalRewards: string;
}

// 交易结果
export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  data?: any;
}

// 水滴结果（包含变异检测）
export interface WateringResult extends TransactionResult {
  mutated?: boolean;
  oldType?: TomatoType;
  newType?: TomatoType;
}

// 收获结果
export interface HarvestResult extends TransactionResult {
  tokenId?: string;
  reward?: string;
  tomatoType?: TomatoType;
}

// 种植结果
export interface PlantResult extends TransactionResult {
  tokenId?: string;
  stakedAmount?: string;
}

// 网络状态
export interface NetworkStatus {
  connected: boolean;
  network?: string;
  account?: string;
  balance?: string;
}

// 合约事件
export interface ContractEvent {
  eventName: string;
  data: any;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}

// 番茄收集统计
export interface CollectionStats {
  totalTypes: number;
  collectedTypes: number;
  rarest: TomatoType | null;
  completionRate: number;
  missingTypes: TomatoType[];
}

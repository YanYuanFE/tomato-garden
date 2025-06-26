/**
 * Tomato Garden Type Definitions
 */

// Tomato type enumeration
export enum TomatoType {
  Normal = 'Normal',
  Yellow = 'Yellow',
  Purple = 'Purple',
  Flame = 'Flame',
  Ice = 'Ice',
  Rainbow = 'Rainbow'
}

// Tomato type information
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
    chineseName: 'Common',
    emoji: '🍅',
    rarity: 'Common',
    description: 'Default tomato type, can mutate into other types through watering',
    mutationPossible: true
  },
  [TomatoType.Yellow]: {
    name: 'Yellow',
    chineseName: 'Yellow',
    emoji: '🟡',
    rarity: 'Uncommon',
    description: 'Yellow mutant tomato, radiating warm golden light',
    mutationPossible: false
  },
  [TomatoType.Purple]: {
    name: 'Purple',
    chineseName: 'Purple',
    emoji: '🟣',
    rarity: 'Uncommon',
    description: 'Purple mutant tomato, mysterious and elegant',
    mutationPossible: false
  },
  [TomatoType.Flame]: {
    name: 'Flame',
    chineseName: 'Flame',
    emoji: '🔥',
    rarity: 'Rare',
    description: 'Flame tomato, burning with intense energy',
    mutationPossible: false
  },
  [TomatoType.Ice]: {
    name: 'Ice',
    chineseName: 'Frost',
    emoji: '❄️',
    rarity: 'Epic',
    description: 'Frost tomato, emanating icy coldness',
    mutationPossible: false
  },
  [TomatoType.Rainbow]: {
    name: 'Rainbow',
    chineseName: 'Rainbow',
    emoji: '🌈',
    rarity: 'Legendary',
    description: 'Rainbow tomato, with colorful brilliance, extremely rare',
    mutationPossible: false
  }
};

// Growth stage enumeration
export enum GrowthStage {
  Seed = 0,
  Seedling = 1,
  Growing = 2,
  Flowering = 3,
  Mature = 4
}

// Growth stage information
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
    chineseName: 'Seed Stage',
    emoji: '🌱',
    description: 'Tomato just planted, still a seed',
    harvestable: false
  },
  [GrowthStage.Seedling]: {
    name: 'Seedling',
    chineseName: 'Seedling Stage',
    emoji: '🌿',
    description: 'Seed has sprouted, growing small seedlings',
    harvestable: false
  },
  [GrowthStage.Growing]: {
    name: 'Growing',
    chineseName: 'Growing Stage',
    emoji: '🍃',
    description: 'Seedling growing vigorously, more and more leaves',
    harvestable: false
  },
  [GrowthStage.Flowering]: {
    name: 'Flowering',
    chineseName: 'Flowering Stage',
    emoji: '🌺',
    description: 'Plant starts flowering, about to bear fruit',
    harvestable: false
  },
  [GrowthStage.Mature]: {
    name: 'Mature',
    chineseName: 'Mature Stage',
    emoji: '🍅',
    description: 'Tomato fully mature, can be harvested as NFT',
    harvestable: true
  }
};

// Tomato metadata
export interface TomatoMetadata {
  growth_stage: number;
  planted_at: number;
  harvested_at: number;
  staked_amount: string;
  tomato_type: TomatoType;
}

// Complete tomato information
export interface TomatoInfo {
  id: string;
  owner: string;
  metadata: TomatoMetadata;
  currentGrowthStage: GrowthStage;
  lastWatered: number;
  tokenUri: string;
  isHarvestable: boolean;
  isHarvested: boolean; // New: whether harvested (whether NFT has been minted)
  timeToNextStage?: number;
}

// User statistics
export interface UserStats {
  totalTomatoes: number;
  harvestableTomatoes: number;
  tomatoesByType: Record<TomatoType, number>;
  tomatoesByStage: Record<GrowthStage, number>;
  mutationRate: number;
  collectionValue: number;
  totalStaked: string | number;
  totalRewards: string;
}

// Transaction result
export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  data?: any;
}

// Watering result (including mutation detection)
export interface WateringResult extends TransactionResult {
  mutated?: boolean;
  oldType?: TomatoType;
  newType?: TomatoType;
}

// Harvest result
export interface HarvestResult extends TransactionResult {
  tokenId?: string;
  reward?: string;
  tomatoType?: TomatoType;
}

// Plant result
export interface PlantResult extends TransactionResult {
  tokenId?: string;
  stakedAmount?: string;
}

// Network status
export interface NetworkStatus {
  connected: boolean;
  network?: string;
  account?: string;
  balance?: string;
}

// Contract event
export interface ContractEvent {
  eventName: string;
  data: any;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}

// Tomato collection statistics
export interface CollectionStats {
  totalTypes: number;
  collectedTypes: number;
  rarest: TomatoType | null;
  completionRate: number;
  missingTypes: TomatoType[];
}

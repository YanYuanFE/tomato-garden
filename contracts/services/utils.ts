/**
 * Tomato Garden 工具函数
 */

import { CONSTANTS } from './config';
import { TomatoType, GrowthStage, TOMATO_TYPE_INFO, GROWTH_STAGE_INFO } from './types';

/**
 * 格式化 STRK 金额
 */
export function formatSTRK(amount: string | number): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  const strk = value / Math.pow(10, CONSTANTS.STRK_DECIMALS);
  return strk.toFixed(6);
}

/**
 * 将 STRK 转换为 wei
 */
export function strkToWei(strk: string | number): string {
  const value = typeof strk === 'string' ? parseFloat(strk) : strk;
  const wei = value * Math.pow(10, CONSTANTS.STRK_DECIMALS);
  return Math.floor(wei).toString();
}

/**
 * 将 wei 转换为 STRK
 */
export function weiToSTRK(wei: string): number {
  return parseFloat(wei) / Math.pow(10, CONSTANTS.STRK_DECIMALS);
}

/**
 * 格式化时间戳为可读时间
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN');
}

/**
 * 计算时间差（秒）
 */
export function getTimeDiff(timestamp: number): number {
  return Math.floor(Date.now() / 1000) - timestamp;
}

/**
 * 计算番茄成长阶段
 */
export function calculateGrowthStage(
  plantedAt: number,
  lastWatered: number,
  currentTime?: number
): GrowthStage {
  const now = currentTime || Math.floor(Date.now() / 1000);
  
  // 基础成长时间
  let growthTime = now - plantedAt;
  
  // 如果有浇水记录，浇水后的时间享受3倍加速
  if (lastWatered > plantedAt) {
    const wateredTime = now - lastWatered;
    const preWaterTime = lastWatered - plantedAt;
    growthTime = preWaterTime + (wateredTime * CONSTANTS.WATERING_ACCELERATION);
  }
  
  const stage = Math.floor(growthTime / CONSTANTS.GROWTH_TIME_PER_STAGE);
  return Math.min(stage, CONSTANTS.MAX_GROWTH_STAGE) as GrowthStage;
}

/**
 * 计算到下一阶段的剩余时间（秒）
 */
export function timeToNextStage(
  plantedAt: number,
  lastWatered: number,
  currentStage: GrowthStage,
  currentTime?: number
): number | null {
  if (currentStage >= CONSTANTS.MAX_GROWTH_STAGE) {
    return null; // 已经成熟
  }
  
  const now = currentTime || Math.floor(Date.now() / 1000);
  const nextStage = currentStage + 1;
  
  // 计算下一阶段需要的总时间
  const requiredTime = nextStage * CONSTANTS.GROWTH_TIME_PER_STAGE;
  
  // 计算当前已经过的有效时间
  let elapsedTime = now - plantedAt;
  if (lastWatered > plantedAt) {
    const wateredTime = now - lastWatered;
    const preWaterTime = lastWatered - plantedAt;
    elapsedTime = preWaterTime + (wateredTime * CONSTANTS.WATERING_ACCELERATION);
  }
  
  const remainingTime = requiredTime - elapsedTime;
  return Math.max(0, remainingTime);
}

/**
 * 格式化剩余时间为可读格式
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return "已就绪";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${secs}秒`;
  } else {
    return `${secs}秒`;
  }
}

/**
 * 获取番茄类型信息
 */
export function getTomatoTypeInfo(type: TomatoType) {
  return TOMATO_TYPE_INFO[type];
}

/**
 * 获取成长阶段信息
 */
export function getGrowthStageInfo(stage: GrowthStage) {
  return GROWTH_STAGE_INFO[stage];
}

/**
 * 计算变异概率
 */
export function getMutationProbability(tomatoType: TomatoType): number {
  return tomatoType === TomatoType.Normal ? CONSTANTS.MUTATION_RATE : 0;
}

/**
 * 计算收藏价值分数
 */
export function calculateCollectionScore(tomatoesByType: Record<TomatoType, number>): number {
  let score = 0;
  score += tomatoesByType[TomatoType.Yellow] * 1;
  score += tomatoesByType[TomatoType.Purple] * 1;
  score += tomatoesByType[TomatoType.Flame] * 3;
  score += tomatoesByType[TomatoType.Ice] * 5;
  score += tomatoesByType[TomatoType.Rainbow] * 10;
  return score;
}

/**
 * 获取收藏等级
 */
export function getCollectionLevel(score: number): string {
  if (score === 0) return "新手收藏家 🌱";
  if (score < 5) return "初级收藏家 🌿";
  if (score < 15) return "中级收藏家 🍃";
  if (score < 30) return "高级收藏家 🌺";
  return "传奇收藏家 👑";
}

/**
 * 计算变异率
 */
export function calculateMutationRate(
  totalTomatoes: number,
  tomatoesByType: Record<TomatoType, number>
): number {
  if (totalTomatoes === 0) return 0;
  const mutatedCount = totalTomatoes - (tomatoesByType[TomatoType.Normal] || 0);
  return (mutatedCount / totalTomatoes) * 100;
}

/**
 * 生成 IPFS URI
 */
export function generateTokenURI(tomatoType: TomatoType, baseUri: string): string {
  const typeInfo = getTomatoTypeInfo(tomatoType);
  return `${baseUri}${typeInfo.name.toLowerCase()}.json`;
}

/**
 * 解析合约地址（确保格式正确）
 */
export function parseContractAddress(address: string): string {
  if (!address.startsWith('0x')) {
    return `0x${address}`;
  }
  return address;
}

/**
 * 验证地址格式
 */
export function isValidAddress(address: string): boolean {
  const cleanAddress = address.replace('0x', '');
  return /^[0-9a-fA-F]{1,64}$/.test(cleanAddress);
}

/**
 * 截断地址显示
 */
export function truncateAddress(address: string, start: number = 6, end: number = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * 生成随机种子（用于测试）
 */
export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000);
}

/**
 * 检查是否可以收获
 */
export function canHarvest(stage: GrowthStage): boolean {
  return stage >= GrowthStage.Mature;
}

/**
 * 检查是否可以浇水
 */
export function canWater(lastWatered: number, cooldownPeriod: number = 3600): boolean {
  const now = Math.floor(Date.now() / 1000);
  return (now - lastWatered) >= cooldownPeriod;
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
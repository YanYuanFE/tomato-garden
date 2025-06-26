/**
 * Leaderboard Service - 获取全局排行榜数据
 * 不依赖事件日志，直接通过合约方法获取数据
 */

import { TomatoNFTService } from './TomatoNFTService';
import { TomatoStakingService } from './TomatoStakingService';
import { TOMATO_TYPE_INFO } from './types';

export interface LeaderboardEntry {
  address: string;
  name?: string; // 可能从ENS或其他服务获取
  avatar?: string;
  totalTomatoes: number;
  harvestedNFTs: number;
  rareCollected: number;
  totalStaked: string;
  rank: number;
}

export interface GlobalStats {
  totalPlayers: number;
  totalTomatoes: number;
  totalNFTsHarvested: number;
  totalStaked: string;
  topHolders: LeaderboardEntry[];
}

export class LeaderboardService {
  private nftService: TomatoNFTService;
  private stakingService: TomatoStakingService;

  constructor(network: string = 'sepolia') {
    this.nftService = new TomatoNFTService(network);
    this.stakingService = new TomatoStakingService(network);
  }

  /**
   * 通过遍历tokenId范围获取所有NFT holders
   * 这种方法比解析事件日志更简单可靠
   */
  async getAllNFTHolders(): Promise<Set<string>> {
    const holders = new Set<string>();

    try {
      // 从合约获取总供应量，如果没有这个方法，我们可以从1开始遍历直到遇到不存在的token
      // 假设tokenId从1开始递增
      let tokenId = 1;
      let consecutiveNotFound = 0;
      const maxConsecutiveNotFound = 10; // 连续10个不存在的token就停止

      while (consecutiveNotFound < maxConsecutiveNotFound) {
        try {
          const owner = await this.nftService.getOwnerOf(tokenId.toString());
          if (owner && owner !== '0x0') {
            const hexStr = '0x' + BigInt(owner).toString(16);
            holders.add(hexStr);
            consecutiveNotFound = 0; // 重置计数器
          }
        } catch (error) {
          // Token不存在
          // 退出循环
          break;
        }
        tokenId++;

        // 防止无限循环，设置一个合理的上限
        if (tokenId > 10000) {
          break;
        }
      }

      console.log(`Found ${holders.size} NFT holders from ${tokenId - 1} tokens checked`);
      return holders;
    } catch (error) {
      console.error('Failed to get NFT holders:', error);
      return new Set();
    }
  }

  /**
   * 获取所有活跃用户（有番茄种植记录的用户）
   * 通过检查用户番茄数量来发现活跃用户
   */
  async getActiveUsers(): Promise<Set<string>> {
    const activeUsers = new Set<string>();

    try {
      // 首先获取NFT holders
      const nftHolders = await this.getAllNFTHolders();

      // 将NFT holders添加到活跃用户列表
      nftHolders.forEach((holder) => activeUsers.add(holder));

      console.log(`Found ${activeUsers.size} active users`);
      return activeUsers;
    } catch (error) {
      console.error('Failed to get active users:', error);
      return new Set();
    }
  }

  /**
   * 获取用户的完整统计数据
   */
  async getUserLeaderboardStats(userAddress: string): Promise<LeaderboardEntry> {
    try {
      // 获取用户的番茄数量
      const tomatoCount = await this.stakingService.getUserTomatoCount(userAddress);

      // 获取用户的NFT余额（已收获的NFT）
      let nftBalance = 0;
      try {
        nftBalance = await this.nftService.getBalanceOf(userAddress);
      } catch (error) {
        console.warn(`Failed to get NFT balance for ${userAddress}:`, error);
      }

      // 获取用户的所有番茄ID并统计
      let totalStaked = '0';
      let rareCount = 0;

      for (let i = 0; i < tomatoCount; i++) {
        try {
          const tomatoId = await this.stakingService.getUserTomatoAtIndex(userAddress, i);
          // 获取番茄信息（包括元数据）
          const tomatoInfo = await this.stakingService.getTomatoInfo(tomatoId.toString());
          const metadata = tomatoInfo.metadata;

          if (metadata) {
            // 累计质押金额
            const staked = parseFloat(metadata.staked_amount || '0');
            totalStaked = (parseFloat(totalStaked) + staked).toString();

            // 统计稀有番茄
            const typeInfo = TOMATO_TYPE_INFO[metadata.tomato_type as keyof typeof TOMATO_TYPE_INFO];
            if (typeInfo && (typeInfo.rarity === '稀有' || typeInfo.rarity === '史诗' || typeInfo.rarity === '传说')) {
              rareCount++;
            }
          }
        } catch (error) {
          // 忽略单个番茄获取失败的情况
          console.warn(`Failed to get tomato data for user ${userAddress} at index ${i}:`, error);
        }
      }

      return {
        address: userAddress,
        name: this.formatAddress(userAddress),
        totalTomatoes: tomatoCount,
        harvestedNFTs: nftBalance,
        rareCollected: rareCount,
        totalStaked,
        rank: 0 // 稍后计算
      };
    } catch (error) {
      console.error(`Failed to get stats for ${userAddress}:`, error);
      return {
        address: userAddress,
        name: this.formatAddress(userAddress),
        totalTomatoes: 0,
        harvestedNFTs: 0,
        rareCollected: 0,
        totalStaked: '0',
        rank: 0
      };
    }
  }

  /**
   * 获取全局排行榜
   */
  async getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      // 获取所有活跃用户
      const activeUsers = await this.getActiveUsers();
      const userAddresses = Array.from(activeUsers);

      if (userAddresses.length === 0) {
        console.log('No active users found');
        return [];
      }

      console.log(`Getting leaderboard stats for ${userAddresses.length} users`);

      // 批量获取用户统计数据
      const leaderboardPromises = userAddresses.map((address) => this.getUserLeaderboardStats(address));

      const leaderboardEntries = await Promise.all(leaderboardPromises);

      // 按收获的NFT数量排序
      const sortedLeaderboard = leaderboardEntries
        .filter((entry) => entry.totalTomatoes > 0 || entry.harvestedNFTs > 0) // 至少有一些活动
        .sort((a, b) => {
          // 主要按收获NFT数量排序
          if (b.harvestedNFTs !== a.harvestedNFTs) {
            return b.harvestedNFTs - a.harvestedNFTs;
          }
          // 次要按稀有度排序
          if (b.rareCollected !== a.rareCollected) {
            return b.rareCollected - a.rareCollected;
          }
          // 最后按总番茄数排序
          return b.totalTomatoes - a.totalTomatoes;
        })
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

      console.log(`Generated leaderboard with ${sortedLeaderboard.length} entries`);
      return sortedLeaderboard;
    } catch (error) {
      console.error('Failed to get global leaderboard:', error);
      return [];
    }
  }

  /**
   * 获取全局统计数据
   */
  async getGlobalStats(): Promise<GlobalStats> {
    try {
      const leaderboard = await this.getGlobalLeaderboard();

      const totalPlayers = leaderboard.length;
      const totalNFTsHarvested = leaderboard.reduce((sum, entry) => sum + entry.harvestedNFTs, 0);
      const totalTomatoes = leaderboard.reduce((sum, entry) => sum + entry.totalTomatoes, 0);
      const totalStaked = leaderboard
        .reduce((sum, entry) => {
          return sum + parseFloat(entry.totalStaked || '0');
        }, 0)
        .toString();

      return {
        totalPlayers,
        totalTomatoes,
        totalNFTsHarvested,
        totalStaked,
        topHolders: leaderboard.slice(0, 10)
      };
    } catch (error) {
      console.error('Failed to get global stats:', error);
      return {
        totalPlayers: 0,
        totalTomatoes: 0,
        totalNFTsHarvested: 0,
        totalStaked: '0',
        topHolders: []
      };
    }
  }

  /**
   * 查找用户在排行榜中的位置
   */
  async getUserRank(userAddress: string): Promise<number> {
    try {
      const leaderboard = await this.getGlobalLeaderboard();
      const userEntry = leaderboard.find((entry) => entry.address.toLowerCase() === userAddress.toLowerCase());

      return userEntry?.rank || 0;
    } catch (error) {
      console.error('Failed to get user rank:', error);
      return 0;
    }
  }

  /**
   * 格式化地址显示
   */
  private formatAddress(address: string): string {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

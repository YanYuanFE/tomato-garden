/**
 * TomatoNFT 合约服务
 */

import { cairo, CallData, Contract } from 'starknet';
import { BaseContractService } from './base';
import { TomatoMetadata, TomatoType } from './types';

export class TomatoNFTService extends BaseContractService {
  private nftContract?: Contract;

  /**
   * 初始化NFT合约
   */
  private async getNFTContract(): Promise<Contract> {
    if (!this.nftContract) {
      // 这里需要导入实际的ABI
      const abi = await this.loadContractABI('tomatoNFT');
      this.nftContract = await this.loadContract('tomatoNFT', abi);
    }
    return this.nftContract;
  }

  /**
   * 加载合约ABI
   */
  private async loadContractABI(contractName: string): Promise<any[]> {
    const { ABI_LOADER } = await import('./abis');
    return ABI_LOADER[contractName as keyof typeof ABI_LOADER];
  }

  /**
   * 获取NFT名称
   */
  async getName(): Promise<string> {
    const contract = await this.getNFTContract();
    return this.executeCall<string>(contract, 'name');
  }

  /**
   * 获取NFT符号
   */
  async getSymbol(): Promise<string> {
    const contract = await this.getNFTContract();
    return this.executeCall<string>(contract, 'symbol');
  }

  /**
   * 获取用户NFT余额
   */
  async getBalanceOf(owner: string): Promise<number> {
    const contract = await this.getNFTContract();
    const balance = await this.executeCall<string>(contract, 'balance_of', [owner]);
    return parseInt(balance, 10);
  }

  /**
   * 获取NFT所有者
   */
  async getOwnerOf(tokenId: string): Promise<string> {
    const contract = await this.getNFTContract();
    return this.executeCall<string>(contract, 'owner_of', [tokenId]);
  }

  /**
   * 获取Token URI
   */
  async getTokenURI(tokenId: string): Promise<string> {
    const contract = await this.getNFTContract();
    return this.executeCall<string>(contract, 'token_uri', [tokenId]);
  }

  /**
   * 获取番茄元数据
   */
  async getTomatoMetadata(tokenId: string): Promise<TomatoMetadata> {
    const contract = await this.getNFTContract();
    const callData = CallData.compile({
      tokenId: cairo.uint256(tokenId)
    });
    const res = await contract.get_tomato_metadata(callData);
    console.log(callData, res, 'call');
    const result = await this.executeCall<any>(contract, 'get_tomato_metadata', callData);

    console.log(contract, result, tokenId, 'meta result');

    // if (Number(result) === 0) {
    //   return {};
    // }
    return {
      growth_stage: parseInt(result.growth_stage, 10),
      planted_at: parseInt(result.planted_at, 10),
      harvested_at: parseInt(result.harvested_at, 10),
      staked_amount: result.staked_amount?.toString(),
      tomato_type: parseInt(result.tomato_type, 10) as TomatoType
    };
  }

  /**
   * 获取番茄类型
   */
  async getTomatoType(tokenId: string): Promise<TomatoType> {
    const contract = await this.getNFTContract();
    const result = await this.executeCall<number>(contract, 'get_tomato_type', [tokenId]);
    return result as TomatoType;
  }

  /**
   * 检查NFT是否存在
   */
  async tokenExists(tokenId: string): Promise<boolean> {
    try {
      await this.getOwnerOf(tokenId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取用户拥有的所有NFT ID（需要遍历或使用事件）
   */
  async getUserTokenIds(owner: string): Promise<string[]> {
    // 注意：这个功能需要根据实际合约接口实现
    // 可能需要通过事件日志或其他方式获取
    const balance = await this.getBalanceOf(owner);
    const tokenIds: string[] = [];

    // 这里需要实现获取用户token ID的逻辑
    // 可能需要调用合约的特定方法或分析事件日志

    return tokenIds;
  }

  /**
   * 批量获取NFT信息
   */
  async getBatchTokenInfo(tokenIds: string[]): Promise<
    Array<{
      tokenId: string;
      owner: string;
      metadata: TomatoMetadata;
      tokenUri: string;
    }>
  > {
    const batchCalls = tokenIds
      .map((tokenId) => [
        {
          contract: this.nftContract!,
          functionName: 'owner_of',
          calldata: [tokenId]
        },
        {
          contract: this.nftContract!,
          functionName: 'get_tomato_metadata',
          calldata: [tokenId]
        },
        {
          contract: this.nftContract!,
          functionName: 'token_uri',
          calldata: [tokenId]
        }
      ])
      .flat();

    try {
      const results = await this.batchCall(batchCalls);
      const tokenInfos: Array<{
        tokenId: string;
        owner: string;
        metadata: TomatoMetadata;
        tokenUri: string;
      }> = [];

      for (let i = 0; i < tokenIds.length; i++) {
        const baseIndex = i * 3;
        const owner = results[baseIndex] as string;
        const metadataRaw = results[baseIndex + 1] as any;
        const tokenUri = results[baseIndex + 2] as string;

        const metadata: TomatoMetadata = {
          growth_stage: parseInt(metadataRaw.growth_stage, 10),
          planted_at: parseInt(metadataRaw.planted_at, 10),
          harvested_at: parseInt(metadataRaw.harvested_at, 10),
          staked_amount: metadataRaw.staked_amount.toString(),
          tomato_type: parseInt(metadataRaw.tomato_type, 10) as TomatoType
        };

        tokenInfos.push({
          tokenId: tokenIds[i],
          owner,
          metadata,
          tokenUri
        });
      }

      return tokenInfos;
    } catch (error) {
      console.error('Batch token info fetch failed:', error);
      return [];
    }
  }

  /**
   * 监听NFT转移事件
   */
  async listenToTransferEvents(fromBlock: number, callback: (event: any) => void): Promise<void> {
    // 实现事件监听逻辑
    // 需要根据Starknet的事件监听API实现
  }

  /**
   * 获取NFT交易历史
   */
  async getTokenHistory(tokenId: string): Promise<
    Array<{
      type: 'mint' | 'transfer';
      from: string;
      to: string;
      transactionHash: string;
      timestamp: number;
    }>
  > {
    // 实现交易历史获取逻辑
    // 需要通过事件日志分析实现
    return [];
  }

  /**
   * 验证NFT所有权
   */
  async verifyOwnership(tokenId: string, expectedOwner: string): Promise<boolean> {
    try {
      const actualOwner = await this.getOwnerOf(tokenId);
      return actualOwner.toLowerCase() === expectedOwner.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * 获取合约基本信息
   */
  async getContractInfo(): Promise<{
    name: string;
    symbol: string;
    totalSupply?: number;
    baseURI?: string;
  }> {
    const contract = await this.getNFTContract();

    const [name, symbol] = await Promise.all([
      this.executeCall<string>(contract, 'name'),
      this.executeCall<string>(contract, 'symbol')
    ]);

    return {
      name,
      symbol
      // totalSupply和baseURI需要根据合约实际接口添加
    };
  }
}

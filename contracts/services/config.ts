/**
 * Tomato Garden 合约配置
 */

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  contracts: {
    tomatoNFT: string;
    tomatoStaking: string;
    strkToken: string;
  };
  minStakeAmount: string;
  baseRewardPerStage: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  sepolia: {
    name: "Starknet Sepolia Testnet",
    rpcUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_8",
    explorerUrl: "https://sepolia.starkscan.co",
    contracts: {
      tomatoNFT: "0x02fbcb0931c47c544630824266ac9f9c3e0bf57383dccddff78bf135f944f177",
      tomatoStaking: "0x0425b48131c54417af983d80184a0f048d41898725fad476d6e68a2a27d934c3",
      strkToken: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
    },
    minStakeAmount: "1000000000000000000", // 1 STRK
    baseRewardPerStage: "100000000000000000" // 0.1 STRK per stage
  },
  mainnet: {
    name: "Starknet Mainnet",
    rpcUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_8",
    explorerUrl: "https://starkscan.co",
    contracts: {
      tomatoNFT: "", // 待部署
      tomatoStaking: "", // 待部署
      strkToken: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
    },
    minStakeAmount: "1000000000000000000",
    baseRewardPerStage: "1000000000000000000"
  }
};

// 默认网络
export const DEFAULT_NETWORK = "sepolia";

// 合约 ABI 路径
export const CONTRACT_ABIS = {
  tomatoNFT: "./target/dev/tomato_garden_TomatoNFT.contract_class.json",
  tomatoStaking: "./target/dev/tomato_garden_TomatoStaking.contract_class.json"
};

// IPFS 配置
export const IPFS_CONFIG = {
  baseUri: "ipfs://bafybeiemaouyxb2lltopoahht44e6dqwcedclsw2u573yu45s3zdz3yf3u/",
  gateway: "https://ipfs.io/ipfs/"
};

// 常量
export const CONSTANTS = {
  GROWTH_TIME_PER_STAGE: 3600, // 1小时 (秒) - 调试模式
  MAX_GROWTH_STAGE: 4,
  MUTATION_RATE: 0.05, // 5%
  WATERING_ACCELERATION: 3, // 3倍加速
  STRK_DECIMALS: 18
};
// 番茄花园项目 - 模块声明
// 包含两个主要模块：TomatoNFT 和 TomatoStaking

mod TomatoNFT;
mod TomatoStaking;
mod MockERC20;

// 重新导出公共接口
pub use TomatoNFT::{ITomatoNFT, ITomatoNFTDispatcher, ITomatoNFTDispatcherTrait, TomatoMetadata, TomatoType};
pub use TomatoStaking::{ITomatoStaking, ITomatoStakingDispatcher, ITomatoStakingDispatcherTrait, IERC20, IERC20Dispatcher, IERC20DispatcherTrait};
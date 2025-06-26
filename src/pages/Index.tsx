import { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ConnectButton } from '@/components/connect-button';
import { GardenTab, NFTTab, LeaderboardTab, TasksTab, BottomNavigation } from '@/components/tabs';
import { toast } from 'sonner';
import { useAccount } from '@starknet-react/core';
import { TomatoGardenService, TomatoInfo, UserStats, TOMATO_TYPE_INFO } from '@/services';

interface NFT {
  id: string;
  name: string;
  image: string;
  rarity: string;
  harvestedAt: string;
  tomatoType: number;
}

const Index = () => {
  // Wallet and service state
  const { account, address, isConnected } = useAccount();
  const serviceRef = useRef<TomatoGardenService | null>(null);
  const [serviceReady, setServiceReady] = useState(false);

  // Game state
  const [userTomatoes, setUserTomatoes] = useState<TomatoInfo[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [nftCollection, setNftCollection] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [plantingState, setPlantingState] = useState<'none' | 'growing' | 'harvested'>('none');

  // UI state for compatibility
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('1h 00m');
  const [, setLastWatered] = useState<Date | null>(null);
  const [canWater, setCanWater] = useState(true);
  const [, setPlantedAt] = useState<Date | null>(null);

  // Initialize service when account is connected
  useEffect(() => {
    if (isConnected && account && address) {
      const initService = async () => {
        try {
          const service = new TomatoGardenService('sepolia');

          await service.connectAccount(account as any);
          serviceRef.current = service;
          setServiceReady(true);

          // Load user data immediately after service is ready
          await loadUserData();
        } catch (error) {
          console.error('Failed to initialize service:', error);
          toast.error('服务初始化失败');
        }
      };

      initService();
    } else {
      serviceRef.current = null;
      setServiceReady(false);
      setUserTomatoes([]);
      setUserStats(null);
      setNftCollection([]);
    }
  }, [isConnected, account, address]);

  console.log(serviceReady, 're');

  // Load user data from service
  const loadUserData = useCallback(async () => {
    if (!serviceRef.current || !address) return;

    try {
      setLoading(true);

      // Load user tomatoes and stats
      const [tomatoes, stats] = await Promise.all([
        serviceRef.current.getUserTomatoInfos(address),
        serviceRef.current.getUserStats(address)
      ]);

      setUserTomatoes(tomatoes);
      setUserStats(stats);

      // Convert tomatoes to NFT format for display
      const nfts: NFT[] = tomatoes
        .filter((t) => t.isHarvestable)
        .map((t) => {
          const typeInfo = TOMATO_TYPE_INFO[t.metadata.tomato_type];
          if (!typeInfo) return null;
          return {
            id: t.id,
            name: `${typeInfo.name} Tomato #${t.id}`,
            image: typeInfo.emoji,
            rarity: typeInfo.rarity,
            harvestedAt: new Date(t.metadata.harvested_at * 1000).toLocaleDateString(),
            tomatoType: t.metadata.tomato_type
          };
        })
        .filter(Boolean) as any[];
      setNftCollection(nfts);

      console.log(tomatoes, 'tomatoes');
      // Update planting state based on tomatoes
      if (tomatoes.length > 0) {
        const activeTomato = tomatoes.find((t) => !t.isHarvested);

        if (activeTomato) {
          setPlantingState('growing');
          console.log(activeTomato, 'ac');
          setCurrentStage(activeTomato.currentGrowthStage);
          setProgress((activeTomato.currentGrowthStage / 4) * 100);
          setLastWatered(new Date(activeTomato.lastWatered * 1000));
          setPlantedAt(new Date(activeTomato.metadata.planted_at * 1000));

          // Check if can water
          const canWaterNow = await serviceRef.current.canWaterTomato(activeTomato.id);
          setCanWater(canWaterNow);

          // Calculate time remaining
          if (activeTomato.timeToNextStage) {
            const hours = Math.floor(activeTomato.timeToNextStage / 3600);
            const minutes = Math.floor((activeTomato.timeToNextStage % 3600) / 60);
            setTimeRemaining(`${hours}h ${minutes}m`);
          }
        }
      } else {
        setPlantingState('none');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('加载用户数据失败');
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Refresh data periodically
  useEffect(() => {
    if (serviceReady && address) {
      const interval = setInterval(loadUserData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [serviceReady, address, loadUserData]);

  // Plant tomato function
  const handlePlant = async (stakeAmount: string = '1000000000000000000') => {
    // 2 STRK
    if (!serviceRef.current || !serviceReady) {
      toast.error('Service not ready, please try again later');
      return;
    }

    let toastId;
    try {
      setLoading(true);
      toastId = toast.loading('Planting tomato...');

      const result = await serviceRef.current.plantTomato(stakeAmount);

      if (result.success) {
        toast.success(`🌱 Planting successful! Tomato ID: ${result.tokenId}`);
        await loadUserData();
      } else {
        toast.error(`Planting failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Plant error:', error);
      toast.error('Error occurred while planting tomato');
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  };

  // Water tomato function
  const handleWater = async () => {
    if (!serviceRef.current || !serviceReady || !canWater) {
      toast.error('Cannot water at the moment');
      return;
    }

    // Find active tomato
    const activeTomato = userTomatoes.find((t) => !t.isHarvestable);
    if (!activeTomato) {
      toast.error('No growing tomato found');
      return;
    }

    console.log(activeTomato, 'ac');

    let toastId;
    try {
      setLoading(true);
      toastId = toast.loading('Watering...');

      const result = await serviceRef.current.waterTomato(activeTomato.id);

      if (result.success) {
        if (result.mutated) {
          const oldType = TOMATO_TYPE_INFO[result.oldType!];
          const newType = TOMATO_TYPE_INFO[result.newType!];
          toast.success(`💧 Watering successful! ${oldType.emoji} → ${newType.emoji} Mutation occurred!`);
        } else {
          toast.success('💧 Watering successful! Growth accelerated...');
        }
        await loadUserData();
      } else {
        toast.error(`Watering failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Water error:', error);
      toast.error('Error occurred while watering');
    } finally {
      setLoading(false);
      console.log(toastId, 'tid');
      toast.dismiss(toastId);
    }
  };

  // Harvest tomato function
  const handleHarvest = async () => {
    if (!serviceRef.current || !serviceReady) {
      toast.error('Service not ready, please try again later');
      return;
    }

    // Find harvestable tomato
    const harvestableTomato = userTomatoes.find((t) => t.isHarvestable);
    if (!harvestableTomato) {
      toast.error('No harvestable tomato found');
      return;
    }

    let toastId;
    try {
      setLoading(true);
      toastId = toast.loading('Harvesting tomato...');

      const result = await serviceRef.current.harvestTomato(harvestableTomato.id);

      if (result.success) {
        const tomatoType = TOMATO_TYPE_INFO[result.tomatoType!];
        if (tomatoType) {
          toast.success(`🍅 Harvest successful! Got ${tomatoType.emoji} ${tomatoType.name} Tomato NFT`);
        }
        await loadUserData();
      } else {
        toast.error(`Harvest failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Harvest error:', error);
      toast.error('Error occurred while harvesting tomato');
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  };

  console.log(currentStage, plantingState, 'stage');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-green-300 to-yellow-200 relative overflow-hidden">
      {/* Pixel Art Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="absolute top-4 left-4 w-8 h-8 bg-white"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)'
          }}
        ></div>
        <div
          className="absolute top-12 right-8 w-6 h-6 bg-yellow-400"
          style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }}
        ></div>
        <div className="absolute bottom-20 left-8 w-4 h-4 bg-green-500"></div>
        <div className="absolute top-1/3 right-4 w-5 h-5 bg-pink-400"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-green-600 border-b-4 border-green-800 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl pixel-font">🍅</div>
            <div>
              <h1 className="text-lg font-bold text-white pixel-font">Tomato Farm</h1>
              <p className="text-xs text-green-100 pixel-font">Stake • Plant • Harvest</p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      {!isConnected && (
        /* Welcome Screen */
        <div className="px-4 py-8 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-none border-4 border-gray-800 p-6 mx-2 mb-6 shadow-lg pixel-card">
            <div className="text-6xl mb-4">🍅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 pixel-font">Welcome Farmer!</h2>
            <p className="text-gray-600 mb-6 pixel-font text-sm">
              Stake STRK tokens
              <br />
              Grow pixel tomatoes
              <br />
              Harvest NFT rewards!
            </p>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4 pixel-font">Please connect your wallet to start the game</p>
            </div>
          </div>
        </div>
      )}

      {isConnected && (
        <div className="pb-20">
          <Tabs defaultValue="garden" className="w-full">
            <TabsContent value="garden">
              <GardenTab
                currentStage={currentStage}
                progress={progress}
                timeRemaining={timeRemaining}
                canWater={canWater}
                nftCollection={nftCollection}
                handleWater={handleWater}
                handlePlant={handlePlant}
                handleHarvest={handleHarvest}
                userTomatoes={userTomatoes}
                userStats={userStats}
                loading={loading}
                serviceReady={serviceReady}
              />
            </TabsContent>

            <TabsContent value="nft">
              <NFTTab
                nftCollection={nftCollection}
                userTomatoes={userTomatoes}
                userStats={userStats}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="leaderboard">
              <LeaderboardTab nftCollection={nftCollection} userStats={userStats} loading={loading} />
            </TabsContent>

            <TabsContent value="tasks">
              <TasksTab
                canWater={canWater}
                plantingState={plantingState}
                progress={progress}
                handleWater={handleWater}
                handleHarvest={handleHarvest}
                handlePlant={handlePlant}
                userTomatoes={userTomatoes}
                userStats={userStats}
                loading={loading}
                serviceReady={serviceReady}
              />
            </TabsContent>

            <BottomNavigation />
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Index;

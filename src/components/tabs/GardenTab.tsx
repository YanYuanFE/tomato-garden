import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Droplets, Clock, Loader2 } from 'lucide-react';
import { TomatoInfo, UserStats, GROWTH_STAGE_INFO, TOMATO_TYPE_INFO } from '@/services';

interface GrowthStage {
  name: string;
  emoji: string;
  progress: number;
  duration: string;
}

interface NFT {
  id: string;
  name: string;
  image: string;
  rarity: string;
  harvestedAt: string;
  tomatoType: number;
}

interface GardenTabProps {
  currentStage: number;
  progress: number;
  timeRemaining: string;
  canWater: boolean;
  nftCollection: NFT[];
  handleWater: () => void;
  handlePlant: (stakeAmount?: string) => Promise<void>;
  handleHarvest: () => Promise<void>;
  userTomatoes: TomatoInfo[];
  userStats: UserStats | null;
  loading: boolean;
  serviceReady: boolean;
}

const GardenTab: React.FC<GardenTabProps> = ({
  currentStage,
  progress,
  timeRemaining,
  canWater,
  nftCollection,
  handleWater,
  handlePlant,
  handleHarvest,
  userTomatoes,
  userStats,
  loading,
  serviceReady
}) => {
  console.log(userStats, 'stats');
  const growthStages: GrowthStage[] = [
    { name: 'Seed Stage', emoji: '🌱', progress: 0, duration: '1h' },
    { name: 'Seedling Stage', emoji: '🌿', progress: 25, duration: '1h' },
    { name: 'Growing Stage', emoji: '🪴', progress: 50, duration: '1h' },
    { name: 'Flowering Stage', emoji: '🌸', progress: 75, duration: '1h' },
    { name: 'Mature Stage', emoji: '🍅', progress: 100, duration: 'Harvestable!' }
  ];

  console.log(userTomatoes, 'users');
  const activeTomato = userTomatoes.find((t) => !t.isHarvestable);
  const harvestableTomato = userTomatoes.find((t) => t.isHarvestable && !t.isHarvested);

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Stats Bar */}
      <div className="bg-purple-600 border-4 border-purple-800 p-3 pixel-card">
        <div className="flex justify-between text-white pixel-font text-sm">
          <div>Total Tomatoes: {userStats?.totalTomatoes || 0}</div>
          <div>Staked: {userStats?.totalStaked || '0'} STRK</div>
          <div>Harvested: {nftCollection.length}</div>
        </div>
      </div>

      {/* Garden/Staking Combined */}
      <Card className="border-4 border-gray-800 rounded-none bg-white/95 pixel-card shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-gray-800 pixel-font">🌱 My Farm</CardTitle>
        </CardHeader>
        <CardContent>
          {!activeTomato && !harvestableTomato && (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-gray-800 pixel-font">Start Growing Tomatoes</h3>
              <p className="text-gray-600 pixel-font text-sm mb-4">
                Stake 2 STRK tokens to start growing your first tomato seed
              </p>
              <Button
                onClick={() => handlePlant()}
                disabled={loading || !serviceReady}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-bold border-2 border-green-800 pixel-font disabled:opacity-50"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Planting...
                  </>
                ) : (
                  'Stake 1 STRK 🌱'
                )}
              </Button>
            </div>
          )}

          {activeTomato && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl mb-2">{GROWTH_STAGE_INFO[activeTomato.currentGrowthStage].emoji}</div>
                <h3 className="text-lg font-bold text-gray-800 pixel-font">
                  {GROWTH_STAGE_INFO[activeTomato.currentGrowthStage].name}
                </h3>
                <div className="text-sm text-gray-600 pixel-font space-y-1">
                  <p>
                    Tomato Type: {TOMATO_TYPE_INFO[activeTomato.metadata?.tomato_type]?.emoji}{' '}
                    {TOMATO_TYPE_INFO[activeTomato.metadata?.tomato_type]?.name}
                  </p>
                  <p>Staked: {(parseFloat(activeTomato.metadata?.staked_amount) / 1e18).toFixed(2)} STRK</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm pixel-font">
                  <span>Growth Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 border-2 border-gray-600" />
                <div className="text-center">
                  <Badge className="bg-blue-600 text-white text-xs pixel-font">
                    <Clock className="w-3 h-3 mr-1" />
                    {timeRemaining}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button
                  onClick={handleWater}
                  disabled={!canWater || loading}
                  className={`pixel-font text-sm border-2 ${
                    canWater && !loading
                      ? 'bg-blue-600 hover:bg-blue-700 border-blue-800 text-white'
                      : 'bg-gray-400 border-gray-600 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Droplets className="w-4 h-4 mr-1" />}
                  {loading ? 'Watering...' : canWater ? 'Water (Accelerate Growth)' : 'Can water in 1 hour'}
                </Button>
              </div>
            </div>
          )}

          {harvestableTomato && (
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🍅</div>
              <h3 className="text-xl font-bold text-gray-800 pixel-font">Tomato is Ready!</h3>
              <p className="text-gray-600 pixel-font text-sm mb-4">
                {TOMATO_TYPE_INFO[harvestableTomato?.metadata?.tomato_type]?.emoji}{' '}
                {TOMATO_TYPE_INFO[harvestableTomato.metadata?.tomato_type]?.name} tomato is mature and ready to harvest
                as NFT
              </p>
              <Button
                onClick={handleHarvest}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white pixel-font text-sm border-2 border-red-800 px-6 py-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Harvesting...
                  </>
                ) : (
                  '🍅 Harvest NFT'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Growth Timeline */}
      <Card className="border-4 border-gray-800 rounded-none bg-white/95 pixel-card shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-800 pixel-font">Growth Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center space-x-2 flex-wrap">
            {growthStages.map((stage, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={`text-2xl mb-1 ${index <= currentStage ? 'opacity-100' : 'opacity-30'}`}>
                  {stage.emoji}
                </div>
                <h4 className="font-semibold text-xs text-gray-800 pixel-font text-center">{stage.name}</h4>
                <p className="text-xs text-gray-600 pixel-font">{stage.duration}</p>
                <div className="w-full bg-gray-300 h-1 mt-1 border border-gray-500">
                  <div
                    className={`h-full border-r border-gray-600 ${
                      index <= currentStage ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    style={{
                      width: index < currentStage ? '100%' : index === currentStage ? `${(progress % 25) * 4}%` : '0%'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GardenTab;

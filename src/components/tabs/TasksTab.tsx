import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, CheckSquare, Award, Loader2, Plus } from 'lucide-react';
import { TomatoInfo, UserStats } from '@/services';

interface TasksTabProps {
  canWater: boolean;
  plantingState: string;
  progress: number;
  handleWater: () => void;
  handleHarvest: () => void;
  handlePlant: (stakeAmount?: string) => Promise<void>;
  userTomatoes: TomatoInfo[];
  userStats: UserStats | null;
  loading: boolean;
  serviceReady: boolean;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  canWater,
  handleWater,
  handleHarvest,
  handlePlant,
  userTomatoes,
  userStats,
  loading,
  serviceReady
}) => {
  const activeTomato = userTomatoes.find((t) => !t.isHarvestable);
  const harvestableTomato = userTomatoes.find((t) => t.isHarvestable && !t.isHarvested);
  const totalHarvested = userTomatoes.filter((t) => t.metadata.harvested_at > 0).length;

  // Calculate achievement progress
  const achievements = [
    {
      id: 'first_plant',
      title: 'First Plant',
      description: 'Plant your first tomato',
      icon: '🌱',
      unlocked: userStats ? userStats.totalTomatoes > 0 : false,
      progress: userStats ? Math.min(userStats.totalTomatoes, 1) : 0,
      max: 1
    },
    {
      id: 'first_harvest',
      title: 'First Harvest',
      description: 'Harvest your first tomato NFT',
      icon: '🏆',
      unlocked: totalHarvested > 0,
      progress: Math.min(totalHarvested, 1),
      max: 1
    },
    {
      id: 'water_master',
      title: 'Water Master',
      description: 'Water your tomatoes 10 times',
      icon: '💧',
      unlocked: false, // We'd need to track watering count
      progress: 0,
      max: 10
    },
    {
      id: 'collection_starter',
      title: 'Collection Starter',
      description: 'Collect 3 different tomato types',
      icon: '🎨',
      unlocked: userStats ? Object.values(userStats.tomatoesByType).filter((count) => count > 0).length >= 3 : false,
      progress: userStats ? Object.values(userStats.tomatoesByType).filter((count) => count > 0).length : 0,
      max: 3
    },
    {
      id: 'master_farmer',
      title: 'Master Farmer',
      description: 'Harvest 10 tomato NFTs',
      icon: '🌟',
      unlocked: totalHarvested >= 10,
      progress: totalHarvested,
      max: 10
    }
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Quick Actions */}
      <Card className="border-4 border-gray-800 rounded-none bg-white/95 pixel-card shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-gray-800 pixel-font">⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Plant Action */}
          {!activeTomato && !harvestableTomato && (
            <div className="border-2 border-green-600 bg-green-50 p-3 pixel-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 pixel-font">Plant Tomato</h4>
                    <p className="text-xs text-gray-600 pixel-font">Stake 1 STRK to start planting</p>
                  </div>
                </div>
                <Button
                  onClick={() => handlePlant()}
                  disabled={loading || !serviceReady}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs pixel-font border-2 border-green-800 disabled:bg-gray-400"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Plant 🌱'}
                </Button>
              </div>
            </div>
          )}

          {/* Water Action */}
          {activeTomato && (
            <div className="border-2 border-blue-600 bg-blue-50 p-3 pixel-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 pixel-font">Water Tomato</h4>
                    <p className="text-xs text-gray-600 pixel-font">Accelerate growth + mutation chance</p>
                  </div>
                </div>
                <Button
                  onClick={handleWater}
                  disabled={!canWater || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs pixel-font border-2 border-blue-800 disabled:bg-gray-400"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : canWater ? 'Water 💧' : 'Cooldown'}
                </Button>
              </div>
            </div>
          )}

          {/* Harvest Action */}
          {harvestableTomato && (
            <div className="border-2 border-red-600 bg-red-50 p-3 pixel-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 pixel-font">Harvest Tomato</h4>
                    <p className="text-xs text-gray-600 pixel-font">Get NFT and rewards</p>
                  </div>
                </div>
                <Button
                  onClick={handleHarvest}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs pixel-font border-2 border-red-800 disabled:bg-gray-400"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Harvest 🍅'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="border-4 border-purple-800 rounded-none bg-purple-50 pixel-card shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-gray-800 pixel-font">📊 My Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 pixel-font">{userStats?.totalTomatoes || 0}</div>
              <p className="text-xs text-gray-600 pixel-font">Total Tomatoes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 pixel-font">{totalHarvested}</div>
              <p className="text-xs text-gray-600 pixel-font">Harvested</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 pixel-font">{userStats?.totalStaked || '0'}</div>
              <p className="text-xs text-gray-600 pixel-font">Total Staked (STRK)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 pixel-font">
                {userStats ? Object.values(userStats.tomatoesByType).filter((count) => count > 0).length : 0}
              </div>
              <p className="text-xs text-gray-600 pixel-font">Collection Types</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-4 border-gray-800 rounded-none bg-white/95 pixel-card shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-gray-800 pixel-font">
            <Award className="w-5 h-5 mr-2" />
            Achievement System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`border-2 p-2 pixel-card ${
                achievement.unlocked ? 'border-yellow-600 bg-yellow-50' : 'border-gray-400 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{achievement.icon}</span>
                  <div>
                    <h4 className="font-bold text-xs text-gray-800 pixel-font">{achievement.title}</h4>
                    <p className="text-xs text-gray-600 pixel-font">{achievement.description}</p>
                    <div className="text-xs text-gray-500 pixel-font">
                      Progress: {achievement.progress}/{achievement.max}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs pixel-font font-bold ${
                    achievement.unlocked ? 'text-yellow-600' : 'text-gray-500'
                  }`}
                >
                  {achievement.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksTab;

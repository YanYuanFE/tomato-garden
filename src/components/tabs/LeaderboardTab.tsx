import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, TrendingUp, Loader2 } from "lucide-react";
import { UserStats, TOMATO_TYPE_INFO } from "@/services";

interface Farmer {
  rank: number;
  name: string;
  harvested: number;
  avatar: string;
  totalTomatoes: number;
  rareCollected: number;
}

interface NFT {
  id: string;
  name: string;
  image: string;
  rarity: string;
  harvestedAt: string;
  tomatoType: number;
}

interface LeaderboardTabProps {
  nftCollection: NFT[];
  userStats: UserStats | null;
  loading: boolean;
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ 
  nftCollection, 
  userStats,
  loading 
}) => {
  // Calculate user's rare tomato count
  const rareCount = userStats ? 
    Object.entries(userStats.tomatoesByType)
      .filter(([type, count]) => {
        const tomatoType = parseInt(type);
        const typeInfo = TOMATO_TYPE_INFO[tomatoType];
        return typeInfo && count > 0 && (typeInfo.rarity === "稀有" || typeInfo.rarity === "史诗" || typeInfo.rarity === "传说");
      }).length : 0;

  // Mock leaderboard data (in real app, this would come from backend)
  const leaderboard: Farmer[] = [
    { rank: 1, name: "TomatoKing👑", harvested: 156, avatar: "TK", totalTomatoes: 200, rareCollected: 15 },
    { rank: 2, name: "GreenThumb🌿", harvested: 134, avatar: "GT", totalTomatoes: 180, rareCollected: 12 },
    { rank: 3, name: "FarmMaster🚜", harvested: 98, avatar: "FM", totalTomatoes: 150, rareCollected: 8 },
    { rank: 4, name: "PlantLover🌱", harvested: 87, avatar: "PL", totalTomatoes: 120, rareCollected: 7 },
    { rank: 5, name: "You", harvested: nftCollection.length, avatar: "ME", totalTomatoes: userStats?.totalTomatoes || 0, rareCollected: rareCount },
  ].sort((a, b) => b.harvested - a.harvested).map((farmer, index) => ({ ...farmer, rank: index + 1 }));

  // User achievements and milestones
  const userRank = leaderboard.find(f => f.name === "You")?.rank || "-";
  const totalHarvested = nftCollection.length;
  const collectionCompleteness = userStats ? 
    (Object.values(userStats.tomatoesByType).filter(count => count > 0).length / 6) * 100 : 0;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* User Stats Summary */}
      <Card className="border-4 border-purple-800 rounded-none bg-purple-50 pixel-card shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-gray-800 pixel-font">
            <Star className="w-5 h-5 mr-2" />
            My Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600 pixel-font">Loading ranking data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600 pixel-font">#{userRank}</div>
                <p className="text-xs text-gray-600 pixel-font">Global Rank</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 pixel-font">{totalHarvested}</div>
                <p className="text-xs text-gray-600 pixel-font">Harvested NFTs</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 pixel-font">{collectionCompleteness.toFixed(0)}%</div>
                <p className="text-xs text-gray-600 pixel-font">Collection Progress</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collection Showcase */}
      {userStats && (
        <Card className="border-4 border-yellow-800 rounded-none bg-yellow-50 pixel-card shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg text-gray-800 pixel-font">
              🏆 My Collection Showcase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(userStats.tomatoesByType).map(([type, count]) => {
                const tomatoType = parseInt(type);
                const typeInfo = TOMATO_TYPE_INFO[tomatoType];
                if (!typeInfo) return null;
                
                const hasCollected = count > 0;
                
                return (
                  <div 
                    key={type} 
                    className={`text-center p-2 border-2 rounded pixel-card ${
                      hasCollected ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50 opacity-50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{hasCollected ? typeInfo.emoji : "❓"}</div>
                    <div className="text-xs pixel-font font-bold">{typeInfo.name}</div>
                    <Badge 
                      className={`text-xs pixel-font ${
                        typeInfo.rarity === "传说" ? "bg-yellow-500" :
                        typeInfo.rarity === "史诗" ? "bg-purple-500" :
                        typeInfo.rarity === "稀有" ? "bg-blue-500" :
                        "bg-gray-500"
                      }`}
                    >
                      {typeInfo.rarity}
                    </Badge>
                    <div className="text-xs text-gray-600 pixel-font">{count}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Global Leaderboard */}
      <Card className="border-4 border-gray-800 rounded-none bg-white/95 pixel-card shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-gray-800 pixel-font">
            <Trophy className="w-5 h-5 mr-2" />
            Global Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((farmer) => (
              <div
                key={farmer.rank}
                className={`flex items-center justify-between p-2 border-2 pixel-card ${
                  farmer.name === "You"
                    ? "border-red-600 bg-red-50"
                    : "border-green-600 bg-green-50"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-6 h-6 border-2 flex items-center justify-center text-xs font-bold pixel-font ${
                      farmer.rank === 1
                        ? "bg-yellow-400 border-yellow-600"
                        : farmer.rank === 2
                        ? "bg-gray-300 border-gray-500"
                        : farmer.rank === 3
                        ? "bg-orange-400 border-orange-600"
                        : "bg-green-200 border-green-600"
                    }`}
                  >
                    {farmer.rank}
                  </div>
                  <Avatar className="w-6 h-6 border-2 border-gray-600">
                    <AvatarFallback className="bg-white text-xs pixel-font">
                      {farmer.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-bold text-sm text-gray-800 pixel-font">
                      {farmer.name}
                    </span>
                    <div className="text-xs text-gray-600 pixel-font">
                      Total: {farmer.totalTomatoes} | Rare: {farmer.rareCollected}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg">🍅</span>
                  <span className="font-bold text-sm text-gray-800 pixel-font">
                    {farmer.harvested}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {userRank > 10 && (
            <div className="mt-4 pt-2 border-t-2 border-gray-300">
              <div className="text-center text-xs text-gray-500 pixel-font mb-2">
                ... {userRank - 10} more farmers
              </div>
              <div className="flex items-center justify-between p-2 border-2 border-red-600 bg-red-50 pixel-card">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 border-2 border-red-600 bg-red-200 flex items-center justify-center text-xs font-bold pixel-font">
                    {userRank}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-800 pixel-font">You</span>
                    <div className="text-xs text-gray-600 pixel-font">
                      Total: {userStats?.totalTomatoes || 0} | Rare: {rareCount}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg">🍅</span>
                  <span className="font-bold text-sm text-gray-800 pixel-font">
                    {totalHarvested}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Season Progress */}
      <Card className="border-4 border-blue-800 rounded-none bg-blue-50 pixel-card shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-gray-800 pixel-font">
            <TrendingUp className="w-5 h-5 mr-2" />
            Season Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm pixel-font mb-1">
                <span>Harvest Goal Progress</span>
                <span>{Math.min(totalHarvested, 50)}/50</span>
              </div>
              <div className="w-full bg-gray-300 h-2 border border-gray-500">
                <div 
                  className="h-full bg-blue-500"
                  style={{ width: `${Math.min(totalHarvested / 50 * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm pixel-font mb-1">
                <span>Collection Goal Progress</span>
                <span>{collectionCompleteness.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-300 h-2 border border-gray-500">
                <div 
                  className="h-full bg-green-500"
                  style={{ width: `${collectionCompleteness}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 border border-gray-300 rounded">
                <div className="text-lg font-bold text-blue-600 pixel-font">
                  {30 - Math.floor(Date.now() / 86400000) % 30}
                </div>
                <p className="text-xs text-gray-600 pixel-font">Days Left</p>
              </div>
              <div className="p-2 border border-gray-300 rounded">
                <div className="text-lg font-bold text-purple-600 pixel-font">🏆</div>
                <p className="text-xs text-gray-600 pixel-font">Season Rewards</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardTab;
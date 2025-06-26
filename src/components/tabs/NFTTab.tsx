import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Loader2 } from 'lucide-react';
import { TomatoInfo, UserStats, TOMATO_TYPE_INFO } from '@/services';

interface NFT {
  id: string;
  name: string;
  image: string;
  rarity: string;
  harvestedAt: string;
  tomatoType: number;
}

interface NFTTabProps {
  nftCollection: NFT[];
  userTomatoes: TomatoInfo[];
  userStats: UserStats | null;
  loading: boolean;
}

const NFTTab: React.FC<NFTTabProps> = ({ nftCollection, userTomatoes, userStats, loading }) => {
  // Get actually harvested tomatoes (NFTs that have been minted)
  const actualNFTs = userTomatoes.filter((t) => t.isHarvested && t.metadata.harvested_at > 0);
  
  // Get ready-to-harvest tomatoes (not yet harvested as NFTs)
  const readyToHarvest = userTomatoes.filter((t) => t.isHarvestable && !t.isHarvested);

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Collection Stats */}
      <Card className="border-4 border-purple-800 rounded-none bg-purple-50 pixel-card shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-gray-800 pixel-font">📊 Collection Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 pixel-font">{userStats?.totalTomatoes || 0}</div>
              <p className="text-sm text-gray-600 pixel-font">Total Tomatoes</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 pixel-font">{actualNFTs.length}</div>
              <p className="text-sm text-gray-600 pixel-font">Harvested NFTs</p>
            </div>
          </div>

          {userStats && (
            <div className="mt-4 space-y-2">
              <h4 className="font-bold text-sm text-gray-800 pixel-font">Tomato Type Collection</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(userStats.tomatoesByType).map(([type, count]) => {
                  const tomatoType = parseInt(type);
                  const typeInfo = TOMATO_TYPE_INFO[tomatoType];
                  if (!typeInfo) return null;
                  return (
                    <div key={type} className="text-center p-2 border border-gray-300 rounded">
                      <div className="text-lg">{typeInfo.emoji}</div>
                      <div className="text-xs pixel-font">{typeInfo.name}</div>
                      <div className="text-xs font-bold text-gray-600 pixel-font">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* NFT Collection */}
      <Card className="border-4 border-gray-800 rounded-none bg-white/95 pixel-card shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg text-gray-800 pixel-font">
            <Gift className="w-5 h-5 mr-2" />
            My NFT Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 pixel-font">Loading NFT collection...</p>
            </div>
          ) : actualNFTs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-gray-600 pixel-font">No NFTs harvested yet</p>
              <p className="text-sm text-gray-500 pixel-font mt-2">Plant and harvest tomatoes to get your first NFT!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {actualNFTs.map((tomato) => {
                const typeInfo = TOMATO_TYPE_INFO[tomato.metadata.tomato_type];
                if (!typeInfo) return null;
                
                const rarityColor =
                  typeInfo.rarity === '传说'
                    ? 'border-yellow-400 bg-yellow-50'
                    : typeInfo.rarity === '史诗'
                    ? 'border-purple-400 bg-purple-50'
                    : typeInfo.rarity === '稀有'
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-400 bg-gray-50';

                return (
                  <div key={tomato.id} className={`border-2 ${rarityColor} p-3 text-center pixel-card`}>
                    <div className="text-3xl mb-2">{typeInfo.emoji}</div>
                    <h4 className="text-sm font-bold text-gray-800 pixel-font">
                      {typeInfo.name} Tomato #{tomato.id}
                    </h4>
                    <Badge
                      className={`text-xs pixel-font mb-1 ${
                        typeInfo.rarity === '传说'
                          ? 'bg-yellow-500'
                          : typeInfo.rarity === '史诗'
                          ? 'bg-purple-500'
                          : typeInfo.rarity === '稀有'
                          ? 'bg-blue-500'
                          : 'bg-gray-500'
                      }`}
                    >
                      {typeInfo.rarity}
                    </Badge>
                    <div className="text-xs text-gray-600 pixel-font space-y-1">
                      <p>Harvested: {new Date(tomato.metadata.harvested_at * 1000).toLocaleDateString()}</p>
                      <p>Staked: {(parseFloat(tomato.metadata.staked_amount) / 1e18).toFixed(2)} STRK</p>
                      <p>Growth Stage: {tomato.metadata.growth_stage}/4</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ready to Harvest */}
      {readyToHarvest.length > 0 && (
        <Card className="border-4 border-orange-800 rounded-none bg-orange-50 pixel-card shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg text-gray-800 pixel-font">🍅 Ready to Harvest</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 pixel-font mb-3">
              These tomatoes are ready to be harvested as NFTs!
            </p>
            <div className="grid grid-cols-2 gap-3">
              {readyToHarvest.map((tomato) => {
                const typeInfo = TOMATO_TYPE_INFO[tomato.metadata.tomato_type];
                if (!typeInfo) return null;
                
                return (
                  <div key={tomato.id} className="border-2 border-orange-400 bg-orange-100 p-3 text-center pixel-card">
                    <div className="text-3xl mb-2">{typeInfo.emoji}</div>
                    <h4 className="text-sm font-bold text-gray-800 pixel-font">
                      {typeInfo.name} Tomato #{tomato.id}
                    </h4>
                    <Badge className="text-xs pixel-font mb-1 bg-orange-500">
                      Ready to Harvest!
                    </Badge>
                    <div className="text-xs text-gray-600 pixel-font space-y-1">
                      <p>Rarity: {typeInfo.rarity}</p>
                      <p>Staked: {(parseFloat(tomato.metadata.staked_amount) / 1e18).toFixed(2)} STRK</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Growing Tomatoes */}
      {userTomatoes.filter((t) => !t.isHarvestable && !t.isHarvested && t.metadata.harvested_at === 0).length > 0 && (
        <Card className="border-4 border-green-800 rounded-none bg-green-50 pixel-card shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg text-gray-800 pixel-font">🌱 Growing Tomatoes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {userTomatoes
                .filter((t) => !t.isHarvestable && !t.isHarvested && t.metadata.harvested_at === 0)
                .map((tomato) => {
                  const typeInfo = TOMATO_TYPE_INFO[tomato.metadata.tomato_type];
                  if (!typeInfo) return null;
                  
                  return (
                    <div key={tomato.id} className="border-2 border-green-400 bg-green-50 p-3 text-center pixel-card">
                      <div className="text-3xl mb-2">{typeInfo.emoji}</div>
                      <h4 className="text-sm font-bold text-gray-800 pixel-font">
                        {typeInfo.name} Tomato #{tomato.id}
                      </h4>
                      <div className="text-xs text-gray-600 pixel-font space-y-1">
                        <p>Growth Stage: {tomato.currentGrowthStage}/4</p>
                        <p>Staked: {(parseFloat(tomato.metadata.staked_amount) / 1e18).toFixed(2)} STRK</p>
                        {tomato.timeToNextStage && (
                          <p>Next Stage: {Math.ceil(tomato.timeToNextStage / 3600)}h</p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NFTTab;

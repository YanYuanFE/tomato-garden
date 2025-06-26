import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Gift, Trophy, CheckSquare } from "lucide-react";

const BottomNavigation = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-green-600 border-t-4 border-green-800 z-50">
      <TabsList className="grid w-full grid-cols-4 bg-transparent h-16 rounded-none">
        <TabsTrigger
          value="garden"
          className="flex flex-col items-center space-y-1 text-white data-[state=active]:bg-green-700 data-[state=active]:text-white border-2 border-transparent data-[state=active]:border-green-400 pixel-font text-xs h-full"
        >
          <Home className="w-5 h-5" />
          <span>Garden</span>
        </TabsTrigger>
        <TabsTrigger
          value="nft"
          className="flex flex-col items-center space-y-1 text-white data-[state=active]:bg-green-700 data-[state=active]:text-white border-2 border-transparent data-[state=active]:border-green-400 pixel-font text-xs h-full"
        >
          <Gift className="w-5 h-5" />
          <span>NFTs</span>
        </TabsTrigger>
        <TabsTrigger
          value="leaderboard"
          className="flex flex-col items-center space-y-1 text-white data-[state=active]:bg-green-700 data-[state=active]:text-white border-2 border-transparent data-[state=active]:border-green-400 pixel-font text-xs h-full"
        >
          <Trophy className="w-5 h-5" />
          <span>Ranking</span>
        </TabsTrigger>
        <TabsTrigger
          value="tasks"
          className="flex flex-col items-center space-y-1 text-white data-[state=active]:bg-green-700 data-[state=active]:text-white border-2 border-transparent data-[state=active]:border-green-400 pixel-font text-xs h-full"
        >
          <CheckSquare className="w-5 h-5" />
          <span>Tasks</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default BottomNavigation;
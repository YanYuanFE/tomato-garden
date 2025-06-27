import { useState, useEffect } from 'react';
import { useAccount, useNetwork, useSwitchChain } from '@starknet-react/core';
import { sepolia, mainnet } from '@starknet-react/chains';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Network, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { constants } from 'starknet';

interface NetworkSwitchModalProps {
  targetChainId?: string; // 期望的网络ID，默认为sepolia
}

export const NetworkSwitchModal: React.FC<NetworkSwitchModalProps> = ({
  targetChainId = constants.StarknetChainId.SN_SEPOLIA
}) => {
  const { isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { chain, chains } = useNetwork();
  const { switchChainAsync } = useSwitchChain({
    params: {
      chainId: targetChainId
    }
  });

  console.log(chain?.id, targetChainId, chain, chains, 'chain');

  // 根据targetChainId找到目标网络
  const targetChain = chains.find((c) => String(c.id) === targetChainId) || sepolia;

  // 获取网络显示信息
  const getNetworkInfo = (chainId: string) => {
    const chainInfo = chains.find((c) => String(c.id) === chainId);
    if (chainInfo) {
      return {
        name: chainInfo.name,
        description: chainInfo.name,
        icon: chainInfo.id === mainnet.id ? '🔷' : '🔸'
      };
    }
    return {
      name: `Unknown Network (${chainId})`,
      description: 'Unknown Network',
      icon: '❓'
    };
  };

  const currentNetworkInfo = chain ? getNetworkInfo(String(chain.id)) : null;
  const targetNetworkInfo = getNetworkInfo(String(targetChain.id));

  // 检查是否在错误的网络
  useEffect(() => {
    if (isConnected && chain) {
      const isWrongNetwork = chain.id !== targetChain.id;
      setIsOpen(isWrongNetwork);

      if (isWrongNetwork) {
        console.log(`Wrong network detected. Current: ${chain.id}, Expected: ${targetChain.id}`);
      }
    } else {
      setIsOpen(false);
    }
  }, [isConnected, chain, targetChain.id]);

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);

    try {
      await switchChainAsync();
    } catch (error) {
      console.error('Network switch failed:', error);
      toast.error('Failed to switch network. Please try manually.');
      setIsSwitching(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    // 可以选择显示警告消息
    toast.warning('Wrong network detected. Some features may not work correctly.');
  };

  if (!isConnected || !chain) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl border-4 border-orange-800 rounded-none bg-orange-50 pixel-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 pixel-font">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            Wrong Network
          </DialogTitle>
          <DialogDescription className="text-gray-600 pixel-font text-sm">
            You're connected to the wrong network. This dApp requires {targetNetworkInfo.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Network */}
          <div className="p-3 border-2 border-red-600 bg-red-50 rounded pixel-card">
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-4 h-4 text-red-600" />
              <span className="text-sm font-bold text-red-800 pixel-font">Current Network</span>
            </div>
            <p className="text-sm text-red-700 pixel-font">{currentNetworkInfo?.name || 'Unknown'}</p>
          </div>

          {/* Target Network */}
          <div className="p-3 border-2 border-green-600 bg-green-50 rounded pixel-card">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{targetNetworkInfo.icon}</span>
              <span className="text-sm font-bold text-green-800 pixel-font">Required Network</span>
            </div>
            <p className="text-sm text-green-700 pixel-font">{targetNetworkInfo.name}</p>
            <p className="text-xs text-green-600 pixel-font mt-1">{targetNetworkInfo.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSwitchNetwork}
              disabled={isSwitching}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-800 pixel-font"
            >
              {isSwitching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Switching...
                </>
              ) : (
                <>
                  <Network className="w-4 h-4 mr-2" />
                  Switch Network
                </>
              )}
            </Button>

            <Button onClick={handleDismiss} variant="outline" className="flex-1 border-2 border-gray-400 pixel-font">
              Continue Anyway
            </Button>
          </div>

          {/* Instructions */}
          <div className="p-3 border border-gray-300 bg-gray-50 rounded">
            <p className="text-xs text-gray-600 pixel-font mb-2">
              <strong>How to switch networks:</strong>
            </p>
            <ol className="text-xs text-gray-600 pixel-font space-y-1 list-decimal list-inside">
              <li>Open your Starknet wallet (Argent X, Braavos, etc.)</li>
              <li>Look for network settings or network selector</li>
              <li>Select "{targetNetworkInfo.name}"</li>
              <li>Return to this page - we'll detect the change automatically</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkSwitchModal;

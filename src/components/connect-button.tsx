import { Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import { useStarknetkitConnectModal } from 'starknetkit';
import { shortenAddress } from '@/lib/utils';

export const ConnectButton = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const { connect, connectors } = useConnect();

  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors
  });

  async function connectWallet() {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }

    await connect({ connector });
  }

  return (
    <Button
      onClick={() => {
        if (address) {
          disconnect();
        } else {
          connectWallet();
        }
      }}
      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-sm font-bold border-2 border-red-800 pixel-font shadow-lg"
      style={{
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
      }}
    >
      <Wallet className="w-4 h-4 mr-1" />
      {address ? shortenAddress(address) : 'Connect Wallet'}
    </Button>
  );
};

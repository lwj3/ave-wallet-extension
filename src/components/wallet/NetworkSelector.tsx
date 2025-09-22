import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Network } from '@/types/wallet'

interface NetworkSelectorProps {
  networks: Network[]
  currentNetwork: Network | null
  onNetworkChange: (networkId: string) => void
  loading?: boolean
}

export function NetworkSelector({ 
  networks, 
  currentNetwork, 
  onNetworkChange, 
  loading = false 
}: NetworkSelectorProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Network</label>
        <div className="h-10 w-full rounded-md border bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Network</label>
      <Select
        value={currentNetwork?.id || ''}
        onValueChange={onNetworkChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a network" />
        </SelectTrigger>
        <SelectContent>
          {networks.map((network) => (
            <SelectItem key={network.id} value={network.id}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${network.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span>{network.name}</span>
                <span className="text-muted-foreground text-xs">
                  ({network.symbol})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {currentNetwork && (
        <div className="text-xs text-muted-foreground">
          <p>RPC: {currentNetwork.rpcUrl}</p>
          <p>Chain ID: {currentNetwork.chainId}</p>
          <p>Explorer: {currentNetwork.blockExplorer}</p>
        </div>
      )}
    </div>
  )
}

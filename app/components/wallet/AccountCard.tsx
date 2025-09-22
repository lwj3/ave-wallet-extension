import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatAddress, formatBalance, copyToClipboard } from '@/lib/utils'
import { Copy, RefreshCw, ChevronDown } from 'lucide-react'
import { WalletAccount } from '@/types/wallet'

interface AccountCardProps {
  account: WalletAccount
  onRefreshBalance: (address: string) => Promise<string>
  loading?: boolean
}

export function AccountCard({ account, onRefreshBalance, loading = false }: AccountCardProps) {
  const [balance, setBalance] = useState('0')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (account) {
      refreshBalance()
    }
  }, [account])

  const refreshBalance = async () => {
    if (!account) return
    
    try {
      setIsRefreshing(true)
      const newBalance = await onRefreshBalance(account.address)
      setBalance(newBalance)
    } catch (error) {
      console.error('Failed to refresh balance:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCopyAddress = async () => {
    if (account) {
      await copyToClipboard(account.address)
    }
  }

  if (!account) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No account selected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{account.name}</CardTitle>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="font-mono text-sm break-all">
            {formatAddress(account.address, 8)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Balance</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBalance}
              disabled={isRefreshing || loading}
              className="h-6 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-2xl font-bold">
            {formatBalance(balance)} ETH
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

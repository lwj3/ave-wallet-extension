import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Transaction } from '@/types/wallet'
import { ExternalLink, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TransactionHistoryProps {
  transactions: Transaction[]
  loading: boolean
  onRefresh: () => void
  currentNetwork: { blockExplorer: string } | null
}

export function TransactionHistory({ 
  transactions, 
  loading, 
  onRefresh, 
  currentNetwork 
}: TransactionHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all')

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    return tx.status === filter
  })

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      failed: 'destructive'
    } as const

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount)
    if (num === 0) return '0'
    if (num < 0.000001) return '< 0.000001'
    return num.toFixed(6)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const openInExplorer = (hash: string) => {
    if (currentNetwork?.blockExplorer && hash) {
      const url = `${currentNetwork.blockExplorer}/tx/${hash}`
      chrome.tabs.create({ url })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Transaction History</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Filter buttons */}
        <div className="flex space-x-1 mt-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'failed', label: 'Failed' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(key as any)}
              className="h-7 text-xs px-2"
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading && transactions.length === 0 ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {filter === 'all' ? 'No transactions yet' : `No ${filter} transactions`}
            </p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(tx.status)}
                      <span className="text-sm font-medium">
                        {formatAmount(tx.amount)} ETH
                      </span>
                      {getStatusBadge(tx.status)}
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        <span className="font-medium">To:</span> {formatAddress(tx.to)}
                      </div>
                      <div>
                        <span className="font-medium">From:</span> {formatAddress(tx.from)}
                      </div>
                      <div>
                        {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  {tx.hash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openInExplorer(tx.hash!)}
                      className="h-6 w-6 p-0 ml-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {tx.gasPrice && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Gas: {tx.gasPrice} | Limit: {tx.gasLimit}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

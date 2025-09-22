import React, { useState } from 'react'
import { WalletProvider } from '@/components/WalletProvider'
import { WalletSetup } from '@/components/wallet/WalletSetup'
import { UnlockWallet } from '@/components/wallet/UnlockWallet'
import { AccountCard } from '@/components/wallet/AccountCard'
import { TransactionForm } from '@/components/wallet/TransactionForm'
import { NetworkSelector } from '@/components/wallet/NetworkSelector'
import { TransactionHistory } from '@/components/wallet/TransactionHistory'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWallet } from '@/hooks/useWallet'
import { Wallet, Settings, Lock, Send, History } from 'lucide-react'
import '@/styles/globals.css'

function PopupContent() {
  const {
    isInitialized,
    isUnlocked,
    currentAccount,
    currentNetwork,
    accounts,
    networks,
    loading,
    error,
    createWallet,
    unlockWallet,
    lockWallet,
    getBalance,
    sendTransaction,
    getNetworks,
    switchNetwork,
    getTransactionHistory
  } = useWallet()

  const [activeTab, setActiveTab] = useState('wallet')
  const [networksList, setNetworksList] = useState(networks)
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)

  React.useEffect(() => {
    if (networks.length === 0) {
      getNetworks().then(setNetworksList)
    }
  }, [networks, getNetworks])

  const handleCreateWallet = async (password: string, mnemonic?: string) => {
    await createWallet(password, mnemonic)
  }

  const handleUnlockWallet = async (password: string) => {
    return await unlockWallet(password)
  }

  const handleRefreshBalance = async (address: string) => {
    return await getBalance(address)
  }

  const handleSendTransaction = async (params: any) => {
    await sendTransaction(params)
  }

  const handleNetworkChange = async (networkId: string) => {
    await switchNetwork(networkId)
  }

  const handleLockWallet = async () => {
    await lockWallet()
  }

  const handleOpenSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  const handleLoadTransactions = async () => {
    if (!currentAccount) return
    
    setTransactionsLoading(true)
    try {
      const txHistory = await getTransactionHistory(currentAccount.address)
      setTransactions(txHistory)
    } catch (err) {
      console.error('Failed to load transactions:', err)
    } finally {
      setTransactionsLoading(false)
    }
  }

  // Load transactions when switching to history tab
  React.useEffect(() => {
    if (activeTab === 'history' && currentAccount && transactions.length === 0) {
      handleLoadTransactions()
    }
  }, [activeTab, currentAccount])

  if (!isInitialized) {
    return (
      <div className="w-80 h-96 bg-background text-foreground">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Ave Wallet</h1>
          </div>
        </div>
        <div className="p-4">
          <WalletSetup onCreateWallet={handleCreateWallet} loading={loading} />
        </div>
      </div>
    )
  }

  if (!isUnlocked) {
    return (
      <div className="w-80 h-96 bg-background text-foreground">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Ave Wallet</h1>
          </div>
        </div>
        <div className="p-4">
          <UnlockWallet onUnlockWallet={handleUnlockWallet} loading={loading} />
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 h-96 bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Ave Wallet</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLockWallet}
              className="h-8 w-8 p-0"
              title="Lock wallet"
            >
              <Lock className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenSettings}
              className="h-8 w-8 p-0"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b">
        <div className="flex space-x-1">
          {[
            { id: 'wallet', label: 'Wallet', icon: Wallet },
            { id: 'send', label: 'Send', icon: Send },
            { id: 'history', label: 'History', icon: History }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 h-8 text-xs"
              >
                <Icon className="h-3 w-3 mr-1" />
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="space-y-4">
            {currentAccount && (
              <AccountCard
                account={currentAccount}
                onRefreshBalance={handleRefreshBalance}
                loading={loading}
              />
            )}
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Network</CardTitle>
              </CardHeader>
              <CardContent>
                <NetworkSelector
                  networks={networksList}
                  currentNetwork={currentNetwork}
                  onNetworkChange={handleNetworkChange}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'send' && (
          <TransactionForm
            onSendTransaction={handleSendTransaction}
            loading={loading}
          />
        )}

        {activeTab === 'history' && (
          <TransactionHistory
            transactions={transactions}
            loading={transactionsLoading}
            onRefresh={handleLoadTransactions}
            currentNetwork={currentNetwork}
          />
        )}
      </div>
    </div>
  )
}

export default function Popup() {
  return (
    <WalletProvider>
      <PopupContent />
    </WalletProvider>
  )
}

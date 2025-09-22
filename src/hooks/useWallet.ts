import { useState, useEffect, useCallback } from 'react'
import { WalletManager } from '@/lib/wallet-manager'
import { WalletAccount, Network, SendTransactionParams, WalletStatus } from '@/types/wallet'

const walletManager = new WalletManager()

export function useWallet() {
  const [status, setStatus] = useState<WalletStatus>({
    isInitialized: false,
    isUnlocked: false,
    accounts: [],
    currentAccount: null,
    currentNetwork: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshStatus = useCallback(async () => {
    try {
      setLoading(true)
      const walletStatus = await walletManager.getStatus()
      setStatus(walletStatus)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get wallet status')
    } finally {
      setLoading(false)
    }
  }, [])

  const createWallet = useCallback(async (password: string, mnemonic?: string) => {
    try {
      setLoading(true)
      const account = await walletManager.createWallet(password, mnemonic)
      await refreshStatus()
      return account
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet')
      throw err
    } finally {
      setLoading(false)
    }
  }, [refreshStatus])

  const unlockWallet = useCallback(async (password: string) => {
    try {
      setLoading(true)
      const success = await walletManager.unlockWallet(password)
      if (success) {
        await refreshStatus()
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock wallet')
      return false
    } finally {
      setLoading(false)
    }
  }, [refreshStatus])

  const lockWallet = useCallback(async () => {
    try {
      await walletManager.lockWallet()
      await refreshStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock wallet')
    }
  }, [refreshStatus])

  const getAccounts = useCallback(async () => {
    try {
      const accounts = await walletManager.getAccounts()
      return accounts
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get accounts')
      return []
    }
  }, [])

  const getBalance = useCallback(async (address: string) => {
    try {
      const balance = await walletManager.getBalance(address)
      return balance
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get balance')
      return '0'
    }
  }, [])

  const sendTransaction = useCallback(async (params: SendTransactionParams) => {
    try {
      setLoading(true)
      const transaction = await walletManager.sendTransaction(params)
      await refreshStatus()
      return transaction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send transaction')
      throw err
    } finally {
      setLoading(false)
    }
  }, [refreshStatus])

  const switchAccount = useCallback(async (accountId: string) => {
    try {
      await walletManager.setCurrentAccount(accountId)
      await refreshStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch account')
    }
  }, [refreshStatus])

  const getNetworks = useCallback(async () => {
    try {
      const networks = await walletManager.getNetworks()
      return networks
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get networks')
      return []
    }
  }, [])

  const switchNetwork = useCallback(async (networkId: string) => {
    try {
      await walletManager.setCurrentNetwork(networkId)
      await refreshStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch network')
    }
  }, [refreshStatus])

  const getTransactionHistory = useCallback(async (address?: string) => {
    try {
      const transactions = await walletManager.getTransactionHistory(address)
      return transactions
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get transaction history')
      return []
    }
  }, [])

  const signMessage = useCallback(async (message: string, address?: string) => {
    try {
      const signature = await walletManager.signMessage(message, address)
      return signature
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign message')
      throw err
    }
  }, [])

  const verifyMessage = useCallback(async (message: string, signature: string, address: string) => {
    try {
      const isValid = await walletManager.verifyMessage(message, signature, address)
      return isValid
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify message')
      return false
    }
  }, [])

  useEffect(() => {
    walletManager.initialize().then(() => {
      refreshStatus()
    })
  }, [refreshStatus])

  return {
    // State
    isInitialized: status.isInitialized,
    isUnlocked: status.isUnlocked,
    accounts: status.accounts,
    currentAccount: status.currentAccount,
    currentNetwork: status.currentNetwork,
    loading,
    error,
    
    // Actions
    createWallet,
    unlockWallet,
    lockWallet,
    getAccounts,
    getBalance,
    sendTransaction,
    switchAccount,
    getNetworks,
    switchNetwork,
    getTransactionHistory,
    signMessage,
    verifyMessage,
    refreshStatus,
    
    // Utilities
    clearError: () => setError(null)
  }
}

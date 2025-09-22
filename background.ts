import { WalletManager } from '@/lib/wallet-manager'
import { WalletProvider } from '@/types/wallet'

class BackgroundService {
  private walletManager: WalletManager
  private walletProvider: WalletProvider | null = null

  constructor() {
    this.walletManager = new WalletManager()
    this.initialize()
  }

  private async initialize() {
    await this.walletManager.initialize()
    this.setupMessageHandlers()
    this.setupWalletProvider()
  }

  private setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse)
      return true // Keep message channel open for async responses
    })
  }

  private setupWalletProvider() {
    // Initialize wallet provider for dApp integration
    this.walletProvider = {
      isConnected: false,
      accounts: [],
      currentAccount: null,
      chainId: 1,
      connect: async () => {
        const status = await this.walletManager.getStatus()
        if (status.isUnlocked && status.currentAccount) {
          this.walletProvider!.isConnected = true
          this.walletProvider!.accounts = [status.currentAccount.address]
          this.walletProvider!.currentAccount = status.currentAccount.address
          return { accounts: [status.currentAccount.address] }
        }
        throw new Error('Wallet not unlocked')
      },
      disconnect: async () => {
        this.walletProvider!.isConnected = false
        this.walletProvider!.accounts = []
        this.walletProvider!.currentAccount = null
      },
      request: async (method: string, params: any[] = []) => {
        return await this.handleWalletRequest(method, params)
      },
      on: (event: string, callback: Function) => {
        // Event listener implementation
        console.log(`Listening for ${event}`)
      },
      removeListener: (event: string, callback: Function) => {
        // Remove event listener implementation
        console.log(`Removing listener for ${event}`)
      }
    }
  }

  private async handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) {
    try {
      switch (message.type) {
        case 'GET_WALLET_STATUS':
          const status = await this.walletManager.getStatus()
          sendResponse({ success: true, data: status })
          break

        case 'CREATE_WALLET':
          const account = await this.walletManager.createWallet(message.data.password, message.data.mnemonic)
          sendResponse({ success: true, data: account })
          break

        case 'UNLOCK_WALLET':
          const unlocked = await this.walletManager.unlockWallet(message.data.password)
          sendResponse({ success: true, data: { unlocked } })
          break

        case 'LOCK_WALLET':
          await this.walletManager.lockWallet()
          sendResponse({ success: true, data: { locked: true } })
          break

        case 'GET_ACCOUNTS':
          const accounts = await this.walletManager.getAccounts()
          sendResponse({ success: true, data: accounts })
          break

        case 'GET_BALANCE':
          const balance = await this.walletManager.getBalance(message.data.address)
          sendResponse({ success: true, data: balance })
          break

        case 'SEND_TRANSACTION':
          const transaction = await this.walletManager.sendTransaction(message.data)
          sendResponse({ success: true, data: transaction })
          break

        case 'SWITCH_ACCOUNT':
          await this.walletManager.setCurrentAccount(message.data.accountId)
          sendResponse({ success: true })
          break

        case 'GET_NETWORKS':
          const networks = await this.walletManager.getNetworks()
          sendResponse({ success: true, data: networks })
          break

        case 'SWITCH_NETWORK':
          await this.walletManager.setCurrentNetwork(message.data.networkId)
          sendResponse({ success: true })
          break

        case 'CONNECT_WALLET':
          if (this.walletProvider) {
            const result = await this.walletProvider.connect()
            sendResponse({ success: true, data: result })
          } else {
            sendResponse({ success: false, error: 'Wallet provider not initialized' })
          }
          break

        case 'DISCONNECT_WALLET':
          if (this.walletProvider) {
            await this.walletProvider.disconnect()
            sendResponse({ success: true })
          } else {
            sendResponse({ success: false, error: 'Wallet provider not initialized' })
          }
          break

        default:
          sendResponse({ success: false, error: 'Unknown message type' })
      }
    } catch (error) {
      console.error('Background message handler error:', error)
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }

  private async handleWalletRequest(method: string, params: any[]): Promise<any> {
    switch (method) {
      case 'eth_requestAccounts':
        const status = await this.walletManager.getStatus()
        if (status.isUnlocked && status.currentAccount) {
          return [status.currentAccount.address]
        }
        throw new Error('Wallet not unlocked')

      case 'eth_accounts':
        const accounts = await this.walletManager.getAccounts()
        return accounts.map(acc => acc.address)

      case 'eth_getBalance': {
        const [address, blockTag] = params
        return await this.walletManager.getBalance(address)
      }

      case 'eth_sendTransaction': {
        const [transaction] = params
        return await this.walletManager.sendTransaction(transaction)
      }

      case 'eth_chainId': {
        const networks = await this.walletManager.getNetworks()
        const currentNetwork = networks.find(n => n.isActive)
        return currentNetwork ? `0x${currentNetwork.chainId.toString(16)}` : '0x1'
      }

      case 'wallet_switchEthereumChain': {
        const [{ chainId }] = params
        const networkId = `ethereum-${chainId}`
        await this.walletManager.setCurrentNetwork(networkId)
        return null
      }

      case 'personal_sign': {
        const [message, address] = params
        return await this.walletManager.signMessage(message, address)
      }

      case 'eth_signTypedData_v4': {
        const [signerAddress, typedData] = params
        // For now, just sign the typed data as a string
        return await this.walletManager.signMessage(JSON.stringify(typedData), signerAddress)
      }

      case 'eth_getTransactionCount': {
        const [txAddress, blockTag] = params
        // Mock implementation - in real app, query blockchain
        return '0x0'
      }

      case 'eth_estimateGas': {
        const [txParams] = params
        // Mock implementation - in real app, estimate gas
        return '0x5208' // 21000 in hex
      }

      case 'eth_gasPrice': {
        // Mock implementation - in real app, get current gas price
        return '0x3b9aca00' // 1 gwei in hex
      }

      case 'net_version': {
        const chainIdHex = await this.handleWalletRequest('eth_chainId', [])
        return parseInt(chainIdHex, 16).toString()
      }

      default:
        throw new Error(`Unsupported method: ${method}`)
    }
  }
}

// Initialize background service
new BackgroundService()

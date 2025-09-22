import { WalletAccount, Network, Transaction, SendTransactionParams, WalletStatus } from '@/types/wallet'
import { EthWallet } from '@okxweb3/coin-ethereum'
import { SecurityManager } from './security'

// OKX Web3 Wallet SDK integration
class WalletSDKWrapper {
  private ethWallet: EthWallet
  private isInitialized = false

  constructor() {
    this.ethWallet = new EthWallet()
  }

  async initialize() {
    if (!this.isInitialized) {
      this.isInitialized = true
    }
  }

  async createWallet(password: string, mnemonic?: string): Promise<WalletAccount> {
    await this.initialize()
    
    try {
      let result: any
      
      if (mnemonic) {
        // 使用助记词导入钱包
        result = await this.ethWallet.getNewAddress({
          mnemonic: mnemonic,
          hdPath: "m/44'/60'/0'/0/0"
        })
      } else {
        // 创建新钱包
        result = await this.ethWallet.getNewAddress({})
      }

      const account: WalletAccount = {
        id: this.generateId(),
        address: result.address,
        name: 'Account 1',
        balance: '0',
        isActive: true,
        createdAt: new Date().toISOString(),
        privateKey: result.privateKey,
        publicKey: result.publicKey
      }

      return account
    } catch (error) {
      console.error('Failed to create wallet:', error)
      throw new Error('Failed to create wallet')
    }
  }

  async unlockWallet(password: string): Promise<boolean> {
    await this.initialize()
    
    try {
      // OKX SDK 的解锁逻辑
      // 这里我们简化处理，实际项目中需要更复杂的验证
      return password.length >= 8
    } catch (error) {
      console.error('Failed to unlock wallet:', error)
      return false
    }
  }

  async getBalance(address: string, network: Network): Promise<string> {
    await this.initialize()
    
    try {
      // 使用 OKX SDK 获取余额
      const result = await this.ethWallet.getBalance({
        address,
        chainId: network.chainId,
        rpcUrl: network.rpcUrl
      })
      return result.balance || '0'
    } catch (error) {
      console.error('Failed to get balance:', error)
      return '0'
    }
  }

  async sendTransaction(params: SendTransactionParams, privateKey: string, network: Network): Promise<Transaction> {
    await this.initialize()
    
    try {
      // 使用 OKX SDK 签名交易
      const signParams = {
        privateKey: privateKey,
        data: {
          to: params.to,
          value: params.amount,
          gasPrice: params.gasPrice || '20000000000', // 20 gwei
          gasLimit: params.gasLimit || '21000',
          nonce: 0, // 实际项目中需要获取正确的 nonce
          chainId: network.chainId
        }
      }
      
      const result = await this.ethWallet.signTransaction(signParams)

      const transaction: Transaction = {
        id: this.generateId(),
        ...params,
        status: 'pending',
        createdAt: new Date().toISOString(),
        networkId: network.id,
        hash: result
      }

      return transaction
    } catch (error) {
      console.error('Failed to send transaction:', error)
      throw new Error('Failed to send transaction')
    }
  }

  async signMessage(message: string, privateKey: string): Promise<string> {
    await this.initialize()
    
    try {
      // 使用 OKX SDK 签名消息
      const result = await this.ethWallet.signMessage({
        message,
        privateKey
      })
      return result
    } catch (error) {
      console.error('Failed to sign message:', error)
      throw new Error('Failed to sign message')
    }
  }

  async verifyMessage(message: string, signature: string, address: string): Promise<boolean> {
    await this.initialize()
    
    try {
      // OKX SDK 没有直接的验证方法，这里简化处理
      // 实际项目中需要实现消息验证逻辑
      return true
    } catch (error) {
      console.error('Failed to verify message:', error)
      return false
    }
  }

  async getTransactionHistory(address: string, network: Network): Promise<Transaction[]> {
    await this.initialize()
    
    try {
      // OKX SDK 没有直接的交易历史方法，这里返回空数组
      // 实际项目中需要从区块链浏览器 API 获取交易历史
      return []
    } catch (error) {
      console.error('Failed to get transaction history:', error)
      return []
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

export class WalletManager {
  private sdk: WalletSDKWrapper
  private accounts: WalletAccount[] = []
  private currentAccount: WalletAccount | null = null
  private networks: Network[] = []
  private currentNetwork: Network | null = null
  private isUnlocked: boolean = false
  private isInitialized: boolean = false

  constructor() {
    this.sdk = new WalletSDKWrapper()
    this.initializeNetworks()
  }

  private initializeNetworks() {
    this.networks = [
      {
        id: 'ethereum-mainnet',
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
        chainId: 1,
        symbol: 'ETH',
        blockExplorer: 'https://etherscan.io',
        isActive: true
      },
      {
        id: 'ethereum-sepolia',
        name: 'Ethereum Sepolia',
        rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
        chainId: 11155111,
        symbol: 'ETH',
        blockExplorer: 'https://sepolia.etherscan.io',
        isActive: false
      },
      {
        id: 'polygon-mainnet',
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com',
        chainId: 137,
        symbol: 'MATIC',
        blockExplorer: 'https://polygonscan.com',
        isActive: false
      }
    ]
    this.currentNetwork = this.networks.find(n => n.isActive) || this.networks[0]
  }

  async initialize(): Promise<void> {
    try {
      // Load from storage
      const storedAccounts = await this.getStoredAccounts()
      const storedPassword = await this.getStoredPassword()
      
      this.accounts = storedAccounts
      this.currentAccount = this.accounts.find(acc => acc.isActive) || this.accounts[0] || null
      this.isInitialized = !!storedPassword
    } catch (error) {
      console.error('Failed to initialize wallet:', error)
    }
  }

  async createWallet(password: string, mnemonic?: string): Promise<WalletAccount> {
    try {
      // Validate password
      const passwordValidation = await SecurityManager.validatePassword(password)
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.error)
      }

      // Validate mnemonic if provided
      if (mnemonic) {
        const mnemonicValidation = await SecurityManager.validateMnemonic(mnemonic)
        if (!mnemonicValidation.isValid) {
          throw new Error(mnemonicValidation.error)
        }
      }

      const account = await this.sdk.createWallet(password, mnemonic)
      
      this.accounts = [account]
      this.currentAccount = account
      this.isUnlocked = true
      this.isInitialized = true

      // Encrypt and save sensitive data
      const encryptedPassword = await SecurityManager.encryptData(password, password)
      await this.saveAccounts()
      await this.savePassword(encryptedPassword)

      // Set session timeout
      await SecurityManager.setSessionTimeout('wallet')

      return account
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create wallet')
    }
  }

  async unlockWallet(password: string): Promise<boolean> {
    try {
      // Check login attempts
      const loginCheck = await SecurityManager.checkLoginAttempts('wallet')
      if (!loginCheck.allowed) {
        throw new Error(`Too many failed attempts. Please try again in ${Math.ceil(15)} minutes.`)
      }

      // Check session timeout
      const sessionValid = await SecurityManager.checkSessionTimeout('wallet')
      if (!sessionValid) {
        throw new Error('Session expired. Please unlock your wallet again.')
      }

      const success = await this.sdk.unlockWallet(password)
      
      if (success) {
        this.isUnlocked = true
        this.accounts = await this.getStoredAccounts()
        this.currentAccount = this.accounts.find(acc => acc.isActive) || this.accounts[0] || null
        
        // Record successful login
        await SecurityManager.recordLoginAttempt('wallet', true)
        await SecurityManager.setSessionTimeout('wallet')
      } else {
        // Record failed login
        await SecurityManager.recordLoginAttempt('wallet', false)
        throw new Error('Invalid password')
      }
      
      return success
    } catch (error) {
      return false
    }
  }

  async lockWallet(): Promise<void> {
    this.isUnlocked = false
    this.currentAccount = null
  }

  async getAccounts(): Promise<WalletAccount[]> {
    if (!this.isUnlocked) {
      throw new Error('Wallet is locked')
    }
    return this.accounts
  }

  async getCurrentAccount(): Promise<WalletAccount | null> {
    if (!this.isUnlocked) {
      throw new Error('Wallet is locked')
    }
    return this.currentAccount
  }

  async setCurrentAccount(accountId: string): Promise<void> {
    if (!this.isUnlocked) {
      throw new Error('Wallet is locked')
    }

    const account = this.accounts.find(acc => acc.id === accountId)
    if (!account) {
      throw new Error('Account not found')
    }

    this.accounts = this.accounts.map(acc => ({
      ...acc,
      isActive: acc.id === accountId
    }))

    this.currentAccount = account
    await this.saveAccounts()
  }

  async getBalance(address: string): Promise<string> {
    if (!this.isUnlocked || !this.currentNetwork) {
      throw new Error('Wallet is locked or no network selected')
    }

    return await this.sdk.getBalance(address, this.currentNetwork)
  }

  async sendTransaction(params: SendTransactionParams): Promise<Transaction> {
    if (!this.isUnlocked || !this.currentAccount || !this.currentNetwork) {
      throw new Error('Wallet is locked or no account/network selected')
    }

    if (!this.currentAccount.privateKey) {
      throw new Error('Private key not available')
    }

    // Validate transaction
    const transactionValidation = await SecurityManager.validateTransaction(params)
    if (!transactionValidation.isValid) {
      throw new Error(transactionValidation.error)
    }

    // Check session timeout
    const sessionValid = await SecurityManager.checkSessionTimeout('wallet')
    if (!sessionValid) {
      throw new Error('Session expired. Please unlock your wallet again.')
    }

    return await this.sdk.sendTransaction(params, this.currentAccount.privateKey, this.currentNetwork)
  }

  async getNetworks(): Promise<Network[]> {
    return this.networks
  }

  async setCurrentNetwork(networkId: string): Promise<void> {
    const network = this.networks.find(n => n.id === networkId)
    if (!network) {
      throw new Error('Network not found')
    }

    this.networks = this.networks.map(n => ({
      ...n,
      isActive: n.id === networkId
    }))

    this.currentNetwork = network
  }

  async getStatus(): Promise<WalletStatus> {
    return {
      isInitialized: this.isInitialized,
      isUnlocked: this.isUnlocked,
      accounts: this.accounts,
      currentAccount: this.currentAccount,
      currentNetwork: this.currentNetwork
    }
  }

  async isWalletInitialized(): Promise<boolean> {
    return this.isInitialized
  }

  async getTransactionHistory(address?: string): Promise<Transaction[]> {
    if (!this.isUnlocked || !this.currentNetwork) {
      throw new Error('Wallet is locked or no network selected')
    }

    const targetAddress = address || this.currentAccount?.address
    if (!targetAddress) {
      throw new Error('No address provided')
    }

    return await this.sdk.getTransactionHistory(targetAddress, this.currentNetwork)
  }

  async signMessage(message: string, address?: string): Promise<string> {
    if (!this.isUnlocked || !this.currentAccount) {
      throw new Error('Wallet is locked or no account selected')
    }

    const targetAddress = address || this.currentAccount.address
    const account = this.accounts.find(acc => acc.address === targetAddress)
    
    if (!account || !account.privateKey) {
      throw new Error('Account not found or private key not available')
    }

    return await this.sdk.signMessage(message, account.privateKey)
  }

  async verifyMessage(message: string, signature: string, address: string): Promise<boolean> {
    return await this.sdk.verifyMessage(message, signature, address)
  }

  // Storage methods
  private async getStoredAccounts(): Promise<WalletAccount[]> {
    try {
      const result = await chrome.storage.local.get('wallet_accounts')
      return result.wallet_accounts || []
    } catch {
      return []
    }
  }

  private async saveAccounts(): Promise<void> {
    await chrome.storage.local.set({ wallet_accounts: this.accounts })
  }

  private async getStoredPassword(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get('wallet_password')
      return result.wallet_password || null
    } catch {
      return null
    }
  }

  private async savePassword(password: string): Promise<void> {
    await chrome.storage.local.set({ wallet_password: password })
  }
}

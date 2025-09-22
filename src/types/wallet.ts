export interface WalletAccount {
  id: string
  address: string
  name: string
  balance: string
  isActive: boolean
  createdAt: string
  privateKey?: string
  publicKey?: string
}

export interface Transaction {
  id: string
  from: string
  to: string
  amount: string
  gasPrice?: string
  gasLimit?: string
  nonce?: number
  data?: string
  status: 'pending' | 'confirmed' | 'failed'
  hash?: string
  blockNumber?: number
  createdAt: string
  networkId: string
}

export interface Network {
  id: string
  name: string
  rpcUrl: string
  chainId: number
  symbol: string
  blockExplorer: string
  isActive: boolean
  icon?: string
}

export interface WalletStatus {
  isInitialized: boolean
  isUnlocked: boolean
  accounts: WalletAccount[]
  currentAccount: WalletAccount | null
  currentNetwork: Network | null
}

export interface WalletSettings {
  autoLock: boolean
  autoLockTimeout: number
  defaultNetwork: string
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  privacyMode: boolean
}

export interface SendTransactionParams {
  to: string
  amount: string
  gasPrice?: string
  gasLimit?: string
  data?: string
}

export interface WalletError {
  code: string
  message: string
  details?: any
}

export interface ConnectionRequest {
  origin: string
  favicon?: string
  timestamp: number
  accounts: string[]
  methods: string[]
}

export interface Permission {
  id: string
  origin: string
  accounts: string[]
  methods: string[]
  createdAt: string
  expiresAt?: string
}

export interface WalletProvider {
  isConnected: boolean
  accounts: string[]
  currentAccount: string | null
  chainId: number
  connect: () => Promise<{ accounts: string[] }>
  disconnect: () => Promise<void>
  request: (method: string, params?: any[]) => Promise<any>
  on: (event: string, callback: Function) => void
  removeListener: (event: string, callback: Function) => void
}

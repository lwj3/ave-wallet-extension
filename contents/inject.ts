// Content script for wallet extension
// This script runs in the context of web pages and injects wallet provider

class WalletContentScript {
  private isInjected = false
  private walletProvider: any = null

  constructor() {
    this.initialize()
  }

  private initialize() {
    // Listen for messages from the extension
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse)
      return true
    })

    // Inject wallet provider into the page
    this.injectWalletProvider()

    // Listen for page events
    this.setupPageListeners()
  }

  private injectWalletProvider() {
    if (this.isInjected) return

    const script = document.createElement('script')
    script.textContent = `
      // Wallet Provider Injection
      (function() {
        if (window.aveWallet) return; // Already injected
        
        window.aveWallet = {
          isConnected: false,
          accounts: [],
          currentAccount: null,
          chainId: 1,
          isMetaMask: false, // Compatibility flag
          selectedAddress: null,
          
          // Event listeners
          _listeners: {},
          
          async connect() {
            return new Promise((resolve, reject) => {
              chrome.runtime.sendMessage(
                { type: 'CONNECT_WALLET' },
                (response) => {
                  if (response && response.success) {
                    this.isConnected = true;
                    this.accounts = response.data.accounts || [];
                    this.currentAccount = response.data.accounts?.[0] || null;
                    this.selectedAddress = this.currentAccount;
                    this.chainId = response.data.chainId || 1;
                    
                    // Emit accountsChanged event
                    this.emit('accountsChanged', this.accounts);
                    this.emit('connect', { chainId: this.chainId });
                    
                    resolve(response.data);
                  } else {
                    reject(new Error(response?.error || 'Failed to connect'));
                  }
                }
              );
            });
          },
          
          async disconnect() {
            return new Promise((resolve) => {
              chrome.runtime.sendMessage(
                { type: 'DISCONNECT_WALLET' },
                (response) => {
                  this.isConnected = false;
                  this.accounts = [];
                  this.currentAccount = null;
                  this.selectedAddress = null;
                  
                  // Emit disconnect event
                  this.emit('disconnect');
                  
                  resolve();
                }
              );
            });
          },
          
          async request(method, params = []) {
            return new Promise((resolve, reject) => {
              chrome.runtime.sendMessage(
                { type: 'WALLET_REQUEST', data: { method, params } },
                (response) => {
                  if (response && response.success) {
                    resolve(response.data);
                  } else {
                    reject(new Error(response?.error || 'Request failed'));
                  }
                }
              );
            });
          },
          
          // EIP-1193 methods
          async getAccounts() {
            return this.request('eth_accounts');
          },
          
          async getBalance(address) {
            return this.request('eth_getBalance', [address, 'latest']);
          },
          
          async sendTransaction(transaction) {
            return this.request('eth_sendTransaction', [transaction]);
          },
          
          async getChainId() {
            return this.request('eth_chainId');
          },
          
          async switchChain(chainId) {
            return this.request('wallet_switchEthereumChain', [{ chainId }]);
          },
          
          async signMessage(message) {
            return this.request('personal_sign', [message, this.selectedAddress]);
          },
          
          async signTypedData(typedData) {
            return this.request('eth_signTypedData_v4', [this.selectedAddress, typedData]);
          },
          
          // Event handling
          on(event, callback) {
            if (!this._listeners[event]) {
              this._listeners[event] = [];
            }
            this._listeners[event].push(callback);
          },
          
          removeListener(event, callback) {
            if (this._listeners[event]) {
              this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
            }
          },
          
          emit(event, data) {
            if (this._listeners[event]) {
              this._listeners[event].forEach(callback => {
                try {
                  callback(data);
                } catch (error) {
                  console.error('Error in event listener:', error);
                }
              });
            }
          },
          
          // MetaMask compatibility
          async enable() {
            return this.connect();
          },
          
          async isConnected() {
            return this.isConnected;
          },
          
          // Additional utility methods
          async getNetworkVersion() {
            const chainId = await this.getChainId();
            return parseInt(chainId, 16).toString();
          },
          
          async getTransactionCount(address) {
            return this.request('eth_getTransactionCount', [address, 'latest']);
          },
          
          async estimateGas(transaction) {
            return this.request('eth_estimateGas', [transaction]);
          },
          
          async getGasPrice() {
            return this.request('eth_gasPrice');
          }
        };
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('aveWalletReady'));
      })();
    `
    
    document.head.appendChild(script)
    this.isInjected = true
  }

  private setupPageListeners() {
    // Listen for wallet connection requests from the page
    window.addEventListener('message', (event) => {
      if (event.source !== window) return
      
      if (event.data.type === 'AVE_WALLET_REQUEST') {
        this.handleWalletRequest(event.data)
      }
    })
  }

  private handleWalletRequest(data: any) {
    // Handle wallet requests from the page
    console.log('Wallet request from page:', data)
  }

  private async handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
    switch (message.type) {
      case 'INJECT_WALLET_PROVIDER':
        this.injectWalletProvider()
        sendResponse({ success: true })
        break
      
      case 'GET_PAGE_INFO':
        sendResponse({
          success: true,
          data: {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname
          }
        })
        break
      
      case 'WALLET_REQUEST':
        try {
          const result = await this.handleWalletMethod(message.data.method, message.data.params)
          sendResponse({ success: true, data: result })
        } catch (error) {
          sendResponse({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
        }
        break
      
      default:
        sendResponse({ success: false, error: 'Unknown message type' })
    }
  }

  private async handleWalletMethod(method: string, params: any[]): Promise<any> {
    // Forward wallet method calls to background script
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'WALLET_METHOD', data: { method, params } },
        (response) => {
          if (response && response.success) {
            resolve(response.data)
          } else {
            reject(new Error(response?.error || 'Method call failed'))
          }
        }
      )
    })
  }
}

// Initialize content script
new WalletContentScript()

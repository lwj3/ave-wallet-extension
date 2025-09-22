// Security utilities for the wallet extension

export class SecurityManager {
  private static readonly MAX_LOGIN_ATTEMPTS = 5
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

  private static loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map()
  private static sessionTimeout: Map<string, number> = new Map()

  static async validatePassword(password: string): Promise<{ isValid: boolean; error?: string }> {
    if (!password) {
      return { isValid: false, error: 'Password is required' }
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' }
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }
    }

    return { isValid: true }
  }

  static async validateMnemonic(mnemonic: string): Promise<{ isValid: boolean; error?: string }> {
    if (!mnemonic) {
      return { isValid: false, error: 'Mnemonic is required' }
    }

    const words = mnemonic.trim().split(/\s+/)
    if (words.length !== 12 && words.length !== 24) {
      return { isValid: false, error: 'Mnemonic must be 12 or 24 words' }
    }

    // Basic word validation (in real implementation, check against BIP39 wordlist)
    const validWordPattern = /^[a-z]+$/
    for (const word of words) {
      if (!validWordPattern.test(word)) {
        return { isValid: false, error: 'Mnemonic contains invalid words' }
      }
    }

    return { isValid: true }
  }

  static async validateAddress(address: string): Promise<{ isValid: boolean; error?: string }> {
    if (!address) {
      return { isValid: false, error: 'Address is required' }
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return { isValid: false, error: 'Invalid Ethereum address format' }
    }

    return { isValid: true }
  }

  static async validateTransaction(transaction: any): Promise<{ isValid: boolean; error?: string }> {
    if (!transaction) {
      return { isValid: false, error: 'Transaction is required' }
    }

    if (!transaction.to) {
      return { isValid: false, error: 'Transaction recipient is required' }
    }

    const addressValidation = await this.validateAddress(transaction.to)
    if (!addressValidation.isValid) {
      return { isValid: false, error: `Invalid recipient address: ${addressValidation.error}` }
    }

    if (transaction.value && (isNaN(parseFloat(transaction.value)) || parseFloat(transaction.value) < 0)) {
      return { isValid: false, error: 'Invalid transaction amount' }
    }

    if (transaction.gasPrice && (isNaN(parseInt(transaction.gasPrice)) || parseInt(transaction.gasPrice) < 0)) {
      return { isValid: false, error: 'Invalid gas price' }
    }

    if (transaction.gasLimit && (isNaN(parseInt(transaction.gasLimit)) || parseInt(transaction.gasLimit) < 21000)) {
      return { isValid: false, error: 'Invalid gas limit (minimum 21000)' }
    }

    return { isValid: true }
  }

  static async checkLoginAttempts(identifier: string): Promise<{ allowed: boolean; remainingAttempts: number }> {
    const attempts = this.loginAttempts.get(identifier)
    const now = Date.now()

    if (!attempts) {
      return { allowed: true, remainingAttempts: this.MAX_LOGIN_ATTEMPTS }
    }

    // Reset attempts if lockout period has passed
    if (now - attempts.lastAttempt > this.LOCKOUT_DURATION) {
      this.loginAttempts.delete(identifier)
      return { allowed: true, remainingAttempts: this.MAX_LOGIN_ATTEMPTS }
    }

    const remainingAttempts = Math.max(0, this.MAX_LOGIN_ATTEMPTS - attempts.count)
    return { allowed: attempts.count < this.MAX_LOGIN_ATTEMPTS, remainingAttempts }
  }

  static async recordLoginAttempt(identifier: string, success: boolean): Promise<void> {
    const now = Date.now()
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: now }

    if (success) {
      this.loginAttempts.delete(identifier)
    } else {
      attempts.count += 1
      attempts.lastAttempt = now
      this.loginAttempts.set(identifier, attempts)
    }
  }

  static async setSessionTimeout(identifier: string): Promise<void> {
    const timeout = Date.now() + this.SESSION_TIMEOUT
    this.sessionTimeout.set(identifier, timeout)
  }

  static async checkSessionTimeout(identifier: string): Promise<boolean> {
    const timeout = this.sessionTimeout.get(identifier)
    if (!timeout) return false

    const now = Date.now()
    if (now > timeout) {
      this.sessionTimeout.delete(identifier)
      return false
    }

    return true
  }

  static async clearSession(identifier: string): Promise<void> {
    this.sessionTimeout.delete(identifier)
  }

  static async sanitizeInput(input: string): Promise<string> {
    if (typeof input !== 'string') return ''
    
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }

  static async generateSecureRandom(length: number = 32): Promise<string> {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password)
    return passwordHash === hash
  }

  static async encryptData(data: string, password: string): Promise<string> {
    // Simple encryption using Web Crypto API
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    )

    const salt = crypto.getRandomValues(new Uint8Array(16))
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    )

    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      derivedKey,
      encoder.encode(data)
    )

    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
    result.set(salt, 0)
    result.set(iv, salt.length)
    result.set(new Uint8Array(encrypted), salt.length + iv.length)

    return btoa(String.fromCharCode(...result))
  }

  static async decryptData(encryptedData: string, password: string): Promise<string> {
    try {
      const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
      const salt = data.slice(0, 16)
      const iv = data.slice(16, 28)
      const encrypted = data.slice(28)

      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      )

      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        key,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      )

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        derivedKey,
        encrypted
      )

      return new TextDecoder().decode(decrypted)
    } catch (error) {
      throw new Error('Failed to decrypt data')
    }
  }
}

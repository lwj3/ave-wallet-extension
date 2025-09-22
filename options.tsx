import React, { useState, useEffect } from 'react'
import { WalletProvider } from '@/components/WalletProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useWallet } from '@/hooks/useWallet'
import { Wallet, Settings, Shield, Bell, Palette, Network, Trash2, Download, Upload } from 'lucide-react'
import '@/styles/globals.css'

function OptionsContent() {
  const { 
    isInitialized, 
    isUnlocked, 
    currentNetwork, 
    networks, 
    switchNetwork,
    lockWallet 
  } = useWallet()

  const [settings, setSettings] = useState({
    autoLock: true,
    autoLockTimeout: 15,
    defaultNetwork: 'ethereum-mainnet',
    theme: 'system',
    notifications: true,
    privacyMode: false
  })

  const [exportData, setExportData] = useState('')
  const [importData, setImportData] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.local.get('wallet_settings')
      if (result.wallet_settings) {
        setSettings(result.wallet_settings)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await chrome.storage.local.set({ wallet_settings: newSettings })
      setSettings(newSettings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }

  const handleExportWallet = async () => {
    try {
      const result = await chrome.storage.local.get(['wallet_accounts', 'wallet_password'])
      const exportData = {
        accounts: result.wallet_accounts || [],
        settings: settings,
        exportDate: new Date().toISOString()
      }
      setExportData(JSON.stringify(exportData, null, 2))
    } catch (error) {
      console.error('Failed to export wallet:', error)
    }
  }

  const handleImportWallet = async () => {
    try {
      const data = JSON.parse(importData)
      if (data.accounts && data.settings) {
        await chrome.storage.local.set({
          wallet_accounts: data.accounts,
          wallet_settings: data.settings
        })
        setImportData('')
        alert('Wallet imported successfully! Please refresh the extension.')
      }
    } catch (error) {
      console.error('Failed to import wallet:', error)
      alert('Invalid import data')
    }
  }

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all wallet data? This action cannot be undone.')) {
      try {
        await chrome.storage.local.clear()
        alert('All data cleared. Please refresh the extension.')
      } catch (error) {
        console.error('Failed to clear data:', error)
      }
    }
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Ave Wallet</h1>
          <p className="text-muted-foreground">Please initialize your wallet first</p>
        </div>
      </div>
    )
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Wallet Locked</h1>
          <p className="text-muted-foreground">Please unlock your wallet to access settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Wallet className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Ave Wallet Settings</h1>
            <p className="text-muted-foreground">Manage your wallet preferences and security</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-lock">Auto Lock</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically lock wallet after inactivity
                  </p>
                </div>
                <Switch
                  id="auto-lock"
                  checked={settings.autoLock}
                  onCheckedChange={(checked) => handleSettingChange('autoLock', checked)}
                />
              </div>

              {settings.autoLock && (
                <div className="space-y-2">
                  <Label htmlFor="auto-lock-timeout">Auto Lock Timeout (minutes)</Label>
                  <Input
                    id="auto-lock-timeout"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.autoLockTimeout}
                    onChange={(e) => handleSettingChange('autoLockTimeout', parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="privacy-mode">Privacy Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Hide sensitive information in UI
                  </p>
                </div>
                <Switch
                  id="privacy-mode"
                  checked={settings.privacyMode}
                  onCheckedChange={(checked) => handleSettingChange('privacyMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Network Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-network">Default Network</Label>
                <Select
                  value={settings.defaultNetwork}
                  onValueChange={(value) => handleSettingChange('defaultNetwork', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.id} value={network.id}>
                        {network.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Current Network</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{currentNetwork?.name || 'None'}</p>
                  <p className="text-sm text-muted-foreground">
                    Chain ID: {currentNetwork?.chainId || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => handleSettingChange('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for transactions and updates
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Export Wallet Data</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Export your wallet data for backup
                  </p>
                  <Button onClick={handleExportWallet} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                {exportData && (
                  <div className="space-y-2">
                    <Label>Export Data</Label>
                    <textarea
                      value={exportData}
                      readOnly
                      className="w-full h-32 p-2 border rounded-md bg-muted text-sm font-mono"
                    />
                  </div>
                )}

                <Separator />

                <div>
                  <Label>Import Wallet Data</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Import previously exported wallet data
                  </p>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste exported data here..."
                    className="w-full h-32 p-2 border rounded-md text-sm font-mono mb-2"
                  />
                  <Button onClick={handleImportWallet} variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>

                <Separator />

                <div>
                  <Label>Clear All Data</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Permanently delete all wallet data
                  </p>
                  <Button onClick={handleClearData} variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function Options() {
  return (
    <WalletProvider>
      <OptionsContent />
    </WalletProvider>
  )
}
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'
import { SendTransactionParams } from '@/types/wallet'

interface TransactionFormProps {
  onSendTransaction: (params: SendTransactionParams) => Promise<void>
  loading?: boolean
}

export function TransactionForm({ onSendTransaction, loading = false }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    to: '',
    amount: '',
    gasPrice: '',
    gasLimit: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.to || !formData.amount) {
      setError('Recipient address and amount are required')
      return
    }

    try {
      setIsSubmitting(true)
      
      const transactionParams: SendTransactionParams = {
        to: formData.to,
        amount: formData.amount,
        gasPrice: formData.gasPrice || undefined,
        gasLimit: formData.gasLimit || undefined
      }

      await onSendTransaction(transactionParams)
      
      // Reset form on success
      setFormData({
        to: '',
        amount: '',
        gasPrice: '',
        gasLimit: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Transaction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="to" className="text-sm font-medium">
              Recipient Address
            </label>
            <Input
              id="to"
              type="text"
              placeholder="0x..."
              value={formData.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount (ETH)
            </label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              placeholder="0.0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="gasPrice" className="text-sm font-medium">
                Gas Price (Gwei)
              </label>
              <Input
                id="gasPrice"
                type="number"
                placeholder="20"
                value={formData.gasPrice}
                onChange={(e) => handleInputChange('gasPrice', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gasLimit" className="text-sm font-medium">
                Gas Limit
              </label>
              <Input
                id="gasLimit"
                type="number"
                placeholder="21000"
                value={formData.gasLimit}
                onChange={(e) => handleInputChange('gasLimit', e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Transaction
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

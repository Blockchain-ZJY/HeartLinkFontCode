import React, { useState } from 'react'
import { Shield, UserPlus, AlertCircle } from 'lucide-react'
import { ethers } from 'ethers'

const AdminPanel = ({ isAdmin, onAddRecipient, loading }) => {
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!ethers.isAddress(recipientAddress.trim())) {
      alert('请输入有效的Monad地址')
      return
    }

    setIsSubmitting(true)
    try {
      await onAddRecipient(recipientAddress.trim())
      setRecipientAddress('')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="warm-card rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-600">管理员功能</h2>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <p className="text-blue-700">只有合约管理员可以直接添加受益人。普通用户请使用上方的申请功能。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="warm-card rounded-2xl p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-bold gradient-text">管理员功能</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-700 mb-2">
            直接添加受益人地址 (管理员特权)
          </label>
          <input
            id="recipientAddress"
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            className="input-field font-mono"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="btn-success w-full flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              添加中...
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" />
              添加受益人
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default AdminPanel 
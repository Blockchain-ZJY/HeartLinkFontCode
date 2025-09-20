import React, { useState, useEffect } from 'react'
import { Heart, Send, DollarSign } from 'lucide-react'
import { ethers } from 'ethers'
import RecipientSelector from './RecipientSelector'

const DonationForm = ({ 
  onDonate, 
  loading, 
  getContractInstance,
  preselectedRecipient,
  onClearPreselection 
}) => {
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    words: ''
  })
  const [minimumUsd, setMinimumUsd] = useState('加载中...')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadMinimumUsd = async () => {
      try {
        console.log('=== 开始获取最低捐赠要求 ===')
        console.log('合约地址:', '0xb3f8CBD5760e3C1bA76D277E0E36AaF450Fd2bf2')
        console.log('使用 Alchemy RPC')
        
        // 先测试基本的 RPC 连接
        console.log('步骤 1: 测试 RPC 连接')
        const { ethers } = await import('ethers')
        const provider = new ethers.JsonRpcProvider('https://monad-testnet.g.alchemy.com/v2/Mg1nzqui47WMEWBS7luHU')
        const blockNumber = await provider.getBlockNumber()
        console.log('✅ RPC 连接成功，当前区块:', blockNumber)
        
        // 检查合约代码
        console.log('步骤 2: 检查合约代码')
        const code = await provider.getCode('0xb3f8CBD5760e3C1bA76D277E0E36AaF450Fd2bf2')
        console.log('合约代码长度:', code.length)
        console.log('是否为合约:', code !== '0x')
        
        if (code === '0x') {
          throw new Error('❌ 合约地址没有代码，可能部署失败或地址错误')
        }
        
        console.log('步骤 3: 创建合约实例')
        const contract = await getContractInstance(false)
        console.log('✅ 合约实例创建成功')
        
        console.log('步骤 4: 调用 MINIMUM_USD')
        const minimum = await contract.MINIMUM_USD()
        console.log('✅ MINIMUM_USD 调用成功:', minimum.toString())
        
        setMinimumUsd(`${minimum} USD`)
      } catch (error) {
        console.error('❌ 获取最低捐赠要求失败:', error)
        console.error('错误详情:', {
          code: error.code,
          message: error.message,
          data: error.data,
          transaction: error.transaction,
          stack: error.stack
        })
        
        setMinimumUsd('❌ 加载失败 - 请检查控制台')
      }
    }

    if (getContractInstance) {
      loadMinimumUsd()
    }
  }, [getContractInstance])

  // 处理预选受益人
  useEffect(() => {
    if (preselectedRecipient) {
      setFormData(prev => ({ 
        ...prev, 
        recipient: preselectedRecipient.recipientAddress 
      }))
    }
  }, [preselectedRecipient])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.recipient) {
      alert('请选择受益人')
      return
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('请输入有效的捐赠金额')
      return
    }

    setIsSubmitting(true)
    try {
      await onDonate(formData.recipient, formData.amount, formData.words)
      setFormData({ recipient: '', amount: '', words: '' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecipientSelect = (recipientAddress) => {
    setFormData(prev => ({ ...prev, recipient: recipientAddress }))
  }

  return (
    <div className="warm-card rounded-2xl p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-6 w-6 text-red-500" />
        <h2 className="text-2xl font-bold gradient-text">慈善捐赠</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 使用新的受益人选择器 */}
        <RecipientSelector
          selectedRecipient={formData.recipient}
          onRecipientSelect={handleRecipientSelect}
          getContractInstance={getContractInstance}
          preselectedRecipient={preselectedRecipient}
          onClearPreselection={onClearPreselection}
        />

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            捐赠金额 (MON) *
          </label>
          <input
            id="amount"
            type="number"
            step="0.001"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="0.01"
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="words" className="block text-sm font-medium text-gray-700 mb-2">
            留言 (可选)
          </label>
          <textarea
            id="words"
            value={formData.words}
            onChange={(e) => setFormData(prev => ({ ...prev, words: e.target.value }))}
            placeholder="写下您的祝福或支持的话..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
          <div className="flex items-center gap-2 text-pink-700">
            <DollarSign className="h-5 w-5" />
            <span className="font-medium">最低捐赠要求: {minimumUsd}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || loading || !formData.recipient}
          className="btn-accent w-full flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              捐赠中...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              💝 立即捐赠
            </>
          )}
        </button>

        {!formData.recipient && (
          <div className="text-sm text-gray-500 text-center">
            请先选择一个受益人才能进行捐赠
          </div>
        )}
      </form>
    </div>
  )
}

export default DonationForm 
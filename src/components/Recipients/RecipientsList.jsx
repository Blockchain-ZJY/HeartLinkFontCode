import React, { useState, useEffect } from 'react'
import { Users, RefreshCw, Wallet, TrendingUp, Download } from 'lucide-react'
import { ethers } from 'ethers'

const RecipientsList = ({ 
  recipients, 
  onLoadRecipients, 
  onWithdraw, 
  loading, 
  getContractInstance, 
  currentAccount 
}) => {
  const [recipientsData, setRecipientsData] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    if (recipients.length > 0) {
      loadRecipientsData()
    }
  }, [recipients, currentAccount])

  const loadRecipientsData = async () => {
    if (!getContractInstance || recipients.length === 0) return

    setLoadingData(true)
    try {
      const contract = await getContractInstance(false)
      const data = await Promise.all(
        recipients.map(async (recipient) => {
          try {
            const [balance, totalSum] = await Promise.all([
              contract.getRecipientBalance(recipient),
              contract.getRecipientsSumToken(recipient)
            ])

            return {
              address: recipient,
              balance: ethers.formatEther(balance),
              totalSum: ethers.formatEther(totalSum),
              isCurrentUser: recipient.toLowerCase() === currentAccount?.toLowerCase()
            }
          } catch (error) {
            console.error(`获取受益人 ${recipient} 数据失败:`, error)
            return {
              address: recipient,
              balance: '0',
              totalSum: '0',
              isCurrentUser: recipient.toLowerCase() === currentAccount?.toLowerCase(),
              error: true
            }
          }
        })
      )
      setRecipientsData(data)
    } catch (error) {
      console.error('加载受益人数据失败:', error)
      // 即使出错也显示基础信息
      const fallbackData = recipients.map(recipient => ({
        address: recipient,
        balance: '0',
        totalSum: '0',
        isCurrentUser: recipient.toLowerCase() === currentAccount?.toLowerCase(),
        error: true
      }))
      setRecipientsData(fallbackData)
    } finally {
      setLoadingData(false)
    }
  }

  const handleWithdraw = async () => {
    setWithdrawing(true)
    try {
      await onWithdraw()
      await loadRecipientsData() // 刷新数据
    } finally {
      setWithdrawing(false)
    }
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="warm-card rounded-2xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold gradient-text">受益人管理</h2>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onLoadRecipients}
            disabled={loading}
            className="bg-white/80 border border-pink-200 hover:bg-pink-50 text-gray-700 font-medium px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新列表
          </button>
          
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || !currentAccount}
            className="btn-secondary flex items-center gap-2"
          >
            {withdrawing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                提取中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                提取我的资金
              </>
            )}
          </button>
        </div>
      </div>

      {loadingData ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
          <span className="ml-3 text-gray-600">加载受益人数据中...</span>
        </div>
      ) : recipientsData.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">暂无受益人</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {recipientsData.map((recipient) => (
            <div
              key={recipient.address}
              className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                recipient.isCurrentUser
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-200 bg-gray-50 hover:border-primary-200 hover:bg-primary-25'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-gray-800">
                      受益人 {recipient.isCurrentUser && <span className="text-primary-600">(您)</span>}
                    </h3>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-3 mb-4">
                    <div className="text-xs text-gray-500 mb-1">地址</div>
                    <div className="font-mono text-sm text-gray-800 break-all">
                      {recipient.address}
                    </div>
                  </div>

                  {recipient.error ? (
                    <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-red-700">
                      获取详细信息失败
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet className="h-4 w-4 text-primary-600" />
                          <span className="text-sm font-medium text-gray-600">可提取余额</span>
                        </div>
                        <div className="text-xl font-bold text-primary-600">
                          {parseFloat(recipient.balance).toFixed(4)} MON
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-600">历史捐赠总额</span>
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          {parseFloat(recipient.totalSum).toFixed(4)} MON
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {recipient.isCurrentUser && parseFloat(recipient.balance) > 0 && (
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="btn-secondary ml-4"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecipientsList 
import React, { useState } from 'react'
import { Search, User, History, TrendingUp, Eye, Calendar } from 'lucide-react'
import { ethers } from 'ethers'
import RecipientSelector from '../Donation/RecipientSelector'

const QueryPanel = ({ getContractInstance }) => {
  const [activeTab, setActiveTab] = useState('balance')
  const [queries, setQueries] = useState({
    balanceRecipient: '',
    historyRecipient: '',
    funderAddress: '',
    funderRecipient: ''
  })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN')
  }

  const handleQueryBalance = async () => {
    if (!queries.balanceRecipient) {
      alert('请选择受益人')
      return
    }

    setLoading(true)
    try {
      const contract = await getContractInstance(false)
      const [balance, totalSum] = await Promise.all([
        contract.getRecipientBalance(queries.balanceRecipient),
        contract.getRecipientsSumToken(queries.balanceRecipient)
      ])

      setResults({
        type: 'balance',
        data: {
          recipient: queries.balanceRecipient,
          balance: ethers.formatEther(balance),
          totalSum: ethers.formatEther(totalSum)
        }
      })
    } catch (error) {
      alert('查询失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleQueryHistory = async () => {
    if (!queries.historyRecipient) {
      alert('请选择受益人')
      return
    }

    setLoading(true)
    try {
      const contract = await getContractInstance(false)
      const donations = await contract.getDonationsForRecipient(queries.historyRecipient)

      setResults({
        type: 'history',
        data: {
          recipient: queries.historyRecipient,
          donations: donations
        }
      })
    } catch (error) {
      alert('查询失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckFunderDonated = async () => {
    if (!ethers.isAddress(queries.funderAddress.trim())) {
      alert('请输入有效的捐赠者地址')
      return
    }
    if (!queries.funderRecipient) {
      alert('请选择受益人')
      return
    }

    setLoading(true)
    try {
      const contract = await getContractInstance(false)
      const hasDonated = await contract.hasFunderDonated(queries.funderRecipient, queries.funderAddress.trim())

      setResults({
        type: 'check',
        data: {
          funder: queries.funderAddress.trim(),
          recipient: queries.funderRecipient,
          hasDonated
        }
      })
    } catch (error) {
      alert('查询失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'balance', name: '余额查询', icon: TrendingUp },
    { id: 'history', name: '捐赠记录', icon: History },
    { id: 'check', name: '捐赠验证', icon: Eye }
  ]

  const renderBalanceQuery = () => (
    <div className="space-y-6">
      <RecipientSelector
        selectedRecipient={queries.balanceRecipient}
        onRecipientSelect={(address) => setQueries(prev => ({ ...prev, balanceRecipient: address }))}
        getContractInstance={getContractInstance}
      />
      
      <button
        onClick={handleQueryBalance}
        disabled={loading || !queries.balanceRecipient}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            查询中...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            查询余额
          </>
        )}
      </button>
    </div>
  )

  const renderHistoryQuery = () => (
    <div className="space-y-6">
      <RecipientSelector
        selectedRecipient={queries.historyRecipient}
        onRecipientSelect={(address) => setQueries(prev => ({ ...prev, historyRecipient: address }))}
        getContractInstance={getContractInstance}
      />
      
      <button
        onClick={handleQueryHistory}
        disabled={loading || !queries.historyRecipient}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            查询中...
          </>
        ) : (
          <>
            <History className="h-4 w-4" />
            查询记录
          </>
        )}
      </button>
    </div>
  )

  const renderCheckQuery = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          捐赠者地址 *
        </label>
        <input
          type="text"
          value={queries.funderAddress}
          onChange={(e) => setQueries(prev => ({ ...prev, funderAddress: e.target.value }))}
          placeholder="0x..."
          className="input-field"
        />
      </div>
      
      <RecipientSelector
        selectedRecipient={queries.funderRecipient}
        onRecipientSelect={(address) => setQueries(prev => ({ ...prev, funderRecipient: address }))}
        getContractInstance={getContractInstance}
      />
      
      <button
        onClick={handleCheckFunderDonated}
        disabled={loading || !queries.funderAddress.trim() || !queries.funderRecipient}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            验证中...
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            验证捐赠
          </>
        )}
      </button>
    </div>
  )

  const renderResults = () => {
    if (!results) return null

    switch (results.type) {
      case 'balance':
        return (
          <div className="warm-card rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              余额查询结果
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">受益人地址:</span>
                <span className="font-mono text-sm">{formatAddress(results.data.recipient)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">可提取余额:</span>
                <span className="font-bold text-green-600">{parseFloat(results.data.balance).toFixed(4)} MON</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">历史总收入:</span>
                <span className="font-bold text-blue-600">{parseFloat(results.data.totalSum).toFixed(4)} MON</span>
              </div>
            </div>
          </div>
        )

      case 'history':
        return (
          <div className="warm-card rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-blue-500" />
              捐赠记录 ({results.data.donations.length} 条)
            </h3>
            {results.data.donations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无捐赠记录</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.data.donations.map((donation, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-800">
                          {formatAddress(donation.funder)}
                        </div>
                        <div className="text-sm text-gray-500">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatTimestamp(donation.timestamp)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {parseFloat(ethers.formatEther(donation.amount)).toFixed(4)} MON
                        </div>
                      </div>
                    </div>
                    {donation.words && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">留言:</div>
                        <div className="text-sm text-gray-700">{donation.words}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'check':
        return (
          <div className="warm-card rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              捐赠验证结果
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">捐赠者:</span>
                <span className="font-mono text-sm">{formatAddress(results.data.funder)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">受益人:</span>
                <span className="font-mono text-sm">{formatAddress(results.data.recipient)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">捐赠状态:</span>
                <span className={`font-bold ${results.data.hasDonated ? 'text-green-600' : 'text-red-600'}`}>
                  {results.data.hasDonated ? '✓ 已捐赠' : '✗ 未捐赠'}
                </span>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* 标签页导航 */}
      <div className="warm-card rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Search className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold gradient-text">数据查询</h2>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setResults(null)
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 查询表单 */}
      <div className="warm-card rounded-2xl p-6 shadow-lg">
        {activeTab === 'balance' && renderBalanceQuery()}
        {activeTab === 'history' && renderHistoryQuery()}
        {activeTab === 'check' && renderCheckQuery()}
      </div>

      {/* 查询结果 */}
      {renderResults()}
    </div>
  )
}

export default QueryPanel 
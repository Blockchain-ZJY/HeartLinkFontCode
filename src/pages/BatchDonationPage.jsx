import React, { useState, useEffect, useCallback } from 'react'
import { Heart, Users, Zap, CheckCircle, X, Plus, Minus, Send, Clock, TrendingUp } from 'lucide-react'
import { ethers } from 'ethers'
import PageWrapper from '../components/Layout/PageWrapper'

/**
 * 批量捐赠页面
 * 支持一次性向多个受益人捐赠，展示高TPS网络性能
 */
const BatchDonationPage = ({ isConnected, getContractInstance, onDonate }) => {
  const [recipients, setRecipients] = useState([])
  const [selectedDonations, setSelectedDonations] = useState([])
  const [loading, setLoading] = useState(false)
  const [donating, setDonating] = useState(false)
  const [donationResults, setDonationResults] = useState([])
  const [tpsStats, setTpsStats] = useState({
    totalTransactions: 0,
    successCount: 0,
    failCount: 0,
    startTime: null,
    endTime: null,
    tps: 0
  })

  // 加载受益人列表
  const loadRecipients = useCallback(async () => {
    if (!getContractInstance || !isConnected) return

    setLoading(true)
    try {
      const contract = await getContractInstance(false)
      const allApplications = await contract.getAllApplications()
      
      // 筛选已批准的受益人
      const approvedRecipients = allApplications
        .filter(app => app.isApproved === true)
        .map(app => ({
          address: app.recipientAddress,
          reason: app.reason,
          topic: app.topic || '未分类',
          ipfsCID: app.ipfsCID
        }))
      
      setRecipients(approvedRecipients)
    } catch (error) {
      console.error('加载受益人失败:', error)
    } finally {
      setLoading(false)
    }
  }, [getContractInstance, isConnected])

  useEffect(() => {
    loadRecipients()
  }, [loadRecipients])

  // 添加捐赠项
  const addDonation = (recipient) => {
    const existingIndex = selectedDonations.findIndex(d => d.recipient === recipient.address)
    if (existingIndex >= 0) {
      // 如果已存在，增加金额
      const updated = [...selectedDonations]
      updated[existingIndex].amount = (parseFloat(updated[existingIndex].amount) + 0.001).toFixed(3)
      setSelectedDonations(updated)
    } else {
      // 添加新的捐赠项
      setSelectedDonations([...selectedDonations, {
        recipient: recipient.address,
        recipientInfo: recipient,
        amount: '0.001',
        words: `批量捐赠给 ${recipient.topic}`
      }])
    }
  }

  // 移除捐赠项
  const removeDonation = (recipient) => {
    setSelectedDonations(selectedDonations.filter(d => d.recipient !== recipient))
  }

  // 更新捐赠金额
  const updateDonationAmount = (recipient, amount) => {
    const updated = selectedDonations.map(d => 
      d.recipient === recipient ? { ...d, amount } : d
    )
    setSelectedDonations(updated)
  }

  // 更新捐赠留言
  const updateDonationWords = (recipient, words) => {
    const updated = selectedDonations.map(d => 
      d.recipient === recipient ? { ...d, words } : d
    )
    setSelectedDonations(updated)
  }

  // 快速选择预设金额
  const setQuickAmount = (amount) => {
    const updated = selectedDonations.map(d => ({ ...d, amount: amount.toString() }))
    setSelectedDonations(updated)
  }

  // 一键选择所有受益人
  const selectAllRecipients = () => {
    const newDonations = recipients.map(recipient => ({
      recipient: recipient.address,
      recipientInfo: recipient,
      amount: '0.001',
      words: `批量捐赠给 ${recipient.topic}`
    }))
    setSelectedDonations(newDonations)
  }

  // 执行批量捐赠 - 快速连续发送多个独立交易
  const executeBatchDonation = async () => {
    if (selectedDonations.length === 0) {
      alert('请至少选择一个受益人')
      return
    }

    // 安全提示
    const confirmed = window.confirm(
      `⚠️ 安全提示：\n\n` +
      `• 即将发送 ${selectedDonations.length} 个独立交易\n` +
      `• 每个交易需要单独确认\n` +
      `• 每个交易有独立的哈希值\n` +
      `• 建议在测试网络上进行测试\n\n` +
      `确定要继续吗？`
    )
    
    if (!confirmed) return

    setDonating(true)
    setDonationResults([])
    
    const startTime = Date.now()
    setTpsStats({
      totalTransactions: selectedDonations.length,
      successCount: 0,
      failCount: 0,
      startTime,
      endTime: null,
      tps: 0
    })

    // 初始化所有捐赠为pending状态
    const results = selectedDonations.map(donation => ({
      ...donation,
      status: 'pending',
      startTime: startTime,
      txHash: null
    }))
    setDonationResults(results)

    try {
      const contract = await getContractInstance()
      
      // 显示提示信息
      alert(`🚀 开始发送 ${selectedDonations.length} 个交易\n\n请依次在MetaMask中确认每个交易`)
      
      // 快速连续发送交易
      const promises = selectedDonations.map(async (donation, index) => {
        try {
          const txStartTime = Date.now()
          
          // 更新状态为处理中
          results[index] = {
            ...results[index],
            status: 'processing',
            startTime: txStartTime
          }
          setDonationResults([...results])
          
          console.log(`发送交易 ${index + 1}/${selectedDonations.length}: ${donation.amount} MON to ${donation.recipient}`)
          
          // 发送交易 - 这会触发MetaMask确认
          const tx = await contract.fund(donation.recipient, donation.words || '', {
            value: ethers.parseEther(donation.amount)
          })
          
          console.log(`交易 ${index + 1} 已发送，哈希: ${tx.hash}`)
          
          // 更新为已发送状态
          results[index] = {
            ...results[index],
            status: 'sent',
            txHash: tx.hash,
            nonce: tx.nonce
          }
          setDonationResults([...results])
          
          // 等待交易确认
          const receipt = await tx.wait()
          const txEndTime = Date.now()
          
          // 更新为成功状态
          results[index] = {
            ...results[index],
            status: 'success',
            endTime: txEndTime,
            duration: txEndTime - txStartTime,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
          }
          
          setTpsStats(prev => ({
            ...prev,
            successCount: prev.successCount + 1
          }))
          
          console.log(`交易 ${index + 1} 确认成功，区块: ${receipt.blockNumber}`)
          
          return { success: true, index, txHash: tx.hash }
          
        } catch (error) {
          console.error(`交易 ${index + 1} 失败:`, error)
          const txEndTime = Date.now()
          
          results[index] = {
            ...results[index],
            status: 'failed',
            endTime: txEndTime,
            error: error.message
          }
          
          setTpsStats(prev => ({
            ...prev,
            failCount: prev.failCount + 1
          }))
          
          return { success: false, index, error: error.message }
        }
      })

      // 等待所有交易完成
      console.log('等待所有交易完成...')
      await Promise.allSettled(promises)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      const successCount = results.filter(r => r.status === 'success').length
      
      setTpsStats(prev => ({
        ...prev,
        endTime,
        tps: successCount / (duration / 1000)
      }))
      
      console.log(`批量捐赠完成: ${successCount}/${selectedDonations.length} 成功`)
      
      // 显示完成提示
      alert(`✅ 批量捐赠完成!\n\n` +
            `• 成功: ${successCount} 个交易\n` +
            `• 失败: ${selectedDonations.length - successCount} 个交易\n` +
            `• 总耗时: ${(duration / 1000).toFixed(1)} 秒`)
      
    } catch (error) {
      console.error('批量捐赠过程中出错:', error)
      alert(`❌ 批量捐赠失败: ${error.message}`)
    } finally {
      setDonating(false)
    }
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getTotalAmount = () => {
    return selectedDonations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0).toFixed(3)
  }

  if (!isConnected) {
    return (
      <PageWrapper showFloatingElements={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center warm-card rounded-3xl p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6">⚡</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              请先连接钱包
            </h2>
            <p className="text-gray-600">
              连接钱包后即可体验批量捐赠功能
            </p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面头部 */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full p-6 animate-float shadow-2xl">
                <Zap className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              <span className="gradient-text">批量捐赠</span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
              一键向多个受益人捐赠
              <br />
              体验区块链网络的高速处理能力
            </p>

            {/* TPS 统计显示 */}
            {(donating || donationResults.length > 0) && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200 max-w-4xl mx-auto mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  网络性能统计
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{tpsStats.totalTransactions}</div>
                    <div className="text-sm text-gray-600">总交易数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{tpsStats.successCount}</div>
                    <div className="text-sm text-gray-600">成功</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{tpsStats.failCount}</div>
                    <div className="text-sm text-gray-600">失败</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {tpsStats.tps > 0 ? tpsStats.tps.toFixed(2) : '计算中...'}
                    </div>
                    <div className="text-sm text-gray-600">TPS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {tpsStats.endTime && tpsStats.startTime ? 
                        ((tpsStats.endTime - tpsStats.startTime) / 1000).toFixed(1) : 
                        (donating ? '运行中...' : '0')}
                    </div>
                    <div className="text-sm text-gray-600">总耗时(秒)</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：受益人选择 */}
            <div className="warm-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  选择受益人
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllRecipients}
                    className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg transition-colors"
                  >
                    全选
                  </button>
                  <button
                    onClick={() => setSelectedDonations([])}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors"
                  >
                    清空
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">加载受益人列表...</p>
                </div>
              ) : recipients.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏃‍♂️</div>
                  <p className="text-gray-500">暂无可用的受益人</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recipients.map((recipient) => {
                    const isSelected = selectedDonations.some(d => d.recipient === recipient.address)
                    return (
                      <div 
                        key={recipient.address}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                        }`}
                        onClick={() => isSelected ? removeDonation(recipient.address) : addDonation(recipient)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                              }`}>
                                {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                              </div>
                              <span className="font-medium text-gray-800">{recipient.topic}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-1">{recipient.reason}</div>
                            <div className="text-xs font-mono text-gray-500">
                              {formatAddress(recipient.address)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <Minus className="h-4 w-4 text-red-500" />
                            ) : (
                              <Plus className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 右侧：批量捐赠配置 */}
            <div className="warm-card rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                批量捐赠配置
              </h2>

              {selectedDonations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">👈</div>
                  <p className="text-gray-500">请先选择受益人</p>
                </div>
              ) : (
                <div>
                  {/* 快速设置金额 */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-2">快速设置金额 (MON)</div>
                    <div className="flex gap-2 flex-wrap">
                      {['0.001', '0.005', '0.01', '0.05'].map(amount => (
                        <button
                          key={amount}
                          onClick={() => setQuickAmount(amount)}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-lg text-sm transition-colors"
                        >
                          {amount} MON
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 捐赠列表 */}
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
                    {selectedDonations.map((donation) => (
                      <div key={donation.recipient} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-800">
                            {donation.recipientInfo.topic}
                          </span>
                          <button
                            onClick={() => removeDonation(donation.recipient)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            value={donation.amount}
                            onChange={(e) => updateDonationAmount(donation.recipient, e.target.value)}
                            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="金额 (MON)"
                          />
                          <input
                            type="text"
                            value={donation.words}
                            onChange={(e) => updateDonationWords(donation.recipient, e.target.value)}
                            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="留言"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 总计和执行 */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-gray-800">
                        总计: {getTotalAmount()} MON
                      </span>
                      <span className="text-sm text-gray-600">
                        {selectedDonations.length} 个交易
                      </span>
                    </div>

                    {/* 快速批量发送说明 */}
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="text-sm text-orange-800">
                        <div className="font-medium mb-1">⚡ 快速批量发送模式</div>
                        <div className="text-xs text-orange-600">
                          • 需要确认 {selectedDonations.length} 次MetaMask交易<br/>
                          • 生成 {selectedDonations.length} 个独立交易哈希<br/>
                          • 每个捐赠都是独立的区块链交易<br/>
                          • 安全可靠，无需分享私钥
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={executeBatchDonation}
                      disabled={donating || selectedDonations.length === 0}
                      className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                        donating 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {donating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          执行中...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          执行批量捐赠
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 交易结果显示 */}
          {donationResults.length > 0 && (
            <div className="mt-8 warm-card rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                交易结果
              </h3>
              <div className="space-y-3">
                {donationResults.map((result, index) => (
                  <div 
                    key={`${result.recipient}-${index}`}
                    className={`p-4 rounded-lg border-l-4 ${
                      result.status === 'success' ? 'border-green-500 bg-green-50' :
                      result.status === 'failed' ? 'border-red-500 bg-red-50' :
                      'border-yellow-500 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800">
                          {result.recipientInfo.topic} - {result.amount} MON
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatAddress(result.recipient)}
                        </div>
                        {result.txHash && (
                          <div className="text-xs font-mono text-blue-600 mt-1">
                            <div>TX: {result.txHash.slice(0, 10)}...{result.txHash.slice(-8)}</div>
                            {result.nonce !== undefined && <div>Nonce: {result.nonce}</div>}
                            {result.blockNumber && <div>Block: {result.blockNumber}</div>}
                            {result.gasUsed && <div>Gas: {parseInt(result.gasUsed).toLocaleString()}</div>}
                          </div>
                        )}
                        {result.error && (
                          <div className="text-xs text-red-600 mt-1">
                            错误: {result.error}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {result.status === 'failed' && <X className="h-5 w-5 text-red-500" />}
                        {result.status === 'pending' && (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent" />
                        )}
                        {result.duration && (
                          <span className="text-xs text-gray-500">
                            {result.duration}ms
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

export default BatchDonationPage

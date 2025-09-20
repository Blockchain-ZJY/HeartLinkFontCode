import React, { useState, useEffect, useCallback } from 'react'
import { User, Calendar, Wallet, TrendingUp, Eye, RefreshCw, Download, Tag, History, Heart } from 'lucide-react'
import { ethers } from 'ethers'
import { getIPFSUrl } from '../../utils/ipfs'

/**
 * 受益人卡片视图组件
 * 以卡片形式展示已批准的受益人信息，包括IPFS图片和基本信息
 */
const RecipientCardsView = ({ 
  getContractInstance,
  currentAccount,
  loading: parentLoading,
  onWithdraw,
  onNavigate,
  onNavigateWithRecipient
}) => {
  const [approvedApplications, setApprovedApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [recipientsData, setRecipientsData] = useState({})
  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [donationHistory, setDonationHistory] = useState({})
  const [loadingHistory, setLoadingHistory] = useState(false)

  // 加载已批准的申请数据
  const loadApprovedApplications = useCallback(async () => {
    if (!getContractInstance) {
      console.log('RecipientCardsView: getContractInstance 未定义')
      return
    }
    
    console.log('RecipientCardsView: 开始加载已批准申请列表')
    setLoading(true)
    try {
      const contract = await getContractInstance(false)
      console.log('RecipientCardsView: 合约实例获取成功，调用 getAllApplications')
      
      // 获取所有申请
      const allApplications = await contract.getAllApplications()
      console.log('RecipientCardsView: 获取到的所有申请数据:', {
        length: allApplications.length,
        applications: allApplications
      })
      
      // 筛选出已批准的申请
      const approvedApps = allApplications.filter(app => app.isApproved === true)
      console.log('RecipientCardsView: 筛选出的已批准申请:', {
        length: approvedApps.length,
        approved: approvedApps
      })
      
      // 转换数据格式
      const formattedApplications = approvedApps.map(app => ({
        recipientAddress: app.recipientAddress,
        reason: app.reason,
        topic: app.topic || '未分类',
        ipfsCID: app.ipfsCID,
        appliedTimestamp: app.appliedTimestamp.toString(),
        isApproved: app.isApproved
      }))
      
      console.log('RecipientCardsView: 格式化后的已批准申请数据:', formattedApplications)
      setApprovedApplications(formattedApplications)
      
      // 同时获取受益人的资金信息
      if (formattedApplications.length > 0) {
        await loadRecipientsFinancialData(formattedApplications, contract)
      }
      
    } catch (error) {
      console.error('加载已批准申请失败:', error)
      setApprovedApplications([])
    } finally {
      setLoading(false)
    }
  }, [getContractInstance])

  // 加载受益人的资金数据
  const loadRecipientsFinancialData = async (applications, contract) => {
    console.log('RecipientCardsView: 开始加载受益人资金数据')
    try {
      const financialData = {}
      
      await Promise.all(
        applications.map(async (app) => {
          try {
            const [balance, totalSum] = await Promise.all([
              contract.getRecipientBalance(app.recipientAddress),
              contract.getRecipientsSumToken(app.recipientAddress)
            ])
            
            financialData[app.recipientAddress] = {
              balance: ethers.formatEther(balance),
              totalSum: ethers.formatEther(totalSum),
              hasBalance: parseFloat(ethers.formatEther(balance)) > 0
            }
          } catch (error) {
            console.error(`获取受益人 ${app.recipientAddress} 资金数据失败:`, error)
            financialData[app.recipientAddress] = {
              balance: '0',
              totalSum: '0',
              hasBalance: false,
              error: true
            }
          }
        })
      )
      
      console.log('RecipientCardsView: 受益人资金数据:', financialData)
      setRecipientsData(financialData)
    } catch (error) {
      console.error('加载受益人资金数据失败:', error)
    }
  }

  // 初始加载
  useEffect(() => {
    loadApprovedApplications()
  }, [loadApprovedApplications])

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN')
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimestamp = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN')
  }

  const handleRefresh = () => {
    console.log('RecipientCardsView: 手动刷新按钮点击')
    loadApprovedApplications()
  }

  const handleViewDetails = async (application) => {
    setSelectedRecipient(application)
    // 加载该受益人的捐赠记录
    await loadDonationHistory(application.recipientAddress)
  }

  // 加载捐赠记录
  const loadDonationHistory = async (recipientAddress) => {
    if (donationHistory[recipientAddress]) return // 如果已经加载过就不重复加载
    
    setLoadingHistory(true)
    try {
      const contract = await getContractInstance(false)
      const donations = await contract.getDonationsForRecipient(recipientAddress)
      
      setDonationHistory(prev => ({
        ...prev,
        [recipientAddress]: donations
      }))
    } catch (error) {
      console.error('加载捐赠记录失败:', error)
      setDonationHistory(prev => ({
        ...prev,
        [recipientAddress]: []
      }))
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleWithdraw = async () => {
    if (!onWithdraw) return
    
    setWithdrawing(true)
    try {
      await onWithdraw()
      await loadApprovedApplications() // 刷新数据
    } finally {
      setWithdrawing(false)
    }
  }

  const closeModal = () => {
    setSelectedRecipient(null)
  }

  const handleDonateToRecipient = (application) => {
    if (onNavigateWithRecipient) {
      onNavigateWithRecipient(application)
    }
  }

  if (loading) {
    return (
      <div className="warm-card rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-primary-600" />
          <h2 className="text-2xl font-bold gradient-text">受益人卡片</h2>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
          <span className="ml-3 text-gray-600">加载受益人数据中...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* 头部 */}
      <div className="warm-card rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold gradient-text">受益人卡片</h2>
            {approvedApplications.length > 0 && (
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm font-medium">
                {approvedApplications.length} 个
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
            
            {currentAccount && (
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
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
            )}
          </div>
        </div>
      </div>

      {/* 卡片网格 */}
      {approvedApplications.length === 0 ? (
        <div className="warm-card rounded-2xl p-12 shadow-lg text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">暂无已批准的受益人</p>
          <p className="text-gray-400 text-sm mt-2">当管理员批准申请后，将在这里显示</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedApplications.map((application) => {
            const isCurrentUser = application.recipientAddress.toLowerCase() === currentAccount?.toLowerCase()
            const financialData = recipientsData[application.recipientAddress] || {}
            
            return (
              <div
                key={application.recipientAddress}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  isCurrentUser 
                    ? 'ring-2 ring-primary-300 bg-primary-50' 
                    : 'border border-gray-200'
                }`}
              >
                {/* 图片区域 */}
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                  {application.ipfsCID ? (
                    <img 
                      src={getIPFSUrl(application.ipfsCID)}
                      alt="受益人照片"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  
                  {/* 默认头像 - 当没有图片或图片加载失败时显示 */}
                  <div 
                    className={`w-full h-full flex items-center justify-center ${application.ipfsCID ? 'hidden' : 'flex'}`}
                    style={{ display: application.ipfsCID ? 'none' : 'flex' }}
                  >
                    <User className="h-16 w-16 text-primary-400" />
                  </div>
                  
                  {/* 当前用户标识 */}
                  {isCurrentUser && (
                    <div className="absolute top-3 right-3 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      您
                    </div>
                  )}

                  {/* 主题标签 */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {application.topic}
                    </div>
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="p-6">
                  {/* 地址 */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">受益人地址</div>
                    <div className="font-mono text-sm text-gray-800 bg-gray-100 rounded-lg px-3 py-2">
                      {formatAddress(application.recipientAddress)}
                    </div>
                  </div>

                  {/* 主题 */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-700 bg-primary-50 px-2 py-1 rounded-lg">
                        {application.topic}
                      </span>
                    </div>
                  </div>

                  {/* 申请理由 */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">申请理由</div>
                    <div className="text-sm text-gray-700 line-clamp-2">
                      {application.reason}
                    </div>
                  </div>

                  {/* 资金信息 */}
                  {!financialData.error && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-primary-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-primary-600 mb-1">可提取</div>
                        <div className="text-sm font-bold text-primary-700">
                          {parseFloat(financialData.balance || '0').toFixed(3)} MON
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-green-600 mb-1">总捐赠</div>
                        <div className="text-sm font-bold text-green-700">
                          {parseFloat(financialData.totalSum || '0').toFixed(3)} MON
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 申请时间 */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Calendar className="h-3 w-3" />
                    <span>申请于 {formatDate(application.appliedTimestamp)}</span>
                  </div>

                  {/* 按钮组 */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleViewDetails(application)}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      详情
                    </button>
                    
                    <button
                      onClick={() => handleDonateToRecipient(application)}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Heart className="h-4 w-4" />
                      捐赠
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 详情模态框 */}
      {selectedRecipient && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full">
              {/* 左侧：基本信息 */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* 模态框头部 */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800">受益人详细信息</h3>
                </div>

                {/* 图片 */}
                <div className="mb-6">
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl overflow-hidden">
                    {selectedRecipient.ipfsCID ? (
                      <img 
                        src={getIPFSUrl(selectedRecipient.ipfsCID)}
                        alt="受益人照片"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    
                    {/* 默认头像 - 当没有图片或图片加载失败时显示 */}
                    <div 
                      className={`w-full h-full flex items-center justify-center ${selectedRecipient.ipfsCID ? 'hidden' : 'flex'}`}
                      style={{ display: selectedRecipient.ipfsCID ? 'none' : 'flex' }}
                    >
                      <User className="h-16 w-16 text-primary-400" />
                    </div>
                  </div>
                </div>

                {/* 详细信息 */}
                <div className="space-y-4">
                  {/* 地址 */}
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">受益人地址</div>
                    <div className="font-mono text-sm text-gray-800 bg-gray-100 rounded-lg px-3 py-2 break-all">
                      {selectedRecipient.recipientAddress}
                    </div>
                  </div>

                  {/* 申请主题 */}
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">申请主题</div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-medium text-primary-700 bg-primary-50 px-3 py-2 rounded-lg">
                        {selectedRecipient.topic}
                      </span>
                    </div>
                  </div>

                  {/* 申请理由 */}
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">申请理由</div>
                    <div className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                      {selectedRecipient.reason}
                    </div>
                  </div>

                  {/* 申请时间 */}
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">申请时间</div>
                    <div className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                      {formatDate(selectedRecipient.appliedTimestamp)}
                    </div>
                  </div>

                  {/* 资金信息 */}
                  {recipientsData[selectedRecipient.recipientAddress] && !recipientsData[selectedRecipient.recipientAddress].error && (
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-3">资金状态</div>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-primary-50 rounded-lg p-4 text-center">
                          <Wallet className="h-6 w-6 text-primary-600 mx-auto mb-2" />
                          <div className="text-xs text-primary-600 mb-1">可提取余额</div>
                          <div className="text-lg font-bold text-primary-700">
                            {parseFloat(recipientsData[selectedRecipient.recipientAddress].balance || '0').toFixed(4)} MON
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <div className="text-xs text-green-600 mb-1">历史捐赠总额</div>
                          <div className="text-lg font-bold text-green-700">
                            {parseFloat(recipientsData[selectedRecipient.recipientAddress].totalSum || '0').toFixed(4)} MON
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 右侧：捐赠记录 */}
              <div className="w-1/2 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-semibold text-gray-800">捐赠记录</span>
                  {donationHistory[selectedRecipient.recipientAddress] && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {donationHistory[selectedRecipient.recipientAddress].length} 条
                    </span>
                  )}
                </div>
                
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
                    <span className="ml-3 text-sm text-gray-600">加载捐赠记录中...</span>
                  </div>
                ) : donationHistory[selectedRecipient.recipientAddress] ? (
                  donationHistory[selectedRecipient.recipientAddress].length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                      <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">暂无捐赠记录</p>
                      <p className="text-gray-400 text-sm mt-1">还没有人为这位受益人捐赠</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {donationHistory[selectedRecipient.recipientAddress].map((donation, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-mono text-sm text-gray-800 font-medium">
                                    {formatAddress(donation.funder)}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    {formatTimestamp(donation.timestamp)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                {parseFloat(ethers.formatEther(donation.amount)).toFixed(4)} MON
                              </div>
                              <div className="text-xs text-gray-500">
                                ≈ ${(parseFloat(ethers.formatEther(donation.amount)) * 2000).toFixed(2)}
                              </div>
                            </div>
                          </div>
                          {donation.words && donation.words.trim() && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                              <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                                <span>💌</span>
                                <span className="font-medium">留言</span>
                              </div>
                              <div className="text-sm text-blue-800 leading-relaxed">"{donation.words}"</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipientCardsView 
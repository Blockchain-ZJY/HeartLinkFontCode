import React, { useState, useEffect, useCallback } from 'react'
import { CheckCircle, User, Calendar, FileText, ExternalLink, RefreshCw, Wallet, TrendingUp } from 'lucide-react'
import { ethers } from 'ethers'
import { getIPFSUrl } from '../../utils/ipfs'
import IPFSImage from '../Common/IPFSImage'

/**
 * 已批准申请列表组件
 * 显示所有已批准的受益人申请（isApproved: true），包含详细信息和资金状态
 */
const ApprovedApplications = ({ 
  getContractInstance,
  currentAccount,
  loading: parentLoading
}) => {
  const [approvedApplications, setApprovedApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedApplication, setExpandedApplication] = useState(null)
  const [recipientsData, setRecipientsData] = useState({})

  // 使用 useCallback 避免无限循环
  const loadApprovedApplications = useCallback(async () => {
    if (!getContractInstance) {
      console.log('ApprovedApplications: getContractInstance 未定义')
      return
    }
    
    console.log('ApprovedApplications: 开始加载已批准申请列表')
    setLoading(true)
    try {
      const contract = await getContractInstance(false)
      console.log('ApprovedApplications: 合约实例获取成功，调用 getAllApplications')
      
      // 获取所有申请
      const allApplications = await contract.getAllApplications()
      console.log('ApprovedApplications: 获取到的所有申请数据:', {
        length: allApplications.length,
        applications: allApplications
      })
      
      // 筛选出已批准的申请
      const approvedApps = allApplications.filter(app => app.isApproved === true)
      console.log('ApprovedApplications: 筛选出的已批准申请:', {
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
      
      console.log('ApprovedApplications: 格式化后的已批准申请数据:', formattedApplications)
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
    console.log('ApprovedApplications: 开始加载受益人资金数据')
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
      
      console.log('ApprovedApplications: 受益人资金数据:', financialData)
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

  const handleRefresh = () => {
    console.log('ApprovedApplications: 手动刷新按钮点击')
    loadApprovedApplications()
  }

  if (loading) {
    return (
      <div className="warm-card rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold gradient-text">已批准申请</h2>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
          <span className="ml-3 text-gray-600">加载已批准申请中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="warm-card rounded-2xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold gradient-text">已批准申请</h2>
          {approvedApplications.length > 0 && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
              {approvedApplications.length} 个
            </span>
          )}
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {/* 调试信息 - 仅在开发环境显示 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <div className="font-medium text-green-800 mb-1">调试信息:</div>
          <div className="text-green-700">
            <div>已批准申请数量: {approvedApplications.length}</div>
            <div>加载状态: {loading ? '加载中' : '已完成'}</div>
            <div>资金数据加载: {Object.keys(recipientsData).length} 个</div>
          </div>
        </div>
      )}

      {approvedApplications.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">暂无已批准申请</p>
          <p className="text-gray-400 text-sm mt-2">
            当管理员批准申请后，将在这里显示
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvedApplications.map((application) => {
            const isExpanded = expandedApplication === application.recipientAddress
            const isCurrentUser = application.recipientAddress.toLowerCase() === currentAccount?.toLowerCase()
            const financialData = recipientsData[application.recipientAddress] || {}
            
            return (
              <div
                key={application.recipientAddress}
                className={`border-2 rounded-xl bg-white overflow-hidden transition-all duration-300 ${
                  isCurrentUser 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-green-200 hover:border-green-300 hover:shadow-md'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            受益人：{formatAddress(application.recipientAddress)}
                            {isCurrentUser && <span className="text-green-600 ml-2">(您)</span>}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>申请时间：{formatDate(application.appliedTimestamp)}</span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              已批准
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 完整地址 */}
                      <div className="bg-gray-100 rounded-lg p-3 mb-4">
                        <div className="text-xs text-gray-500 mb-1">完整地址</div>
                        <div className="font-mono text-sm text-gray-800 break-all">
                          {application.recipientAddress}
                        </div>
                      </div>
                      
                      {/* 申请理由 */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-700">申请理由：</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {application.reason.length > 150 && !isExpanded
                            ? `${application.reason.substring(0, 150)}...`
                            : application.reason
                          }
                        </p>
                        {application.reason.length > 150 && (
                          <button
                            onClick={() => setExpandedApplication(
                              isExpanded ? null : application.recipientAddress
                            )}
                            className="text-green-600 text-sm mt-2 hover:underline"
                          >
                            {isExpanded ? '收起' : '查看更多'}
                          </button>
                        )}
                      </div>
                      
                      {/* 支持文档图片 */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-700">支持文档</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <IPFSImage 
                            cid={application.ipfsCID}
                            filename="支持文档"
                            className="w-full"
                            maxWidth="100%"
                            maxHeight="500px"
                            showControls={true}
                          />
                        </div>
                      </div>

                      {/* 资金信息 */}
                      {financialData && !financialData.error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Wallet className="h-4 w-4 text-primary-600" />
                              <span className="text-sm font-medium text-gray-600">可提取余额</span>
                            </div>
                            <div className="text-xl font-bold text-primary-600">
                              {parseFloat(financialData.balance || 0).toFixed(4)} MON
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-600">历史捐赠总额</span>
                            </div>
                            <div className="text-xl font-bold text-green-600">
                              {parseFloat(financialData.totalSum || 0).toFixed(4)} MON
                            </div>
                          </div>
                        </div>
                      )}

                      {financialData?.error && (
                        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-yellow-700">
                          获取资金信息失败
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ApprovedApplications 
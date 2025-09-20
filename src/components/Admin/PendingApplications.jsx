import React, { useState, useEffect, useCallback } from 'react'
import { Clock, User, Calendar, FileText, ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { getIPFSUrl } from '../../utils/ipfs'
import IPFSImage from '../Common/IPFSImage'

/**
 * 待审核申请列表组件
 * 显示所有待审核的受益人申请，管理员可以批准或拒绝
 */
const PendingApplications = ({ 
  pendingApplications = [],
  onApproveApplication,
  onRejectApplication,
  onLoadPendingApplications,
  loading,
  isAdmin 
}) => {
  const [processingApplications, setProcessingApplications] = useState(new Set())
  const [expandedApplication, setExpandedApplication] = useState(null)

  // 使用 useCallback 来避免 useEffect 的无限循环
  const loadApplications = useCallback(() => {
    console.log('PendingApplications: 开始加载申请列表')
    if (onLoadPendingApplications) {
      onLoadPendingApplications()
    }
  }, [onLoadPendingApplications])

  useEffect(() => {
    console.log('PendingApplications: useEffect 触发，pendingApplications length:', pendingApplications.length)
    console.log('PendingApplications: loading状态:', loading)
    loadApplications()
  }, [loadApplications])

  // 添加一个 useEffect 来监控 pendingApplications 的变化
  useEffect(() => {
    console.log('PendingApplications: pendingApplications 数据更新:', {
      length: pendingApplications.length,
      applications: pendingApplications
    })
  }, [pendingApplications])

  const handleApprove = async (applicationAddress) => {
    console.log('PendingApplications: 开始批准申请:', applicationAddress)
    setProcessingApplications(prev => new Set([...prev, applicationAddress]))
    try {
      await onApproveApplication(applicationAddress)
      console.log('PendingApplications: 申请批准成功，重新加载列表')
      // 重新加载列表
      loadApplications()
    } catch (error) {
      console.error('批准申请失败:', error)
      alert('批准申请失败: ' + error.message)
    } finally {
      setProcessingApplications(prev => {
        const newSet = new Set(prev)
        newSet.delete(applicationAddress)
        return newSet
      })
    }
  }

  const handleReject = async (applicationAddress) => {
    if (!confirm('确定要拒绝这个申请吗？此操作不可撤销。')) {
      return
    }

    console.log('PendingApplications: 开始拒绝申请:', applicationAddress)
    setProcessingApplications(prev => new Set([...prev, applicationAddress]))
    try {
      await onRejectApplication(applicationAddress)
      console.log('PendingApplications: 申请拒绝成功，重新加载列表')
      // 重新加载列表
      loadApplications()
    } catch (error) {
      console.error('拒绝申请失败:', error)
      alert('拒绝申请失败: ' + error.message)
    } finally {
      setProcessingApplications(prev => {
        const newSet = new Set(prev)
        newSet.delete(applicationAddress)
        return newSet
      })
    }
  }

  // 手动刷新按钮处理函数
  const handleManualRefresh = () => {
    console.log('PendingApplications: 手动刷新按钮点击')
    loadApplications()
  }

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN')
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (loading) {
    console.log('PendingApplications: 显示加载状态')
    return (
      <div className="warm-card rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold gradient-text">待审核申请</h2>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
          <span className="ml-3 text-gray-600">加载申请列表中...</span>
        </div>
      </div>
    )
  }

  console.log('PendingApplications: 渲染主界面，申请数量:', pendingApplications.length)

  return (
    <div className="warm-card rounded-2xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold gradient-text">待审核申请</h2>
          {pendingApplications.length > 0 && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm font-medium">
              {pendingApplications.length} 个
            </span>
          )}
        </div>
        
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm"
        >
          <Clock className="h-4 w-4" />
          刷新
        </button>
      </div>

      {/* 调试信息 - 仅在开发环境显示 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <div className="font-medium text-yellow-800 mb-1">调试信息:</div>
          <div className="text-yellow-700">
            <div>申请数量: {pendingApplications.length}</div>
            <div>加载状态: {loading ? '加载中' : '已完成'}</div>
            <div>是否管理员: {isAdmin ? '是' : '否'}</div>
          </div>
        </div>
      )}

      {pendingApplications.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">暂无待审核申请</p>
          <p className="text-gray-400 text-sm mt-2">
            当有用户提交受益人申请时，将在这里显示
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingApplications.map((application) => {
            const isProcessing = processingApplications.has(application.recipientAddress)
            const isExpanded = expandedApplication === application.recipientAddress
            
            return (
              <div
                key={application.recipientAddress}
                className="border border-gray-200 rounded-xl bg-white/50 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                {/* 申请头部信息 */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <User className="h-5 w-5 text-primary-600" />
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            申请人：{formatAddress(application.recipientAddress)}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>申请时间：{formatDate(application.appliedTimestamp)}</span>
                          </div>
                        </div>
                      </div>
                      
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
                            className="text-primary-600 text-sm mt-2 hover:underline"
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
                            maxHeight="400px"
                            showControls={true}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    {isAdmin && (
                      <div className="flex flex-col gap-2 ml-6">
                        <button
                          onClick={() => handleApprove(application.recipientAddress)}
                          disabled={isProcessing}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          批准
                        </button>
                        
                        <button
                          onClick={() => handleReject(application.recipientAddress)}
                          disabled={isProcessing}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          拒绝
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {!isAdmin && pendingApplications.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm">您正在以只读模式查看申请列表。只有管理员可以批准或拒绝申请。</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingApplications 
import React, { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, User, FileText, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { getIPFSUrl } from '../../utils/ipfs'
import IPFSImage from '../Common/IPFSImage'

/**
 * 受益人选择器组件
 * 显示已批准申请的详细信息，让用户可以了解受益人的申请理由后再选择捐赠
 */
const RecipientSelector = ({ 
  selectedRecipient,
  onRecipientSelect,
  getContractInstance,
  preselectedRecipient,
  onClearPreselection
}) => {
  const [approvedApplications, setApprovedApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedDetails, setExpandedDetails] = useState({})
  const [error, setError] = useState(null)

  // 加载已批准的申请
  const loadApprovedApplications = useCallback(async () => {
    if (!getContractInstance) {
      console.log('RecipientSelector: getContractInstance 未定义')
      return
    }
    
    console.log('RecipientSelector: 开始加载已批准申请列表')
    setLoading(true)
    setError(null)
    
    try {
      const contract = await getContractInstance(false)
      
      // 获取所有申请
      const allApplications = await contract.getAllApplications()
      console.log('RecipientSelector: 获取到的所有申请数据:', allApplications)
      
      // 筛选出已批准的申请
      const approvedApps = allApplications.filter(app => app.isApproved === true)
      console.log('RecipientSelector: 筛选出的已批准申请:', approvedApps)
      
      // 转换数据格式
      const formattedApplications = approvedApps.map(app => ({
        recipientAddress: app.recipientAddress,
        reason: app.reason || '无申请理由',
        topic: app.topic || '未分类',
        ipfsCID: app.ipfsCID || '',
        appliedTimestamp: app.appliedTimestamp ? app.appliedTimestamp.toString() : '0',
        isApproved: app.isApproved
      }))
      
      console.log('RecipientSelector: 格式化后的已批准申请数据:', formattedApplications)
      setApprovedApplications(formattedApplications)
      
    } catch (error) {
      console.error('加载已批准申请失败:', error)
      setError(error.message || '加载申请列表失败')
      setApprovedApplications([])
    } finally {
      setLoading(false)
    }
  }, [getContractInstance])

  // 初始加载
  useEffect(() => {
    if (getContractInstance) {
      loadApprovedApplications()
    }
  }, [loadApprovedApplications])

  const formatAddress = (address) => {
    if (!address || typeof address !== 'string') return '无效地址'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp) => {
    try {
      const date = new Date(Number(timestamp) * 1000)
      return date.toLocaleDateString('zh-CN')
    } catch (error) {
      return '无效日期'
    }
  }

  const handleRecipientSelect = (recipientAddress) => {
    if (onRecipientSelect && typeof onRecipientSelect === 'function') {
      onRecipientSelect(recipientAddress)
      setIsExpanded(false) // 选择后收起列表
    }
  }

  const toggleDetails = (address) => {
    setExpandedDetails(prev => ({
      ...prev,
      [address]: !prev[address]
    }))
  }

  const selectedApplication = approvedApplications.find(
    app => app.recipientAddress === selectedRecipient
  )

  // 错误状态
  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          选择受益人
        </label>
        <div className="border border-red-300 rounded-xl p-4 bg-red-50">
          <div className="flex items-center justify-center py-4">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">加载失败: {error}</span>
          </div>
          <button
            onClick={loadApprovedApplications}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  // 加载状态
  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          选择受益人
        </label>
        <div className="border border-gray-300 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
            <span className="ml-2 text-gray-600">加载受益人列表中...</span>
          </div>
        </div>
      </div>
    )
  }

  // 无数据状态
  if (approvedApplications.length === 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          选择受益人
        </label>
        <div className="border border-gray-300 rounded-xl p-4 bg-gray-50">
          <div className="text-center py-4 text-gray-500">
            暂无可选择的受益人
          </div>
          <button
            onClick={loadApprovedApplications}
            className="mt-2 text-sm text-gray-600 hover:underline"
          >
            刷新列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        选择受益人 *
      </label>
      
      {/* 当前选择显示 */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full border border-gray-300 rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between text-left"
        >
          <div className="flex-1">
            {selectedApplication ? (
              <div>
                <div className="font-medium text-gray-800">
                  {formatAddress(selectedApplication.recipientAddress)}
                </div>
                <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {selectedApplication.reason && selectedApplication.reason.length > 80 
                    ? `${selectedApplication.reason.substring(0, 80)}...`
                    : selectedApplication.reason || '无申请理由'
                  }
                </div>
              </div>
            ) : (
              <span className="text-gray-500">请选择受益人</span>
            )}
          </div>
          
          <div className="ml-2">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </button>

        {/* 下拉选项列表 */}
        {isExpanded && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-96 overflow-y-auto">
            {approvedApplications.map((application) => {
              const isSelected = selectedRecipient === application.recipientAddress
              const isDetailsExpanded = expandedDetails[application.recipientAddress]
              
              return (
                <div
                  key={application.recipientAddress}
                  className={`border-b border-gray-100 last:border-b-0 ${
                    isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleRecipientSelect(application.recipientAddress)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-gray-800">
                            {formatAddress(application.recipientAddress)}
                          </span>
                          {isSelected && (
                            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                              已选择
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          申请时间：{formatDate(application.appliedTimestamp)}
                        </div>
                        
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">申请理由：</span>
                          {isDetailsExpanded || (application.reason && application.reason.length <= 100) ? (
                            application.reason || '无申请理由'
                          ) : (
                            `${(application.reason || '无申请理由').substring(0, 100)}...`
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {application.reason && application.reason.length > 100 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleDetails(application.recipientAddress)
                            }}
                            className="text-xs text-primary-600 hover:underline"
                          >
                            {isDetailsExpanded ? '收起' : '详情'}
                          </button>
                        )}
                        
                        {application.ipfsCID && !application.ipfsCID.startsWith('QmSimulated') && (
                          <a
                            href={getIPFSUrl(application.ipfsCID)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            文档
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {/* 支持文档图片预览 - 仅在展开详情时显示 */}
                    {isDetailsExpanded && application.ipfsCID && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">支持文档</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <IPFSImage 
                            cid={application.ipfsCID}
                            filename="支持文档"
                            className="w-full"
                            maxWidth="100%"
                            maxHeight="300px"
                            showControls={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 选择提示 */}
      <div className="text-xs text-gray-500">
        {approvedApplications.length} 个已批准的受益人可选择
      </div>
    </div>
  )
}

export default RecipientSelector 
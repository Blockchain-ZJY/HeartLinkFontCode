import React, { useState } from 'react'
import RecipientsList from '../components/Recipients/RecipientsList'
import ApprovedApplications from '../components/Admin/ApprovedApplications'
import RecipientCardsView from '../components/Recipients/RecipientCardsView'
import PageWrapper from '../components/Layout/PageWrapper'
import { List, FileText, ToggleLeft, ToggleRight, Grid } from 'lucide-react'

const RecipientsPage = ({ 
  isConnected,
  recipients, 
  onLoadRecipients, 
  onWithdraw, 
  loading, 
  getContractInstance, 
  currentAccount,
  onNavigate,
  onNavigateWithRecipient 
}) => {
  // 修改视图切换状态，添加卡片视图
  const [viewMode, setViewMode] = useState('cards') // 'cards', 'detailed', 'simple'

  if (!isConnected) {
    return (
      <PageWrapper showFloatingElements={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center warm-card rounded-3xl p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6">🏥</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              请先连接钱包
            </h2>
            <p className="text-gray-600">
              连接钱包后才能查看受益人信息
            </p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const getNextViewMode = () => {
    switch (viewMode) {
      case 'cards': return 'detailed'
      case 'detailed': return 'simple'
      case 'simple': return 'cards'
      default: return 'cards'
    }
  }

  const getViewModeIcon = () => {
    switch (viewMode) {
      case 'cards': return <Grid className="h-4 w-4" />
      case 'detailed': return <FileText className="h-4 w-4" />
      case 'simple': return <List className="h-4 w-4" />
      default: return <Grid className="h-4 w-4" />
    }
  }

  const getViewModeText = () => {
    switch (viewMode) {
      case 'cards': return '卡片视图'
      case 'detailed': return '详细信息'
      case 'simple': return '简洁列表'
      default: return '卡片视图'
    }
  }

  return (
    <PageWrapper 
      showFloatingElements={false}
      particleConfig={{
        particleCount: 25,
        opacity: 0.2,
        colors: ['#00d2d3', '#54a0ff', '#5f27cd', '#ff9ff3']
      }}
    >
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">受益人管理</h1>
                <p className="text-gray-700">
                  查看和管理所有受益人信息，支持资金提取操作
                </p>
              </div>
              
              {/* 视图切换按钮 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">视图模式:</span>
                <button
                  onClick={() => setViewMode(getNextViewMode())}
                  className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-xl transition-all duration-300 shadow-sm"
                >
                  {getViewModeIcon()}
                  <span>{getViewModeText()}</span>
                  <ToggleRight className="h-5 w-5 text-primary-600" />
                </button>
              </div>
            </div>
          </div>

          {/* 根据视图模式显示不同组件 */}
          {viewMode === 'cards' ? (
            <RecipientCardsView
              getContractInstance={getContractInstance}
              currentAccount={currentAccount}
              loading={loading}
              onWithdraw={onWithdraw}
              onNavigate={onNavigate}
              onNavigateWithRecipient={onNavigateWithRecipient}
            />
          ) : viewMode === 'detailed' ? (
            <ApprovedApplications
              getContractInstance={getContractInstance}
              currentAccount={currentAccount}
              loading={loading}
            />
          ) : (
            <RecipientsList
              recipients={recipients}
              onLoadRecipients={onLoadRecipients}
              onWithdraw={onWithdraw}
              loading={loading}
              getContractInstance={getContractInstance}
              currentAccount={currentAccount}
            />
          )}
          
          {/* 说明文字 */}
          <div className="mt-6 text-center text-sm text-gray-500">
            {viewMode === 'cards' ? (
              <p>卡片视图以美观的卡片形式展示受益人信息和照片</p>
            ) : viewMode === 'detailed' ? (
              <p>详细信息模式显示所有已批准申请的完整信息，包括申请理由和支持文档</p>
            ) : (
              <p>简洁列表模式仅显示受益人地址和资金信息</p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default RecipientsPage 
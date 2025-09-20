import React, { useState, useEffect, useCallback } from 'react'
import AdminPanel from '../components/Admin/AdminPanel'
import RecipientApplication from '../components/Admin/RecipientApplication'
import PendingApplications from '../components/Admin/PendingApplications'
import ApprovedApplications from '../components/Admin/ApprovedApplications'
import ContractDiagnostic from '../components/Debug/ContractDiagnostic'
import PageWrapper from '../components/Layout/PageWrapper'

const AdminPage = ({ 
  isConnected, 
  isAdmin, 
  onAddRecipient, 
  loading,
  currentAccount,
  getContractInstance,
  validateContract
}) => {
  const [pendingApplications, setPendingApplications] = useState([])
  const [pendingLoading, setPendingLoading] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  // 检查当前用户是否已申请
  const checkHasApplied = useCallback(async () => {
    if (!currentAccount || !getContractInstance) {
      console.log('AdminPage: checkHasApplied - 缺少必要参数')
      return
    }
    
    console.log('AdminPage: 检查用户申请状态:', currentAccount)
    try {
      const contract = await getContractInstance(false)
      const applied = await contract.hasApplied(currentAccount)
      console.log('AdminPage: 用户申请状态:', applied)
      setHasApplied(applied)
    } catch (error) {
      console.error('检查申请状态失败:', error)
    }
  }, [currentAccount, getContractInstance])

  // 加载待审核申请列表
  const loadPendingApplications = useCallback(async () => {
    if (!getContractInstance) {
      console.log('AdminPage: loadPendingApplications - getContractInstance 未定义')
      return
    }
    
    console.log('AdminPage: 开始加载待审核申请列表')
    setPendingLoading(true)
    try {
      const contract = await getContractInstance(false)
      console.log('AdminPage: 合约实例获取成功，调用 getPendingApplications')
      const applications = await contract.getPendingApplications()
      console.log('AdminPage: 获取到的申请数据:', {
        length: applications.length,
        applications: applications
      })
      
      // 转换数据格式，确保所有字段都是正确的类型
      const formattedApplications = applications.map(app => ({
        recipientAddress: app.recipientAddress,
        reason: app.reason,
        ipfsCID: app.ipfsCID,
        appliedTimestamp: app.appliedTimestamp.toString(),
        isApproved: app.isApproved
      }))
      
      console.log('AdminPage: 格式化后的申请数据:', formattedApplications)
      setPendingApplications(formattedApplications)
    } catch (error) {
      console.error('加载待审核申请失败:', error)
      // 显示更详细的错误信息
      if (error.message.includes('execution reverted')) {
        console.error('合约执行失败，可能是网络问题或合约状态异常')
      } else if (error.message.includes('network')) {
        console.error('网络连接问题')
      } else {
        console.error('未知错误:', error.message)
      }
      // 设置空数组避免界面异常
      setPendingApplications([])
    } finally {
      setPendingLoading(false)
    }
  }, [getContractInstance])

  // 申请成为受益人
  const handleApplyAsRecipient = async (reason, topic, ipfsCID) => {
    if (!getContractInstance) {
      throw new Error('合约实例未初始化')
    }

    console.log('AdminPage: 提交受益人申请:', { reason, topic, ipfsCID })
    const contract = await getContractInstance(true)
    const tx = await contract.applyAsRecipient(reason, topic, ipfsCID)
    await tx.wait()
    console.log('AdminPage: 申请提交成功，更新状态')
    
    // 更新状态
    setHasApplied(true)
    // 重新加载申请列表
    await loadPendingApplications()
  }

  // 批准申请
  const handleApproveApplication = async (applicantAddress) => {
    if (!getContractInstance) {
      throw new Error('合约实例未初始化')
    }

    console.log('AdminPage: 批准申请:', applicantAddress)
    const contract = await getContractInstance(true)
    const tx = await contract.approveRecipient(applicantAddress)
    await tx.wait()
    console.log('AdminPage: 申请批准成功')
  }

  // 拒绝申请
  const handleRejectApplication = async (applicantAddress) => {
    if (!getContractInstance) {
      throw new Error('合约实例未初始化')
    }

    console.log('AdminPage: 拒绝申请:', applicantAddress)
    const contract = await getContractInstance(true)
    const tx = await contract.rejectRecipient(applicantAddress)
    await tx.wait()
    console.log('AdminPage: 申请拒绝成功')
  }

  // 主要的数据加载 useEffect
  useEffect(() => {
    console.log('AdminPage: 主 useEffect 触发', {
      isConnected,
      currentAccount,
      hasGetContractInstance: !!getContractInstance
    })
    
    if (isConnected && currentAccount && getContractInstance) {
      console.log('AdminPage: 开始初始化数据加载')
      checkHasApplied()
      loadPendingApplications()
    }
  }, [isConnected, currentAccount, checkHasApplied, loadPendingApplications])

  // 监控状态变化的调试 useEffect
  useEffect(() => {
    console.log('AdminPage: 状态更新', {
      pendingApplicationsCount: pendingApplications.length,
      pendingLoading,
      hasApplied,
      isAdmin
    })
  }, [pendingApplications, pendingLoading, hasApplied, isAdmin])

  if (!isConnected) {
    return (
      <PageWrapper showFloatingElements={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center warm-card rounded-3xl p-12 max-w-md mx-auto">
          <div className="text-6xl mb-6">🔗</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            请先连接钱包
          </h2>
          <p className="text-gray-600">
            连接钱包后才能访问管理员功能
          </p>
        </div>
      </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper 
      showFloatingElements={false}
      particleConfig={{
        particleCount: 20,
        opacity: 0.15,
        colors: ['#5f27cd', '#54a0ff', '#10ac84']
      }}
    >
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="text-center mb-10">
            <div className="text-5xl mb-4">⚡</div>
            <h1 className="text-3xl font-bold gradient-text mb-3">管理员中心</h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              管理受益人申请，审核平台用户，确保慈善平台的正常运行
            </p>
          </div>

          <div className="space-y-8">
            {/* 申请成为受益人 */}
            <div className="warm-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">📝</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">申请成为受益人</h2>
                  <p className="text-gray-600 text-sm">提交您的申请，成为慈善平台的受益人</p>
                </div>
              </div>
              <RecipientApplication
                onApplyAsRecipient={handleApplyAsRecipient}
                loading={loading}
                currentAccount={currentAccount}
                hasApplied={hasApplied}
              />
            </div>

            {/* 待审核申请 */}
            <div className="warm-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="text-3xl mr-3">⏳</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">待审核申请</h2>
                    <p className="text-gray-600 text-sm">
                      {pendingLoading ? '正在加载...' : `共 ${pendingApplications.length} 个待审核申请`}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="bg-orange-100 px-3 py-1 rounded-full">
                    <span className="text-orange-800 text-sm font-medium">👑 管理员</span>
                  </div>
                )}
              </div>
              <PendingApplications
                pendingApplications={pendingApplications}
                onApproveApplication={handleApproveApplication}
                onRejectApplication={handleRejectApplication}
                onLoadPendingApplications={loadPendingApplications}
                loading={pendingLoading}
                isAdmin={isAdmin}
              />
            </div>

            {/* 已批准申请 */}
            <div className="warm-card rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">✅</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">已批准的受益人</h2>
                  <p className="text-gray-600 text-sm">查看所有已通过审核的受益人信息</p>
                </div>
              </div>
              <ApprovedApplications
                getContractInstance={getContractInstance}
                currentAccount={currentAccount}
                loading={loading}
              />
            </div>

            {/* 合约诊断工具 */}
            <div className="warm-card rounded-2xl p-6 shadow-lg border-l-4 border-yellow-500">
              <ContractDiagnostic 
                getContractInstance={getContractInstance} 
                validateContract={validateContract}
              />
            </div>

            {/* 管理员工具 - 仅管理员可见 */}
            {isAdmin && (
              <div className="warm-card rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">🛠️</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">管理员工具</h2>
                    <p className="text-gray-600 text-sm">直接添加受益人和其他管理功能</p>
                  </div>
                </div>
                <AdminPanel
                  isAdmin={isAdmin}
                  onAddRecipient={onAddRecipient}
                  loading={loading}
                />
              </div>
            )}
          </div>

          {/* 底部信息 */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-full border border-blue-200">
              <span className="text-2xl">🔒</span>
              <span className="text-blue-800 font-medium">安全 • 透明 • 可信</span>
              <span className="text-2xl">💝</span>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default AdminPage 
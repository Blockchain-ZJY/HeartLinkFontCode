import React, { useState } from 'react'
import DonationForm from '../components/Donation/DonationForm'
import CelebrationEffect from '../components/Effects/CelebrationEffect'
import PageWrapper from '../components/Layout/PageWrapper'

const DonationPage = ({ 
  isConnected, 
  onDonate, 
  loading, 
  getContractInstance,
  preselectedRecipient,
  onClearPreselection 
}) => {
  const [showCelebration, setShowCelebration] = useState(false)
  const [lastDonation, setLastDonation] = useState({ amount: '', recipient: '' })

  // 包装原始的捐赠函数，添加成功后的特效
  const handleDonateWithEffect = async (recipient, amount, words) => {
    try {
      // 调用原始捐赠函数
      await onDonate(recipient, amount, words)
      
      // 捐赠成功后显示特效
      setLastDonation({ amount, recipient })
      setShowCelebration(true)
    } catch (error) {
      // 错误会被原始函数处理，这里不需要额外处理
      throw error
    }
  }

  const handleCelebrationComplete = () => {
    setShowCelebration(false)
    setLastDonation({ amount: '', recipient: '' })
  }

  if (!isConnected) {
    return (
      <PageWrapper showFloatingElements={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center warm-card rounded-3xl p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6 heart-glow">💝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              请先连接钱包
            </h2>
            <p className="text-gray-600">
              连接钱包后才能进行捐赠
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
        particleCount: 25,
        opacity: 0.2,
        colors: ['#ff9ff3', '#f368e0', '#feca57', '#ff9f43']
      }}
    >
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">慈善捐赠</h1>
            <p className="text-gray-700">
              选择受益人，了解他们的申请理由，传递您的爱心。每一份捐赠都将被记录在区块链上
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <DonationForm
                onDonate={handleDonateWithEffect}
                loading={loading}
                getContractInstance={getContractInstance}
                preselectedRecipient={preselectedRecipient}
                onClearPreselection={onClearPreselection}
              />
            </div>
            
            <div className="space-y-6">
              {/* 捐赠说明 */}
              <div className="warm-card rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">💡 捐赠说明</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-primary-600">•</span>
                    <span>所有受益人都经过严格审核，申请理由和支持文档均可查看</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary-600">•</span>
                    <span>捐赠记录将永久保存在区块链上，完全透明</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary-600">•</span>
                    <span>受益人可以随时提取收到的捐赠资金</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary-600">•</span>
                    <span>您可以为捐赠留言，表达您的祝福和支持</span>
                  </div>
                </div>
              </div>
              
              {/* 安全提示 */}
              <div className="warm-card rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-blue-800 mb-4">🔒 安全提示</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>• 请确认受益人地址正确</p>
                  <p>• 捐赠操作不可撤销</p>
                  <p>• 建议先进行小额测试</p>
                </div>
              </div>

              {/* 爱心统计 */}
              <div className="warm-card rounded-2xl p-6 shadow-lg bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200">
                <h3 className="text-lg font-bold text-pink-800 mb-4">❤️ 爱心传递</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-pink-700">您的善举</span>
                    <span className="font-bold text-pink-600">将被永远记录</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-pink-700">透明公开</span>
                    <span className="font-bold text-pink-600">区块链见证</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-pink-700">直接到达</span>
                    <span className="font-bold text-pink-600">受益人钱包</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-2xl">🌟</div>
                  <div className="text-xs text-pink-600 mt-1">每一份爱心都闪闪发光</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 撒花特效 */}
      <CelebrationEffect
        isVisible={showCelebration}
        onComplete={handleCelebrationComplete}
        donationAmount={lastDonation.amount}
        recipientAddress={lastDonation.recipient}
      />
    </PageWrapper>
  )
}

export default DonationPage 
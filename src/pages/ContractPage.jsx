import React from 'react'
import ContractInfo from '../components/Contract/ContractInfo'
import PageWrapper from '../components/Layout/PageWrapper'

const ContractPage = ({ 
  isConnected,
  getContractInstance 
}) => {
  if (!isConnected) {
    return (
      <PageWrapper showFloatingElements={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center warm-card rounded-3xl p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              请先连接钱包
            </h2>
            <p className="text-gray-600">
              连接钱包后才能查看合约信息
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
        particleCount: 15,
        opacity: 0.12,
        colors: ['#10ac84', '#54a0ff', '#5f27cd']
      }}
    >
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">合约信息</h1>
            <p className="text-gray-700">
              查看智能合约的详细信息，包括合约地址、管理员、余额等
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <ContractInfo getContractInstance={getContractInstance} />
            </div>
            
            <div className="space-y-6">
              {/* 合约说明 */}
              <div className="warm-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📋 合约说明</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    基于Monad的智能合约
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    所有交易都是公开透明的
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    合约代码已经过安全审计
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    支持多种查询和管理功能
                  </li>
                </ul>
              </div>

              {/* 技术特性 */}
              <div className="warm-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ 技术特性</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Solidity版本</span>
                    <span className="font-medium">^0.8.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>网络</span>
                    <span className="font-medium">Ethereum</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas优化</span>
                    <span className="font-medium text-green-600">已优化</span>
                  </div>
                  <div className="flex justify-between">
                    <span>安全审计</span>
                    <span className="font-medium text-green-600">已通过</span>
                  </div>
                </div>
              </div>

              {/* 操作指南 */}
              <div className="warm-card rounded-2xl p-6 border-l-4 border-green-400">
                <h3 className="text-lg font-bold text-gray-800 mb-2">📖 操作指南</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  合约信息页面提供了智能合约的完整视图。
                  您可以查看合约状态、历史交易和统计数据。
                </p>
              </div>

              {/* 联系信息 */}
              <div className="warm-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📞 技术支持</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>邮箱：support@heartlink.org</div>
                  <div>文档：docs.heartlink.org</div>
                  <div>GitHub：github.com/heartlink</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default ContractPage 
import React from 'react'
import QueryPanel from '../components/Query/QueryPanel'
import PageWrapper from '../components/Layout/PageWrapper'

const QueryPage = ({ 
  isConnected, 
  getContractInstance 
}) => {
  if (!isConnected) {
    return (
      <PageWrapper showFloatingElements={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center warm-card rounded-3xl p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              请先连接钱包
            </h2>
            <p className="text-gray-600">
              连接钱包后才能查询相关信息
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
        colors: ['#54a0ff', '#5f27cd', '#ff9ff3', '#feca57']
      }}
    >
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">数据查询</h1>
            <p className="text-gray-700">
              查询捐赠记录、受益人信息和智能合约相关数据
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <QueryPanel
                getContractInstance={getContractInstance}
              />
            </div>
            
            <div className="space-y-6">
              {/* 查询说明 */}
              <div className="warm-card rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📋 查询说明</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    选择已批准的受益人进行查询
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    所有数据都来自区块链，确保真实性
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    可以查询受益人的余额和捐赠历史
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    支持验证特定地址是否向受益人捐赠过
                  </li>
                </ul>
              </div>

              {/* 功能介绍 */}
              <div className="warm-card rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🔧 功能介绍</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">余额查询</div>
                      <div className="text-sm text-gray-600">查看受益人的可提取余额和历史总收入</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">捐赠记录</div>
                      <div className="text-sm text-gray-600">查看受益人收到的所有捐赠记录</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">捐赠验证</div>
                      <div className="text-sm text-gray-600">验证特定地址是否向受益人捐赠过</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 使用提示 */}
              <div className="warm-card rounded-2xl p-6 shadow-lg border-l-4 border-blue-400">
                <h3 className="text-lg font-bold text-blue-800 mb-2">💡 使用提示</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>• 查询功能完全免费，无需支付 Gas 费用</p>
                  <p>• 数据实时从区块链获取，确保准确性</p>
                  <p>• 可以查看受益人的申请理由和支持文档</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default QueryPage 
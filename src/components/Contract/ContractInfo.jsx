import React, { useState } from 'react'
import { Info, FileText, Database, RefreshCw } from 'lucide-react'
import { ethers } from 'ethers'
import { contractAddress } from '../../constants'

const ContractInfo = ({ getContractInstance }) => {
  const [contractData, setContractData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [version, setVersion] = useState(null)

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleGetContractInfo = async () => {
    setLoading(true)
    try {
      const contract = await getContractInstance(false)
      const provider = new ethers.BrowserProvider(window.ethereum)

      // 分别获取信息，避免一个失败影响其他
      const results = await Promise.allSettled([
        contract.getOwner(),
        contract.getPriceFeed(),
        provider.getBalance(contractAddress),
        contract.getAllRecipients()
      ])

      const data = {
        address: contractAddress,
        owner: results[0].status === 'fulfilled' ? results[0].value : '获取失败',
        priceFeed: results[1].status === 'fulfilled' ? results[1].value : '获取失败',
        balance: results[2].status === 'fulfilled' ? ethers.formatEther(results[2].value) : '获取失败',
        recipientCount: results[3].status === 'fulfilled' ? results[3].value.length : '获取失败'
      }

      // 记录失败的调用
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const methods = ['getOwner', 'getPriceFeed', 'getBalance', 'getAllRecipients']
          console.error(`${methods[index]} 调用失败:`, result.reason)
        }
      })

      setContractData(data)
    } catch (error) {
      console.error('获取合约信息失败:', error)
      setContractData({
        address: contractAddress,
        owner: '获取失败',
        priceFeed: '获取失败', 
        balance: '获取失败',
        recipientCount: '获取失败'
      })
      alert('获取合约信息失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGetVersion = async () => {
    setLoading(true)
    try {
      const contract = await getContractInstance(false)
      const versionResult = await contract.getVersion()
      setVersion(versionResult.toString())
    } catch (error) {
      console.error('获取版本失败:', error)
      alert('获取版本失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="warm-card rounded-2xl p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-bold gradient-text">合约信息</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleGetContractInfo}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          获取合约信息
        </button>

        <button
          onClick={handleGetVersion}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          获取版本信息
        </button>
      </div>

      {/* 合约信息显示 */}
      {contractData && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-primary-600" />
            合约详细信息
          </h3>
          
          <div className="grid gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">合约地址</div>
              <div className="font-mono text-sm break-all">{contractData.address}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">管理员</div>
                <div className="font-mono text-sm">
                  {typeof contractData.owner === 'string' && contractData.owner.startsWith('0x') 
                    ? formatAddress(contractData.owner) 
                    : contractData.owner}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">价格预言机</div>
                <div className="font-mono text-sm">
                  {typeof contractData.priceFeed === 'string' && contractData.priceFeed.startsWith('0x') 
                    ? formatAddress(contractData.priceFeed) 
                    : contractData.priceFeed}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">合约余额</div>
                <div className="text-xl font-bold text-primary-600">
                  {typeof contractData.balance === 'string' && !isNaN(parseFloat(contractData.balance))
                    ? `${parseFloat(contractData.balance).toFixed(4)} MON`
                    : contractData.balance}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">受益人数量</div>
                <div className="text-xl font-bold text-green-600">
                  {contractData.recipientCount} 个
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 版本信息显示 */}
      {version && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            版本信息
          </h3>
          <div className="text-blue-700">
            价格预言机版本: <span className="font-mono font-bold">{version}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContractInfo 
import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { ethers } from 'ethers'
import { contractAddress, ALCHEMY_RPC_URL } from '../../constants'

const ContractDiagnostic = ({ getContractInstance, validateContract }) => {
  const [diagnosticResults, setDiagnosticResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostics = async () => {
    setIsRunning(true)
    const results = {
      rpcConnection: null,
      contractCodeExists: null,
      minimumUsdCall: null,
      getOwnerCall: null,
      getAllRecipientsCall: null,
      blockNumber: null,
      contractAddress: contractAddress
    }

    try {
      // 1. 测试 RPC 连接
      console.log('🔍 开始诊断: 测试 RPC 连接...')
      const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL)
      
      try {
        const blockNumber = await provider.getBlockNumber()
        results.rpcConnection = { success: true, data: `区块 ${blockNumber}` }
        results.blockNumber = blockNumber
        console.log('✅ RPC 连接成功, 当前区块:', blockNumber)
      } catch (error) {
        results.rpcConnection = { success: false, error: error.message }
        console.log('❌ RPC 连接失败:', error.message)
      }

      // 2. 检查合约代码
      console.log('🔍 检查合约代码是否存在...')
      try {
        const code = await provider.getCode(contractAddress)
        const hasCode = code !== '0x'
        results.contractCodeExists = { 
          success: hasCode, 
          data: hasCode ? `代码长度: ${code.length} 字符` : '没有合约代码'
        }
        console.log(hasCode ? '✅ 合约代码存在' : '❌ 合约地址没有代码')
      } catch (error) {
        results.contractCodeExists = { success: false, error: error.message }
        console.log('❌ 检查合约代码失败:', error.message)
      }

      // 3. 测试合约函数调用
      const minimalAbi = [
        "function MINIMUM_USD() view returns (uint256)",
        "function getOwner() view returns (address)",
        "function getAllRecipients() view returns (address[])"
      ]

      const contract = new ethers.Contract(contractAddress, minimalAbi, provider)

      // 测试 MINIMUM_USD
      console.log('🔍 测试 MINIMUM_USD() 调用...')
      try {
        const minimum = await contract.MINIMUM_USD()
        results.minimumUsdCall = { success: true, data: minimum.toString() }
        console.log('✅ MINIMUM_USD 调用成功:', minimum.toString())
      } catch (error) {
        results.minimumUsdCall = { success: false, error: error.message }
        console.log('❌ MINIMUM_USD 调用失败:', error.message)
      }

      // 测试 getOwner
      console.log('🔍 测试 getOwner() 调用...')
      try {
        const owner = await contract.getOwner()
        results.getOwnerCall = { success: true, data: owner }
        console.log('✅ getOwner 调用成功:', owner)
      } catch (error) {
        results.getOwnerCall = { success: false, error: error.message }
        console.log('❌ getOwner 调用失败:', error.message)
      }

      // 测试 getAllRecipients - 这个可能是问题所在
      console.log('🔍 测试 getAllRecipients() 调用...')
      try {
        const recipients = await contract.getAllRecipients()
        results.getAllRecipientsCall = { success: true, data: `${recipients.length} 个受益人` }
        console.log('✅ getAllRecipients 调用成功, 数量:', recipients.length)
      } catch (error) {
        results.getAllRecipientsCall = { success: false, error: error.message }
        console.log('❌ getAllRecipients 调用失败:', error.message)
        
        // 详细记录这个错误，因为它很可能是主要问题
        console.log('getAllRecipients 错误详情:', {
          code: error.code,
          data: error.data,
          transaction: error.transaction
        })
      }

    } catch (globalError) {
      console.error('诊断过程中发生全局错误:', globalError)
    }

    setDiagnosticResults(results)
    setIsRunning(false)
  }

  const ResultItem = ({ title, result }) => {
    if (!result) return null

    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="font-medium text-gray-700">{title}</span>
        <div className="flex items-center gap-2">
          {result.success ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700 text-sm">{result.data}</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 text-sm">{result.error || '失败'}</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="warm-card rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-6 w-6 text-yellow-600" />
        <h2 className="text-xl font-bold text-gray-800">合约诊断工具</h2>
      </div>

      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="btn-primary flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              诊断中...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              开始诊断
            </>
          )}
        </button>
      </div>

      {diagnosticResults && (
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-700">
              <strong>合约地址:</strong> {diagnosticResults.contractAddress}
            </div>
            <div className="text-sm text-blue-700">
              <strong>RPC URL:</strong> Alchemy Monad Testnet
            </div>
            {diagnosticResults.blockNumber && (
              <div className="text-sm text-blue-700">
                <strong>当前区块:</strong> {diagnosticResults.blockNumber}
              </div>
            )}
          </div>

          <ResultItem title="RPC 连接" result={diagnosticResults.rpcConnection} />
          <ResultItem title="合约代码存在" result={diagnosticResults.contractCodeExists} />
          <ResultItem title="MINIMUM_USD() 调用" result={diagnosticResults.minimumUsdCall} />
          <ResultItem title="getOwner() 调用" result={diagnosticResults.getOwnerCall} />
          <ResultItem title="getAllRecipients() 调用" result={diagnosticResults.getAllRecipientsCall} />
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>说明:</strong> 此工具将测试合约的各个函数调用，帮助识别具体哪个环节出现问题。
          请查看浏览器控制台获取详细的调试信息。
        </p>
      </div>
    </div>
  )
}

export default ContractDiagnostic

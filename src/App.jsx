import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Hooks
import { useWeb3 } from './hooks/useWeb3'

// Layout Components
import Navbar from './components/Layout/Navbar'
import StatusMessage from './components/Shared/StatusMessage'

// Pages
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import DonationPage from './pages/DonationPage'
import BatchDonationPage from './pages/BatchDonationPage'
import RecipientsPage from './pages/RecipientsPage'
import QueryPage from './pages/QueryPage'
import LovePoolPage from './pages/LovePoolPage'


function App() {
  const {
    account,
    isConnected,
    isAdmin,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    getContractInstance,
    getBalance,
    setError,
    switchToMonadTestnet,
    checkNetwork,
    validateContract
  } = useWeb3()

  const [recipients, setRecipients] = useState([])
  const [statusMessage, setStatusMessage] = useState({ message: '', type: 'info' })
  const [recipientsLoading, setRecipientsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')
  const [preselectedRecipient, setPreselectedRecipient] = useState(null)

  // 显示状态消息
  const showStatus = (message, type = 'info') => {
    setStatusMessage({ message, type })
  }

  // 清除状态消息
  const clearStatus = () => {
    setStatusMessage({ message: '', type: 'info' })
  }

  // 页面导航
  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  // 带预选受益人的导航到捐赠页面
  const handleNavigateWithRecipient = (recipientData) => {
    setPreselectedRecipient(recipientData)
    setCurrentPage('donation')
  }

  // 格式化地址
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // 获取余额
  const handleGetBalance = async () => {
    try {
      const balance = await getBalance()
      showStatus(`您的钱包余额: ${parseFloat(balance).toFixed(4)} MON`, 'info')
    } catch (error) {
      showStatus('获取余额失败: ' + error.message, 'error')
    }
  }

  // 切换到 Monad 测试网络
  const handleSwitchNetwork = async () => {
    try {
      const success = await switchToMonadTestnet()
      if (success) {
        showStatus('已成功切换到 Monad 测试网络', 'success')
        // 切换网络后重新加载数据
        if (isConnected) {
          await loadRecipients()
        }
      }
    } catch (error) {
      showStatus('切换网络失败: ' + error.message, 'error')
    }
  }

  // 加载受益人列表 - 模拟原始版本
  const loadRecipients = async () => {
    if (!getContractInstance || !isConnected) {
      console.log('未连接或无合约实例，跳过加载受益人')
      return
    }

    setRecipientsLoading(true)
    try {
      console.log('开始加载受益人列表...')
      const contract = await getContractInstance(false)
      const recipientsList = await contract.getAllRecipients()
      setRecipients(recipientsList)
      console.log('成功加载受益人:', recipientsList)
      
      if (recipientsList.length > 0) {
        showStatus(`已加载 ${recipientsList.length} 个受益人`, 'success')
      } else {
        showStatus('暂无受益人', 'info')
      }
    } catch (error) {
      console.error('加载受益人详细错误:', error)
      showStatus('加载受益人失败: ' + error.message, 'error')
      setRecipients([]) // 确保在错误时清空列表
    } finally {
      setRecipientsLoading(false)
    }
  }

  // 添加受益人
  const handleAddRecipient = async (address) => {
    try {
      const contract = await getContractInstance()
      const tx = await contract.addRecipient(address)
      await tx.wait()
      
      showStatus(`成功添加受益人: ${formatAddress(address)}`, 'success')
      await loadRecipients()
    } catch (error) {
      showStatus('添加受益人失败: ' + error.message, 'error')
    }
  }

  // 捐赠
  const handleDonate = async (recipient, amount, words) => {
    try {
      const contract = await getContractInstance()
      const tx = await contract.fund(recipient, words || '', {
        value: ethers.parseEther(amount)
      })
      await tx.wait()
      
      showStatus(`成功捐赠 ${amount} MON 给 ${formatAddress(recipient)}!`, 'success')
      await loadRecipients()
    } catch (error) {
      showStatus('捐赠失败: ' + error.message, 'error')
    }
  }

  // 提取资金
  const handleWithdraw = async () => {
    if (!account) {
      showStatus('请先连接钱包', 'error')
      return
    }

    try {
      const contract = await getContractInstance()
      const tx = await contract.withdraw()
      await tx.wait()
      
      showStatus('资金提取成功!', 'success')
      await loadRecipients()
    } catch (error) {
      showStatus('提取失败: ' + error.message, 'error')
    }
  }

  // 连接钱包成功后加载数据 - 模拟原始版本的loadInitialData
  useEffect(() => {
    if (isConnected && getContractInstance && account) {
      // 使用非阻塞方式加载数据，就像原始版本一样
      const loadInitialData = async () => {
        try {
          await loadRecipients()
        } catch (error) {
          console.error("初始化数据加载失败:", error)
          showStatus("部分数据加载失败，功能可能受限", 'error')
        }
      }
      
      loadInitialData()
    }
  }, [isConnected, getContractInstance, account])

  // 显示错误消息
  useEffect(() => {
    if (error) {
      showStatus(error, 'error')
      setError(null)
    }
  }, [error, setError])

  // 渲染当前页面
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            onNavigate={handleNavigate}
            isConnected={isConnected}
          />
        )
      case 'admin':
        return (
          <AdminPage
            isConnected={isConnected}
            isAdmin={isAdmin}
            onAddRecipient={handleAddRecipient}
            loading={recipientsLoading}
            currentAccount={account}
            getContractInstance={getContractInstance}
            validateContract={validateContract}
          />
        )
      case 'donation':
        return (
          <DonationPage
            isConnected={isConnected}
            onDonate={handleDonate}
            loading={recipientsLoading}
            getContractInstance={getContractInstance}
            preselectedRecipient={preselectedRecipient}
            onClearPreselection={() => setPreselectedRecipient(null)}
          />
        )
      case 'batch':
        return (
          <BatchDonationPage
            isConnected={isConnected}
            getContractInstance={getContractInstance}
            onDonate={handleDonate}
          />
        )
      case 'recipients':
        return (
          <RecipientsPage
            isConnected={isConnected}
            recipients={recipients}
            onLoadRecipients={loadRecipients}
            onWithdraw={handleWithdraw}
            loading={recipientsLoading}
            getContractInstance={getContractInstance}
            currentAccount={account}
            onNavigate={handleNavigate}
            onNavigateWithRecipient={handleNavigateWithRecipient}
          />
        )
      case 'query':
        return (
          <QueryPage
            isConnected={isConnected}
            getContractInstance={getContractInstance}
          />
        )
      case 'lovepool':
        return (
          <LovePoolPage
            isConnected={isConnected}
            getContractInstance={getContractInstance}
          />
        )
      default:
        return (
          <HomePage 
            onNavigate={handleNavigate}
            isConnected={isConnected}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        account={account}
        isConnected={isConnected}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        onGetBalance={handleGetBalance}
        onSwitchNetwork={handleSwitchNetwork}
      />

      {/* 主要内容 */}
      <main>
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">
            © 2025 HeartLink - 让每一份爱心都有迹可循
          </p>
          <p className="text-sm text-gray-400 mt-2">
            基于区块链技术的去中心化慈善捐赠平台
          </p>
        </div>
      </footer>

    </div>
  )
}

export default App 
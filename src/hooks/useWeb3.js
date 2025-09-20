import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { abi, contractAddress, MONAD_TESTNET, ALCHEMY_RPC_URL } from '../constants/index.js'

export const useWeb3 = () => {
  const [account, setAccount] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 获取合约实例 - 增强版本，只读操作使用 Alchemy RPC
  const getContractInstance = useCallback(async (needSigner = true) => {
    if (needSigner) {
      // 需要签名时，必须使用 MetaMask
      if (typeof window.ethereum === 'undefined') {
        throw new Error('请安装MetaMask钱包')
      }
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      return new ethers.Contract(contractAddress, abi, signer)
    } else {
      // 只读操作优先使用 Alchemy RPC，更稳定
      try {
        console.log('使用 Alchemy RPC 进行只读调用:', ALCHEMY_RPC_URL)
        const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL)
        
        // 测试连接
        await provider.getBlockNumber()
        console.log('Alchemy RPC 连接成功')
        
        return new ethers.Contract(contractAddress, abi, provider)
      } catch (alchemyError) {
        console.warn('Alchemy RPC 连接失败，回退到 MetaMask:', alchemyError)
        
        // 如果 Alchemy 失败，回退到 MetaMask
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.BrowserProvider(window.ethereum)
          return new ethers.Contract(contractAddress, abi, provider)
        } else {
          throw new Error('Alchemy RPC 和 MetaMask 都不可用')
        }
      }
    }
  }, [])

  // 连接钱包
  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('请安装MetaMask钱包!')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      // 直接使用ethereum对象，就像原始版本一样
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      
      if (accounts.length > 0) {
        const currentAccount = accounts[0]
        setAccount(currentAccount)
        
        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        console.log("当前网络:", network)

        // 检查网络
        const isCorrectNetwork = await checkNetwork()
        if (!isCorrectNetwork) {
          // 提示用户切换网络，但不阻止连接
          console.warn('当前不在 Monad 测试网络')
        }

        // 验证合约是否存在
        const code = await provider.getCode(contractAddress)
        if (code === '0x') {
          throw new Error("合约未部署在当前网络")
        }

        setIsConnected(true)
        return true
      }
      return false
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // 断开钱包
  const disconnectWallet = useCallback(() => {
    setAccount(null)
    setIsConnected(false)
    setIsAdmin(false)
    setError(null)
  }, [])

  // 检查管理员状态
  const checkAdminStatus = useCallback(async () => {
    if (!account) return

    try {
      const contract = await getContractInstance(false)
      const owner = await contract.getOwner()
      setIsAdmin(owner.toLowerCase() === account.toLowerCase())
    } catch (err) {
      console.error('检查管理员状态失败:', err)
      setIsAdmin(false)
    }
  }, [account, getContractInstance])

  // 获取余额
  const getBalance = useCallback(async (address = account) => {
    if (!address) return '0'

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (err) {
      console.error('获取余额失败:', err)
      return '0'
    }
  }, [account])

  // 切换到 Monad 测试网络
  const switchToMonadTestnet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('请安装MetaMask钱包!')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      // 尝试切换到 Monad 测试网络
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }],
      })
      
      console.log('已切换到 Monad 测试网络')
      return true
    } catch (switchError) {
      // 如果网络不存在，尝试添加网络
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET],
          })
          console.log('已添加并切换到 Monad 测试网络')
          return true
        } catch (addError) {
          setError('添加 Monad 测试网络失败: ' + addError.message)
          return false
        }
      } else {
        setError('切换网络失败: ' + switchError.message)
        return false
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // 检查当前网络是否为 Monad 测试网络
  const checkNetwork = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') return false

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()
      const isMonadTestnet = network.chainId === 10143n
      
      if (!isMonadTestnet) {
        setError(`当前网络不是 Monad 测试网络。请切换到 Monad 测试网络 (Chain ID: 10143)`)
        return false
      }
      
      return true
    } catch (err) {
      console.error('检查网络失败:', err)
      setError('检查网络失败: ' + err.message)
      return false
    }
  }, [])

  // 验证合约是否正确部署
  const validateContract = useCallback(async () => {
    try {
      console.log('🔍 开始验证合约部署...')
      
      // 使用 Alchemy RPC 进行验证
      const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL)
      
      // 1. 检查合约代码
      const code = await provider.getCode(contractAddress)
      if (code === '0x') {
        console.error('❌ 合约地址没有代码:', contractAddress)
        return { success: false, error: '合约地址没有部署代码' }
      }
      console.log('✅ 合约代码存在, 长度:', code.length)
      
      // 2. 尝试最简单的调用 - getVersion (如果存在)
      const minimalAbi = [
        "function getVersion() view returns (uint256)",
        "function getOwner() view returns (address)"
      ]
      
      const contract = new ethers.Contract(contractAddress, minimalAbi, provider)
      
      try {
        const version = await contract.getVersion()
        console.log('✅ getVersion 调用成功:', version.toString())
      } catch (versionError) {
        console.warn('⚠️ getVersion 调用失败 (可能正常):', versionError.message)
      }
      
      try {
        const owner = await contract.getOwner()
        console.log('✅ getOwner 调用成功:', owner)
        return { success: true, owner }
      } catch (ownerError) {
        console.error('❌ getOwner 调用失败:', ownerError.message)
        return { success: false, error: ownerError.message }
      }
      
    } catch (error) {
      console.error('❌ 合约验证失败:', error)
      return { success: false, error: error.message }
    }
  }, [])

  // 监听账户变化 - 模拟原始版本
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined' && isConnected) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // 用户在MetaMask中断开了连接
          disconnectWallet()
        } else if (accounts[0] !== account) {
          setAccount(accounts[0])
          console.log("账户已切换到:", accounts[0])
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [account, isConnected, disconnectWallet])

  // 页面加载时检查连接状态 - 模拟原始版本的window.addEventListener('load')
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            const currentAccount = accounts[0]
            setAccount(currentAccount)
            setIsConnected(true)
            
            console.log("页面加载时发现已连接账户:", currentAccount)
          }
        } catch (error) {
          console.error("初始化失败:", error)
          setError("初始化失败: " + error.message)
        }
      } else {
        setError("请安装MetaMask钱包")
      }
    }

    checkConnection()
  }, [])

  // 当账户改变时检查管理员状态
  useEffect(() => {
    if (account && isConnected) {
      // 使用非阻塞方式检查管理员状态
      checkAdminStatus().catch(error => {
        console.error("管理员状态检查失败:", error)
      })
    }
  }, [account, isConnected, checkAdminStatus])

  return {
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
  }
} 
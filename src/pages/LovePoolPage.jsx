import React, { useState, useEffect, useCallback } from 'react'
import { Heart, Calendar, Star, Gift, Eye, X } from 'lucide-react'
import { ethers } from 'ethers'
import PageWrapper from '../components/Layout/PageWrapper'

/**
 * 爱心广场页面
 * 展示所有捐赠记录，以爱心卡片的形式在广场中展示
 */
const LovePoolPage = ({ isConnected, getContractInstance }) => {
  const [allDonations, setAllDonations] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: '0',
    uniqueDonors: 0,
    recipients: 0
  })

  // 加载所有捐赠数据
  const loadAllDonations = useCallback(async () => {
    if (!getContractInstance || !isConnected) {
      console.log('LoveSquare: 未连接或无合约实例')
      return
    }

    setLoading(true)
    try {
      console.log('LoveSquare: 开始加载所有捐赠数据...')
      const contract = await getContractInstance(false)
      
      // 获取所有受益人
      const recipients = await contract.getAllRecipients()
      console.log('LoveSquare: 获取到受益人列表:', recipients)
      
      if (recipients.length === 0) {
        console.log('LoveSquare: 暂无受益人')
        setAllDonations([])
        setStats({
          totalDonations: 0,
          totalAmount: '0',
          uniqueDonors: 0,
          recipients: 0
        })
        return
      }

      // 获取每个受益人的捐赠记录
      const allDonationsData = []
      const uniqueDonors = new Set()
      let totalAmount = ethers.getBigInt(0)

      for (const recipient of recipients) {
        try {
          const donations = await contract.getDonationsForRecipient(recipient)
          console.log(`LoveSquare: 受益人 ${recipient} 的捐赠记录:`, donations.length, '条')
          
          for (const donation of donations) {
            const donationData = {
              funder: donation.funder,
              recipient: recipient,
              amount: donation.amount,
              words: donation.words,
              timestamp: donation.timestamp,
              amountInEth: ethers.formatEther(donation.amount)
            }
            allDonationsData.push(donationData)
            uniqueDonors.add(donation.funder.toLowerCase())
            totalAmount = totalAmount + donation.amount
          }
        } catch (error) {
          console.error(`获取受益人 ${recipient} 捐赠记录失败:`, error)
        }
      }

      // 按时间倒序排列（最新的在前）
      allDonationsData.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
      
      console.log('LoveSquare: 所有捐赠数据加载完成:', {
        总捐赠数: allDonationsData.length,
        总金额: ethers.formatEther(totalAmount),
        独立捐赠者: uniqueDonors.size,
        受益人数: recipients.length
      })

      setAllDonations(allDonationsData)
      setStats({
        totalDonations: allDonationsData.length,
        totalAmount: ethers.formatEther(totalAmount),
        uniqueDonors: uniqueDonors.size,
        recipients: recipients.length
      })

    } catch (error) {
      console.error('LoveSquare: 加载捐赠数据失败:', error)
      setAllDonations([])
    } finally {
      setLoading(false)
    }
  }, [getContractInstance, isConnected])

  // 初始加载
  useEffect(() => {
    loadAllDonations()
  }, [loadAllDonations])

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleString('zh-CN')
  }

  const formatRelativeTime = (timestamp) => {
    const now = Date.now()
    const donationTime = Number(timestamp) * 1000
    const diffInMinutes = Math.floor((now - donationTime) / (1000 * 60))
    
    if (diffInMinutes < 1) return '刚刚'
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}小时前`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays}天前`
    
    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}个月前`
  }

  // 许愿卡片组件
  const WishCard = ({ donation, index, onClick }) => {
    const colors = [
      'from-pink-300 to-rose-400',
      'from-purple-300 to-pink-400', 
      'from-blue-300 to-purple-400',
      'from-green-300 to-blue-400',
      'from-yellow-300 to-orange-400',
      'from-indigo-300 to-purple-400'
    ]
    
    const borderColors = [
      'border-pink-400',
      'border-purple-400', 
      'border-blue-400',
      'border-green-400',
      'border-yellow-400',
      'border-indigo-400'
    ]
    
    const color = colors[index % colors.length]
    const borderColor = borderColors[index % borderColors.length]
    const rotation = (Math.random() - 0.5) * 10 // 随机旋转
    const delay = (index % 20) * 0.05 // 动画延迟

    return (
      <div 
        className={`wish-card cursor-pointer transform transition-all duration-300 hover:scale-110 hover:z-20 relative`}
        style={{ 
          transform: `rotate(${rotation}deg)`,
          animation: `fadeInUp 0.6s ease-out forwards`,
          animationDelay: `${delay}s`,
          opacity: 0
        }}
        onClick={() => onClick(donation)}
      >
        <div className={`bg-gradient-to-br ${color} rounded-xl p-3 shadow-lg hover:shadow-xl ${borderColor} border-2 backdrop-blur-sm w-32 h-40 flex flex-col justify-between relative overflow-hidden`}>
          {/* 装饰性星星 */}
          <div className="absolute top-1 right-1">
            <Star className="h-3 w-3 text-white/60 fill-current star-twinkle" />
          </div>
          
          {/* 爱心图标 */}
          <div className="flex justify-center">
            <Heart className="h-4 w-4 text-white fill-current heart-beat" />
          </div>
          
          {/* 金额 */}
          <div className="text-center">
            <div className="text-white font-bold text-sm">
              {parseFloat(donation.amountInEth).toFixed(3)}
            </div>
            <div className="text-white/80 text-xs">MON</div>
          </div>
          
          {/* 捐赠者 */}
          <div className="text-center">
            <div className="text-white/90 text-xs font-medium">
              {formatAddress(donation.funder)}
            </div>
          </div>
          
          {/* 时间 */}
          <div className="text-center">
            <div className="text-white/70 text-xs">
              {formatRelativeTime(donation.timestamp)}
            </div>
          </div>
          
          {/* 悬浮提示 */}
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    )
  }

  // 详情模态框
  const WishCardModal = ({ donation, onClose }) => {
    if (!donation) return null

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 模态框头部 */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-t-2xl p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-8 w-8 fill-current" />
              <h3 className="text-xl font-bold">爱心捐赠记录</h3>
            </div>
            
            <div className="text-pink-100 text-sm">
              感谢每一份善意的传递
            </div>
          </div>

          {/* 模态框内容 */}
          <div className="p-6 space-y-6">
            {/* 金额信息 */}
            <div className="text-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {parseFloat(donation.amountInEth).toFixed(4)} MON
              </div>
              <div className="text-gray-600">
                ≈ ${(parseFloat(donation.amountInEth) * 2000).toFixed(2)} USD
              </div>
            </div>

            {/* 参与者信息 */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1 font-medium">捐赠者</div>
                <div className="font-mono text-blue-800 text-sm">
                  {donation.funder}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1 font-medium">受益人</div>
                <div className="font-mono text-green-800 text-sm">
                  {donation.recipient}
                </div>
              </div>
            </div>

            {/* 留言 */}
            {donation.words && donation.words.trim() && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-yellow-600 mb-2 font-medium flex items-center gap-1">
                  <Gift className="h-4 w-4" />
                  爱心留言
                </div>
                <div className="text-yellow-800 text-sm leading-relaxed italic">
                  "{donation.words}"
                </div>
              </div>
            )}

            {/* 时间信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1 font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                捐赠时间
              </div>
              <div className="text-gray-800 text-sm">
                {formatDate(donation.timestamp)}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                ({formatRelativeTime(donation.timestamp)})
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <PageWrapper showFloatingElements={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center warm-card rounded-3xl p-12 max-w-md mx-auto">
            <div className="text-6xl mb-6">💝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              请先连接钱包
            </h2>
            <p className="text-gray-600">
              连接钱包后即可查看爱心广场中的所有捐赠记录
            </p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {/* 内联样式确保动画效果 */}
      <style>{`
        @keyframes cardAppear {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes gentleSwing {
          0%, 100% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }
        
        @keyframes growTrunk {
          0% {
            height: 0;
            transform: scaleY(0);
          }
          100% {
            height: 8rem;
            transform: scaleY(1);
          }
        }
        
        @keyframes floatDown {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .floating-leaf {
          position: absolute;
          top: -10px;
          font-size: 20px;
          animation: floatDown 12s infinite linear;
          z-index: 1;
        }
        
        @keyframes heartBeat {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1);
          }
          75% {
            transform: scale(1.05);
          }
        }
        
        @keyframes starTwinkle {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        .heart-beat {
          animation: heartBeat 2s ease-in-out infinite;
        }
        
        .star-twinkle {
          animation: starTwinkle 2s ease-in-out infinite;
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* 天空背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 via-transparent to-green-100/30"></div>
        
        {/* 飘动的叶子效果 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-leaf" style={{ left: '10%', animationDelay: '0s' }}>🍃</div>
          <div className="floating-leaf" style={{ left: '70%', animationDelay: '3s' }}>🍃</div>
          <div className="floating-leaf" style={{ left: '30%', animationDelay: '6s' }}>🌸</div>
          <div className="floating-leaf" style={{ left: '80%', animationDelay: '9s' }}>🌸</div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面头部 */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full p-6 animate-float shadow-2xl">
                <Heart className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              <span className="gradient-text">爱心广场</span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
              每一份捐赠都是一张爱心卡片
              <br />
              在这里见证善意的传递与温暖的汇聚
            </p>

            {/* 统计数据 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-green-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ animation: 'cardAppear 0.8s ease-out forwards 0.1s', opacity: 0 }}
              >
                <div className="text-2xl font-bold text-green-600">{stats.totalDonations}</div>
                <div className="text-sm text-gray-600">爱心卡片</div>
              </div>
              <div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ animation: 'cardAppear 0.8s ease-out forwards 0.2s', opacity: 0 }}
              >
                <div className="text-2xl font-bold text-blue-600">
                  {parseFloat(stats.totalAmount).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">总金额 (MON)</div>
              </div>
              <div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-purple-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ animation: 'cardAppear 0.8s ease-out forwards 0.3s', opacity: 0 }}
              >
                <div className="text-2xl font-bold text-purple-600">{stats.uniqueDonors}</div>
                <div className="text-sm text-gray-600">爱心天使</div>
              </div>
              <div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pink-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{ animation: 'cardAppear 0.8s ease-out forwards 0.4s', opacity: 0 }}
              >
                <div className="text-2xl font-bold text-pink-600">{stats.recipients}</div>
                <div className="text-sm text-gray-600">受益人</div>
              </div>
            </div>
          </div>

          {/* 许愿树主体 */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">正在从区块链加载爱心记录...</p>
              </div>
            </div>
          ) : allDonations.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">💝</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">爱心广场还很安静</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                还没有爱心卡片在这里闪闪发光。成为第一个传递温暖的人吧！
              </p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
                {allDonations.map((donation, index) => (
                  <WishCard 
                    key={`${donation.funder}-${donation.recipient}-${donation.timestamp}-${index}`}
                    donation={donation}
                    index={index}
                    onClick={setSelectedCard}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 许愿卡详情模态框 */}
        <WishCardModal 
          donation={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      </div>
    </PageWrapper>
  )
}

export default LovePoolPage
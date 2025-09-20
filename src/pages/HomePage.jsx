import React from 'react'
import { 
  Heart, 
  Shield, 
  Eye, 
  Users, 
  TrendingUp, 
  Zap, 
  Globe, 
  Award,
  ArrowRight,
  CheckCircle,
  Lock,
  Coins,
  Send
} from 'lucide-react'

// 导入背景组件
import ParticleBackground from '../components/Shared/ParticleBackground'
import FloatingElements from '../components/Shared/FloatingElements'
import HeartParticleBackground from '../components/Shared/HeartParticleBackground'

const HomePage = ({ onNavigate, isConnected }) => {
  const features = [
    {
      icon: Shield,
      title: '去中心化透明',
      description: '基于Monad智能合约，所有交易公开透明，无法篡改',
      color: 'text-blue-600'
    },
    {
      icon: Eye,
      title: '资金可追溯',
      description: '每一笔捐款都有完整的链上记录，确保善款去向清晰',
      color: 'text-green-600'
    },
    {
      icon: Users,
      title: '直接援助',
      description: '捐款直达受益人，无中间环节，提高资金使用效率',
      color: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      title: '实时统计',
      description: '实时查看捐赠进度和资金使用情况，数据完全透明',
      color: 'text-orange-600'
    }
  ]

  const principles = [
    {
      icon: Lock,
      title: '安全性',
      description: '智能合约经过严格审计，采用多重安全机制保护用户资金'
    },
    {
      icon: Globe,
      title: '全球化',
      description: '无国界限制，任何人都可以参与慈善事业，让爱心传递全球'
    },
    {
      icon: Zap,
      title: '高效性',
      description: '自动化执行，减少人工干预，提高资金配置和使用效率'
    },
    {
      icon: Award,
      title: '公信力',
      description: '区块链技术确保数据不可篡改，建立可信的慈善生态'
    }
  ]

  return (
    <div className="min-h-screen relative">
      {/* 主粒子背景 - 增强版 */}
      <ParticleBackground 
        particleCount={100}
        particleSize={5}
        connectionDistance={180}
        speed={0.6}
        colors={['#ff9ff3', '#f368e0', '#feca57', '#ff9f43', '#54a0ff', '#5f27cd', '#00d2d3', '#ff6b6b', '#a8e6cf', '#ffd93d', '#ff7675', '#74b9ff']}
        opacity={0.5}
        showConnections={true}
      />
      
      {/* 浮动元素 */}
      <FloatingElements />
      
      {/* 爱心粒子背景 */}
      <HeartParticleBackground 
        particleCount={25}
        speed={0.4}
        colors={['#f368e0', '#ff9ff3', '#e84393', '#fd79a8', '#ff7675']}
        opacity={0.3}
      />
      
      {/* 渐变背景覆盖层 */}
      <div className="absolute inset-0 charity-gradient z-10"></div>

      {/* 主要内容 */}
      <div className="relative z-20">
      {/* Hero Section */}
        <section className="relative overflow-hidden py-20 min-h-screen flex items-center">
          {/* Hero专属粒子效果 - 与心形Logo色系完全一致 */}
          <div className="absolute inset-0">
            <ParticleBackground 
              particleCount={20}
              particleSize={8}
              connectionDistance={300}
              speed={0.2}
              colors={['#ff9ff3', '#f368e0', '#e84393', '#fd79a8']}
              opacity={0.3}
              showConnections={false}
            />
          </div>
          
          {/* Hero专属爱心粒子 */}
          <div className="absolute inset-0">
            <HeartParticleBackground 
              particleCount={15}
              speed={0.2}
              colors={['#ff9ff3', '#f368e0', '#e84393', '#fd79a8']}
              opacity={0.25}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-r from-pink-400 via-red-400 to-pink-500 rounded-full p-6 animate-float shadow-2xl heart-glow heart-beat">
                <Heart className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="gradient-text">HeartLink</span>
            </h1>
            
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              基于区块链技术的去中心化慈善捐赠平台
              <br />
              让每一份爱心都有迹可循，让慈善变得更加透明可信
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isConnected ? (
                <button
                  onClick={() => onNavigate('donation')}
                    className="btn-primary text-lg px-8 py-4 flex items-center gap-2 shadow-xl animate-gentle-bounce"
                >
                  <Heart className="h-5 w-5" />
                  开始捐赠
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('donation')}
                    className="btn-primary text-lg px-8 py-4 flex items-center gap-2 shadow-xl animate-gentle-bounce"
                >
                    <Heart className="h-5 w-5 heart-dance" />
                  立即捐赠
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
              
            <button
              onClick={() => onNavigate('batch')}
                className="bg-white/90 backdrop-blur-sm border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-medium text-lg px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-xl"
              >
                <Zap className="h-5 w-5" />
                批量捐赠
              </button>
              
              <button
              onClick={() => onNavigate('lovepool')}
                className="bg-white/90 backdrop-blur-sm border-2 border-green-500 text-green-600 hover:bg-green-50 font-medium text-lg px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-xl"
              >
                <Heart className="h-5 w-5" />
                爱心广场
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
        <section className="py-16 from-pink-400 via-red-400 to-pink-500 backdrop-blur-sm relative overflow-hidden">
          {/* Stats专属粒子背景 */}
          <div className="absolute inset-0">
            <ParticleBackground 
              particleCount={30}
              particleSize={2}
              connectionDistance={100}
              speed={0.3}
              colors={['#74b9ff', '#a29bfe', '#fd79a8', '#fdcb6e']}
              opacity={0.2}
              showConnections={false}
            />
        </div>
      </section>

      {/* Features Section */}
        <section className="py-20 from-pink-400 via-red-400 to-pink-500 backdrop-blur-sm relative overflow-hidden">
          {/* Features专属粒子背景 */}
          <div className="absolute inset-0">
            <ParticleBackground 
              particleCount={40}
              particleSize={3}
              connectionDistance={120}
              speed={0.4}
              colors={['#e84393', '#fd79a8', '#ff9ff3', '#f368e0', '#fab1a0']}
              opacity={0.25}
              showConnections={true}
            />
          </div>
          
          {/* Features专属爱心粒子 */}
          <div className="absolute inset-0">
            <HeartParticleBackground 
              particleCount={8}
              speed={0.3}
              colors={['#e84393', '#fd79a8', '#ff9ff3']}
              opacity={0.2}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">平台特色</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              HeartLink 利用区块链技术的独特优势，为慈善事业带来前所未有的透明度和可信度
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                  <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 card-hover border border-white/20 love-enhanced">
                  <div className={`${feature.color} mb-6`}>
                    <Icon className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
        <section className="py-20 from-pink-400 via-red-400 to-pink-500 backdrop-blur-sm relative overflow-hidden">
          {/* How It Works专属粒子背景 */}
          <div className="absolute inset-0">
            <ParticleBackground 
              particleCount={35}
              particleSize={4}
              connectionDistance={140}
              speed={0.5}
              colors={['#e17055', '#fd79a8', '#fdcb6e', '#e84393', '#00b894']}
              opacity={0.3}
              showConnections={true}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">工作原理</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              基于Monad智能合约的慈善捐赠流程，确保每一步都透明可信
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 card-hover border border-white/20">
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">连接钱包</h3>
              <p className="text-gray-600">使用MetaMask等Web3钱包连接平台，确保资金安全</p>
            </div>
            
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 card-hover border border-white/20">
                <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">选择受益人</h3>
              <p className="text-gray-600">从经过验证的受益人列表中选择捐赠对象</p>
            </div>
            
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 card-hover border border-white/20">
                <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">完成捐赠</h3>
              <p className="text-gray-600">智能合约自动执行，资金直达受益人账户</p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles Section */}
        <section className="py-20 from-pink-400 via-red-400 to-pink-500 backdrop-blur-sm relative overflow-hidden">
          {/* Principles专属粒子背景 */}
          <div className="absolute inset-0">
            <ParticleBackground 
              particleCount={45}
              particleSize={3}
              connectionDistance={160}
              speed={0.35}
              colors={['#f368e0', '#ff9ff3', '#e84393', '#fd79a8', '#ff7675', '#fab1a0']}
              opacity={0.4}
              showConnections={true}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">核心理念</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              我们坚信技术可以让世界变得更加美好，区块链技术将重新定义慈善事业
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {principles.map((principle, index) => {
              const Icon = principle.icon
              return (
                <div key={index} className="flex items-start space-x-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{principle.title}</h3>
                      <p className="text-gray-700 text-lg leading-relaxed">{principle.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
        <section className="py-20 bg-gray-900/95 backdrop-blur-sm text-white relative overflow-hidden">
          {/* Call to Action专属粒子背景 - 粉红色系高亮 */}
          <div className="absolute inset-0">
            <ParticleBackground 
              particleCount={60}
              particleSize={6}
              connectionDistance={200}
              speed={0.7}
              colors={['#ffeaa7', '#fab1a0', '#ff7675', '#fd79a8', '#f368e0', '#e84393', '#ff9ff3']}
              opacity={0.6}
              showConnections={true}
            />
          </div>
          
          {/* Call to Action专属爱心粒子 - 高亮效果 */}
          <div className="absolute inset-0">
            <HeartParticleBackground 
              particleCount={12}
              speed={0.5}
              colors={['#ff9ff3', '#f368e0', '#e84393', '#fd79a8']}
              opacity={0.4}
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">加入我们，让爱心传递</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            无论是捐赠者还是受益人，每个人都是这个爱心网络的重要组成部分
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('donation')}
                className="bg-white text-gray-900 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-2 justify-center shadow-xl"
            >
                <Heart className="h-5 w-5 heart-beat" />
              开始捐赠
            </button>
            
            <button
              onClick={() => onNavigate('recipients')}
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-2 justify-center shadow-xl"
            >
              <Users className="h-5 w-5" />
              查看受益人
            </button>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}

export default HomePage 
import React from 'react'
import { 
  Home, 
  Users, 
  Send, 
  Search, 
  Heart, 
  Wallet, 
  LogOut, 
  Shield,
  Building2,
  Zap,
  Network
} from 'lucide-react'
import Logo from '../Shared/Logo'

const Navbar = ({ 
  currentPage, 
  onNavigate, 
  account, 
  isConnected, 
  onConnect, 
  onDisconnect, 
  onGetBalance,
  onSwitchNetwork
}) => {
  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const navItems = [
    { id: 'home', label: '首页', icon: Home },
    { id: 'donation', label: '捐赠', icon: Send },
    { id: 'batch', label: '批量捐赠', icon: Zap },
    { id: 'recipients', label: '受益人', icon: Building2 },

    { id: 'query', label: '查询', icon: Search },
    { id: 'admin', label: '管理', icon: Shield },
    { id: 'lovepool', label: '爱心广场', icon: Heart },
  ]

  return (
    <nav className="warm-card shadow-xl border-b border-pink-100/50 sticky top-0 z-40 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <Logo size="md" showText={true} animated={true} />
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2
                    ${isActive 
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 shadow-md border border-pink-200' 
                      : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50/70'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {!isConnected ? (
              <button
                onClick={onConnect}
                className="btn-primary text-sm px-6 py-2 flex items-center gap-2 shadow-lg"
              >
                <Wallet className="h-4 w-4" />
                连接钱包
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={onSwitchNetwork}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm px-4 py-2 rounded-xl border border-blue-200 transition-all duration-300 flex items-center gap-2"
                  title="切换到 Monad 测试网络"
                >
                  <Network className="h-4 w-4" />
                  Monad
                </button>
                
                <button
                  onClick={onGetBalance}
                  className="bg-green-50 hover:bg-green-100 text-green-700 text-sm px-4 py-2 rounded-xl border border-green-200 transition-all duration-300 flex items-center gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  余额
                </button>
                
                <div className="warm-card px-4 py-2 border border-pink-200 rounded-xl">
                  <div className="text-xs text-gray-500">已连接</div>
                  <div className="text-sm font-medium text-gray-800">
                    {formatAddress(account)}
                  </div>
                </div>
                
                <button
                  onClick={onDisconnect}
                  className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl border border-red-200 transition-all duration-300"
                  title="断开连接"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-3 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    p-3 rounded-xl text-xs font-medium transition-all duration-300 flex flex-col items-center gap-1
                    ${isActive 
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 shadow-md border border-pink-200' 
                      : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50/70'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 
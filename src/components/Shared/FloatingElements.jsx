import React from 'react'
import { Heart, Users, Coins, Shield, Globe, Zap } from 'lucide-react'

/**
 * 浮动元素组件
 * 创建背景中的浮动图标，增强慈善主题的视觉效果
 */
const FloatingElements = () => {
  const elements = [
    // 更多爱心元素 - 不同大小和颜色
    { Icon: Heart, delay: 0, x: '10%', y: '20%', size: 'w-10 h-10', color: 'text-pink-400' },
    { Icon: Heart, delay: 2, x: '85%', y: '15%', size: 'w-6 h-6', color: 'text-pink-500' },
    { Icon: Heart, delay: 4, x: '15%', y: '70%', size: 'w-8 h-8', color: 'text-red-400' },
    { Icon: Heart, delay: 1, x: '90%', y: '60%', size: 'w-5 h-5', color: 'text-pink-300' },
    { Icon: Heart, delay: 3, x: '60%', y: '80%', size: 'w-12 h-12', color: 'text-red-300' },
    { Icon: Heart, delay: 5, x: '25%', y: '30%', size: 'w-4 h-4', color: 'text-pink-600' },
    { Icon: Heart, delay: 6, x: '70%', y: '25%', size: 'w-7 h-7', color: 'text-red-500' },
    { Icon: Heart, delay: 1.5, x: '35%', y: '85%', size: 'w-9 h-9', color: 'text-pink-400' },
    { Icon: Heart, delay: 7, x: '50%', y: '10%', size: 'w-6 h-6', color: 'text-red-400' },
    { Icon: Heart, delay: 3.5, x: '5%', y: '50%', size: 'w-8 h-8', color: 'text-pink-500' },
    { Icon: Heart, delay: 8, x: '95%', y: '40%', size: 'w-5 h-5', color: 'text-red-300' },
    { Icon: Heart, delay: 2.5, x: '40%', y: '60%', size: 'w-7 h-7', color: 'text-pink-600' },
    
    // 少量其他元素作为点缀
    { Icon: Users, delay: 4.5, x: '75%', y: '75%', size: 'w-6 h-6', color: 'text-pink-300' },
    { Icon: Coins, delay: 6.5, x: '20%', y: '55%', size: 'w-5 h-5', color: 'text-yellow-300' },
    { Icon: Shield, delay: 9, x: '80%', y: '90%', size: 'w-5 h-5', color: 'text-pink-400' },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((element, index) => {
        const { Icon, delay, x, y, size, color } = element
        return (
          <div
            key={index}
            className={`absolute ${size} ${color} opacity-20`}
            style={{
              left: x,
              top: y,
              animation: `floatUpDown 6s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            <Icon className="w-full h-full" />
          </div>
        )
      })}
    </div>
  )
}

export default FloatingElements 
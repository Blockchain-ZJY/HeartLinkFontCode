import React from 'react'
import { Heart } from 'lucide-react'

/**
 * Logo组件
 * 可配置大小和样式的温馨Logo
 */
const Logo = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  animated = true 
}) => {
  const sizeClasses = {
    sm: {
      icon: 'h-5 w-5',
      container: 'p-1.5',
      text: 'text-base',
      subtitle: 'text-xs'
    },
    md: {
      icon: 'h-6 w-6',
      container: 'p-2',
      text: 'text-xl',
      subtitle: 'text-xs'
    },
    lg: {
      icon: 'h-10 w-10',
      container: 'p-3',
      text: 'text-3xl',
      subtitle: 'text-sm'
    },
    xl: {
      icon: 'h-16 w-16',
      container: 'p-6',
      text: 'text-5xl',
      subtitle: 'text-base'
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`
        bg-gradient-to-r from-pink-400 via-red-400 to-pink-500 
        rounded-full ${currentSize.container} mr-3 heart-glow 
        ${animated ? 'hover:scale-110 transition-transform duration-300' : ''}
      `}>
        <Heart className={`${currentSize.icon} text-white`} />
      </div>
      
      {showText && (
        <div>
          <div className={`${currentSize.text} font-bold gradient-text leading-tight`}>
            HeartLink
          </div>
          <div className={`${currentSize.subtitle} text-gray-500 -mt-1`}>
            慈善捐赠平台
          </div>
        </div>
      )}
    </div>
  )
}

export default Logo 
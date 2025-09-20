import React from 'react'
import ParticleBackground from '../Shared/ParticleBackground'
import FloatingElements from '../Shared/FloatingElements'

/**
 * 页面包装组件
 * 为所有页面提供统一的背景效果
 */
const PageWrapper = ({ 
  children, 
  showParticles = true, 
  showFloatingElements = false,
  particleConfig = {},
  className = "min-h-screen"
}) => {
  const defaultParticleConfig = {
    particleCount: 30,
    particleSize: 2,
    connectionDistance: 80,
    speed: 0.3,
    colors: ['#ff9ff3', '#f368e0', '#feca57', '#ff9f43', '#54a0ff', '#5f27cd', '#00d2d3'],
    opacity: 0.25,
    showConnections: true,
    ...particleConfig
  }

  return (
    <div className={`${className} relative`}>
      {/* 粒子背景 */}
      {showParticles && (
        <ParticleBackground {...defaultParticleConfig} />
      )}
      
      {/* 浮动元素 */}
      {showFloatingElements && <FloatingElements />}
      
      {/* 渐变背景覆盖层 */}
      <div className="absolute inset-0 charity-gradient z-10"></div>

      {/* 主要内容 */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  )
}

export default PageWrapper 
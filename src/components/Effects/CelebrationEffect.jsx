import React, { useEffect, useState } from 'react'
import { Heart, Star, Sparkles, Gift } from 'lucide-react'

const CelebrationEffect = ({ isVisible, onComplete, donationAmount, recipientAddress }) => {
  const [particles, setParticles] = useState([])
  const [showMessage, setShowMessage] = useState(false)

  // 创建粒子
  const createParticles = () => {
    const newParticles = []
    const particleCount = 60+ Math.min(Math.floor(parseFloat(donationAmount || 0) * 10), 50)
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2 + 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        size: Math.random() * 20 + 10,
        color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'][Math.floor(Math.random() * 7)],
        type: ['heart', 'star', 'sparkle', 'gift'][Math.floor(Math.random() * 4)],
        opacity: 1,
        life: 1.4
      })
    }
    setParticles(newParticles)
  }

  // 粒子动画
  useEffect(() => {
    if (!isVisible) return

    createParticles()
    setShowMessage(true)

    const animationInterval = setInterval(() => {
      setParticles(prevParticles => {
        const updatedParticles = prevParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          rotation: particle.rotation + particle.rotationSpeed,
          vy: particle.vy + 0.1, // 重力效果
          life: particle.life - 0.01,
          opacity: Math.max(0, particle.life - 0.3)
        })).filter(particle => particle.y < window.innerHeight + 50 && particle.life > 0)

        // 粒子动画结束后不自动关闭弹窗，只清理粒子
        if (updatedParticles.length === 0) {
          clearInterval(animationInterval)
        }

        return updatedParticles
      })
    }, 16) // ~60fps

    return () => clearInterval(animationInterval)
  }, [isVisible])

  // 处理点击外部关闭
  const handleOverlayClick = (e) => {
    // 如果点击的是遮罩层（而不是弹窗内容），则关闭弹窗
    if (e.target === e.currentTarget) {
      setShowMessage(false)
      onComplete && onComplete()
    }
  }

  const renderParticle = (particle) => {
    const ParticleIcon = {
      heart: Heart,
      star: Star,
      sparkle: Sparkles,
      gift: Gift
    }[particle.type]

    return (
      <div
        key={particle.id}
        className={`celebration-particle ${particle.type} fixed pointer-events-none z-50`}
        style={{
          left: `${particle.x}px`,
          top: `${particle.y}px`,
          transform: `rotate(${particle.rotation}deg)`,
          opacity: particle.opacity
        }}
      >
        <ParticleIcon
          size={particle.size}
          style={{ color: particle.color }}
          fill="currentColor"
        />
      </div>
    )
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isVisible) return null

  return (
    <>
      {/* 粒子效果 */}
      {particles.map(renderParticle)}
      
      {/* 成功消息 */}
      {showMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-40" onClick={handleOverlayClick}>
          <div className="celebration-message bg-white rounded-3xl shadow-2xl p-10 max-w-lg mx-4 text-center border-4 border-green-200 pointer-events-auto">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              捐赠成功！
            </h2>
            <div className="space-y-3 text-gray-700 mb-6">
              <p className="text-2xl font-bold text-green-600">
                {donationAmount} MON
              </p>
              <p className="text-base">
                已成功捐赠给
              </p>
              <p className="text-base font-mono bg-gray-100 px-4 py-2 rounded-lg break-all">
                {recipientAddress}
              </p>
            </div>
            
            {/* 暖心话语 */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-6 border border-pink-200">
              <div className="text-2xl mb-3">💖</div>
              <p className="text-lg font-medium text-pink-800 leading-relaxed">
                您的善良如春风化雨，温暖着需要帮助的人
              </p>
              <p className="text-base text-pink-600 mt-2">
                每一份爱心都会在这个世界上留下美好的痕迹
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-base text-gray-500">
              <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
              <span className="font-medium">您的爱心已传递</span>
              <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
            </div>
          </div>
        </div>
      )}

      {/* 背景遮罩 */}
      <div className="celebration-overlay fixed inset-0 bg-black bg-opacity-20 z-30" onClick={handleOverlayClick} />
    </>
  )
}

export default CelebrationEffect 
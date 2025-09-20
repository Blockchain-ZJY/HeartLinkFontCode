import React, { useEffect, useRef } from 'react'

/**
 * 粒子背景组件
 * 创建流动的粒子效果，符合慈善主题的温暖色调
 */
const ParticleBackground = ({ 
  particleCount = 40,
  particleSize = 2,
  connectionDistance = 100,
  speed = 0.3,
  colors = ['#ff6b9d', '#c44569', '#f8b500', '#f39c12', '#3742fa', '#70a1ff', '#5f27cd', '#00d2d3'],
  opacity = 0.3,
  showConnections = true
}) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let particles = []

    // 设置画布大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // 粒子类
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * speed
        this.vy = (Math.random() - 0.5) * speed
        this.size = Math.random() * particleSize + 0.8
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.pulse = Math.random() * Math.PI * 2
        this.pulseSpeed = 0.01 + Math.random() * 0.02
        this.life = Math.random() * Math.PI * 2
        this.lifeSpeed = 0.005 + Math.random() * 0.01
      }

      update() {
        // 更新位置
        this.x += this.vx
        this.y += this.vy

        // 边界反弹
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1

        // 保持在画布内
        this.x = Math.max(0, Math.min(canvas.width, this.x))
        this.y = Math.max(0, Math.min(canvas.height, this.y))

        // 更新脉动和生命周期
        this.pulse += this.pulseSpeed
        this.life += this.lifeSpeed
      }

      draw() {
        const pulseSize = this.size + Math.sin(this.pulse) * 0.5
        const lifeOpacity = (Math.sin(this.life) + 1) / 2 * 0.8 + 0.2
        const rotationOffset = Math.sin(this.pulse * 0.5) * 0.2
        
        ctx.save()
        ctx.globalAlpha = opacity * lifeOpacity
        
        // 主粒子带旋转效果
        ctx.translate(this.x, this.y)
        ctx.rotate(rotationOffset)
        
        // 创建更丰富的渐变
        const mainGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize)
        mainGradient.addColorStop(0, '#ffffff')
        mainGradient.addColorStop(0.3, this.color + 'dd')
        mainGradient.addColorStop(0.7, this.color + 'aa')
        mainGradient.addColorStop(1, this.color + '66')
        
        ctx.beginPath()
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2)
        ctx.fillStyle = mainGradient
        ctx.fill()

        // 增强的光晕效果 - 多层光晕
        const haloGradient1 = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize * 4)
        haloGradient1.addColorStop(0, this.color + '40')
        haloGradient1.addColorStop(0.3, this.color + '25')
        haloGradient1.addColorStop(0.6, this.color + '10')
        haloGradient1.addColorStop(1, this.color + '00')
        
        ctx.beginPath()
        ctx.arc(0, 0, pulseSize * 4, 0, Math.PI * 2)
        ctx.fillStyle = haloGradient1
        ctx.fill()

        // 第二层光晕 - 更远距离
        const haloGradient2 = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize * 6)
        haloGradient2.addColorStop(0, this.color + '20')
        haloGradient2.addColorStop(0.5, this.color + '08')
        haloGradient2.addColorStop(1, this.color + '00')
        
        ctx.globalAlpha = opacity * lifeOpacity * 0.5
        ctx.beginPath()
        ctx.arc(0, 0, pulseSize * 6, 0, Math.PI * 2)
        ctx.fillStyle = haloGradient2
        ctx.fill()

        // 闪烁的星光效果
        if (Math.random() < 0.02) {
          ctx.globalAlpha = opacity * lifeOpacity * 0.8
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 1
          const sparkleSize = pulseSize * 2
          ctx.beginPath()
          ctx.moveTo(-sparkleSize, 0)
          ctx.lineTo(sparkleSize, 0)
          ctx.moveTo(0, -sparkleSize)
          ctx.lineTo(0, sparkleSize)
          ctx.stroke()
        }
        
        ctx.restore()
      }
    }

    // 初始化粒子
    const initParticles = () => {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle())
      }
      particlesRef.current = particles
    }

    // 绘制增强的温馨连接线
    const drawConnections = () => {
      if (!showConnections) return
      
      const time = Date.now() * 0.001
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            const connectionOpacity = (1 - distance / connectionDistance) * opacity * 0.3
            const pulseEffect = Math.sin(time * 2 + distance * 0.01) * 0.5 + 0.5
            
            ctx.save()
            ctx.globalAlpha = connectionOpacity * (0.5 + pulseEffect * 0.5)
            
            // 主连接线 - 更丰富的渐变
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            )
            gradient.addColorStop(0, particles[i].color + 'cc')
            gradient.addColorStop(0.3, '#ff6b9d')
            gradient.addColorStop(0.5, '#f8b500')
            gradient.addColorStop(0.7, '#70a1ff')
            gradient.addColorStop(1, particles[j].color + 'cc')
            
            ctx.strokeStyle = gradient
            ctx.lineWidth = 1.5 + pulseEffect * 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
            
            // 流动的能量点
            if (Math.random() < 0.05) {
              const progress = (Math.sin(time * 3 + distance * 0.02) + 1) / 2
              const energyX = particles[i].x + (particles[j].x - particles[i].x) * progress
              const energyY = particles[i].y + (particles[j].y - particles[i].y) * progress
              
              ctx.globalAlpha = connectionOpacity * pulseEffect
              const energyGradient = ctx.createRadialGradient(energyX, energyY, 0, energyX, energyY, 3)
              energyGradient.addColorStop(0, '#ffffff')
              energyGradient.addColorStop(0.5, '#ffeaa7')
              energyGradient.addColorStop(1, '#ffeaa700')
              
              ctx.fillStyle = energyGradient
              ctx.beginPath()
              ctx.arc(energyX, energyY, 3, 0, Math.PI * 2)
              ctx.fill()
            }
            
            ctx.restore()
          }
        }
      }
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 绘制连接线
      drawConnections()

      // 更新和绘制粒子
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    // 初始化
    resizeCanvas()
    initParticles()
    animate()

    // 监听窗口大小变化
    const handleResize = () => {
      resizeCanvas()
      initParticles()
    }

    window.addEventListener('resize', handleResize)

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particleCount, particleSize, connectionDistance, speed, colors, opacity, showConnections])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}

export default ParticleBackground
import React, { useRef, useEffect } from 'react'

/**
 * 爱心粒子背景组件
 * 渲染爱心形状的粒子而不是圆形粒子
 */
const HeartParticleBackground = ({
  particleCount = 30,
  speed = 0.3,
  colors = ['#f368e0', '#ff9ff3', '#e84393', '#fd79a8'],
  opacity = 0.4
}) => {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []

    // 设置画布大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // 爱心粒子类
    class HeartParticle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 15 + 8
        this.speedX = (Math.random() - 0.5) * speed
        this.speedY = (Math.random() - 0.5) * speed
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.02
        this.pulse = Math.random() * Math.PI * 2
        this.pulseSpeed = 0.02 + Math.random() * 0.02
        this.life = Math.random() * Math.PI * 2
        this.lifeSpeed = 0.01 + Math.random() * 0.01
      }

      update() {
        // 移动
        this.x += this.speedX
        this.y += this.speedY

        // 边界检测
        if (this.x < -this.size) this.x = canvas.width + this.size
        if (this.x > canvas.width + this.size) this.x = -this.size
        if (this.y < -this.size) this.y = canvas.height + this.size
        if (this.y > canvas.height + this.size) this.y = -this.size

        // 更新动画参数
        this.rotation += this.rotationSpeed
        this.pulse += this.pulseSpeed
        this.life += this.lifeSpeed
      }

      // 绘制爱心形状
      drawHeart() {
        const scale = this.size / 20 * (1 + Math.sin(this.pulse) * 0.2)
        const lifeOpacity = (Math.sin(this.life) + 1) / 2 * 0.7 + 0.3

        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.scale(scale, scale)
        ctx.globalAlpha = opacity * lifeOpacity

        // 创建爱心路径
        ctx.beginPath()
        ctx.moveTo(0, 3)
        ctx.bezierCurveTo(-3, -2, -8, -2, -8, 2)
        ctx.bezierCurveTo(-8, 6, -5, 9, 0, 12)
        ctx.bezierCurveTo(5, 9, 8, 6, 8, 2)
        ctx.bezierCurveTo(8, -2, 3, -2, 0, 3)
        ctx.closePath()

        // 填充爱心
        ctx.fillStyle = this.color
        ctx.fill()

        // 添加光晕效果
        ctx.globalAlpha = opacity * lifeOpacity * 0.5
        ctx.shadowColor = this.color
        ctx.shadowBlur = 10
        ctx.fill()

        // 添加内光
        ctx.globalAlpha = opacity * lifeOpacity * 0.3
        ctx.fillStyle = '#ffffff'
        ctx.scale(0.6, 0.6)
        ctx.fill()

        ctx.restore()
      }

      draw() {
        this.drawHeart()
      }
    }

    // 初始化粒子
    const initParticles = () => {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push(new HeartParticle())
      }
      particlesRef.current = particles
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      animationId = requestAnimationFrame(animate)
    }

    // 初始化
    resizeCanvas()
    initParticles()
    animate()

    // 窗口大小变化监听
    const handleResize = () => {
      resizeCanvas()
      initParticles()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [particleCount, speed, colors, opacity])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

export default HeartParticleBackground 
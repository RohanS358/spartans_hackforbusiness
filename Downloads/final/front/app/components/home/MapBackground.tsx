'use client'

import { useEffect, useRef } from 'react'

export default function MapBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Map data points
    const businesses = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 2,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.5 + 0.1,
      angle: Math.random() * Math.PI * 2
    }))

    // Animation loop
    let animationId: number
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)'
      ctx.lineWidth = 1
      
      for (let x = 0; x < canvas.width; x += 100) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      
      for (let y = 0; y < canvas.height; y += 100) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Draw and animate business points
      businesses.forEach(business => {
        // Update position
        business.x += Math.cos(business.angle) * business.speed
        business.y += Math.sin(business.angle) * business.speed
        
        // Wrap around edges
        if (business.x > canvas.width) business.x = 0
        if (business.x < 0) business.x = canvas.width
        if (business.y > canvas.height) business.y = 0
        if (business.y < 0) business.y = canvas.height

        // Draw business point
        ctx.beginPath()
        ctx.arc(business.x, business.y, business.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${business.opacity})`
        ctx.fill()

        // Draw pulse effect
        ctx.beginPath()
        ctx.arc(business.x, business.y, business.radius * 2, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(59, 130, 246, ${business.opacity * 0.3})`
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // Draw connections between nearby businesses
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)'
      ctx.lineWidth = 1
      
      for (let i = 0; i < businesses.length; i++) {
        for (let j = i + 1; j < businesses.length; j++) {
          const dx = businesses[i].x - businesses[j].x
          const dy = businesses[i].y - businesses[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(businesses[i].x, businesses[i].y)
            ctx.lineTo(businesses[j].x, businesses[j].y)
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)' }}
    />
  )
}

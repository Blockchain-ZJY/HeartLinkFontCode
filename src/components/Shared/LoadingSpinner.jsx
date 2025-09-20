import React from 'react'

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4'
  }

  return (
    <div className={`inline-block animate-spin rounded-full border-primary-500 border-t-transparent ${sizeClasses[size]} ${className}`} />
  )
}

export default LoadingSpinner 
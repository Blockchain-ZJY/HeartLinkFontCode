import React, { useState, useEffect } from 'react'
import { getIPFSUrl, isImageFile, preloadIPFSImage } from '../../utils/ipfs'
import { FileText, Image as ImageIcon, Download, ExternalLink } from 'lucide-react'

const IPFSImage = ({ 
  cid, 
  filename = '', 
  className = '', 
  showControls = true,
  maxWidth = '300px',
  maxHeight = '200px'
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isImage, setIsImage] = useState(false)

  useEffect(() => {
    const checkAndLoadImage = async () => {
      if (!cid || cid.startsWith('QmSimulated')) {
        setIsLoading(false)
        setIsError(true)
        return
      }

      // 检查是否为图片文件
      const imageFile = filename ? isImageFile(filename) : true
      setIsImage(imageFile)

      if (imageFile) {
        // 预加载图片
        const loaded = await preloadIPFSImage(cid)
        setIsLoading(false)
        setIsError(!loaded)
      } else {
        setIsLoading(false)
      }
    }

    checkAndLoadImage()
  }, [cid, filename])

  const fileUrl = getIPFSUrl(cid)

  // 模拟文件或错误状态
  if (!cid || cid.startsWith('QmSimulated') || isError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg ${className}`}
        style={{ maxWidth, maxHeight, minHeight: '120px' }}
      >
        <div className="text-center p-4">
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {cid?.startsWith('QmSimulated') ? '模拟文件' : '文件加载失败'}
          </p>
          {cid && !cid.startsWith('QmSimulated') && (
            <p className="text-xs text-gray-400 mt-1">CID: {cid.substring(0, 10)}...</p>
          )}
        </div>
      </div>
    )
  }

  // 加载中状态
  if (isLoading && isImage) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg ${className}`}
        style={{ maxWidth, maxHeight, minHeight: '120px' }}
      >
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">加载图片中...</p>
        </div>
      </div>
    )
  }

  // 非图片文件
  if (!isImage) {
    return (
      <div 
        className={`flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 ${className}`}
        style={{ maxWidth }}
      >
        <div className="flex items-center">
          <FileText className="h-8 w-8 text-blue-500 mr-3" />
          <div>
            <p className="font-medium text-gray-900">
              {filename || '文档文件'}
            </p>
            <p className="text-sm text-gray-500">CID: {cid.substring(0, 16)}...</p>
          </div>
        </div>
        {showControls && (
          <div className="flex gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="在新窗口打开"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href={fileUrl}
              download={filename}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="下载文件"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    )
  }

  // 图片显示
  return (
    <div className={`relative group ${className}`}>
      <img
        src={fileUrl}
        alt={filename || 'IPFS图片'}
        className="rounded-lg shadow-sm object-contain w-full h-auto border border-gray-200"
        style={{ maxWidth, maxHeight }}
        onError={() => setIsError(true)}
      />
      
      {showControls && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1 bg-black bg-opacity-60 rounded-lg p-1">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="在新窗口打开"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href={fileUrl}
              download={filename}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="下载图片"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
      
      {/* 图片信息覆盖层 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 rounded-b-lg">
        <p className="text-white text-sm font-medium">
          {filename || '图片文件'}
        </p>
        <p className="text-gray-300 text-xs">
          CID: {cid.substring(0, 16)}...
        </p>
      </div>
    </div>
  )
}

export default IPFSImage 
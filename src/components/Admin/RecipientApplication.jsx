import React, { useState, useEffect } from 'react'
import { Upload, Send, FileText, AlertCircle, CheckCircle, Image, Wifi, WifiOff, Info, Copy } from 'lucide-react'
import { uploadToIPFS, validateFile, getIPFSUrl, testIPFSConnection } from '../../utils/ipfs'
import IPFSImage from '../Common/IPFSImage'

/**
 * 受益人申请组件
 * 普通用户可以提交申请成为受益人
 */
const RecipientApplication = ({ 
  onApplyAsRecipient, 
  loading,
  currentAccount,
  hasApplied 
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    topic: '',
    file: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [ipfsConnected, setIpfsConnected] = useState(null)
  const [lastUploadedCID, setLastUploadedCID] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        validateFile(file)
        setFormData(prev => ({ ...prev, file }))
        
        // 清除之前的上传结果
        setLastUploadedCID('')
        setUploadedFileName('')
        
        // 创建预览URL
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file)
          setPreviewUrl(url)
        } else {
          setPreviewUrl('')
        }
      } catch (error) {
        alert(error.message)
        e.target.value = ''
      }
    }
  }

  // 单独上传到IPFS的函数
  const handleTestUpload = async () => {
    if (!formData.file) return

    setUploadProgress('正在上传文件到IPFS...')

    try {
      const ipfsCID = await uploadToIPFS(formData.file)
      setLastUploadedCID(ipfsCID)
      setUploadedFileName(formData.file.name)
      setUploadProgress('')
      console.log('文件上传成功，CID:', ipfsCID)
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败: ' + error.message)
      setUploadProgress('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.reason.trim()) {
      alert('请填写申请理由')
      return
    }

    if (!formData.topic.trim()) {
      alert('请选择申请主题')
      return
    }
    
    if (!formData.file) {
      alert('请上传支持文档')
      return
    }

    setIsSubmitting(true)
    setUploadProgress('正在上传文件到IPFS...')

    try {
      let ipfsCID = lastUploadedCID
      
      // 如果还没有上传到IPFS，先上传
      if (!ipfsCID) {
        setUploadProgress('正在上传文件到IPFS...')
        ipfsCID = await uploadToIPFS(formData.file)
        setLastUploadedCID(ipfsCID)
        setUploadedFileName(formData.file.name)
      }
      
      setUploadProgress('文件上传成功，正在提交申请...')
      
      // 调用合约申请函数
      await onApplyAsRecipient(formData.reason.trim(), formData.topic.trim(), ipfsCID)
      
      // 重置表单
      setFormData({ reason: '', topic: '', file: null })
      setPreviewUrl('')
      setUploadProgress('')
      // 注意：保留lastUploadedCID和uploadedFileName，以便用户查看上传结果
      
      alert('申请提交成功！请等待管理员审核。')
    } catch (error) {
      console.error('申请提交失败:', error)
      alert('申请提交失败: ' + error.message)
      setUploadProgress('')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 检查IPFS连接状态
  useEffect(() => {
    const checkIPFSConnection = async () => {
      const connected = await testIPFSConnection()
      setIpfsConnected(connected)
    }
    
    checkIPFSConnection()
  }, [])

  // 如果用户已经申请过
  if (hasApplied) {
    return (
      <div className="warm-card rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <h2 className="text-2xl font-bold gradient-text">申请状态</h2>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            您已提交申请
          </h3>
          <p className="text-green-700">
            您的受益人申请正在审核中，请耐心等待管理员处理。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="warm-card rounded-2xl p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-bold gradient-text">申请成为受益人</h2>
      </div>
      
      {/* IPFS连接状态 */}
      <div className={`rounded-xl p-4 mb-4 border ${
        ipfsConnected === null 
          ? 'bg-gray-50 border-gray-200' 
          : ipfsConnected 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center gap-2">
          {ipfsConnected === null ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
          ) : ipfsConnected ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-yellow-600" />
          )}
          <span className={`text-sm font-medium ${
            ipfsConnected === null 
              ? 'text-gray-600' 
              : ipfsConnected 
                ? 'text-green-700' 
                : 'text-yellow-700'
          }`}>
            {ipfsConnected === null 
              ? '检测IPFS连接中...' 
              : ipfsConnected 
                ? 'IPFS节点连接正常 (8.137.48.231:5009)' 
                : 'IPFS节点连接失败，将使用模拟模式'
            }
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-blue-700 text-sm">
            <p className="font-medium mb-1">申请须知：</p>
            <ul className="space-y-1 text-xs">
              <li>• 请详细说明需要捐赠的原因和用途</li>
              <li>• 上传相关证明文件（身份证明、医疗证明等）</li>
              <li>• 管理员将审核您的申请并决定是否通过</li>
              <li>• 通过后您将能够接收来自平台的捐赠</li>
              <li>• 文件将上传到IPFS去中心化存储网络</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 申请理由 */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            申请理由 *
          </label>
          <textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="请详细说明您需要捐赠的原因、用途以及相关背景信息..."
            rows={4}
            className="input-field resize-none"
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.reason.length}/500 字符
          </div>
        </div>

        {/* 申请主题/类别 */}
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-3">
            申请主题 *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: '医疗救助', icon: '🏥', color: 'red' },
              { value: '教育支持', icon: '📚', color: 'blue' },
              { value: '灾难救援', icon: '🚨', color: 'orange' },
              { value: '贫困扶助', icon: '🤝', color: 'green' },
              { value: '残疾人帮扶', icon: '♿', color: 'purple' },
              { value: '儿童关爱', icon: '👶', color: 'pink' },
              { value: '老人关怀', icon: '👴', color: 'yellow' },
              { value: '环保公益', icon: '🌱', color: 'emerald' },
              { value: '社区建设', icon: '🏘️', color: 'indigo' },
            ].map((topic) => (
              <button
                key={topic.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, topic: topic.value }))}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 ${
                  formData.topic === topic.value
                    ? `border-${topic.color}-500 bg-${topic.color}-50 shadow-lg ring-2 ring-${topic.color}-200`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* 选中指示器 */}
                {formData.topic === topic.value && (
                  <div className={`absolute -top-2 -right-2 w-6 h-6 bg-${topic.color}-500 rounded-full flex items-center justify-center`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{topic.icon}</div>
                  <div>
                    <div className={`font-medium text-sm ${
                      formData.topic === topic.value ? `text-${topic.color}-800` : 'text-gray-700'
                    }`}>
                      {topic.value}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-3 text-center">
            选择最符合您申请需求的主题类别
          </div>
        </div>

        {/* 文件上传 */}
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
            支持文档 *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
              required
            />
            <label htmlFor="file" className="cursor-pointer">
              {formData.file ? (
                <div className="space-y-3">
                  {previewUrl && (
                    <div className="max-w-32 mx-auto">
                      <img 
                        src={previewUrl} 
                        alt="预览" 
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{formData.file.name}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    点击重新选择文件
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <span className="text-primary-600 font-medium">点击上传文件</span>
                    <p className="text-sm text-gray-500 mt-1">
                      支持图片(JPG, PNG, GIF)和PDF文档，最大10MB
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>
          
          {/* 单独上传到IPFS的按钮 */}
          {formData.file && !lastUploadedCID && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleTestUpload}
                disabled={!ipfsConnected}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Upload className="h-4 w-4" />
                先上传到IPFS预览
              </button>
              <p className="text-xs text-gray-500 mt-1">
                可以先上传文件到IPFS查看效果，确认无误后再提交申请
              </p>
            </div>
          )}
        </div>

        {/* IPFS上传结果显示 */}
        {lastUploadedCID && (
          <div className="warm-card rounded-xl p-6 border border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800">文件已上传到IPFS</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 文件信息 */}
              <div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">文件名：</span>
                    <span className="text-gray-600">{uploadedFileName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">IPFS CID：</span>
                    <div className="font-mono text-xs bg-white px-2 py-1 rounded border break-all">
                      {lastUploadedCID}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">访问链接：</span>
                    <a 
                      href={getIPFSUrl(lastUploadedCID)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs break-all"
                    >
                      {getIPFSUrl(lastUploadedCID)}
                    </a>
                  </div>
                </div>
              </div>
              
              {/* IPFS图片预览 */}
              <div>
                <div className="font-medium text-gray-700 mb-2">预览：</div>
                <IPFSImage
                  cid={lastUploadedCID}
                  filename={uploadedFileName}
                  maxWidth="100%"
                  maxHeight="200px"
                  className="border border-gray-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* 上传进度 */}
        {uploadProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
              <span className="text-sm">{uploadProgress}</span>
            </div>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              提交中...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              提交申请
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default RecipientApplication 
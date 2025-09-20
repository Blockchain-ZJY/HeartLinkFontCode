import React, { useState, useEffect } from 'react'
import { Upload, TestTube, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { uploadToIPFS, testIPFSConnection, validateFile } from '../../utils/ipfs'
import IPFSImage from '../Common/IPFSImage'

const IPFSTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [uploadStatus, setUploadStatus] = useState('idle')
  const [uploadedCID, setUploadedCID] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadError, setUploadError] = useState('')

  // 测试IPFS连接
  useEffect(() => {
    const testConnection = async () => {
      console.log('开始测试IPFS连接...')
      const isConnected = await testIPFSConnection()
      setConnectionStatus(isConnected ? 'connected' : 'failed')
    }
    
    testConnection()
  }, [])

  // 重新测试连接
  const retestConnection = async () => {
    setConnectionStatus('testing')
    const isConnected = await testIPFSConnection()
    setConnectionStatus(isConnected ? 'connected' : 'failed')
  }

  // 处理文件选择
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      validateFile(file)
      setSelectedFile(file)
      setUploadError('')
    } catch (error) {
      setUploadError(error.message)
      setSelectedFile(null)
    }
  }

  // 上传文件
  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadStatus('uploading')
    setUploadError('')

    try {
      const cid = await uploadToIPFS(selectedFile)
      setUploadedCID(cid)
      setUploadStatus('success')
      console.log('文件上传成功，CID:', cid)
    } catch (error) {
      console.error('上传失败:', error)
      setUploadError(error.message)
      setUploadStatus('failed')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'testing':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TestTube className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">IPFS 功能测试</h1>
        </div>
        <p className="text-gray-600">测试IPFS连接、文件上传和图片显示功能</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 连接状态 */}
        <div className="warm-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">连接状态</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">IPFS 节点连接</div>
                <div className="text-sm text-gray-600">
                  {connectionStatus === 'testing' && '正在测试连接...'}
                  {connectionStatus === 'connected' && 'API 连接正常'}
                  {connectionStatus === 'failed' && '连接失败，请检查服务器'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(connectionStatus)}
                <button
                  onClick={retestConnection}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  disabled={connectionStatus === 'testing'}
                >
                  重新测试
                </button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <div><strong>API地址:</strong> http://8.137.48.231:5009/api/v0</div>
                <div><strong>网关地址:</strong> http://8.137.48.231:5010/ipfs</div>
              </div>
            </div>
          </div>
        </div>

        {/* 文件上传测试 */}
        <div className="warm-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">文件上传测试</h2>
          
          <div className="space-y-4">
            {/* 文件选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择文件 (支持图片和PDF)
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*,.pdf"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* 文件信息 */}
            {selectedFile && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800">
                  <div><strong>文件名:</strong> {selectedFile.name}</div>
                  <div><strong>大小:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</div>
                  <div><strong>类型:</strong> {selectedFile.type}</div>
                </div>
              </div>
            )}

            {/* 上传按钮 */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === 'uploading' || connectionStatus !== 'connected'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  上传到 IPFS
                </>
              )}
            </button>

            {/* 上传结果 */}
            {uploadStatus === 'success' && uploadedCID && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-semibold">上传成功！</span>
                  </div>
                  <div><strong>CID:</strong> {uploadedCID}</div>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-sm text-red-800">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="h-4 w-4" />
                    <span className="font-semibold">上传失败</span>
                  </div>
                  <div>{uploadError}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 图片显示测试 */}
      {uploadedCID && (
        <div className="mt-8 warm-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">图片显示测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">使用 IPFSImage 组件</h3>
              <IPFSImage
                cid={uploadedCID}
                filename={selectedFile?.name}
                maxWidth="100%"
                maxHeight="300px"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-3">直接链接访问</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <a
                  href={`http://8.137.48.231:5010/ipfs/${uploadedCID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  http://8.137.48.231:5010/ipfs/{uploadedCID}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IPFSTest 
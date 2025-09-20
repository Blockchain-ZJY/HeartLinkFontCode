/**
 * IPFS上传工具
 * 使用本地IPFS节点
 */

// IPFS节点配置 - 使用自签名HTTPS证书
const IPFS_API_URL = 'https://8.137.48.231/api/v0'    // 通过Nginx HTTPS代理
const IPFS_GATEWAY_URL = 'https://8.137.48.231/ipfs'   // 通过Nginx HTTPS代理

/**
 * 上传文件到IPFS
 * @param {File} file - 要上传的文件
 * @returns {Promise<string>} - 返回IPFS CID
 */
export const uploadToIPFS = async (file) => {
  try {
    console.log('开始上传文件到IPFS:', file.name, `(${(file.size / 1024).toFixed(2)}KB)`)
    
    // 验证文件
    validateFile(file)
    
    // 创建FormData
    const formData = new FormData()
    formData.append('file', file)
    
    // 上传到IPFS
    const response = await fetch(`${IPFS_API_URL}/add`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`IPFS上传失败: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.text()
    console.log('IPFS上传响应:', result)
    
    // 解析响应 (IPFS返回的是换行分隔的JSON)
    const lines = result.trim().split('\n')
    const lastLine = lines[lines.length - 1]
    const data = JSON.parse(lastLine)
    
    const cid = data.Hash
    console.log('文件上传成功，CID:', cid)
    console.log('文件访问地址:', `${IPFS_GATEWAY_URL}/${cid}`)
    
    return cid
  } catch (error) {
    console.error('IPFS上传失败:', error)
    
    // 如果是网络错误，提供手动上传指引
    if (error.message.includes('fetch')) {
      console.log('=====================================')
      console.log('🔧 网络连接失败，请检查IPFS服务器状态')
      console.log('IPFS API地址:', IPFS_API_URL)
      console.log('请确认服务器已启动并且网络连通')
      console.log('=====================================')
    }
    
    throw error
  }
}

/**
 * 获取IPFS文件URL
 * @param {string} cid - IPFS CID
 * @returns {string} - IPFS文件URL
 */
export const getIPFSUrl = (cid) => {
  if (!cid || cid.startsWith('QmSimulated')) {
    return '#模拟文件'
  }
  
  // 使用本地IPFS网关
  return `${IPFS_GATEWAY_URL}/${cid}`
}

/**
 * 测试IPFS节点连接
 * @returns {Promise<boolean>} - 连接是否成功
 */
export const testIPFSConnection = async () => {
  try {
    // 测试API连接
    const apiResponse = await fetch(`${IPFS_API_URL}/version`, {
      method: 'POST'
    })
    
    if (apiResponse.ok) {
      const version = await apiResponse.json()
      console.log('IPFS API连接成功，版本:', version.Version)
      console.log('IPFS API地址:', IPFS_API_URL)
      console.log('IPFS网关地址:', IPFS_GATEWAY_URL)
      return true
    } else {
      throw new Error(`API响应错误: ${apiResponse.status}`)
    }
  } catch (error) {
    console.error('IPFS连接测试失败:', error.message)
    console.log('请检查IPFS服务器是否正在运行')
    console.log('预期API地址:', IPFS_API_URL)
    return false
  }
}

/**
 * 验证文件类型和大小
 * @param {File} file - 要验证的文件
 * @returns {boolean} - 是否通过验证
 */
export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
  
  if (file.size > maxSize) {
    throw new Error('文件大小不能超过10MB')
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('只支持图片文件(JPG, PNG, GIF, WebP)和PDF文档')
  }
  
  return true
}

/**
 * 检查文件是否为图片
 * @param {string} filename - 文件名
 * @returns {boolean} - 是否为图片
 */
export const isImageFile = (filename) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return imageExtensions.includes(ext)
}

/**
 * 预加载IPFS图片
 * @param {string} cid - IPFS CID
 * @returns {Promise<boolean>} - 图片是否可用
 */
export const preloadIPFSImage = async (cid) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = getIPFSUrl(cid)
    
    // 5秒超时
    setTimeout(() => resolve(false), 5000)
  })
}

/**
 * 获取文件信息
 * @param {string} cid - IPFS CID
 * @returns {Promise<Object>} - 文件信息
 */
export const getFileInfo = async (cid) => {
  try {
    const response = await fetch(`${IPFS_API_URL}/object/stat?arg=${cid}`, {
      method: 'POST'
    })
    
    if (response.ok) {
      const info = await response.json()
      return {
        size: info.CumulativeSize,
        blocks: info.NumLinks,
        hash: cid
      }
    }
  } catch (error) {
    console.log('获取文件信息失败:', error.message)
  }
  
  return null
} 

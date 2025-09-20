import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error('ErrorBoundary 捕获到错误:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return (
        <div className="warm-card rounded-2xl p-8 shadow-lg border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-red-800">出现错误</h2>
          </div>
          
          <div className="mb-4">
            <p className="text-red-700 mb-2">
              很抱歉，页面遇到了一些问题。请尝试刷新页面或联系技术支持。
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                  查看错误详情（开发模式）
                </summary>
                <div className="mt-2 p-3 bg-red-50 rounded border text-xs font-mono text-red-800 overflow-auto max-h-40">
                  <div className="font-bold mb-2">错误信息:</div>
                  <div className="mb-2">{this.state.error && this.state.error.toString()}</div>
                  
                  <div className="font-bold mb-2">错误堆栈:</div>
                  <div className="whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </div>
                </div>
              </details>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              重试
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 
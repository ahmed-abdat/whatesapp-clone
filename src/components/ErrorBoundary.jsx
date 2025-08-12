import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">خطأ في التطبيق</h2>
            <p className="text-gray-600 mb-6">
              حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة أو المحاولة مرة أخرى.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-whatsapp-primary hover:bg-whatsapp-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              إعادة تحميل الصفحة
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  تفاصيل الخطأ (للمطورين فقط)
                </summary>
                <pre className="bg-red-50 p-4 rounded text-xs text-red-700 overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
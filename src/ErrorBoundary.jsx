import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{ color: '#e74c3c' }}>⚠️ エラーが発生しました</h2>
          <p style={{ color: '#555', marginTop: 8 }}>以下のエラーを開発者に共有してください：</p>
          <pre style={{
            background: '#f8f9fa', border: '1px solid #dee2e6',
            borderRadius: 8, padding: 16, marginTop: 12,
            fontSize: 12, overflowX: 'auto', whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button
            style={{
              marginTop: 16, padding: '10px 20px', background: '#e74c3c',
              color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer'
            }}
            onClick={() => window.location.reload()}
          >
            再読み込み
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

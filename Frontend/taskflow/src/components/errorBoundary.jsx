import { Component } from 'react'
import './ErrorBoundary.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    })

    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            className="error-boundary-icon"
          >
            <rect
              x="18"
              y="22"
              width="64"
              height="18"
              rx="5"
              stroke="#7C3AED"
              strokeWidth="2.5"
              fill="none"
            />

            <rect
              x="18"
              y="46"
              width="64"
              height="18"
              rx="5"
              stroke="#7C3AED"
              strokeWidth="2.5"
              fill="none"
            />

            <rect
              x="18"
              y="70"
              width="64"
              height="18"
              rx="5"
              stroke="#7C3AED"
              strokeWidth="2.5"
              fill="none"
            />

            <circle
              cx="30"
              cy="31"
              r="3"
              fill="#16A34A"
            />

            <circle
              cx="30"
              cy="55"
              r="3"
              fill="#16A34A"
            />

            <circle
              cx="30"
              cy="79"
              r="3"
              fill="#EF4444"
            />

            <line
              x1="72"
              y1="72"
              x2="78"
              y2="78"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <line
              x1="78"
              y1="72"
              x2="72"
              y2="78"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <h2 className="error-boundary-title">
            Something went wrong
          </h2>

          <p className="error-boundary-message">
            {this.state.error?.message ||
              'An unexpected error occurred.'}
          </p>

          <button
            type="button"
            onClick={this.handleRetry}
            className="error-boundary-button"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
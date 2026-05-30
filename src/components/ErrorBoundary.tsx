import { Component, type ComponentChildren } from 'preact'
import { TroubleshootingPage } from '../pages/TroubleshootingPage'

interface ErrorBoundaryProps {
  children: ComponentChildren
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary] Uncaught error:', error)
    this.setState({ hasError: true })
  }

  render() {
    if (this.state.hasError) {
      return <TroubleshootingPage />
    }
    return this.props.children
  }
}

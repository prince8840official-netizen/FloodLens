import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent } from './Card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card variant="strong" className="p-6 text-center">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-flood-danger/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-flood-danger" />
            </div>
            <h3 className="text-lg font-semibold text-flood-text">Map Failed to Load</h3>
            <p className="text-flood-muted text-sm">
              The satellite map encountered an error. This may be due to network connectivity or tile service availability.
            </p>
            {this.state.error && (
              <details className="text-left text-xs text-flood-muted bg-flood-bg p-3 rounded">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap">{this.state.error.message}</pre>
              </details>
            )}
            <Button onClick={this.handleRetry} icon={<RefreshCw className="w-4 h-4" />}>
              Retry Loading Map
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
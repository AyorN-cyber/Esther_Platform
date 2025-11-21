import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    public render() {
        if (this.state.hasError) {
            // Ensure the initial loader is removed so the error is visible
            const loader = document.getElementById('app-loading');
            if (loader) {
                loader.style.display = 'none';
            }

            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '20px',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    <div style={{ maxWidth: '600px', width: '100%' }}>
                        <h1 style={{ color: '#a855f7', marginBottom: '20px' }}>Something went wrong</h1>
                        <div style={{
                            backgroundColor: '#1a0a2e',
                            border: '1px solid #a855f7',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '20px'
                        }}>
                            <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Error Details:</h2>
                            <pre style={{
                                backgroundColor: '#000',
                                padding: '15px',
                                borderRadius: '8px',
                                overflow: 'auto',
                                fontSize: '12px',
                                color: '#ff6b6b'
                            }}>
                                {this.state.error?.toString()}
                            </pre>
                            {this.state.errorInfo && (
                                <details style={{ marginTop: '15px' }}>
                                    <summary style={{ cursor: 'pointer', color: '#a855f7' }}>Stack Trace</summary>
                                    <pre style={{
                                        backgroundColor: '#000',
                                        padding: '15px',
                                        borderRadius: '8px',
                                        overflow: 'auto',
                                        fontSize: '11px',
                                        marginTop: '10px',
                                        color: '#888'
                                    }}>
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                backgroundColor: '#a855f7',
                                color: '#fff',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

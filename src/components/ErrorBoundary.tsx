import * as React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  componentStack?: string;
  errorStack?: string;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error);
    console.error("[ErrorBoundary] Component stack:", info.componentStack);

    this.setState({
      componentStack: info.componentStack,
      errorStack: error.stack,
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-12">
          <header className="mb-4">
            <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              We caught a runtime error and prevented the page from crashing. Please expand the details below and share a screenshot so we can investigate.
            </p>
          </header>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                You can try refreshing the page. If the issue persists, please share the error details with support.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </div>

            <details className="mt-4 rounded-md bg-muted/40 p-3">
              <summary className="cursor-pointer text-sm font-medium">Error Details</summary>
              {this.state.error?.message ? (
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-muted-foreground">
                  {this.state.error.message}
                </pre>
              ) : null}
              {this.state.componentStack ? (
                <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-muted-foreground">
                  {this.state.componentStack}
                </pre>
              ) : null}
              {this.state.errorStack ? (
                <pre className="mt-3 whitespace-pre-wrap break-words text-xs text-muted-foreground">
                  {this.state.errorStack}
                </pre>
              ) : null}
            </details>
          </div>
        </section>
      </main>
    );
  }
}

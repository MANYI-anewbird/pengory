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
    // Ensure we always get something useful in console even if the UI goes blank.
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
            <h1 className="text-2xl font-semibold tracking-tight">页面遇到错误</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              我们已经捕获到一次运行时异常（不会再白屏）。请展开下方“错误详情”并把截图发我，我就能精准定位修复。
            </p>
          </header>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                你可以先点击“刷新页面”重试；如果还能复现，再去做“全屏 → 新增任务 → Save”。
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                刷新页面
              </button>
            </div>

            <details className="mt-4 rounded-md bg-muted/40 p-3">
              <summary className="cursor-pointer text-sm font-medium">错误详情</summary>
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

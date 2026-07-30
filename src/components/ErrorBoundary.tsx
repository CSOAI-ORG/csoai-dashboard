"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            className="p-8 rounded-lg border text-center"
            style={{ borderColor: "var(--csoai-red)", background: "rgba(239,68,68,0.05)" }}
          >
            <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--csoai-red)" }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--csoai-muted)" }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 rounded text-sm"
              style={{ background: "var(--csoai-accent)", color: "white" }}
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

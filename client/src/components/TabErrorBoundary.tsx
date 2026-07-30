import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Lightweight error boundary scoped to a single dashboard tab.
 * Keeps one failing feature tab from white-screening the whole dashboard:
 * the surrounding chrome (sidebar, tab bar) stays usable and the user can retry.
 */
class TabErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold mb-2">This section couldn't load</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Something went wrong loading this tab. The rest of your dashboard is still available.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TabErrorBoundary;

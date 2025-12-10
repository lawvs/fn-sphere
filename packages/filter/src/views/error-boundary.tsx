import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onDelete?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleDelete = () => {
    this.props.onDelete?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback error={this.state.error} onDelete={this.handleDelete} />
      );
    }

    return this.props.children;
  }
}

export const ErrorFallback = ({
  error,
  onDelete,
}: {
  error: Error | null;
  onDelete?: () => void;
}) => {
  return (
    <div
      style={{
        padding: "8px 12px",
        border: "1px solid #e0e0e0",
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
        color: "#757575",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span>⚠️</span>
      <span style={{ flex: 1 }}>
        <strong style={{ marginRight: "4px" }}>
          {error?.name || "Error"}:
        </strong>
        {error?.message || "An error occurred"}
      </span>
      {onDelete && (
        <button
          onClick={onDelete}
          style={{
            padding: "2px 8px",
            backgroundColor: "transparent",
            color: "#757575",
            border: "1px solid #bdbdbd",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          Remove
        </button>
      )}
    </div>
  );
};

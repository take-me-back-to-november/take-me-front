import { Component, type ErrorInfo, type ReactNode } from "react";
import i18n from "@/i18n";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  private handleReload = () => {
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-container-margin">
        <Logo size="md" className="mb-lg" alt={i18n.t("common.logoAlt")} />
        <h1 className="text-headline-lg-mobile text-on-surface">{i18n.t("errorBoundary.title")}</h1>
        <p className="mt-sm max-w-content-sm text-center text-body-md text-on-surface-variant">
          {i18n.t("errorBoundary.description")}
        </p>
        <Button className="mt-xl" onClick={this.handleReload}>
          {i18n.t("errorBoundary.reload")}
        </Button>
      </div>
    );
  }
}

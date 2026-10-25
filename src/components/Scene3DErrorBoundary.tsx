"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; onFail: () => void };

/**
 * Any React Three Fiber or three.js failure falls back to the static poster
 * by unmounting the canvas and clearing `data-stage`.
 */
export class Scene3DErrorBoundary extends Component<Props> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

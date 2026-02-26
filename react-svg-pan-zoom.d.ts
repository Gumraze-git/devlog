declare module "react-svg-pan-zoom" {
  import * as React from "react";

  export const TOOL_PAN: "pan";
  export const POSITION_NONE: "none";

  export type AlignX = "left" | "center" | "right";
  export type AlignY = "top" | "center" | "bottom";

  export interface ViewerValue {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
    viewerWidth: number;
    viewerHeight: number;
    SVGMinX: number;
    SVGMinY: number;
    SVGWidth: number;
    SVGHeight: number;
    miniatureOpen: boolean;
    [key: string]: unknown;
  }

  export interface UncontrolledReactSVGPanZoomHandle {
    fitToViewer: (alignX?: AlignX, alignY?: AlignY) => void;
    zoomOnViewerCenter: (scaleFactor: number) => void;
  }

  export interface UncontrolledReactSVGPanZoomProps {
    width: number;
    height: number;
    children: React.ReactElement;
    defaultTool?: "none" | "pan" | "zoom-in" | "zoom-out";
    scaleFactor?: number;
    scaleFactorOnWheel?: number;
    scaleFactorMin?: number;
    scaleFactorMax?: number;
    detectWheel?: boolean;
    detectAutoPan?: boolean;
    detectPinchGesture?: boolean;
    preventPanOutside?: boolean;
    toolbarProps?: {
      position?: "none" | "top" | "right" | "bottom" | "left";
      SVGAlignX?: AlignX;
      SVGAlignY?: AlignY;
      activeToolColor?: string;
    };
    miniatureProps?: {
      position?: "none" | "left" | "right";
      background?: string;
      width?: number;
      height?: number;
    };
    customMiniature?: React.ComponentType<{
      value: ViewerValue;
      children?: React.ReactNode;
      background?: string;
      position?: "left" | "right";
      width?: number;
      height?: number;
    }>;
    onZoom?: (value: ViewerValue) => void;
    onPan?: (value: ViewerValue) => void;
    className?: string;
    style?: React.CSSProperties;
    SVGBackground?: string;
  }

  export const UncontrolledReactSVGPanZoom: React.ForwardRefExoticComponent<
    UncontrolledReactSVGPanZoomProps & React.RefAttributes<UncontrolledReactSVGPanZoomHandle>
  >;
}

import type { ViewerValue } from "react-svg-pan-zoom";

type MiniMapPosition = "left" | "right";

interface MermaidMiniMapProps {
  value: ViewerValue;
  svgDataUri: string;
  background?: string;
  position?: MiniMapPosition;
  width?: number;
  height?: number;
  scaleMultiplier?: number;
  svgMinX: number;
  svgMinY: number;
  svgWidth: number;
  svgHeight: number;
}

type Point = {
  x: number;
  y: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function invertViewerPoint(value: ViewerValue, viewerX: number, viewerY: number): Point | null {
  const { a, b, c, d, e, f } = value;
  const determinant = a * d - b * c;
  if (Math.abs(determinant) < 1e-9) return null;

  const dx = viewerX - e;
  const dy = viewerY - f;

  return {
    x: (d * dx - c * dy) / determinant,
    y: (-b * dx + a * dy) / determinant,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeViewportRect(
  value: ViewerValue,
  svgMinX: number,
  svgMinY: number,
  svgWidth: number,
  svgHeight: number,
  insetLocal: number,
): Rect | null {
  const topLeft = invertViewerPoint(value, 0, 0);
  const bottomRight = invertViewerPoint(value, value.viewerWidth, value.viewerHeight);
  if (!topLeft || !bottomRight) return null;

  const rawLeft = Math.min(topLeft.x, bottomRight.x);
  const rawTop = Math.min(topLeft.y, bottomRight.y);
  const rawRight = Math.max(topLeft.x, bottomRight.x);
  const rawBottom = Math.max(topLeft.y, bottomRight.y);

  const minX = svgMinX;
  const minY = svgMinY;
  const maxX = svgMinX + svgWidth;
  const maxY = svgMinY + svgHeight;

  const left = clamp(rawLeft, minX, maxX);
  const top = clamp(rawTop, minY, maxY);
  const right = clamp(rawRight, minX, maxX);
  const bottom = clamp(rawBottom, minY, maxY);

  const localLeft = left - minX;
  const localTop = top - minY;
  const localRight = right - minX;
  const localBottom = bottom - minY;

  const safeInsetX = clamp(insetLocal, 0, svgWidth / 2);
  const safeInsetY = clamp(insetLocal, 0, svgHeight / 2);

  const clampedLeft = clamp(localLeft, safeInsetX, svgWidth - safeInsetX);
  const clampedTop = clamp(localTop, safeInsetY, svgHeight - safeInsetY);
  const clampedRight = clamp(localRight, safeInsetX, svgWidth - safeInsetX);
  const clampedBottom = clamp(localBottom, safeInsetY, svgHeight - safeInsetY);

  const width = Math.max(0, clampedRight - clampedLeft);
  const height = Math.max(0, clampedBottom - clampedTop);
  if (width === 0 || height === 0) return null;

  return {
    x: clampedLeft,
    y: clampedTop,
    width,
    height,
  };
}

export default function MermaidMiniMap({
  value,
  svgDataUri,
  background = "transparent",
  position = "left",
  width = 220,
  height = 140,
  scaleMultiplier = 1,
  svgMinX,
  svgMinY,
  svgWidth,
  svgHeight,
}: MermaidMiniMapProps) {
  const zoomToFit = Math.min(width / svgWidth, height / svgHeight);
  const safeMultiplier = Number.isFinite(scaleMultiplier) && scaleMultiplier > 0 ? scaleMultiplier : 1;
  const effectiveScale = zoomToFit * safeMultiplier;
  const offsetX = (width - svgWidth * effectiveScale) / 2;
  const offsetY = (height - svgHeight * effectiveScale) / 2;
  const insetLocal = effectiveScale > 0 ? 1.5 / effectiveScale : 0;

  const viewportRect = computeViewportRect(value, svgMinX, svgMinY, svgWidth, svgHeight, insetLocal);

  return (
    <div
      className={`mermaid-minimap mermaid-minimap--${position}`}
      style={{
        width,
        height,
        background,
      }}
      aria-hidden="true"
    >
      <svg width={width} height={height}>
        <g transform={`translate(${offsetX} ${offsetY}) scale(${effectiveScale})`}>
          <image
            href={svgDataUri}
            x={0}
            y={0}
            width={svgWidth}
            height={svgHeight}
            preserveAspectRatio="xMidYMid meet"
          />
          {viewportRect && (
            <rect
              className="mermaid-minimap__viewport"
              x={viewportRect.x}
              y={viewportRect.y}
              width={viewportRect.width}
              height={viewportRect.height}
            />
          )}
        </g>
      </svg>
    </div>
  );
}

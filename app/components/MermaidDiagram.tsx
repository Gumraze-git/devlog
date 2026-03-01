"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useTheme } from "next-themes";
import mermaid from "mermaid";
import { X } from "lucide-react";
import {
  POSITION_NONE,
  TOOL_PAN,
  UncontrolledReactSVGPanZoom,
  type UncontrolledReactSVGPanZoomHandle,
  type ViewerValue,
} from "react-svg-pan-zoom";
import MermaidMiniMap from "./MermaidMiniMap";

export interface MermaidDiagramProps {
  code: string;
  className?: string;
  caption?: string;
}

type MermaidThemeMode = "light" | "dark";

type MermaidSvgMeta = {
  minX: number;
  minY: number;
  width: number;
  height: number;
  viewBox: string;
  rootId?: string;
  className?: string;
  style?: string;
  preserveAspectRatio?: string;
  innerMarkup: string;
  fullSvg: string;
};

type ViewerScaleState = {
  fitScale: number;
  currentScale: number;
};

const ZOOM_STEP_FACTOR = 1.2;
const MIN_RELATIVE_SCALE = 0.2;
const MAX_RELATIVE_SCALE = 8;
const MINIMAP_SCALE_MULTIPLIER = 0.7;
const DEFAULT_VIEWER_SCALE: ViewerScaleState = { fitScale: 1, currentScale: 1 };

let initializedTheme: MermaidThemeMode | null = null;

function getThemeVariables(mode: MermaidThemeMode) {
  if (mode === "dark") {
    return {
      primaryColor: "#1e293b",
      primaryTextColor: "#e2e8f0",
      primaryBorderColor: "#60a5fa",
      lineColor: "#94a3b8",
      secondaryColor: "#0f172a",
      tertiaryColor: "#020617",
      edgeLabelBackground: "#1e293b",
      mainBkg: "transparent",
    };
  }

  return {
    primaryColor: "#3b82f6",
    primaryTextColor: "#ffffff",
    primaryBorderColor: "#1d4ed8",
    lineColor: "#94a3b8",
    secondaryColor: "#f1f5f9",
    tertiaryColor: "#ffffff",
    edgeLabelBackground: "#ffffff",
    mainBkg: "transparent",
  };
}

function ensureMermaidInitialized(mode: MermaidThemeMode) {
  if (initializedTheme === mode) return;

  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: getThemeVariables(mode),
    securityLevel: "loose",
    htmlLabels: false,
  });

  initializedTheme = mode;
}

function parseLengthAttribute(value: string | null): number | null {
  if (!value) return null;
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return numeric;
}

function parseMermaidSvg(svgMarkup: string): MermaidSvgMeta | null {
  if (typeof DOMParser === "undefined") return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
  const svgElement = doc.querySelector("svg");
  if (!svgElement) return null;

  let minX = 0;
  let minY = 0;
  let width = 0;
  let height = 0;

  const viewBox = svgElement.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox
      .trim()
      .split(/[\s,]+/)
      .map((token) => Number.parseFloat(token));

    if (parts.length === 4 && parts.every((num) => Number.isFinite(num))) {
      minX = parts[0];
      minY = parts[1];
      width = parts[2];
      height = parts[3];
    }
  }

  if (width <= 0 || height <= 0) {
    const widthAttr = parseLengthAttribute(svgElement.getAttribute("width"));
    const heightAttr = parseLengthAttribute(svgElement.getAttribute("height"));

    if (!widthAttr || !heightAttr) return null;

    width = widthAttr;
    height = heightAttr;
    minX = 0;
    minY = 0;
  }

  return {
    minX,
    minY,
    width,
    height,
    viewBox: `${minX} ${minY} ${width} ${height}`,
    rootId: svgElement.getAttribute("id") ?? undefined,
    className: svgElement.getAttribute("class") ?? undefined,
    style: svgElement.getAttribute("style") ?? undefined,
    preserveAspectRatio: svgElement.getAttribute("preserveAspectRatio") ?? undefined,
    innerMarkup: svgElement.innerHTML,
    fullSvg: svgElement.outerHTML,
  };
}

function escapeCssId(value: string): string {
  return value.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}

function injectScopedEdgeLabelStyle(
  svgMarkup: string,
  rootId: string,
  themeVars: ReturnType<typeof getThemeVariables>,
): string {
  const escapedRootId = escapeCssId(rootId);
  const scope = `#${escapedRootId}`;
  const injectedStyle = `<style>
    ${scope} .edgeLabel rect, ${scope} .edge-thickness-normal rect, ${scope} .edge-thickness-thick rect, ${scope} .edge-thickness-invisible rect {
      fill: ${themeVars.edgeLabelBackground} !important;
      stroke: none !important;
    }
    ${scope} .edgeLabel text, ${scope} .edgeLabel tspan {
      fill: ${themeVars.primaryTextColor} !important;
      color: ${themeVars.primaryTextColor} !important;
    }
  </style>`;

  const svgTagEnd = svgMarkup.indexOf(">");
  if (svgTagEnd === -1) return svgMarkup;
  return svgMarkup.slice(0, svgTagEnd + 1) + injectedStyle + svgMarkup.slice(svgTagEnd + 1);
}

function parseInlineStyle(styleText?: string): CSSProperties | undefined {
  if (!styleText) return undefined;

  const styleObject: Record<string, string> = {};
  const declarations = styleText.split(";").map((part) => part.trim()).filter(Boolean);

  for (const declaration of declarations) {
    const separatorIndex = declaration.indexOf(":");
    if (separatorIndex <= 0) continue;

    const rawProperty = declaration.slice(0, separatorIndex).trim();
    const rawValue = declaration.slice(separatorIndex + 1).trim();
    if (!rawProperty || !rawValue) continue;

    const camelProperty = rawProperty.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    styleObject[camelProperty] = rawValue;
  }

  return Object.keys(styleObject).length > 0
    ? (styleObject as CSSProperties)
    : undefined;
}

function toSvgDataUri(svgMarkup: string): string {
  if (typeof window === "undefined") {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;
  }

  try {
    const bytes = new TextEncoder().encode(svgMarkup);
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return `data:image/svg+xml;base64,${window.btoa(binary)}`;
  } catch {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;
  }
}

export default function MermaidDiagram({ code, className, caption }: MermaidDiagramProps) {
  const { resolvedTheme } = useTheme();

  const [inlineSvg, setInlineSvg] = useState("");
  const [inlineMeta, setInlineMeta] = useState<MermaidSvgMeta | null>(null);
  const [modalSvg, setModalSvg] = useState("");
  const [modalMeta, setModalMeta] = useState<MermaidSvgMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFitReady, setIsFitReady] = useState(false);

  const [viewerSize, setViewerSize] = useState({ width: 0, height: 0 });
  const [viewerScale, setViewerScale] = useState<ViewerScaleState>(DEFAULT_VIEWER_SCALE);

  const viewerRef = useRef<UncontrolledReactSVGPanZoomHandle | null>(null);
  const viewerHostRef = useRef<HTMLDivElement>(null);
  const pendingFitSyncRef = useRef(false);

  const normalizedCode = useMemo(() => code.trim(), [code]);
  const isCodeEmpty = normalizedCode.length === 0;
  const captionText = caption?.trim() || "Mermaid Diagram";

  const effectiveError = isCodeEmpty ? "비어 있는 Mermaid 코드입니다." : error;
  const hasRenderableInlineMarkup = Boolean(inlineMeta?.innerMarkup?.trim());
  const inlineMarkupError = inlineMeta && !hasRenderableInlineMarkup ? "Mermaid SVG 콘텐츠가 비어 있습니다." : null;
  const inlineError = effectiveError ?? inlineMarkupError;
  const isLoading = !inlineError && inlineSvg.length === 0;
  const hasRenderableInnerMarkup = Boolean(modalMeta?.innerMarkup?.trim());
  const hasRenderableFullSvg = modalSvg.length > 0 && Boolean(modalMeta?.fullSvg?.trim());
  const emptyMarkupError = modalMeta && (!hasRenderableInnerMarkup || !hasRenderableFullSvg)
    ? "Mermaid SVG 콘텐츠가 비어 있습니다."
    : null;
  const modalError = effectiveError ?? emptyMarkupError;
  const modalSvgStyle = useMemo(() => parseInlineStyle(modalMeta?.style), [modalMeta]);
  const modalMiniMapDataUri = useMemo(
    () => (modalMeta?.fullSvg ? toSvgDataUri(modalMeta.fullSvg) : ""),
    [modalMeta],
  );

  const relativeScale = viewerScale.fitScale > 0
    ? viewerScale.currentScale / viewerScale.fitScale
    : 1;
  const zoomPercent = Math.round(relativeScale * 100);
  const zoomOutDisabled = relativeScale <= MIN_RELATIVE_SCALE + 0.001;
  const zoomInDisabled = relativeScale >= MAX_RELATIVE_SCALE - 0.001;

  const closeModal = useCallback(() => {
    pendingFitSyncRef.current = false;
    setIsFitReady(false);
    setIsModalOpen(false);
  }, []);

  const openModal = useCallback(() => {
    pendingFitSyncRef.current = false;
    setIsFitReady(false);
    setViewerScale(DEFAULT_VIEWER_SCALE);
    setIsModalOpen(true);
  }, []);

  const handleInlineKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal();
      }
    },
    [openModal],
  );

  const fitToViewerAndSync = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return false;

    pendingFitSyncRef.current = true;
    viewer.fitToViewer("center", "center");

    window.requestAnimationFrame(() => {
      if (!pendingFitSyncRef.current) return;
      pendingFitSyncRef.current = false;
      setIsFitReady(true);
    });

    return true;
  }, []);

  const handleZoomIn = useCallback(() => {
    if (zoomInDisabled) return;

    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.zoomOnViewerCenter(ZOOM_STEP_FACTOR);
  }, [zoomInDisabled]);

  const handleZoomOut = useCallback(() => {
    if (zoomOutDisabled) return;

    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.zoomOnViewerCenter(1 / ZOOM_STEP_FACTOR);
  }, [zoomOutDisabled]);

  const handleReset = useCallback(() => {
    setIsFitReady(false);
    fitToViewerAndSync();
  }, [fitToViewerAndSync]);

  const handleViewerInteraction = useCallback((value: ViewerValue) => {
    if (typeof value.d !== "number") return;

    if (pendingFitSyncRef.current) {
      pendingFitSyncRef.current = false;
      setViewerScale({ fitScale: value.d, currentScale: value.d });
      setIsFitReady(true);
      return;
    }

    setViewerScale((prev) => ({ ...prev, currentScale: value.d }));
  }, []);

  const customMiniature = useMemo(() => {
    if (!modalMeta || !modalMiniMapDataUri) return undefined;

    return function CustomMiniature(props: {
      value: ViewerValue;
      children?: React.ReactNode;
      background?: string;
      position?: "left" | "right";
      width?: number;
      height?: number;
    }) {
      return (
        <MermaidMiniMap
          {...props}
          background="transparent"
          scaleMultiplier={MINIMAP_SCALE_MULTIPLIER}
          svgDataUri={modalMiniMapDataUri}
          svgMinX={modalMeta.minX}
          svgMinY={modalMeta.minY}
          svgWidth={modalMeta.width}
          svgHeight={modalMeta.height}
        />
      );
    };
  }, [modalMeta, modalMiniMapDataUri]);

  useEffect(() => {
    const themeMode: MermaidThemeMode = resolvedTheme === "dark" ? "dark" : "light";
    let cancelled = false;

    const renderVariant = async (prefix: "inline" | "modal") => {
      const renderId = `mermaid-${prefix}-${Math.random().toString(36).slice(2, 10)}`;
      const result = await mermaid.render(renderId, normalizedCode);

      const initialParsed = parseMermaidSvg(result.svg);
      if (!initialParsed) {
        throw new Error("Mermaid SVG 파싱에 실패했습니다.");
      }

      const scopedRootId = initialParsed.rootId ?? renderId;
      const modifiedSvg = injectScopedEdgeLabelStyle(result.svg, scopedRootId, getThemeVariables(themeMode));
      const parsed = parseMermaidSvg(modifiedSvg);
      if (!parsed) {
        throw new Error("Mermaid SVG 파싱에 실패했습니다.");
      }

      return { svg: modifiedSvg, meta: parsed };
    };

    const renderDiagram = async () => {
      if (isCodeEmpty) {
        if (cancelled) return;
        setInlineSvg("");
        setInlineMeta(null);
        setModalSvg("");
        setModalMeta(null);
        setError("비어 있는 Mermaid 코드입니다.");
        return;
      }

      try {
        ensureMermaidInitialized(themeMode);
        const [inlineResult, modalResult] = await Promise.all([
          renderVariant("inline"),
          renderVariant("modal"),
        ]);

        if (cancelled) return;

        setInlineSvg(inlineResult.svg);
        setInlineMeta(inlineResult.meta);
        setModalSvg(modalResult.svg);
        setModalMeta(modalResult.meta);
        setError(null);
      } catch (renderError) {
        if (cancelled) return;

        setInlineSvg("");
        setInlineMeta(null);
        setModalSvg("");
        setModalMeta(null);
        setError(renderError instanceof Error ? renderError.message : "Mermaid 렌더링 중 오류가 발생했습니다.");
      }
    };

    void renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [isCodeEmpty, normalizedCode, resolvedTheme]);

  useEffect(() => {
    if (!isModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeModal, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;

    const host = viewerHostRef.current;
    if (!host || typeof ResizeObserver === "undefined") return;

    let frameId = 0;

    const updateSize = () => {
      const width = Math.max(1, Math.floor(host.clientWidth));
      const height = Math.max(1, Math.floor(host.clientHeight));

      setViewerSize((prev) => {
        if (prev.width === width && prev.height === height) return prev;
        return { width, height };
      });
    };

    const observer = new ResizeObserver(() => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateSize);
    });

    observer.observe(host);
    frameId = window.requestAnimationFrame(updateSize);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen || !modalMeta) return;
    if (viewerSize.width <= 0 || viewerSize.height <= 0) return;

    let frameId = 0;
    let fallbackFrameId = 0;

    frameId = window.requestAnimationFrame(() => {
      const fitted = fitToViewerAndSync();
      if (!fitted) {
        fallbackFrameId = window.requestAnimationFrame(() => {
          fitToViewerAndSync();
        });
      }
    });

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      if (fallbackFrameId) window.cancelAnimationFrame(fallbackFrameId);
    };
  }, [fitToViewerAndSync, isModalOpen, modalMeta, viewerSize.height, viewerSize.width]);

  useEffect(() => {
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isModalOpen]);

  const renderFallback = (withBorder: boolean, message?: string | null) => (
    <div className={`mermaid-diagram__fallback ${withBorder ? "mermaid-diagram__fallback--bordered" : ""}`}>
      <p className="mermaid-diagram__fallback-title">Mermaid 다이어그램 렌더링에 실패했습니다.</p>
      {(message ?? effectiveError) && <p className="mermaid-diagram__fallback-error">{message ?? effectiveError}</p>}
      <pre className="mermaid-diagram__fallback-code">
        <code>{normalizedCode}</code>
      </pre>
    </div>
  );

  return (
    <>
      <div className={`mermaid-diagram not-prose ${className ?? ""}`}>
        <div
          role="button"
          tabIndex={0}
          aria-label={`${captionText} 확대 보기`}
          onClick={openModal}
          onKeyDown={handleInlineKeyDown}
          className="mermaid-diagram__interactive"
        >
          <div className="mermaid-diagram__surface">
            {isLoading && <p className="mermaid-diagram__loading">Rendering Mermaid diagram...</p>}
            {!isLoading && inlineError && renderFallback(false, inlineError)}
            {!isLoading && !inlineError && (
              <div
                className="mermaid-diagram__svg"
                dangerouslySetInnerHTML={{ __html: inlineSvg }}
              />
            )}
          </div>
          {!inlineError && (
            <p className="mermaid-diagram__hint" aria-hidden>
              클릭하여 확대 보기
            </p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="mermaid-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 py-4" onClick={closeModal}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mermaid-modal-title"
            className="mermaid-modal relative flex h-[96vh] w-[90vw] max-w-none flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mermaid-modal__header flex items-center gap-3 border-b border-[var(--border)] bg-[var(--card-subtle)] px-4 py-3 md:px-5">
              <p id="mermaid-modal-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
                {captionText}
              </p>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomOutDisabled}
                  className="mermaid-modal__control"
                  aria-label="축소"
                >
                  -
                </button>
                <span className="mermaid-modal__zoom text-xs font-semibold text-[var(--text-muted)]">{zoomPercent}%</span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomInDisabled}
                  className="mermaid-modal__control"
                  aria-label="확대"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mermaid-modal__control mermaid-modal__control--reset"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mermaid-modal__control"
                  aria-label="닫기"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="mermaid-modal__viewport flex-1 overflow-hidden p-4 md:p-6">
              {modalError && renderFallback(true, modalError)}
              {!modalError && modalMeta && (
                <div ref={viewerHostRef} className="mermaid-modal__viewer-host">
                  {!isFitReady && (
                    <p className="mermaid-modal__loading text-sm text-[var(--text-soft)]">다이어그램 맞춤 배율 계산 중...</p>
                  )}

                  {viewerSize.width > 0 && viewerSize.height > 0 && (
                    <UncontrolledReactSVGPanZoom
                      ref={viewerRef}
                      width={viewerSize.width}
                      height={viewerSize.height}
                      defaultTool={TOOL_PAN}
                      scaleFactor={ZOOM_STEP_FACTOR}
                      scaleFactorOnWheel={1.06}
                      scaleFactorMin={0.05}
                      scaleFactorMax={40}
                      detectAutoPan={false}
                      toolbarProps={{ position: POSITION_NONE }}
                      miniatureProps={{ position: "left", width: 220, height: 140, background: "transparent" }}
                      customMiniature={customMiniature}
                      onZoom={handleViewerInteraction}
                      onPan={handleViewerInteraction}
                      SVGBackground="transparent"
                      className="mermaid-modal__viewer"
                    >
                      <svg
                        viewBox={modalMeta.viewBox}
                        width={modalMeta.width}
                        height={modalMeta.height}
                        preserveAspectRatio={modalMeta.preserveAspectRatio}
                      >
                        <g
                          id={modalMeta.rootId}
                          className={modalMeta.className}
                          style={modalSvgStyle}
                          dangerouslySetInnerHTML={{ __html: modalMeta.innerMarkup }}
                        />
                      </svg>
                    </UncontrolledReactSVGPanZoom>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

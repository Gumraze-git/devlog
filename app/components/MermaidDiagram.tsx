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

export interface MermaidDiagramProps {
  code: string;
  className?: string;
  caption?: string;
}

type MermaidThemeMode = "light" | "dark";

type MermaidSemanticToken = {
  fill: string;
  border: string;
  text: string;
};

type MermaidSemanticPalette = {
  success: MermaidSemanticToken;
  warning: MermaidSemanticToken;
  danger: MermaidSemanticToken;
  info: MermaidSemanticToken;
};

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
  currentScale: number;
};

const ZOOM_STEP_FACTOR = 1.2;
const MIN_RELATIVE_SCALE = 0.5;
const MAX_RELATIVE_SCALE = 1.5;
const DEFAULT_VIEWER_SCALE: ViewerScaleState = { currentScale: 1 };

let initializedTheme: MermaidThemeMode | null = null;

function getThemeVariables(mode: MermaidThemeMode) {
  if (mode === "dark") {
    return {
      // Dark theme defaults tuned for edge-label and node contrast.
      darkMode: true,
      primaryColor: "#1b2b40",
      primaryTextColor: "#e2e8f0",
      textColor: "#e2e8f0",
      nodeTextColor: "#e2e8f0",
      primaryBorderColor: "#93b4db",
      nodeBorder: "#93b4db",
      lineColor: "#93b4db",
      secondaryColor: "#152238",
      tertiaryColor: "#233349",
      edgeLabelBackground: "#233349",
      mainBkg: "#1b2b40",
      rowEven: "#ffffff",
      rowOdd: "#f8fafc",
    };
  }

  return {
    darkMode: false,
    primaryColor: "#eef2f7",
    primaryTextColor: "#0f172a",
    textColor: "#0f172a",
    nodeTextColor: "#0f172a",
    primaryBorderColor: "#475569",
    nodeBorder: "#475569",
    lineColor: "#475569",
    secondaryColor: "#f8fafc",
    tertiaryColor: "#dbe4f0",
    edgeLabelBackground: "#dbe4f0",
    mainBkg: "#eef2f7",
    rowEven: "#ffffff",
    rowOdd: "#f8fafc",
  };
}

function getSemanticPalette(mode: MermaidThemeMode): MermaidSemanticPalette {
  if (mode === "dark") {
    return {
      success: {
        fill: "#113828",
        border: "#3dd68c",
        text: "#d7ffe8",
      },
      warning: {
        fill: "#3a2a08",
        border: "#ffca16",
        text: "#fff1c2",
      },
      danger: {
        fill: "#43161a",
        border: "#ff9592",
        text: "#ffe4e2",
      },
      info: {
        fill: "#0f2a45",
        border: "#70b8ff",
        text: "#deefff",
      },
    };
  }

  return {
    success: {
      fill: "#e7f8ef",
      border: "#1f7a4f",
      text: "#0f2e1f",
    },
    warning: {
      fill: "#fff5e6",
      border: "#9a5a00",
      text: "#402605",
    },
    danger: {
      fill: "#fdecec",
      border: "#b4232c",
      text: "#4c0f15",
    },
    info: {
      fill: "#e8f3ff",
      border: "#0b67b2",
      text: "#0c2a45",
    },
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
  semanticPalette: MermaidSemanticPalette,
): string {
  const escapedRootId = escapeCssId(rootId);
  const scope = `#${escapedRootId}`;
  const textColor = themeVars.nodeTextColor ?? themeVars.textColor ?? themeVars.primaryTextColor;
  const borderColor = themeVars.nodeBorder ?? themeVars.primaryBorderColor ?? themeVars.lineColor ?? textColor;
  const diagramFill = themeVars.mainBkg ?? themeVars.primaryColor ?? "transparent";
  const edgeLabelFill = themeVars.edgeLabelBackground ?? themeVars.tertiaryColor ?? diagramFill;
  const relationLabelFill = themeVars.tertiaryColor ?? edgeLabelFill;
  const attributeRowTextColor = themeVars.darkMode ? "#0f172a" : textColor;

  const injectedStyle = `<style>
    ${scope} .edgeLabel rect, ${scope} .edge-thickness-normal rect, ${scope} .edge-thickness-thick rect, ${scope} .edge-thickness-invisible rect {
      fill: ${edgeLabelFill} !important;
      stroke: none !important;
    }
    ${scope} .edgeLabel text, ${scope} .edgeLabel tspan {
      fill: ${textColor} !important;
      color: ${textColor} !important;
    }
    ${scope} .entityBox {
      fill: ${diagramFill} !important;
      stroke: ${borderColor} !important;
    }
    ${scope} .relationshipLabelBox,
    ${scope} .labelBkg {
      fill: ${relationLabelFill} !important;
      background-color: ${relationLabelFill} !important;
      opacity: 1 !important;
    }
    ${scope} .relationshipLine,
    ${scope} .marker {
      stroke: ${borderColor} !important;
      stroke-width: 1.5 !important;
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
    }
    ${scope} .er .label,
    ${scope} .relationshipLabel,
    ${scope} .relationshipLabel tspan {
      fill: ${textColor} !important;
      color: ${textColor} !important;
    }
    ${scope} .attribute-type,
    ${scope} .attribute-type text,
    ${scope} .attribute-type tspan,
    ${scope} .attribute-name,
    ${scope} .attribute-name text,
    ${scope} .attribute-name tspan,
    ${scope} .attribute-keys,
    ${scope} .attribute-keys text,
    ${scope} .attribute-keys tspan,
    ${scope} .attribute-comment,
    ${scope} .attribute-comment text,
    ${scope} .attribute-comment tspan {
      fill: ${attributeRowTextColor} !important;
      color: ${attributeRowTextColor} !important;
    }
    ${scope} .sem-success rect, ${scope} .sem-success circle, ${scope} .sem-success ellipse, ${scope} .sem-success polygon, ${scope} .sem-success path {
      fill: ${semanticPalette.success.fill} !important;
      stroke: ${semanticPalette.success.border} !important;
      stroke-width: 2px !important;
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
    }
    ${scope} .sem-success text, ${scope} .sem-success tspan {
      fill: ${semanticPalette.success.text} !important;
      color: ${semanticPalette.success.text} !important;
    }
    ${scope} .sem-warning rect, ${scope} .sem-warning circle, ${scope} .sem-warning ellipse, ${scope} .sem-warning polygon, ${scope} .sem-warning path {
      fill: ${semanticPalette.warning.fill} !important;
      stroke: ${semanticPalette.warning.border} !important;
      stroke-width: 2px !important;
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
    }
    ${scope} .sem-warning text, ${scope} .sem-warning tspan {
      fill: ${semanticPalette.warning.text} !important;
      color: ${semanticPalette.warning.text} !important;
    }
    ${scope} .sem-danger rect, ${scope} .sem-danger circle, ${scope} .sem-danger ellipse, ${scope} .sem-danger polygon, ${scope} .sem-danger path {
      fill: ${semanticPalette.danger.fill} !important;
      stroke: ${semanticPalette.danger.border} !important;
      stroke-width: 2px !important;
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
    }
    ${scope} .sem-danger text, ${scope} .sem-danger tspan {
      fill: ${semanticPalette.danger.text} !important;
      color: ${semanticPalette.danger.text} !important;
    }
    ${scope} .sem-info rect, ${scope} .sem-info circle, ${scope} .sem-info ellipse, ${scope} .sem-info polygon, ${scope} .sem-info path {
      fill: ${semanticPalette.info.fill} !important;
      stroke: ${semanticPalette.info.border} !important;
      stroke-width: 2px !important;
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
    }
    ${scope} .sem-info text, ${scope} .sem-info tspan {
      fill: ${semanticPalette.info.text} !important;
      color: ${semanticPalette.info.text} !important;
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
  const clampGuardRef = useRef(false);

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
  const viewerCanvasBackground = resolvedTheme === "dark" ? "#0f172a" : "#ffffff";

  const computedFitScale = useMemo(() => {
    if (!modalMeta) return 1;
    if (viewerSize.width <= 0 || viewerSize.height <= 0) return 1;
    if (modalMeta.width <= 0 || modalMeta.height <= 0) return 1;

    const widthScale = viewerSize.width / modalMeta.width;
    const heightScale = viewerSize.height / modalMeta.height;
    const fitScale = Math.min(widthScale, heightScale);

    return Number.isFinite(fitScale) && fitScale > 0 ? fitScale : 1;
  }, [modalMeta, viewerSize.height, viewerSize.width]);

  const absoluteMinScale = Math.max(0.0001, computedFitScale * MIN_RELATIVE_SCALE);
  const absoluteMaxScale = Math.max(absoluteMinScale + 0.0001, computedFitScale * MAX_RELATIVE_SCALE);

  const relativeScale = computedFitScale > 0
    ? viewerScale.currentScale / computedFitScale
    : 1;
  const zoomPercent = Math.round(relativeScale * 100);
  const zoomOutDisabled = relativeScale <= MIN_RELATIVE_SCALE + 0.001;
  const zoomInDisabled = relativeScale >= MAX_RELATIVE_SCALE - 0.001;

  const closeModal = useCallback(() => {
    clampGuardRef.current = false;
    pendingFitSyncRef.current = false;
    setIsFitReady(false);
    setIsModalOpen(false);
  }, []);

  const openModal = useCallback(() => {
    clampGuardRef.current = false;
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

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      closeModal();
    },
    [closeModal],
  );

  const handleViewerInteraction = useCallback((value: ViewerValue) => {
    if (typeof value.d !== "number") return;

    if (clampGuardRef.current) {
      clampGuardRef.current = false;

      setViewerScale({ currentScale: value.d });
      if (pendingFitSyncRef.current) {
        pendingFitSyncRef.current = false;
        setIsFitReady(true);
      }
      return;
    }

    const clampedScale = Math.min(absoluteMaxScale, Math.max(absoluteMinScale, value.d));

    if (Math.abs(clampedScale - value.d) > 0.0005) {
      const viewer = viewerRef.current;
      if (viewer && value.d > 0) {
        clampGuardRef.current = true;
        viewer.zoomOnViewerCenter(clampedScale / value.d);
      }
      setViewerScale({ currentScale: clampedScale });
      return;
    }

    if (pendingFitSyncRef.current) {
      pendingFitSyncRef.current = false;
      setViewerScale({ currentScale: value.d });
      setIsFitReady(true);
      return;
    }

    setViewerScale({ currentScale: value.d });
  }, [absoluteMaxScale, absoluteMinScale]);

  useEffect(() => {
    const themeMode: MermaidThemeMode = resolvedTheme === "dark" ? "dark" : "light";
    const semanticPalette = getSemanticPalette(themeMode);
    let cancelled = false;

    const renderVariant = async (prefix: "inline" | "modal") => {
      const renderId = `mermaid-${prefix}-${Math.random().toString(36).slice(2, 10)}`;
      const result = await mermaid.render(renderId, normalizedCode);

      const initialParsed = parseMermaidSvg(result.svg);
      if (!initialParsed) {
        throw new Error("Mermaid SVG 파싱에 실패했습니다.");
      }

      const scopedRootId = initialParsed.rootId ?? renderId;
      const modifiedSvg = injectScopedEdgeLabelStyle(
        result.svg,
        scopedRootId,
        getThemeVariables(themeMode),
        semanticPalette,
      );
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
        <div
          className="mermaid-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 py-4"
          onClick={handleOverlayClick}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mermaid-modal-title"
            className="mermaid-modal relative flex h-[96vh] w-[80vw] max-w-none flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
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
                      scaleFactorMin={absoluteMinScale}
                      scaleFactorMax={absoluteMaxScale}
                      detectAutoPan={false}
                      toolbarProps={{ position: POSITION_NONE }}
                      miniatureProps={{ position: POSITION_NONE }}
                      onZoom={handleViewerInteraction}
                      onPan={handleViewerInteraction}
                      background={viewerCanvasBackground}
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

import type { Metadata } from "next";
import { Suspense } from "react";

import { PageIntro } from "../components/common/PageIntro";
import { createPageMetadata } from "../lib/metadata";
import { DevlogListSkeleton } from "./DevlogListSkeleton";
import { DevlogPageContent } from "./DevlogPageContent";

export const revalidate = 1800;

export const metadata: Metadata = createPageMetadata({
  title: "Devlog",
  description: "내 사이트를 원문으로 제공하는 개발 기록과 태그별 분류를 모아둔 Devlog 목록입니다.",
  path: "/devlog",
});

export default function DevlogListPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <PageIntro eyebrow="Devlog" title="Experience to Knowledge" />

      <Suspense fallback={<DevlogListSkeleton />}>
        <DevlogPageContent />
      </Suspense>
    </div>
  );
}

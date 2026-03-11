import Image from "next/image";

import { PageIntro } from "../components/common/PageIntro";

export function AboutHeroSection() {
  return (
    <section className="grid items-start gap-10 md:grid-cols-[1fr_auto]">
      <PageIntro
        className="order-2 space-y-6 md:order-1"
        title={<>Documentation - driven <span className="text-[var(--accent)]">Developer</span></>}
        description="기술의 원리를 깊이 있게 이해하고 기록하며, 동료들과 지식을 나누는 과정을 통해 함께 성장하는 것을 즐깁니다."
      />

      <div className="order-1 mt-4 flex flex-col items-center gap-4 md:order-2 md:items-end">
        <div className="relative h-56 w-56 overflow-hidden rounded-2xl border border-[var(--border)] grayscale shadow-sm md:h-64 md:w-64">
          <Image
            src="https://htmacgfeigx1pttr.public.blob.vercel-storage.com/image/me.png"
            alt="Daehwan Kim"
            fill
            sizes="(max-width: 768px) 224px, 256px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}

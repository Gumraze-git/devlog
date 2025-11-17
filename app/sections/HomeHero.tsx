"use client";

import { Download } from "lucide-react";
import Typewriter from "typewriter-effect";

import CTAButton from "../components/ui/CTAButton";

const CTA_LINK = "/resume.pdf";

export default function HomeHero() {
  return (
    <section id="home" className="scroll-mt-40 py-20">
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <div className="absolute inset-x-0 -top-12 flex justify-center gap-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
          <span className="rounded-full border border-slate-200 px-4 py-1 shadow-sm">DKim&apos;s Devlog</span>
          <span className="rounded-full border border-slate-200 px-4 py-1 shadow-sm">Portfolio</span>
        </div>

        <div className="pt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            안녕하세요, 저는
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            <Typewriter
              options={{
                strings: ["백엔드 개발자", "읽기를 좋아하는 사람", "운동을 좋아하는 사람"],
                autoStart: true,
                loop: true,
              }}
            />
            <br />
            <span className="mt-2 inline-block text-emerald-600">김대환</span>입니다.
          </h1>
          <p className="mt-6 text-base text-slate-600 md:text-lg">
            Next.js와 TypeScript를 기반으로 제품을 만들고, 사용자 경험을 고민하는 개발자입니다.
            <br />
            아이디어를 빠르게 실험하고 기록하여 더 나은 경험을 설계합니다.
          </p>
        </div>

        <CTAButton href={CTA_LINK} label="이력서 다운로드">
          <Download size={18} />
        </CTAButton>
      </div>
    </section>
  );
}

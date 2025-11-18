"use client";

import { Download } from "lucide-react";
import Typewriter from "typewriter-effect";

import CTAButton from "../components/ui/CTAButton";
import SectionWatcher from "@/app/components/layout/SectionWatcher";

const CTA_LINK = "/resume.pdf";

export default function HomeHero() {
  return (
    <SectionWatcher id="home" className="scroll-mt-40 pt-20">
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <div className="pt-6">
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            <p>안녕하세요,</p>
            <Typewriter
              options={{
                strings: ["백엔드 개발자", "읽는 것을 좋아하는", "운동을 좋아하는"],
                autoStart: true,
                loop: true,
              }}
            />
            <span className="inline-block text-emerald-600">김대환</span>
            입니다.
          </h1>
          <p className="mt-6 text-base text-slate-600 md:text-lg">
            항상 "왜?"라는 질문으로 문제를 여러 시각으로 살펴보는 백엔드 개발자입니다.
            <br />
            문서를 기반으로 설계를 수행하며, 이유와 설명력있는 코드를 작성하는 것이 목표입니다.
          </p>
        </div>
        <CTAButton href={CTA_LINK} label="이력서 다운로드">
          <Download size={18} />
        </CTAButton>
      </div>
    </SectionWatcher>
  );
}

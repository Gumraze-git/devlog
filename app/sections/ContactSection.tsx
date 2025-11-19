"use client";

import Link from "next/link";

import SectionWatcher from "../components/layout/SectionWatcher";
import SlideUpInView from "../components/layout/SlideUpInView";

export default function ContactSection() {
  return (
    <SectionWatcher id="contact" className="scroll-mt-32 py-20 md:py-24">
      <SlideUpInView>
        <div className="space-y-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">CONTACT</p>
          <h2 className="text-3xl font-bold text-slate-900">감사합니다</h2>
          <p className="text-slate-600">궁금한 점이 있다면 언제든지 편하게 연락해 주세요.</p>
        </div>
        <div className="mt-8 w-72 md:w-80 mx-auto grid grid-cols-3 gap-3 rounded-3xl bg-white/90 p-6 text-sm shadow-sm">
          <div className="text-left font-semibold text-slate-500">이메일</div>
          <a href="mailto:dkim@example.com" className="col-span-2 text-left font-semibold text-emerald-600">
            galaxydh4110@gmail.com
          </a>
          <div className="text-left font-semibold text-slate-500">GitHub</div>
          <Link href="https://github.com/Gumraze-git" target="_blank" className="col-span-2 text-left font-semibold text-emerald-600">
            Gumraze-Git
          </Link>
        </div>
      </SlideUpInView>
    </SectionWatcher>
  );
}

export function HomeHeroSection() {
  return (
    <section className="relative pt-12 pb-6 md:pt-16 md:pb-10">
      <div className="max-w-5xl space-y-8 animate-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] md:whitespace-nowrap md:text-5xl lg:text-6xl">
            Documentation - driven <span className="text-[var(--accent)]">Developer</span>
          </h1>

          <p className="max-w-3xl text-lg font-medium leading-relaxed text-[var(--text-muted)] md:text-xl">
            공식 문서 속의 원리를 탐구하고 기록하며, 정석을 바탕으로 지식을 나누는 과정을 통해
            성장을 넘어 팀의 발전에 기여하고자 합니다.
          </p>
        </div>
      </div>
    </section>
  );
}

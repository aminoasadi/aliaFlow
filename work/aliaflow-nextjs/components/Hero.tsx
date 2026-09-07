import Image from "next/image";

export function Hero() {
  return (
    <section id="home" className="hero section-dark">
      <div className="hero-copy">
        <p className="eyebrow">A L I A F L O W</p>
        <h1>YOUR TRUSTED<br />LEADERSHIP PARTNER</h1>
      </div>
      <div className="hero-art">
        <Image src="/assets/boardroom.png" alt="Leadership team around a strategic table" fill priority sizes="(max-width: 780px) 100vw, 58vw" />
      </div>
    </section>
  );
}

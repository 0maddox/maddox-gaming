import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Hero({ timing = {} }) {
  const navigate = useNavigate();
  const sectionDelay = timing.sectionDelay ?? 0;
  const contentDuration = timing.contentDuration ?? 0.58;
  const visualDelay = timing.visualDelay ?? 0.12;
  const visualDuration = timing.visualDuration ?? 0.7;

  const scrollToTournaments = () => {
    const target = document.getElementById('tournaments');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    navigate('/');
    window.setTimeout(() => {
      const delayedTarget = document.getElementById('tournaments');
      if (delayedTarget) {
        delayedTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 140);
  };

  const gamepadBubbles = [
    { left: '8%', delay: '0s', duration: '11s', size: '30px', driftMid: '16px', driftEnd: '-11px' },
    { left: '19%', delay: '1.2s', duration: '12.5s', size: '34px', driftMid: '-12px', driftEnd: '9px' },
    { left: '33%', delay: '2.5s', duration: '10.8s', size: '28px', driftMid: '10px', driftEnd: '-14px' },
    { left: '46%', delay: '3.1s', duration: '13.2s', size: '36px', driftMid: '-18px', driftEnd: '7px' },
    { left: '58%', delay: '1.8s', duration: '12.2s', size: '32px', driftMid: '14px', driftEnd: '-9px' },
    { left: '72%', delay: '4.1s', duration: '11.5s', size: '29px', driftMid: '-9px', driftEnd: '12px' },
    { left: '84%', delay: '2.2s', duration: '13.4s', size: '35px', driftMid: '19px', driftEnd: '-13px' },
    { left: '93%', delay: '3.6s', duration: '10.9s', size: '27px', driftMid: '-11px', driftEnd: '8px' },
  ];

  return (
    <section id="hero" className="hero-section-premium section-block">
      <div className="container-12 hero-grid">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: contentDuration, delay: sectionDelay }}
          className="hero-copy"
        >
          <p className="eyebrow">Nairobi Esports Shop</p>
          <h1>Level Up Your Game</h1>
          <p className="hero-subtext">
            Shop premium gaming gear, compete in CODM tournaments, and join Nairobi&apos;s fastest-growing gaming community.
          </p>

          <div className="hero-actions">
            <button type="button" className="btn-gold hero-cta-btn" onClick={() => navigate('/shop')}>Shop Now</button>
            <button type="button" className="btn-outline-gold hero-cta-btn" onClick={scrollToTournaments}>Join Tournament</button>
          </div>

          <div className="floating-cards">
            <div className="float-card">New Controller Drop</div>
            <div className="float-card">Tournament This Weekend</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: visualDuration, delay: sectionDelay + visualDelay }}
          className="hero-visual"
        >
          <div className="hero-image-frame">
            <img src="/images/home-bg.jpg" alt="Gaming player setup" />
          </div>
        </motion.div>
      </div>

      <div className="hero-particles" aria-hidden="true">
        {gamepadBubbles.map((bubble) => (
          <span
            key={`${bubble.left}-${bubble.delay}`}
            className="gamepad-bubble"
            style={{
              left: bubble.left,
              animationDelay: bubble.delay,
              animationDuration: bubble.duration,
              width: bubble.size,
              height: `calc(${bubble.size} * 0.62)`,
              '--drift-mid': bubble.driftMid,
              '--drift-end': bubble.driftEnd,
            }}
          />
        ))}
      </div>
    </section>
  );
}

export default Hero;

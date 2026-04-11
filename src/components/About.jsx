import React from 'react';
import { motion } from 'framer-motion';

function About({ timing = {} }) {
  const sectionDelay = timing.sectionDelay ?? 0.28;
  const leftDuration = timing.leftDuration ?? 0.6;
  const rightDuration = timing.rightDuration ?? 0.56;
  const rightDelayOffset = timing.rightDelayOffset ?? 0.09;

  return (
    <section id="about" className="section-block">
      <div className="container-12 about-grid">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: leftDuration, delay: sectionDelay }}
          className="about-image-wrap"
        >
          <img src="/images/default-bg.jpg" alt="Gaming setup interior" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: rightDuration, delay: sectionDelay + rightDelayOffset }}
          className="about-copy"
        >
          <h2>Built for Gamers, By Gamers</h2>
          <p>
            We are focused on Nairobi youth gaming culture, building a real community where gamers can access premium gear,
            compete in tournaments, and grow into the esports future.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default About;

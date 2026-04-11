import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function CTA({ timing = {} }) {
  const sectionDelay = timing.sectionDelay ?? 0.56;
  const sectionDuration = timing.sectionDuration ?? 0.48;

  return (
    <motion.section
      id="cta"
      className="section-block"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: sectionDuration, delay: sectionDelay }}
    >
      <div className="container-12 cta-strip glass-card">
        <div>
          <h2>Join the Gaming Community</h2>
          <p>Compete, shop, and grow with Nairobi&apos;s most active gaming network.</p>
        </div>

        <div className="cta-actions">
          <Link to="/signup" className="btn-gold">Sign Up</Link>
          <a className="btn-outline-gold" href="https://wa.me/c/254748376744" target="_blank" rel="noreferrer">
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </motion.section>
  );
}

export default CTA;

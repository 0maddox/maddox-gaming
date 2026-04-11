import React, { useState } from 'react';
import { motion } from 'framer-motion';

const galleryItems = [
  '/images/home-bg.jpg',
  '/images/shop-bg.jpg',
  '/images/tournaments-bg.jpg',
  '/images/default-bg.jpg',
  '/images/login-bg.jpg',
  '/images/signup-bg.jpg',
];

function Gallery({ timing = {} }) {
  const [activeImage, setActiveImage] = useState('');
  const sectionDelay = timing.sectionDelay ?? 0.38;
  const sectionDuration = timing.sectionDuration ?? 0.52;
  const tileStagger = timing.tileStagger ?? 0.04;

  return (
    <motion.section
      id="gallery"
      className="section-block"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: sectionDuration, delay: sectionDelay }}
    >
      <div className="container-12">
        <div className="section-header-premium">
          <h2>Gallery & Setups</h2>
        </div>

        <div className="gallery-grid">
          {galleryItems.map((src, index) => (
            <motion.button
              key={src}
              className="gallery-tile"
              type="button"
              onClick={() => setActiveImage(src)}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.24, delay: sectionDelay + index * tileStagger }}
            >
              <img src={src} alt="Gaming scene" />
              <span className="gallery-overlay">View</span>
            </motion.button>
          ))}
        </div>
      </div>

      {activeImage ? (
        <div className="lightbox" onClick={() => setActiveImage('')} role="presentation">
          <img src={activeImage} alt="Expanded view" />
        </div>
      ) : null}
    </motion.section>
  );
}

export default Gallery;

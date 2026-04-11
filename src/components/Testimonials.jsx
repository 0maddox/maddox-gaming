import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  { id: 1, name: 'Brian M.', quote: 'Best gaming shop in Nairobi. Tournaments are fire.' },
  { id: 2, name: 'Kelvin O.', quote: 'Fast service and legit gear. Great community vibe.' },
  { id: 3, name: 'Aisha K.', quote: 'The CODM events are well-organized and super competitive.' },
];

function Testimonials({ timing = {} }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionDelay = timing.sectionDelay ?? 0.46;
  const sectionDuration = timing.sectionDuration ?? 0.5;
  const cardStagger = timing.cardStagger ?? 0.08;

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 3500);

    return () => window.clearInterval(id);
  }, []);

  return (
    <motion.section
      id="testimonials"
      className="section-block"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: sectionDuration, delay: sectionDelay }}
    >
      <div className="container-12">
        <div className="section-header-premium">
          <h2>Testimonials</h2>
        </div>

        <div className="testimonial-carousel">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.id}
              className={`glass-card testimonial-card ${index === activeIndex ? 'active' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.25, delay: sectionDelay + index * cardStagger }}
            >
              <div className="avatar-circle">{item.name.charAt(0)}</div>
              <h3>{item.name}</h3>
              <p>{item.quote}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default Testimonials;

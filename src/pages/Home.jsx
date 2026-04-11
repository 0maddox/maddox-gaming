import React from 'react';
import Hero from '../components/Hero';
import Products from '../components/Products';
import Tournaments from '../components/Tournaments';
import About from '../components/About';
import Gallery from '../components/Gallery';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

function Home() {
  const sectionTiming = {
    hero: { sectionDelay: 0.02, contentDuration: 0.62, visualDelay: 0.18, visualDuration: 0.74 },
    products: { sectionDelay: 0.08, sectionDuration: 0.54, cardStagger: 0.06 },
    tournaments: { sectionDelay: 0.16, sectionDuration: 0.66, cardStagger: 0.1 },
    about: { sectionDelay: 0.24, leftDuration: 0.64, rightDuration: 0.56, rightDelayOffset: 0.12 },
    gallery: { sectionDelay: 0.31, sectionDuration: 0.48, tileStagger: 0.03 },
    testimonials: { sectionDelay: 0.4, sectionDuration: 0.52, cardStagger: 0.09 },
    cta: { sectionDelay: 0.5, sectionDuration: 0.44 },
  };

  return (
    <div className="premium-page">
      <Hero timing={sectionTiming.hero} />
      <Products timing={sectionTiming.products} />
      <Tournaments timing={sectionTiming.tournaments} />
      <About timing={sectionTiming.about} />
      <Gallery timing={sectionTiming.gallery} />
      <Testimonials timing={sectionTiming.testimonials} />
      <CTA timing={sectionTiming.cta} />
      <Footer />
    </div>
  );
}

export default Home;

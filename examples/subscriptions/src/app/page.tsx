import HeroSection from './components/HeroSection';

import Footer from '../components/footer/Footer';

export default function Home() {
  return (
    <>
      <main>
        <HeroSection />
        <section className="py-16"></section>
      </main>
      <Footer />
    </>
  );
}
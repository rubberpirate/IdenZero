import React from 'react';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;

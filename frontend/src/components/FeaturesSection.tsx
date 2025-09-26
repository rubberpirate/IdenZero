import React, { useState, useEffect } from 'react';
import { GridPatternCard, GridPatternCardBody } from '@/components/ui/card-with-grid-ellipsis-pattern';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { 
  Shield, 
  Zap, 
  Building2, 
  Users, 
  CreditCard,
  Globe,
  Lock,
  TrendingUp,
  Smartphone
} from 'lucide-react';

const FeaturesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [carouselApi, setCarouselApi] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Move features array to the top so it's available to all hooks
  const features = [
    {
      icon: Shield,
      title: "Identity Verification",
      description: "Multi-layer identity verification with Aadhaar integration and Self.xyz decentralized identity. Cryptographic proof of authenticity.",
      delay: "delay-200"
    },
    {
      icon: Lock,
      title: "Credential Authentication",
      description: "Digital signature verification and Soulbound Tokens for immutable credential records. Institutional partnerships for direct verification.",
      delay: "delay-300"
    },
    {
      icon: Zap,
      title: "AI-Powered Skill Analysis",
      description: "Deep GitHub analysis, multi-platform integration, and real-time skill assessment with technology stack proficiency breakdown.",
      delay: "delay-400"
    },
    {
      icon: TrendingUp,
      title: "Karma Reputation System",
      description: "Progressive trust scoring through verified work, peer endorsements, and successful job placements with skills-based karma categories.",
      delay: "delay-500"
    },
    {
      icon: Building2,
      title: "Job Marketplace",
      description: "Staking mechanism reduces spam applications. Variable staking based on karma scores with company verification and priority matching.",
      delay: "delay-600"
    },
    {
      icon: Users,
      title: "Proof-of-Work Challenges",
      description: "Anonymous problem-solving for skill verification. Skills tournaments and cross-platform verification for comprehensive talent assessment.",
      delay: "delay-700"
    },
    {
      icon: Globe,
      title: "Blockchain Infrastructure",
      description: "Built on Ethereum/Polygon with Filecoin storage, IPFS metadata, and The Graph Protocol for efficient data querying.",
      delay: "delay-800"
    },
    {
      icon: Smartphone,
      title: "Trust Score Analytics",
      description: "Real-time reputation tracking with decay mechanisms, peer endorsements, and multi-source karma from verified achievements.",
      delay: "delay-900"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('features-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap());
    };
    carouselApi.on('select', onSelect);
    setSelectedIndex(carouselApi.selectedScrollSnap());
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  // Auto-scroll effect for mobile carousel
  useEffect(() => {
    if (!carouselApi) return;
    const interval = setInterval(() => {
      const nextIdx = (carouselApi.selectedScrollSnap() + 1) % features.length;
      carouselApi.scrollTo(nextIdx);
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselApi, features.length]);

  return (
    <section 
      id="features-section"
      className="relative w-full py-20 md:py-32 px-6 md:px-12 bg-background overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-medium rounded-full bg-muted text-white">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
              Core Platform Features
              <Shield className="h-2.5 w-2.5 text-blue-200/90" />
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-foreground mb-6">
            <span className="text-green-700">Identity + Skills + Trust</span>
            <span className="text-white block"> Verification System</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            The first decentralized platform that eliminates fake profiles in hiring through blockchain verification, 
            AI-powered skill analysis, and cryptographic proof of credentials.
          </p>
        </div>
        {/* Features Carousel (Mobile Only) */}
        <div className="block md:hidden relative px-8">
          <Carousel className="w-full" setApi={setCarouselApi}>
            <CarouselContent>
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <CarouselItem key={index}>
                    <GridPatternCard
                      className={`cosmic-glow relative hover:shadow-lg transition-all duration-500 group w-full h-56 sm:h-64 ${
                        isVisible ? `opacity-100 translate-y-0 ${feature.delay}` : 'opacity-0 translate-y-10'
                      }`}
                    >
                      <GridPatternCardBody className="space-y-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="h-6 w-6 text-green-200/90" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </GridPatternCardBody>
                    </GridPatternCard>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="-left-5 top-1/2 -translate-y-1/2" />
            <CarouselNext className="-right-5 top-1/2 -translate-y-1/2" />
          </Carousel>
          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            {features.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  selectedIndex === idx
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                }`}
                onClick={() => carouselApi && carouselApi.scrollTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                type="button"
              />
            ))}
          </div>
        </div>
        {/* Features Grid (Desktop/Tablet Only) */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <GridPatternCard
                key={index}
                className={`cosmic-glow relative hover:shadow-lg transition-all duration-500 group w-full h-56 sm:h-64 ${
                  isVisible ? `opacity-100 translate-y-0 ${feature.delay}` : 'opacity-0 translate-y-10'
                }`}
              >
                <GridPatternCardBody className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-6 w-6 text-green-200/90" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </GridPatternCardBody>
              </GridPatternCard>
            );
          })}
        </div>
        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-700 delay-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-sm text-muted-foreground">
            Ready to revolutionize your payment experience? • Get started in minutes
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

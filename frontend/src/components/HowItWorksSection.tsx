import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import {
  UserPlus,
  Scan,
  CheckCircle,
  ArrowRight,
  Wallet,
  QrCode,
  CreditCard,
  Zap
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

const HowItWorksSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [carouselApi, setCarouselApi] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Move steps array to the top so it's available to all hooks
  const steps = [
    {
      icon: UserPlus,
      number: "01",
      title: "Verify Your Identity",
      description: "Complete multi-layer identity verification with Aadhaar integration and Self.xyz decentralized identity for cryptographic proof.",
      features: ["Aadhaar integration", "Self.xyz verification", "KYC compliance"],
      delay: "delay-200"
    },
    {
      icon: Scan,
      number: "02", 
      title: "Authenticate Credentials",
      description: "Upload certificates for digital signature verification. Receive Soulbound Tokens as immutable proof of achievements.",
      features: ["Digital signatures", "SBT minting", "Institutional verification"],
      delay: "delay-400"
    },
    {
      icon: Zap,
      number: "03",
      title: "AI Skill Analysis",
      description: "Connect GitHub and other platforms for deep skill analysis. Build your verified technology stack proficiency profile.",
      features: ["GitHub integration", "Multi-platform analysis", "Real-time scoring"],
      delay: "delay-600"
    },
    {
      icon: CheckCircle,
      number: "04",
      title: "Build Trust Score",
      description: "Earn karma through verified work, peer endorsements, and successful placements. Access premium job opportunities.",
      features: ["Karma system", "Peer endorsements", "Priority matching"],
      delay: "delay-800"
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

    const element = document.getElementById('how-it-works-section');
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
      const nextIdx = (carouselApi.selectedScrollSnap() + 1) % steps.length;
      carouselApi.scrollTo(nextIdx);
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselApi, steps.length]);

  return (
    <section 
      id="how-it-works-section"
      className="relative w-full py-20 md:py-32 px-6 md:px-12 bg-background overflow-hidden"
    >
      {/* 3D Animated Background */}
      <AnimatedBackground projectId="cm294jqwv1hkdml0hncxmdyvp" overlay="light" className="inset-x-6 md:inset-x-12 inset-y-8 md:inset-y-12" />
      
      {/* Subtle overlay for the container effect */}
      <div className="absolute inset-x-6 md:inset-x-12 inset-y-8 md:inset-y-12 bg-muted/5 rounded-3xl"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-medium rounded-full bg-background/80 backdrop-blur text-white border border-border">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
              Verification Process
              <ArrowRight className="h-2.5 w-2.5 text-blue-200/90" />
            </span>
          </div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-foreground mb-6">
            <span className="text-green-700">Build Your Trusted</span>
            <span className="text-white block">Professional Identity</span>
          </h2>
          
          <p className="hidden md:block text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            From identity verification to skill analysis - build a blockchain-verified professional profile that 
            eliminates fake credentials and showcases your real expertise.
          </p>
        </div>

        {/* Steps Carousel (Mobile Only) */}
        <div className="block md:hidden relative px-8 mb-12">
          <Carousel className="w-full" setApi={setCarouselApi}>
            <CarouselContent>
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <CarouselItem key={index}>
                    <Card
                      className={`cosmic-glow relative p-6 bg-background/80 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-700 group w-full h-96 sm:h-[28rem] ${
                        isVisible ? `opacity-100 translate-y-0 ${step.delay}` : 'opacity-0 translate-y-10'
                      }`}
                    >
                      <div className="space-y-2 flex flex-col">
                        {/* Step Number and Icon */}
                        <div className="flex items-center gap-4 mb-2">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <IconComponent className="h-6 w-6 text-green-200/90" />
                          </div>
                          <span className="text-2xl font-bold text-primary/60">{step.number}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-3">
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            {step.description}
                          </p>
                          {/* Features List */}
                          <div className="space-y-2">
                            {step.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-200/90 flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="-left-5 top-1/2 -translate-y-1/2" />
            <CarouselNext className="-right-5 top-1/2 -translate-y-1/2" />
          </Carousel>
          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            {steps.map((_, idx) => (
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

        {/* Steps Grid (Desktop/Tablet Only) */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className={`relative transition-all duration-700 transform ${
                  isVisible ? `opacity-100 translate-y-0 ${step.delay}` : 'opacity-0 translate-y-10'
                }`}
              >
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-8 h-px bg-border z-0">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/30"></div>
                  </div>
                )}
                <Card className="cosmic-glow relative p-6 bg-background/80 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-700 group w-full min-h-72 sm:min-h-80">
                  <div className="space-y-2 flex flex-col">
                    {/* Step Number and Icon */}
                    <div className="flex items-center gap-4 mb-2">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="h-6 w-6 text-green-200/90" />
                      </div>
                      <span className="text-2xl font-bold text-primary/60">{step.number}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {step.description}
                      </p>
                      {/* Features List */}
                      <div className="space-y-2">
                        {step.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-200/90 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Demo Section */}
        <div className={`cosmic-glow relative rounded-xl overflow-hidden border border-border backdrop-blur-sm bg-background/50 shadow-lg transition-all duration-700 delay-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-green-200/90" />
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-green-200/90" />
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Ready to Experience the Future?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of users who have already made the switch to decentralized payments. 
              Start your journey today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground text-base h-12 px-8 transition-all duration-200">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Wallet Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

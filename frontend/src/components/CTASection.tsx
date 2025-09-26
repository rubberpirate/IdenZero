import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PinContainer } from '@/components/ui/3d-pin';
import { 
  ArrowRight, 
  Smartphone, 
  Users, 
  Zap,
  CheckCircle,
  Download,
  Star,
  CreditCard,
  TrendingUp,
  Shield,
  Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('cta-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const benefits = [
    { text: "Blockchain identity verification", icon: Shield },
    { text: "AI-powered skill analysis", icon: Zap },
    { text: "Soulbound credential tokens", icon: CheckCircle },
    { text: "Karma reputation system", icon: TrendingUp }
  ];

  const stats = [
    { value: "85%", label: "Fake Resumes Eliminated" },
    { value: "100%", label: "Verified Credentials" },
    { value: "AI", label: "Skill Analysis" }
  ];

  return (    <section 
      id="cta-section"
      className="relative w-full py-20 md:py-32 px-6 md:px-12 bg-background overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 cosmic-grid opacity-20"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Main CTA Card */}
        <Card className={`cosmic-glow relative overflow-hidden border-border backdrop-blur-sm bg-gradient-to-br from-background/80 to-background/60 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="p-8 md:p-12 lg:p-16">
            {/* Header */}
            <div className="text-center mb-12">              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-medium rounded-full bg-muted text-white">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                  Ready to Start
                  <ArrowRight className="h-2.5 w-2.5 text-primary" />
                </span>
              </div>
              
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-foreground mb-6">
                <span className="text-green-700">Start Building Your</span>
                <span className="text-white block">Trusted Profile Today</span>
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance mb-8">
                Join the revolution in hiring. Build a <span className="text-green-700">blockchain-verified professional identity</span> that showcases 
                your real skills and eliminates fake profiles from the job market.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-700 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 backdrop-blur-sm border border-border">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {benefit.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-700 delay-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground text-lg h-14 px-8 transition-all duration-200 group"
                onClick={() => navigate('/auth')}
              >
                <Wallet className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Start Your Smart Wallet
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-3 gap-8 pt-8 border-t border-border transition-all duration-700 delay-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>        </Card>

        {/* Trust Indicators */}
        <div className={`text-center mt-12 transition-all duration-700 delay-1100 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span>4.9/5 rating</span>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <span>Built on Aptos blockchain</span>
            <div className="h-4 w-px bg-border"></div>
            <span>24/7 support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
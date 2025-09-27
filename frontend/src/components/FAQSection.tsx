import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Shield, 
  CreditCard, 
  Globe,
  Users,
  Zap
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';

const FAQSection = () => {
  const faqs = [
    {
      category: "Identity Verification",
      icon: Shield,
      questions: [
        {
          question: "How does blockchain identity verification work?",
          answer: "We use multi-layer verification including Aadhaar integration and Self.xyz decentralized identity. Your identity is cryptographically verified and stored on-chain, creating an immutable proof of authenticity that eliminates fake profiles."
        },
        {
          question: "What documents can I verify?",
          answer: "You can verify educational certificates, professional certifications, work experience letters, and other credentials. We use digital signature verification and partner with institutions for direct verification, minting Soulbound Tokens as proof."
        },
        {
          question: "How secure is my personal information?",
          answer: "All personal data is encrypted and stored using zero-knowledge proofs. Only verification status is stored on-chain, not your actual documents. You maintain full control over what information to share with potential employers."
        }
      ]
    },
    {
      category: "Skill Analysis & AI",
      icon: Zap,
      questions: [
        {
          question: "How does AI skill analysis work?",
          answer: "Our AI analyzes your GitHub repositories, commit history, code quality, and contribution patterns. It also integrates with platforms like Stack Overflow and Kaggle to build a comprehensive skill profile with real-time technology stack proficiency."
        },
        {
          question: "What platforms do you analyze?",
          answer: "Currently we analyze GitHub repositories, Stack Overflow contributions, and Kaggle competitions. We're expanding to include more developer platforms to provide the most comprehensive skill assessment possible."
        },
        {
          question: "How accurate is the skill scoring?",
          answer: "Our AI uses advanced algorithms to analyze code complexity, project scope, and contribution frequency. The system continuously learns and updates scores based on recent activity, providing dynamic and accurate skill assessments."
        }
      ]
    },
    {
      category: "Karma & Reputation",
      icon: Users,
      questions: [
        {
          question: "How does the Karma system work?",
          answer: "Karma is earned through verified work completion (+50-200 points), peer endorsements (+10-30 points), successful job placements (+100 points), and skills tournament performance (+20-100 points). Higher karma unlocks better opportunities and lower application costs."
        },
        {
          question: "Does Karma expire?",
          answer: "Yes, Karma has time-based decay to encourage continuous activity and ensure scores reflect current capabilities. Active participation in the platform helps maintain and grow your Karma score over time."
        },
        {
          question: "Can I transfer Karma to others?",
          answer: "No, Karma is non-transferable and tied to your verified identity. However, you can endorse other professionals to help them build their reputation, and verified professionals can sponsor newcomers through reputation staking."
        }
      ]
    },
    {
      category: "Job Marketplace",
      icon: CreditCard,
      questions: [
        {
          question: "How does the staking mechanism work?",
          answer: "To reduce spam applications, candidates pay a small stake (in ETH/MATIC) when applying for jobs. Higher Karma users pay less. Stakes are returned for quality applications, and successful hires receive bonus rewards."
        },
        {
          question: "How are companies verified?",
          answer: "Companies must stake tokens to post legitimate job openings and undergo verification processes. This ensures only serious employers can post jobs, creating a trusted marketplace for both sides."
        },
        {
          question: "What makes TrustHire different from other job platforms?",
          answer: "We eliminate fake profiles through blockchain verification, use AI for accurate skill matching, implement reputation-based filtering, and create economic incentives for quality interactions. It's the first truly trustworthy hiring platform."
        }
      ]
    }
  ];

  const [isVisible, setIsVisible] = useState(false);
  const [openItems, setOpenItems] = useState<number[]>([0]); // First item open by default
  const [minimized, setMinimized] = useState<{ [key: number]: boolean }>(() => {
    // All minimized by default
    const state: { [key: number]: boolean } = {};
    for (let i = 0; i < faqs.length; i++) {
      state[i] = true;
    }
    return state;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('faq-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleMinimize = (categoryIndex: number) => {
    setMinimized(prev => ({ ...prev, [categoryIndex]: !prev[categoryIndex] }));
  };

  return (
    <section 
      id="faq-section"
      className="relative w-full py-20 md:py-32 px-6 md:px-12 bg-background overflow-hidden"
    >
      {/* 3D Animated Background */}
      <AnimatedBackground projectId="cm294jqwv1hkdml0hncxmdyvp" overlay="light" className="inset-x-6 md:inset-x-12 inset-y-8 md:inset-y-12" />
      
      {/* Subtle overlay for the container effect */}
      <div className="absolute inset-x-6 md:inset-x-12 inset-y-8 md:inset-y-12 bg-muted/5 rounded-3xl"></div>
      
      {/* Background Effects - Keep some for layering */}
      <div className="absolute inset-0 cosmic-grid opacity-3"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-medium rounded-full bg-background/80 backdrop-blur text-white border border-border">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
              Support Center
              <HelpCircle className="h-2.5 w-2.5 text-primary" />
            </span>
          </div>
          
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-foreground mb-6">
            <span className="text-green-700">Frequently Asked</span>
            <span className="text-white block">Questions</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Learn about identity verification, skill analysis, karma system, and blockchain-powered hiring. 
            Your guide to trusted professional networking.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => {
            const IconComponent = category.icon;
            const isMinimized = minimized[categoryIndex];
            return (
              <Card
                key={categoryIndex}
                className={`cosmic-glow relative bg-background/80 backdrop-blur-sm border-border transition-all duration-700 delay-${(categoryIndex + 1) * 200} transform ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                {/* Category Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {category.category}
                    </h3>
                  </div>
                  {/* Minimize button: mobile only */}
                  <button
                    className="block md:hidden ml-2 p-1 rounded hover:bg-muted/20 transition-colors"
                    onClick={() => toggleMinimize(categoryIndex)}
                    aria-label={isMinimized ? 'Expand FAQ' : 'Minimize FAQ'}
                  >
                    {isMinimized ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Questions: show if not minimized on mobile, always show on md+ */}
                <div className={`${isMinimized ? 'hidden' : ''} md:block`}> 
                  {category.questions.map((faq, questionIndex) => {
                    const globalIndex = categoryIndex * 10 + questionIndex;
                    const isOpen = openItems.includes(globalIndex);
                    return (
                      <div key={questionIndex}>
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full p-6 text-left hover:bg-muted/50 transition-colors duration-200 flex items-center justify-between group"
                        >
                          <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                            {faq.question}
                          </span>
                          <div className="ml-4 flex-shrink-0">
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Contact Support CTA */}
        <div className={`text-center mt-16 transition-all duration-700 delay-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Card className="cosmic-glow relative p-8 bg-primary/5 backdrop-blur-sm border-primary/20 max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground">
                Still Have Questions?
              </h3>
              <p className="text-muted-foreground">
                Our support team is available 24/7 to help you with any questions or concerns. 
                Get personalized assistance from crypto payment experts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=support@aptexwallet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
                >
                  Email Support
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

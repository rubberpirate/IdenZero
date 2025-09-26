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
      category: "EMI & Payments",
      icon: CreditCard,
      questions: [
        {
          question: "How does crypto-based EMI work?",
          answer: "You can buy products/services and pay in monthly installments using Aptos tokens. Smart contracts automatically track your installment schedule and handle auto-debits from your wallet. Merchants receive upfront payment via our liquidity pool."
        },
        {
          question: "What is on-chain credit scoring?",
          answer: "Our smart contracts track your timely repayments and build a credit score on the Aptos blockchain. Good repayment history unlocks better EMI terms and rewards through our loyalty system."
        },
        {
          question: "How does INR integration work?",
          answer: "We map your UPI ID to your Aptos public key. When you enter an amount in INR, the wallet fetches real-time INR↔APT rates and auto-calculates the equivalent APT for transactions. You see both APT value and INR equivalent."
        }
      ]
    },
    {
      category: "NFT & Rewards",
      icon: Zap,
      questions: [
        {
          question: "How do NFT collectibles work in the wallet?",
          answer: "Your wallet doubles as an NFT showcase where you can view, store, and trade Aptos-based NFT collectibles. Merchants and partners can issue NFTs as loyalty rewards or proof-of-participation tokens."
        },
        {
          question: "What kind of NFT rewards can I earn?",
          answer: "Merchants can issue NFT loyalty rewards, proof-of-purchase tokens, or special collectibles. These NFTs can unlock special discounts, exclusive access, or serve as tradeable digital assets within the Aptos ecosystem."
        },
        {
          question: "Can I trade my NFTs?",
          answer: "Yes! The wallet includes built-in NFT trading capabilities. You can view your collection, trade with other users, and showcase your Aptos-based NFTs all within the same interface."
        }
      ]
    },
    {
      category: "Cross-Border & UPI",
      icon: Globe,
      questions: [
        {
          question: "How does cross-border remittance work?",
          answer: "Users abroad can send USDT/USDC which gets converted to APT. Recipients in India see the INR value in real-time and can withdraw via UPI integration, making international money transfers seamless."
        },
        {
          question: "What is salary streaming in APT?",
          answer: "Employers can stream salaries continuously in APT tokens while employees see their balance in INR equivalent with real-time conversion rates. This enables innovative payroll solutions with crypto benefits."
        },
        {
          question: "How do subscriptions work?",
          answer: "Set up recurring payments in INR that are automatically executed in APT at current conversion rates. Perfect for subscriptions, bills, and regular payments with the benefits of crypto settlement."
        }
      ]
    },
    {
      category: "Security & Setup",
      icon: Shield,
      questions: [
        {
          question: "How secure is the Aptos wallet?",
          answer: "Built on Aptos blockchain with enterprise-grade security. You control your private keys with mnemonic backup. Smart contracts are audited and all transactions benefit from Aptos' built-in security features."
        },
        {
          question: "How do I set up UPI integration?",
          answer: "During wallet setup, you'll link your UPI ID to your Aptos public key. This enables seamless INR-APT conversion and allows you to bridge traditional payments with crypto seamlessly."
        },
        {
          question: "What if I lose access to my wallet?",
          answer: "Your mnemonic phrase is your backup key. Store it securely during setup. With your mnemonic, you can recover your wallet, APT balance, and NFT collection on any device. We cannot recover lost mnemonics."
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
            <span className="text-green-200">Everything About</span>
            <span className="text-white block">Smart Wallet Features</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Learn about EMI payments, NFT rewards, INR integration, and more. 
            Your guide to the future of digital payments on Aptos.
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

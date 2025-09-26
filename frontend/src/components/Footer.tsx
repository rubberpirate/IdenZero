import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/Logo';
import { 
  Twitter, 
  Github, 
  Linkedin, 
  Mail, 
  MapPin,
  Shield,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Security', href: '#security' },
    { name: 'Help Center', href: '#help' },
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#twitter' },
    { name: 'GitHub', icon: Github, href: '#github' },
    { name: 'LinkedIn', icon: Linkedin, href: '#linkedin' },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Logo />
              <span className="text-xl font-semibold text-foreground">Aptex wallet</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Secure, instant cryptocurrency payments for businesses and individuals worldwide.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Bank-level Security</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@aptexwallet.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>San Francisco, CA</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Aptex wallet. All rights reserved.
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-current" />
            <span>for the crypto community</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

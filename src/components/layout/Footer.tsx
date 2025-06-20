// src/components/layout/Footer.tsx
import Link from 'next/link';
import { AppLogo } from './AppLogo';
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "Facebook", href: "https://web.facebook.com/marshallpresson68", icon: <Facebook size={22} /> },
    { name: "Instagram", href: "https://instagram.com", icon: <Instagram size={22} /> },
    { name: "Twitter", href: "https://twitter.com", icon: <Twitter size={22} /> },
    { name: "LinkedIn", href: "https://linkedin.com", icon: <Linkedin size={22} /> },
    { name: "YouTube", href: "https://youtube.com", icon: <Youtube size={22} /> },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <Link href="/" passHref legacyBehavior>
              <a className="inline-block mb-2" aria-label="Blisszits - Back to homepage">
                <AppLogo iconSize={38} showName={true} />
              </a>
            </Link>
            <p className="text-sm leading-relaxed">
              Blisszits empowers brands with creative and strategic social media content management. We help you connect, engage, and grow.
            </p>
            <div className="flex space-x-3 pt-2">
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-headline text-base font-semibold text-foreground mb-4">Company</h5>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-primary transition-colors text-sm">About Us</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors text-sm">Services</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5 className="font-headline text-base font-semibold text-foreground mb-4">Resources</h5>
            <ul className="space-y-2">
              <li><Link href="/faq" className="hover:text-primary transition-colors text-sm">FAQ</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-primary transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors text-sm">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h5 className="font-headline text-base font-semibold text-foreground mb-4">Get In Touch</h5>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                 <Mail size={16} className="mr-2 mt-1 text-primary flex-shrink-0"/>
                 <a href="mailto:info@blisszits.com" className="hover:text-primary">info@blisszits.com</a>
              </li>
              <li className="flex items-start">
                 <Phone size={16} className="mr-2 mt-1 text-primary flex-shrink-0"/>
                 <a href="tel:+2348000000000" className="hover:text-primary">+234 (800) 000-0000</a> {/* Placeholder NG number */}
              </li>
              <li className="flex items-start">
                 <MapPin size={16} className="mr-2 mt-1 text-primary flex-shrink-0"/>
                 <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          <p>&copy; {currentYear} Blisszits. All rights reserved.</p>
          <p className="mt-1">
            Developed by <Link href="https://web.facebook.com/marshallpresson68" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary transition-colors">
              Marshall Presson
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

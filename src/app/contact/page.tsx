// src/app/contact/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, type FormEvent, useEffect } from "react";
import { Mail, Phone, MapPin, Loader2, SendHorizonal, Info } from "lucide-react";
import { useSearchParams } from 'next/navigation';

const ContactForm = () => {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialService = searchParams.get('service') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceOfInterest, setServiceOfInterest] = useState(initialService);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setServiceOfInterest(initialService);
  }, [initialService]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // ** Placeholder for actual form submission logic **
    // In a real app, you would send this data to a backend API endpoint,
    // which could then email you, save to a database (like Firestore), or integrate with a CRM.
    console.log("Form Submission Data:", { name, email, company, phone, serviceOfInterest, message });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Message Sent Successfully!",
      description: "Thank you for reaching out. We'll be in touch within 24-48 business hours.",
      variant: "default", // Explicitly set variant if needed, default is usually fine
    });

    // Reset form
    setName('');
    setEmail('');
    setCompany('');
    setPhone('');
    setServiceOfInterest('');
    setMessage('');
    setIsLoading(false);
  };

  const services = [
    "Social Media Strategy Development",
    "Content Creation & Curation",
    "Social Media Management",
    "Community Engagement & Building",
    "Analytics, Reporting & Optimization",
    "Paid Social Advertising",
    "Other Inquiry"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name" className="text-foreground font-medium">Full Name <span className="text-destructive">*</span></Label>
          <Input id="name" type="text" placeholder="e.g., Adaeze Nwosu" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 bg-input border-border focus:border-primary" />
        </div>
        <div>
          <Label htmlFor="email" className="text-foreground font-medium">Email Address <span className="text-destructive">*</span></Label>
          <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 bg-input border-border focus:border-primary" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="company" className="text-foreground font-medium">Company Name (Optional)</Label>
          <Input id="company" type="text" placeholder="Your Company Inc." value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 bg-input border-border focus:border-primary" />
        </div>
        <div>
          <Label htmlFor="phone" className="text-foreground font-medium">Phone Number (Optional)</Label>
          <Input id="phone" type="tel" placeholder="+234 800 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 bg-input border-border focus:border-primary" />
        </div>
      </div>
      <div>
        <Label htmlFor="service" className="text-foreground font-medium">Service of Interest <span className="text-destructive">*</span></Label>
        <Select value={serviceOfInterest} onValueChange={setServiceOfInterest} required>
          <SelectTrigger id="service" className="w-full mt-1 bg-input border-border focus:border-primary text-foreground">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {services.map(service => (
              <SelectItem key={service} value={service}>{service}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="message" className="text-foreground font-medium">Your Message <span className="text-destructive">*</span></Label>
        <Textarea id="message" placeholder="Tell us more about your project or questions..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required className="mt-1 bg-input border-border focus:border-primary" />
      </div>
      <div className="pt-2">
        <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 shadow-md rounded-lg flex items-center justify-center" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <SendHorizonal className="mr-2 h-5 w-5" />
          )}
          {isLoading ? "Sending..." : "Send Your Message"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        By submitting this form, you agree to our <Link href="/privacy-policy" className="underline hover:text-primary">Privacy Policy</Link>.
      </p>
    </form>
  );
};


export default function ContactPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-primary/5 via-background to-background pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-primary mb-4">Contact Us</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We're excited to hear about your project and discuss how Blisszits can help you achieve your social media goals.
          </p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Form */}
            <div className="lg:col-span-3 bg-card p-8 md:p-10 rounded-xl shadow-xl border border-border/60">
              <h2 className="text-2xl md:text-3xl font-bold font-headline text-foreground mb-1">Send Us a Message</h2>
              <p className="text-muted-foreground mb-8">Fill out the form below, and we'll get back to you as soon as possible.</p>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-8 pt-0 lg:pt-10">
              <div>
                <h3 className="text-xl font-headline font-semibold text-foreground mb-4">Direct Contact Details</h3>
                <p className="text-muted-foreground mb-6">
                  Alternatively, you can reach us through the following channels:
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3.5 rounded-full text-primary mt-1">
                    <Mail size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">Email Us</h4>
                    <a href="mailto:info@blisszits.com" className="text-primary hover:underline break-all">info@blisszits.com</a>
                    <p className="text-sm text-muted-foreground">We aim to respond within 1 business day.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3.5 rounded-full text-primary mt-1">
                    <Phone size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">Call Us</h4>
                    <a href="tel:+2348000000000" className="text-primary hover:underline">+234 (800) 000-0000</a> {/* Placeholder NG number */}
                    <p className="text-sm text-muted-foreground">Mon - Fri, 9am - 5pm (WAT)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3.5 rounded-full text-primary mt-1">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">Our Office</h4>
                    <p className="text-muted-foreground">Lagos, Nigeria (Meetings by appointment)</p>
                    {/* <p className="text-sm text-muted-foreground">123 Content Avenue, Media City, MC 45678</p> */}
                  </div>
                </div>
                 <div className="flex items-start space-x-4 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                  <div className="bg-accent/10 p-3 rounded-full text-accent mt-1 flex-shrink-0">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-accent">Project Inquiries</h4>
                    <p className="text-sm text-muted-foreground">For detailed project discussions or proposals, please use the contact form or email us with your requirements.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

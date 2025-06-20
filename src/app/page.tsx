// src/app/page.tsx (Homepage for corporate site)
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Target, PenTool, Users, BarChartHorizontal, MessageSquareText, TrendingUpIcon } from "lucide-react"; // Sparkles removed as it's not used here
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // Added useState
import { Loader2 } from "lucide-react";
// import { RealtimeGreeting } from "@/components/rtdb/RealtimeGreeting"; // Commented out for now

// Sections for the corporate homepage
const HeroSection = () => (
  <section className="bg-gradient-to-br from-secondary via-background to-background pt-20 pb-16 md:pt-32 md:pb-24">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline text-foreground leading-tight mb-6">
            Amplify Your Brand with <span className="text-primary">Strategic</span> Social Media
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 mb-10">
            Blisszits crafts compelling content and data-driven strategies that captivate your audience, foster engagement, and drive measurable growth for your business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3.5 shadow-lg hover:shadow-xl transition-shadow rounded-lg">
              <Link href="/services">Explore Our Services <ChevronRight size={20} className="ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3.5 border-primary text-primary hover:bg-primary/5 hover:text-primary shadow-md hover:shadow-lg transition-shadow rounded-lg">
              <Link href="/contact">Request a Consultation</Link>
            </Button>
          </div>
        </div>
        <div className="mt-10 md:mt-0">
          <Image 
            src="https://placehold.co/700x550.png"
            alt="Social media content management dashboard and creative elements" 
            width={700} 
            height={550} 
            className="rounded-xl shadow-2xl object-cover mx-auto"
            priority
            data-ai-hint="social media management"
          />
        </div>
      </div>
    </div>
  </section>
);

const ServicesOverviewSection = () => {
  const services = [
    { icon: <Target size={32} className="text-accent" />, title: "Content Strategy", description: "Tailored roadmaps to achieve your social media goals and connect with your target audience effectively." },
    { icon: <PenTool size={32} className="text-accent" />, title: "Content Creation", description: "High-quality visuals, engaging copy, and captivating videos that tell your brand's unique story." },
    { icon: <MessageSquareText size={32} className="text-accent" />, title: "Community Management", description: "Building and nurturing your online community through proactive engagement and interaction." },
    { icon: <TrendingUpIcon size={32} className="text-accent" />, title: "Growth & Analytics", description: "Data-driven insights and campaign optimization to maximize your social media ROI." },
  ];
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-primary font-semibold uppercase tracking-wider mb-2 text-sm">What We Do</p>
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">Our Core Services</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            We provide a comprehensive suite of social media management services designed to elevate your brand.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map(service => (
            <div key={service.title} className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-border/60 flex flex-col items-center text-center">
              <div className="bg-accent/10 p-4 rounded-full mb-5">
                {service.icon}
              </div>
              <h3 className="text-xl font-headline font-semibold text-card-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground text-sm flex-grow">{service.description}</p>
              <Button variant="link" asChild className="mt-5 text-primary hover:text-primary/80 font-medium">
                  <Link href="/services">Learn More <ChevronRight size={16} className="ml-1" /></Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutSummarySection = () => (
  <section className="py-16 md:py-24 bg-secondary">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <Image 
            src="https://placehold.co/600x450.png"
            alt="Blisszits team collaborating on social media strategy" 
            width={600} 
            height={450} 
            className="rounded-xl shadow-xl object-cover"
            data-ai-hint="teamwork office"
          />
        </div>
        <div>
          <p className="text-primary font-semibold uppercase tracking-wider mb-2 text-sm">Who We Are</p>
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground mb-6">Passionate About Your Brand's Social Success</h2>
          <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
            Blisszits is a dedicated team of social media experts, content creators, and strategists committed to helping businesses like yours thrive in the digital landscape. We believe in the power of authentic connection and data-driven results.
          </p>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            Our mission is to translate your brand's essence into compelling social media narratives that engage, inspire, and convert.
          </p>
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3 shadow-md rounded-lg">
            <Link href="/about">Discover Our Story</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

const CallToActionSection = () => (
  <section className="py-20 md:py-28 bg-background">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary to-accent p-1 rounded-xl shadow-2xl">
        <div className="bg-card p-8 md:p-12 rounded-lg">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground mb-5">Ready to Elevate Your Social Media Game?</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Let's discuss your unique needs and craft a strategy that delivers real results. Get in touch for a personalized consultation.
          </p>
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-3.5 shadow-lg hover:shadow-xl transition-shadow rounded-lg">
            <Link href="/contact">Schedule Your Free Consultation</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);


export default function HomePage() {
  const { user, isLoadingAuth, userProfile, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingProfile) { // Wait for both auth and profile status
      setAuthCheckComplete(true);
      if (user) {
        if (userProfile?.onboardingCompleted) {
          router.replace('/dashboard');
        } else {
          // User is authenticated, but profile (and thus onboarding status) is still loading or not found
          // This specific check ensures we don't redirect to /onboarding prematurely if profile is still loading
          if (!isLoadingProfile && !userProfile?.onboardingCompleted) {
            router.replace('/onboarding');
          }
        }
      }
      // If no user, stay on this page (corporate homepage)
    }
  }, [user, userProfile, isLoadingAuth, isLoadingProfile, router]);

  // Show loading spinner while auth/profile check is in progress
  if (!authCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not logged in (after checks), show corporate homepage content.
  // Redirection for logged-in users is handled by useEffect.
  if (!user) {
    return (
      <>
        <HeroSection />
        <ServicesOverviewSection />
        <AboutSummarySection />
        <CallToActionSection />
        {/* <RealtimeGreeting /> */}
      </>
    );
  }
  
  // Fallback for logged-in users before redirection (should be brief)
  // This state is hit if user is logged in, but the redirect useEffect hasn't fired yet or profile is loading
  return (
     <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading your experience...</p>
      </div>
  );
}

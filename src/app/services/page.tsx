
// src/app/services/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Brain, PenTool, Users, BarChartHorizontal, MessageCircle, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const servicesList = [
  {
    id: "strategy",
    title: "Social Media Strategy Development",
    description: "We lay the groundwork for your success with comprehensive social media strategies tailored to your brand's unique voice, goals, and target audience. Our strategic approach includes in-depth market research, competitive analysis, platform selection, content pillar definition, and establishing clear KPIs to measure success.",
    icon: <Brain size={28} className="text-primary" />,
    features: [
      "Audience Research & Persona Creation",
      "Competitor Benchmarking",
      "Content Theme & Pillar Development",
      "Platform-Specific Tactical Plans",
      "Performance Goal Setting & Tracking Frameworks",
    ],
    image: "https://placehold.co/550x400.png?text=Strategy",
    imageAlt: "Team collaborating on a social media strategy whiteboard",
    aiHint: "strategy meeting"
  },
  {
    id: "creation",
    title: "Content Creation & Curation",
    description: "Our talented creative team produces high-quality, original, and engaging content designed to capture attention and resonate deeply with your audience. From stunning visuals and professional videography to compelling copywriting, we bring your brand's narrative to life across all platforms.",
    icon: <PenTool size={28} className="text-primary" />,
    features: [
      "Custom Graphic Design (Posts, Stories, Ads, Banners)",
      "Professional Video Production & Editing (Reels, TikToks, Explainers)",
      "High-Quality Photography Services",
      "Engaging & SEO-Optimized Copywriting",
      "User-Generated Content (UGC) Campaign Management",
      "Content Curation & Repurposing",
    ],
    image: "https://placehold.co/550x400.png?text=Content+Creation",
    imageAlt: "Graphic designer working on social media visuals",
    aiHint: "creative design"
  },
  {
    id: "management",
    title: "Social Media Management",
    description: "Let us handle the day-to-day operations of your social media presence. We ensure consistent brand messaging, timely content publishing, proactive community engagement, and meticulous profile management, freeing you to focus on your core business.",
    icon: <Users size={28} className="text-primary" />,
    features: [
      "Social Media Profile Optimization & Setup",
      "Content Scheduling & Calendar Management",
      "Daily Monitoring & Engagement",
      "Hashtag Strategy & Research",
      "Brand Voice Consistency Across Platforms",
    ],
    image: "https://placehold.co/550x400.png?text=Management",
    imageAlt: "Social media manager scheduling posts on a laptop",
    aiHint: "social media schedule"
  },
  {
    id: "community",
    title: "Community Engagement & Building",
    description: "We foster vibrant and loyal online communities around your brand. Our team actively engages with your audience, responds to comments and messages, sparks conversations, and implements strategies to organically grow your follower base and brand advocates.",
    icon: <MessageCircle size={28} className="text-primary" />,
    features: [
      "Proactive Audience Interaction",
      "Comment & DM Management",
      "Online Reputation Monitoring",
      "Running Engaging Contests & Giveaways",
      "Building Relationships with Brand Advocates & Influencers",
    ],
    image: "https://placehold.co/550x400.png?text=Community",
    imageAlt: "Illustration of a thriving online community interacting",
    aiHint: "community interaction"
  },
  {
    id: "analytics",
    title: "Analytics, Reporting & Optimization",
    description: "We believe in data-driven decision-making. Our team meticulously tracks key performance indicators (KPIs), provides regular, easy-to-understand reports, and uses these insights to continuously refine and optimize your social media strategy for maximum impact and ROI.",
    icon: <BarChartHorizontal size={28} className="text-primary" />,
    features: [
      "Comprehensive Performance Tracking",
      "Customized Monthly & Quarterly Reports",
      "A/B Testing for Content, Ads & CTAs",
      "Campaign Performance Analysis & Insights",
      "Data-Driven Strategy Adjustments & Recommendations",
    ],
    image: "https://placehold.co/550x400.png?text=Analytics",
    imageAlt: "Social media analytics dashboard showing graphs and charts",
    aiHint: "data report"
  },
  {
    id: "advertising",
    title: "Paid Social Advertising",
    description: "Amplify your reach, target specific demographics, and achieve your marketing objectives with expertly managed paid social advertising campaigns. We handle everything from ad creative and copywriting to audience targeting, budget optimization, and performance analysis.",
    icon: <TrendingUp size={28} className="text-primary" />,
    features: [
      "Facebook, Instagram, LinkedIn, TikTok & X (Twitter) Ads Management",
      "Advanced Audience Targeting & Segmentation",
      "Ad Creative Development (Visuals & Copy)",
      "Campaign Setup, Monitoring & Optimization",
      "Budget Management & ROI Tracking",
      "Retargeting Campaigns",
    ],
    image: "https://placehold.co/550x400.png?text=Advertising",
    imageAlt: "Graph showing successful social media ad campaign growth",
    aiHint: "advertising results"
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {/* Page Header */}
        <section className="bg-gradient-to-b from-primary/5 via-background to-background pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-primary mb-4">Our Services</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive social media solutions tailored to elevate your brand, engage your audience, and drive meaningful results.
            </p>
          </div>
        </section>

        {/* Services List */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-20 md:space-y-28">
              {servicesList.map((service, index) => (
                <div key={service.id} id={service.id} className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center scroll-mt-24`}>
                  <div className={`relative ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                    <div className="absolute -top-4 -left-4 w-20 h-20 bg-accent/10 rounded-full hidden md:block" aria-hidden="true"></div>
                    <Image
                      src={service.image}
                      alt={service.imageAlt}
                      width={550}
                      height={400}
                      className="rounded-xl shadow-2xl object-cover w-full relative z-10"
                      data-ai-hint={service.aiHint}
                    />
                  </div>
                  <div className={`${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                    <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full mb-5">
                      {service.icon}
                      <h2 className="text-2xl md:text-3xl font-bold font-headline text-foreground">{service.title}</h2>
                    </div>
                    <p className="text-muted-foreground mb-6 text-base md:text-lg leading-relaxed">{service.description}</p>
                    <ul className="space-y-3 mb-8">
                      {service.features.map(feature => (
                        <li key={feature} className="flex items-start">
                          <CheckCircle size={20} className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground text-sm md:text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-lg px-8 py-3">
                      <Link href={`/contact?service=${encodeURIComponent(service.title)}`}>Get Started with {service.title.split(" ")[0]}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground mb-6">Ready to Transform Your Social Presence?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Partner with Blisszits to unlock your brand's full potential on social media. We're excited to help you achieve your goals.
            </p>
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-3.5 shadow-lg rounded-lg">
              <Link href="/contact">Request a Free Proposal</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

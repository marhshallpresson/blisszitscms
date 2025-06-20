// src/app/about/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Award, Users, Lightbulb, CheckCircle, Sparkles } from "lucide-react";

export default function AboutPage() {
  const teamMembers = [
    { name: "Marshall Presson", role: "Founder & Lead Strategist", image: "https://placehold.co/300x300.png?text=MP", aiHint: "professional headshot" },
    { name: "Jane Doe", role: "Head of Content Creation", image: "https://placehold.co/300x300.png?text=JD", aiHint: "professional headshot" },
    { name: "John Smith", role: "Community Engagement Lead", image: "https://placehold.co/300x300.png?text=JS", aiHint: "professional headshot" },
  ];

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-b from-primary/5 via-background to-background pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-primary mb-4">About Blisszits</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We are a passionate team of social media experts dedicated to crafting engaging narratives and building vibrant online communities for your brand.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground mb-6">Our Journey & Philosophy</h2>
              <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
                Founded by Marshall Presson, Blisszits emerged from a desire to bridge the gap between brands and their audiences in the ever-evolving digital landscape. We witnessed firsthand the challenges businesses face in creating authentic, impactful social media presences.
              </p>
              <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
                Our philosophy is simple: combine data-driven strategy with creative storytelling to foster genuine connections. We believe that successful social media management goes beyond mere posting; it's about building communities, sparking conversations, and delivering measurable value.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Every brand has a unique story. Our mission is to help you tell yours in the most compelling way possible, leveraging the right platforms and content to achieve your specific business objectives.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <Image
                src="https://placehold.co/600x500.png" // Replace with an actual image representing the brand or team
                alt="Blisszits team strategizing"
                width={600}
                height={500}
                className="rounded-xl shadow-2xl object-cover"
                data-ai-hint="team meeting brainstorming"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">Our Core Values</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              These principles are the bedrock of our work and partnerships.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-xl shadow-lg text-center border border-border/60 hover:shadow-xl transition-shadow">
              <div className="bg-accent/10 p-4 rounded-full inline-block mb-5"><Sparkles size={32} className="text-accent" /></div>
              <h3 className="text-xl font-headline font-semibold text-card-foreground mb-3">Creativity & Innovation</h3>
              <p className="text-muted-foreground text-sm">We push boundaries and explore fresh ideas to ensure your content is not just seen, but remembered.</p>
            </div>
            <div className="bg-card p-8 rounded-xl shadow-lg text-center border border-border/60 hover:shadow-xl transition-shadow">
              <div className="bg-accent/10 p-4 rounded-full inline-block mb-5"><Users size={32} className="text-accent" /></div>
              <h3 className="text-xl font-headline font-semibold text-card-foreground mb-3">Client-Centric Partnership</h3>
              <p className="text-muted-foreground text-sm">Your success is our success. We work collaboratively, as a true extension of your team.</p>
            </div>
            <div className="bg-card p-8 rounded-xl shadow-lg text-center border border-border/60 hover:shadow-xl transition-shadow">
              <div className="bg-accent/10 p-4 rounded-full inline-block mb-5"><CheckCircle size={32} className="text-accent" /></div>
              <h3 className="text-xl font-headline font-semibold text-card-foreground mb-3">Integrity & Transparency</h3>
              <p className="text-muted-foreground text-sm">We believe in honest communication and ethical practices in all our endeavors.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Meet The Team Section (Optional - Placeholder) */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">Meet Our Core Team</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
              The dedicated professionals behind your social media success.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-card p-6 rounded-xl shadow-lg border border-border/60 text-center">
                <Image 
                  src={member.image} 
                  alt={member.name} 
                  width={120} 
                  height={120} 
                  className="rounded-full mx-auto mb-4 object-cover ring-2 ring-primary/20"
                  data-ai-hint={member.aiHint}
                />
                <h3 className="text-lg font-headline font-semibold text-card-foreground">{member.name}</h3>
                <p className="text-primary text-sm font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-headline text-foreground mb-6">Ready to Start Your Blisszits Journey?</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            We're excited to learn about your brand and discuss how we can help you achieve your social media aspirations.
          </p>
          <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-3 shadow-lg rounded-lg">
            <Link href="/contact">Let's Talk</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

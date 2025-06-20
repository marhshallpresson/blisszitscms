// src/app/faq/page.tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "What kind of businesses do you work with?",
    answer: "We work with a diverse range of businesses, from startups and small local companies to established brands and enterprises across various industries. If you're looking to improve your social media presence, we can help!"
  },
  {
    question: "How do you measure the success of social media campaigns?",
    answer: "Success is measured based on the specific goals set at the beginning of our engagement. Key Performance Indicators (KPIs) typically include reach, engagement rate, follower growth, website traffic, lead generation, and conversions. We provide regular, detailed reports to track progress."
  },
  {
    question: "What platforms do you specialize in?",
    answer: "Our team has expertise across all major social media platforms, including Instagram, Facebook, X (formerly Twitter), LinkedIn, TikTok, Pinterest, and YouTube. We recommend platforms based on your target audience and business objectives."
  },
  {
    question: "How much do your services cost?",
    answer: "Our pricing is tailored to the specific needs and scope of each client's project. We offer various packages and can create custom proposals. Please contact us for a free consultation and quote."
  },
  {
    question: "How long does it take to see results?",
    answer: "Social media growth and engagement are typically gradual processes. While some quick wins are possible, sustainable results often take a few months of consistent effort. We focus on building a strong foundation for long-term success."
  },
  {
    question: "Do I need to provide my own content (photos, videos)?",
    answer: "While we encourage clients to share any existing brand assets, we offer full content creation services, including photography, videography, and graphic design. We can work with what you have or create everything from scratch."
  },
  {
    question: "How involved will I need to be in the process?",
    answer: "Your level of involvement is flexible. We value collaboration and will keep you informed with regular updates and reports. We'll need your input for initial strategy and approvals, but our goal is to manage your social media effectively so you can focus on your core business."
  },
  {
    question: "Can you manage social media advertising campaigns?",
    answer: "Yes, we offer comprehensive paid social advertising services, including campaign strategy, ad creation, targeting, budget management, and performance optimization across various platforms."
  }
];

export default function FAQPage() {
  return (
    <>
      <section className="bg-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">Frequently Asked Questions</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about our social media management services.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqData.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-border/70 rounded-lg shadow-sm bg-card overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 text-left text-lg font-semibold font-headline text-card-foreground hover:no-underline hover:bg-secondary/50 transition-colors">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="text-center mt-12 md:mt-16">
            <h2 className="text-2xl font-headline text-foreground mb-3">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">We're here to help. Contact us for more information.</p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/contact">Contact Our Team</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

// src/app/terms-of-service/page.tsx
"use client";

export default function TermsOfServicePage() {
  return (
    <>
      <section className="bg-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">Terms of Service</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Please read these terms carefully before using our services.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-4xl mx-auto text-foreground">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2>1. Agreement to Terms</h2>
            <p>By accessing or using the services provided by Blisszits ("us", "we", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.</p>

            <h2>2. Services</h2>
            <p>Blisszits provides social media management, content creation, strategy development, and related digital marketing services as detailed in individual client agreements or service packages (the "Services"). The specific scope of Services, deliverables, and fees will be outlined in a separate Service Agreement or Proposal.</p>

            <h2>3. Client Responsibilities</h2>
            <p>As a client, you agree to:</p>
            <ul>
              <li>Provide timely access to necessary information, brand assets, social media accounts, and other resources required for us to perform the Services.</li>
              <li>Review and approve content and strategies in a timely manner as outlined in our communication protocols.</li>
              <li>Ensure that all information and materials provided to Blisszits are accurate, complete, and do not infringe upon the intellectual property rights of any third party.</li>
              <li>Comply with the terms of service of all social media platforms used in connection with our Services.</li>
            </ul>

            <h2>4. Payment Terms</h2>
            <p>Fees for Services will be set forth in the Service Agreement or Proposal. Unless otherwise agreed, payments are due as per the schedule outlined. Late payments may incur interest or suspension of Services.</p>

            <h2>5. Intellectual Property</h2>
            <p>Content specifically created by Blisszits for you as part of the paid Services (e.g., custom graphics, videos, copy) will become your property upon full payment for those Services, unless otherwise specified in the Service Agreement. Blisszits retains the right to use such created content for its own promotional purposes (e.g., in our portfolio) unless explicitly agreed otherwise in writing. Any pre-existing intellectual property of either party remains the property of that party.</p>

            <h2>6. Confidentiality</h2>
            <p>Both parties agree to keep confidential all non-public information received from the other party in connection with the Services. This obligation will survive the termination of our agreement.</p>
            
            <h2>7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Blisszits shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Services; (b) any conduct or content of any third party on the Services; or (c) unauthorized access, use or alteration of your transmissions or content. In no event shall Blisszits' aggregate liability for all claims relating to the Services exceed the amount paid by you to Blisszits for the Services in the three (3) months preceding the claim.</p>
            <p>Blisszits makes no guarantees regarding specific outcomes, follower counts, engagement levels, or sales figures, as social media performance is influenced by many factors beyond our direct control.</p>

            <h2>8. Term and Termination</h2>
            <p>The term of the Service Agreement will be specified therein. Either party may terminate the agreement with written notice if the other party breaches a material term of these Terms or the Service Agreement and fails to cure such breach within a specified period (e.g., 30 days). Specific termination clauses and any applicable early termination fees will be detailed in the Service Agreement.</p>

            <h2>9. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions.</p>

            <h2>10. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

            <h2>11. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p>Blisszits<br />
            Email: legal@blisszits.com<br />
            {/* Address: 123 Content St, Media City, MC 45678, Country */}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

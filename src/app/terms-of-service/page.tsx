
// src/app/terms-of-service/page.tsx
"use client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
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
              <p>By accessing or using the services provided by Blisszits ("us", "we", or "our"), including our website blisszits.com and any associated applications (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.</p>

              <h2>2. Services</h2>
              <p>Blisszits provides social media management, content creation, strategy development, a content management software application, and related digital marketing services as detailed in individual client agreements or service packages. The specific scope of Services, deliverables, and fees will be outlined in a separate Service Agreement or Proposal, or as described within the application.</p>

              <h2>3. User Accounts</h2>
              <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>


              <h2>4. Client and User Responsibilities</h2>
              <p>As a client or user of our Services, you agree to:</p>
              <ul>
                <li>Provide timely access to necessary information, brand assets, social media accounts, and other resources required for us to perform services or for you to use the application effectively.</li>
                <li>Review and approve content and strategies in a timely manner if applicable.</li>
                <li>Ensure that all information and materials provided to Blisszits or uploaded to the Service are accurate, complete, and do not infringe upon the intellectual property rights of any third party.</li>
                <li>Comply with the terms of service of all social media platforms used in connection with our Services.</li>
                <li>Use the Services in a lawful manner and not for any illegal or unauthorized purpose.</li>
              </ul>

              <h2>5. Payment Terms</h2>
              <p>Fees for Services or subscriptions will be set forth in the Service Agreement, Proposal, or within the application's subscription information. Unless otherwise agreed, payments are due as per the schedule outlined. Late payments may incur interest or suspension/termination of Services or access.</p>

              <h2>6. Intellectual Property</h2>
              <p>Content specifically created by Blisszits for you as part of paid services (e.g., custom graphics, videos, copy) will become your property upon full payment, unless otherwise specified. Blisszits retains the right to use such content for promotional purposes unless agreed otherwise. For content you create or upload within our application, you retain ownership, but grant Blisszits a license to host, display, and distribute it as necessary to provide the Services.</p>
              <p>The Blisszits name, logo, and the application itself are the property of Blisszits and are protected by copyright and trademark laws.</p>

              <h2>7. Confidentiality</h2>
              <p>Both parties agree to keep confidential all non-public information received from the other party in connection with the Services. This obligation will survive the termination of our agreement.</p>
              
              <h2>8. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, Blisszits shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Services; (b) any conduct or content of any third party on the Services; or (c) unauthorized access, use or alteration of your transmissions or content. In no event shall Blisszits' aggregate liability for all claims relating to the Services exceed the amount paid by you to Blisszits for the Services or subscription in the three (3) months preceding the claim.</p>
              <p>Blisszits makes no guarantees regarding specific outcomes, follower counts, engagement levels, or sales figures, as social media performance is influenced by many factors beyond our direct control.</p>

              <h2>9. Term and Termination</h2>
              <p>The term of any specific service agreement will be specified therein. For use of the application, these Terms are effective until terminated by you or us. We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
              <p>If you wish to terminate your account, you may simply discontinue using the Service. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>

              <h2>10. Governing Law</h2>
              <p>These Terms shall be governed and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions.</p>

              <h2>11. Changes to Terms</h2>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.</p>

              <h2>12. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at:</p>
              <p>Blisszits<br />
              Email: legal@blisszits.com<br />
              Nigeria</p> {/* Placeholder Address */}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

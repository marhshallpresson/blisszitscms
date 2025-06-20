
// src/app/privacy-policy/page.tsx
"use client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <section className="bg-primary/10 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">Privacy Policy</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Your privacy is important to us.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-4xl mx-auto text-foreground">
              <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

              <h2>1. Introduction</h2>
              <p>Welcome to Blisszits ("us", "we", or "our"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at info@blisszits.com.</p>
              <p>When you visit our website blisszits.com (the "Website"), and more generally, use any of our services (the "Services", which include the Website and any associated application), we appreciate that you are trusting us with your personal information. We take your privacy very seriously. In this privacy notice, we seek to explain to you in the clearest way possible what information we collect, how we use it and what rights you have in relation to it. We hope you take some time to read through it carefully, as it is important. If there are any terms in this privacy notice that you do not agree with, please discontinue use of our Services immediately.</p>
              
              <h2>2. Information We Collect</h2>
              <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services or otherwise when you contact us.</p>
              <p>The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make and the products and features you use. The personal information we collect may include the following:</p>
              <ul>
                <li><strong>Personal Information Provided by You.</strong> We collect names; phone numbers; email addresses; mailing addresses; usernames; passwords; contact preferences; contact or authentication data; billing addresses; date of birth; social media profile links; and other similar information.</li>
              </ul>
              <p>All personal information that you provide to us must be true, complete and accurate, and you must notify us of any changes to such personal information.</p>

              <h2>3. How We Use Your Information</h2>
              <p>We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We indicate the specific processing grounds we rely on next to each purpose listed below.</p>
              <p>We use the information we collect or receive:</p>
              <ul>
                <li><strong>To facilitate account creation and logon process.</strong> If you choose to link your account with us to a third-party account (such as your Google or Facebook account), we use the information you allowed us to collect from those third parties to facilitate account creation and logon process for the performance of the contract.</li>
                <li><strong>To post testimonials.</strong> We post testimonials on our Services that may contain personal information. Prior to posting a testimonial, we will obtain your consent to use your name and the content of the testimonial.</li>
                <li><strong>Request feedback.</strong> We may use your information to request feedback and to contact you about your use of our Services.</li>
                <li><strong>To manage user accounts.</strong> We may use your information for the purposes of managing our account and keeping it in working order.</li>
                <li><strong>To send administrative information to you.</strong> We may use your personal information to send you product, service and new feature information and/or information about changes to our terms, conditions, and policies.</li>
                <li><strong>To protect our Services.</strong> We may use your information as part of our efforts to keep our Services safe and secure (for example, for fraud monitoring and prevention).</li>
                <li><strong>To enforce our terms, conditions and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.</strong></li>
                <li><strong>To respond to legal requests and prevent harm.</strong> If we receive a subpoena or other legal request, we may need to inspect the data we hold to determine how to respond.</li>
                <li><strong>Fulfill and manage your orders.</strong> We may use your information to fulfill and manage your orders, payments, returns, and exchanges made through the Services.</li>
                <li><strong>Administer prize draws and competitions.</strong> We may use your information to administer prize draws and competitions when you elect to participate in our competitions.</li>
                <li><strong>To deliver and facilitate delivery of services to the user.</strong> We may use your information to provide you with the requested service.</li>
                <li><strong>To respond to user inquiries/offer support to users.</strong> We may use your information to respond to your inquiries and solve any potential issues you might have with the use of our Services.</li>
                <li><strong>To send you marketing and promotional communications.</strong> We and/or our third-party marketing partners may use the personal information you send to us for our marketing purposes, if this is in accordance with your marketing preferences. You can opt-out of our marketing emails at any time.</li>
                <li><strong>Deliver targeted advertising to you.</strong> We may use your information to develop and display personalized content and advertising (and work with third parties who do so) tailored to your interests and/or location and to measure its effectiveness.</li>
              </ul>

              <h2>4. Will Your Information Be Shared With Anyone?</h2>
              <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
              
              <h2>5. How Long Do We Keep Your Information?</h2>
              <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.</p>

              <h2>6. How Do We Keep Your Information Safe?</h2>
              <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security, and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.</p>

              <h2>7. What Are Your Privacy Rights?</h2>
              <p>In some regions (like the European Economic Area and the UK), you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.</p>

              <h2>8. Updates To This Notice</h2>
              <p>We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.</p>
              
              <h2>9. How Can You Contact Us About This Notice?</h2>
              <p>If you have questions or comments about this notice, you may email us at info@blisszits.com or by post to:</p>
              <p>Blisszits<br />
              123 Content St<br />
              Media City, MC 45678<br />
              Nigeria</p> {/* Placeholder Address */}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

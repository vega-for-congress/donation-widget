import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Footer } from './Footer';
import { Link } from 'react-router-dom';

export function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <a href="https://votevega.nyc/" className="inline-block">
          <img
            src="/assets/vega-red-black.png"
            alt="Vega for Congress"
            className="max-w-56 h-auto mx-auto"
          />
        </a>
      </div>

      {/* Main Content Card */}
      <div className="bg-card rounded-lg border shadow-sm">
        {/* Header */}
        <div className="border-b px-8 py-6">
          <Link to="/">
            <Button
              variant="ghost"
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back to Donation Page</span>
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
            <p className="text-sm text-muted-foreground italic">Last Updated: September 1, 2025</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 prose prose-gray max-w-none">
          {/* Section 1 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-muted-foreground">
              By accessing or using the Vega for Congress donation platform (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
          </div>

          {/* Section 2 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground mb-4">
              The Service is a donation processing platform operated by Vega for Congress, a federal political committee registered with the Federal Election Commission (FEC). The Service allows eligible donors to make contributions to support the congressional campaign of Jose Vega.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.1 Donation Processing</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>All donations are processed through secure third-party payment processors</li>
              <li>Donations may be made as one-time or recurring monthly contributions</li>
              <li>Processing fees may apply and can optionally be covered by the donor</li>
              <li>All transactions are subject to verification and compliance checks</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              3. Eligibility and Contribution Requirements
            </h2>
            <p className="text-muted-foreground mb-4">
              To use this Service and make contributions, you must meet all federal legal requirements:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Be a U.S. citizen or lawfully admitted permanent resident (green card holder)</li>
              <li>Be at least 18 years old</li>
              <li>Not be a federal contractor</li>
              <li>Make contributions from your own funds</li>
              <li>Use your own personal credit card (not corporate or business cards)</li>
              <li>Not exceed federal contribution limits ($3,500 per election cycle for individuals)</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              4. Prohibited Uses
            </h2>
            <p className="text-muted-foreground mb-4">You may not use the Service:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>To make contributions on behalf of another person or entity</li>
              <li>To make contributions using funds provided by another person or entity</li>
              <li>To circumvent federal election laws or contribution limits</li>
              <li>To make contributions using false or misleading information</li>
              <li>To engage in any illegal or fraudulent activity</li>
              <li>To attempt to disrupt or compromise the security of the Service</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              5. User Information and Verification
            </h2>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.1 Required Information</h3>
            <p className="text-muted-foreground mb-3">Federal law requires us to collect specific information for contributions:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Full name and contact information</li>
              <li>Mailing address</li>
              <li>Occupation and employer (for contributions over $200 aggregate)</li>
              <li>Payment information for processing</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">5.2 Information Accuracy</h3>
            <p className="text-muted-foreground mb-3">You agree to provide accurate, complete, and up-to-date information. Providing false information may result in:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Rejection or refund of your contribution</li>
              <li>Termination of your access to the Service</li>
              <li>Reporting to appropriate authorities as required by law</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              6. Payment and Refunds
            </h2>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.1 Payment Processing</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>All payments are processed securely through third-party providers</li>
              <li>You authorize us to charge your payment method for the donation amount and any applicable fees</li>
              <li>Recurring donations will be processed monthly until cancelled</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">6.2 Refund Policy</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Contribution refunds are processed in accordance with FEC regulations</li>
              <li>Refund requests must be submitted in writing to info@votevega.nyc</li>
              <li>Processing fees are generally non-refundable</li>
              <li>We reserve the right to refund contributions that violate federal election law</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              7. Privacy and Data Protection
            </h2>
            <p className="text-muted-foreground">
              Your privacy is important to us. Please review our Privacy Policy, which governs how we collect, use, and protect your personal information. By using the Service, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>
          </div>

          {/* Section 8 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              8. Security
            </h2>
            <p className="text-muted-foreground">
              While we implement appropriate security measures to protect your information, no method of transmission over the internet is 100% secure. You acknowledge that you provide your personal information at your own risk.
            </p>
          </div>

          {/* Section 9 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              9. Federal Election Law Compliance
            </h2>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.1 FEC Reporting</h3>
            <p className="text-muted-foreground mb-3">We are required by federal law to:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Report contributor information to the Federal Election Commission</li>
              <li>Make contribution records available for public inspection</li>
              <li>Maintain detailed records of all contributions</li>
              <li>Use best efforts to collect required donor information</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">9.2 Contribution Limits</h3>
            <p className="text-muted-foreground">
              Federal law limits individual contributions to $3,500 per election (primary and general elections are separate). We monitor contribution limits but you are responsible for ensuring your total contributions comply with federal law.
            </p>
          </div>

          {/* Section 10 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              10. Disclaimers and Limitations of Liability
            </h2>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">10.1 Service Availability</h3>
            <p className="text-muted-foreground">
              The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access to the Service and may suspend or modify the Service at any time.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">10.2 Limitation of Liability</h3>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, Vega for Congress shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </div>

          {/* Additional sections abbreviated for brevity */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              11. Contact Information
            </h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-muted border-l-4 border-foreground p-4 rounded-r-md">
              <div className="space-y-1">
                <p>Email: info@votevega.nyc</p>
                <p>Mail: Vega for Congress</p>
                <p>1157 INTERVALE AVENUE APT. 2D</p>
                <p>BRONX, NY 10459</p>
              </div>
            </div>
          </div>

          {/* Final sections */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              12. Governing Law
            </h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of the State of New York and federal election law. Any disputes will be resolved in the courts of New York County, New York.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              13. Changes to Terms
            </h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on this page with a new "Last Updated" date. Your continued use of the Service after changes become effective constitutes acceptance of the new Terms.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

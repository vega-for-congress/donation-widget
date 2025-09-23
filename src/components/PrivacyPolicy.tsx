import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Footer } from './Footer';
import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground italic">Last Updated: September 1, 2025</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 prose prose-gray max-w-none">
          {/* Important Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-md">
            <p className="font-semibold text-blue-900 mb-1">Important Notice:</p>
            <p className="text-blue-800 text-sm">
              This Privacy Policy explains how Vega for Congress collects, uses, and protects your personal information when you make donations through our platform. Political contributions are subject to federal reporting requirements that may make some of your information public.
            </p>
          </div>

          {/* Section 1 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground mb-4">
              We collect information that you provide directly to us and information that is automatically collected when you use our donation platform.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.1 Information You Provide</h3>
            <p className="text-muted-foreground mb-4">When you make a donation, we collect:</p>

            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-md">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border px-4 py-3 text-left font-semibold">Information Type</th>
                    <th className="border border-border px-4 py-3 text-left font-semibold">Required</th>
                    <th className="border border-border px-4 py-3 text-left font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr>
                    <td className="border border-border px-4 py-3">Full Name</td>
                    <td className="border border-border px-4 py-3">Yes</td>
                    <td className="border border-border px-4 py-3">FEC reporting, donation processing</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border px-4 py-3">Email Address</td>
                    <td className="border border-border px-4 py-3">Yes</td>
                    <td className="border border-border px-4 py-3">Donation receipts, communication</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-3">Phone Number</td>
                    <td className="border border-border px-4 py-3">Optional</td>
                    <td className="border border-border px-4 py-3">Communication, verification</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border px-4 py-3">Mailing Address</td>
                    <td className="border border-border px-4 py-3">Yes</td>
                    <td className="border border-border px-4 py-3">FEC reporting, verification</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-3">Occupation</td>
                    <td className="border border-border px-4 py-3">Yes (if &gt;$200 aggregate)</td>
                    <td className="border border-border px-4 py-3">FEC reporting requirements</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border px-4 py-3">Employer</td>
                    <td className="border border-border px-4 py-3">Yes (if &gt;$200 aggregate)</td>
                    <td className="border border-border px-4 py-3">FEC reporting requirements</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-3">Payment Information</td>
                    <td className="border border-border px-4 py-3">Yes</td>
                    <td className="border border-border px-4 py-3">Processing donations</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.2 Automatically Collected Information</h3>
            <p className="text-muted-foreground mb-3">When you visit our platform, we may automatically collect:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>IP address and geographic location</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and time spent</li>
              <li>Referring website information</li>
              <li>Technical information about your internet connection</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground mb-4">We use your personal information for the following purposes:</p>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.1 Donation Processing</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Processing your donation transactions</li>
              <li>Sending donation receipts and confirmations</li>
              <li>Managing recurring donations</li>
              <li>Fraud prevention and security</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.2 Legal Compliance</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Complying with Federal Election Commission (FEC) reporting requirements</li>
              <li>Verifying donor eligibility and contribution limits</li>
              <li>Maintaining required donation records</li>
              <li>Responding to legal requests and regulatory inquiries</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2.3 Communication</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Sending donation receipts and transaction confirmations</li>
              <li>Providing customer support</li>
              <li>Sending campaign updates and newsletters (with your consent)</li>
              <li>Notifying you of important changes to our services</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              3. Information Sharing and Disclosure
            </h2>
            <p className="text-muted-foreground mb-4">We may share your information in the following circumstances:</p>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.1 Federal Election Commission Reporting</h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 rounded-r-md">
              <p className="font-semibold text-yellow-900 mb-1">Public Disclosure:</p>
              <p className="text-yellow-800 text-sm">
                Federal law requires that we report contributor information to the FEC for donations over certain thresholds. This information becomes part of the public record and is available for public inspection.
              </p>
            </div>

            <p className="text-muted-foreground mb-3">Information that may become public includes:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Your name and address</li>
              <li>Donation amount and date</li>
              <li>Your occupation and employer (for contributions over $200 aggregate)</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.2 Service Providers</h3>
            <p className="text-muted-foreground mb-3">We share information with trusted third-party service providers who assist us with:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Payment processing (Stripe, PayPal, etc.)</li>
              <li>Email delivery services</li>
              <li>Data analytics and website functionality</li>
              <li>Customer support services</li>
              <li>Legal and accounting services</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.3 Legal Requirements</h3>
            <p className="text-muted-foreground mb-3">We may disclose your information when required by law or to:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Comply with legal process or government requests</li>
              <li>Protect our rights, privacy, safety, or property</li>
              <li>Investigate fraud or other illegal activities</li>
              <li>Enforce our Terms of Service</li>
            </ul>
          </div>


          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-2 mb-4">
              Contact Information
            </h2>
            <p className="text-muted-foreground mb-4">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>

            <div className="bg-muted border-l-4 border-foreground p-4 rounded-r-md">
              <div className="space-y-1">
                <p className="font-semibold">Privacy Officer</p>
                <p>Email: info@votevega.nyc</p>
                <p>Mail: Vega for Congress</p>
                <p>1157 INTERVALE AVENUE APT. 2D</p>
                <p>BRONX, NY 10459</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

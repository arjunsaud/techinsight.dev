import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service – TechInsight",
  description: "TechInsight terms of service and usage policies.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-serif text-4xl font-bold text-gray-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-400">Last updated: March 2026</p>

      <div className="mt-10 space-y-8 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
          <p className="mt-3">
            By accessing or using TechInsight, you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not
            use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">2. Use of the Service</h2>
          <p className="mt-3">
            TechInsight grants you a limited, non-exclusive, non-transferable
            license to access and use the service for personal, non-commercial
            purposes. You agree not to reproduce, distribute, or create
            derivative works without our express written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">3. Intellectual Property</h2>
          <p className="mt-3">
            All content published on TechInsight — including articles, graphics,
            logos, and code — is the property of TechInsight or its content
            suppliers and is protected by applicable copyright and intellectual
            property laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">4. Disclaimer of Warranties</h2>
          <p className="mt-3">
            The service is provided &quot;as is&quot; without warranties of any kind,
            either express or implied. TechInsight does not warrant that the
            service will be uninterrupted, error-free, or free of viruses or
            other harmful components.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800">5. Contact</h2>
          <p className="mt-3">
            Questions about these Terms? Contact us at{" "}
            <a
              href="mailto:legal@techinsight.dev"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              legal@techinsight.dev
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About – TechInsight",
  description: "Learn about TechInsight and our mission.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-serif text-4xl font-bold text-gray-900">About TechInsight</h1>
      <p className="mt-6 text-lg leading-relaxed text-gray-600">
        TechInsight is a publication dedicated to thoughtful, in-depth writing
        about technology — the ideas shaping our world, the tools we build, and
        the humans behind it all.
      </p>
      <p className="mt-4 text-lg leading-relaxed text-gray-600">
        We believe great writing has the power to make complex topics
        approachable and to spark meaningful conversations. Our goal is to
        surface stories that are worth your time.
      </p>

      <hr className="my-10 border-gray-100" />

      <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>
      <p className="mt-4 text-gray-600 leading-relaxed">
        To publish honest, well-researched journalism and essays about the
        technology industry — without hype, without fluff, just stories worth
        reading.
      </p>

      <h2 className="mt-10 text-2xl font-semibold text-gray-800">Get in Touch</h2>
      <p className="mt-4 text-gray-600">
        We&apos;d love to hear from you. Reach us at{" "}
        <a
          href="mailto:hello@techinsight.dev"
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          hello@techinsight.dev
        </a>
        .
      </p>
    </div>
  );
}

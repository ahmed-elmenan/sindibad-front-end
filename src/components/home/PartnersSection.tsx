import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

function PartnersAutoScroll() {
  const logos = [
    "https://logo.clearbit.com/stripe.com",
    "https://logo.clearbit.com/airbnb.com",
    "https://logo.clearbit.com/github.com",
    "https://logo.clearbit.com/netflix.com",
    "https://logo.clearbit.com/spotify.com",
    "https://logo.clearbit.com/slack.com",
    "https://logo.clearbit.com/zoom.us",
    "https://logo.clearbit.com/uber.com",
    "https://logo.clearbit.com/shopify.com",
    "https://logo.clearbit.com/coinbase.com",
  ];
  // Duplicate logos for seamless loop
  const allLogos = [...logos, ...logos];

  // Detect RTL
  const [isRTL, setIsRTL] = useState<boolean>(false);
  useEffect(() => {
    setIsRTL(document.documentElement.dir === "rtl");
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Shadow gradients using bg-background for seamless effect */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10 bg-gradient-to-l from-background to-transparent" />
      <div className="w-full">
        <div
          className={`flex gap-8 py-4 px-2 ${
            isRTL ? "animate-partners-scroll-rtl" : "animate-partners-scroll"
          }`}
          style={{ width: "max-content" }}
        >
          {allLogos.map((url, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 bg-white rounded-xl shadow p-4 flex items-center justify-center h-24 w-48 border border-muted-foreground/10"
            >
              <img
                src={url}
                alt={`Partner ${idx + 1}`}
                className="max-h-16 max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PartnersSection = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-gradient-to-r from-green-500/10 to-blue-600/10 text-green-600 border-green-200 dark:border-green-800">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 11H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h4m0 0V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2m0 0V11"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 11h4a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-4"
              />
            </svg>
            Trusted Partners
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
            Industry Leaders Trust Us
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            We're proud to partner with top companies that recognize the value
            of continuous learning and skill development.
          </p>
        </motion.div>
        <PartnersAutoScroll />
      </div>
    </section>
  );
};

export default PartnersSection;

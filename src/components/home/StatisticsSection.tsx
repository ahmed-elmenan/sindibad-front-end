import { motion } from "framer-motion";


const StatisticsSection = () => {
    return (
          <section className="py-24 bg-gradient-to-b from-primary to-accent relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Our Impact & Reach
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              SindiBad is transforming education across the region with innovative learning solutions and community engagement.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "4+", label: "Events", delay: 0.1 },
              { number: "500+", label: "Workshops", delay: 0.2 },
              { number: "20 000", label: "Direct Beneficiaries", delay: 0.3 },
              { number: "25+", label: "Expert Partners", delay: 0.4 },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: stat.delay }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80 text-sm uppercase tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
}

export default StatisticsSection;

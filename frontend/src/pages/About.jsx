import { motion } from 'framer-motion'
import { Heart, Award, Users } from 'lucide-react'

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white">
      <section className="section-zen bg-gradient-to-r from-sage to-earth text-white">
        <div className="container-zen text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-zen font-bold mb-4"
          >
            About ZenStyle Salon
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl opacity-90 max-w-2xl mx-auto"
          >
            Where beauty art meets Zen philosophy
          </motion.p>
        </div>
      </section>

      <div className="container-zen py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl font-zen font-bold text-zen-800 mb-6">Our Story</h2>
            <p className="text-lg text-zen-600 leading-relaxed mb-4">
              ZenStyle Salon was born from a passion to bring not only external beauty, 
              but also relaxation and inner balance to every customer.
            </p>
            <p className="text-lg text-zen-600 leading-relaxed">
              We believe that beauty is not just about changing appearance, but also a journey 
              of self-discovery and self-love. With Zen philosophy, every service at ZenStyle 
              is performed in a peaceful, relaxing space.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: <Heart size={48} />, title: 'Dedicated', desc: 'Serving with heart' },
              { icon: <Award size={48} />, title: 'Professional', desc: 'International standard' },
              { icon: <Users size={48} />, title: 'Community', desc: '5000+ satisfied customers' }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-zen text-center"
              >
                <div className="text-zen-600 mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-xl font-zen font-semibold text-zen-800 mb-2">{value.title}</h3>
                <p className="text-zen-600">{value.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-12 bg-gradient-to-br from-zen-700 to-zen-900 rounded-2xl text-white"
          >
            <h2 className="text-3xl font-zen font-bold mb-4">Our Mission</h2>
            <p className="text-xl opacity-90">
              "Bringing beauty and peace to every customer, 
              helping them shine with the best version of themselves"
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default About

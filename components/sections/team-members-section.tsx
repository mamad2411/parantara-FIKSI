"use client"

import { motion } from "framer-motion"
import { Github } from "lucide-react"
import { useState } from "react"

const teamMembers = [
  {
    name: "Ahmad Zaidan Ali",
    position: "Full Stack Developer",
    description: "Tim HidupTebe",
    image: "/images/team/member1.jpg",
    github: "chaali03",
  },
  {
    name: "Satryo Agung Wicaksono",
    position: "Backend Developer & Database Developer",
    description: "Tim HidupTebe",
    image: "/images/team/member2.jpg",
    github: "Sazhumaa",
  },
  {
    name: "Muhammad Naufal Lutfi Nabil",
    position: "Backend Developer & Database Developer",
    description: "Tim HidupTebe",
    image: "/images/team/member3.jpg",
    github: "Lutfi1i",
  },
]

const githubContributors = [
  "chaali03",
  "Sazhumaa",
  "Lutfi1i",
]

export function TeamMembersSection() {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <section id="team" className="py-20 px-6 mb-88">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tim <span className="text-primary relative inline-block">
              HidupTebe
              <motion.svg
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                style={{ height: '12px' }}
              >
                <motion.path
                  d="M0,6 Q20,1 40,6 T80,6 T120,6 T160,6 T200,6 T240,6 T280,6 T300,6"
                  stroke="url(#gradient-team-section)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="1000"
                  initial={{ strokeDashoffset: 1000 }}
                  whileInView={{ strokeDashoffset: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="gradient-team-section" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Profesional yang berdedikasi untuk kemakmuran masjid di seluruh Indonesia
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl border border-yellow-200 bg-yellow-50 p-8 hover:shadow-2xl hover:shadow-yellow-200/50 transition-all duration-500 hover:-translate-y-2">
                {/* Gradient Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-yellow-300"
                  >
                    <div className="w-full h-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-4xl font-bold text-yellow-600">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  </motion.div>

                  {/* Info */}
                  <div className="text-center space-y-3">
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-yellow-600 transition-colors duration-300">
                      {member.name}
                    </h3>
                    <p className="text-yellow-600 font-semibold text-sm uppercase tracking-wider">
                      {member.position}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-200/50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* GitHub Contributors Marquee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-20"
        >
          <motion.h3 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center text-2xl font-bold mb-8"
          >
            Github Contributor
          </motion.h3>
          <div 
            className="relative overflow-hidden py-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div 
              className="flex gap-4 transition-all duration-500 ease-in-out"
              style={{
                animation: isPaused ? 'none' : 'marquee 25s linear infinite',
                animationPlayState: isPaused ? 'paused' : 'running'
              }}
            >
              {[...githubContributors, ...githubContributors, ...githubContributors, ...githubContributors, ...githubContributors, ...githubContributors].map((username, index) => (
                <motion.a
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + (index * 0.05) }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-background border border-border rounded-full hover:border-primary hover:shadow-lg hover:bg-primary/5 transition-all duration-300 whitespace-nowrap flex-shrink-0"
                >
                  <Github className="w-4 h-4" />
                  <span className="text-sm font-medium">{username}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

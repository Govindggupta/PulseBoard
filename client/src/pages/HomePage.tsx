import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  BarChart3,
  Users,
  Lock,
  Eye,
  Zap,
  ArrowRight,
  Activity,
  Menu,
  X,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Play,
  Globe,
  Clock,
  Shield,
} from 'lucide-react'

// Navbar Component
function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full pointer-events-none">
      <nav
        className={`pointer-events-auto transition-all duration-500 ease-in-out ${
          scrolled
            ? 'mt-4 bg-zinc-900/85 backdrop-blur border border-white/10 shadow-2xl shadow-black/35 py-3 px-6 rounded-lg w-[95%] max-w-4xl'
            : 'mt-0 bg-transparent py-5 px-6 w-full max-w-7xl'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center shadow-lg shadow-black/20">
              <Activity className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-50">PulseBoard</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
              Features
            </a>
            <a href="#benefits" className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
              Benefits
            </a>
            <a href="#how" className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
              How It Works
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/signin" className="text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors">
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/signup"
                className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold rounded-md transition-all shadow-md"
              >
                Get Started
              </Link>
            </motion.div>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-zinc-300" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-4 right-4 md:hidden border border-white/10 bg-zinc-900/95 backdrop-blur rounded-lg p-4 shadow-2xl shadow-black/35 pointer-events-auto"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" onClick={() => setIsOpen(false)} className="text-zinc-300 font-medium">
                Features
              </a>
              <a href="#benefits" onClick={() => setIsOpen(false)} className="text-zinc-300 font-medium">
                Benefits
              </a>
              <a href="#how" onClick={() => setIsOpen(false)} className="text-zinc-300 font-medium">
                How It Works
              </a>
              <div className="h-px bg-white/10 my-2"></div>
              <Link to="/signin" className="text-zinc-300 font-medium">
                Sign In
              </Link>
              <Link to="/signup" className="text-zinc-950 bg-zinc-100 text-center py-2 rounded-md font-semibold">
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Hero Section
function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background - Subtle gray */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-zinc-700/5 rounded-full blur-[120px] opacity-60 mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-600/5 rounded-full blur-[100px] opacity-50 mix-blend-screen pointer-events-none translate-x-[20%] translate-y-[20%]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-300">Real-time feedback made simple</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-50 mb-6"
          >
            Engage your audience <br className="hidden md:block" /> instantly
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Create interactive polls, collect responses in real time, track live analytics, and publish results when you're ready. Perfect for classrooms, events, teams, and communities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link
                to="/signup"
                className="w-full px-8 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                Create your first poll
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <a
                href="#how"
                className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 text-zinc-200 font-medium rounded-lg border border-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Play className="w-5 h-5 text-zinc-400" />
                Learn more
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-zinc-500 font-medium"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-400" /> Real-time analytics
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-zinc-400" /> Secure & private
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-zinc-400" /> Live results
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-zinc-400" /> Mobile friendly
            </div>
          </motion.div>
        </div>

        {/* Mockup Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 relative mx-auto max-w-5xl group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 top-1/2"></div>
          <div className="absolute -inset-1 bg-white/5 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>

          <div className="relative rounded-lg border border-white/10 bg-card/90 backdrop-blur shadow-2xl shadow-black/35 overflow-hidden">
            {/* Browser Header */}
            <div className="flex items-center px-4 py-3 border-b border-white/5 bg-zinc-950/80">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="mx-auto bg-white/5 px-4 py-1 rounded-md text-xs text-zinc-500 flex items-center gap-2 border border-white/5">
                <Lock className="w-3 h-3" /> pulseboard.live
              </div>
            </div>

            {/* Mockup Content */}
            <div className="p-6 md:p-8 bg-zinc-950/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-50 mb-1">Team Feedback Poll</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1.5 text-zinc-300 bg-white/5 px-2 py-0.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse"></span> Live
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">238 responses</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-zinc-900 border border-white/5 p-4 rounded-lg hover:border-white/10 transition-colors">
                  <div className="p-3 bg-white/5 rounded-md text-zinc-400 w-fit mb-3">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Total Responses</p>
                  <p className="text-2xl font-bold text-zinc-50 mt-1">2,847</p>
                </div>
                <div className="bg-zinc-900 border border-white/5 p-4 rounded-lg hover:border-white/10 transition-colors">
                  <div className="p-3 bg-white/5 rounded-md text-zinc-400 w-fit mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Participants</p>
                  <p className="text-2xl font-bold text-zinc-50 mt-1">1,203</p>
                </div>
                <div className="bg-zinc-900 border border-white/5 p-4 rounded-lg hover:border-white/10 transition-colors">
                  <div className="p-3 bg-white/5 rounded-md text-zinc-400 w-fit mb-3">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Engagement</p>
                  <p className="text-2xl font-bold text-zinc-50 mt-1">94.2%</p>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-6">
                <h4 className="text-zinc-50 font-semibold mb-4">Response Distribution</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-zinc-300">Very Satisfied</span>
                      <span className="text-zinc-200 font-medium">45%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div className="bg-zinc-300 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-zinc-300">Satisfied</span>
                      <span className="text-zinc-200 font-medium">38%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div className="bg-zinc-300 h-2 rounded-full" style={{ width: '38%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-zinc-300">Neutral</span>
                      <span className="text-zinc-200 font-medium">17%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div className="bg-zinc-300 h-2 rounded-full" style={{ width: '17%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Features Section
function Features() {
  const features = [
    {
      icon: Zap,
      title: 'Instant Polls',
      description: 'Create polls in seconds and start collecting feedback immediately from your audience.',
    },
    {
      icon: BarChart3,
      title: 'Live Analytics',
      description: 'Watch responses come in real-time with dynamic charts and detailed insights.',
    },
    {
      icon: Lock,
      title: 'Secure Voting',
      description: 'Protect your data with secure authentication and optional anonymous voting.',
    },
    {
      icon: Eye,
      title: 'Publish Control',
      description: 'Choose exactly when your poll results are visible to participants.',
    },
    {
      icon: Globe,
      title: 'Mobile Ready',
      description: 'Perfect responsive design works seamlessly on all devices and screen sizes.',
    },
    {
      icon: TrendingUp,
      title: 'Export Data',
      description: 'Download detailed reports and analytics for further analysis and sharing.',
    },
  ]

  return (
    <section id="features" className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-zinc-700/5 rounded-full blur-[120px] opacity-40 mix-blend-screen pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-50 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Everything you need to collect feedback, engage audiences, and make informed decisions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative p-6 rounded-lg border border-white/10 bg-white/[0.03] hover:border-white/20 transition-all duration-300 h-full backdrop-blur">
                  <div className="absolute inset-0 bg-white/[0.01] group-hover:bg-white/[0.02] rounded-lg transition duration-300"></div>

                  <div className="relative z-10">
                    <div className="p-3 bg-white/[0.08] rounded-lg w-fit mb-4">
                      <Icon className="w-6 h-6 text-zinc-400" />
                    </div>

                    <h3 className="text-lg font-semibold text-zinc-50 mb-2">{feature.title}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Benefits Section
function Benefits() {
  const benefits = [
    { icon: CheckCircle2, text: 'Increase audience engagement' },
    { icon: CheckCircle2, text: 'Make better decisions with real data' },
    { icon: CheckCircle2, text: 'Reduce response time to feedback' },
    { icon: CheckCircle2, text: 'Easy to set up and use' },
    { icon: CheckCircle2, text: 'Works with any audience size' },
    { icon: CheckCircle2, text: 'No technical expertise required' },
  ]

  return (
    <section id="benefits" className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-zinc-700/5 rounded-full blur-[120px] opacity-40 mix-blend-screen pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-50 mb-6">
              Why choose PulseBoard?
            </h2>
            <p className="text-lg text-zinc-400 mb-8">
              PulseBoard is built for organizations and individuals who want instant, reliable feedback without the complexity.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <Icon className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                    <span className="text-zinc-200 text-lg">{benefit.text}</span>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-10"
            >
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold rounded-lg transition-all shadow-lg"
              >
                Start for Free <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white/[0.03] rounded-xl p-8 border border-white/10">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Shield className="w-8 h-8 text-zinc-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-zinc-50 font-semibold mb-2">Enterprise Grade Security</h4>
                    <p className="text-zinc-400 text-sm">Your data is protected with industry-standard encryption and security practices.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Clock className="w-8 h-8 text-zinc-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-zinc-50 font-semibold mb-2">Lightning Fast</h4>
                    <p className="text-zinc-400 text-sm">Optimized performance ensures results load instantly, no matter the scale.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Users className="w-8 h-8 text-zinc-400 flex-shrink-0" />
                  <div>
                    <h4 className="text-zinc-50 font-semibold mb-2">Built for Scale</h4>
                    <p className="text-zinc-400 text-sm">Handle thousands of simultaneous participants without any performance issues.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Create a Poll',
      description: 'Write your question and add answer options in seconds.',
    },
    {
      number: '2',
      title: 'Share with Audience',
      description: 'Get a unique link or QR code to share with participants.',
    },
    {
      number: '3',
      title: 'Watch Live Results',
      description: 'See responses come in real-time with animated charts.',
    },
    {
      number: '4',
      title: 'Publish & Export',
      description: 'Decide when to show results and download detailed reports.',
    },
  ]

  return (
    <section id="how" className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-zinc-700/5 rounded-full blur-[120px] opacity-40 mix-blend-screen pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-50 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Four simple steps to start collecting feedback from your audience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="p-6 rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur">
                <div className="text-4xl font-bold text-zinc-400 mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-zinc-50 mb-2">{step.title}</h3>
                <p className="text-zinc-400 text-sm">{step.description}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-white/20" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA Section
function CTA() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-white/[0.01]"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-zinc-700/5 rounded-full blur-[120px] opacity-40 mix-blend-screen pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-zinc-50 mb-6">
            Ready to get feedback instantly?
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join thousands of organizations using PulseBoard to make better decisions, faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded-lg transition-all shadow-lg"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-zinc-200 font-medium rounded-lg border border-white/10 transition-all"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="text-zinc-50 font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <a href="#features" className="hover:text-zinc-200 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-zinc-200 transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-50 font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <a href="#" className="hover:text-zinc-200 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-zinc-200 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-50 font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <a href="#" className="hover:text-zinc-200 transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-zinc-200 transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-50 font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <a href="mailto:hello@pulseboard.com" className="hover:text-zinc-200 transition-colors">
                  hello@pulseboard.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-zinc-950" />
              </div>
              <span className="font-bold text-zinc-50">PulseBoard</span>
            </div>
            <p className="text-sm text-zinc-500">© 2026 PulseBoard. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main HomePage Component
export function HomePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <Navbar />
      <Hero />
      <Features />
      <Benefits />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  )
}

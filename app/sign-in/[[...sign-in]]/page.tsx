"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Lock, Mail, Building2, Briefcase, ArrowLeft, ArrowRight } from 'lucide-react'
import { NeonButton } from '@/components/ui/neon-button'
import { FuturisticInput } from '@/components/ui/futuristic-input'
import { GlassCard } from '@/components/ui/glass-card'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type AuthPath = 'none' | 'investor' | 'real_user'

export default function Page() {
  const router = useRouter()
  const [path, setPath] = useState<AuthPath>('none')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Clear any existing sessions when visiting the sign-in portal
  useEffect(() => {
    localStorage.removeItem('donna_demo_session')
    localStorage.removeItem('donna_demo_user')
    localStorage.removeItem('donna_investor_preview')
    document.cookie = 'donna_demo_session=; path=/; max-age=0'
    document.cookie = 'donna_demo_user=; path=/; max-age=0'
    
    // Also sign out of Supabase to ensure a clean state
    supabase.auth.signOut().catch(console.error)
  }, [])

  const setLocalSession = (userEmail: string) => {
    localStorage.setItem('donna_demo_session', 'true')
    localStorage.setItem('donna_demo_user', userEmail)
    localStorage.setItem('donna_investor_preview', 'true')
    
    document.cookie = `donna_demo_session=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    document.cookie = `donna_demo_user=${userEmail}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
  }

  const handleInvestorLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (email.toUpperCase() === 'DONNA' && password === 'DONNA123') {
      setLocalSession('DONNA')
      setTimeout(() => {
        setIsLoading(false)
        router.push('/')
      }, 500)
    } else {
      setError('Invalid investor credentials.')
      setIsLoading(false)
    }
  }

  const handleRealUserLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Route to the appropriate drive page based on their role
        try {
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single()
            
          if (profile?.role === 'admin' || profile?.role === 'facilitator') {
            router.push('/drive/facilitator')
          } else {
            router.push('/drive/dashboard')
          }
        } catch (err) {
          // Fallback if role check fails
          router.push('/drive/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.')
      setIsLoading(false)
    }
  }

  const resetPath = () => {
    setPath('none')
    setError('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#0C0F16] to-[#10121A] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-donna-purple/10 via-donna-cyan/5 to-transparent rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl z-10"
      >
        <AnimatePresence mode="wait">
          {path === 'none' && (
            <motion.div
              key="portal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-donna-purple to-donna-cyan mb-2 shadow-lg shadow-donna-purple/20"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-4xl font-bold tracking-tight text-white">Welcome to DONNA</h1>
                <p className="text-lg text-white/60">How are you using DONNA today?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Investor Path */}
                <button
                  onClick={() => setPath('investor')}
                  className="group relative text-left glass rounded-2xl border border-white/10 p-6 hover:border-donna-purple/50 hover:bg-white/[0.04] transition-all duration-300"
                >
                  <div className="mb-4 w-12 h-12 rounded-xl bg-donna-purple/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-6 h-6 text-donna-purple" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Investor Preview</h2>
                  <p className="text-sm text-white/50 leading-relaxed">
                    I have investor demo credentials and want to explore the static platform features.
                  </p>
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-white/50" />
                  </div>
                </button>

                {/* Real User Path */}
                <button
                  onClick={() => setPath('real_user')}
                  className="group relative text-left glass rounded-2xl border border-white/10 p-6 hover:border-donna-cyan/50 hover:bg-white/[0.04] transition-all duration-300"
                >
                  <div className="mb-4 w-12 h-12 rounded-xl bg-donna-cyan/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-6 h-6 text-donna-cyan" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">DONNA Drive</h2>
                  <p className="text-sm text-white/50 leading-relaxed">
                    I am a real user logging into my account, or I want to register for the live simulation.
                  </p>
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-white/50" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {path === 'investor' && (
            <motion.div
              key="investor-login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 space-y-6 max-w-md mx-auto">
                <button 
                  onClick={resetPath}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-donna-purple/20 mb-2">
                    <Briefcase className="w-6 h-6 text-donna-purple" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Investor Login</h2>
                </div>

                <div className="p-4 rounded-lg bg-donna-purple/10 border border-donna-purple/20">
                  <p className="text-xs text-white/60 mb-2">Demo Credentials:</p>
                  <p className="text-sm text-white/80 font-mono">Username: DONNA</p>
                  <p className="text-sm text-white/80 font-mono">Password: DONNA123</p>
                </div>

                <form onSubmit={handleInvestorLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Username
                    </label>
                    <FuturisticInput
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter username"
                      className="w-full"
                      autoFocus
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Password
                    </label>
                    <FuturisticInput
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full"
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <NeonButton type="submit" className="w-full" disabled={isLoading || !email || !password}>
                    {isLoading ? 'Signing in...' : 'Enter Preview'}
                  </NeonButton>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {path === 'real_user' && (
            <motion.div
              key="real-user-login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 space-y-6 max-w-md mx-auto">
                <button 
                  onClick={resetPath}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-donna-cyan/20 mb-2">
                    <Building2 className="w-6 h-6 text-donna-cyan" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Log In</h2>
                </div>

                <form onSubmit={handleRealUserLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </label>
                    <FuturisticInput
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      className="w-full"
                      autoFocus
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Password
                    </label>
                    <FuturisticInput
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full"
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <NeonButton type="submit" className="w-full" disabled={isLoading || !email || !password}>
                    {isLoading ? 'Authenticating...' : 'Sign In'}
                  </NeonButton>
                </form>

                <div className="pt-6 border-t border-white/10 text-center space-y-4">
                  <p className="text-sm text-white/60">Don't have an account?</p>
                  <Link 
                    href="/drive"
                    className="block w-full py-2.5 rounded-xl border border-donna-cyan/30 text-donna-cyan hover:bg-donna-cyan/10 transition-colors text-sm font-medium"
                  >
                    Register for DONNA Drive
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

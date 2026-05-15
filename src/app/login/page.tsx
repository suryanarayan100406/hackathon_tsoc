'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/providers/ThemeProvider'
import {
  Mail, Lock, User, Eye, EyeOff, GraduationCap,
  Sun, Moon, Sparkles, BookOpen, Trophy, Gamepad2
} from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    grade: 6,
  })
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Registration failed')
          setLoading(false)
          return
        }
      }

      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const floatingIcons = [
    { icon: '📐', x: '10%', y: '20%', delay: 0 },
    { icon: '🧬', x: '85%', y: '15%', delay: 0.5 },
    { icon: '🔬', x: '5%', y: '70%', delay: 1 },
    { icon: '💡', x: '90%', y: '65%', delay: 1.5 },
    { icon: '🧮', x: '15%', y: '85%', delay: 2 },
    { icon: '⚡', x: '80%', y: '85%', delay: 0.8 },
    { icon: '🌍', x: '50%', y: '8%', delay: 1.2 },
    { icon: '🚀', x: '75%', y: '40%', delay: 0.3 },
  ]

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-30" />

      {/* Floating Subject Icons */}
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl md:text-4xl pointer-events-none select-none opacity-20"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-3 rounded-full transition-all hover:scale-110 z-10"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div
          className="glass-card p-8 md:p-10"
          style={{ border: '1px solid var(--border-color)' }}
        >
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                boxShadow: '0 8px 30px rgba(255, 107, 53, 0.3)',
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <GraduationCap size={32} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="gradient-text">VidyaQuest</span>
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Level Up Your Learning ✨
            </p>
          </div>

          {/* Features Strip */}
          <div
            className="flex items-center justify-center gap-4 mb-6 py-3 px-4 rounded-xl"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Gamepad2 size={14} style={{ color: 'var(--primary)' }} />
              <span>Play & Learn</span>
            </div>
            <div className="w-px h-4" style={{ background: 'var(--border-color)' }} />
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Trophy size={14} style={{ color: 'var(--accent)' }} />
              <span>Earn Rewards</span>
            </div>
            <div className="w-px h-4" style={{ background: 'var(--border-color)' }} />
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <BookOpen size={14} style={{ color: 'var(--secondary)' }} />
              <span>Master STEM</span>
            </div>
          </div>

          {/* Mode Toggle */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: mode === m ? 'var(--primary)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--text-secondary)',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl
                       font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] mb-4"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all
                             focus:ring-2 focus:ring-[var(--primary)]"
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                  }}
                />
              </div>
            )}

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all
                           focus:ring-2 focus:ring-[var(--primary)]"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                }}
              />
            </div>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none transition-all
                           focus:ring-2 focus:ring-[var(--primary)]"
                style={{
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer
                               focus:ring-2 focus:ring-[var(--primary)]"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <option value="STUDENT">🎓 Student</option>
                    <option value="TEACHER">👩‍🏫 Teacher</option>
                    <option value="ADMIN">⚙️ Admin</option>
                  </select>
                </div>
                {form.role === 'STUDENT' && (
                  <div className="relative">
                    <select
                      value={form.grade}
                      onChange={(e) => setForm({ ...form, grade: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer
                                 focus:ring-2 focus:ring-[var(--primary)]"
                      style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                        <option key={g} value={g}>
                          Grade {g}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm py-2.5 px-4 rounded-xl"
                style={{
                  background: 'rgba(239, 71, 111, 0.1)',
                  color: 'var(--error)',
                  border: '1px solid rgba(239, 71, 111, 0.2)',
                }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm
                         transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 6px 25px rgba(255, 107, 53, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={16} />
                  {mode === 'login' ? 'Start Your Quest' : 'Begin Your Journey'}
                </span>
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-4"
          style={{ color: 'var(--text-muted)' }}
        >
          Made with ❤️ for students across India
        </p>
      </motion.div>
    </div>
  )
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GameState {
  currentXP: number
  currentLevel: number
  streakDays: number
  theme: 'light' | 'dark'
  soundEnabled: boolean
  showConfetti: boolean
  recentXPGain: number

  addXP: (amount: number) => void
  setLevel: (level: number) => void
  setStreak: (days: number) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSound: () => void
  triggerConfetti: () => void
  setRecentXPGain: (amount: number) => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      currentXP: 0,
      currentLevel: 1,
      streakDays: 0,
      theme: 'dark',
      soundEnabled: true,
      showConfetti: false,
      recentXPGain: 0,

      addXP: (amount) =>
        set((state) => ({ currentXP: state.currentXP + amount })),
      setLevel: (level) => set({ currentLevel: level }),
      setStreak: (days) => set({ streakDays: days }),
      setTheme: (theme) => set({ theme }),
      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),
      triggerConfetti: () => {
        set({ showConfetti: true })
        setTimeout(() => set({ showConfetti: false }), 3000)
      },
      setRecentXPGain: (amount) => set({ recentXPGain: amount }),
    }),
    {
      name: 'vidyaquest-game-store',
    }
  )
)

// Notification store
interface NotificationState {
  notifications: Array<{
    id: string
    title: string
    message: string
    type: 'success' | 'error' | 'info' | 'xp' | 'badge' | 'levelup'
    timestamp: number
  }>
  addNotification: (notif: Omit<NotificationState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (notif) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notif, id: Math.random().toString(36).slice(2), timestamp: Date.now() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearAll: () => set({ notifications: [] }),
}))

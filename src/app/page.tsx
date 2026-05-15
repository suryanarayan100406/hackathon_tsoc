import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    const role = (session.user as any).role
    if (role === 'TEACHER') redirect('/teacher')
    else redirect('/dashboard')
  } else {
    redirect('/login')
  }
}

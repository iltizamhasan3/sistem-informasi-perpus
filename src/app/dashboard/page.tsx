import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardClient } from './client'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'admin') redirect('/my-borrowings')
  return <DashboardClient user={user} />
}

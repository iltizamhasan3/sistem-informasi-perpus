import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MyBookingsClient } from './client'

export default async function MyBookingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return <MyBookingsClient user={user} />
}

import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MyBorrowingsClient } from './client'

export default async function MyBorrowingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return <MyBorrowingsClient user={user} />
}

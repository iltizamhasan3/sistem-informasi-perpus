import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MyEbooksClient } from './client'

export default async function MyEbooksPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return <MyEbooksClient user={user} />
}

import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'
import { getCurrentUser } from '@/lib/auth'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'admin') redirect('/my-borrowings')
  return <AdminLayout initialUser={user}>{children}</AdminLayout>
}

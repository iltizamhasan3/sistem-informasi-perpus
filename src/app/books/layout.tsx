import { AdminLayout } from '@/components/admin-layout'
import { getCurrentUser } from '@/lib/auth'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  return <AdminLayout initialUser={user ?? undefined}>{children}</AdminLayout>
}

import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sidebarUser = {
    name: 'User',
    email: 'user@example.com',
    avatar_url: null,
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar user={sidebarUser} />
      <main className="lg:pl-[280px] min-h-screen">
        {children}
      </main>
    </div>
  )
}

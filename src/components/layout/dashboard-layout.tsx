import { Link } from 'react-router-dom';
import UserNav from '../shared/user-nav';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-md mb-1 border-b font-semibold">
          Users
        </Link>
        <UserNav />
      </div>

      <main className="relative mx-2 my-3 mr-2 flex-1 overflow-hidden rounded-xl  border border-gray-300 bg-gray-100 focus:outline-none md:mx-0 md:my-4 md:mr-4 ">
        {children}
      </main>
      <Toaster />
    </div>
  );
}

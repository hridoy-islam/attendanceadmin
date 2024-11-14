import PageHead from '@/components/shared/page-head.jsx';
import { useSelector } from 'react-redux';
import UserTableList from '../users/components/UserTableList';
import CreateUser from '../users/components/CreateUser';
import { useState } from 'react';

export default function DashboardPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserCreated = () => {
    setRefreshKey((prev) => prev + 1); // Update the key to trigger re-fetch
  };
  console.log(user);
  return (
    <>
      <div className="space-y-4 p-4 md:p-8">
        <PageHead title="Profile Page" />

        <CreateUser onUserCreated={handleUserCreated} />
        <UserTableList refreshKey={refreshKey} />
      </div>
    </>
  );
}

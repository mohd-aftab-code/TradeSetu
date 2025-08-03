'use client';
import AdminDashboard from './AdminDashboard/page';

export default function AdminPage() {
  // You can replace this with your actual logout logic
  const handleLogout = () => {
    // For now, just log out to the console
    console.log('Logout clicked');
  };

  return <AdminDashboard onLogout={handleLogout} />;
} 
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useRouter } from 'next/navigation';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children }) => {
  const { hasPermission, isLoading, user } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Checking permissions...</div>;
  }

  if (!user || !hasPermission(permission)) {
    // Redirect to a dedicated unauthorized page
    if (typeof window !== 'undefined') {
        router.replace('/dashboard/unauthorized');
    }
    return null;
  }

  return <>{children}</>;
};

export default PermissionGuard;

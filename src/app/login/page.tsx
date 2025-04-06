'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import Navbar from '@/components/ui/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'ok' | 'warning' | 'error' | 'checking'>('checking');
  const router = useRouter();

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      const response = await fetch('/api/db-check');
      const data = await response.json();
      setDbStatus(data.status as 'ok' | 'warning' | 'error');

      if (data.status === 'warning') {
        toast.warning(data.message);
      } else if (data.status === 'error') {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('DB check error:', error);
      setDbStatus('error');
      toast.error('Failed to check database connection');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (dbStatus !== 'ok') {
          toast.error('Database connection issue. Please check configuration.');
        } else {
          toast.error('Invalid credentials');
        }
      } else {
        toast.success('Login successful');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">Log In</h1>

          {dbStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <p className="font-medium">Database Error</p>
              </div>
              <p className="mt-1 text-sm">
                Cannot connect to the database. Please check your database configuration or contact support.
              </p>
            </div>
          )}

          {dbStatus === 'warning' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <p className="font-medium">Database Warning</p>
              </div>
              <p className="mt-1 text-sm">
                Database connected but schema not initialized. Tables need to be created.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || dbStatus === 'error'}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

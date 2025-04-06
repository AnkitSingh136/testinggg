'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Navbar from '@/components/ui/navbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id: number;
  username: string;
  full_name: string | null;
  profile_picture: string | null;
  coins: number;
  created_at: string;
  stats: {
    totalQuestions: number;
    correctAnswers: number;
    rank: number;
  };
}

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, [params.userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/${params.userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : profile?.username.substring(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <main className="container mx-auto py-8 px-4">
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <main className="container mx-auto py-8 px-4">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-2">User Not Found</h2>
            <p className="text-gray-600 mb-4">
              The user profile you are looking for could not be found.
            </p>
            <Button onClick={() => router.push('/leaderboard')}>
              Back to Leaderboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex flex-col md:flex-row items-center">
                <Avatar className="h-24 w-24 border-4 border-white">
                  <AvatarImage src={profile.profile_picture || ''} />
                  <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                  <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
                  <p className="text-blue-100">@{profile.username}</p>
                  <p className="text-blue-100">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-yellow-100 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-medium text-yellow-800 mb-1">🪙 Coins</h3>
                  <p className="text-3xl font-bold text-yellow-600">{profile.coins}</p>
                </div>

                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-medium text-green-800 mb-1">✅ Correct Answers</h3>
                  <p className="text-3xl font-bold text-green-600">{profile.stats.correctAnswers} / {profile.stats.totalQuestions}</p>
                </div>

                <div className="bg-blue-100 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-medium text-blue-800 mb-1">🏆 Rank</h3>
                  <p className="text-3xl font-bold text-blue-600">#{profile.stats.rank}</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button onClick={() => router.push('/leaderboard')} variant="outline">
                  Back to Leaderboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

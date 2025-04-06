'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Navbar from '@/components/ui/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id: number;
  username: string;
  email: string;
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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
      setFullName(data.full_name || '');
      setProfilePicture(data.profile_picture || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          profile_picture: profilePicture,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : profile?.username.substring(0, 2).toUpperCase();

  if (status === 'loading' || loading) {
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

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="container mx-auto py-8 px-4">
        {profile && (
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

                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Profile Information</h2>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                          Full Name
                        </label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>

                      <div>
                        <label htmlFor="profilePicture" className="block text-sm font-medium mb-1">
                          Profile Picture URL
                        </label>
                        <Input
                          id="profilePicture"
                          value={profilePicture}
                          onChange={(e) => setProfilePicture(e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Enter a URL to an image for your profile picture
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Username</p>
                        <p className="font-medium">{profile.username}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{profile.email}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{profile.full_name || 'Not provided'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

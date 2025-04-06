'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Navbar from '@/components/ui/navbar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Check, Trophy } from 'lucide-react';

interface TestSeries {
  id: number;
  name: string;
  description: string;
  coin_cost: number;
  created_at: string;
  question_count: number;
  purchased: boolean;
}

export default function TestSeriesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    fetchTestSeries();
  }, []);

  const fetchTestSeries = async () => {
    try {
      const response = await fetch('/api/test-series');
      if (!response.ok) {
        throw new Error('Failed to fetch test series');
      }
      const data = await response.json();
      setTestSeries(data);
    } catch (error) {
      console.error('Error fetching test series:', error);
      toast.error('Failed to load test series');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (id: number) => {
    if (!session) {
      toast.error('Please log in to purchase test series');
      router.push('/login');
      return;
    }

    setPurchasing(id);

    try {
      const response = await fetch('/api/test-series/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testSeriesId: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      toast.success(data.message);

      // Update user's coin balance in session
      if (session?.user && data.remainingCoins !== undefined) {
        session.user.coins = data.remainingCoins;
      }

      // Update test series list
      fetchTestSeries();
    } catch (error) {
      console.error('Purchase error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred during purchase');
      }
    } finally {
      setPurchasing(null);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Test Series</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unlock comprehensive test series to master aptitude skills across multiple topics.
            Use your earned coins to purchase these test series and advance your knowledge.
          </p>
        </div>

        {testSeries.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md mx-auto">
            <Trophy className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">No Test Series Available</h2>
            <p className="text-gray-600 mb-4">
              There are no test series available at the moment. Please check back later.
            </p>
            <Button onClick={() => router.push('/')}>
              Return to Home
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testSeries.map((series) => (
              <Card key={series.id} className="shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{series.name}</CardTitle>
                      <CardDescription>
                        {series.question_count} Questions
                      </CardDescription>
                    </div>
                    <div>
                      <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                        {series.coin_cost} 🪙
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{series.description}</p>
                </CardContent>
                <CardFooter>
                  {series.purchased ? (
                    <Button
                      className="w-full"
                      onClick={() => router.push(`/test-series/${series.id}`)}
                    >
                      <Check className="mr-2 h-4 w-4" /> Start Test
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={session?.user && (session.user.coins || 0) >= series.coin_cost ? 'default' : 'outline'}
                      disabled={!session || (session.user.coins || 0) < series.coin_cost || purchasing === series.id}
                      onClick={() => handlePurchase(series.id)}
                    >
                      {purchasing === series.id ? (
                        'Purchasing...'
                      ) : !session ? (
                        <>Log in to Purchase</>
                      ) : (session.user.coins || 0) < series.coin_cost ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Not Enough Coins
                        </>
                      ) : (
                        <>Purchase</>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {session && (
          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <div className="text-center mb-3">
              <h2 className="text-xl font-bold">Your Coin Balance</h2>
              <div className="inline-block bg-yellow-400 px-4 py-2 rounded-full text-yellow-900 font-semibold text-2xl mt-2">
                {session.user.coins || 0} 🪙
              </div>
            </div>
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              Earn more coins by answering questions correctly.
              Each correct answer earns you coins based on question difficulty.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

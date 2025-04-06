'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/navbar';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Topic {
  id: number;
  name: string;
  description: string;
  question_count: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  topics: Topic[];
}

export default function HomePage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    checkDatabaseAndFetchCategories();
  }, []);

  const checkDatabaseAndFetchCategories = async () => {
    // First check database connection
    try {
      const dbResponse = await fetch('/api/db-check');
      const dbData = await dbResponse.json();

      if (dbData.status === 'error') {
        setDbError(true);
        toast.error('Database connection failed: ' + dbData.message);
        setLoading(false);
        return;
      }

      if (dbData.status === 'warning') {
        toast.warning('Database tables not initialized: ' + dbData.message);
        setLoading(false);
        return;
      }

      // If database is OK, fetch categories
      await fetchCategories();
    } catch (error) {
      console.error('Error checking database:', error);
      setDbError(true);
      toast.error('Failed to connect to the database');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (colorClass: string) => {
    const colorMap: Record<string, string> = {
      'bg-primary': 'bg-blue-600',
      'bg-success': 'bg-green-600',
      'bg-info': 'bg-cyan-500',
      'bg-warning': 'bg-yellow-500',
      'bg-danger': 'bg-red-500',
    };

    return colorMap[colorClass] || 'bg-blue-600';
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-center mb-4">Welcome to AceYourAptitude</h2>
            <p className="text-center text-gray-700">
              Enhance your aptitude skills across multiple domains. Complete questions to earn coins and unlock test series.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
          </div>
        ) : dbError ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Database Connection Error</h3>
            <p className="mb-4">
              There was an issue connecting to the database. This may be due to incorrect configuration or the database server being unavailable.
            </p>
            <p className="mb-6 text-sm">
              Please check your database settings in the .env.local file and ensure MySQL is running with the correct credentials.
            </p>
            <Button
              onClick={() => checkDatabaseAndFetchCategories()}
              className="mx-auto"
            >
              Try Again
            </Button>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Categories Found</h3>
            <p className="mb-4">
              No categories were found in the database. This may be because the database is not properly initialized.
            </p>
            <p className="mb-6 text-sm">
              Database tables need to be created using the schema.sql file.
            </p>
            <Button
              onClick={() => checkDatabaseAndFetchCategories()}
              className="mx-auto"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="card h-100 shadow-sm">
                <div className={`card-header ${getCategoryColor(category.color)} text-white p-4 rounded-t-lg`}>
                  <h3 className="text-xl font-bold mb-0 flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </h3>
                </div>
                <div className="bg-white p-4 rounded-b-lg">
                  <p className="mb-3">{category.description}</p>
                  <ul className="space-y-1">
                    {category.topics.map((topic) => (
                      <li key={topic.id} className="topic-item">
                        <Link
                          href={`/topic/${topic.id}`}
                          className="block py-2 px-3 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          {topic.name}
                          {topic.question_count > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                              {topic.question_count} Q
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <div className="p-4 bg-yellow-400 rounded-lg">
            <h3 className="text-xl font-bold text-center mb-3">🏆 Test Series</h3>
            <p className="text-center">
              Use your earned coins to unlock comprehensive test series covering multiple topics.
            </p>
            <div className="text-center mt-4">
              <Link
                href="/test-series"
                className="inline-block py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Available Test Series
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-white py-6 mt-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} AceYourAptitude. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

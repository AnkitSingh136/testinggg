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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, X, AlertCircle } from 'lucide-react';

interface Question {
  id: number;
  topic_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty_level: string;
  coins_reward: number;
  attempted: boolean;
  correct: boolean | null;
}

interface Topic {
  id: number;
  name: string;
  description: string;
  category_name: string;
  category_icon: string;
  category_color: string;
}

export default function TopicPage({ params }: { params: { topicId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    coinsEarned: number;
    correctOption: string;
    explanation: string;
  } | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [params.topicId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/questions/topic/${params.topicId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setTopic(data.topic);
      setQuestions(data.questions);

      // Find the first unattempted question
      if (session) {
        const firstUnattemptedIndex = data.questions.findIndex((q: Question) => !q.attempted);
        if (firstUnattemptedIndex !== -1) {
          setCurrentQuestionIndex(firstUnattemptedIndex);
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }

    if (!session) {
      toast.error('Please log in to submit answers');
      router.push('/login');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/questions/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: questions[currentQuestionIndex].id,
          userAnswer: selectedOption,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();
      setResult(data);

      // Update the question in the questions array
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        attempted: true,
        correct: data.isCorrect,
      };
      setQuestions(updatedQuestions);

      if (data.coinsEarned > 0) {
        // Update session coins
        if (session?.user) {
          session.user.coins = (session.user.coins || 0) + data.coinsEarned;
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setResult(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      toast.success('You have completed all questions in this topic!');
    }
  };

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex];
  };

  const getDifficultyColor = (level: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
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

  const getOptionColor = (option: string) => {
    if (!result) return '';

    if (option === result.correctOption) {
      return 'border-green-500 bg-green-50 text-green-700';
    }

    if (option === selectedOption && option !== result.correctOption) {
      return 'border-red-500 bg-red-50 text-red-700';
    }

    return '';
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
        {topic && (
          <div className="mb-6">
            <div className={`p-6 rounded-lg ${getCategoryColor(topic.category_color)} text-white`}>
              <div className="flex items-center mb-2">
                <span className="text-3xl mr-3">{topic.category_icon}</span>
                <div>
                  <h1 className="text-2xl font-bold">{topic.name}</h1>
                  <p className="text-white text-opacity-80">{topic.category_name}</p>
                </div>
              </div>
              <p>{topic.description}</p>
            </div>
          </div>
        )}

        {questions.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">No Questions Available</h2>
            <p className="text-gray-600 mb-4">
              There are no questions available for this topic yet. Please check back later.
            </p>
            <Button onClick={() => router.push('/')}>
              Return to Home
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                      <CardDescription>
                        <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${getDifficultyColor(getCurrentQuestion().difficulty_level)}`}>
                          {getCurrentQuestion().difficulty_level.charAt(0).toUpperCase() + getCurrentQuestion().difficulty_level.slice(1)}
                        </span>
                        <span className="ml-2 text-yellow-600 font-medium">
                          🪙 {getCurrentQuestion().coins_reward} {getCurrentQuestion().coins_reward === 1 ? 'coin' : 'coins'}
                        </span>
                      </CardDescription>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500">Progress</div>
                      <div className="flex items-center mt-1">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(currentQuestionIndex + 1) / questions.length * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{Math.round((currentQuestionIndex + 1) / questions.length * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-0">
                  <div className="text-lg font-medium mb-6">
                    {getCurrentQuestion().question}
                  </div>

                  <RadioGroup
                    value={selectedOption || ''}
                    disabled={!!result}
                    onValueChange={handleOptionSelect}
                    className="space-y-3"
                  >
                    {['A', 'B', 'C', 'D'].map((option) => {
                      const optionKey = `option_${option.toLowerCase()}` as keyof Question;
                      return (
                        <div
                          key={option}
                          className={`flex items-start space-x-2 border p-4 rounded-md ${result ? getOptionColor(option) : 'hover:bg-slate-50'}`}
                        >
                          <RadioGroupItem
                            value={option}
                            id={`option-${option}`}
                            disabled={!!result}
                          />
                          <Label
                            htmlFor={`option-${option}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex">
                              <span className="font-medium mr-2">{option}.</span>
                              <span>{getCurrentQuestion()[optionKey] as string}</span>

                              {result && option === result.correctOption && (
                                <Check className="ml-2 h-5 w-5 text-green-600" />
                              )}

                              {result && option === selectedOption && option !== result.correctOption && (
                                <X className="ml-2 h-5 w-5 text-red-600" />
                              )}
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>

                  {result && (
                    <div className={`mt-6 p-4 rounded-md ${result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center font-medium mb-2">
                        {result.isCorrect ? (
                          <>
                            <Check className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-green-800">Correct Answer!</span>
                            {result.coinsEarned > 0 && (
                              <span className="ml-2 text-yellow-600">
                                +{result.coinsEarned} {result.coinsEarned === 1 ? 'coin' : 'coins'}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <X className="h-5 w-5 text-red-600 mr-2" />
                            <span className="text-red-800">Incorrect Answer</span>
                          </>
                        )}
                      </div>

                      <div className={result.isCorrect ? 'text-green-700' : 'text-red-700'}>
                        {result.explanation}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-end space-x-2 mt-6">
                  {!result ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedOption || submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Answer'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                    >
                      {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Question Navigator</CardTitle>
                  <CardDescription>Track your progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((question, index) => (
                      <button
                        key={question.id}
                        className={`w-10 h-10 rounded-md flex items-center justify-center font-medium text-sm ${
                          currentQuestionIndex === index
                            ? 'bg-blue-600 text-white'
                            : question.attempted
                              ? question.correct
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => {
                          setSelectedOption(null);
                          setResult(null);
                          setCurrentQuestionIndex(index);
                        }}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-100 rounded mr-2" />
                      <span>Not attempted</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-600 rounded mr-2" />
                      <span>Current</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-100 rounded mr-2" />
                      <span>Correct</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-100 rounded mr-2" />
                      <span>Incorrect</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

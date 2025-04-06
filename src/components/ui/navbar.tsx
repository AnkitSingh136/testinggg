'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, LogOut, User as UserIcon, Trophy, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/test-series', label: 'Test Series' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : session?.user?.username?.substring(0, 2).toUpperCase();

  return (
    <header className="bg-slate-900 text-white">
      <div className="container mx-auto">
        <div className="py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-white text-decoration-none">
              <h1 className="text-2xl md:text-3xl font-bold">AceYourAptitude</h1>
              <p className="text-sm md:text-base">Master your aptitude skills with practice tests</p>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {session?.user && (
              <div className="bg-yellow-400 text-slate-900 px-4 py-2 rounded-full font-semibold">
                <span className="mr-2">🪙 Coins:</span>
                <span>{session.user.coins || 0}</span>
              </div>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <nav className="bg-slate-800">
        <div className="container mx-auto">
          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-between">
            <ul className="flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block py-3 px-4 hover:bg-slate-700 transition-colors ${
                      pathname === link.href ? 'bg-blue-800' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center">
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center py-2 px-4 hover:bg-slate-700 transition-colors">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={session.user.image || ''} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block">{session.user.name || session.user.username}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/leaderboard" className="flex items-center">
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Leaderboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-red-500 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex">
                  <Link
                    href="/login"
                    className="py-3 px-4 hover:bg-slate-700 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="py-3 px-4 bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <ul className="flex flex-col">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block py-3 px-4 hover:bg-slate-700 transition-colors ${
                        pathname === link.href ? 'bg-blue-800' : ''
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {session?.user ? (
                  <>
                    <li>
                      <Link
                        href="/profile"
                        className="block py-3 px-4 hover:bg-slate-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left py-3 px-4 text-red-400 hover:bg-slate-700 transition-colors"
                      >
                        Sign out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/login"
                        className="block py-3 px-4 hover:bg-slate-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Log in
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/signup"
                        className="block py-3 px-4 bg-blue-600 hover:bg-blue-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
              {session?.user && (
                <div className="p-4 bg-slate-700">
                  <div className="bg-yellow-400 text-slate-900 px-4 py-2 rounded-full font-semibold text-center">
                    <span className="mr-2">🪙 Coins:</span>
                    <span>{session.user.coins || 0}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, LogOut, Plus, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase'; // Import the supabase client
import { useRouter } from 'next/navigation'; // For redirecting after logout

// Define menu items array
const menuItems = [
    {
        title: 'Expenses',
        icon: <LayoutDashboard className="h-4 w-4" />,
        path: '/admin/expenses',
    },
    {
        title: 'New Expense',
        icon: <Plus className="h-4 w-4" />,
        path: '/admin/new-expense',
    },
    {
        title: 'My Account',
        icon: <User className="h-4 w-4" />,
        path: '/admin/account',
    }
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // To track if user is logged in
    const pathname = usePathname();
    const router = useRouter(); // To handle page redirection after logout

    // Check if the user is logged in when the layout is loaded
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/'); // Redirect to root if not logged in
            } else {
                setIsLoggedIn(true); // Set logged in state to true
            }
        };

        checkSession();
    }, [router]);

    // Logout function
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut(); // Supabase logout

        if (error) {
            console.error('Error logging out:', error.message);
        } else {
            // Redirect to the login page after logging out
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Sidebar Navigation */}
            <div
                className={cn(
                    "bg-gray-900 text-white transition-all duration-300",
                    isCollapsed ? "w-16" : "w-64"
                )}
            >
                <div className="p-4 flex items-center justify-between">
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold">My Finance</h1>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-gray-800"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                </div>
                <nav className="mt-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex items-center px-4 py-2 hover:bg-gray-800",
                                pathname === item.path && "bg-gray-800"
                            )}
                        >
                            {item.icon}
                            {!isCollapsed && (
                                <span className="ml-2">{item.title}</span>
                            )}
                        </Link>
                    ))}
                    <Link
                        href="#"
                        onClick={async () => {
                            await supabase.auth.signOut();
                            router.push("/");
                        }}
                        className={cn(
                            "flex items-center px-4 py-2 hover:bg-gray-800"
                        )}
                    >
                        <LogOut className="h-4 w-4" />
                        {!isCollapsed && <span className="ml-2">Logout</span>}
                    </Link>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-100">
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LayoutDashboard, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase'; // Import the supabase client
import { useRouter } from 'next/navigation'; // For redirecting after logout

// Define menu items array
const menuItems = [
    {
        title: 'New Expense',
        icon: <LayoutDashboard className="h-4 w-4" />,
        path: '/admin/new-expense',
    },
    {
        title: 'Dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        path: '/admin/dashboard',
    },
    {
        title: 'My Expenses',
        icon: <LayoutDashboard className="h-4 w-4" />,
        path: '/admin/my-expenses',
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

    // If the session check is still loading, render nothing or a loading spinner
    if (isLoggedIn === null) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar Navigation */}
            <div
                className={cn(
                    'bg-gray-900 text-white transition-all duration-300',
                    isCollapsed ? 'w-16' : 'w-64'
                )}
            >
                <div className="p-4 flex items-center justify-between">
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold">1111 - Platform</h1>
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
                                'flex items-center px-4 py-2 hover:bg-gray-800',
                                pathname === item.path && 'bg-gray-800'
                            )}
                        >
                            {item.icon}
                            {!isCollapsed && (
                                <span className="ml-2">{item.title}</span>
                            )}
                        </Link>
                    ))}

                    {/* Logout Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            'flex items-center px-4 py-2 hover:bg-gray-800',
                            pathname === '/logout' && 'bg-gray-800'
                        )}
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        {!isCollapsed && <span className="ml-2">Logout</span>}
                    </Button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-100">
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}

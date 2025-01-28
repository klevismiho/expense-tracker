"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const HomePage = () => {
    const router = useRouter();
    const [loadingSession, setLoadingSession] = useState(true);

    // Check if the user is already logged in
    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                router.push("/admin/expenses");
            } else {
                setLoadingSession(false);
            }
        };

        checkSession();
    }, [router]);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                router.push("/admin/expenses");
            }
        });

        // Clean up the listener
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [router]);

    // Show a loading state while checking the session
    if (loadingSession) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-gray-700">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full sm:w-96">
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
                    Login
                </h2>

                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={["google", "github"]} // Add OAuth providers here
                />
            </div>
        </div>
    );
};

export default HomePage;

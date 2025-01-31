"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const HomePage = () => {
    const router = useRouter();
    const [loadingSession, setLoadingSession] = useState(true);
    const [isPasswordReset, setIsPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                if (session.user?.identities?.[0]?.identity_data?.email_verified) {
                    router.push("/admin/expenses");
                } else if (session.user) {
                    setIsPasswordReset(true);
                }
            } else {
                setLoadingSession(false);
            }
        };

        checkSession();
    }, [router]);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                setIsPasswordReset(true);
            } else if (session) {
                router.push("/admin/expenses");
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [router]);

    const handlePasswordUpdate = async () => {
        if (!newPassword) return;

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            alert(error.message);
        } else {
            alert("Password updated successfully! Redirecting...");
            router.push("/admin/expenses");
        }
    };

    if (loadingSession) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-gray-700">Loading...</div>
            </div>
        );
    }

    if (isPasswordReset) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md w-full sm:w-96">
                    <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
                        Reset Password
                    </h2>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full p-3 border rounded mb-4"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                        onClick={handlePasswordUpdate}
                        className="w-full bg-blue-500 text-white p-3 rounded font-bold"
                    >
                        Update Password
                    </button>
                </div>
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
                    providers={[]} 
                />
            </div>
        </div>
    );
};

export default HomePage;
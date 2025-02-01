"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const AccountPage = () => {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handlePasswordUpdate = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        if (!newPassword) {
            setError("Please enter a new password.");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            setError(error.message);
        } else {
            setSuccess("Password updated successfully!");
            setTimeout(() => {
                router.push("/admin/expenses");
            }, 2000);
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full sm:w-96">
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
                    Update Password
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
                    className="w-full bg-blue-500 text-white p-3 rounded font-bold disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
                {error && <p className="text-red-500 text-center mt-3">{error}</p>}
                {success && <p className="text-green-500 text-center mt-3">{success}</p>}
            </div>
        </div>
    );
};

export default AccountPage;
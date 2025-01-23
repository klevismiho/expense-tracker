// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Ensure your Supabase client is correctly imported
import ExpensesList from "@/components/ExpensesList"; // Create a component to render the expenses

type Expense = {
    id: string;
    comment: string;
    amount: number;
    category: string;
    date: string;
};

const HomePage = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // Track loading state
    const [error, setError] = useState<string | null>(null); // Track any error that might occur

    // Fetch expenses data from Supabase
    useEffect(() => {
        const fetchExpenses = async () => {
            const { data, error } = await supabase.from("expenses").select("*"); // Query expenses table

            if (error) {
                setError(error.message); // Handle error if query fails
                setLoading(false);
                return;
            }

            setExpenses(data); // Set data to state
            setLoading(false); // Stop loading
        };

        fetchExpenses(); // Call the fetch function
    }, []); // Empty dependency array to run only on component mount

    if (loading) {
        return <div>Loading...</div>; // Show loading state
    }

    if (error) {
        return <div>Error: {error}</div>; // Show error state
    }

    return (
        <div>
            <ExpensesList expenses={expenses} />
            {/* Pass expenses data to ExpensesList component */}
        </div>
    );
};

export default HomePage;

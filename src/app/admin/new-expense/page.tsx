"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Ensure your Supabase client is correctly imported
import { useRouter } from "next/navigation";


// Define the Category interface
interface Category {
    id: string;
    name: string;
}

const NewExpense = () => {
    const [comment, setComment] = useState<string>("");
    const [amount, setAmount] = useState<number>(0);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today's date
    const [categoryId, setCategoryId] = useState<string | null>(null); // Track the selected category ID
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // Success message state
    const router = useRouter(); // To redirect after adding the expense

    // Fetch categories from the database on mount
    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase.from("expense_categories").select("*");

            if (error) {
                setError(error.message); // Handle error if query fails
                return;
            }

            setCategories(data); // Set categories to state
        };

        fetchCategories(); // Fetch categories when component mounts
    }, []);

    // Handle form submission to add a new expense
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setError(null);
        setSuccessMessage(null); // Clear any previous success message

        // Get the current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            setError("No user session found.");
            setLoading(false);
            return;
        }

        const userId = session.user.id; // Get logged-in user's ID

        // Insert new expense into the database
        const { error: insertError } = await supabase
            .from("expenses")
            .insert([
                {
                    comment,
                    amount,
                    date,
                    user_id: userId, // Assign the logged-in user's ID to the new expense
                    category_id: categoryId, // Assign selected category_id to the expense
                },
            ]);

        if (insertError) {
            setError(insertError.message); // Handle error if insert fails
            setLoading(false);
            return;
        }

        // Set success message and reset the form
        setSuccessMessage("Expense added successfully!");
        setLoading(false);

        // Clear form fields after successful submission
        setComment("");
        setAmount(0);
        setDate(new Date().toISOString().split('T')[0]); // Reset date to today
        setCategoryId(null);

        // Optionally, redirect after a short delay
        setTimeout(() => {
            router.push("/admin/new-expense"); // Redirect to the same page or any other page
        }, 2000);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full sm:w-96">
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
                    Add New Expense
                </h2>

                {error && (
                    <p className="text-red-500 text-center mb-4">{error}</p>
                )}

                {successMessage && (
                    <p className="text-green-500 text-center mb-4">
                        {successMessage}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-gray-600"
                            htmlFor="amount"
                        >
                            Amount
                        </label>
                        <input
                            type="number"
                            id="amount"
                            className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter amount"
                            value={amount === 0 ? "" : amount}
                            onChange={(e) => {
                                const value = e.target.value;
                                setAmount(value === "" ? 0 : Number(value));
                            }}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-gray-600"
                            htmlFor="date"
                        >
                            Date
                        </label>
                        <input
                            type="date"
                            id="date"
                            className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Category dropdown */}
                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-gray-600"
                            htmlFor="category"
                        >
                            Category
                        </label>
                        <select
                            id="category"
                            className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={categoryId || ""}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="" disabled>
                                Select Category
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}{" "}
                                    {/* Display category name */}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label
                            className="block text-sm font-medium text-gray-600"
                            htmlFor="comment"
                        >
                            Comment
                        </label>
                        <input
                            type="text"
                            id="comment"
                            className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter expense comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {loading ? "Adding..." : "Add Expense"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewExpense;

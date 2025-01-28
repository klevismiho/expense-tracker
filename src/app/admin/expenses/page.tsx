"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ExpensesList from "@/components/ExpensesList";
import AllExpensesChart from "@/components/AllExpensesChart";

type Expense = {
    id: string;
    comment: string;
    amount: number;
    category: {
        id: string;
        name: string;
    };
    date: string;
};

const HomePage = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExpenses = async () => {
            const { data, error } = await supabase
                .from("expenses")
                .select(`
                    *,
                    category:expense_categories(id, name)
                `)
                .order('date', { ascending: true });

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            setExpenses(data);
            setLoading(false);
        };

        fetchExpenses();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from("expenses").delete().eq("id", id);

            if (error) {
                throw new Error(error.message);
            }

            setExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete expense");
        }
    };

    const handleUpdate = async (updatedExpense: Expense) => {
        try {
            const { error } = await supabase
                .from("expenses")
                .update({
                    comment: updatedExpense.comment,
                    amount: updatedExpense.amount,
                    date: updatedExpense.date
                })
                .eq("id", updatedExpense.id);

            if (error) {
                throw new Error(error.message);
            }

            // Update local state
            setExpenses(prevExpenses =>
                prevExpenses.map(expense =>
                    expense.id === updatedExpense.id ? updatedExpense : expense
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update expense");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!expenses.length) return <div>No expenses found</div>;

    return (
        <div>
            <AllExpensesChart expenses={expenses} />
            <div className="mt-6">
                <ExpensesList 
                    expenses={expenses} 
                    onDelete={handleDelete}
                    onUpdate={handleUpdate} 
                />
            </div>
        </div>
    );
};

export default HomePage;
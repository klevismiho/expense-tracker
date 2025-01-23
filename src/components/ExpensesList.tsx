import { FC } from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// In ExpensesList component
interface Expense {
    id: string;
    comment: string;
    amount: number;
    category: string;
    date: string;
}

interface Props {
    expenses: Expense[];
}

const ExpensesList: FC<Props> = ({ expenses }) => {
    return (
        <div>
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800">
                        Expenses List
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 text-left">Comment</th>
                                <th className="py-2 px-4 text-left">Amount</th>
                                <th className="py-2 px-4 text-left">Category</th>
                                <th className="py-2 px-4 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="border-b">
                                    <td className="py-2 px-4">{expense.comment}</td>
                                    <td className="py-2 px-4">{expense.amount}</td>
                                    <td className="py-2 px-4">{expense.category}</td>
                                    <td className="py-2 px-4">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpensesList;
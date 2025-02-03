import { FC, useState } from "react";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Expense {
    id: string;
    comment: string;
    amount: number;
    category: {
        id: string;
        name: string;
    };
    date: string;
}

interface Props {
    expenses: Expense[];
    onDelete: (id: string) => void;
    onUpdate: (expense: Expense) => void;
}

const ExpensesList: FC<Props> = ({ expenses, onDelete, onUpdate }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedExpense, setEditedExpense] = useState<Expense | null>(null);

    const handleEdit = (expense: Expense) => {
        setEditingId(expense.id);
        setEditedExpense(expense);
    };

    const handleSave = () => {
        if (editedExpense) {
            onUpdate(editedExpense);
            setEditingId(null);
            setEditedExpense(null);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditedExpense(null);
    };

    return (
        <div>
            <Card className="shadow-md">
                <CardContent className="p-4">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 text-left">Comment</th>
                                <th className="py-2 px-4 text-left">Amount</th>
                                <th className="py-2 px-4 text-left">Category</th>
                                <th className="py-2 px-4 text-left">Date</th>
                                <th className="py-2 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="border-b">
                                    <td className="py-2 px-4">
                                        {editingId === expense.id ? (
                                            <Input
                                                value={editedExpense?.comment}
                                                onChange={(e) => 
                                                    setEditedExpense(prev => 
                                                        prev ? {...prev, comment: e.target.value} : prev
                                                    )
                                                }
                                            />
                                        ) : (
                                            expense.comment
                                        )}
                                    </td>
                                    <td className="py-2 px-4">
                                        {editingId === expense.id ? (
                                            <Input
                                                type="number"
                                                value={editedExpense?.amount}
                                                onChange={(e) => 
                                                    setEditedExpense(prev => 
                                                        prev ? {...prev, amount: parseFloat(e.target.value)} : prev
                                                    )
                                                }
                                            />
                                        ) : (
                                            expense.amount
                                        )}
                                    </td>
                                    <td className="py-2 px-4">{expense.category?.name || 'N/A'}</td>
                                    <td className="py-2 px-4">
                                        {editingId === expense.id ? (
                                            <Input
                                                type="date"
                                                value={editedExpense?.date.split('T')[0]}
                                                onChange={(e) => 
                                                    setEditedExpense(prev => 
                                                        prev ? {...prev, date: e.target.value} : prev
                                                    )
                                                }
                                            />
                                        ) : (
                                            new Date(expense.date).toLocaleDateString('en-GB')
                                        )}
                                    </td>
                                    <td className="py-2 px-4 flex gap-2">
                                        {editingId === expense.id ? (
                                            <>
                                                <Button
                                                    variant="default"
                                                    onClick={handleSave}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={handleCancel}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleEdit(expense)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => onDelete(expense.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        )}
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
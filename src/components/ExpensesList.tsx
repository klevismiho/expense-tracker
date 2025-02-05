import { FC, useState, useMemo } from "react";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

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

type SortField = 'amount' | 'category' | 'date' | null;
type SortDirection = 'asc' | 'desc';

const ExpensesList: FC<Props> = ({ expenses, onDelete, onUpdate }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedExpense, setEditedExpense] = useState<Expense | null>(null);
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedExpenses = useMemo(() => {
        if (!sortField) return expenses;

        return [...expenses].sort((a, b) => {
            let compareA, compareB;

            switch (sortField) {
                case 'amount':
                    compareA = a.amount;
                    compareB = b.amount;
                    break;
                case 'category':
                    compareA = a.category?.name?.toLowerCase() || '';
                    compareB = b.category?.name?.toLowerCase() || '';
                    break;
                case 'date':
                    compareA = new Date(a.date).getTime();
                    compareB = new Date(b.date).getTime();
                    break;
                default:
                    return 0;
            }

            if (sortDirection === 'asc') {
                return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
            } else {
                return compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
            }
        });
    }, [expenses, sortField, sortDirection]);

    const totalAmount = useMemo(() => {
        return sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    }, [sortedExpenses]);

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

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1" />;
        return sortDirection === 'asc' ? 
            <ArrowUp className="w-4 h-4 ml-1" /> : 
            <ArrowDown className="w-4 h-4 ml-1" />;
    };

    return (
        <div>
            <Card className="shadow-md">
                <CardContent className="p-4">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 text-left">Comment</th>
                                <th 
                                    className="py-2 px-4 text-left cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('amount')}
                                >
                                    <div className="flex items-center">
                                        Amount
                                        {getSortIcon('amount')}
                                    </div>
                                </th>
                                <th 
                                    className="py-2 px-4 text-left cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('category')}
                                >
                                    <div className="flex items-center">
                                        Category
                                        {getSortIcon('category')}
                                    </div>
                                </th>
                                <th 
                                    className="py-2 px-4 text-left cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSort('date')}
                                >
                                    <div className="flex items-center">
                                        Date
                                        {getSortIcon('date')}
                                    </div>
                                </th>
                                <th className="py-2 px-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedExpenses.map((expense) => (
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
                                            Number.isInteger(expense.amount) ? expense.amount.toString() : expense.amount.toFixed(2)
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
                            <tr className="bg-gray-50 font-semibold">
                                <td className="py-3 px-4">Total</td>
                                <td className="py-3 px-4">{Number.isInteger(totalAmount) ? totalAmount.toString() : totalAmount.toFixed(2)}</td>
                                <td colSpan={3}></td>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExpensesList;
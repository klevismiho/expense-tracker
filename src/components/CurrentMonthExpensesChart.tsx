import React, { useMemo, useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

// Updated to match your detailed expense structure
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

// Type for the expense item in a category
interface CategoryExpenseItem {
    id: string;
    date: string;
    amount: number;
    comment: string;
}

// Type for category with expenses
interface CategoryWithExpenses {
    name: string;
    amount: number;
    percentage: number;
    expenses: CategoryExpenseItem[];
}

interface CurrentMonthExpensesChartProps {
    expenses: Expense[];
}

const CurrentMonthExpensesChart: React.FC<CurrentMonthExpensesChartProps> = ({
    expenses,
}) => {
    // State to track which categories are expanded
    const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});

    // Filter expenses to only show current month and process daily sums
    const { dailySums, monthTotal, monthName, categoryExpenses } = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Filter for expenses in the current month
        const currentMonthExpenses = expenses.filter((expense) => {
            const expenseDate = new Date(expense.date);
            return (
                expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear
            );
        });

        // Calculate total for the month
        const total = currentMonthExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );

        // Group expenses by day and calculate daily sums
        const dailyMap = new Map<number, { day: number; amount: number; fullDate: string }>();

        currentMonthExpenses.forEach((expense) => {
            const expenseDate = new Date(expense.date);
            const day = expenseDate.getDate();
            const fullDate = new Date(expense.date).toLocaleDateString("en-GB");

            if (dailyMap.has(day)) {
                const existingDay = dailyMap.get(day);
                if (existingDay) {
                    existingDay.amount += expense.amount;
                }
            } else {
                dailyMap.set(day, {
                    day,
                    amount: expense.amount,
                    fullDate,
                });
            }
        });

        // Convert to array and sort by day
        const result = Array.from(dailyMap.values());
        result.sort((a, b) => a.day - b.day);

        // Group expenses by category and store individual expenses
        const categoryMap = new Map<string, CategoryWithExpenses>();
        
        currentMonthExpenses.forEach((expense) => {
            const categoryName = expense.category.name;
            
            if (categoryMap.has(categoryName)) {
                const category = categoryMap.get(categoryName);
                if (category) {
                    category.amount += expense.amount;
                    category.expenses.push({
                        id: expense.id,
                        date: new Date(expense.date).toLocaleDateString("en-GB"),
                        amount: expense.amount,
                        comment: expense.comment
                    });
                }
            } else {
                categoryMap.set(categoryName, {
                    name: categoryName,
                    amount: expense.amount,
                    percentage: 0, // Will calculate after summing all
                    expenses: [{
                        id: expense.id,
                        date: new Date(expense.date).toLocaleDateString("en-GB"),
                        amount: expense.amount,
                        comment: expense.comment
                    }]
                });
            }
        });
        
        // Calculate percentages and sort by amount (descending)
        const categoryResults: CategoryWithExpenses[] = Array.from(categoryMap.values());
        categoryResults.forEach(category => {
            category.percentage = (category.amount / total) * 100;
            // Sort expenses by date (newest first)
            category.expenses.sort((a: CategoryExpenseItem, b: CategoryExpenseItem) => {
                // Parse dates in DD/MM/YYYY format
                const partsA = a.date.split('/');
                const partsB = b.date.split('/');
                
                // Create date objects (format: day/month/year)
                const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]));
                const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]));
                
                // Sort in descending order (newest first)
                return dateB.getTime() - dateA.getTime();
            });
        });
        
        categoryResults.sort((a, b) => b.amount - a.amount);

        // Get the month name
        const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        return {
            dailySums: result,
            monthTotal: total,
            monthName: monthNames[currentMonth],
            categoryExpenses: categoryResults,
        };
    }, [expenses]);

    return (
        <Card className="shadow-md">
            <CardContent className="p-4">
                <div className="flex flex-col gap-4 mb-4">
                    <div className="text-xl font-semibold">
                        {monthName} Daily Expenses
                    </div>
                    <div className="text-lg">
                        Total:{" "}
                        {Number.isInteger(monthTotal)
                            ? monthTotal
                            : monthTotal.toFixed(2)}
                    </div>
                </div>
                <div style={{ width: "100%", height: 400 }}>
                    {dailySums.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailySums}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="day"
                                    label={{
                                        value: "Day of Month",
                                        position: "insideBottom",
                                        offset: -5,
                                    }}
                                />
                                <YAxis
                                    tickFormatter={(value) =>
                                        Number.isInteger(value)
                                            ? value.toString()
                                            : value.toFixed(2)
                                    }
                                    width={80}
                                />
                                <Tooltip
                                    formatter={(value: number) => [
                                        Number.isInteger(value)
                                            ? value.toString()
                                            : value.toFixed(2),
                                        "Daily Total",
                                    ]}
                                    labelFormatter={(day) => {
                                        const dataPoint = dailySums.find(
                                            (d) => d.day === day
                                        );
                                        return `Date: ${dataPoint?.fullDate}`;
                                    }}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    name="Daily Expense"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    fillOpacity={0.6}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p>No expenses recorded for {monthName}</p>
                        </div>
                    )}
                </div>
                
                {/* Category expenses for this month section */}
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Category Expenses for {monthName}</h3>
                    {categoryExpenses.length > 0 ? (
                        <div className="space-y-4">
                            {categoryExpenses.map((category) => {
                                const isExpanded = expandedCategories[category.name] || false;
                                
                                return (
                                    <div 
                                        key={category.name} 
                                        className="border rounded-md shadow-sm overflow-hidden"
                                    >
                                        <div 
                                            className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => {
                                                setExpandedCategories({
                                                    ...expandedCategories,
                                                    [category.name]: !isExpanded
                                                });
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                <div className="font-medium">{category.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    ({category.expenses.length} transactions)
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <span>
                                                    {Number.isInteger(category.amount)
                                                        ? category.amount
                                                        : category.amount.toFixed(2)}
                                                </span>
                                                <span className="text-gray-500">
                                                    ({category.percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {isExpanded && (
                                            <div className="bg-white p-3">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {category.expenses.map((expense) => (
                                                                <tr key={expense.id} className="hover:bg-gray-50">
                                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
                                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                                                                        {Number.isInteger(expense.amount) 
                                                                            ? expense.amount 
                                                                            : expense.amount.toFixed(2)}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-sm text-gray-500">{expense.comment || "-"}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p>No category data available for {monthName}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CurrentMonthExpensesChart;
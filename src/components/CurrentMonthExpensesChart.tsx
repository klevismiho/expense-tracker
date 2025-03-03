import React, { useMemo } from "react";
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

interface CurrentMonthExpensesChartProps {
    expenses: Expense[];
}

const CurrentMonthExpensesChart: React.FC<CurrentMonthExpensesChartProps> = ({
    expenses,
}) => {
    // Filter expenses to only show current month and process daily sums
    const { dailySums, monthTotal, monthName } = useMemo(() => {
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
        const dailyMap = new Map();

        currentMonthExpenses.forEach((expense) => {
            const expenseDate = new Date(expense.date);
            const day = expenseDate.getDate();
            const fullDate = new Date(expense.date).toLocaleDateString("en-GB");

            if (dailyMap.has(day)) {
                dailyMap.get(day).amount += expense.amount;
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
            </CardContent>
        </Card>
    );
};

export default CurrentMonthExpensesChart;

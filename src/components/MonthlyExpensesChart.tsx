"use client";

import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

type Expense = {
    date: string;
    amount: number;
};

type MonthlyData = {
    month: string;
    totalAmount: number;
};

type MonthlyExpensesChartProps = {
    expenses: Expense[];
};

const MonthlyExpensesChart = ({ expenses }: MonthlyExpensesChartProps) => {
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

    useEffect(() => {
        // Process the expenses data to get monthly aggregates
        const aggregateMonthlyExpenses = () => {
            const monthlyMap: Record<string, number> = {};

            expenses.forEach((expense) => {
                // Extract year and month from the date string (format: YYYY-MM-DD)
                const date = new Date(expense.date);
                const yearMonth = `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}`;

                // Add to the corresponding month
                if (monthlyMap[yearMonth]) {
                    monthlyMap[yearMonth] += expense.amount;
                } else {
                    monthlyMap[yearMonth] = expense.amount;
                }
            });

            // Convert the map to array and sort by month
            const monthlyArray = Object.entries(monthlyMap).map(
                ([month, totalAmount]) => ({
                    month: formatMonthLabel(month),
                    totalAmount,
                    // Keep the original key for sorting
                    sortKey: month,
                })
            );

            // Sort by date (ascending)
            monthlyArray.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

            setMonthlyData(monthlyArray);
        };

        if (expenses.length > 0) {
            aggregateMonthlyExpenses();
        }
    }, [expenses]);

    // Format month label for display (e.g., "2023-01" to "Jan 2023")
    const formatMonthLabel = (yearMonth: string) => {
        const [year, month] = yearMonth.split("-");
        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    // Format the tooltip values
    const formatTooltip = (value: number) => {
        return `${value.toFixed(2)}`;
    };

    return (
        <div className="w-full bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Monthly Expenses</h2>
            <div className="h-64">
                {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={monthlyData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 60,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="month"
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis />
                            <Tooltip formatter={formatTooltip} />
                            <Bar
                                dataKey="totalAmount"
                                fill="#8884d8"
                                name="Amount"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p>No data available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyExpensesChart;
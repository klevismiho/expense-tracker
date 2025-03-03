import React, { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

// Interface for detailed expense structure
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

interface CurrentWeekExpensesChartProps {
    expenses: Expense[];
}

const CurrentWeekExpensesChart: React.FC<CurrentWeekExpensesChartProps> = ({
    expenses,
}) => {
    // Process data to get only the current week's expenses
    const { currentWeekData, weeklyTotal } = useMemo(() => {
        // Get precise date string in YYYY-MM-DD format
        function getDateString(date: Date): string {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }

        // Get the current date
        const now = new Date();

        // Get the day of week (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = now.getDay();

        // Create a new date object for the start of the week (Monday)
        const weekStart = new Date(now);

        if (dayOfWeek === 1) {
            // Today is Monday, just use today
            console.log("Today is Monday, using today for week start");
        } else {
            // Go back to the most recent Monday
            const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            weekStart.setDate(now.getDate() - daysToSubtract);
        }

        // Set to start of day
        weekStart.setHours(0, 0, 0, 0);

        // Define the structure for day data
        interface DayData {
            day: string;
            date: string;
            displayDate: string;
            amount: number;
        }

        // Initialize the days of the week
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const daysOfWeek: DayData[] = [];

        // Generate data for each day of the week
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(weekStart);
            currentDay.setDate(weekStart.getDate() + i);

            const dateStr = getDateString(currentDay);
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

            daysOfWeek.push({
                day: dayNames[i],
                date: dateStr,
                displayDate: `${currentDay.getDate()} ${
                    monthNames[currentDay.getMonth()]
                }`,
                amount: 0,
            });
        }

        // Track total amount for the week
        let total = 0;

        // Process expense data - match expenses to the correct day
        expenses.forEach((expense) => {
            // Extract the date part (YYYY-MM-DD) from the expense date
            // Handles both full ISO strings and simple YYYY-MM-DD formats
            const expenseDateStr = expense.date.split("T")[0];

            // Find the matching day in our week data
            const dayData = daysOfWeek.find(
                (day) => day.date === expenseDateStr
            );

            if (dayData) {
                dayData.amount += expense.amount;
                total += expense.amount;
            }
        });

        return {
            currentWeekData: daysOfWeek,
            weeklyTotal: total,
        };
    }, [expenses]);

    return (
        <Card className="shadow-md">
            <CardContent className="p-4">
                <div className="flex flex-col gap-4 mb-4">
                    <div className="text-xl font-semibold">
                        Current Week Expenses
                    </div>
                    <div className="text-lg">
                        Week Total:{" "}
                        {Number.isInteger(weeklyTotal)
                            ? weeklyTotal
                            : weeklyTotal.toFixed(2)}
                    </div>
                </div>
                <div style={{ width: "100%", height: 400 }}>
                    {weeklyTotal > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={currentWeekData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="day"
                                    tickFormatter={(day, index) => {
                                        const data = currentWeekData[index];
                                        return `${day} ${data.displayDate}`;
                                    }}
                                    height={60}
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
                                        "Amount",
                                    ]}
                                    labelFormatter={(day) => {
                                        const data = currentWeekData.find(
                                            (d) => d.day === day
                                        );
                                        return `${day} ${data?.displayDate} (${data?.date})`;
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="amount"
                                    name="Daily Total"
                                    fill="#82ca9d"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p>No expenses recorded for the current week</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CurrentWeekExpensesChart;

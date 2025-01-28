import React from "react";
import {
    LineChart,
    Line,
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

interface ExpenseData {
    date: string;
    amount: number;
}

// Define props for the component
interface AllExpensesChartProps {
    expenses: ExpenseData[]; // Accept dynamic expense data as a prop
}

const AllExpensesChart: React.FC<AllExpensesChartProps> = ({ expenses }) => {
    // Ensure the date is formatted correctly (if needed)
    const formattedData = expenses.map((expense) => ({
        ...expense,
        date: new Date(expense.date).toLocaleDateString(), // Format date for better readability
    }));

    return (
        <Card className="shadow-md">
            <CardContent className="p-4">
                <div style={{ width: "100%", height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {/* Add an area to display filled regions */}
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#82ca9d"
                                fill="#82ca9d"
                            />
                            {/* Optional: Include a line on top of the area */}
                            <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#8884d8"
                                activeDot={{ r: 8 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default AllExpensesChart;

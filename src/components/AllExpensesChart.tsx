import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";

interface ExpenseData {
    date: string;
    amount: number;
}

interface AllExpensesChartProps {
    expenses: ExpenseData[];
}

type DateRange = '7d' | '1m' | '3m' | '1y' | 'all';

const AllExpensesChart: React.FC<AllExpensesChartProps> = ({ expenses }) => {
    const [dateRange, setDateRange] = useState<DateRange>('all');

    const filterExpenses = (expenses: ExpenseData[], range: DateRange) => {
        if (range === 'all') return expenses;
    
        const today = new Date();
        const cutoffDate = new Date();
    
        switch (range) {
            case '7d':
                cutoffDate.setDate(today.getDate() - 7);
                break;
            case '1m':
                cutoffDate.setMonth(today.getMonth() - 1);
                break;
            case '3m':
                cutoffDate.setMonth(today.getMonth() - 3);
                break;
            case '1y':
                cutoffDate.setFullYear(today.getFullYear() - 1);
                break;
        }
    
        console.log('Cutoff date:', cutoffDate);
        console.log('Original data:', expenses);
        
        const filtered = expenses.filter(expense => 
            new Date(expense.date) >= cutoffDate
        );
        
        console.log('Filtered data:', filtered);
        return filtered;
    };

    const filteredData = filterExpenses(expenses, dateRange);
    const formattedData = filteredData.map((expense) => ({
        ...expense,
        date: new Date(expense.date).toLocaleDateString('en-GB'),
    }));

    return (
        <Card className="shadow-md">
            <CardContent className="p-4">
                <div className="flex gap-2 mb-4">
                    <Button 
                        variant={dateRange === '7d' ? 'default' : 'outline'}
                        onClick={() => setDateRange('7d')}
                    >
                        7 Days
                    </Button>
                    <Button 
                        variant={dateRange === '1m' ? 'default' : 'outline'}
                        onClick={() => setDateRange('1m')}
                    >
                        1 Month
                    </Button>
                    <Button 
                        variant={dateRange === '3m' ? 'default' : 'outline'}
                        onClick={() => setDateRange('3m')}
                    >
                        3 Months
                    </Button>
                    <Button 
                        variant={dateRange === '1y' ? 'default' : 'outline'}
                        onClick={() => setDateRange('1y')}
                    >
                        1 Year
                    </Button>
                    <Button 
                        variant={dateRange === 'all' ? 'default' : 'outline'}
                        onClick={() => setDateRange('all')}
                    >
                        All Time
                    </Button>
                </div>
                <div style={{ width: "100%", height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                interval={formattedData.length > 30 ? 6 : 0}
                            />
                            <YAxis 
                                tickFormatter={(value) => `${value}`}
                                width={80}
                            />
                            <Tooltip 
                                formatter={(value: number) => [`${value.toFixed(2)}`, 'Daily Total']}
                                labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                name="Daily Expenses"
                                stroke="#82ca9d"
                                fill="#82ca9d"
                                fillOpacity={0.6}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default AllExpensesChart;
import React, { useState, useMemo } from "react";
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
    
        return expenses.filter(expense => 
            new Date(expense.date) >= cutoffDate
        );
    };

    const { filteredData, periodTotal } = useMemo(() => {
        const filtered = filterExpenses(expenses, dateRange);
        const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);
        return {
            filteredData: filtered,
            periodTotal: total
        };
    }, [expenses, dateRange]);

    const formattedData = filteredData.map((expense) => ({
        ...expense,
        date: new Date(expense.date).toLocaleDateString('en-GB'),
    }));

    const getRangeLabel = (range: DateRange) => {
        switch (range) {
            case '7d': return '7 Days';
            case '1m': return '1 Month';
            case '3m': return '3 Months';
            case '1y': return '1 Year';
            case 'all': return 'All Time';
        }
    };

    return (
        <Card className="shadow-md">
            <CardContent className="p-4">
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex gap-2">
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
                    <div className="text-lg font-semibold">
                        Total for {getRangeLabel(dateRange)}: {Number.isInteger(periodTotal) ? periodTotal : periodTotal.toFixed(2)}
                    </div>
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
                                tickFormatter={(value) => 
                                    Number.isInteger(value) ? value.toString() : value.toFixed(2)
                                }
                                width={80}
                            />
                            <Tooltip 
                                formatter={(value: number) => [
                                    Number.isInteger(value) ? value.toString() : value.toFixed(2), 
                                    'Daily Total'
                                ]}
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
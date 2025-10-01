
'use client';
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { initialCustomerData } from '@/lib/customers';
import { initialSalesData } from '@/lib/sales-data';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { MonthPicker } from '@/components/month-picker';
import { useUser } from '@/context/user-context';
import { cn } from '@/lib/utils';
import { DollarSign, Users } from 'lucide-react';


const StatCard = ({ title, value, change, icon: Icon, formatAsCurrency = false }: { title: string, value: number, change: number, icon: React.ElementType, formatAsCurrency?: boolean }) => {
    const isPositive = change >= 0;
    const formattedValue = formatAsCurrency ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value) : value;
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formattedValue}</div>
                <p className={cn("text-xs", isPositive ? "text-green-600" : "text-destructive")}>
                    {isPositive ? '+' : ''}{change.toFixed(1)}% vs mes anterior
                </p>
            </CardContent>
        </Card>
    )
}

export function MonthlyAnalysis({ date, onDateChange }: { date: Date, onDateChange: (newDate: Date) => void }) {
    const { currentUser } = useUser();

    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const previousMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const prevFormattedDate = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`;
    
    const advisorName = currentUser.name;

    const salesStats = useMemo(() => {
        const currentSales = initialSalesData[advisorName]?.[formattedDate]?.sales || 0;
        const previousSales = initialSalesData[advisorName]?.[prevFormattedDate]?.sales || 0;
        const salesChange = previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : (currentSales > 0 ? 100 : 0);
        return { total: currentSales, change: salesChange };
    }, [advisorName, formattedDate, prevFormattedDate]);

    const customerStats = useMemo(() => {
        const currentMonth = date.getMonth();
        const currentYear = date.getFullYear();
        const prevMonth = previousMonthDate.getMonth();
        const prevYear = previousMonthDate.getFullYear();

        const newCustomersThisMonth = initialCustomerData.filter(c => {
            const regDate = new Date(c.registrationDate);
            return c.assignedTo === advisorName && regDate.getMonth() === currentMonth && regDate.getFullYear() === currentYear;
        }).length;

        const newCustomersLastMonth = initialCustomerData.filter(c => {
            const regDate = new Date(c.registrationDate);
            return c.assignedTo === advisorName && regDate.getMonth() === prevMonth && regDate.getFullYear() === prevYear;
        }).length;

        const customerChange = newCustomersLastMonth > 0 ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth) * 100 : (newCustomersThisMonth > 0 ? 100 : 0);
        return { total: newCustomersThisMonth, change: customerChange };
    }, [advisorName, date, previousMonthDate]);
    
    const statusDistribution = useMemo(() => {
        return initialCustomerData
            .filter(c => c.assignedTo === advisorName)
            .reduce((acc, customer) => {
                acc[customer.status] = (acc[customer.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
    }, [advisorName]);

    const chartData = Object.entries(statusDistribution).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6">
            <div className="flex justify-center">
                <MonthPicker date={date} onDateChange={onDateChange} />
            </div>
             <div className="grid gap-4 md:grid-cols-2">
                <StatCard title="Ventas del Mes" value={salesStats.total} change={salesStats.change} icon={DollarSign} formatAsCurrency />
                <StatCard title="Nuevos Clientes Asignados" value={customerStats.total} change={customerStats.change} icon={Users} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Distribución de Clientes por Estado</CardTitle>
                    <CardDescription>Estado actual de toda tu cartera de clientes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <RechartsTooltip 
                                 formatter={(value) => [`${value} clientes`, 'Cantidad']}
                                 cursor={{ fill: 'hsl(var(--muted))' }}
                            />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

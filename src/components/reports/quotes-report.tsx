

'use client';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { Quote } from '@/context/inventory-context';
import type { User } from '@/lib/roles';
import { Receipt } from 'lucide-react';
import { initialQuotes } from '@/lib/quotes-history';

export function QuotesReport({ date, user }: { date: Date, user: User }) {
    const [quotes, setQuotes] = useState(initialQuotes);
    const isAdvisor = user.roles.includes('Asesor de Ventas');

    const monthlyQuotesData = useMemo(() => {
        const filteredQuotes = quotes.filter(quote => {
            const quoteDate = new Date(quote.creationDate);
            const matchesUser = isAdvisor ? quote.advisorName === user.name : true;
            return quoteDate.getFullYear() === date.getFullYear() && quoteDate.getMonth() === date.getMonth() && matchesUser;
        });

        const totalQuotes = filteredQuotes.length;
        const totalValue = filteredQuotes.reduce((acc, q) => acc + q.total, 0);

        const byCalculator = filteredQuotes.reduce((acc, q) => {
            acc[q.calculatorType] = (acc[q.calculatorType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(byCalculator).map(([name, value]) => ({ name, value }));

        return {
            totalQuotes,
            totalValue,
            chartData,
        }

    }, [quotes, date, user, isAdvisor]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Receipt />Reporte de Cotizaciones</CardTitle>
                <CardDescription>
                    Resumen de cotizaciones generadas en el período seleccionado {isAdvisor ? `para ${user.name}` : ''}.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Cotizaciones</p>
                        <p className="text-2xl font-bold">{monthlyQuotesData.totalQuotes}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Valor Total Cotizado</p>
                        <p className="text-2xl font-bold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(monthlyQuotesData.totalValue)}</p>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={monthlyQuotesData.chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} />
                            <RechartsTooltip 
                                formatter={(value) => [`${value} cotizaciones`, 'Cantidad']}
                                cursor={{ fill: 'hsl(var(--muted))' }}
                            />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

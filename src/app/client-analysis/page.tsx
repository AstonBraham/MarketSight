
'use client';

import { useMemo, useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { useAirtime } from '@/context/airtime-context';
import { useMobileMoney } from '@/context/mobile-money-context';
import type { ColumnDef } from '@tanstack/react-table';

interface ClientStat {
    phoneNumber: string;
    totalAirtime: number;
    totalMobileMoney: number;
    totalCommission: number;
    totalOperations: number;
}

export const columns: ColumnDef<ClientStat>[] = [
    {
        accessorKey: 'phoneNumber',
        header: 'Numéro de Téléphone',
        cell: ({ row }) => <div className="font-mono font-medium">{row.getValue('phoneNumber')}</div>
    },
    {
        accessorKey: 'totalOperations',
        header: () => <div className="text-right">Opérations</div>,
        cell: ({ row }) => <div className="text-right font-bold">{row.getValue('totalOperations')}</div>
    },
    {
        accessorKey: 'totalAirtime',
        header: () => <div className="text-right">Total Airtime</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('totalAirtime'));
            const formatted = new Intl.NumberFormat('fr-FR').format(amount);
            return <div className="text-right font-mono">{formatted} F</div>;
        },
    },
    {
        accessorKey: 'totalMobileMoney',
        header: () => <div className="text-right">Total Mobile Money</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('totalMobileMoney'));
            const formatted = new Intl.NumberFormat('fr-FR').format(amount);
            return <div className="text-right font-mono">{formatted} F</div>;
        },
    },
    {
        accessorKey: 'totalCommission',
        header: () => <div className="text-right">Commission Totale</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('totalCommission'));
            const formatted = new Intl.NumberFormat('fr-FR').format(amount);
            return <div className="text-right font-mono text-green-600">{formatted} F</div>;
        },
    },
     {
        id: 'totalAmount',
        header: () => <div className="text-right">Montant Total</div>,
        cell: ({ row }) => {
            const total = row.original.totalAirtime + row.original.totalMobileMoney;
            const formatted = new Intl.NumberFormat('fr-FR').format(total);
            return <div className="text-right font-mono font-bold text-primary">{formatted} F</div>;
        }
     }
];

export default function ClientAnalysisPage() {
    const { transactions: airtimeTransactions } = useAirtime();
    const { transactions: mobileMoneyTransactions } = useMobileMoney();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const topClients = useMemo(() => {
        const stats: { [key: string]: ClientStat } = {};

        const processTransaction = (phoneNumber: string, airtime: number, mm: number, commission: number) => {
            if (!stats[phoneNumber]) {
                stats[phoneNumber] = {
                    phoneNumber,
                    totalAirtime: 0,
                    totalMobileMoney: 0,
                    totalCommission: 0,
                    totalOperations: 0,
                };
            }
            stats[phoneNumber].totalAirtime += airtime;
            stats[phoneNumber].totalMobileMoney += mm;
            stats[phoneNumber].totalCommission += commission;
            stats[phoneNumber].totalOperations += 1;
        };

        airtimeTransactions.forEach(t => {
            if (t.phoneNumber) {
                processTransaction(t.phoneNumber, t.amount, 0, t.commission);
            }
        });

        mobileMoneyTransactions.forEach(t => {
            if (t.phoneNumber) {
                 processTransaction(t.phoneNumber, 0, t.amount, t.commission);
            }
        });

        return Object.values(stats)
            .sort((a, b) => (b.totalAirtime + b.totalMobileMoney) - (a.totalAirtime + a.totalMobileMoney))
            .slice(0, 20);

    }, [airtimeTransactions, mobileMoneyTransactions]);

    if (!isClient) return null;

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader title="Analyse des Meilleurs Clients" />

            <Card>
                <CardHeader>
                    <CardTitle>Top 20 des Clients par Volume d'Opérations</CardTitle>
                    <CardDescription>
                        Ce rapport classe les clients (identifiés par leur numéro de téléphone) en fonction du montant total des transactions Airtime et Mobile Money.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable data={topClients} columns={columns} filterColumn="phoneNumber" filterPlaceholder="Filtrer par numéro..."/>
                </CardContent>
            </Card>
        </div>
    );
}


'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { useAuditLog } from '@/context/audit-log-context';
import type { AuditLogEntry } from '@/lib/types';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';


const columns: ColumnDef<AuditLogEntry>[] = [
    {
        accessorKey: 'date',
        header: 'Date & Heure',
        cell: ({ row }) => new Date(row.original.date).toLocaleString('fr-FR'),
    },
    {
        accessorKey: 'user',
        header: 'Utilisateur',
        cell: ({ row }) => <Badge variant="outline">{row.getValue('user')}</Badge>
    },
    {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <Badge variant="secondary">{row.getValue('action')}</Badge>
    },
    {
        accessorKey: 'details',
        header: 'Détails',
    },
];

export default function AuditLogPage() {
    const { logs } = useAuditLog();

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader title="Journal d'Audit" />

            <Card>
                <CardHeader>
                    <CardTitle>Historique des Actions</CardTitle>
                    <CardDescription>
                        Ce journal enregistre toutes les actions significatives effectuées dans l'application pour une traçabilité complète.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable data={logs} columns={columns} filterColumn="details" filterPlaceholder="Filtrer par détails..." />
                </CardContent>
            </Card>
        </div>
    );
}

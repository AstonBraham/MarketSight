
'use client';

import { useParams } from 'next/navigation';
import { useTransactions } from '@/context/transaction-context';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function InvoiceDetailsPage() {
    const params = useParams();
    const { id } = params;
    const { getInvoice } = useTransactions();
    const invoice = getInvoice(id as string);

    if (!invoice) {
        return (
            <div className="flex flex-col gap-8 p-4 md:p-8">
                <PageHeader title="Facture introuvable" />
                <p>La facture que vous recherchez n'existe pas ou a été supprimée.</p>
            </div>
        );
    }

    const handlePrint = () => {
        alert("La fonctionnalité d'impression n'est pas encore disponible.");
    };

    const handleDownload = () => {
        alert("La fonctionnalité de téléchargement PDF n'est pas encore disponible.");
    };

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader 
                title={`Facture ${invoice.id}`}
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" /> Imprimer
                        </Button>
                        <Button onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" /> Télécharger en PDF
                        </Button>
                    </div>
                } 
            />

            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader className="bg-muted/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl font-bold text-primary">JokerMarket</CardTitle>
                            <CardDescription>Votre partenaire de confiance</CardDescription>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold">FACTURE</h2>
                            <p className="text-muted-foreground">{invoice.id}</p>
                        </div>
                    </div>
                    <Separator className="my-4" />
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold">Facturé à:</h3>
                            <p>{invoice.clientName}</p>
                        </div>
                        <div className="text-right">
                             <h3 className="font-semibold">Date de facturation:</h3>
                             <p>{new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Article</TableHead>
                                <TableHead className="text-center">Quantité</TableHead>
                                <TableHead className="text-right">Prix Unitaire</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{new Intl.NumberFormat('fr-FR').format(item.price)} F</TableCell>
                                    <TableCell className="text-right">{new Intl.NumberFormat('fr-FR').format(item.total)} F</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="bg-muted/50 p-6">
                    <div className="w-full flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Sous-total</span>
                                <span>{new Intl.NumberFormat('fr-FR').format(invoice.subtotal)} F</span>
                            </div>
                            {invoice.tax > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">TVA (18%)</span>
                                    <span>{new Intl.NumberFormat('fr-FR').format(invoice.tax)} F</span>
                                </div>
                            )}
                             <Separator />
                             <div className="flex justify-between font-bold text-lg">
                                <span >Total</span>
                                <span>{new Intl.NumberFormat('fr-FR').format(invoice.total)} F</span>
                            </div>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

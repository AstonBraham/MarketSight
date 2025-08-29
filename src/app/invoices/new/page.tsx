
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Save, Check, ChevronsUpDown, Download } from 'lucide-react';
import { useInventory } from '@/context/inventory-context';
import type { InventoryItem } from '@/lib/types';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/context/transaction-context';


interface InvoiceItem extends InventoryItem {
    quantity: number;
    price: number;
    total: number;
}

export default function NewInvoicePage() {
    const { inventory, updateItem } = useInventory();
    const { addSale, addInvoice } = useTransactions();
    const { toast } = useToast();
    const router = useRouter();
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [applyTax, setApplyTax] = useState(true);
    const [clientName, setClientName] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().substring(0, 10));

    const invoiceId = useMemo(() => `INV-${Date.now()}`, []);

    const handleAddItem = () => {
        const itemToAdd = inventory.find(i => i.id === selectedItemId);
        if (itemToAdd && !invoiceItems.some(i => i.id === itemToAdd.id)) {
            setInvoiceItems([...invoiceItems, { ...itemToAdd, quantity: 1, price: itemToAdd.defaultPrice || 0, total: itemToAdd.defaultPrice || 0 }]);
            setSelectedItemId(null); // Reset for next selection
        }
    };

    const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: any) => {
        setInvoiceItems(invoiceItems.map(item => {
            if (item.id === itemId) {
                const updatedItem = { ...item, [field]: value };
                if(field === 'quantity' || field === 'price') {
                   const qty = field === 'quantity' ? value : item.quantity;
                   const price = field === 'price' ? value : item.price;
                   updatedItem.total = qty * price;
                }
                return updatedItem;
            }
            return item;
        }));
    };
    
    const handleRemoveItem = (itemId: string) => {
        setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
    };

    const subtotal = invoiceItems.reduce((acc, item) => acc + item.total, 0);
    const tax = applyTax ? subtotal * 0.18 : 0;
    const total = subtotal + tax;
    
    const selectedProduct = inventory.find((item) => item.id === selectedItemId);

    const handleSaveInvoice = () => {
        if (invoiceItems.length === 0) {
            toast({ title: 'Facture vide', description: 'Veuillez ajouter au moins un article.', variant: 'destructive'});
            return;
        }

        // Basic validation
        for(const item of invoiceItems) {
            if (item.quantity <= 0 || item.price < 0) {
                toast({ title: 'Données invalides', description: `Veuillez vérifier la quantité et le prix pour ${item.productName}.`, variant: 'destructive'});
                return;
            }
            if (item.quantity > item.inStock) {
                toast({ title: 'Stock insuffisant', description: `Le stock pour ${item.productName} est de ${item.inStock}.`, variant: 'destructive'});
                return;
            }
        }
        
        const finalInvoiceId = addInvoice({
            clientName: clientName || 'Client Facturé',
            date: invoiceDate,
            items: invoiceItems.map(i => ({ id: i.id, productName: i.productName, quantity: i.quantity, price: i.price, total: i.total })),
            subtotal,
            tax,
            total,
        });

        // Process transactions and update inventory
        invoiceItems.forEach(item => {
            addSale({
                invoiceId: finalInvoiceId,
                client: clientName || 'Client Facturé',
                product: item.productName,
                reference: item.reference,
                itemType: item.category,
                price: item.price,
                quantity: item.quantity,
                amount: item.total
            });
            updateItem(item.id, { inStock: item.inStock - item.quantity });
        });

        toast({ title: 'Facture Enregistrée', description: `La facture ${finalInvoiceId} a été enregistrée avec succès.`});
        router.push(`/invoices/${finalInvoiceId}`);
    }
    
    const handleSelect = (itemId: string) => {
        setSelectedItemId(itemId);
        setPopoverOpen(false);
    }

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader title="Nouvelle Facture" />

            <Card>
                <CardHeader>
                    <CardTitle>Détails de la facture</CardTitle>
                    <CardDescription>Remplissez les informations ci-dessous pour créer une nouvelle facture.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Nom du client</Label>
                            <Input id="clientName" placeholder="Entrez le nom du client" value={clientName} onChange={e => setClientName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invoiceDate">Date de la facture</Label>
                            <Input id="invoiceDate" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invoiceId">N° de Facture</Label>
                            <Input id="invoiceId" type="text" value={invoiceId} readOnly />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Articles de la facture</Label>
                        <div className="flex items-center gap-2">
                             <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={popoverOpen}
                                    className="w-[300px] justify-between"
                                    >
                                    {selectedProduct
                                        ? selectedProduct.productName
                                        : "Sélectionner un article..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Rechercher un article..." />
                                        <CommandList>
                                            <CommandEmpty>Aucun article trouvé.</CommandEmpty>
                                            <CommandGroup>
                                                {inventory.map((item) => (
                                                <CommandItem
                                                    key={item.id}
                                                    value={item.id}
                                                    onSelect={() => handleSelect(item.id)}
                                                    disabled={invoiceItems.some(i => i.id === item.id)}
                                                >
                                                    <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedItemId === item.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                    />
                                                    {item.productName} ({item.inStock})
                                                </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <Button onClick={handleAddItem} disabled={!selectedItemId}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter</Button>
                        </div>
                        
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Produit</TableHead>
                                        <TableHead>Quantité</TableHead>
                                        <TableHead>Prix Unitaire</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoiceItems.length > 0 ? (
                                        invoiceItems.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.productName}</TableCell>
                                                <TableCell>
                                                    <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))} min="1" max={item.inStock} className="h-8 w-20"/>
                                                </TableCell>
                                                <TableCell>
                                                     <Input type="number" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value))} min="0" className="h-8 w-24"/>
                                                </TableCell>
                                                <TableCell className="text-right">{new Intl.NumberFormat('fr-FR').format(item.total)} F</TableCell>
                                                <TableCell>
                                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveItem(item.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">Aucun article ajouté.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    
                    <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-2">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Sous-total</span>
                                <span>{new Intl.NumberFormat('fr-FR').format(subtotal)} F</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="apply-tax" className="flex items-center gap-2 text-muted-foreground">
                                    Appliquer la TVA (18%)
                                </Label>
                                <Switch id="apply-tax" checked={applyTax} onCheckedChange={setApplyTax} />
                            </div>
                             {applyTax && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">TVA (18%)</span>
                                    <span>{new Intl.NumberFormat('fr-FR').format(tax)} F</span>
                                </div>
                             )}
                             <div className="flex justify-between font-bold text-lg">
                                <span >Total</span>
                                <span>{new Intl.NumberFormat('fr-FR').format(total)} F</span>
                            </div>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Link href="/invoices">
                        <Button variant="outline">Annuler</Button>
                    </Link>
                    <Button onClick={handleSaveInvoice}><Save className="mr-2 h-4 w-4" /> Enregistrer la facture</Button>
                </CardFooter>
            </Card>
        </div>
    );
}

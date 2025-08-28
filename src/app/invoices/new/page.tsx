
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Save, Check, ChevronsUpDown } from 'lucide-react';
import { useInventory } from '@/context/inventory-context';
import type { InventoryItem } from '@/lib/types';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';


interface InvoiceItem extends InventoryItem {
    quantity: number;
    price: number;
    total: number;
}

export default function NewInvoicePage() {
    const { inventory } = useInventory();
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [popoverOpen, setPopoverOpen] = useState(false);

    const handleAddItem = () => {
        const itemToAdd = inventory.find(i => i.id === selectedItem);
        if (itemToAdd && !invoiceItems.some(i => i.id === itemToAdd.id)) {
            setInvoiceItems([...invoiceItems, { ...itemToAdd, quantity: 1, price: 0, total: 0 }]);
            setSelectedItem(''); // Reset for next selection
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
    const tax = subtotal * 0.18; // Assuming 18% tax
    const total = subtotal + tax;
    
    const selectedProduct = inventory.find((item) => item.id === selectedItem);

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader title="Nouvelle Facture" />

            <Card>
                <CardHeader>
                    <CardTitle>Détails de la facture</CardTitle>
                    <CardDescription>Remplissez les informations ci-dessous pour créer une nouvelle facture.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Nom du client</Label>
                            <Input id="clientName" placeholder="Entrez le nom du client" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="invoiceDate">Date de la facture</Label>
                            <Input id="invoiceDate" type="date" defaultValue={new Date().toISOString().substring(0, 10)} />
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
                                                    value={item.productName}
                                                    onSelect={() => {
                                                        setSelectedItem(item.id)
                                                        setPopoverOpen(false)
                                                    }}
                                                    disabled={invoiceItems.some(i => i.id === item.id)}
                                                >
                                                    <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedItem === item.id ? "opacity-100" : "opacity-0"
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
                            <Button onClick={handleAddItem} disabled={!selectedItem}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter</Button>
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
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">TVA (18%)</span>
                                <span>{new Intl.NumberFormat('fr-FR').format(tax)} F</span>
                            </div>
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
                    <Button><Save className="mr-2 h-4 w-4" /> Enregistrer la facture</Button>
                </CardFooter>
            </Card>
        </div>
    );
}



'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInventory } from '@/context/inventory-context';
import { useToast } from '@/hooks/use-toast';
import { Save, FileCheck2, ArrowLeft } from 'lucide-react';
import type { InventoryItem } from '@/lib/types';
import Link from 'next/link';

interface CountedItem extends InventoryItem {
  realStock?: number;
}

export default function PhysicalCountPage() {
  const router = useRouter();
  const { inventory, updateItem } = useInventory();
  const { toast } = useToast();
  const [countedItems, setCountedItems] = useState<CountedItem[]>(() => 
    inventory.map(item => ({ ...item, realStock: undefined }))
  );
  
  const handleStockChange = (itemId: string, value: string) => {
    const realStock = value === '' ? undefined : parseInt(value, 10);
    setCountedItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, realStock: isNaN(realStock!) ? undefined : realStock } : item
      )
    );
  };
  
  const itemsWithChanges = useMemo(() => {
    return countedItems.filter(item => 
      item.realStock !== undefined && item.realStock !== item.inStock
    );
  }, [countedItems]);

  const handleSubmit = () => {
    if (itemsWithChanges.length === 0) {
      toast({
        title: 'Aucun changement détecté',
        description: 'Aucun stock n\'a été modifié.',
      });
      return;
    }
    
    itemsWithChanges.forEach(item => {
      const adjustment = (item.realStock ?? item.inStock) - item.inStock;
      if (adjustment !== 0) {
        updateItem(item.id, { inStock: item.realStock! });
        // Here you would also add a stock movement transaction
        console.log(`Adjusted ${item.productName} by ${adjustment}`);
      }
    });

    toast({
      title: 'Comptage validé',
      description: `${itemsWithChanges.length} article(s) ont été mis à jour.`,
    });
    router.push('/inventory');
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <PageHeader 
        title="Comptage Physique d'Inventaire" 
        action={
          <Link href="/inventory">
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
          </Link>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Enregistrement du comptage</CardTitle>
          <CardDescription>
            Saisissez le stock réel pour chaque article. Laissez le champ vide si le stock n'a pas changé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Produit</TableHead>
                  <TableHead className="text-center">Stock Théorique</TableHead>
                  <TableHead className="text-center">Stock Réel</TableHead>
                  <TableHead className="text-center">Écart</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countedItems.map(item => {
                  const variance = (item.realStock ?? item.inStock) - item.inStock;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-center">{item.inStock}</TableCell>
                      <TableCell className="text-center">
                        <Input 
                          type="number"
                          className="mx-auto h-8 w-24 text-center"
                          placeholder={String(item.inStock)}
                          value={item.realStock ?? ''}
                          onChange={(e) => handleStockChange(item.id, e.target.value)}
                          min="0"
                        />
                      </TableCell>
                       <TableCell className={`text-center font-bold ${variance > 0 ? 'text-green-600' : variance < 0 ? 'text-destructive' : ''}`}>
                         {variance > 0 ? '+' : ''}{variance}
                       </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
           <Button variant="outline" onClick={() => router.push('/inventory')}>Annuler</Button>
           <Button onClick={handleSubmit} disabled={itemsWithChanges.length === 0}>
             <Save className="mr-2 h-4 w-4" />
             Valider le comptage ({itemsWithChanges.length})
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

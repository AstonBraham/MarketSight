
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Archive, Save, FileWarning, Landmark, ShoppingCart, Info, Moon } from 'lucide-react';
import { useInventory } from '@/context/inventory-context';
import { useAirtime } from '@/context/airtime-context';
import { useMobileMoney } from '@/context/mobile-money-context';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTransactions } from '@/context/transaction-context';
import { subDays } from 'date-fns';

const LOW_STOCK_THRESHOLDS = {
    airtime: {
        Moov: 10000,
        Yas: 20000,
    },
    mobileMoney: {
        Flooz: 30000,
        Mixx: 50000,
        Coris: 100000, // Default value as it was not specified
    }
}


export function DashboardAlerts() {
  const { inventory } = useInventory();
  const { getStock: getAirtimeStock } = useAirtime();
  const { getBalance: getMobileMoneyBalance } = useMobileMoney();
  const { sales } = useTransactions();

  const reorderItems = useMemo(() => {
    return inventory.filter(item => item.inStock > 0 && item.inStock <= item.reorderLevel);
  }, [inventory]);
  
  const outOfStockItems = useMemo(() => {
    return inventory.filter(item => item.inStock <= 0);
  }, [inventory]);

  const dormantItems = useMemo(() => {
    const twoWeeksAgo = subDays(new Date(), 14);
    const recentSalesInventoryIds = new Set(
        sales
            .filter(sale => new Date(sale.date) > twoWeeksAgo && sale.inventoryId)
            .map(sale => sale.inventoryId)
    );
    return inventory.filter(item => item.inStock > 0 && !recentSalesInventoryIds.has(item.id));
  }, [inventory, sales]);

  const airtimeMoovStock = getAirtimeStock('Moov');
  const airtimeYasStock = getAirtimeStock('Yas');
  const mmFloozBalance = getMobileMoneyBalance('Flooz');
  const mmMixxBalance = getMobileMoneyBalance('Mixx');
  const mmCorisBalance = getMobileMoneyBalance('Coris');

  const lowStockAlerts = [];
  if (airtimeMoovStock < LOW_STOCK_THRESHOLDS.airtime.Moov) {
    lowStockAlerts.push({ type: 'airtime', provider: 'Moov', balance: airtimeMoovStock });
  }
  if (airtimeYasStock < LOW_STOCK_THRESHOLDS.airtime.Yas) {
    lowStockAlerts.push({ type: 'airtime', provider: 'Yas', balance: airtimeYasStock });
  }
  if (mmFloozBalance < LOW_STOCK_THRESHOLDS.mobileMoney.Flooz) {
    lowStockAlerts.push({ type: 'mm', provider: 'Flooz', balance: mmFloozBalance });
  }
  if (mmMixxBalance < LOW_STOCK_THRESHOLDS.mobileMoney.Mixx) {
    lowStockAlerts.push({ type: 'mm', provider: 'Mixx', balance: mmMixxBalance });
  }
  if (mmCorisBalance < LOW_STOCK_THRESHOLDS.mobileMoney.Coris) {
     lowStockAlerts.push({ type: 'mm', provider: 'Coris', balance: mmCorisBalance });
  }
  
  const hasAlerts = reorderItems.length > 0 || lowStockAlerts.length > 0 || outOfStockItems.length > 0 || dormantItems.length > 0;

  if (!hasAlerts) {
    return (
        <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Tout est en ordre !</AlertTitle>
            <AlertDescription>
                Aucune alerte critique pour le moment. Pensez à faire l'arrêté de caisse et la sauvegarde en fin de journée.
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <div className="space-y-4">
        {reorderItems.length > 0 && (
            <Alert variant="destructive">
                <ShoppingCart className="h-4 w-4" />
                <AlertTitle>Articles à commander d'urgence !</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                    <span>
                        Vous avez {reorderItems.length} article(s) dont le stock est bas.
                    </span>
                    <Link href="/inventory?tab=reorder">
                        <Button variant="destructive" size="sm">Voir la liste</Button>
                    </Link>
                </AlertDescription>
            </Alert>
        )}
        {outOfStockItems.length > 0 && (
            <Alert variant="destructive">
                <Archive className="h-4 w-4" />
                <AlertTitle>Articles en Rupture de Stock !</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                    <span>
                        {outOfStockItems.length} article(s) sont en rupture de stock.
                    </span>
                     <Link href="/inventory?status=outOfStock">
                        <Button variant="destructive" size="sm">Voir les articles</Button>
                    </Link>
                </AlertDescription>
            </Alert>
        )}
        {lowStockAlerts.map(alert => (
             <Alert key={`${alert.type}-${alert.provider}`} variant="destructive">
                <FileWarning className="h-4 w-4" />
                <AlertTitle>Solde {alert.type === 'airtime' ? 'Airtime' : 'Mobile Money'} {alert.provider} bas !</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                   <span>
                        Le solde actuel est de {new Intl.NumberFormat('fr-FR').format(alert.balance)} F. Pensez à réapprovisionner.
                   </span>
                </AlertDescription>
            </Alert>
        ))}
         {dormantItems.length > 0 && (
            <Alert>
                <Moon className="h-4 w-4" />
                <AlertTitle>Articles Dormants</AlertTitle>
                <AlertDescription>
                    {dormantItems.length} article(s) en stock n'ont pas été vendus depuis plus de 2 semaines.
                </AlertDescription>
            </Alert>
        )}
    </div>
  )
}


'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Archive, Save, FileWarning, Landmark, ShoppingCart, Info } from 'lucide-react';
import { useInventory } from '@/context/inventory-context';
import { useAirtime } from '@/context/airtime-context';
import { useMobileMoney } from '@/context/mobile-money-context';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const AIRTIME_LOW_THRESHOLD = 50000;
const MM_LOW_THRESHOLD = 100000;

export function DashboardAlerts() {
  const { inventory } = useInventory();
  const { getStock: getAirtimeStock } = useAirtime();
  const { getBalance: getMobileMoneyBalance } = useMobileMoney();

  const reorderItems = useMemo(() => {
    return inventory.filter(item => item.inStock <= item.reorderLevel);
  }, [inventory]);

  const airtimeMoovStock = getAirtimeStock('Moov');
  const airtimeYasStock = getAirtimeStock('Yas');
  const mmFloozBalance = getMobileMoneyBalance('Flooz');
  const mmMixxBalance = getMobileMoneyBalance('Mixx');
  const mmCorisBalance = getMobileMoneyBalance('Coris');

  const lowStockAlerts = [];
  if (airtimeMoovStock < AIRTIME_LOW_THRESHOLD) {
    lowStockAlerts.push({ type: 'airtime', provider: 'Moov', balance: airtimeMoovStock });
  }
  if (airtimeYasStock < AIRTIME_LOW_THRESHOLD) {
    lowStockAlerts.push({ type: 'airtime', provider: 'Yas', balance: airtimeYasStock });
  }
  if (mmFloozBalance < MM_LOW_THRESHOLD) {
    lowStockAlerts.push({ type: 'mm', provider: 'Flooz', balance: mmFloozBalance });
  }
  if (mmMixxBalance < MM_LOW_THRESHOLD) {
    lowStockAlerts.push({ type: 'mm', provider: 'Mixx', balance: mmMixxBalance });
  }
  if (mmCorisBalance < MM_LOW_THRESHOLD) {
     lowStockAlerts.push({ type: 'mm', provider: 'Coris', balance: mmCorisBalance });
  }
  
  const hasAlerts = reorderItems.length > 0 || lowStockAlerts.length > 0;

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
                        Vous avez {reorderItems.length} article(s) dont le stock est bas ou épuisé.
                    </span>
                    <Link href="/inventory?tab=reorder">
                        <Button variant="destructive" size="sm">Voir la liste</Button>
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
    </div>
  )
}

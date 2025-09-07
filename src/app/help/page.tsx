
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function HelpPage() {
    return (
        <div className="flex flex-col gap-8 p-4 md:p-8">
            <PageHeader title="Manuel d'Utilisateur" />

            <Card>
                <CardHeader>
                    <CardTitle>Bienvenue sur JokerMarket !</CardTitle>
                    <CardDescription>
                        Ce guide vous aidera à prendre en main toutes les fonctionnalités de votre application de gestion.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>1. Gestion des Rôles (Admin vs. User)</AccordionTrigger>
                            <AccordionContent className="space-y-4 pl-4">
                                <p>L'application propose deux rôles avec des permissions différentes :</p>
                                <ul className="list-disc space-y-2 pl-6">
                                    <li><strong>Admin :</strong> A accès à toutes les fonctionnalités, y compris la configuration, la suppression et la modification de toutes les données.</li>
                                    <li><strong>User :</strong> A un accès limité aux opérations quotidiennes (ventes, dépenses) sans pouvoir modifier les données critiques.</li>
                                </ul>
                                <p>Pour basculer entre les rôles, cliquez sur votre nom en bas de la barre latérale et sélectionnez le profil souhaité. C'est un outil de simulation pour tester les permissions.</p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2">
                            <AccordionTrigger>2. Gestion de l'Inventaire</AccordionTrigger>
                            <AccordionContent className="space-y-6 pl-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Ajouter un Nouvel Article</h4>
                                    <p>Allez dans <strong>Inventaire</strong> et cliquez sur <strong>"Ajouter un article"</strong>. Un SKU (code article) unique est suggéré, mais vous pouvez le modifier. La référence et le SKU doivent être uniques.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Gestion des Packs (Lier Unités et Articles Parents)</h4>
                                    <p>Pour gérer les articles vendus à l'unité mais achetés en pack :</p>
                                    <ol className="list-decimal space-y-2 pl-6">
                                        <li>Modifiez l'article vendu à l'<strong>unité</strong>.</li>
                                        <li>Dans la section "Gestion des Packs", sélectionnez l'article "Pack" comme <strong>Article Parent</strong>.</li>
                                        <li>Indiquez le nombre d'unités dans le champ <strong>"Unités par Parent"</strong> (ex: 12).</li>
                                        <li>Enregistrez. Le système "cassera" un pack automatiquement lors d'une vente si les unités manquent.</li>
                                    </ol>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Ajustement de Stock et Comptage Physique</h4>
                                     <ul className="list-disc space-y-2 pl-6">
                                        <li><strong>Ajustement Rapide :</strong> Pour corriger le stock d'un seul article, allez sur la page de détail de l'article (en cliquant sur son nom) et utilisez le bouton <strong>"Ajuster le Stock"</strong>.</li>
                                        <li><strong>Comptage Complet :</strong> Pour un inventaire général, allez dans <strong>Inventaire {'>'} Actions {'>'} Comptage Physique</strong>. Vous pouvez remplir les stocks réels pour tous les articles.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Liste de Réapprovisionnement</h4>
                                    <p>L'onglet <strong>"À Commander"</strong> sur la page Inventaire liste automatiquement les articles dont le stock est bas. Il suggère une quantité à commander basée sur l'historique des ventes pour éviter les ruptures.</p>
                                    <p>Le niveau d'alerte (ou stock de sécurité) peut être calculé automatiquement via le bouton <strong>"Calculer les Niveaux d'Alerte"</strong>.</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3">
                            <AccordionTrigger>3. Ventes et Facturation</AccordionTrigger>
                            <AccordionContent className="space-y-6 pl-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Vente au Comptant</h4>
                                    <p>Pour une vente simple, utilisez le bouton <strong>"Vente au comptant"</strong> sur la page "Vente & Facturation". Sélectionnez un produit, la quantité et le prix. Le stock est déduit automatiquement.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Vente Rapide</h4>
                                    <p>La section "Ventes Rapides" sur la même page affiche vos 10 articles les plus vendus. Cliquez sur un article pour enregistrer une vente encore plus rapidement.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Création de Facture</h4>
                                    <p>Utilisez <strong>"Nouvelle Facture"</strong> pour créer des factures détaillées pour vos clients. Vous pouvez y ajouter plusieurs articles. La création d'une facture génère une transaction de vente globale et met à jour le stock pour chaque article vendu.</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        
                         <AccordionItem value="item-4">
                            <AccordionTrigger>4. Trésorerie et Opérations Financières</AccordionTrigger>
                            <AccordionContent className="space-y-6 pl-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Achats Fournisseurs</h4>
                                    <p>Enregistrez vos achats via <strong>Inventaire {'>'} Nouvel Achat</strong>. Si vous cochez "Payer maintenant", le montant sera déduit de la caisse. Sinon, l'achat apparaîtra dans les "Achats non réglés" sur le tableau de bord.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Dépenses</h4>
                                    <p>Allez dans le module <strong>Dépenses</strong> pour enregistrer toutes vos charges opérationnelles (salaires, loyer, électricité...). Vous pouvez utiliser l'IA pour suggérer une catégorie.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Encaissements (Apports)</h4>
                                    <p>Pour les entrées de fonds qui ne sont pas des ventes (ex: apport du propriétaire), allez dans <strong>Trésorerie {'>'} Encaissements</strong> et cliquez sur "Nouvel Encaissement".</p>
                                </div>
                                 <div>
                                    <h4 className="font-semibold mb-2">Arrêté de Caisse</h4>
                                    <p>Accessible via <strong>Trésorerie {'>'} Arrêtés de caisse</strong> (Admin seulement). Comparez le solde théorique calculé par le système avec le montant physique en caisse. En cas d'écart, une transaction d'ajustement est automatiquement créée.</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-5">
                            <AccordionTrigger>5. Import / Export et Sauvegarde</AccordionTrigger>
                            <AccordionContent className="space-y-4 pl-4">
                                <p>La page <strong>Paramètres</strong> (Admin seulement) vous permet de gérer vos données :</p>
                                <ul className="list-disc space-y-2 pl-6">
                                    <li><strong>Sauvegarde et Restauration :</strong> Sauvegardez TOUTES les données de l'application dans un fichier JSON. Vous pouvez restaurer l'état de l'application depuis ce fichier à tout moment.</li>
                                    <li><strong>Export :</strong> La page <strong>Rapports</strong> vous permet d'exporter des rapports spécifiques (ventes, inventaire, etc.) au format CSV, compatible avec Excel.</li>
                                    <li><strong>Import :</strong> Téléchargez les modèles CSV depuis la page <strong>Rapports</strong>, remplissez-les avec vos données, puis importez-les depuis la page <strong>Paramètres</strong> pour ajouter des produits, ventes, ou autres données en masse.</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}

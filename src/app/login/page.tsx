
'use client';

import { useState } from 'react';
import { useUser } from '@/context/user-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useUser();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: This will be replaced by Firebase Auth
    // For now, we keep the simple password logic for demonstration
    const success = login(password);

    if (!success) {
      toast({
        title: 'Identifiants incorrects',
        description: 'Veuillez vérifier vos identifiants et réessayer.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Store className="h-8 w-8" />
            </div>
          <CardTitle className="text-2xl font-headline">Bienvenue sur JokerMarket</CardTitle>
          <CardDescription>Veuillez entrer vos identifiants pour continuer.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="nom@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                    Pas encore de compte ?{' '}
                    <Link href="#" className="font-medium text-primary hover:underline">
                        Inscrivez-vous
                    </Link>
                </div>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}

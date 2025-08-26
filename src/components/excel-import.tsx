'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ExcelImport({ title }: { title: string }) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast({
        title: 'Aucun fichier sélectionné',
        description: 'Veuillez sélectionner un fichier à importer.',
        variant: 'destructive',
      });
      return;
    }
    // Mock import logic
    toast({
      title: 'Importation démarrée',
      description: `Importation du fichier ${file.name}...`,
    });
    setFile(null);
  };

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-background/50">
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center gap-4">
            <Input id="import-file" type="file" onChange={handleFileChange} className="flex-1" />
            <Button onClick={handleImport} disabled={!file}>
                <Upload className="mr-2 h-4 w-4" />
                Importer
            </Button>
        </div>
        {file && <p className="text-sm text-muted-foreground">Fichier sélectionné : {file.name}</p>}
    </div>
  );
}

'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
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

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`Données importées pour "${title}":`, json);
        
        toast({
          title: 'Importation terminée',
          description: `Le fichier ${file.name} a été importé avec succès.`,
        });

      } catch (error) {
        console.error("Erreur lors de l'importation:", error);
        toast({
          title: 'Erreur d\'importation',
          description: 'Impossible de lire le fichier. Veuillez vérifier le format.',
          variant: 'destructive',
        });
      } finally {
        setFile(null);
        // Reset the input value to allow re-uploading the same file
        const fileInput = document.getElementById('import-file') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
      }
    };
    reader.readAsBinaryString(file);

  };

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-background/50">
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center gap-4">
            <Input id="import-file" type="file" onChange={handleFileChange} className="flex-1" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
            <Button onClick={handleImport} disabled={!file}>
                <Upload className="mr-2 h-4 w-4" />
                Importer
            </Button>
        </div>
        {file && <p className="text-sm text-muted-foreground">Fichier sélectionné : {file.name}</p>}
    </div>
  );
}

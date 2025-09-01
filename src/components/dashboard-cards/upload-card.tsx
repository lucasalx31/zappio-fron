import type React from "react";
import { useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Upload, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UploadCardProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

const UploadCard = ({ file, onFileSelect }: UploadCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    onFileSelect(uploadedFile);
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Lista de Contatos
        </CardTitle>
        <CardDescription className="text-sm">
          Upload da planilha (.xlsx, .csv)
        </CardDescription>
        <div className="mt-2">
          <Button asChild variant="outline" size="sm" className="text-xs">
            <a href="/files/modelo-contatos-whatsapp.xlsx" download>
              Baixar Modelo
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Dica:</strong> Baixe o modelo para ver o formato correto dos números
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Selecionar arquivo
                </span>
              </label>
              <Input
                ref={inputRef}
                id="file-upload"
                type="file"
                accept=".xlsx,.csv,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-1">.xlsx, .csv, .xls</p>
            </div>

            {file && (
              <div className="mt-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-green-700 dark:text-green-300 text-sm font-medium truncate">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 dark:border-green-800">
                    <Button onClick={handleRemoveFile} className="cursor-pointer ">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadCard;

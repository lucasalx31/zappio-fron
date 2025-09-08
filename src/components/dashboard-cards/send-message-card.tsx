import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Ban } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type SendMessageCardProps = {
  message: string;
  onMessageChange: (newMessage: string) => void;
  onSend: () => void;
  onCancel: () => void;
  isFileSelected: boolean;
};

export default function SendMessageCard({
  message,
  onMessageChange,
  onSend,
  onCancel,
  isFileSelected,
}: SendMessageCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Send className="w-5 h-5 text-purple-600" />
          Enviar Mensagem
        </CardTitle>
        <CardDescription className="text-sm">
          Use os botões abaixo para gerenciar sua campanha.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          <Textarea
            placeholder="Digite sua mensagem aqui..."
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            className="h-50 overflow-y-auto resize-none border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-blue-400 transition-colors"
            rows={6}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {message.length} caracteres
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <Button
            onClick={onSend}
            disabled={!isFileSelected || !message.trim()}
            className="w-full bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Mensagens
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full cursor-pointer" size="sm">
                <Ban className="w-4 h-4 mr-2" />
                Cancelar Envios Pendentes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso irá apagar permanentemente
                  todas as mensagens que estão na fila de envio.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Voltar</AlertDialogCancel>
                <AlertDialogAction onClick={onCancel} className="cursor-pointer">
                  Sim, cancelar campanha
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
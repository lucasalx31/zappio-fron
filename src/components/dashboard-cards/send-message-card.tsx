import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, RefreshCw } from "lucide-react";

type SendMessageCardProps = {
  message: string;
  onMessageChange: (newMessage: string) => void;
  onSend: () => void;
  isSending: boolean;
  isFileSelected: boolean;
};

export default function SendMessageCard({
  message,
  onMessageChange,
  onSend,
  isSending,
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
          Mensagem para todos os contatos da planilha
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          <Textarea
            placeholder="Digite sua mensagem aqui..."
            value={message} // 👈 Usa a prop 'message'
            onChange={(e) => onMessageChange(e.target.value)} // 👈 Chama a função da prop
            className="h-40 overflow-y-auto resize-none border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-blue-400 transition-colors"
            rows={6}
          />

          <p className="text-xs text-muted-foreground mt-2">
            {message.length} caracteres
          </p>
        </div>

        <Button
          onClick={onSend} // 👈 Chama a função da prop
          disabled={isSending || !isFileSelected || !message.trim()} // 👈 Usa as props para desabilitar
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 mt-4 cursor-pointer"
          size="sm"
        >
          {isSending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensagens
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
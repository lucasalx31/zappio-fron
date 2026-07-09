// A API roda atras de um tunel ngrok (free tier). Requisicoes vindas do
// navegador recebem uma pagina de aviso HTML do ngrok (ERR_NGROK_6024) no
// lugar da resposta real, o que quebrava as chamadas GET (retornavam HTML
// em vez de JSON) e o handshake de long-polling do socket.io.
//
// Enviar este header em toda requisicao faz o ngrok pular a pagina de aviso.
// Para o socket.io, a solucao complementar e forcar o transporte "websocket"
// (o upgrade de WebSocket nao passa pelo interstitial do ngrok).
export const NGROK_SKIP_HEADER = {
  "ngrok-skip-browser-warning": "true",
} as const;

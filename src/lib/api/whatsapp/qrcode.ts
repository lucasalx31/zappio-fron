const API_URL = '/api' // Agora chama rotas internas do Next

export async function fetchQRCode(sessionName: string) {
  const res = await fetch(`${API_URL}/sessions/${sessionName}/qrcode`)
  if (!res.ok) throw new Error('Erro ao buscar QR Code')
  return res.json()
}

export async function waitForQRCode(sessionName: string) {
  const res = await fetch(`${API_URL}/sessions/${sessionName}/qrcode/wait?timeout=30000`)
  if (!res.ok) throw new Error('Timeout ou erro ao aguardar QR Code')
  return res.json()
}

export async function createSession(sessionName: string) {
  const res = await fetch(`${API_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionName }),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Erro ao criar sessão");
    } else {
      const text = await res.text(); // aqui você verá o conteúdo de erro HTML
      console.error("Resposta inesperada:", text);
      throw new Error("Resposta inválida da API.");
    }
  }

  return res.json();
}

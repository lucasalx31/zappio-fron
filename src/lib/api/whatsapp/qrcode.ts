const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchQRCode(sessionName: string) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionName}/qrcode`)
  if (!res.ok) throw new Error('Erro ao buscar QR Code')
  return res.json()
}

export async function waitForQRCode(sessionName: string) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionName}/qrcode/wait?timeout=30000`)
  if (!res.ok) throw new Error('Timeout ou erro ao aguardar QR Code')
  return res.json()
}

export async function createSession(sessionName: string) {
  const res = await fetch(`${API_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionName }),
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Erro ao criar sessão')
  }

  return res.json()
}

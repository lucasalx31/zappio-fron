"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider } from "@/components/ui/sidebar"
import { WhatsAppSidebar } from "@/components/whatsapp-sidebar"
import { Play, MessageCircle, Upload, Send, ChevronDown, ChevronRight, CheckCircle, Circle } from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useState } from "react";

// --- DADOS DOS VÍDEOS ---
const videoItems = [
    { 
      title: "Como Conectar o WhatsApp", 
      description: "Aprenda a conectar sua conta do WhatsApp ao Zappio", 
      videoUrl: "https://www.youtube.com/embed/PoYHfCfxk8M?autoplay=1&mute=1&controls=0&rel=0&showinfo=0&loop=1&playlist=PoYHfCfxk8M" 
    },
    { 
      title: "Upload de Contatos", 
      description: "Como fazer upload da planilha de contatos corretamente", 
      videoUrl: "https://www.youtube.com/embed/hozwY8GXmEw?autoplay=1&mute=1&controls=0&rel=0&showinfo=0&loop=1&playlist=hozwY8GXmEw"
    },
    { 
      title: "Enviando Mensagens", 
      description: "Como criar e enviar campanhas de mensagens em massa", 
      videoUrl: "https://www.youtube.com/embed/CrOF1bmrXX0?autoplay=1&mute=1&controls=0&rel=0&showinfo=0&loop=1&playlist=CrOF1bmrXX0" 
    },
]

// --- DADOS DOS GUIAS ---
const guideSteps = [
  {
    id: 1,
    icon: <MessageCircle className="w-5 h-5 text-green-500" />,
    color: "green",
    title: "1. Conectando sua conta WhatsApp",
    description: "Aprenda como conectar seu WhatsApp ao Zappio de forma segura",
    content: [
      'Clique em "Conectar sessão" no card de conexão',
      'Aguarde o QR Code aparecer na tela',
      'Abra o WhatsApp no seu celular',
      'Vá em Configurações → Aparelhos conectados → Conectar um aparelho',
      'Escaneie o QR Code exibido na tela',
    ]
  },
  {
    id: 2,
    icon: <Upload className="w-5 h-5 text-blue-500" />,
    color: "blue",
    title: "2. Preparando sua lista de contatos",
    description: "Configure sua planilha de contatos no formato correto",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <h4 className="font-semibold text-blue-700 dark:text-blue-400">Formatos Aceitos</h4>
          <div className="space-y-2">
            {['.xlsx', '.csv', '.xls'].map((format) => (
              <div key={format} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-mono">{format}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="font-semibold text-blue-700 dark:text-blue-400">Dicas Importantes</h4>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>A primeira coluna deve ser o **Nome**.</li>
            <li>A segunda coluna deve ser o **Número**.</li>
            <li>Inclua o DDI (55) e o DDD (ex: 5511987654321).</li>
            <li>Baixe nosso modelo como referência.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 3,
    icon: <Send className="w-5 h-5 text-purple-600" />,
    color: "purple",
    title: "3. Enviando mensagens",
    description: "Execute sua campanha de mensagens com segurança",
    content: (
      <div className="space-y-4">
        <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-3">Checklist Pré-Envio</h4>
          <div className="space-y-2">
            {['WhatsApp conectado e ativo', 'Planilha carregada com sucesso','Nome da Campanha preenchido', 'Mensagem revisada e testada', 'Horário adequado para envio'].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-800 dark:text-purple-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>⚠️ Importante:</strong> O processo pode levar alguns secundos. Não feche a página durante o envio.
          </p>
        </div>
      </div>
    )
  }
];

const faqItems = [
  {
    value: "item-1",
    question: "Por que meu WhatsApp desconecta?",
    answer: "O WhatsApp pode desconectar por inatividade ou se você fizer login em outro dispositivo. Sempre verifique o status da conexão antes de enviar mensagens."
  },
  {
    value: "item-2",
    question: "Qual o limite de mensagens por dia?",
    answer: "Atualmente o sistema atua com a média de 200 envios por dia de 08h as 21h."
  },
  {
    value: "item-3",
    question: "Minha planilha não está sendo reconhecida",
    answer: "Verifique se sua planilha está no formato correto (.xlsx, .csv, .xls) e se os números estão no formato brasileiro com DDI+DDD (ex: 55119...)."
  },
  {
    value: "item-4",
    question: "Sobre bloqueios de número",
    answer: "Não recomendamos o envio manual simultâneo de mensagens. O ZappiO já possui mecanismos de proteção contra bloqueios, mas o envio paralelo pode aumentar o risco de bloqueio do número."
  }
];


export default function HelpPage() {
const [expandedStep, setExpandedStep] = useState<number | null>(1)

const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber)
}

return (
    <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
        <WhatsAppSidebar />
        <div className="flex flex-col flex-1 overflow-auto bg-background w-screen">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between px-4 md:px-6">
                    <h1 className="text-xl font-semibold">Central de Ajuda</h1>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6 flex-1 overflow-auto">
                <div className="max-w-6xl mx-auto space-y-12">
                    
                    {/* --- SEÇÃO DE VÍDEOS --- */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 justify-center">
                            Vídeos Tutoriais
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {videoItems.map((video, index) => (
                                <Card key={index} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{video.title}</CardTitle>
                                        <CardDescription>{video.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow flex flex-col">
                                      {video.videoUrl ? (
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                        <iframe
                                          className="absolute top-0 left-0 w-full h-full"
                                          src={video.videoUrl}
                                          title={video.title}
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                        ></iframe>
                                      </div>
                                      ) : (
                                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                                              <Play className="w-8 h-8" />
                                          </div>
                                      )}
                                  </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* --- SEÇÃO DE GUIAS --- */}
                    <section>
                        <h2 className="text-2xl font-bold mb-10 mt-10 flex items-center gap-2 justify-center">
                            Guias Passo a Passo
                        </h2>
                        <div className="space-y-6">
                            {guideSteps.map((step) => (
                              <div key={step.id} className="flex items-start gap-4">
                                  <div className={`flex-shrink-0 w-10 h-10 bg-${step.color}-100 dark:bg-${step.color}-900 rounded-full flex items-center justify-center`}>
                                      {step.icon}
                                  </div>
                                  <div className="flex-1">
                                      <Card className={`border-l-4 border-l-${step.color}-500 transition-all duration-300 ease-in-out hover:shadow-lg`}>
                                        <CardHeader className="cursor-pointer" onClick={() => toggleStep(step.id)}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className={`text-lg text-${step.color}-700 dark:text-${step.color}-400`}>
                                                        {step.title}
                                                    </CardTitle>
                                                    <CardDescription>{step.description}</CardDescription>
                                                </div>
                                                {expandedStep === step.id ? <ChevronDown /> : <ChevronRight />}
                                            </div>
                                        </CardHeader>
                                          {expandedStep === step.id && (
                                            <CardContent className="pt-0">
                                                {Array.isArray(step.content) ? (
                                                  <div className="space-y-4">
                                                    {step.content.map((text, index) => (
                                                      <div key={index} className={`flex items-start gap-3 p-3 bg-${step.color}-50 dark:bg-${step.color}-950 rounded-lg`}>
                                                        <div className={`flex-shrink-0 w-6 h-6 bg-${step.color}-500 text-white rounded-full flex items-center justify-center text-xs font-bold`}>
                                                          {index + 1}
                                                        </div>
                                                        <p className={`text-sm text-${step.color}-800 dark:text-${step.color}-200`}>{text}</p>
                                                      </div>
                                                    ))}
                                                  </div>
                                                ) : (
                                                  step.content
                                                )}
                                            </CardContent>
                                          )}
                                      </Card>
                                  </div>
                              </div>
                            ))}
                        </div>
                    </section>

                    {/* --- SEÇÃO DE FAQ --- */}
                    <section className="mb-14">
                        <h2 className="text-2xl font-bold mb-6 mt-10 flex items-center gap-2 justify-center">
                            Perguntas Frequentes
                        </h2>
                        <Accordion type="single" collapsible className="w-full">
                            {faqItems.map((faq) => (
                                <AccordionItem value={faq.value} key={faq.value}>
                                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                                    <AccordionContent>{faq.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>
                </div>
            </main>
        </div>
        </div>
    </SidebarProvider>
)
}
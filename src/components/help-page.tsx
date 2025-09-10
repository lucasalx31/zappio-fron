"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarProvider } from "@/components/ui/sidebar"
import { WhatsAppSidebar } from "@/components/whatsapp-sidebar"
import { Play, MessageCircle, Upload, Send, ChevronDown, ChevronRight, CheckCircle, Circle } from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useState } from "react";

export type videoItem ={
    title: string;
    description: string;
    videoUrl: string;
}

const videoItems: videoItem[] = [
    { title: "Como Conectar o WhatsApp", description: "Aprenda a conectar sua conta do WhatsApp ao Zappio", videoUrl: "" },
    { title: "Upload de Contatos", description: "Como fazer upload da planilha de contatos corretamente", videoUrl: "" },
    { title: "Enviando Mensagens", description: "Como criar e enviar campanhas de mensagens em massa", videoUrl: "" },
    { title: "Dicas e Boas Práticas", description: "Melhores práticas para usar o Zappio eficientemente", videoUrl: "" },
]



export default function HelpPage() {
    const [expandedStep, setExpandedStep] = useState<number | null>(null)

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
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Central de Ajuda</h1>
              </div>
            </div>
          </header>

          <main className="container mx-auto p-4 md:p-6 flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Seção de Vídeos Tutoriais */}
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 justify-center">
                  {/* <Play className="w-6 h-6 text-green-600" /> */}
                  Vídeos Tutoriais
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {videoItems.map((video, index) => (
                        <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">{video.title}</CardTitle>
                          <CardDescription>{video.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                            <div className="text-center">
                              <Play className="w-12 h-12 text-green-600 mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Vídeo em breve</p>
                            </div>
                          </div>
                          <Button className="w-full" onClick={() => window.open(video.videoUrl, '_blank')}>
                            <Play className="w-4 h-4 mr-2" />
                            Assistir Tutorial
                          </Button>
                        </CardContent>
                      </Card>
                    )
                )}
                </div>
              </section>

              {/* Seção de Guias */}
              <section>
                <h2 className="text-2xl font-bold mb-10 mt-10 flex items-center gap-2 justify-center">
                  Guias Passo a Passo
                </h2>

                <div className="space-y-6">
                  {/* Step 1 - WhatsApp Connection */}
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <Card className="border-l-4 border-l-green-500 transition-all duration-300 ease-in-out hover:shadow-xl active:scale-[0.99]">
                          <CardHeader
                            className="cursor-pointer"
                            onClick={() => toggleStep(1)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg text-green-700 dark:text-green-400">
                                  1. Conectando sua conta WhatsApp
                                </CardTitle>
                                <CardDescription>
                                  Aprenda como conectar seu WhatsApp ao Zappio de forma segura
                                </CardDescription>
                              </div>
                              {expandedStep === 1 ? (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </CardHeader>
                          {expandedStep === 1 && (
                            <CardContent className="pt-0">
                              <div className="space-y-4">
                                {[
                                  'Clique em "Conectar sessão" no card de conexão',
                                  'Aguarde o QR Code aparecer na tela',
                                  'Abra o WhatsApp no seu celular',
                                  'Vá em Configurações → Aparelhos conectados → Conectar um aparelho',
                                  'Escaneie o QR Code exibido na tela',
                                ].map((step, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg"
                                  >
                                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                      {index + 1}
                                    </div>
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                      {step}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 - Contact Upload */}
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <Card className="border-l-4 border-l-blue-500 transition-all duration-300 ease-in-out hover:shadow-xl active:scale-[0.99]">
                          <CardHeader
                            className="cursor-pointer"
                            onClick={() => toggleStep(2)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg text-blue-700 dark:text-blue-400">
                                  2. Preparando sua lista de contatos
                                </CardTitle>
                                <CardDescription>
                                  Configure sua planilha de contatos no formato correto
                                </CardDescription>
                              </div>
                              {expandedStep === 2 ? (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </CardHeader>
                          {expandedStep === 2 && (
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                                    Formatos Aceitos
                                  </h4>
                                  <div className="space-y-2">
                                    {['.xlsx', '.csv', '.xls'].map((format) => (
                                      <div
                                        key={format}
                                        className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded"
                                      >
                                        <CheckCircle className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-mono">{format}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                                    Dicas Importantes
                                  </h4>
                                  <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                    <p>Inclua DDD (ex: 11987654321)</p>
                                    <p>Baixe nosso modelo como referência</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 - Sending Messages */}
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <Send className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <Card className="border-l-4 border-l-purple-500 transition-all duration-300 ease-in-out hover:shadow-xl active:scale-[0.99]">
                          <CardHeader
                            className="cursor-pointer"
                            onClick={() => toggleStep(3)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg text-purple-700 dark:text-purple-400">
                                  3. Enviando mensagens
                                </CardTitle>
                                <CardDescription>
                                  Execute sua campanha de mensagens com segurança
                                </CardDescription>
                              </div>
                              {expandedStep === 3 ? (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </CardHeader>
                          {expandedStep === 3 && (
                            <CardContent className="pt-0">
                              <div className="space-y-4">
                                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                                  <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-3">
                                    Checklist Pré-Envio
                                  </h4>
                                  <div className="space-y-2">
                                    {[
                                      'WhatsApp conectado e ativo',
                                      'Planilha carregada com sucesso',
                                      'Mensagem revisada e testada',
                                      'Horário adequado para envio',
                                    ].map((item, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                        <Circle className="w-4 h-4 text-purple-600" />
                                        <span className="text-sm text-purple-800 dark:text-purple-200">
                                          {item}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                                  <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <strong>⚠️ Importante:</strong> O processo pode levar
                                    alguns minutos. Não feche a página durante o envio.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ */}
              <section className="mb-14">
                <h2 className="text-2xl font-bold mb-6 mt-10 flex items-center gap-2 justify-center">
                  Perguntas Frequentes
                </h2>

                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Por que meu WhatsApp desconecta?</AccordionTrigger>
                    <AccordionContent>
                      O WhatsApp pode desconectar por inatividade ou se você fizer login em outro dispositivo. Sempre
                      verifique o status da conexão antes de enviar mensagens.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>Qual o limite de mensagens por dia?</AccordionTrigger>
                    <AccordionContent>
                      Recomendamos não enviar mais de 500 mensagens por dia para evitar bloqueios do WhatsApp. Use
                      intervalos entre os envios para melhor entrega.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>Minha planilha não está sendo reconhecida</AccordionTrigger>
                    <AccordionContent>
                      Verifique se sua planilha está no formato correto (.xlsx, .csv, .xls) e se os números estão no
                      formato brasileiro com DDD (11 dígitos). Baixe nosso modelo para referência.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

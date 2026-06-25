"use client";

import { useRef, useState } from "react";
import {
  Bot,
  FileText,
  Loader2,
  Mic,
  Paperclip,
  Send,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ArtistSupportMessageRecord } from "@/lib/artist-support";
import { cn, formatDateTime } from "@/lib/utils";

type SupportChatProps = {
  initialMessages: ArtistSupportMessageRecord[];
};

type SpeechRecognitionConstructor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

export function SupportChat({ initialMessages }: SupportChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionConstructor> | null>(
    null,
  );

  async function sendMessage() {
    const message = draft.trim();

    if (!message || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/artist/support/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      const body = (await response.json().catch(() => null)) as
        | { message?: ArtistSupportMessageRecord; error?: string }
        | null;

      if (!response.ok || !body?.message) {
        throw new Error(body?.error ?? "No se pudo enviar el mensaje.");
      }

      setMessages((current) => [...current, body.message!]);
      setDraft("");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "No se pudo enviar el mensaje.",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function uploadFile(file: File) {
    setIsUploading(true);
    setError(null);
    setUploadStatus(`Subiendo ${file.name}...`);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/artist/support/files", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json().catch(() => null)) as
        | { message?: ArtistSupportMessageRecord; error?: string }
        | null;

      if (!response.ok || !body?.message) {
        throw new Error(body?.error ?? "No se pudo subir el archivo.");
      }

      setMessages((current) => [...current, body.message!]);
      setUploadStatus("Archivo enviado al soporte.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir el archivo.",
      );
      setUploadStatus(null);
    } finally {
      setIsUploading(false);
    }
  }

  function toggleDictation() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const windowWithSpeech = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition =
      windowWithSpeech.SpeechRecognition ??
      windowWithSpeech.webkitSpeechRecognition;

    if (!Recognition) {
      setError("Tu navegador no tiene dictado disponible.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (transcript) {
        setDraft((current) =>
          current.trim() ? `${current.trim()} ${transcript}` : transcript,
        );
      }
    };
    recognition.onerror = () => {
      setError("No se pudo transcribir el audio.");
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setError(null);
    setIsListening(true);
    recognition.start();
  }

  return (
    <section className="grid h-[calc(100vh-9rem)] min-h-[620px] overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Bot className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-normal">
              Chat de soporte
            </h1>
            <p className="text-xs text-muted-foreground">
              Estás hablando con el asistente de OpenAI de AUM PRODZ.
            </p>
          </div>
        </div>
        <div className="hidden rounded-md bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground sm:block">
          Historial real de tu cuenta
        </div>
      </div>

      <div className="min-h-0 overflow-y-auto bg-muted/35 px-4 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md rounded-md border border-border bg-card p-5 text-center">
              <Bot className="mx-auto size-7 text-primary" />
              <p className="mt-3 text-sm font-semibold">
                Bienvenido al soporte de artista.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Escribe tu pregunta, sube un documento o usa el botón de audio
                para dictar tu mensaje.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card p-4">
        {(error || uploadStatus) ? (
          <div
            className={cn(
              "mb-3 rounded-md border p-3 text-sm",
              error
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            {error ?? uploadStatus}
          </div>
        ) : null}

        <div className="grid gap-3 rounded-md border border-border bg-background p-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Escribe tu mensaje para soporte..."
            className="min-h-20 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.txt,.docx"
                className="sr-only"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];

                  if (file) {
                    void uploadFile(file);
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Paperclip className="size-4" />
                )}
                Archivo
              </Button>
              <Button
                type="button"
                variant={isListening ? "default" : "secondary"}
                size="sm"
                onClick={toggleDictation}
              >
                <Mic className="size-4" />
                {isListening ? "Escuchando..." : "Audio"}
              </Button>
            </div>
            <Button
              type="button"
              onClick={() => void sendMessage()}
              disabled={isSending || !draft.trim()}
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function MessageBubble({ message }: { message: ArtistSupportMessageRecord }) {
  const fromArtist = message.direction === "inbound";
  const isFile = message.message_type === "file";

  return (
    <div
      className={cn(
        "flex gap-3",
        fromArtist ? "justify-end" : "justify-start",
      )}
    >
      {!fromArtist ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-card">
          <Bot className="size-4 text-primary" />
        </div>
      ) : null}
      <div
        className={cn(
          "max-w-[82%] rounded-md border border-border p-3 text-sm shadow-sm",
          fromArtist
            ? "bg-primary text-primary-foreground"
            : "bg-card text-card-foreground",
        )}
      >
        <div className="flex items-start gap-2">
          {isFile ? <FileText className="mt-0.5 size-4 shrink-0" /> : null}
          <p className="whitespace-pre-wrap">{message.body}</p>
        </div>
        <p
          className={cn(
            "mt-2 text-[11px]",
            fromArtist
              ? "text-primary-foreground/70"
              : "text-muted-foreground",
          )}
        >
          {formatDateTime(message.occurred_at)}
        </p>
      </div>
      {fromArtist ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-card">
          <UserRound className="size-4 text-primary" />
        </div>
      ) : null}
    </div>
  );
}

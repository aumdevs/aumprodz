import Link from "next/link";
import { KeyRound } from "lucide-react";

import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecoverySessionHandler } from "./recovery-session-handler";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Crear Nueva Contraseña",
};

export default function ResetPasswordPage() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6"
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(5,9,20,0.94), rgba(5,9,20,0.82)), url('/aum-prodz-podcast-hero.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-28 border-b border-border/70 bg-background/50 backdrop-blur" />
      <div className="relative w-full max-w-md">
        <div className="mb-7 flex justify-center">
          <AumProdzLogo />
        </div>
        <Card className="bg-card/95 shadow-xl backdrop-blur">
          <CardHeader>
            <div className="mb-4 flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <KeyRound className="size-5" />
            </div>
            <CardTitle>Crear nueva contraseña</CardTitle>
            <CardDescription>
              Escribe una clave nueva para volver a entrar a tu cuenta artista.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecoverySessionHandler />
            <ResetPasswordForm />
          </CardContent>
        </Card>
        <div className="mt-6 text-center">
          <Link
            href="/login?next=%2Fartist"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Volver al acceso artista
          </Link>
        </div>
      </div>
    </main>
  );
}

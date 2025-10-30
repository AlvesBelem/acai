"use client";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export function AuthButton({ authed }: { authed: boolean }) {
  const [pending, start] = useTransition();
  if (!authed) {
    return (
      <Button
        size="sm"
        onClick={() => start(() => signIn("google", { callbackUrl: "/auth/redirect" }))}
        disabled={pending}
      >
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => start(() => signOut({ callbackUrl: "/" }))}
      disabled={pending}
    >
      {pending ? "Saindo..." : "Sair"}
    </Button>
  );
}

"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginState = { error: null };

export default function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/70">
          Correo
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          placeholder="admin@sabatjoyeria.com"
          className="border-white/15 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:ring-[#d5af34]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/70">
          Contraseña
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="border-white/15 bg-white/[0.04] text-white placeholder:text-white/25 focus-visible:ring-[#d5af34]"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-[13px] text-red-400">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full border-none bg-[#d5af34] py-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-black hover:bg-[#e8c84a]"
      >
        {pending ? "Verificando…" : "Entrar"}
      </Button>
    </form>
  );
}

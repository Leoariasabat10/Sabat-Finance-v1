"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, type LoginState } from "./actions";
import { destinoSeguro } from "@/lib/auth/acceso";

const initialState: LoginState = { error: null };

const campo =
  "min-h-12 w-full border border-[#ece9e2]/25 bg-transparent px-4 text-[17px] text-[#ece9e2] outline-none transition-colors placeholder:text-[#ece9e2]/35 focus-visible:border-[#d5af34] focus-visible:ring-1 focus-visible:ring-[#d5af34]";

export default function LoginForm() {
  const params = useSearchParams();
  const next = destinoSeguro(params.get("next"));
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[15px] text-[#ece9e2]/75">
          Correo
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" autoFocus placeholder="tu@correo.com" className={campo} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-[15px] text-[#ece9e2]/75">
          Contraseña
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={campo} />
      </div>

      {state.error ? (
        <p role="alert" className="text-[15px] text-[#e07b70]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 cursor-pointer border border-[#d5af34] bg-transparent px-8 text-[16px] font-medium text-[#d5af34] transition-[background-color,color,transform] duration-150 ease-premium hover:bg-[#d5af34] hover:text-[#0a0a0a] focus-visible:bg-[#d5af34] focus-visible:text-[#0a0a0a] focus-visible:outline-none active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Verificando…" : "Entrar"}
      </button>
    </form>
  );
}

# Sabat Finance

Asistente financiero y comercial para el negocio familiar: préstamos y ventas
(de contado o a crédito). Aplicación premium, ultrarrápida y sin capacitación.
Uso privado — sin autenticación, sin usuarios ni roles (ver `DECISIONS.md`).

Documentación oficial (fuente de verdad): carpeta `spec-sistema-prestamos/` y
los archivos raíz `CLAUDE.md`, `TASK.md`, `DECISIONS.md`, `STYLEGUIDE.md`.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript estricto · TailwindCSS ·
Supabase (solo Postgres + Storage, sin Auth) · Prisma · TanStack Query ·
React Hook Form · Zod · Framer Motion · Recharts · next-themes.

## Estado

- **Módulo 1 (Fundamentos técnicos):** esquema Prisma del modelo ER aprobado,
  layout base (sidebar, dark/light, responsive), shell navegable.
- **Módulo 2 (Clientes):** CRUD completo, ficha 360°, foto (Supabase Storage),
  búsqueda difusa, etiquetas y notas.
- Sin autenticación: la app abre directo en `/dashboard`, no hay login ni
  sesión — pensada para un solo computador y una sola persona administrando.
- `prisma/sql/setup.sql`: CHECK constraints (incluye venta-sin-interés),
  búsqueda difusa (`pg_trgm`) y triggers de auditoría (JSONB antes/después,
  sin usuario asociado). Sin RLS ni permisos.
- `prisma/sql/storage-clientes.sql`: bucket de fotos de clientes, lectura
  pública; las escrituras pasan por el servidor con la service role key.

## Puesta en marcha

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Copia `.env.example` a `.env.local` y completa: `NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` (Settings → API Keys → Secret keys — es
   privada, nunca la subas a un repo público), `DATABASE_URL` y `DIRECT_URL`.
   Prisma además necesita un archivo `.env` con `DATABASE_URL`/`DIRECT_URL`
   (el CLI de Prisma no lee `.env.local`).
3. Instala dependencias y genera el cliente Prisma:
   ```bash
   npm install
   npm run db:generate
   ```
4. Crea las tablas y aplica el setup SQL:
   ```bash
   npm run db:push
   ```
   Luego, en el SQL Editor de Supabase, ejecuta `prisma/sql/setup.sql` y
   `prisma/sql/storage-clientes.sql`.
5. Arranca:
   ```bash
   npm run dev
   ```
   `npm run dev` debe quedar corriendo mientras uses la app en
   `http://localhost:3000`.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — build de producción
- `npm run typecheck` — verificación de tipos
- `npm run db:generate` / `db:push` / `db:migrate` — Prisma

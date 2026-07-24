-- ═══════════════════════════════════════════════════════════════════
-- Sabat Finance — storage-clientes.sql
-- Ejecutar en el SQL Editor de Supabase para el Módulo 2 (Clientes).
-- Crea el bucket de fotos de clientes.
--
-- Esta app no usa Supabase Auth, así que no hay auth.uid() ni sesión con
-- la que armar políticas de escritura por usuario. Las subidas de foto
-- pasan por el servidor con la service role key (ver
-- src/lib/supabase/storage.ts), que ignora RLS por diseño de Supabase —
-- por eso aquí no se crean políticas de INSERT/UPDATE/DELETE. Solo se deja
-- lectura pública, para que las fotos se puedan mostrar con una URL directa.
--
-- Es idempotente: puede re-ejecutarse sin romper nada.
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('fotos-clientes', 'fotos-clientes', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];

-- Limpieza de políticas de un setup anterior basado en permisos.
DROP POLICY IF EXISTS fotos_clientes_insert ON storage.objects;
DROP POLICY IF EXISTS fotos_clientes_update ON storage.objects;
DROP POLICY IF EXISTS fotos_clientes_delete ON storage.objects;

DROP POLICY IF EXISTS fotos_clientes_select ON storage.objects;
CREATE POLICY fotos_clientes_select ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'fotos-clientes');

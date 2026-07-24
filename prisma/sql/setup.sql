-- ═══════════════════════════════════════════════════════════════════
-- Sabat Finance — setup.sql
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de `prisma db push`.
-- Contiene todo lo que Prisma no modela:
--   1. CHECK constraints del documento 03
--   2. Búsqueda difusa (pg_trgm)
--   3. Triggers de auditoría (JSONB antes/después)
--   4. Seed de configuración y plantillas de WhatsApp
--
-- Esta aplicación es de uso privado (un solo negocio, sin multiusuario,
-- sin Supabase Auth, sin roles ni permisos — ver DECISIONS.md). No hay
-- Row Level Security ni función has_permission(): la única barrera de
-- acceso es que la app corre en el computador del negocio. Prisma se
-- conecta directo con el rol `postgres`, así que RLS nunca protegía las
-- escrituras de la app de todas formas.
--
-- Es idempotente: puede re-ejecutarse sin romper nada.
-- ═══════════════════════════════════════════════════════════════════

-- ── 0. Limpieza de infraestructura de Auth (setups anteriores) ───────
-- CASCADE es necesario: las políticas RLS de un setup anterior (clientes,
-- ventas, etc.) dependen de has_permission(), y como Prisma no administra
-- políticas (solo tablas/columnas), `prisma db push` no las borró solas.
-- Al hacer CASCADE aquí, se van todas esas políticas de una vez.
DROP TRIGGER IF EXISTS trg_sync_usuario ON auth.users;
DROP FUNCTION IF EXISTS public.fn_sync_usuario();
DROP FUNCTION IF EXISTS public.has_permission(uuid, text) CASCADE;

-- ── 1. CHECK constraints ────────────────────────────────────────────
ALTER TABLE operaciones_credito DROP CONSTRAINT IF EXISTS chk_monto_capital_positivo;
ALTER TABLE operaciones_credito ADD CONSTRAINT chk_monto_capital_positivo CHECK (monto_capital > 0);

ALTER TABLE operaciones_credito DROP CONSTRAINT IF EXISTS chk_tasa_no_negativa;
ALTER TABLE operaciones_credito ADD CONSTRAINT chk_tasa_no_negativa CHECK (tasa_interes >= 0);

ALTER TABLE operaciones_credito DROP CONSTRAINT IF EXISTS chk_plazo_positivo;
ALTER TABLE operaciones_credito ADD CONSTRAINT chk_plazo_positivo CHECK (plazo_dias > 0);

-- Regla dura #4: una venta a crédito JAMÁS carga interés.
ALTER TABLE operaciones_credito DROP CONSTRAINT IF EXISTS chk_venta_sin_interes;
ALTER TABLE operaciones_credito ADD CONSTRAINT chk_venta_sin_interes
  CHECK (origen != 'venta' OR tasa_interes = 0);

ALTER TABLE venta_items DROP CONSTRAINT IF EXISTS chk_costo_no_negativo;
ALTER TABLE venta_items ADD CONSTRAINT chk_costo_no_negativo CHECK (costo >= 0);

ALTER TABLE venta_items DROP CONSTRAINT IF EXISTS chk_precio_no_negativo;
ALTER TABLE venta_items ADD CONSTRAINT chk_precio_no_negativo CHECK (precio_venta >= 0);

ALTER TABLE configuracion DROP CONSTRAINT IF EXISTS chk_configuracion_singleton;
ALTER TABLE configuracion ADD CONSTRAINT chk_configuracion_singleton CHECK (id = 1);

-- ── 1.b Sin RLS ──────────────────────────────────────────────────────
-- Esta app no usa Supabase Auth ni roles: se desactiva Row Level Security
-- en todas las tablas de negocio (si un setup anterior la había activado,
-- quedaba sin ninguna política y bloqueaba todo el acceso por completo).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clientes', 'operaciones_credito', 'cuotas', 'pagos', 'ventas', 'venta_items',
    'movimientos_caja', 'refinanciaciones', 'configuracion', 'notificaciones',
    'eventos_calendario', 'etiquetas', 'clientes_etiquetas', 'notas_cliente',
    'whatsapp_plantillas', 'whatsapp_mensajes', 'auditoria'
  ]
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END;
$$;

-- ── 2. Búsqueda difusa ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_trgm
  ON clientes USING gin (nombre gin_trgm_ops);

-- ── 3. Triggers de auditoría ─────────────────────────────────────────
-- Registra antes/después de cada cambio. Sin sesión de usuario, usuario_id
-- siempre queda en NULL — el resto del rastro (qué cambió y cuándo) sigue
-- siendo útil para revisar el historial del negocio.
CREATE OR REPLACE FUNCTION public.fn_auditoria()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO auditoria (tabla, registro_id, accion, valores_nuevos)
    VALUES (TG_TABLE_NAME, NEW.id::text, 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO auditoria (tabla, registro_id, accion, valores_anteriores, valores_nuevos)
    VALUES (TG_TABLE_NAME, NEW.id::text, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSE
    INSERT INTO auditoria (tabla, registro_id, accion, valores_anteriores)
    VALUES (TG_TABLE_NAME, OLD.id::text, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clientes', 'operaciones_credito', 'cuotas', 'pagos',
    'ventas', 'venta_items', 'movimientos_caja', 'refinanciaciones', 'configuracion'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_auditoria ON %I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_auditoria AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION fn_auditoria()', t);
  END LOOP;
END;
$$;

-- ── 4. Seeds ────────────────────────────────────────────────────────
-- Fila única de configuración.
INSERT INTO configuracion (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Plantillas de WhatsApp (doc 03, sección 3.7.4 — editables desde la app).
INSERT INTO whatsapp_plantillas (id, nombre, evento, cuerpo, activa) VALUES
  (gen_random_uuid(), 'Bienvenida', 'bienvenida', 'Hola {{cliente}}, gracias por tu compra/préstamo con nosotros 🙌', true),
  (gen_random_uuid(), 'Nueva venta', 'nueva_venta', '{{cliente}}, tu {{producto}} queda en {{valor}}, pago el {{fecha}}', true),
  (gen_random_uuid(), 'Nuevo préstamo', 'nuevo_prestamo', 'Hola {{cliente}}, registramos tu préstamo por {{valor}}, pago el {{fecha}}', true),
  (gen_random_uuid(), '3 días antes', 'tres_dias_antes', 'Hola {{cliente}}, tu pago de {{valor}} vence el {{fecha}} 🙂', true),
  (gen_random_uuid(), '1 día antes', 'un_dia_antes', '{{cliente}}, mañana vence tu pago de {{valor}}', true),
  (gen_random_uuid(), 'Hoy vence', 'mismo_dia', '{{cliente}}, hoy vence tu pago de {{valor}}', true),
  (gen_random_uuid(), 'Pago vencido', 'vencido', 'Hola {{cliente}}, tu pago de {{valor}} está pendiente desde {{fecha}}', true),
  (gen_random_uuid(), 'Gracias por pagar', 'pago_recibido', '¡Gracias {{cliente}}! Recibimos tu pago de {{valor}}. Saldo: {{saldo}}', true),
  (gen_random_uuid(), 'Paz y salvo', 'paz_y_salvo', '{{cliente}}, tu deuda quedó totalmente pagada 🎉', true),
  (gen_random_uuid(), 'Resumen diario', 'resumen_diario', 'Buenos días ☀️ Hoy debes cobrar: {{detalle}} — Total esperado: {{valor}}', true)
ON CONFLICT (evento) DO NOTHING;

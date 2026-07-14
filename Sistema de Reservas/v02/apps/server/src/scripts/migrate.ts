/**
 * Script de migração Firestore → PostgreSQL
 *
 * Uso: npx tsx src/scripts/migrate.ts
 *
 * Variáveis de ambiente necessárias:
 *   DATABASE_URL=postgresql://...
 *   FIREBASE_PROJECT_ID=moteisfortaleza-9dadd
 *   FIREBASE_API_KEY=AIza...
 */

import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "moteisfortaleza-9dadd";
const API_KEY = process.env.FIREBASE_API_KEY || "";
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FirestoreDoc = { name: string; fields: Record<string, any> };

async function firestoreGet(collection: string): Promise<FirestoreDoc[]> {
  const url = `${FIRESTORE_URL}/${collection}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = (await res.json()) as { documents?: FirestoreDoc[] };
  return data.documents || [];
}

function parseFields(doc: FirestoreDoc) {
  const id = doc.name.split("/").pop()!;
  const fields = doc.fields || {};
  const result: Record<string, unknown> = { id };

  for (const [key, val] of Object.entries(fields)) {
    if (val.stringValue !== undefined) result[key] = val.stringValue;
    else if (val.integerValue !== undefined) result[key] = parseInt(val.integerValue);
    else if (val.doubleValue !== undefined) result[key] = val.doubleValue;
    else if (val.booleanValue !== undefined) result[key] = val.booleanValue;
    else if (val.timestampValue !== undefined) result[key] = val.timestampValue;
    else if (val.arrayValue?.values)
      result[key] = val.arrayValue.values
        .map((v: { stringValue?: string }) => v.stringValue)
        .filter((v: string | undefined): v is string => !!v);
    else if (val.nullValue !== undefined) result[key] = null;
  }

  return result;
}

async function migrate() {
  console.log("🚀 Iniciando migração Firestore → PostgreSQL\n");

  // ── 1. MOTELS + SUITES (config/motels) ─────────────
  console.log("📦 Migrando motéis e suítes...");
  const configDocs = await firestoreGet("config");

  for (const doc of configDocs) {
    const motelsMap = doc.fields?.motels?.mapValue?.fields;
    if (!motelsMap) continue;

    for (const [motelName, motelData] of Object.entries(motelsMap)) {
      const m =
        ((motelData as any).mapValue?.fields || {}) as Record<string, any>;
      const motelId = motelName.toLowerCase().replace(/\s+/g, "-");

      await db
        .insert(schema.motels)
        .values({
          id: motelId,
          nome: motelName,
          slug: motelId,
          cor: m.cor?.stringValue || "#d20150",
          icone: m.icone?.stringValue || "🏨",
          tokenAsaas: m.token_asaas?.stringValue || "",
          ativo: true,
        })
        .onConflictDoUpdate({
          target: schema.motels.id,
          set: {
            nome: motelName,
            cor: m.cor?.stringValue,
            icone: m.icone?.stringValue,
            tokenAsaas: m.token_asaas?.stringValue,
          },
        });

      const suitesArr =
        (m.suites as any)?.arrayValue?.values || [];
      for (const suiteItem of suitesArr) {
        const s = (suiteItem?.mapValue?.fields || {}) as Record<string, any>;
        await db
          .insert(schema.suites)
          .values({
            id: `${motelId}-${(s.nome?.stringValue || "suite").toLowerCase().replace(/\s+/g, "-")}`,
            motelId,
            nome: s.nome?.stringValue || "Suíte",
            descricao: s.descricao?.stringValue || "",
            preco3: s.preco3?.stringValue || "0",
            preco12: s.preco12?.stringValue || "0",
            preco24: s.preco24?.stringValue || "0",
            fracao: s.fracao?.stringValue || "0",
            qtde: parseInt(s.qtde?.integerValue || "1"),
            tags:
              s.tags?.arrayValue?.values
                ?.map((v: any) => v.stringValue)
                .filter((v: string | undefined): v is string => !!v) || [],
            ativo: true,
          })
          .onConflictDoUpdate({
            target: schema.suites.id,
            set: {
              nome: s.nome?.stringValue,
              descricao: s.descricao?.stringValue,
              preco3: s.preco3?.stringValue,
              preco12: s.preco12?.stringValue,
              preco24: s.preco24?.stringValue,
              qtde: parseInt(s.qtde?.integerValue || "1"),
            },
          });
      }
    }
  }
  console.log("  ✅ Motéis e suítes migrados");

  // ── 2. USERS ───────────────────────────────────────
  console.log("👤 Migrando usuários...");
  const userDocs = await firestoreGet("usuarios");

  for (const doc of userDocs) {
    const u = parseFields(doc);
    if (u.role === "removido") continue;
    await db
      .insert(schema.users)
      .values({
        // @ts-expect-error migration script
        id: u.id,
        nome: (u.nome as string) || (u.email as string)?.split("@")[0] || "Usuário",
        email: (u.email as string) || "",
        role: ((u.role as string) || "funcionario") as any,
        motelId: null,
      })
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          nome: (u.nome as string) || "",
          email: (u.email as string) || "",
          role: ((u.role as string) || "funcionario") as any,
        },
      });
  }
  console.log(`  ✅ ${userDocs.length} usuários migrados`);

  // ── 3. RESERVATIONS ────────────────────────────────
  console.log("📅 Migrando reservas...");
  const reservaDocs = await firestoreGet("reservas");

  let count = 0;
  for (const doc of reservaDocs) {
    const r = parseFields(doc);
    try {
      await db
        .insert(schema.reservations)
        .values({
          // @ts-expect-error migration script
          id: r.id,
          motelId: ((r.motel as string) || "").toLowerCase().replace(/\s+/g, "-"),
          suiteId: `${((r.motel as string) || "").toLowerCase().replace(/\s+/g, "-")}-${((r.suite as string) || "").toLowerCase().replace(/\s+/g, "-")}`,
          clienteNome: (r.cliente_nome as string) || "",
          clienteCpf: (r.cliente_cpf as string) || "",
          duracao: ((r.duracao as string) || "3h") as any,
          preco: String(r.preco || "0"),
          precoOriginal: (r.preco_original as string) || null,
          promocao: ((r.promocao as string) || "nenhuma") as any,
          dataReserva: (r.data_reserva as string) || "",
          horaChegada: (r.hora_chegada as string) || (r.horaRes as string) || "12:00",
          protocolo: (r.protocolo as string) || null,
          status: ((r.status as string) || "aguardando_pagamento") as any,
          paymentId: (r.payment_id as string) || null,
          tokenAsaas: (r.token_asaas as string) || null,
          origem: (r.origem as string) || "chat_web",
          criadoEm: r.criado_em ? new Date(r.criado_em as string) : new Date(),
          statusOrigem: (r.status_origem as string) || null,
        })
        .onConflictDoNothing();
      count++;
    } catch (e) {
      console.warn(`  ⚠️ Erro na reserva ${r.id}: ${(e as Error).message}`);
    }
  }
  console.log(`  ✅ ${count}/${reservaDocs.length} reservas migradas`);

  // ── 4. LINKTREE + NPS ──────────────────────────────
  console.log("🔗 Migrando links e NPS...");
  const estabDocs = await firestoreGet("estabelecimentos");
  let linkCount = 0;
  let npsCount = 0;

  for (const estab of estabDocs) {
    const estabId = estab.name.split("/").pop()!;
    const linkDocs = await firestoreGet(`estabelecimentos/${estabId}/linktree`);

    for (const doc of linkDocs) {
      const l = parseFields(doc);
      await db
        .insert(schema.linktree)
        .values({
          // @ts-expect-error migration script
          id: l.id,
          motelId: estabId,
          title: (l.title as string) || "",
          url: (l.url as string) || "",
          icon: (l.icon as string) || "🔗",
          ordem: (l.ordem as number) || 0,
          ativo: (l.ativo as boolean) ?? true,
          createdAt: l.createdAt ? new Date(l.createdAt as string) : new Date(),
        })
        .onConflictDoNothing();
      linkCount++;
    }

    // NPS config
    const npsConfigDocs = await firestoreGet(`estabelecimentos/${estabId}/config/nps`);
    for (const nc of npsConfigDocs) {
      const cfg = parseFields(nc);
      await db
        .insert(schema.npsConfig)
        .values({
          id: estabId + "-nps",
          motelId: estabId,
          ativo: (cfg.ativo as boolean) ?? true,
          titulo: (cfg.titulo as string) || null,
          mensagem: (cfg.mensagem as string) || null,
        })
        .onConflictDoNothing();
    }

    // NPS responses
    const respDocs = await firestoreGet(`estabelecimentos/${estabId}/nps_respostas`);
    for (const doc of respDocs) {
      const r = parseFields(doc);
      await db
        .insert(schema.npsResponses)
        .values({
          // @ts-expect-error migration script
          id: r.id,
          motelId: estabId,
          nota: (r.nota as number) || 0,
          comentario: (r.comentario as string) || null,
          createdAt: r.createdAt ? new Date(r.createdAt as string) : new Date(),
        })
        .onConflictDoNothing();
      npsCount++;
    }
  }
  console.log(`  ✅ ${linkCount} links + ${npsCount} respostas NPS migradas`);

  console.log("\n🎉 Migração concluída!");
  await client.end();
}

migrate().catch((e) => {
  console.error("❌ Erro na migração:", e);
  process.exit(1);
});

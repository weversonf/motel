import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", [
  "superadmin",
  "admin",
  "funcionario",
  "removido",
]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "aguardando_pagamento",
  "pendente_cartao",
  "pendente_recepcao",
  "confirmado",
  "check_in",
  "cancelado",
]);

export const promotionEnum = pgEnum("promotion_type", [
  "30%_OFF",
  "3h+3h",
  "cartao",
  "recepcao",
  "nenhuma",
]);

export const durationEnum = pgEnum("duration_type", [
  "3h",
  "6h",
  "12h",
  "24h",
]);

// ─── USERS ──────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("funcionario"),
  motelId: text("motel_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── DELETED USERS ─────────────────────────────────────
export const deletedUsers = pgTable("deleted_users", {
  uid: text("uid").primaryKey(),
  removidoEm: timestamp("removido_em").defaultNow(),
});

// ─── MOTELS ────────────────────────────────────────────
export const motels = pgTable("motels", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  slug: text("slug").notNull().unique(),
  cor: text("cor"),
  icone: text("icone"),
  tokenAsaas: text("token_asaas"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── SUITES ────────────────────────────────────────────
export const suites = pgTable(
  "suites",
  {
    id: text("id").primaryKey(),
    motelId: text("motel_id")
      .notNull()
      .references(() => motels.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    descricao: text("descricao"),
    preco3: numeric("preco_3h"),
    preco12: numeric("preco_12h"),
    preco24: numeric("preco_24h"),
    fracao: numeric("fracao"),
    qtde: integer("qtde").default(1),
    tags: text("tags").array(),
    ativo: boolean("ativo").default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("suites_motel_idx").on(t.motelId, t.ativo),
  ]
);

// ─── RESERVATIONS ──────────────────────────────────────
export const reservations = pgTable(
  "reservations",
  {
    id: text("id").primaryKey(),
    motelId: text("motel_id")
      .notNull()
      .references(() => motels.id),
    suiteId: text("suite_id")
      .notNull()
      .references(() => suites.id),
    clienteNome: text("cliente_nome").notNull(),
    clienteCpf: text("cliente_cpf").notNull(),
    duracao: durationEnum("duracao").notNull(),
    preco: numeric("preco").notNull(),
    precoOriginal: numeric("preco_original"),
    promocao: promotionEnum("promocao").default("nenhuma"),
    dataReserva: text("data_reserva").notNull(),
    horaChegada: text("hora_chegada").notNull(),
    protocolo: text("protocolo"),
    status: reservationStatusEnum("status")
      .notNull()
      .default("aguardando_pagamento"),
    paymentId: text("payment_id"),
    tokenAsaas: text("token_asaas"),
    modoTeste: boolean("modo_teste").default(false),
    statusAsaasConfirmado: text("status_asaas_confirmado"),
    origem: text("origem").default("chat_web"),
    criadoEm: timestamp("criado_em").defaultNow(),
    statusAtualizadoEm: timestamp("status_atualizado_em"),
    statusOrigem: text("status_origem"),
    statusOperadorUid: text("status_operador_uid"),
  },
  (t) => [
    index("reserv_payment_idx").on(t.paymentId),
    index("reserv_protocolo_idx").on(t.protocolo),
    index("reserv_cpf_criado_idx").on(t.clienteCpf, t.criadoEm.desc()),
    index("reserv_data_status_idx").on(t.dataReserva, t.status),
    index("reserv_motel_data_idx").on(t.motelId, t.dataReserva),
    index("reserv_criado_idx").on(t.criadoEm.desc()),
  ]
);

// ─── LINKTREE ──────────────────────────────────────────
export const linktree = pgTable(
  "linktree",
  {
    id: text("id").primaryKey(),
    motelId: text("motel_id")
      .notNull()
      .references(() => motels.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    icon: text("icon"),
    ordem: integer("ordem").default(0),
    ativo: boolean("ativo").default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("linktree_motel_idx").on(t.motelId),
  ]
);

// ─── NPS CONFIG ────────────────────────────────────────
export const npsConfig = pgTable("nps_config", {
  id: text("id").primaryKey(),
  motelId: text("motel_id")
    .notNull()
    .references(() => motels.id, { onDelete: "cascade" })
    .unique(),
  ativo: boolean("ativo").default(true),
  titulo: text("titulo"),
  mensagem: text("mensagem"),
});

// ─── NPS RESPONSES ─────────────────────────────────────
export const npsResponses = pgTable(
  "nps_responses",
  {
    id: text("id").primaryKey(),
    motelId: text("motel_id")
      .notNull()
      .references(() => motels.id, { onDelete: "cascade" }),
    nota: integer("nota").notNull(),
    comentario: text("comentario"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("nps_motel_idx").on(t.motelId),
    index("nps_created_idx").on(t.createdAt.desc()),
    uniqueIndex("nps_motel_nota_idx").on(t.motelId, t.nota),
  ]
);

// ─── RELATIONS ─────────────────────────────────────────
export const motelsRelations = relations(motels, ({ many }) => ({
  suites: many(suites),
  reservations: many(reservations),
}));

export const suitesRelations = relations(suites, ({ one }) => ({
  motel: one(motels, {
    fields: [suites.motelId],
    references: [motels.id],
  }),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  motel: one(motels, {
    fields: [reservations.motelId],
    references: [motels.id],
  }),
  suite: one(suites, {
    fields: [reservations.suiteId],
    references: [suites.id],
  }),
}));

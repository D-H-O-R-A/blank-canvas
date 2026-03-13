/**
 * =========================================================================
 * config.js — Configuração central do backend
 * =========================================================================
 *
 * Exporta todas as dependências compartilhadas entre os módulos:
 * - admin: instância do firebase-admin (já inicializada)
 * - db: referência ao Firestore
 * - mercadoPagoToken: secret do Mercado Pago (defineSecret)
 * - APP_BASE_URL: URL base do app para redirecionamentos
 * - PLAN_CONFIG: configuração dos planos disponíveis
 *
 * USO:
 *   const { db, admin, mercadoPagoToken, APP_BASE_URL, PLAN_CONFIG } = require("../config");
 * =========================================================================
 */

const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();

/** @type {FirebaseFirestore.Firestore} */
const db = admin.firestore();

/** Secret do Mercado Pago — configure com: firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN */
const mercadoPagoToken = defineSecret("MERCADOPAGO_ACCESS_TOKEN");

/** URL base do app para redirecionamentos pós-pagamento */
const APP_BASE_URL = "https://click-servico.web.app";

/** Configuração dos planos disponíveis (nome → { amount em BRL, frequency em meses }) */
const PLAN_CONFIG = {
  "1 mês": { amount: 25, frequency: 1 },
  "6 meses": { amount: 23, frequency: 1 },
};

module.exports = { admin, db, mercadoPagoToken, APP_BASE_URL, PLAN_CONFIG };

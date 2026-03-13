/**
 * =========================================================================
 * index.js — Entry point das Firebase Cloud Functions
 * =========================================================================
 *
 * Inicializa o Express, aplica middlewares globais (CORS, JSON, logger)
 * e monta os routers modulares:
 *
 *   - routes/public.js  → /register, /contact, /webhook/mercadopago
 *   - routes/profile.js → /profile, /create-payment
 *   - routes/admin.js   → /admin/*
 *
 * Exporta como função HTTP única "api" (Firebase Functions 2nd gen).
 *
 * ESTRUTURA DO PROJETO:
 *   functions/
 *   ├── index.js           ← Este arquivo (entry point)
 *   ├── config.js          ← Configuração central (db, admin, secrets, constantes)
 *   ├── middleware/
 *   │   ├── auth.js        ← Validação JWT (requireAuth)
 *   │   ├── admin.js       ← Verificação de admin via Firestore
 *   │   └── logger.js      ← Log automático de POST/PUT
 *   └── routes/
 *       ├── public.js      ← Endpoints sem autenticação
 *       ├── profile.js     ← Endpoints do profissional autenticado
 *       └── admin.js       ← Endpoints administrativos
 * =========================================================================
 */

const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");

const { mercadoPagoToken } = require("./config");
const { logAction } = require("./middleware/logger");

// Routers
const publicRoutes = require("./routes/public");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/admin");

// Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(logAction);

// Montar rotas
app.use(publicRoutes);
app.use(profileRoutes);
app.use(adminRoutes);

// Export como função HTTP única (2nd gen) com acesso ao secret do MP
exports.api = onRequest({ secrets: [mercadoPagoToken] }, app);

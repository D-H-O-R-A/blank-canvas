/**
 * =========================================================================
 * routes/profile.js — Endpoints do profissional autenticado
 * =========================================================================
 *
 * Rotas protegidas por JWT (requireAuth):
 *
 * GET /profile
 *   Retorna perfil do profissional autenticado.
 *   Header: Authorization: Bearer <JWT>
 *   Retorna: { name, email, whatsapp, profession, plan, subscriptionStatus, ... }
 *
 * PUT /profile
 *   Atualiza perfil do profissional autenticado.
 *   Header: Authorization: Bearer <JWT>
 *   Body: { name?, whatsapp?, profession?, about?, socialLinks? }
 *   Retorna: { ok: true }
 *
 * POST /create-payment
 *   Gera novo link de pagamento do Mercado Pago.
 *   Header: Authorization: Bearer <JWT>
 *   Body: { plan? }
 *   Retorna: { paymentUrl: string }
 * =========================================================================
 */

const express = require("express");
const router = express.Router();
const { admin, db, mercadoPagoToken, APP_BASE_URL, PLAN_CONFIG } = require("../config");
const { requireAuth } = require("../middleware/auth");

// ----- GET /profile -----
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const doc = await db.collection("professionals").doc(req.uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Perfil não encontrado" });
    }
    return res.status(200).json(doc.data());
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- PUT /profile -----
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, whatsapp, profession, about, socialLinks } = req.body;
    const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    if (name !== undefined) updateData.name = name;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (profession !== undefined) updateData.profession = profession;
    if (about !== undefined) updateData.about = about;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    await db.collection("professionals").doc(req.uid).update(updateData);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- POST /create-payment -----
router.post("/create-payment", requireAuth, async (req, res) => {
  try {
    const doc = await db.collection("professionals").doc(req.uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Perfil não encontrado" });
    }

    const profile = doc.data();
    const plan = req.body.plan || profile.plan || "1 mês";
    const selectedPlan = PLAN_CONFIG[plan] || PLAN_CONFIG["1 mês"];

    const mpToken = mercadoPagoToken.value();
    if (!mpToken) {
      return res.status(500).json({ error: "Mercado Pago não configurado." });
    }

    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${mpToken}` },
      body: JSON.stringify({
        reason: `Click Serviços - Plano ${plan}`,
        auto_recurring: {
          frequency: selectedPlan.frequency,
          frequency_type: "months",
          transaction_amount: selectedPlan.amount,
          currency_id: "BRL",
        },
        payer_email: profile.email,
        back_url: `${APP_BASE_URL}/pagamento-sucesso`,
        external_reference: req.uid,
      }),
    });

    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      return res.status(500).json({ error: "Erro ao criar pagamento" });
    }

    await db.collection("professionals").doc(req.uid).update({ mercadoPagoPreapprovalId: mpData.id });

    return res.status(200).json({ paymentUrl: mpData.init_point });
  } catch (error) {
    console.error("create-payment error:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

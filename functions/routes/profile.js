/**
 * =========================================================================
 * routes/profile.js — Endpoints do profissional autenticado
 * =========================================================================
 */

const express = require("express");
const router = express.Router();
const { admin, db, mercadoPagoToken, APP_BASE_URL, PLAN_CONFIG } = require("../config");
const { requireAuth } = require("../middleware/auth");
const { logError } = require("../middleware/logger");

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
    await logError(req, error);
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

    // Sync displayName to Auth if name changed
    if (name) {
      try { await admin.auth().updateUser(req.uid, { displayName: name }); } catch (e) { /* ignore */ }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("updateProfile error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- POST /profile/photo -----
router.post("/profile/photo", requireAuth, async (req, res) => {
  try {
    const { photo, contentType } = req.body;

    if (!photo) return res.status(400).json({ error: "Foto não enviada" });

    const bucket = admin.storage().bucket();
    const ext = contentType === "image/png" ? "png" : "jpg";
    const filePath = `profile-photos/${req.uid}.${ext}`;
    const file = bucket.file(filePath);

    const buffer = Buffer.from(photo, "base64");
    await file.save(buffer, {
      metadata: { contentType: contentType || "image/jpeg" },
      public: true,
    });

    const photoURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    // Update Auth + Firestore
    await admin.auth().updateUser(req.uid, { photoURL });
    await db.collection("professionals").doc(req.uid).update({
      photoURL,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ ok: true, photoURL });
  } catch (error) {
    console.error("profile/photo error:", error);
    await logError(req, error);
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
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

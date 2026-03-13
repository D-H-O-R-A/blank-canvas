const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// Secret managed via: firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN
const mercadoPagoToken = defineSecret("MERCADOPAGO_ACCESS_TOKEN");

// =====================================================
// AUTH MIDDLEWARE - validates Bearer token
// =====================================================
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token não fornecido" });
    return;
  }
  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    req.decodedToken = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// =====================================================
// POST /register - Public (no auth required)
// =====================================================
app.post("/register", async (req, res) => {
  try {
    const { name, email, whatsapp, profession, password, plan } = req.body;

    if (!name || !email || !password || !plan || !whatsapp) {
      res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
      return;
    }

    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
    } catch (authError) {
      if (authError.code === "auth/email-already-exists") {
        res.status(409).json({ error: "E-mail já cadastrado. Faça login.", code: "EMAIL_EXISTS" });
        return;
      }
      throw authError;
    }

    const uid = userRecord.uid;

    const planConfig = {
      "1 mês": { amount: 25, frequency: 1 },
      "6 meses": { amount: 23, frequency: 1 },
    };
    const selectedPlan = planConfig[plan] || planConfig["1 mês"];

    await db.collection("professionals").doc(uid).set({
      name,
      email,
      whatsapp,
      profession: profession || "",
      plan,
      subscriptionStatus: "pending",
      about: "",
      socialLinks: { instagram: "", facebook: "", linkedin: "", website: "" },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const mpToken = mercadoPagoToken.value();
    if (!mpToken) {
      res.status(500).json({ error: "Mercado Pago não configurado." });
      return;
    }

    const backUrl = "https://click-servico.web.app";

    const preapprovalBody = {
      reason: `Click Serviços - Plano ${plan}`,
      auto_recurring: {
        frequency: selectedPlan.frequency,
        frequency_type: "months",
        transaction_amount: selectedPlan.amount,
        currency_id: "BRL",
      },
      payer_email: email,
      back_url: `${backUrl}/pagamento-sucesso`,
      external_reference: uid,
    };

    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpToken}`,
      },
      body: JSON.stringify(preapprovalBody),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", mpData);
      res.status(500).json({ error: "Erro ao criar assinatura no Mercado Pago" });
      return;
    }

    await db.collection("professionals").doc(uid).update({
      mercadoPagoPreapprovalId: mpData.id,
    });

    res.status(200).json({ paymentUrl: mpData.init_point });
  } catch (error) {
    console.error("register error:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
});

// =====================================================
// POST /webhook/mercadopago - Public
// =====================================================
app.post("/webhook/mercadopago", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "subscription_preapproval" && data?.id) {
      const mpToken = mercadoPagoToken.value();
      const mpRes = await fetch(
        `https://api.mercadopago.com/preapproval/${data.id}`,
        { headers: { Authorization: `Bearer ${mpToken}` } }
      );
      const preapproval = await mpRes.json();

      if (preapproval.status === "authorized") {
        const uid = preapproval.external_reference;
        if (uid) {
          const now = new Date();
          const paidUntil = new Date(now);
          paidUntil.setMonth(
            paidUntil.getMonth() + (preapproval.auto_recurring?.frequency || 1)
          );

          await db.collection("professionals").doc(uid).update({
            subscriptionStatus: "active",
            paidUntil: paidUntil.toISOString(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          await db
            .collection("professionals")
            .doc(uid)
            .collection("payments")
            .add({
              preapprovalId: data.id,
              status: "authorized",
              amount: preapproval.auto_recurring?.transaction_amount,
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              paidUntil: paidUntil.toISOString(),
            });
        }
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(200).json({ ok: true });
  }
});

// =====================================================
// GET /profile - Protected
// =====================================================
app.get("/profile", requireAuth, async (req, res) => {
  try {
    const doc = await db.collection("professionals").doc(req.uid).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Perfil não encontrado" });
      return;
    }
    res.status(200).json(doc.data());
  } catch (error) {
    console.error("getProfile error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// PUT /profile - Protected
// =====================================================
app.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, whatsapp, profession, about, socialLinks } = req.body;
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (name !== undefined) updateData.name = name;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (profession !== undefined) updateData.profession = profession;
    if (about !== undefined) updateData.about = about;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    await db.collection("professionals").doc(req.uid).update(updateData);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// POST /create-payment - Protected
// =====================================================
app.post("/create-payment", requireAuth, async (req, res) => {
  try {
    const doc = await db.collection("professionals").doc(req.uid).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Perfil não encontrado" });
      return;
    }

    const profile = doc.data();
    const plan = req.body.plan || profile.plan || "1 mês";

    const planConfig = {
      "1 mês": { amount: 25, frequency: 1 },
      "6 meses": { amount: 23, frequency: 1 },
    };
    const selectedPlan = planConfig[plan] || planConfig["1 mês"];

    const mpToken = mercadoPagoToken.value();
    if (!mpToken) {
      res.status(500).json({ error: "Mercado Pago não configurado." });
      return;
    }

    const preapprovalBody = {
      reason: `Click Serviços - Plano ${plan}`,
      auto_recurring: {
        frequency: selectedPlan.frequency,
        frequency_type: "months",
        transaction_amount: selectedPlan.amount,
        currency_id: "BRL",
      },
      payer_email: profile.email,
      back_url: "https://click-servico.web.app/pagamento-sucesso",
      external_reference: req.uid,
    };

    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpToken}`,
      },
      body: JSON.stringify(preapprovalBody),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      res.status(500).json({ error: "Erro ao criar pagamento" });
      return;
    }

    await db.collection("professionals").doc(req.uid).update({
      mercadoPagoPreapprovalId: mpData.id,
    });

    res.status(200).json({ paymentUrl: mpData.init_point });
  } catch (error) {
    console.error("create-payment error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Export as single "api" function (2nd gen) with secret access
exports.api = onRequest(
  { secrets: [mercadoPagoToken] },
  app
);

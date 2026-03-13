import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import express from "express";
import cors from "cors";

admin.initializeApp();
const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// =====================================================
// MERCADO PAGO CONFIG
// firebase functions:config:set mercadopago.access_token="YOUR_ACCESS_TOKEN"
// =====================================================
const getMercadoPagoToken = (): string => {
  return functions.config().mercadopago?.access_token || "";
};

// =====================================================
// AUTH MIDDLEWARE - validates Bearer token
// =====================================================
async function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token não fornecido" });
    return;
  }
  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).uid = decoded.uid;
    (req as any).decodedToken = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// =====================================================
// POST /register - Public (no auth required)
// Creates Firebase Auth user + Firestore profile + MP subscription
// =====================================================
app.post("/register", async (req, res) => {
  try {
    const { name, email, whatsapp, profession, password, plan } = req.body;

    // Validate required fields
    if (!name || !email || !password || !plan || !whatsapp) {
      res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
      return;
    }

    // Create Firebase Auth user
    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
    } catch (authError: any) {
      if (authError.code === "auth/email-already-exists") {
        res.status(409).json({ error: "E-mail já cadastrado. Faça login.", code: "EMAIL_EXISTS" });
        return;
      }
      throw authError;
    }

    const uid = userRecord.uid;

    // Determine amount based on plan
    const planConfig: Record<string, { amount: number; frequency: number }> = {
      "1 mês": { amount: 25, frequency: 1 },
      "6 meses": { amount: 23, frequency: 1 },
    };
    const selectedPlan = planConfig[plan] || planConfig["1 mês"];

    // Save profile to Firestore
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

    // Create Mercado Pago recurring subscription
    const mpToken = getMercadoPagoToken();
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

    const mpData = (await mpResponse.json()) as any;

    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", mpData);
      res.status(500).json({ error: "Erro ao criar assinatura no Mercado Pago" });
      return;
    }

    // Save preapproval ID
    await db.collection("professionals").doc(uid).update({
      mercadoPagoPreapprovalId: mpData.id,
    });

    res.status(200).json({ paymentUrl: mpData.init_point });
  } catch (error: any) {
    console.error("register error:", error);
    res.status(500).json({ error: error.message || "Erro interno" });
  }
});

// =====================================================
// POST /webhook/mercadopago - Public (MP sends notifications)
// =====================================================
app.post("/webhook/mercadopago", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "subscription_preapproval" && data?.id) {
      const mpToken = getMercadoPagoToken();
      const mpRes = await fetch(
        `https://api.mercadopago.com/preapproval/${data.id}`,
        { headers: { Authorization: `Bearer ${mpToken}` } }
      );
      const preapproval = (await mpRes.json()) as any;

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
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(200).json({ ok: true });
  }
});

// =====================================================
// GET /profile - Protected (requires Bearer token)
// =====================================================
app.get("/profile", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).uid;
    const doc = await db.collection("professionals").doc(uid).get();

    if (!doc.exists) {
      res.status(404).json({ error: "Perfil não encontrado" });
      return;
    }

    res.status(200).json(doc.data());
  } catch (error: any) {
    console.error("getProfile error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// PUT /profile - Protected (requires Bearer token)
// =====================================================
app.put("/profile", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).uid;
    const { name, whatsapp, profession, about, socialLinks } = req.body;

    const updateData: Record<string, any> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (name !== undefined) updateData.name = name;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (profession !== undefined) updateData.profession = profession;
    if (about !== undefined) updateData.about = about;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    await db.collection("professionals").doc(uid).update(updateData);

    res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error("updateProfile error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// POST /create-payment - Protected (for existing users)
// =====================================================
app.post("/create-payment", requireAuth, async (req, res) => {
  try {
    const uid = (req as any).uid;
    const doc = await db.collection("professionals").doc(uid).get();

    if (!doc.exists) {
      res.status(404).json({ error: "Perfil não encontrado" });
      return;
    }

    const profile = doc.data()!;
    const plan = req.body.plan || profile.plan || "1 mês";

    const planConfig: Record<string, { amount: number; frequency: number }> = {
      "1 mês": { amount: 25, frequency: 1 },
      "6 meses": { amount: 23, frequency: 1 },
    };
    const selectedPlan = planConfig[plan] || planConfig["1 mês"];

    const mpToken = getMercadoPagoToken();
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

    const mpData = (await mpResponse.json()) as any;

    if (!mpResponse.ok) {
      res.status(500).json({ error: "Erro ao criar pagamento" });
      return;
    }

    await db.collection("professionals").doc(uid).update({
      mercadoPagoPreapprovalId: mpData.id,
    });

    res.status(200).json({ paymentUrl: mpData.init_point });
  } catch (error: any) {
    console.error("create-payment error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Export as single "api" function
export const api = functions.https.onRequest(app);

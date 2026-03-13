

# Plan: Backend para JavaScript puro + Página "Em Breve" com 3D

## 1. Firebase Functions → JavaScript puro (Node 20)

**Deletar:** `functions/src/index.ts`, `functions/tsconfig.json`

**Criar:** `functions/index.js` (arquivo direto, sem pasta `src/` nem compilação)

- Mesma lógica do TypeScript atual, convertida para JS puro (sem tipos, sem `as any`, sem `: string`)
- `main` no package.json aponta para `index.js`
- Node 20, `firebase-functions` v6 (2nd gen com `onRequest` de `firebase-functions/v2/https`)
- Remove `node-fetch` (Node 20 tem `fetch` nativo)
- Remove todas as devDependencies de TypeScript
- Remove script `build` (não precisa compilar)
- Usa `defineSecret` do Firebase Functions v2 para o token do Mercado Pago (em vez de `functions.config()`)

**Atualizar:** `functions/package.json`
```json
{
  "engines": { "node": "20" },
  "main": "index.js",
  "type": "commonjs",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "firebase-admin": "^13.0.0",
    "firebase-functions": "^6.3.0"
  }
}
```

**Atualizar:** `FIREBASE_FUNCTIONS_SETUP.md` com novos comandos (sem build, `defineSecret`, Node 20)

## 2. Página "Em Breve" dedicada (`/em-breve`) com 3D

**Substituir** o `ComingSoonDialog` (modal) por uma **página completa** `/em-breve`.

**Criar:** `src/pages/ComingSoon.tsx`
- Página fullscreen com fundo 3D usando `@react-three/fiber@^8.18` + `@react-three/drei@^9.122.0` + `three@^0.170.0`
- Canvas 3D no background com esferas/partículas flutuantes animadas (tons esmeralda)
- Countdown grande e elegante (2 meses à frente)
- Texto explicativo + botão "Sou profissional" + botão "Voltar"
- Totalmente responsivo

**Modificar:** `src/components/HeroSection.tsx` e `src/components/CTASection.tsx`
- Botão "Quero Contratar" → `navigate("/em-breve")` em vez de abrir dialog
- Remover estado `comingSoonOpen` e import do `ComingSoonDialog`

**Modificar:** `src/App.tsx` → adicionar rota `/em-breve`

**Deletar:** `src/components/ComingSoonDialog.tsx`

## Resumo de arquivos

| Ação | Arquivo |
|------|---------|
| Deletar | `functions/src/index.ts`, `functions/tsconfig.json` |
| Criar | `functions/index.js` |
| Editar | `functions/package.json` |
| Criar | `src/pages/ComingSoon.tsx` |
| Editar | `src/App.tsx` |
| Editar | `src/components/HeroSection.tsx` |
| Editar | `src/components/CTASection.tsx` |
| Deletar | `src/components/ComingSoonDialog.tsx` |
| Editar | `FIREBASE_FUNCTIONS_SETUP.md` |


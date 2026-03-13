

# Plano: Cookie Consent, Politica de Cookies, Selos no Footer, Responsividade e Auth Guard

## 1. Banner de Cookie Consent (LGPD)

Criar `src/components/CookieConsent.tsx`:
- Banner fixo no bottom da tela, aparece na primeira visita
- Verifica `localStorage.getItem("cookie-consent")`
- Botoes: "Aceitar todos", "Apenas essenciais", link para "/politica-de-cookies"
- Ao aceitar, salva no localStorage e oculta o banner
- Renderizar no `App.tsx` (fora das rotas, sempre visivel)
- Responsivo: stack vertical no mobile, horizontal no desktop

## 2. Pagina de Politica de Cookies

Criar `src/pages/CookiePolicy.tsx`:
- Layout com Header + Footer (mesmo padrao de TermsOfUse/PrivacyPolicy)
- Conteudo: tipos de cookies (essenciais, desempenho, funcionais, marketing), tabela com nome/finalidade/duracao
- Cookies utilizados: Firebase Analytics, Google Analytics, session auth
- Opcao de gerenciar preferencias (botoes aceitar/rejeitar por categoria)
- Base legal LGPD para uso de cookies
- Adicionar rota `/politica-de-cookies` no `App.tsx`

## 3. Selos e icones de confianca no Footer

Editar `src/components/Footer.tsx`:
- Adicionar nova secao "Selos de Confianca" no bottom bar com icones Lucide:
  - `Star` — "Site bem avaliado" (Google)
  - `Shield` — LGPD (ja existe)
  - `Lock` — "Pagamento seguro" (Mercado Pago)
  - `BadgeCheck` — "Profissionais verificados"
  - `ShieldCheck` — "Dados protegidos"
- Link "Cookies" no footer apontar para `/politica-de-cookies`
- Layout responsivo dos selos (grid 2-3 cols mobile, inline desktop)

## 4. Responsividade — auditoria e fixes

Telas a revisar e corrigir:
- `NotFound.tsx` — sem container responsivo, texto em ingles (traduzir para PT-BR)
- `Contact.tsx` — ok, ja responsivo
- `Login.tsx` — ok
- `Dashboard.tsx` — ok com sm: breakpoints
- `PaymentSuccess.tsx` / `PaymentError.tsx` — ok com px-4
- `ComingSoon.tsx` — ok
- `TermsOfUse.tsx` / `PrivacyPolicy.tsx` — ok
- `AdminLayout.tsx` — sidebar colapsavel, ok
- Garantir que a nova CookiePolicy e CookieConsent sejam responsivos

Fixes necessarios:
- `NotFound.tsx`: traduzir textos, adicionar padding responsivo, botao de voltar

## 5. Auth guard em telas protegidas

Telas que precisam de login:
- `/dashboard` — ja usa `<ProtectedRoute>` (ok)
- `/admin/*` — ja usa `<AdminProtectedRoute>` (ok)
- Nenhuma outra tela precisa de auth (Contact, ComingSoon, PaymentSuccess/Error, legal pages sao publicas)

Tudo ja esta correto. Nenhuma alteracao necessaria aqui.

## Resumo de arquivos

| Acao | Arquivo |
|------|---------|
| Criar | `src/components/CookieConsent.tsx` |
| Criar | `src/pages/CookiePolicy.tsx` |
| Editar | `src/App.tsx` (rota /politica-de-cookies + CookieConsent) |
| Editar | `src/components/Footer.tsx` (selos de confianca + link cookies) |
| Editar | `src/pages/NotFound.tsx` (traduzir + responsivo) |


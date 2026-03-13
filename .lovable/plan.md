

# Plano: Cookies, Navegação, Analytics e Footer

## Problemas identificados

1. **Cookie consent** — o componente existe e está renderizado no App.tsx. Provavelmente o `localStorage` já tem o valor salvo de testes anteriores, por isso não aparece. O componente em si funciona.
2. **Links âncora fora da home** — Header e Footer usam `scrollToSection` / `href="#sobre"` que só funcionam na página inicial. Precisam navegar para `/#sobre`.
3. **Scroll ao topo ao mudar de rota** — não existe um componente `ScrollToTop`. Ao clicar num link do footer, a página abre no meio.
4. **Firebase Analytics** — `getAnalytics` é chamado em `firebase.ts` mas o módulo nunca é importado no entry point, então o analytics pode não inicializar.
5. **Footer redes sociais** — tem 4 ícones genéricos. Deve ter apenas Instagram com link real.
6. **Página de Cookies** — já existe (`CookiePolicy.tsx`) e está completa.

## Alterações

### 1. `src/components/ScrollToTop.tsx` (criar)
Componente que escuta mudanças de rota via `useLocation` e faz `window.scrollTo(0, 0)`. Renderizar no App.tsx dentro do BrowserRouter.

### 2. `src/components/Header.tsx` (editar)
- `scrollToSection`: se não estiver na rota `/`, usar `navigate("/#" + sectionId)`. Se estiver, scroll direto.
- Usar `useLocation` para detectar rota atual.

### 3. `src/components/Footer.tsx` (editar)
- Links rápidos (#sobre, #como-funciona): usar `<Link to="/#sobre">` em vez de `<a href="#sobre">`.
- Redes sociais: remover Facebook, LinkedIn, WhatsApp. Manter apenas Instagram com link `https://www.instagram.com/click_servicos_app`.

### 4. `src/main.tsx` (editar)
- Importar `import "@/lib/firebase"` para garantir que o Firebase Analytics inicializa no boot da aplicação.

### 5. `src/App.tsx` (sem mudança funcional)
- Apenas adicionar o componente `<ScrollToTop />` dentro do BrowserRouter.

## Resumo

| Ação | Arquivo |
|------|---------|
| Criar | `src/components/ScrollToTop.tsx` |
| Editar | `src/components/Header.tsx` (navegação cross-page) |
| Editar | `src/components/Footer.tsx` (links + apenas Instagram) |
| Editar | `src/main.tsx` (importar firebase para analytics) |
| Editar | `src/App.tsx` (adicionar ScrollToTop) |


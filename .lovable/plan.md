

# Plano: Integrar Firebase + Página inicial com logos de patrocinadores

## O que será feito

### 1. Instalar e configurar Firebase
- Instalar o pacote `firebase`
- Criar `src/lib/firebase.ts` com a configuração fornecida (inicialização do app, exports de `analytics`, `database`, etc.)
- A apiKey do Firebase é uma chave **pública** (identifica o projeto no client-side), então pode ficar no código sem problemas

### 2. Reformular a página inicial
- Substituir o editor contentEditable atual por uma página limpa com uma **seção de logos de patrocinadores**
- Layout: grid responsivo de logos com espaçamento adequado, centralizado na tela
- Os logos serão imagens placeholder por enquanto — o usuário enviará as imagens reais em seguida
- Estilo minimalista, fundo claro, logos em escala de cinza com hover colorido (opcional)

### 3. Estrutura de arquivos

```
src/lib/firebase.ts          — config e inicialização do Firebase
src/pages/Index.tsx           — página inicial com seção de patrocinadores
src/components/SponsorsSection.tsx — componente da seção de logos
```

### Detalhes técnicos
- Firebase SDK será inicializado com `initializeApp()` e exportará instâncias de `getAnalytics()` e `getDatabase()` (já que o projeto usa Realtime Database)
- A seção de patrocinadores usará um array de logos (por enquanto com placeholders) renderizados em um grid responsivo
- Limpeza do código legado do editor (contentEditable, blink animation)


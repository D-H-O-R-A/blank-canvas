

# Plano: Termos de Uso, Politica de Privacidade, LGPD e Footer atualizado

## Arquivos a criar

### `src/pages/TermsOfUse.tsx`
Pagina completa de Termos de Uso baseada na legislacao brasileira (Codigo de Defesa do Consumidor, Marco Civil da Internet, LGPD). Conteudo adaptado ao modelo Click Servicos:
- Objeto da plataforma (intermediacao de servicos)
- Cadastro e obrigacoes do usuario/profissional
- Pagamentos e planos (assinatura profissional)
- Responsabilidades e limitacoes (intermediadora, nao prestadora)
- Propriedade intelectual
- Cancelamento e reembolso
- Foro competente (legislacao brasileira)
- Layout limpo com Header e Footer reutilizados

### `src/pages/PrivacyPolicy.tsx`
Pagina de Politica de Privacidade com foco na LGPD (Lei 13.709/2018):
- Logo/selo LGPD no topo
- Dados coletados (nome, email, telefone, localizacao, dados de pagamento)
- Base legal para tratamento (consentimento, execucao de contrato, interesse legitimo)
- Compartilhamento com terceiros (Mercado Pago, Firebase)
- Direitos do titular (acesso, correcao, exclusao, portabilidade, revogacao)
- Cookies e tecnologias de rastreamento
- Retencao e eliminacao de dados
- Contato do encarregado (DPO)
- Layout com Header e Footer, selo LGPD com imagem

## Arquivos a editar

### `src/App.tsx`
- Adicionar rotas `/termos-de-uso` e `/politica-de-privacidade`

### `src/components/Footer.tsx`
- Seção Legal: remover "Sitemap", adicionar links reais para `/termos-de-uso` e `/politica-de-privacidade`
- Manter "Cookies" como item
- Adicionar selo LGPD pequeno no bottom bar (imagem ou badge com texto "Em conformidade com a LGPD")

## Resumo

| Acao | Arquivo |
|------|---------|
| Criar | `src/pages/TermsOfUse.tsx` |
| Criar | `src/pages/PrivacyPolicy.tsx` |
| Editar | `src/App.tsx` (2 rotas novas) |
| Editar | `src/components/Footer.tsx` (links legais + selo LGPD + remover Sitemap) |


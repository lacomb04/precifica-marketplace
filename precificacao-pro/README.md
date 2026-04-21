# Precificação PRO

Estrutura reescrita com pastas claras, CSS separado por responsabilidade e JavaScript em módulos (ESM) com nomes descritivos para facilitar manutenção e evolução.

## Estrutura

```
precificacao-pro/
├─ index.html
├─ assets/
│  ├─ icons/
│  ├─ logos/
│  └─ images/
├─ styles/
│  ├─ base.css
│  ├─ layout.css
│  ├─ components.css
│  ├─ themes.css
│  └─ pages/
│     ├─ home.css
│     └─ calculator.css
├─ scripts/
│  ├─ app.js
│  ├─ config/
│  │  ├─ marketplaces.js
│  │  └─ modal-data.js
│  ├─ core/
│  │  ├─ dom.js
│  │  ├─ formatters.js
│  │  └─ validators.js
│  ├─ ui/
│  │  ├─ navigation.js
│  │  ├─ modal.js
│  │  ├─ renderer.js
│  │  └─ theme.js (reservado)
│  ├─ domain/
│  │  ├─ calculators/
│  │  │  ├─ shopee-calculator.js
│  │  │  ├─ mercado-livre-calculator.js
│  │  │  ├─ tiktok-calculator.js
│  │  │  └─ amazon-calculator.js
│  │  ├─ fees/
│  │  │  ├─ shopee-fees.js
│  │  │  ├─ mercado-livre-fees.js
│  │  │  ├─ tiktok-fees.js
│  │  │  └─ amazon-fees.js
│  │  └─ shared/
│  │     ├─ pricing-engine.js
│  │     └─ breakdown.js
│  └─ controllers/
│     ├─ shopee-controller.js
│     ├─ mercado-livre-controller.js
│     ├─ tiktok-controller.js
│     └─ amazon-controller.js
└─ README.md
```

## Como executar

Abra `index.html` em qualquer servidor estático (ou direto no navegador). O código usa módulos ES6 (`type="module"`), então prefira servir via `npx http-server .` ou similar para evitar restrições de CORS em arquivos locais.

## Convenções de código

- Nomes descritivos para funções e variáveis seguindo princípios de Clean Code.
- Cada marketplace tem um controlador dedicado e um módulo de cálculo no domínio.
- Utilitários comuns (DOM e formatadores) ficam em `scripts/core/`.
- Dados de apoio e textos dos modais estão em `scripts/config/`.
- Quebra de CSS por camada: base, layout, componentes, temas e páginas.

## Fluxo de teste gratis (30 minutos)

Foi adicionado um fluxo de teste temporario com token unico e painel admin isolado.

- Painel admin isolado: `painel-admin-trial.html`
- Script do painel: `scripts/admin-trial.js`
- Controle do token no cliente: `scripts/auth/trial-access.js`
- Gate de acesso no app: `scripts/auth/auth.js` e `scripts/app.js`

### Edge Functions esperadas (Supabase)

Para o fluxo funcionar com seguranca real, implemente no backend as funcoes abaixo:

1. `trial-gerar-link`
- Entrada: `email`, `durationMinutes`, `adminKey`
- Regra: validar admin (chave + allowlist/IP)
- Saida: `trialLink` com `trial_token` unico e uso unico

2. `trial-consumir-token`
- Entrada: `token`
- Regra: token deve ser valido, nao usado, nao expirado
- Acao: marcar token como consumido e iniciar janela de 30 min
- Saida: `ok`, `expiresAt`, `accessToken`, `customerEmail`

3. `trial-validar-token`
- Entrada: `token`
- Regra: token ativo e dentro da expiracao
- Saida: `valido`, `expiresAt`

4. `trial-dashboard`
- Entrada: autenticacao admin
- Saida: `createdToday`, `activeTrials`, `onlineUsers`, `sessions[]`

### Recomendacoes de seguranca

- Hospedar `painel-admin-trial.html` em dominio separado do sistema principal.
- Proteger o painel com autenticacao forte e, idealmente, restricao por IP/VPN.
- Nunca confiar somente em validacao no front-end para tempo de acesso.
- Bloquear o acesso no backend ao expirar e redirecionar para pagina de vendas.

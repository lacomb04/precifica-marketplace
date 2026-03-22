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

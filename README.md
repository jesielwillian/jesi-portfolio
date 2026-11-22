# Jesi — Portfólio Front-end

Portfólio profissional em página única, desenvolvido com HTML5, CSS3 e JavaScript puro. Não utiliza framework nem etapa de build.

## Como executar

Abra `index.html` no navegador ou execute a pasta com a extensão Live Server do Visual Studio Code.

## Estrutura

```text
jesi-portfolio/
├── css/
│   ├── command.css
│   └── style.css
├── imagens/
│   ├── favicon.png
│   ├── logo.png
│   ├── nexus.webp
│   ├── passo.webp
│   ├── petlove.png
│   ├── profile.webp
│   └── supercar.webp
├── js/
│   ├── command.js
│   ├── counter.js
│   ├── modal.js
│   ├── script.js
│   └── stars.js
├── .gitignore
├── index.html
└── README.md
```

## Correções desta versão

- Conteúdo visível por padrão: animações de entrada não deixam a página em branco se o JavaScript ou `IntersectionObserver` não estiver disponível.
- Preferência de tema protegida contra bloqueios de `localStorage`.
- Contadores têm alternativa para navegadores sem `IntersectionObserver`.
- Botão de currículo baixa automaticamente o arquivo `jesi-curriculo.pdf` com o nome `Curriculo.pdf`.
- Removidos `cursor.js` e `scrollbar.js`, que não eram carregados pelo HTML; o segundo também não continha implementação.
- Removidos metadados locais do Git do pacote de entrega.

## Tecnologias

- HTML5 semântico
- CSS3 e layout responsivo
- JavaScript nativo (Vanilla JS)
- Font Awesome 6.5.2 via CDN
- Google Fonts: DM Sans e Space Grotesk

## Observação

Fontes e ícones são carregados por CDN; portanto, precisam de conexão com a internet. O formulário de contato envia mensagens diretamente para `public.portfolio_messages` no Supabase. Ele reutiliza a configuração pública em `admin/config.js`; a política RLS da tabela deve permitir INSERT para `anon` e `authenticated`.

# Painel administrativo Jesi

Painel em HTML/CSS/JavaScript puro, com identidade visual baseada no portfólio (dark UI, gradientes violeta/ciano, DM Sans e Space Grotesk). Inclui login Supabase Auth, dashboard, CRUD de projetos e leitura/exclusão de mensagens.

## Configuração necessária

1. No Supabase, abra **SQL Editor** e execute `supabase/admin-schema.sql`.
2. Em **Authentication → Users**, crie seu usuário administrador (e-mail e senha).
3. Copie a Project URL e a chave **anon/public** em `admin/config.js`.
4. Publique a pasta `admin` junto ao restante do site. Acesse `/admin/`.

Nunca coloque `service_role` no front-end. A policy de administrador deste pacote considera qualquer usuário autenticado como admin; crie somente contas confiáveis no projeto ou restrinja as policies a um papel/allowlist antes de habilitar cadastro público.

## Importante sobre a integração do portfólio

O painel salva projetos na tabela `portfolio_projects`. O site público atual ainda renderiza os cards diretamente no HTML. Para que novos projetos cadastrados apareçam automaticamente na página pública, é necessário adaptar a seção de projetos do `index.html` para consultar a tabela (somente registros `published`). Isso deve ser feito em uma etapa separada para preservar os cards e o modal atuais.

O formulário de contato atual não grava mensagens no Supabase. A tabela `portfolio_messages` e o painel estão preparados, mas a integração do formulário precisa ser conectada antes de mensagens aparecerem aqui.

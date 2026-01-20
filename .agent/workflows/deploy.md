---
description: Como fazer o deploy da aplicação no Vercel
---

Para colocar o **Firezone Tracker** online via Vercel, siga estes passos:

### 1. Criar um Repositório no GitHub
Se você ainda não tem, crie um novo repositório no GitHub e suba o código:
1. `git init` (na pasta raiz `firezone-tracker-online`)
2. `git add .`
3. `git commit -m "Nova versão Next.js"`
4. `git remote add origin https://github.com/SEU_USUARIO/firezone-tracker-online.git`
5. `git push -u origin main`

### 2. Importar no Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **"Add New"** > **"Project"**.
3. Conecte sua conta do GitHub e importe o repositório `firezone-tracker-online`.

### 3. Configurações Importantes (CRÍTICO)
Durante a importação, você deve configurar dois pontos fundamentais:

-   **Root Directory**: No campo "Root Directory", clique em **Edit** e selecione a pasta `web`. Isso é essencial porque o Next.js está dentro dessa pasta.
-   **Environment Variables**: Abra a seção "Environment Variables" e adicione as chaves que estão no seu arquivo `.env.local`:
    -   `NEXT_PUBLIC_SUPABASE_URL`: `https://hzazuprdotttsbeklvah.supabase.co`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_vo7_cG2rZh_lWOC7KNYacA_TSMQ5RyF`

### 4. Deploy
1. Clique em **"Deploy"**.
2. O Vercel vai instalar as dependências, rodar o build e fornecer uma URL (ex: `firezone-tracker.vercel.app`).

### 5. Configurar o Supabase (Opcional mas recomendado)
Se você ver erros de "CORS" ou acesso negado:
1. Vá no painel do [Supabase](https://supabase.com).
2. Vá em **Settings** > **API**.
3. Em **Allow list**, adicione a URL que o Vercel te deu para permitir que o navegador acesse o banco de dados.

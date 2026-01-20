# 🔥 Firezone Tracker Online

Firezone Tracker Online é uma aplicação web moderna projetada para facilitar a gestão de comandas e pedidos em tempo real. Originalmente construída em HTML/JS puro, a aplicação foi migrada para **Next.js 16** com **Supabase** para oferecer uma experiência "app-like", segura e escalável.

## 🚀 Tecnologias

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Backend/Banco de Dados**: [Supabase](https://supabase.com/) (Real-time subscriptions)
- **Estilização**: CSS Modules & Styled JSX
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Ícones**: [Lucide React](https://lucide.dev/)

## 🛠️ Funcionalidades

- **Lobby Dinâmico**: Criação e seleção de salas em tempo real.
- **Minha Comanda**: Adição de itens com ajuste de quantidade, edição e reordenação (drag & drop visual).
- **Ranking da Mesa**: Visualização consolidada de todos os usuários da sala, ordenados por valor total.
- **Painel Admin**:
  - Excluir salas completas.
  - Editar preços e quantidades de qualquer usuário no Ranking.
  - Excluir usuários específicos da sala.
- **Design High-Fidelity**: Interface minimalista otimizada para dispositivos móveis.

---

## 💻 Instalação (Ambiente Dev)

Siga os passos abaixo para rodar o projeto localmente:

### 1. Requisitos
- Node.js (v18 ou superior)
- NPM ou Yarn

### 2. Clonar o Repositório
```bash
git clone <url-do-seu-repositorio>
cd firezone-tracker-online
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as seguintes chaves:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
ADMIN_PASSWORD=sua_senha_mestra_admin
```

### 5. Rodar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

---

## 🌐 Implantação (Ambiente Produção - Vercel)

A aplicação está configurada para ser hospedada no **Vercel**:

1. Faça o push do código para o seu repositório GitHub.
2. Conecte o repositório no dashboard do [Vercel](https://vercel.com).
3. Nas **Environment Variables** do Vercel, adicione as mesmas chaves do seu `.env.local`.
   - *Nota: Não use o prefixo `NEXT_PUBLIC_` para a `ADMIN_PASSWORD` para garantir que ela permaneça segura no servidor.*
4. O Vercel detectará automaticamente as configurações do `vercel.json` e realizará o build.

---

## 🗄️ Estratégia de Banco de Dados (Supabase)

O Banco de Dados deve conter as seguintes tabelas:

1. **rooms**: `id` (uuid), `name` (text), `created_at` (timestamptz).
2. **comandas**: `id` (bigint), `room_id` (uuid - FK), `user_id` (text), `user_name` (text), `nome` (text), `preco` (float8), `qtd` (int4), `created_at` (timestamptz).

*Certifique-se de configurar as policies de RLS (Row Level Security) no Supabase se desejar produção estritamente segura.*

---
Desenvolvido com ❤️ para a torcida do Botafogo.

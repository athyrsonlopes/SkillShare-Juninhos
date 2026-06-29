<h1 align="center">DUO</h1>
<p align="center"><i>Desenvolvimento, União e Orientação</i></p>

<p align="center">
  <img src="https://img.shields.io/badge/Comunidade-Juninhos-7B2CBF?style=for-the-badge&logo=discord&logoColor=white" alt="Juninhos Community" />
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/Banco-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

---

## 📝 Sobre o Projeto

Sistema de agendamento de mentorias e estudos em dupla para facilitar o aprendizado colaborativo em qualquer área de conhecimento.

O nome **DUO** carrega dois significados: a dupla de pessoas que se conecta para aprender e ensinar, e a sigla de **D**esenvolvimento, **U**nião e **O**rientação que são os três pilares do projeto.

Este projeto nasceu dentro do ecossistema da **Comunidade Juninhos**, no Squad 12, mas é um produto independente: não possui vínculo institucional com a comunidade, que atuou aqui apenas como ambiente de formação e colaboração entre os membros do squad.

> 💡 **Nota do Squad:** Este README serve como um documento vivo. Ele será atualizado continuamente conforme novas funcionalidades forem integradas nas sprints de 30 dias.

---

## 🛠️ Stack Tecnológica

O projeto é um **monorepo** dividido em duas pastas independentes (`backend/` e `frontend2/`), cada uma com seu próprio deploy na Vercel:

* **Frontend:** HTML, CSS e JavaScript puro (sem framework/bundler)
* **Backend:** Node.js + Express + TypeScript
* **Banco de Dados:** PostgreSQL, hospedado no Supabase
* **ORM:** Prisma
* **Autenticação:** JWT
* **Tempo real:** Socket.io (chat)
* **Notificações:** Nodemailer (e-mail) + node-cron (lembretes agendados)
* **Infraestrutura:** Vercel (frontend e backend, deploys separados)

---

## 📌 Funcionalidades Principais

Mapeamento de recursos modelados no banco de dados e em desenvolvimento:

- [x] 🔐 **Autenticação:** cadastro, login e perfis de User / Professor / Admin
- [x] 👤 **Perfil do Usuário:** conteúdo a estudar/ensinar, skills com nível de domínio, progresso e contagem de matches
- [ ] 🤝 **Match:** disponibilidade por horário (slots) e solicitações abertas (open requests) por skill e nível
- [ ] 📅 **Agendamento:** criação, confirmação, conclusão e cancelamento de sessões (bookings)
- [ ] ⭐ **Reviews:** avaliação pós-sessão com nota e comentário
- [ ] 🧑‍🤝‍🧑 **Amizades:** conexões entre usuários que já tiveram sessões juntos
- [ ] 💬 **Chat:** canais de conversa vinculados a agendamentos, solicitações abertas ou amizades, com mensagens em tempo real (Socket.io)
- [ ] ⏰ **Lembretes automáticos:** notificação por e-mail antes das sessões agendadas

> Legenda: ✅ modelado no banco e testado via API · ⬜ modelado no banco, integração com o frontend pendente

---

## 📂 Estrutura do Repositório

```
SkillShare-Juninhos/
├── backend/              # API REST (Node.js + Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma # Modelo de dados completo
│   │   ├── migrations/
│   │   └── seed.ts       # Popula o banco com dados de teste
│   ├── src/
│   │   ├── routes/       # Rotas da API (auth, profile, booking, chat...)
│   │   └── lib/          # Configurações (env, prisma client)
│   └── .env.example
├── frontend2/            # Interface (HTML/CSS/JS estático)
│   ├── *.html            # Uma página por tela (login, dashboard, perfil...)
│   ├── css/
│   └── js/               # Um arquivo JS por tela
└── README.md
```

---

## ⚙️ Como Executar o Projeto Localmente

### 📋 Pré-requisitos

* **Ambiente de Execução:** Node.js (versão LTS recomendada)
* **Controle de Versão:** Git
* **Gerenciador de Pacotes:** npm
* **Banco de Dados:** uma instância no [Supabase](https://supabase.com) (gratuita) — não é necessário instalar PostgreSQL localmente

### 🚀 Backend

1. Clone o repositório oficial dentro da organização Juninhos:
   ```bash
   git clone [URL-DO-REPOSITORIO-AQUI]
   cd SkillShare-Juninhos/backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   * Copie o `.env.example` para `.env`: `cp .env.example .env`
   * Preencha `DATABASE_URL` e `DIRECT_URL` com a connection string do seu projeto no Supabase (Project Settings → Database → Connect → ORMs → Prisma)
   * Gere um `JWT_SECRET` forte: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

4. Rode a migration e popule o banco com dados de teste:
   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

5. Inicie o servidor:
   ```bash
   npm run dev
   ```

### 🚀 Frontend

O frontend é estático — não precisa de build nem instalação de dependências.

1. Acesse a pasta:
   ```bash
   cd SkillShare-Juninhos/frontend2
   ```
2. Abra qualquer arquivo `.html` direto no navegador, ou sirva a pasta com uma extensão como **Live Server** (VS Code).

> ⚠️ Como o frontend ainda não faz chamadas reais à API, a URL do backend precisará ser configurada manualmente nos arquivos `js/*.js` quando essa integração for implementada.

---

## 🌿 Diretrizes do Git Flow (Guia de Sobrevivência)

Para manter o código limpo e organizado para todo o time, seguimos rigorosamente estas regras de contribuição:

### 1. Nomenclatura de Branches
Sempre crie uma ramificação específica para a sua tarefa a partir da branch principal:
* `feature/nome-da-funcionalidade`
* `fix/correcao-de-bug`
* `docs/atualizacao-readme`

```bash
git checkout -b feature/minha-tarefa
```

### 2. Padrão de Commits
Os commits devem ser claros, em português e indicar a intenção da alteração:
* `feat: [breve descrição do novo recurso adicionado]`
* `fix: [breve descrição do bug corrigido]`
* `style: [breve descrição da alteração estética ou de formatação]`

### 3. Revisão de Código (Pull Requests)
* Nunca faça o merge direto na branch principal.
* Abra um **Pull Request (PR)** e solicite a revisão de pelo menos um outro membro do squad antes de aplicar as alterações.

---

## 👥 Nosso Squad

Um projeto completo só ganha vida com uma equipe sintonizada. Conheça as mentes por trás do desenvolvimento:

| Avatar | Membro | Função / Especialidade | GitHub |
| :---: | :--- | :--- | :--- |
| <img src="https://github.com/github.png" width="40" style="border-radius:50%"/> | Athyrson Lopes | Banco de Dados | ... |
| <img src="https://github.com/github.png" width="40" style="border-radius:50%"/> | Maria Heloisa | Frontend | ... |
| <img src="https://github.com/github.png" width="40" style="border-radius:50%"/> | Arthur Alcantara | Backend | ... |
| <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROH980V1FsBAQZ0O_N7ykrGL9UcJ7hnm7RqA&s" width="40" style="border-radius:50%"/> | Nilton Carlos | DEV Backend / Fullstack | NiltonCarlosdawg |

---

## ⚖️ Licença

Este projeto é de uso exclusivo e educacional dos membros vinculados à **Juninhos Community**, sem vínculo institucional com a comunidade.

---

## 🤝 Apoio e Organização

Este projeto é desenvolvido e mantido de forma independente pelos membros do squad, dentro do ecossistema da **Juninhos Community**.
Se precisar de suporte técnico, mentoria de deploy ou dúvidas sobre infraestrutura, use os canais oficiais no Discord:
* 💬 `#suporte`
* 💬 `#geral`

**Bora transformar ideias em código! [++]**

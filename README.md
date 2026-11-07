# HospedAqui — Guia de Configuração

Plataforma de reservas de hospedagem em português brasileiro.
**React + TypeScript + Tailwind CSS + Supabase (opcional).**

---

## Modo Demonstração (padrão — sem configuração)

Sem nenhuma configuração, o app funciona **100% com dados mock locais**:

| Funcionalidade          | Status em demo |
|-------------------------|---------------|
| Busca de hospedagens    | ✅ Mock (6 propriedades) |
| Login / Cadastro        | ✅ Aceita qualquer e-mail/senha |
| Reservas                | ✅ Simuladas, salvas em memória |
| Favoritos               | ✅ Simulados (p1, p3 por padrão) |
| Avaliações              | ✅ Locais (não persistem) |
| Painel Admin            | ✅ Salvo no localStorage |
| Modo escuro             | ✅ Salvo no localStorage |
| Acessibilidade          | ✅ Funciona offline |

> Nenhum dado persiste entre sessões em modo demo.

---

## Configurar Backend Real (Supabase)

### Passo 1 — Criar projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New Project**
3. Escolha a região **South America (São Paulo)** para menor latência
4. Guarde a senha do banco de dados em local seguro

### Passo 2 — Obter as credenciais

1. No painel do projeto, vá em **Settings → API**
2. Copie os dois valores:
   - **Project URL** → ex: `https://abcdefgh.supabase.co`
   - **anon / public key** → chave longa começando com `eyJ...`

### Passo 3 — Inserir as credenciais no código

Abra o arquivo `/components/services/client.ts` e substitua:

```ts
export const SUPABASE_URL     = 'YOUR_SUPABASE_URL'
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'
```

pelos valores do Passo 2:

```ts
export const SUPABASE_URL     = 'https://abcdefgh.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

Após salvar, `IS_CONFIGURED` passa a ser `true` e o app usa o banco real automaticamente.

### Passo 4 — Criar as tabelas (SQL Schema)

1. No painel do Supabase, vá em **SQL Editor → New query**
2. Abra o arquivo `/components/services/client.ts`
3. Copie **todo o conteúdo** da constante `SQL_SCHEMA` (o texto entre os backticks após `export const SQL_SCHEMA = \``)
4. Cole no SQL Editor e clique em **Run**

Isso criará automaticamente:

| Tabela         | Conteúdo                                      |
|----------------|-----------------------------------------------|
| `profiles`     | Perfis de usuário (extende `auth.users`)      |
| `properties`   | Hospedagens                                   |
| `rooms`        | Quartos por hospedagem                        |
| `reservations` | Reservas dos hóspedes                         |
| `favorites`    | Favoritos por usuário                         |
| `reviews`      | Avaliações das hospedagens                    |

E inserirá 6 hospedagens de exemplo (seed data) prontas para uso.

### Passo 5 — Configurar Autenticação

1. No Supabase, vá em **Authentication → Providers**
2. Certifique-se de que **Email** está habilitado (padrão)
3. Em **Authentication → URL Configuration**, defina:
   - **Site URL**: URL onde o app está publicado
   - **Redirect URLs**: mesma URL
4. Em **Authentication → Settings**, você pode desativar "Confirm email" para testes rápidos

> Com Supabase configurado, o login com qualquer e-mail será real (verificação de conta, tokens de sessão, etc.).

### Passo 6 — Verificar funcionamento

Após configurar, o app passa a usar o banco em **todas** as operações:

| Operação                  | Chamada ao Supabase                        |
|---------------------------|--------------------------------------------|
| Login                     | `auth.signInWithPassword()`               |
| Cadastro                  | `auth.signUp()`                           |
| Logout                    | `auth.signOut()`                          |
| Buscar hospedagens        | `SELECT * FROM properties WHERE active`   |
| Ver detalhes da hospedagem| `SELECT * FROM properties WHERE id = ?`   |
| Criar reserva             | `INSERT INTO reservations`                |
| Ver reservas              | `SELECT * FROM reservations WHERE user_id`|
| Cancelar reserva          | `UPDATE reservations SET status`          |
| Favoritar                 | `INSERT / DELETE FROM favorites`          |
| Enviar avaliação          | `INSERT INTO reviews`                     |
| Atualizar perfil          | `UPDATE profiles`                         |
| Alterar senha             | `auth.updateUser({ password })`           |

---

## Estrutura de Arquivos

```
/
├── main.tsx                     # Roteamento e estado global
├── Hospeda.png                  # Logo
├── ìconeA.png                   # Ícone do widget de acessibilidade
├── README.md                    # Este arquivo
└── components/
    ├── ds.tsx                   # Design System (tokens, tema claro/escuro, componentes base)
    ├── layout.tsx               # Header + Footer
    ├── data.tsx                 # Dados mock + helpers managedToProperty / managedToRoom
    ├── home.tsx                 # Página inicial + PropertyCard
    ├── search.tsx               # Busca com filtros e ordenação
    ├── property.tsx             # Detalhe da hospedagem + avaliações + reserva rápida
    ├── auth.tsx                 # Login, Cadastro (4 etapas), Recuperação de senha
    ├── booking.tsx              # Fluxo completo de reserva (7 etapas)
    ├── reservations.tsx         # Minhas Reservas + cancelamento + avaliação
    ├── profile.tsx              # Perfil, segurança, preferências, favoritos, LGPD
    ├── packages.tsx             # Pacotes Voo + Hotel
    ├── admin.tsx                # Painel do Anfitrião (criação/edição de hospedagens)
    ├── accessibility.tsx        # Widget de acessibilidade (Libras, TTS, fonte, contraste)
    └── services/
        ├── client.ts            # ← EDITE AQUI as credenciais do Supabase + SQL Schema
        └── api.ts               # Camada de dados: Supabase com fallback automático para mock
```

---

## Funcionalidades do Painel Admin

O painel de anfitrião é acessível a qualquer usuário logado, via o banner na Home:

1. Clique em **"Quero ser Anfitrião →"** na Home
2. Preencha o cadastro de empresa (CNPJ, endereço, formas de recebimento)
3. O ícone **Admin** aparece no header
4. Crie hospedagens com fotos (upload local via FileReader ou URL), serviços, preço e pacote Voo+Hotel
5. As hospedagens criadas aparecem automaticamente na busca e no fluxo de reserva

> Hospedagens do painel admin são salvas no `localStorage` do navegador (não no Supabase).
> Para persistência real, uma futura integração com a tabela `properties` via `service_role` key seria necessária.

---

## Modo Claro / Escuro

- Botão **☀️ / 🌙** no canto superior direito do header
- Preferência salva automaticamente no `localStorage`
- Sem flash na inicialização (tema aplicado antes da renderização)

---

## Paleta de Cores

| Token       | Hex (claro) | Hex (escuro) | Uso                        |
|-------------|-------------|--------------|----------------------------|
| `primary`   | `#C41230`   | `#F03050`    | Vermelho — cor principal   |
| `coral`     | `#F5C518`   | `#F5C518`    | Amarelo — destaques        |
| `bg`        | `#F2EAD8`   | `#0D1117`    | Fundo da página            |
| `card`      | `#FFFFFF`   | `#161B22`    | Fundo dos cards            |
| `teal`      | `#7A5C3A`   | `#C89155`    | Marrom — cor secundária    |
| `textDark`  | `#1A0E05`   | `#E6EDF3`    | Texto principal            |

---

## Acessibilidade

O widget verde no canto inferior direito oferece:

- **Libras** — Link para VLibras (gov.br)
- **Leitura em voz** — Web Speech API (lê o conteúdo da página em pt-BR)
- **Tamanho do texto** — 80% a 150%
- **Alto contraste** — `data-contrast="high"` no `<html>` (personalizável via CSS)

---

## Tecnologias utilizadas

- **React 18** + **TypeScript**
- **Tailwind CSS** (classes utilitárias)
- **Lucide React** (ícones)
- **Supabase** (auth + banco PostgreSQL com RLS)
- **Web Speech API** (acessibilidade TTS)
- **FileReader API** (upload de fotos no painel admin)

# Manual do Bot - Sistema de Tempo em Call e Tickets

Bem-vindo ao manual completo do **BizzarreBot**! Este documento foi criado para registrar as últimas atualizações de código e servir como guia definitivo sobre todos os comandos disponíveis no sistema.

---

## 🤖 Guia Completo de Comandos

O bot suporta tanto **Slash Commands** (`/`) nativos do Discord quanto **Comandos de Prefixo** (utilizando `biz!`). Abaixo está a lista com todos os comandos disponíveis e o que cada um faz:

### 🎙️ Comandos de Call e Rastreio de Voz
- **/tempo** (`biz!tempo @usuario`)
  Gera uma imagem personalizada (perfil visual) com suas estatísticas de tempo total em chamadas de voz, tempo na semana, e sua posição no placar geral.
- **/top** (`biz!top`)
  Mostra o placar com o Top 10 membros que acumularam mais tempo geral em chamadas de voz.
- **/travar** (`biz!travar`)
  Tranca a sala de voz na qual você está conectado atualmente, impedindo que novos membros (sem permissões especiais) consigam entrar.
- **/destravar** (`biz!destravar`)
  Destranca a sala de voz atual, permitindo novamente a entrada pública de usuários.
- **/call** (`biz!call [limite]`)
  Permite alterar o limite máximo de usuários da sala de voz em que você está conectado.

### 🎫 Comandos de Tickets e Atendimento
- **/painel_suporte** (Apenas Administração)
  Envia a mensagem interativa (painel de botões) no canal atual para que os usuários possam abrir tickets de suporte.
- **/config_ticket** (Apenas Administração)
  Abre um formulário no Discord para editar os textos do painel de tickets (título, descrição, etc.).
- **/ranking** (`biz!ranking`) (Apenas Equipe/Staff)
  Mostra o pódio e o Top 10 de membros da equipe que mais fecharam/atenderam tickets no servidor.

### 🎯 Comandos de Metas Departamentais
- **/config_metas** (Apenas Administração)
  Permite configurar quais cargos serão vinculados às posições de metas (ex: Cargos para quem atinge 15h, 30h, etc).
- **/fechar_metas** (Apenas Administração)
  Verifica de forma forçada e manual o tempo semanal de todo mundo:
  - Dá promoção (UP) para quem alcançou horas o suficiente para um cargo maior.
  - Rebaixa quem não alcançou as horas mínimas necessárias.
  - Zera os inativos (pessoas com 0 horas nos últimos 7 dias).
- **/painel_cargos** (Apenas Staff)
  Envia o painel de gerenciamento de cargos.

### 🛡️ Comandos de Moderação
- **/ban** (`biz!ban @usuario [motivo]`)
  Bane um usuário do servidor e envia uma notificação.
- **/unban** (`biz!unban [id]`)
  Desbane um membro que estava banido usando apenas o ID do usuário.
- **/restringir** (`biz!restringir @usuario [tempo] [motivo]`)
  Aplica um castigo (Timeout) em um membro, impedindo-o de falar ou mandar mensagens pelo período configurado.
- **/desrestringir** (`biz!desrestringir @usuario`)
  Remove o castigo (Timeout) de um membro, restaurando sua permissão para falar e mandar mensagens.
- **/limpar** (`biz!limpar [quantidade]`)
  Apaga mensagens em massa do chat atual para limpar rapidamente a poluição no canal.

---

# Jogo da Memória - Multiplayer

Jogo da memória em tempo real para dois jogadores em computadores diferentes. Feito com React (frontend) e Node.js + WebSocket (backend).

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- npm (vem junto com o Node.js)

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/EduardoLinsJW/ProjectClaudeGame.git
cd ProjectClaudeGame
```

2. Instale as dependências:

```bash
npm install
```

## Como rodar

Inicie o servidor e o cliente simultaneamente:

```bash
npm run dev
```

O terminal vai mostrar:
- Servidor rodando na porta **3001**
- Cliente disponível em **http://localhost:5173**

## Como jogar

1. Abra **http://localhost:5173** no navegador
2. Digite seu nome e clique em **"Criar Sala"**
3. Compartilhe o código de 6 caracteres com o outro jogador
4. O segundo jogador acessa o mesmo endereço, digita o nome, insere o código e clica em **"Entrar"**
5. O jogo inicia automaticamente para ambos

## Jogando em dois computadores diferentes

Ambos precisam estar na mesma rede (Wi-Fi ou LAN).

1. Na máquina que hospeda, descubra seu IP local:

```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I

# Windows
ipconfig
```

2. Inicie o jogo normalmente com `npm run dev`

3. No outro computador, acesse pelo navegador:

```
http://<IP-DO-HOST>:5173
```

Exemplo: `http://192.168.1.100:5173`

## Regras do jogo

- O tabuleiro tem 16 cartas (8 pares de emojis)
- Jogadores alternam turnos clicando em duas cartas por vez
- Se formar um par, o jogador marca ponto e joga novamente
- Se errar, a vez passa para o oponente
- Vence quem encontrar mais pares

## Estrutura do projeto

```
ProjectClaudeGame/
├── server/          # Backend (Express + WebSocket)
├── client/          # Frontend (React + Vite)
├── shared/          # Constantes compartilhadas
└── package.json     # Monorepo com workspaces
```

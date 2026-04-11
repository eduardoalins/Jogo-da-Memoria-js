# Jogo da Memória

Projeto desenvolvido em **HTML, CSS e JavaScript puro**, com foco em um **jogo da memória para 2 jogadores humanos**, jogado em uma única tela.

## Sobre o jogo

O sistema possui:

- uma **página inicial** para configuração dos nomes dos jogadores;
- uma **página do jogo**, que recebe os nomes por parâmetro;
- **placar dinâmico** com os nomes e pontuação dos jogadores;
- **animação inicial** das cartas entrando na mesa, revelando, virando e sendo misturadas;
- **animação de virar carta** ao clicar;
- destaque visual do **jogador da vez**;
- mudança de cor dos pares encontrados, ficando:
  - **vermelho** para o Jogador 1
  - **azul** para o Jogador 2
- **tabela dinâmica** com histórico das jogadas;
- **lista dinâmica** com os eventos do jogo;
- uso de **classes JavaScript** para representar os elementos lógicos do jogo.

## Estrutura dos arquivos

```bash
projeto-jogo-memoria/
│
├── index.html
├── index.css
├── index.js
│
├── jogo.html
├── jogo.css
├── jogo.js
│
└── README.md
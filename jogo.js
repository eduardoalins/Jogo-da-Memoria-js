class Jogador {
  constructor(nome, cor) {
    this.nome = nome;
    this.cor = cor;
    this.pontos = 0;
  }

  adicionarPonto() {
    this.pontos += 1;
  }
}

class Carta {
  constructor(id, simbolo) {
    this.id = id;
    this.simbolo = simbolo;
    this.virada = false;
    this.encontrada = false;
    this.dono = null;
  }
}

class JogoMemoria {
  constructor(nomeJogador1, nomeJogador2) {
    this.jogadores = [
      new Jogador(nomeJogador1, "red"),
      new Jogador(nomeJogador2, "blue")
    ];

    this.jogadorAtual = 0;
    this.cartas = [];
    this.cartasViradas = [];
    this.travado = true;
    this.totalPares = 8;

    this.boardElement = document.getElementById("board");
    this.turnoTexto = document.getElementById("turno-texto");
    this.nomeJ1 = document.getElementById("nome-j1");
    this.nomeJ2 = document.getElementById("nome-j2");
    this.pontosJ1 = document.getElementById("pontos-j1");
    this.pontosJ2 = document.getElementById("pontos-j2");
    this.scoreJ1 = document.getElementById("score-j1");
    this.scoreJ2 = document.getElementById("score-j2");
    this.movesTableBody = document.querySelector("#moves-table tbody");
    this.eventList = document.getElementById("event-list");
    this.overlay = document.getElementById("overlay");
    this.winnerTitle = document.getElementById("winner-title");
    this.winnerMessage = document.getElementById("winner-message");

    this.simbolosBase = ["🍎", "🚗", "⚽", "🎵", "🐶", "🌙", "⭐", "🍕"];

    this.inicializarInterface();
    this.iniciarNovaPartida();
  }

  inicializarInterface() {
    this.nomeJ1.textContent = this.jogadores[0].nome;
    this.nomeJ2.textContent = this.jogadores[1].nome;
    this.atualizarPlacar();
    this.atualizarTurno();
  }

  iniciarNovaPartida() {
    this.jogadores[0].pontos = 0;
    this.jogadores[1].pontos = 0;
    this.jogadorAtual = 0;
    this.cartasViradas = [];
    this.travado = true;
    this.movesTableBody.innerHTML = "";
    this.eventList.innerHTML = "";
    this.overlay.classList.add("hidden");

    this.criarCartas();
    this.renderizarTabuleiro();
    this.atualizarPlacar();
    this.atualizarTurno();
    this.adicionarEvento("A partida começou.");

    this.animacaoInicial();
  }

  criarCartas() {
    const pares = [...this.simbolosBase, ...this.simbolosBase];
    const embaralhadas = this.embaralhar([...pares]);

    this.cartas = embaralhadas.map((simbolo, indice) => {
      return new Carta(indice, simbolo);
    });
  }

  embaralhar(lista) {
    for (let i = lista.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
  }

  renderizarTabuleiro(animarEntrada = false) {
    this.boardElement.innerHTML = "";

    this.cartas.forEach((carta, indice) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.id = carta.id;

      if (animarEntrada) {
        card.classList.add("entering");
      }

      if (carta.virada || carta.encontrada) {
        card.classList.add("flipped");
      }

      if (carta.encontrada) {
        card.classList.add("locked");
        if (carta.dono === "red") {
          card.classList.add("matched-red");
        } else if (carta.dono === "blue") {
          card.classList.add("matched-blue");
        }
      }

      card.innerHTML = `
        <div class="card-face card-back">?</div>
        <div class="card-face card-front">${carta.simbolo}</div>
      `;

      card.addEventListener("click", () => this.lidarCliqueCarta(carta.id));
      this.boardElement.appendChild(card);

      if (animarEntrada) {
        setTimeout(() => {
          card.classList.add("in-place");
          card.classList.remove("entering");
        }, 90 * indice);
      }
    });
  }

  async animacaoInicial() {
    this.renderizarTabuleiro(true);

    await this.esperar(1400);

    this.cartas.forEach((carta) => {
      carta.virada = true;
    });
    this.atualizarVisualCartas();
    this.adicionarEvento("As cartas foram reveladas.");

    await this.esperar(1800);

    this.cartas.forEach((carta) => {
      carta.virada = false;
    });
    this.atualizarVisualCartas();
    this.adicionarEvento("As cartas foram viradas para baixo.");

    await this.esperar(900);

    this.cartas = this.embaralhar([...this.cartas]);
    this.cartas.forEach((carta, indice) => {
      carta.id = indice;
    });
    this.renderizarTabuleiro(true);
    this.adicionarEvento("As cartas foram misturadas. O jogo começou.");

    await this.esperar(1200);

    this.travado = false;
  }

  async lidarCliqueCarta(idCarta) {
    if (this.travado) {
      return;
    }

    const carta = this.cartas.find((item) => item.id === idCarta);

    if (!carta || carta.virada || carta.encontrada) {
      return;
    }

    carta.virada = true;
    this.cartasViradas.push(carta);
    this.atualizarVisualCartas();

    if (this.cartasViradas.length < 2) {
      return;
    }

    this.travado = true;

    const [carta1, carta2] = this.cartasViradas;
    const jogador = this.jogadores[this.jogadorAtual];

    if (carta1.simbolo === carta2.simbolo) {
      carta1.encontrada = true;
      carta2.encontrada = true;
      carta1.dono = jogador.cor;
      carta2.dono = jogador.cor;

      jogador.adicionarPonto();
      this.atualizarPlacar();
      this.registrarJogada(jogador.nome, `${carta1.simbolo} + ${carta2.simbolo}`, "Acertou");
      this.adicionarEvento(`${jogador.nome} encontrou um par de ${carta1.simbolo}.`);

      this.cartasViradas = [];
      this.atualizarVisualCartas();

      if (this.verificarFimDeJogo()) {
        this.finalizarJogo();
        return;
      }

      this.travado = false;
      return;
    }

    this.registrarJogada(jogador.nome, `${carta1.simbolo} + ${carta2.simbolo}`, "Errou");
    this.adicionarEvento(`${jogador.nome} errou a tentativa.`);

    await this.esperar(1000);

    carta1.virada = false;
    carta2.virada = false;
    this.cartasViradas = [];
    this.trocarJogador();
    this.atualizarVisualCartas();
    this.travado = false;
  }

  atualizarVisualCartas() {
    const elementos = this.boardElement.querySelectorAll(".card");

    elementos.forEach((elemento) => {
      const cartaId = Number(elemento.dataset.id);
      const carta = this.cartas.find((item) => item.id === cartaId);

      elemento.classList.toggle("flipped", carta.virada || carta.encontrada);
      elemento.classList.toggle("locked", carta.encontrada);
      elemento.classList.toggle("matched-red", carta.encontrada && carta.dono === "red");
      elemento.classList.toggle("matched-blue", carta.encontrada && carta.dono === "blue");
    });
  }

  atualizarPlacar() {
    this.pontosJ1.textContent = this.jogadores[0].pontos;
    this.pontosJ2.textContent = this.jogadores[1].pontos;
  }

  atualizarTurno() {
    const jogador = this.jogadores[this.jogadorAtual];
    this.turnoTexto.textContent = `Vez de ${jogador.nome}`;

    this.scoreJ1.classList.toggle("active-player", this.jogadorAtual === 0);
    this.scoreJ2.classList.toggle("active-player", this.jogadorAtual === 1);
  }

  trocarJogador() {
    this.jogadorAtual = this.jogadorAtual === 0 ? 1 : 0;
    this.atualizarTurno();
  }

  registrarJogada(jogador, jogada, resultado) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${jogador}</td>
      <td>${jogada}</td>
      <td>${resultado}</td>
    `;

    this.movesTableBody.prepend(row);

    while (this.movesTableBody.rows.length > 6) {
      this.movesTableBody.deleteRow(this.movesTableBody.rows.length - 1);
    }
  }

  adicionarEvento(texto) {
    const item = document.createElement("li");
    item.textContent = texto;
    this.eventList.prepend(item);

    while (this.eventList.children.length > 8) {
      this.eventList.removeChild(this.eventList.lastElementChild);
    }
  }

  verificarFimDeJogo() {
    const cartasEncontradas = this.cartas.filter((carta) => carta.encontrada).length;
    return cartasEncontradas === this.cartas.length;
  }

  finalizarJogo() {
    const jogador1 = this.jogadores[0];
    const jogador2 = this.jogadores[1];

    let mensagem = "";

    if (jogador1.pontos > jogador2.pontos) {
      this.winnerTitle.textContent = `${jogador1.nome} venceu!`;
      mensagem = `Placar final: ${jogador1.pontos} x ${jogador2.pontos}`;
    } else if (jogador2.pontos > jogador1.pontos) {
      this.winnerTitle.textContent = `${jogador2.nome} venceu!`;
      mensagem = `Placar final: ${jogador2.pontos} x ${jogador1.pontos}`;
    } else {
      this.winnerTitle.textContent = "Empate!";
      mensagem = `Os dois jogadores terminaram com ${jogador1.pontos} pontos.`;
    }

    this.winnerMessage.textContent = mensagem;
    this.overlay.classList.remove("hidden");
    this.adicionarEvento("A partida terminou.");
    this.travado = true;
  }

  esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

function obterNomesDaURL() {
  const params = new URLSearchParams(window.location.search);
  const jogador1 = params.get("jogador1") || "Jogador Vermelho";
  const jogador2 = params.get("jogador2") || "Jogador Azul";
  return { jogador1, jogador2 };
}

const { jogador1, jogador2 } = obterNomesDaURL();
const jogo = new JogoMemoria(jogador1, jogador2);

document.getElementById("restart-button").addEventListener("click", () => {
  jogo.iniciarNovaPartida();
});

document.getElementById("play-again-button").addEventListener("click", () => {
  jogo.iniciarNovaPartida();
});
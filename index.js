const form = document.getElementById("start-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const jogador1 = document.getElementById("jogador1").value.trim() || "Jogador Vermelho";
  const jogador2 = document.getElementById("jogador2").value.trim() || "Jogador Azul";

  const params = new URLSearchParams({
    jogador1,
    jogador2
  });

  window.location.href = `jogo.html?${params.toString()}`;
});
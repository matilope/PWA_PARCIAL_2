class Game {
  notAvailable = [];
  playerChoices = [];
  botChoices = [];
  winningOptions = [
    [[0, 1, 2], [3, 4, 5], [6, 7, 8]],
    [[0, 3, 6], [1, 4, 7], [2, 5, 8]],
    [[0, 4, 8], [2, 4, 6]]
  ];

  offline() {
    this.notAvailable = [];
    this.playerChoices = [];
    this.botChoices = [];

    let form = document.querySelector("form");
    form?.remove();
    let main = document.querySelector("main");
    Array.from(main.children)?.forEach(item => item?.remove());
    main.classList.add("main-game");

    let h2 = document.createElement("h2");
    let p = document.createElement("p");
    let section = document.createElement("section");
    let div = document.createElement("div");

    main.append(h2, p, section);
    section.append(div);

    p.classList.add("mb-3", "lead");
    div.classList.add("game-container");

    h2.textContent = "No estas conectado a internet";
    p.textContent = "Te invitamos a jugar a el Tic Tac Toe";

    for (let i = 0; i < 9; i++) {
      let casillero = document.createElement("div");
      div.appendChild(casillero);
      casillero.classList.add("casillero");
      casillero.setAttribute("data-id", i);
      casillero.addEventListener('click', (e) => {
        if (!e.target.children.length) {
          let circle = document.createElement("i");
          circle.classList.add("bi", "bi-circle");
          casillero.appendChild(circle);
          this.playerChoices.push(i);
          this.notAvailable.push(i);
          this.disabled(true);
          setTimeout(() => {
            this.bot();
          }, 500);
        }
      });
    }
  }

  disabled(order) {
    const casilleros = document.querySelectorAll(".casillero");
    casilleros.forEach(item => {
      item.style = order ? "pointer-events: none;" : "pointer-events: all;";
    });
  }

  bot() {
    let casillero;
    let posibilities = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let filter = posibilities.filter(item => !this.notAvailable.includes(item));
    let randomIndex = Math.floor(Math.random() * filter.length);
    let optionSelected = filter[randomIndex];
    if (!this.notAvailable.includes(optionSelected) && optionSelected != null) {
      this.botChoices.push(optionSelected);
      this.notAvailable.push(optionSelected);
      casillero = document.querySelector(`[data-id='${optionSelected}']`);
      if (casillero && !casillero.children.length) {
        let x = document.createElement("i");
        x.classList.add("bi", "bi-x");
        casillero.appendChild(x);
        this.disabled(false);
      }
    }

    this.notAvailable.sort((a, b) => a - b);
    if (this.winnerAnnouncement() || "[0,1,2,3,4,5,6,7,8]" === JSON.stringify(this.notAvailable)) {
      this.gameOver();
    }
  }

  checkWinner(choices) {
    for (let i in this.winningOptions) {
      for (let j in this.winningOptions[i]) {
        if (this.winningOptions[i][j].every((item) => choices.includes(item))) {
          return true;
        }
      }
    }
    return false;
  }

  winnerAnnouncement() {
    let playerWon = this.checkWinner(this.playerChoices);
    let botWon = this.checkWinner(this.botChoices);
    if (playerWon || botWon) {
      return true;
    }
  }

  gameOver() {
    let parent = document.querySelector(".game-container").parentElement;
    let p = document.createElement("p");
    let img = document.createElement("img");
    let button = document.createElement("button");
    parent.append(p, img, button);
    p.classList.add("mb-3", "mt-4", "lead");
    button.classList.add("btn", "btn-lg", "btn-add");
    button.textContent = "Volver a jugar";
    this.disabled(true);
    let playerWon = this.checkWinner(this.playerChoices);
    let botWon = this.checkWinner(this.botChoices);
    document.body.classList.add("overflow-hidden");
    if (playerWon) {
      p.textContent = "¡El juego se ha terminado! Usted ha ganado";
      img.src = "imagenes/result/winner.png";
    } else if (botWon) {
      p.textContent = "¡El juego se ha terminado! Usted ha perdido";
      img.src = "imagenes/result/loser.png";
    } else {
      p.textContent = "¡El juego se ha terminado! Han empatado";
      img.src = "imagenes/result/draw.png";
    }
    setTimeout(() => {
      img.remove();
      document.body.classList.remove("overflow-hidden");
    }, 3000);
    button.addEventListener('click', () => {
      this.offline();
    });
  }

}

const juego = new Game();

window.addEventListener('offline', () => {
  juego.offline();
});

window.addEventListener('online', () => {
  home();
});

if (!navigator.onLine) {
  juego.offline();
}

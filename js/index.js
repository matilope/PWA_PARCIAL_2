const APIKEY = "5f52a7aa";
const main = document.querySelector("main");
let observer = null;

function toggleMenu() {
  const menuBtn = document.querySelector('.menu-btn');
  const navMenu = document.querySelector('nav ul');
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    navMenu.classList.toggle('show');
  });
}

document.querySelectorAll("li")?.forEach((item) => {
  item.addEventListener("click", (e) => {
    const texto = e.target.innerHTML;
    document.querySelector('.menu-btn').classList.remove('active');
    document.querySelector('nav ul').classList.remove('show');
    if (texto == "Listado") {
      list();
    } else if (texto == "Inicio") {
      home();
    } else {
      featuredMovies();
    }
  });
});

function formSubmit() {
  document.querySelector("form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    Array.from(main.children)?.forEach(e => e?.remove());
    let search = e.target.children[0].children[0].value;
    let section = document.createElement("section");
    let h2 = document.createElement("h2");

    main.append(h2, section);
    spinner(true);

    section.classList.add("search");
    h2.textContent = "Resultados de la búsqueda";

    let page = 1;
    setTimeout(() => {
      petition(section, search, page);
    }, 1000);

    e.target.children[0].children[0].value = "";
  });
}

function intersectionObserverApi(search, page) {
  let options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.25,
  };

  if (!observer && navigator.onLine) {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        spinner(true);
        /* Se utiliza el setTimeout para que se vea el spinner */
        setTimeout(() => {
          page++;
          petition(document.querySelector(".search"), search, page);
        }, 1000);
      }
    }, options);
  }
  let searchedElement = document.querySelector(".search article:last-child");
  if (searchedElement) {
    observer.observe(searchedElement);
  }
}

async function petition(section, search, page) {
  try {
    const { Search, Response } = await (await fetch(`https://www.omdbapi.com/?s=${search}&type=movie&page=${page}&apikey=${APIKEY}`)).json();
    spinner(false);
    for (let i = 0; i < Search?.length; i++) {
      let article = document.createElement("article");
      let img = document.createElement("img");
      let div = document.createElement("div");
      let h3 = document.createElement("h3");
      let span = document.createElement("span");
      let icon = document.createElement("i");

      section.appendChild(article);
      article.append(img, div);
      div.append(h3, span, icon);

      div.classList.add("search-body");
      icon.classList.add("bi", "bi-plus-circle");
      icon.setAttribute("title", "Agregar a la lista");
      icon.setAttribute("data-id", Search[i].imdbID);

      h3.setAttribute("title", Search[i].Title);
      h3.textContent = Search[i].Title;
      img.src = Search[i].Poster == 'N/A' ? 'imagenes/default/default.png' : Search[i].Poster;
      span.textContent = `Película (${Search[i].Year})`;

      const dataFilter = await database.getMovie(Search[i].imdbID);
      if (dataFilter && icon.classList.contains("bi-plus-circle")) {
        icon.classList.remove("bi-plus-circle");
        icon.classList.add("bi-dash-circle");
        icon.setAttribute("title", "Quitar de la lista");
      }
      icon?.addEventListener("click", (e) => {
        addAndRemove(e.target, Search[i]);
      });
    }
    observer?.disconnect();
    observer = null;
    spinner(false);
    if (Response == "True") {
      intersectionObserverApi(search, page);
    } else if (Response == "False" && page == 1) {
      errorFeedback(section, false);
      return;
    }
  }
  catch (error) {
    console.log(error);
    spinner(false);
    errorFeedback(section, true);
  }
}

async function addAndRemove(icon, searchItem) {
  const id = icon.getAttribute("data-id");
  const alreadyExists = await database.getMovie(id);
  if (alreadyExists) {
    icon.classList.remove("bi-dash-circle");
    icon.classList.add("bi-plus-circle");
    icon.setAttribute("title", "Agregar a la lista");
    await database.deleteMovie(id);
    alertMessage(false, "Se ha quitado de la lista", "bi-check2-circle");
  } else {
    icon.classList.remove("bi-plus-circle");
    icon.classList.add("bi-dash-circle");
    icon.setAttribute("title", "Quitar de la lista");
    searchItem.Poster = searchItem.Poster == "N/A" ? "imagenes/default/default.png" : searchItem.Poster;
    await database.saveMovie(searchItem);
    alertMessage(false, "Se ha agregado a la lista", "bi-check2-circle");
  }
}

function home() {
  if (navigator.onLine) {
    Array.from(main.children)?.forEach(e => e?.remove());
    main.classList.remove("main-game");
    let section = document.createElement("section");
    let h2 = document.createElement("h2");
    let loading = document.createElement("div");

    main.append(h2, section);
    section.appendChild(loading);

    loading.classList.add("loading");
    h2.textContent = "Realizá una búsqueda";

    let formSelector = document.querySelector("form");
    if (!formSelector) {
      let form = document.createElement("form");
      let inputGroup = document.createElement("div");
      let inputSearch = document.createElement("input");
      let button = document.createElement("button");
      let i = document.createElement("i");

      document.querySelector(".intro").appendChild(form);
      form.appendChild(inputGroup);
      inputGroup.append(inputSearch, button);
      button.appendChild(i);

      inputGroup.classList.add("input-group");
      inputSearch.type = "search";
      inputSearch.placeholder = "Buscar..";
      inputSearch.setAttribute("aria-label", "buscador");
      inputSearch.classList.add("form-control", "form-control-lg");
      button.type = "submit";
      button.classList.add("input-group-text");
      i.classList.add("bi", "bi-search");
      formSubmit();
    }

    for (let i = 0; i < 4; i++) {
      let phContainer = document.createElement("div");
      let phBody = document.createElement("div");
      let phTitle = document.createElement("div");
      let phSpan = document.createElement("span");

      phContainer.classList.add("ph-container");
      phBody.classList.add("placeholder-glow", "placeholder", "ph-body");
      phTitle.classList.add("placeholder", "ph-title");
      phSpan.classList.add("placeholder", "ph-span");

      loading.appendChild(phContainer);
      phContainer.appendChild(phBody);
      phBody.append(phTitle, phSpan);
    }
  } else {
    juego.offline();
  }
}

async function list() {
  Array.from(main.children)?.forEach(e => e?.remove());
  main.classList.remove("main-game");
  let h2 = document.createElement("h2");
  const data = await database.getMovies();

  if (!data.length) {
    let p = document.createElement("p");
    let img = document.createElement("img");
    main.append(h2, p, img);
    h2.textContent = "No tiene películas para ver más tarde";
    p.textContent = "Busque una película y agréguela a la lista.";
    img.src = "imagenes/list/no-list.png";
    img.classList.add("img-fluid");
    img.style = "border-radius: 1rem;";
  } else {
    let section = document.createElement("section");
    let divContainer = document.createElement("div");
    let divPrev = document.createElement("i");
    let divNext = document.createElement("i");
    section.classList.add("list");
    divContainer.classList.add("icon-container");
    divPrev.classList.add("bi", "bi-arrow-left");
    divNext.classList.add("bi", "bi-arrow-right");
    main.append(h2, section);
    section.append(divContainer);
    divContainer.append(divPrev, divNext);
    h2.textContent = "Películas para ver más tarde";
    divPrev.style.visibility = "hidden";
    let min = 0;
    let max = maxItems(data, divNext, section);
    paginado(section, data, min, max);
    window.addEventListener('resize', () => {
      const valor = window.innerWidth;
      divNext.style.visibility = "visible";
      if (valor <= 1399 && valor >= 992) {
        min = 0;
        max = 3;
        if (data.length <= 3) { divNext.style.visibility = "hidden"; section.style.justifyContent = "start"; }
      } else if (valor <= 991 & valor >= 576) {
        min = 0;
        max = 2;
        if (data.length <= 2) { divNext.style.visibility = "hidden"; section.style.justifyContent = "start"; }
      } else if (valor <= 575) {
        min = 0;
        max = 1;
        if (data.length <= 1) { divNext.style.visibility = "hidden"; }
      } else {
        min = 0;
        max = 4;
        if (data.length <= 4) { divNext.style.visibility = "hidden"; }
      }
      divPrev.style.visibility = "hidden";
      paginado(section, data, min, max);
    });
    divPrev.addEventListener('click', () => {
      divNext.style.visibility = "visible";
      if (min != 0) {
        min--;
        max--;
        paginado(section, data, min, max);
      }
      if (min == 0) {
        divPrev.style.visibility = "hidden";
      }
    });

    divNext.addEventListener('click', () => {
      divPrev.style.visibility = "visible";
      if (max != data.length) {
        min++;
        max++;
        paginado(section, data, min, max);
      }
      if (max == data.length) {
        divNext.style.visibility = "hidden";
      }
    });
  }
}

function maxItems(data, divNext, section) {
  const valor = window.innerWidth;
  if (valor <= 1399 && valor >= 992) {
    if (data.length <= 3) { divNext.style.visibility = "hidden"; section.style.justifyContent = "start"; }
    return 3;
  } else if (valor <= 991 & valor >= 576) {
    if (data.length <= 2) { divNext.style.visibility = "hidden"; section.style.justifyContent = "start"; }
    return 2;
  } else if (valor <= 575) {
    if (data.length <= 1) { divNext.style.visibility = "hidden"; }
    return 1;
  } else {
    if (data.length <= 4) { divNext.style.visibility = "hidden"; }
    return 4;
  }
}

async function trailer(title) {
  Array.from(main.children)?.forEach(e => e?.remove());

  let section = document.createElement("section");
  let h2 = document.createElement("h2");
  let div = document.createElement("div");

  main.appendChild(section);
  section.append(h2, div);

  try {
    const data = await (await fetch(`https://www.googleapis.com/youtube/v3/search?key=AIzaSyChelOBReJ4dq4AXWhSLf6vsSzN4SNu9zU&q=${title}%20trailer`)).json();
    div.id = "player";
    h2.textContent = `Trailer de ${title}`;
    spinner(true);

    setTimeout(() => {
      var player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player("player", {
          videoId: data.items[0].id.videoId,
          playerVars: {
            "playsinline": 1
          },
          events: {
            "onReady": onPlayerReady
          }
        });
      }

      function onPlayerReady(event) {
        event.target.playVideo();
      }

      spinner(false);
      onYouTubeIframeAPIReady();
    }, 1000);
  } catch (error) {
    console.log(error);
    spinner(false);
    h2.textContent = "Ha ocurrido un error";
    let p = document.createElement("p");
    let button = document.createElement("button");
    div.append(p, button);
    p.textContent = "No se puede visualizar el trailer.";
    button.textContent = "Jugar Tic Tac Toe";
    button.classList.add("btn-lg", "btn-simple");
    button.addEventListener('click', () => {
      juego.offline();
    });
  }
}

function paginado(section, data, min, max) {
  if (!document.querySelector(".featured")) {
    document.querySelectorAll(".list article").forEach(item => item?.remove());
    max = max <= data.length ? max : data.length;
    for (min; min < max; min++) {
      let article = document.createElement("article");
      let img = document.createElement("img");
      let div = document.createElement("div");
      let h3 = document.createElement("h3");
      let span = document.createElement("span");
      let button = document.createElement("button");
      let remove = document.createElement("button");

      section.appendChild(article);
      article.append(img, div);
      div.append(h3, span, button, remove);

      div.classList.add("list-body");
      button.classList.add("btn", "btn-lg", "btn-add");
      remove.classList.add("btn", "btn-delete");
      img.src = data[min].Poster;
      img.alt = data[min].Title;
      remove.setAttribute("title", "Quitar de la lista");
      h3.textContent = data[min].Title;
      h3.setAttribute("title", data[min].Title);
      span.textContent = data[min].Year;
      button.textContent = "Ver trailer";
      remove.innerHTML = "&times;";
      remove.setAttribute('data-id', data[min].imdbID);
      button.setAttribute('data-title', `${data[min].Title} - ${data[min].Year}`);

      remove.addEventListener("click", (e) => {
        alertMessage(true, "¿Queres quitarla de la lista?", "bi-exclamation-circle", async (accept) => {
          if (accept) {
            const id = e.target.getAttribute('data-id');
            await database.deleteMovie(id);
            alertMessage(false, "Se ha quitado de la lista", "bi-check2-circle");
            list();
          } else {
            alertMessage(false, "Se ha salvado, sigue en la lista", "bi-check2-circle");
          }
        });
      });

      button.addEventListener("click", (e) => {
        const title = e.target.getAttribute('data-title');
        let loader = document.createElement("div");
        let span = document.createElement("span");
        e.target.appendChild(loader);
        loader.appendChild(span);
        loader.classList.add("spinner-border", "text-light");
        span.classList.add("visually-hidden");
        loader.setAttribute("role", "status");
        span.textContent = "Cargando...";
        setTimeout(() => {
          trailer(title);
        }, 1000);
      });
    }
  }
}

function spinner(state) {
  let spinnerContainer = document.querySelector(".spinner-container");
  if (!state) {
    spinnerContainer?.remove();
  } else {
    if (!spinnerContainer) {
      let container = document.createElement("div");
      let div = document.createElement("div");
      let span = document.createElement("span");

      div.classList.add("spinner-border", "text-light");
      div.style = "width: 4rem; height:4rem;";
      div.setAttribute("role", "status");

      container.classList.add("spinner-container", "mt-3");
      span.classList.add("visually-hidden");
      span.textContent = "Cargando...";

      document.querySelector("main").appendChild(container);
      container.append(div, span);
    }
  }
}

function alertMessage(toConfirm, title, icon, callback) {
  let background = document.createElement("div");
  document.body.appendChild(background);
  background.classList.add("alert-background");
  let divContainer = document.createElement("div");
  let div = document.createElement("div");
  let i = document.createElement("i");
  let h4 = document.createElement("h4");

  divContainer.classList.add("alert-container");
  div.classList.add("alert-message");
  i.classList.add("bi", icon);
  h4.textContent = title;

  document.body.appendChild(divContainer);
  divContainer.appendChild(div);
  div.append(i, h4);

  if (toConfirm) {
    let buttonContainer = document.createElement("div");
    let cancel = document.createElement("button");
    let accept = document.createElement("button");
    div.appendChild(buttonContainer);
    buttonContainer.append(accept, cancel);
    buttonContainer.classList.add("btn-container");
    cancel.classList.add("btn-lg", "btn-cancel-alert");
    accept.classList.add("btn-lg", "btn-accept-alert");
    cancel.textContent = "Cancelar";
    accept.textContent = "Aceptar";
    cancel?.addEventListener('click', () => {
      background?.remove();
      divContainer?.remove();
      return callback(false);
    });
    accept?.addEventListener('click', (e) => {
      background?.remove();
      divContainer?.remove();
      return callback(true);
    });
  } else {
    setTimeout(() => {
      background?.remove();
      divContainer?.remove();
    }, 1500);
  }
}

function errorFeedback(section, isItAnError) {
  document.querySelector("h2").textContent = "No se ha encontrado la película solicitada.";
  section.classList.add("search-failed");
  let p = document.createElement("p");
  let img = document.createElement("img");
  section.append(p, img);
  p.innerHTML = "Fíjese de no haber cometido algún error ortográfico e intente nuevamente.";
  img.src = "imagenes/list/no-list.png";
  img.classList.add("img-fluid");
  img.style = "border-radius: 1rem; width: auto;";
  if (isItAnError) {
    let button = document.createElement("button");
    button.textContent = "Jugar Tic Tac Toe";
    button.classList.add("btn-lg", "btn-simple", "mt-3");
    p.innerHTML += "<br />En caso de no tener internet, lo invitamos a jugar al Tic Tac Toe";
    section.appendChild(button);
    button.addEventListener('click', () => {
      juego.offline();
    });
  }
}

function featuredMovies() {
  Array.from(main.children)?.forEach(e => e?.remove());
  let section = document.createElement("section");
  section.classList.add("list", "featured");
  let h2 = document.createElement("h2");
  main.append(h2, section);
  h2.textContent = "Películas destacadas";
  const data = [
    {
      title: "Sueños de libertad",
      year: 1994,
      rating: '9.3',
      imdbID: 'tt0111161',
      img: 'https://m.media-amazon.com/images/M/MV5BMTA1MjE0Nzk4MDleQTJeQWpwZ15BbWU4MDA0NjIxMjAx._V1_FMjpg_UX364_.jpg'
    },
    {
      title: "El padrino",
      year: 1972,
      rating: '9.2',
      imdbID: 'tt0068646',
      img: 'https://m.media-amazon.com/images/M/MV5BMGNkYzY2ZjUtODU4My00Mjc5LWEwNDAtMzUxZjcxZWJhZTcwXkEyXkFqcGdeQXVyODc0OTEyNDU@._V1_FMjpg_UX431_.jpg'
    },
    {
      title: "El caballero oscuro",
      year: 1972,
      rating: '9.0',
      imdbID: 'tt0468569',
      img: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UY2048_.jpg'
    },
    {
      title: "El padrino (parte II)",
      year: 1974,
      rating: '9.0',
      imdbID: 'tt0071562',
      img: 'https://m.media-amazon.com/images/M/MV5BODBkMzlhNDEtYjc2Mi00ZTU0LTk5YjktYmI3MTJiODQ3YmMyXkEyXkFqcGdeQXVyMTAyOTE2ODg0._V1_FMjpg_UY1975_.jpg'
    },
    {
      title: "12 hombres sin piedad",
      year: 1957,
      rating: '9.0',
      imdbID: 'tt0050083',
      img: 'https://m.media-amazon.com/images/M/MV5BYjViOWI2MTctYjRkNi00NWRhLTlhYjQtYjVmNDc1YmU3ZGM4XkEyXkFqcGdeQXVyODc0OTEyNDU@._V1_FMjpg_UX678_.jpg'
    },
    {
      title: "La lista de Schindler",
      year: 1993,
      rating: '8.9',
      imdbID: 'tt0108052',
      img: 'https://m.media-amazon.com/images/M/MV5BZDI1MDA5NDktNjc5Ny00MmQ4LThmODYtYTg1YmFjNThiNWVhXkEyXkFqcGdeQXVyODc0OTEyNDU@._V1_FMjpg_UX600_.jpg'
    }
  ];
  for (let i = 0; i < data.length; i++) {
    let article = document.createElement("article");
    let img = document.createElement("img");
    let div = document.createElement("div");
    let h3 = document.createElement("h3");
    let year = document.createElement("span");
    let starContainer = document.createElement("div");
    let icon = document.createElement("i");
    let rating = document.createElement("span");
    let anchor = document.createElement("a");

    img.src = data[i].img;
    h3.textContent = data[i].title;
    h3.title = data[i].title;
    year.textContent = data[i].year;
    rating.textContent = data[i].rating;
    anchor.textContent = "Ver en IMDB";
    anchor.href = `https://www.imdb.com/title/${data[i].imdbID}`;
    anchor.title = data[i].title;
    anchor.setAttribute("target", "_blank");

    div.classList.add("list-body");
    starContainer.classList.add("star-container");
    icon.classList.add("bi", "bi-star-fill");
    anchor.classList.add("btn", "btn-lg", "btn-add");

    section.appendChild(article);
    article.append(img, div);
    div.append(h3, year, starContainer, anchor);
    starContainer.appendChild(icon);
    icon.appendChild(rating);
  }
}

formSubmit();

toggleMenu();

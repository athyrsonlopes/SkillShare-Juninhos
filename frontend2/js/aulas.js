// MENU

document.getElementById("toggleMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("closed");
});

// ABAS

const tabs = document.querySelectorAll(".tab");

const panes = document.querySelectorAll(".tab-pane");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((btn) => btn.classList.remove("active"));

    panes.forEach((pane) => pane.classList.remove("active"));

    tab.classList.add("active");

    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// DADOS

const aulasAtivas = [
  {
    titulo: "React Básico",
    professor: "Carlos Mendes",
    data: "20/06/2026",
    progresso: 60,
  },

  {
    titulo: "Inglês Conversação",
    professor: "Ana Souza",
    data: "22/06/2026",
    progresso: 40,
  },
];

const aulasConcluidas = [
  {
    titulo: "HTML Básico",
    professor: "João Silva",
    data: "Finalizada",
    progresso: 100,
  },
];

// RENDER

function renderAtivas() {
  const lista = document.getElementById("listaAtivas");

  lista.innerHTML = "";

  aulasAtivas.forEach((aula) => {
    lista.innerHTML += `

<div class="aula-card">

<h3>${aula.titulo}</h3>

<p>
Professor: ${aula.professor}
</p>

<p>
Próxima aula: ${aula.data}
</p>

<p>
${aula.progresso}% concluído
</p>

<div class="progress">

<div
class="progress-fill"
style="width:${aula.progresso}%">
</div>

</div>

<div class="acoes">

<button
class="btn-primary">

Entrar no Chat

</button>

</div>

</div>

`;
  });
}

function renderConcluidas() {
  const lista = document.getElementById("listaConcluidas");

  lista.innerHTML = "";

  aulasConcluidas.forEach((aula) => {
    lista.innerHTML += `

<div class="aula-card">

<h3>${aula.titulo}</h3>

<p>
Professor: ${aula.professor}
</p>

<p>
Concluída
</p>

<p>
100%
</p>

<div class="progress">

<div
class="progress-fill"
style="width:100%">
</div>

</div>

</div>

`;
  });
}

renderAtivas();
renderConcluidas();

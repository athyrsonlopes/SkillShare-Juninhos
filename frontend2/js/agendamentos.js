// ==========================
// MENU LATERAL
// ==========================

document.getElementById("toggleMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("closed");
});

// ==========================
// ABAS
// ==========================

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

// ==========================
// DADOS MOCKADOS
// ==========================

let disponiveis = [
  {
    id: 1,
    nome: "Carlos Mendes",
    tipo: "Professor",
    assunto: "React Básico",
    horario: "Hoje às 19:00",
    foto: "https://i.pravatar.cc/150?img=12",
    tags: ["React", "JavaScript"],
  },

  {
    id: 2,
    nome: "Ana Souza",
    tipo: "Professora",
    assunto: "Inglês Conversação",
    horario: "Hoje às 20:00",
    foto: "https://i.pravatar.cc/150?img=25",
    tags: ["Inglês", "Conversação"],
  },
];

let aulas = JSON.parse(localStorage.getItem("aulasDUO")) || [];

// ==========================
// RENDER DISPONÍVEIS
// ==========================

function renderDisponiveis() {
  const lista = document.getElementById("listaDisponiveis");

  lista.innerHTML = "";

  disponiveis.forEach((item) => {
    lista.innerHTML += `

        <div class="card-agendamento">

            <div class="card-left">

                <img
                src="${item.foto}">

                <div class="card-info">

                    <h3>
                        ${item.nome}
                    </h3>

                    <p>
                        ${item.tipo}
                    </p>

                    <p>
                        ${item.assunto}
                    </p>

                    <div class="tags">

                        ${item.tags
                          .map((tag) => `<span class="tag">${tag}</span>`)
                          .join("")}

                    </div>

                </div>

            </div>

            <div class="card-right">

                <span class="disponivel">

                    ${item.horario}

                </span>

                <div class="acoes">

                    <button
                    class="btn-secondary"
                    onclick="verPerfil(${item.id})">

                        Ver Perfil

                    </button>

                    <button
                    class="btn-primary"
                    onclick="agendarAula(${item.id})">

                        Agendar

                    </button>

                </div>

            </div>

        </div>

        `;
  });
}

// ==========================
// RENDER AULAS
// ==========================

function renderAulas() {
  const lista = document.getElementById("listaAulas");

  lista.innerHTML = "";

  if (aulas.length === 0) {
    lista.innerHTML = "<p>Nenhuma aula agendada.</p>";

    return;
  }

  aulas.forEach((item) => {
    lista.innerHTML += `

        <div class="card-agendamento">

            <div class="card-left">

                <img
                src="${item.foto}">

                <div class="card-info">

                    <h3>
                        ${item.assunto}
                    </h3>

                    <p>
                        ${item.nome}
                    </p>

                    <p>
                        ${item.data}
                    </p>

                </div>

            </div>

            <div class="card-right">

                <span class="disponivel">

                    Confirmada

                </span>

                <div class="acoes">

                    <button
                    class="btn-primary">

                        Chat

                    </button>

                    <button
                    class="btn-secondary"
                    onclick="cancelarAula(${item.id})">

                        Cancelar

                    </button>

                </div>

            </div>

        </div>

        `;
  });
}

// ==========================
// AGENDAR
// ==========================

function agendarAula(id) {
  const pessoa = disponiveis.find((item) => item.id === id);

  const novaAula = {
    id: Date.now(),

    nome: pessoa.nome,

    assunto: pessoa.assunto,

    foto: pessoa.foto,

    data: pessoa.horario,
  };

  aulas.push(novaAula);

  localStorage.setItem(
    "aulasDUO",

    JSON.stringify(aulas),
  );

  renderAulas();

  alert("Aula agendada com sucesso!");
}

// ==========================
// CANCELAR
// ==========================

function cancelarAula(id) {
  aulas = aulas.filter((item) => item.id !== id);

  localStorage.setItem(
    "aulasDUO",

    JSON.stringify(aulas),
  );

  renderAulas();
}

// ==========================
// PERFIL
// ==========================

function verPerfil(id) {
  localStorage.setItem("perfilSelecionado", id);

  window.location.href = "perfil-publico.html";
}

// ==========================
// CRIAR AGENDAMENTO
// ==========================

const btnSalvar = document.querySelector(".btn-primary");

if (btnSalvar) {
  btnSalvar.addEventListener("click", () => {
    alert("Agendamento criado com sucesso!");
  });
}

// ==========================
// INICIAR
// ==========================

renderDisponiveis();

renderAulas();

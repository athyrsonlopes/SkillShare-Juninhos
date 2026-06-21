// ==========================================
// MENU LATERAL
// ==========================================

document.getElementById("toggleMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("closed");
});

// ==========================================
// ABAS
// ==========================================

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

// ==========================================
// BUSCAR DADOS
// ==========================================

let amigos = JSON.parse(localStorage.getItem("amigosDUO")) || [];

let enviados = JSON.parse(localStorage.getItem("solicitacoesDUO")) || [];

// simulando pedidos recebidos

let recebidos = JSON.parse(localStorage.getItem("recebidosDUO")) || [
  {
    id: 1,

    nome: "Carlos Mendes",

    tipo: "Professor",

    foto: "https://i.pravatar.cc/150?img=15",

    status: "pendente",
  },
];

// ==========================================
// CRIAR CARD
// ==========================================

function criarCard(usuario, tipo) {
  let botoes = "";

  if (tipo === "amigo") {
    botoes = `

            <button 
            class="btn primary"
            onclick="abrirChat()">

                Chat

            </button>


            <button 
            class="btn secondary"
            onclick="agendar()">

                Agendar

            </button>

        `;
  }

  if (tipo === "recebido") {
    botoes = `


        <button 
        class="btn primary"
        onclick="aceitar(${usuario.id})">

            Aceitar

        </button>


        <button 
        class="btn secondary"
        onclick="recusar(${usuario.id})">

            Recusar

        </button>


        `;
  }

  if (tipo === "enviado") {
    botoes = `

        <span class="pendente">

            Solicitação enviada ✓

        </span>

        `;
  }

  return `


    <div class="card-conexao">


        <div class="left">


            <img 
            src="${usuario.foto}">


            <div>


                <h3>

                    ${usuario.nome}

                </h3>


                <p>

                    ${usuario.tipo}

                </p>


            </div>


        </div>



        <div class="acoes">


            ${botoes}


        </div>


    </div>


    `;
}

// ==========================================
// CARREGAR LISTAS
// ==========================================

function carregar() {
  document.getElementById("listaConexoes").innerHTML = amigos.length
    ? amigos.map((item) => criarCard(item, "amigo")).join("")
    : "<p>Nenhuma conexão ainda.</p>";

  document.getElementById("listaRecebidos").innerHTML = recebidos.length
    ? recebidos.map((item) => criarCard(item, "recebido")).join("")
    : "<p>Nenhum pedido recebido.</p>";

  document.getElementById("listaEnviados").innerHTML = enviados.length
    ? enviados.map((item) => criarCard(item, "enviado")).join("")
    : "<p>Nenhuma solicitação enviada.</p>";
}

// ==========================================
// ACEITAR
// ==========================================

function aceitar(id) {
  const pessoa = recebidos.find((item) => item.id === id);

  amigos.push(pessoa);

  recebidos = recebidos.filter((item) => item.id !== id);

  salvar();

  carregar();
}

// ==========================================
// RECUSAR
// ==========================================

function recusar(id) {
  recebidos = recebidos.filter((item) => item.id !== id);

  salvar();

  carregar();
}

// ==========================================
// SALVAR
// ==========================================

function salvar() {
  localStorage.setItem(
    "amigosDUO",

    JSON.stringify(amigos),
  );

  localStorage.setItem(
    "recebidosDUO",

    JSON.stringify(recebidos),
  );
}

// ==========================================
// CHAT / AGENDAR
// ==========================================

function abrirChat() {
  window.location.href = "mensagens.html";
}

function agendar() {
  window.location.href = "agendamentos.html";
}

// iniciar
carregar();

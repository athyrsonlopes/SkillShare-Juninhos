// ==========================
// MENU LATERAL
// ==========================

document.getElementById("toggleMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("closed");
});

// ==========================
// CONVERSAS
// ==========================

const conversas = [
  {
    id: 1,

    nome: "Carlos Mendes",

    status: "Online",

    ultimaMensagem: "Até amanhã!",

    hora: "19:45",

    foto: "https://i.pravatar.cc/150?img=12",

    mensagens: [
      {
        tipo: "recebida",
        texto: "Olá! Tudo bem?",
      },

      {
        tipo: "enviada",
        texto: "Tudo sim! Vamos ter aula amanhã?",
      },

      {
        tipo: "recebida",
        texto: "Sim! Às 19h.",
      },
    ],
  },

  {
    id: 2,

    nome: "Ana Clara",

    status: "Em aula",

    ultimaMensagem: "Vou enviar o PDF.",

    hora: "18:20",

    foto: "https://i.pravatar.cc/150?img=32",

    mensagens: [
      {
        tipo: "recebida",
        texto: "Oi! Já terminou os exercícios?",
      },

      {
        tipo: "enviada",
        texto: "Ainda não kkkkk",
      },
    ],
  },

  {
    id: 3,

    nome: "Lucas Ferreira",

    status: "Offline",

    ultimaMensagem: "Obrigado pela ajuda!",

    hora: "Ontem",

    foto: "https://i.pravatar.cc/150?img=15",

    mensagens: [
      {
        tipo: "recebida",
        texto: "Valeu pela ajuda!",
      },
    ],
  },
];

// ==========================
// CONVERSA ATUAL
// ==========================

let conversaAtual = conversas[0];

// ==========================
// RENDER CONVERSAS
// ==========================

function renderConversas() {
  const lista = document.getElementById("listaConversas");

  lista.innerHTML = "";

  conversas.forEach((conversa) => {
    lista.innerHTML += `

        <div
            class="conversa-item
            ${conversaAtual.id === conversa.id ? "active" : ""}
            "

            onclick="abrirConversa(${conversa.id})">

            <div class="conversa-left">

                <img
                    src="${conversa.foto}">

                <div class="conversa-info">

                    <h4>
                        ${conversa.nome}
                    </h4>

                    <span>
                        ${conversa.status}
                    </span>

                    <p>
                        ${conversa.ultimaMensagem}
                    </p>

                </div>

            </div>

            <div class="conversa-hora">

                ${conversa.hora}

            </div>

        </div>

        `;
  });
}

// ==========================
// ABRIR CONVERSA
// ==========================

function abrirConversa(id) {
  conversaAtual = conversas.find((c) => c.id === id);

  document.getElementById("nomeContato").textContent = conversaAtual.nome;

  document.getElementById("statusContato").textContent = conversaAtual.status;

  document.getElementById("fotoContato").src = conversaAtual.foto;

  renderConversas();

  renderMensagens();
}

// ==========================
// RENDER MENSAGENS
// ==========================

function renderMensagens() {
  const chat = document.getElementById("chatMessages");

  chat.innerHTML = "";

  conversaAtual.mensagens.forEach((msg) => {
    // TEXTO

    if (msg.texto) {
      chat.innerHTML += `

            <div
                class="message ${msg.tipo}">

                ${msg.texto}

            </div>

            `;
    }

    // PDF

    if (msg.pdf) {
      chat.innerHTML += `

            <div class="pdf-message">

                <div class="pdf-top">

                    <i class="fa-solid fa-file-pdf"></i>

                    <div class="pdf-info">

                        <h4>
                            ${msg.pdf}
                        </h4>

                        <span>
                            PDF Compartilhado
                        </span>

                    </div>

                </div>

                <button
                    class="btn-download">

                    Baixar

                </button>

            </div>

            `;
    }
  });

  // AUTO SCROLL

  chat.scrollTop = chat.scrollHeight;
}

// ==========================
// ENVIAR MENSAGEM
// ==========================

document.getElementById("btnEnviar").addEventListener("click", enviarMensagem);

document.getElementById("mensagemInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    enviarMensagem();
  }
});

function enviarMensagem() {
  const input = document.getElementById("mensagemInput");

  const texto = input.value.trim();

  if (texto === "") return;

  conversaAtual.mensagens.push({
    tipo: "enviada",
    texto: texto,
  });

  conversaAtual.ultimaMensagem = texto;

  input.value = "";

  salvarConversas();

  renderMensagens();

  renderConversas();
}

// ==========================
// PDF
// ==========================

document.getElementById("pdfInput").addEventListener("change", (e) => {
  const arquivo = e.target.files[0];

  if (!arquivo) return;

  // VALIDA PDF

  if (arquivo.type !== "application/pdf") {
    alert("Envie apenas PDF.");

    return;
  }

  conversaAtual.mensagens.push({
    tipo: "enviada",
    pdf: arquivo.name,
  });

  conversaAtual.ultimaMensagem = "PDF compartilhado";

  salvarConversas();

  renderMensagens();

  renderConversas();
});

// ==========================
// LOCAL STORAGE
// ==========================

function salvarConversas() {
  localStorage.setItem(
    "conversasDUO",

    JSON.stringify(conversas),
  );
}

function carregarConversas() {
  const dados = localStorage.getItem("conversasDUO");

  if (dados) {
    const conversasSalvas = JSON.parse(dados);

    conversas.length = 0;

    conversasSalvas.forEach((c) => {
      conversas.push(c);
    });

    conversaAtual = conversas[0];
  }
}

// ==========================
// INICIAR
// ==========================

carregarConversas();

renderConversas();

abrirConversa(conversaAtual.id);

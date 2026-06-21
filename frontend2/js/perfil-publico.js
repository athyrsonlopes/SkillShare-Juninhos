// ==========================================
// MENU LATERAL
// ==========================================

document.getElementById("toggleMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("closed");
});

// ==========================================
// DADOS MOCKADOS
// FUTURAMENTE VIRÃO DA API
// ==========================================

const perfil = {
  nome: "Maria Heloisa",

  tipo: "Professora",

  cidade: "Ibirité, MG",

  bio: "Desenvolvedora Full Stack e mentora. Gosto de ajudar alunos iniciantes e intermediários em tecnologia, carreira e estudos.",

  foto: "https://i.pravatar.cc/300?img=32",

  objetivo: "Tornar-se Full Stack",

  nivel: "Intermediário",

  preferencias: ["React", "Node.js", "Inglês"],

  interesses: ["IA", "Java", "AWS"],

  disponibilidade: ["SEG", "TER", "QUI"],

  estuda: ["Java", "Spring Boot", "Docker", "AWS"],

  leciona: ["HTML", "CSS", "JavaScript", "React"],

  tecnologias: ["Node.js", "MySQL", "Git", "GitHub", "Figma"],
};

// ==========================================
// PERFIL
// ==========================================

document.getElementById("nomePerfil").textContent = perfil.nome;

document.getElementById("tipoPerfil").textContent = perfil.tipo;

document.getElementById("cidadePerfil").textContent = perfil.cidade;

document.getElementById("bioPerfil").textContent = perfil.bio;

document.getElementById("fotoPerfil").src = perfil.foto;

document.getElementById("nomeMini").textContent = perfil.nome;

document.getElementById("tipoMini").textContent = perfil.tipo;

document.getElementById("fotoMini").src = perfil.foto;

document.getElementById("objetivoAtual").textContent = perfil.objetivo;

document.getElementById("nivelGeral").textContent = perfil.nivel;

// ==========================================
// TAGS
// ==========================================

function criarTags(lista, id) {
  const container = document.getElementById(id);

  if (!container) return;

  lista.forEach((item) => {
    container.innerHTML += `<span class="tag">${item}</span>`;
  });
}

criarTags(perfil.preferencias, "preferencias");

criarTags(perfil.interesses, "interesses");

criarTags(perfil.disponibilidade, "disponibilidade");

criarTags(perfil.estuda, "conteudosEstudo");

criarTags(perfil.leciona, "conteudosLeciono");

criarTags(perfil.tecnologias, "listaTecnologias");

// ==========================================
// SISTEMA DE CONEXÃO
// ==========================================

const btnConectar = document.querySelector(".btn-conectar");

function verificarConexao() {
  const solicitacoes =
    JSON.parse(localStorage.getItem("solicitacoesDUO")) || [];

  const existe = solicitacoes.some((item) => item.nome === perfil.nome);

  if (existe) {
    btnConectar.textContent = "Solicitação enviada ✓";

    btnConectar.disabled = true;

    btnConectar.style.opacity = ".7";

    btnConectar.style.cursor = "default";
  }
}

if (btnConectar) {
  verificarConexao();
  btnConectar.addEventListener("click", () => {
    const solicitacoes =
      JSON.parse(localStorage.getItem("solicitacoesDUO")) || [];
    const novaSolicitacao = {
      id: Date.now(),
      nome: perfil.nome,
      tipo: perfil.tipo,
      foto: perfil.foto,
      status: "pendente",
    };
    solicitacoes.push(novaSolicitacao);
    localStorage.setItem("solicitacoesDUO", JSON.stringify(solicitacoes));
    btnConectar.textContent = "Solicitação enviada ✓";
    btnConectar.disabled = true;

    alert("Pedido de conexão enviado!");
  });
}

// ==========================================
// BOTÃO AGENDAR
// ==========================================

const btnAgendar = document.querySelector(".btn-agendar");

if (btnAgendar) {
  btnAgendar.addEventListener("click", () => {
    window.location.href = "agendamentos.html";
  });
}

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

    const painel = document.getElementById(tab.dataset.tab);

    if (painel) {
      painel.classList.add("active");
    }
  });
});

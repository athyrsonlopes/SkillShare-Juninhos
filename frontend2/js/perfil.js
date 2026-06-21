// ==========================================
// DADOS DO USUÁRIO (FUTURAMENTE VIRÃO DA API)
// ==========================================

const usuario = {
  nome: "Maria Heloisa",

  tipo: "Professor",

  cidade: "Ibirité, MG",

  bio: "Desenvolvedora Full Stack e mentora.",

  foto: "https://i.pravatar.cc/150?img=32",

  preferencias: ["React", "Node.js", "Inglês"],

  interesses: ["IA", "Java", "AWS"],

  disponibilidade: ["SEG", "TER", "QUI"],

  objetivo: "Tornar-se Full Stack",

  nivel: "Intermediário",

  estuda: ["Java", "Spring Boot", "Docker", "AWS"],

  leciona: ["HTML", "CSS", "JavaScript", "React"],

  tecnologias: ["Node.js", "MySQL", "Git", "GitHub", "Figma"],

  estatisticas: {
    aulas: 24,
    matches: 12,
    horas: 86,
  },
};

// ==========================================
// DADOS DOS MATCHES
// ==========================================

const matchesUsuario = [
  {
    nome: "Ana Souza",
    tipo: "Professora",
    foto: "https://i.pravatar.cc/150?img=5",
    area: "React • Node.js",
  },

  {
    nome: "Lucas Silva",
    tipo: "Estudante",
    foto: "https://i.pravatar.cc/150?img=8",
    area: "Java • Spring",
  },

  {
    nome: "Fernanda Costa",
    tipo: "Professora",
    foto: "https://i.pravatar.cc/150?img=9",
    area: "UX/UI • Figma",
  },
];

// ==========================================
// PERFIL
// ==========================================

document.getElementById("nomePerfil").textContent = usuario.nome;

document.getElementById("tipoPerfil").textContent = usuario.tipo;

document.getElementById("cidadePerfil").textContent = usuario.cidade;

document.getElementById("bioPerfil").textContent = usuario.bio;

document.getElementById("fotoPerfil").src = usuario.foto;

document.getElementById("nomeMini").textContent = usuario.nome;

document.getElementById("tipoMini").textContent = usuario.tipo;

document.getElementById("fotoMini").src = usuario.foto;

document.getElementById("objetivoAtual").textContent = usuario.objetivo;

document.getElementById("nivelGeral").textContent = usuario.nivel;

document.getElementById("aulas").textContent = usuario.estatisticas.aulas;

console.log(document.getElementById("totalMatches"));

document.getElementById("horas").textContent = usuario.estatisticas.horas + "h";

// ==========================================
// PREFERÊNCIAS
// ==========================================

const preferencias = document.getElementById("preferencias");

usuario.preferencias.forEach((item) => {
  preferencias.innerHTML += `<span class="tag">${item}</span>`;
});

// ==========================================
// INTERESSES
// ==========================================

const interesses = document.getElementById("interesses");

usuario.interesses.forEach((item) => {
  interesses.innerHTML += `<span class="tag">${item}</span>`;
});

// ==========================================
// DISPONIBILIDADE
// ==========================================

const disponibilidade = document.getElementById("disponibilidade");

usuario.disponibilidade.forEach((item) => {
  disponibilidade.innerHTML += `<span class="tag">${item}</span>`;
});

// ==========================================
// ESTUDO
// ==========================================

const conteudosEstudo = document.getElementById("conteudosEstudo");

usuario.estuda.forEach((item) => {
  conteudosEstudo.innerHTML += `<span class="tag">${item}</span>`;
});

// ==========================================
// LECIONO
// ==========================================

const conteudosLeciono = document.getElementById("conteudosLeciono");

usuario.leciona.forEach((item) => {
  conteudosLeciono.innerHTML += `<span class="tag">${item}</span>`;
});

// ==========================================
// TECNOLOGIAS
// ==========================================

const listaTecnologias = document.getElementById("listaTecnologias");

usuario.tecnologias.forEach((item) => {
  listaTecnologias.innerHTML += `<span class="tag">${item}</span>`;
});

// ==========================================
// MATCHES
// ==========================================

const listaMatches = document.getElementById("listaMatches");

const totalMatchesPerfil = document.getElementById("totalMatchesPerfil");

const totalMatches = document.getElementById("totalMatches");

if (totalMatches) {
  totalMatches.textContent = usuario.estatisticas.matches;
}

if (totalMatchesPerfil) {
  totalMatchesPerfil.textContent = usuario.estatisticas.matches;
}

if (listaMatches) {
  matchesUsuario.forEach((match) => {
    listaMatches.innerHTML += `

            <div class="match-card">

                <div class="match-left">

                    <img
                        src="${match.foto}"
                        alt="${match.nome}"
                    >

                    <div class="match-info">

                        <h4>${match.nome}</h4>

                        <p>${match.tipo}</p>

                        <small>${match.area}</small>

                    </div>

                </div>

                <div class="match-actions">

                    <button class="btn-match">
                        Ver Perfil
                    </button>

                </div>

            </div>

        `;
  });
}

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
    console.log("Clique:", tab.dataset.tab);

    tabs.forEach((btn) => btn.classList.remove("active"));

    panes.forEach((pane) => pane.classList.remove("active"));

    tab.classList.add("active");

    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// ==========================================
// BOTÃO SALVAR FOTO
// ==========================================
const fotoSalva = localStorage.getItem("fotoPerfilDUO");

if (fotoSalva) {
  document.getElementById("fotoPerfil").src = fotoSalva;

  document.getElementById("fotoMini").src = fotoSalva;
}

console.log("Cheguei nas abas");

// ==========================================
// CARREGA DADOS DO LOCALSTORAGE
// SE NÃO EXISTIR, USA DADOS PADRÃO
// ==========================================

const usuario = JSON.parse(localStorage.getItem("usuarioDUO")) || {
  nome: "Maria Heloisa",

  cidade: "Ibirité, MG",

  bio: "Desenvolvedora Full Stack e mentora.",

  objetivo: "Tornar-se Full Stack",

  nivel: "Intermediário",

  estuda: ["Java", "Spring Boot", "AWS"],

  leciona: ["HTML", "CSS", "JavaScript"],

  tecnologias: ["Node.js", "MySQL", "GitHub"],
};

// ==========================================
// PREENCHE FORMULÁRIO
// ==========================================

document.getElementById("nome").value = usuario.nome || "";

document.getElementById("cidade").value = usuario.cidade || "";

document.getElementById("bio").value = usuario.bio || "";

document.getElementById("objetivo").value = usuario.objetivo || "";

document.getElementById("nivel").value = usuario.nivel || "Iniciante";

document.getElementById("estuda").value = (usuario.estuda || []).join(", ");

document.getElementById("leciona").value = (usuario.leciona || []).join(", ");

document.getElementById("tecnologias").value = (usuario.tecnologias || []).join(
  ", ",
);

// ==========================================
// FOTO DE PERFIL
// ==========================================

const previewFoto = document.getElementById("previewFoto");

const inputFoto = document.getElementById("fotoPerfil");

const fotoSalva = localStorage.getItem("fotoPerfilDUO");

if (fotoSalva) {
  previewFoto.src = fotoSalva;
}

inputFoto.addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    previewFoto.src = event.target.result;

    localStorage.setItem("fotoPerfilDUO", event.target.result);
  };

  reader.readAsDataURL(file);
});

// ==========================================
// SALVAR PERFIL
// ==========================================

document.getElementById("formPerfil").addEventListener("submit", (e) => {
  e.preventDefault();

  const dadosAtualizados = {
    nome: document.getElementById("nome").value.trim(),

    cidade: document.getElementById("cidade").value.trim(),

    bio: document.getElementById("bio").value.trim(),

    objetivo: document.getElementById("objetivo").value.trim(),

    nivel: document.getElementById("nivel").value,

    estuda: document
      .getElementById("estuda")
      .value.split(",")
      .map((item) => item.trim())
      .filter((item) => item !== ""),

    leciona: document
      .getElementById("leciona")
      .value.split(",")
      .map((item) => item.trim())
      .filter((item) => item !== ""),

    tecnologias: document
      .getElementById("tecnologias")
      .value.split(",")
      .map((item) => item.trim())
      .filter((item) => item !== ""),
  };

  localStorage.setItem("usuarioDUO", JSON.stringify(dadosAtualizados));

  alert("Perfil atualizado com sucesso!");

  window.location.href = "perfil.html";
});

// ==========================================
// BOTÃO VOLTAR
// ==========================================

const btnVoltar = document.querySelector(".btn-voltar");

if (btnVoltar) {
  btnVoltar.addEventListener("click", (e) => {
    e.preventDefault();

    window.location.href = "perfil.html";
  });
}

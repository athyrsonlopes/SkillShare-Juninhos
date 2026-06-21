// MENU

document.getElementById("toggleMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("closed");
});

// DADOS

const progresso = [
  {
    nome: "HTML",
    valor: 100,
  },

  {
    nome: "CSS",
    valor: 85,
  },

  {
    nome: "JavaScript",
    valor: 60,
  },

  {
    nome: "React",
    valor: 35,
  },
];

const atividades = [
  "React Básico concluído",

  "Nova conexão criada",

  "Aula de Inglês agendada",

  "2 horas estudadas hoje",
];

// PROGRESSO

const listaProgresso = document.getElementById("listaProgresso");

progresso.forEach((item) => {
  listaProgresso.innerHTML += `

<div class="progresso-item">

<p>

<strong>
${item.nome}
</strong>

- ${item.valor}%

</p>

<div class="progress">

<div
class="progress-fill"
style="width:${item.valor}%">

</div>

</div>

</div>

`;
});

// ATIVIDADES

const listaAtividades = document.getElementById("atividadeRecente");

atividades.forEach((item) => {
  listaAtividades.innerHTML += `

<li>

${item}

</li>

`;
});

// ==========================
// META SEMANAL
// ==========================

let metaSemanal = Number(localStorage.getItem("metaSemanalDUO")) || 10;

// horas estudadas
const horasEstudadas = 6;

// atualizar interface

function atualizarMeta() {
  const percentual = Math.min((horasEstudadas / metaSemanal) * 100, 100);

  document.getElementById("textoMeta").textContent =
    `${horasEstudadas}h de ${metaSemanal}h concluídas`;

  document.getElementById("barraMeta").style.width = percentual + "%";
}

// botão editar
const modalMeta = document.getElementById("modalMeta");

const inputMeta = document.getElementById("inputMeta");

document.getElementById("btnEditarMeta").addEventListener("click", () => {
  inputMeta.value = metaSemanal;

  modalMeta.classList.add("active");
});

document.getElementById("cancelarMeta").addEventListener("click", () => {
  modalMeta.classList.remove("active");
});

document.getElementById("salvarMeta").addEventListener("click", () => {
  const valor = Number(inputMeta.value);

  if (valor <= 0) return;

  metaSemanal = valor;

  localStorage.setItem(
    "metaSemanalDUO",

    valor,
  );

  atualizarMeta();

  modalMeta.classList.remove("active");
});
// iniciar

atualizarMeta();

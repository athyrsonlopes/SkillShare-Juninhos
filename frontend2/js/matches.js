// ==========================================
// MENU LATERAL
// ==========================================

document.getElementById("toggleMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("closed");
});

// ==========================================
// ABAS ALUNO / PROFESSOR
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
// PEGAR DIAS MARCADOS
// ==========================================

function pegarDias(container) {
  const dias = [];

  container.querySelectorAll(".dias input:checked").forEach((item) => {
    dias.push(item.value);
  });

  return dias;
}

// ==========================================
// LIMPAR FORMULÁRIO
// ==========================================

document.getElementById("btnLimpar").addEventListener("click", () => {
  document.querySelectorAll("input, textarea").forEach((item) => {
    if (item.type === "checkbox") {
      item.checked = false;
    } else {
      item.value = "";
    }
  });

  document.querySelectorAll("select").forEach((select) => {
    select.selectedIndex = 0;
  });
});

// ==========================================
// BUSCAR MATCHES
// ==========================================

document.getElementById("btnBuscar").addEventListener("click", () => {
  const abaAtiva = document.querySelector(".tab.active").dataset.tab;

  let dadosBusca = {};

  // ==========================
  // ALUNO
  // ==========================

  if (abaAtiva === "aluno") {
    const areaAluno = document.getElementById("aluno");

    dadosBusca = {
      tipo: "aluno",

      materia: document.getElementById("materiaAluno").value,

      nivel: document.getElementById("nivelAluno").value,

      dias: pegarDias(areaAluno),

      periodo: document.getElementById("periodoAluno").value,

      descricao: document.getElementById("descricaoAluno").value,
    };
  }

  // ==========================
  // PROFESSOR
  // ==========================
  else {
    const areaProfessor = document.getElementById("professor");

    dadosBusca = {
      tipo: "professor",

      materia: document.getElementById("materiaProfessor").value,

      nivel: document.getElementById("nivelProfessor").value,

      dias: pegarDias(areaProfessor),

      periodo: document.getElementById("periodoProfessor").value,

      descricao: document.getElementById("descricaoProfessor").value,
    };
  }

  // ==================================
  // SALVAR PARA RESULTADO-MATCH
  // FUTURAMENTE VIRA POST API
  // ==================================

  localStorage.setItem(
    "buscaMatchDUO",

    JSON.stringify(dadosBusca),
  );

  window.location.href = "resultado-match.html";
});

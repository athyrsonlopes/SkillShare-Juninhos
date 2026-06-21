// ==========================================
// MENU LATERAL
// ==========================================

document.getElementById("toggleMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("closed");
});

// ==========================================
// DADOS DA BUSCA
// ==========================================

const busca = JSON.parse(localStorage.getItem("buscaMatchDUO"));

// ==========================================
// MOSTRAR FILTROS
// ==========================================

const dadosBusca = document.getElementById("dadosBusca");

if (busca) {
  dadosBusca.innerHTML = `

        <p>
            <strong>Tipo:</strong>
            ${busca.tipo}
        </p>

        <p>
            <strong>Matéria:</strong>
            ${busca.materia}
        </p>

        <p>
            <strong>Nível:</strong>
            ${busca.nivel}
        </p>

        <p>
            <strong>Período:</strong>
            ${busca.periodo}
        </p>

        <p>
            <strong>Dias:</strong>
            ${busca.dias.join(", ")}
        </p>

    `;
}

// ==========================================
// MATCHES MOCKADOS
// FUTURAMENTE VIRÃO DA API
// ==========================================

const matches = [
  {
    id: 1,
    nome: "Ana Souza",
    tipo: "Professora",
    materia: "Inglês",
    nivel: "Intermediário",
    periodo: "Noite",
    dias: ["Seg", "Qua", "Sex"],
    foto: "https://i.pravatar.cc/300?img=5",
  },

  {
    id: 2,
    nome: "Lucas Silva",
    tipo: "Aluno",
    materia: "Matemática",
    nivel: "Iniciante",
    periodo: "Tarde",
    dias: ["Ter", "Qui"],
    foto: "https://i.pravatar.cc/300?img=8",
  },

  {
    id: 3,
    nome: "Fernanda Costa",
    tipo: "Professora",
    materia: "História",
    nivel: "Avançado",
    periodo: "Noite",
    dias: ["Seg", "Ter", "Qui"],
    foto: "https://i.pravatar.cc/300?img=9",
  },

  {
    id: 4,
    nome: "Carlos Lima",
    tipo: "Professor",
    materia: "Inglês",
    nivel: "Intermediário",
    periodo: "Noite",
    dias: ["Seg", "Ter", "Qui"],
    foto: "https://i.pravatar.cc/300?img=12",
  },
];

// ==========================================
// CALCULAR COMPATIBILIDADE
// ==========================================

function calcularCompatibilidade(match) {
  let pontos = 0;

  // Matéria

  if (busca.materia.toLowerCase().includes(match.materia.toLowerCase())) {
    pontos += 40;
  }

  // Nível

  if (busca.nivel === match.nivel) {
    pontos += 20;
  }

  // Período

  if (busca.periodo === match.periodo) {
    pontos += 20;
  }

  // Dias

  const diasComuns = busca.dias.filter((dia) => match.dias.includes(dia));

  pontos += diasComuns.length * 5;

  if (pontos > 100) {
    pontos = 100;
  }

  return pontos;
}

// ==========================================
// LISTA MATCHES
// ==========================================

const lista = document.getElementById("listaMatches");

matches.forEach((match) => {
  const compatibilidade = calcularCompatibilidade(match);

  lista.innerHTML += `

        <div class="match-card">

            <div class="match-top">

                <img
                    src="${match.foto}"
                    alt="${match.nome}"
                >

                <h3>
                    ${match.nome}
                </h3>

                <span>
                    ${match.tipo}
                </span>

            </div>

            <div class="match-body">

                <p>
                    📚 ${match.materia}
                </p>

                <p>
                    🎓 ${match.nivel}
                </p>

                <p>
                    📅 ${match.dias.join(", ")}
                </p>

                <p>
                    ⏰ ${match.periodo}
                </p>

                <div class="compatibilidade">

                    <strong>
                        ${compatibilidade}% Compatível
                    </strong>

                    <div class="progress">

                        <div
                            class="progress-fill"
                            style="
                            width:${compatibilidade}%">
                        </div>

                    </div>

                </div>

                <div class="match-actions">

                    <button
                        class="btn-perfil"
                        onclick="
                        abrirPerfil(${match.id})
                        ">

                        Ver Perfil

                    </button>

                    <button
                        class="btn-conectar">

                        Conectar

                    </button>

                </div>

            </div>

        </div>

    `;
});

// ==========================================
// PERFIL PÚBLICO
// ==========================================

function abrirPerfil(id) {
  localStorage.setItem("perfilSelecionado", id);

  window.location.href = "perfil-publico.html";
}

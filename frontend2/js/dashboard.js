// Simulação temporária
// Depois virá do backend

const usuario = {
  nome: "Maria Heloisa",
  tipo: "Professor",
  foto: "https://i.pravatar.cc/100",
};

document.getElementById("nomeUsuario").textContent = usuario.nome;

document.getElementById("tipoUsuario").textContent = usuario.tipo;

document.getElementById("fotoUsuario").src = usuario.foto;

document.getElementById("tituloBoasVindas").textContent =
  `Olá, ${usuario.nome}!`;

// Dados simulados

document.getElementById("ultimaAula").textContent = "Introdução ao JavaScript";

document.getElementById("ultimoProfessor").textContent = "Com João Silva";

document.getElementById("proximaData").textContent = "Amanhã • 19:00";

document.getElementById("proximaMateria").textContent = "React Básico";

document.getElementById("proximoProfessor").textContent = "Carlos Mendes";

const toggleMenu = document.getElementById("toggleMenu");

const sidebar = document.getElementById("sidebar");

toggleMenu.addEventListener("click", () => {
  sidebar.classList.toggle("closed");
});

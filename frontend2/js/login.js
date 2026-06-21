const togglePassword = document.getElementById("togglePassword");

const senha = document.getElementById("senha");

togglePassword.addEventListener("click", () => {
  if (senha.type === "password") {
    senha.type = "text";
    togglePassword.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
  } else {
    senha.type = "password";
    togglePassword.innerHTML = '<i class="fa-solid fa-eye"></i>';
  }
});

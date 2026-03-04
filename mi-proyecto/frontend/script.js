// script.js
document.addEventListener("DOMContentLoaded", function() {
  // ====== Secciones ======
  const registerSection = document.getElementById("registerSection");
  const loginSection = document.getElementById("loginSection");
  const notesSection = document.getElementById("notesSection");

  // ====== Formularios y botones ======
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const addBtn = document.getElementById("addNote");
  const logoutBtn = document.getElementById("logout");
  const goLogin = document.getElementById("goLogin");
  const goRegister = document.getElementById("goRegister");

  // ====== Inputs ======
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginUserInput = document.getElementById("loginUser");
  const loginPassInput = document.getElementById("loginPass");
  const noteContentInput = document.getElementById("noteContent");
  const notesList = document.getElementById("notesList");

  const API = "http://localhost:3000/api";

  function showSection(section) {
    registerSection.classList.add("hidden");
    loginSection.classList.add("hidden");
    notesSection.classList.add("hidden");
    section.classList.remove("hidden");
  }

  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    showSection(notesSection);
    fetchNotes();
  } else {
    showSection(registerSection);
  }

  // ===== Navegación interna =====
  goLogin.addEventListener("click", e => { e.preventDefault(); showSection(loginSection); });
  goRegister.addEventListener("click", e => { e.preventDefault(); showSection(registerSection); });

  // ===== Registro =====
  registerForm.addEventListener("submit", async e => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username || !password) { alert("Usuario o contraseña vacíos"); return; }

    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("currentUser", username);
        showSection(notesSection);
        fetchNotes();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error conectando con el servidor");
    }
  });

  // ===== Login =====
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const username = loginUserInput.value.trim();
    const password = loginPassInput.value.trim();
    if (!username || !password) { alert("Usuario o contraseña vacíos"); return; }

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("currentUser", username);
        showSection(notesSection);
        fetchNotes();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error conectando con el servidor");
    }
  });

  // ===== Notas =====
  addBtn.addEventListener("click", async () => {
    const content = noteContentInput.value.trim();
    const user = localStorage.getItem("currentUser");
    if (!content) { alert("Escribe algo antes de añadir la nota"); return; }
    try {
      const res = await fetch(`${API}/notes/${user}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({content})
      });
      if (res.ok) {
        noteContentInput.value = "";
        fetchNotes();
      }
    } catch (err) { console.error(err); }
  });

  async function fetchNotes() {
    const user = localStorage.getItem("currentUser");
    notesList.innerHTML = "";
    try {
      const res = await fetch(`${API}/notes/${user}`);
      const data = await res.json();
      data.notes.forEach((note, index) => {
        const li = document.createElement("li");
        li.textContent = note;
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-sm btn-danger";
        delBtn.textContent = "Eliminar";
        delBtn.addEventListener("click", async () => {
          await fetch(`${API}/notes/${user}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({index})
          });
          fetchNotes();
        });

        li.appendChild(delBtn);
        notesList.appendChild(li);
      });
    } catch (err) { console.error(err); }
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    showSection(loginSection);
  });

});
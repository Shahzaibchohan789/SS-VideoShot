// ==========================
// Global Script: global.js
// ==========================

// --------------------------
// AUTH AREA
// --------------------------
const authArea = document.getElementById("authArea");
let user = JSON.parse(localStorage.getItem("currentUser")) || null;

function renderAuth() {
  if (!authArea) return;

  if (user) {
    authArea.innerHTML = `
      <span class="username">👤 ${user.name}</span>
      <button onclick="logout()" class="logout-btn">Logout</button>
    `;
  } else {
    authArea.innerHTML = `<a href="signin.html" class="signin-link">Sign In</a>`;
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  location.href = "signin.html";
}

renderAuth();

// ==========================
// SIGN UP
// ==========================
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("suName").value.trim();
    const email = document.getElementById("suEmail").value.trim();
    const pass = document.getElementById("suPass").value.trim();
    if (!name || !email || !pass) return alert("All fields are required!");

    let users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u) => u.email === email)) return alert("Email already exists!");

    const newUser = { name, email, pass };
    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    alert("Signup successful!");
    location.href = "index.html";
  });
}

// ==========================
// SIGN IN
// ==========================
const signinForm = document.getElementById("signinForm");
if (signinForm) {
  signinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("siEmail").value.trim();
    const pass = document.getElementById("siPass").value.trim();

    let users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u) => u.email === email && u.pass === pass);

    if (!found) return alert("Invalid login credentials!");
    localStorage.setItem("currentUser", JSON.stringify(found));

    alert("Welcome back!");
    location.href = "index.html";
  });
}

// ==========================
// UPLOAD POST
// ==========================
const uploadForm = document.getElementById("uploadForm");
if (uploadForm) {
  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return alert("Please login first!");

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    const caption = document.getElementById("caption").value.trim();
    if (!file) return alert("Please select a file!");

    // Detect file type
    let type = file.type.startsWith("image") ? "image"
             : file.type.startsWith("video") ? "video"
             : null;
    if (!type) {
      const ext = file.name.split(".").pop().toLowerCase();
      const imgExts = ["jpg","jpeg","png","gif","webp"];
      const vidExts = ["mp4","mov","webm","ogg"];
      if (imgExts.includes(ext)) type = "image";
      else if (vidExts.includes(ext)) type = "video";
      else return alert("Unsupported file type!");
    }

    const maxSizeMB = 50;
    if (file.size / (1024 * 1024) > maxSizeMB) return alert("File too large! Max 50MB allowed.");

    let posts = JSON.parse(localStorage.getItem("posts") || "[]");

    if (type === "image") {
      const reader = new FileReader();
      reader.onload = function() {
        posts.unshift({
          src: reader.result,
          type,
          caption,
          user: user.name,
          likes: 0,
          time: new Date().toLocaleString(),
        });
        localStorage.setItem("posts", JSON.stringify(posts));
        alert("Image uploaded successfully!");
        fileInput.value = "";
        document.getElementById("caption").value = "";
        renderPosts("gallery");
        renderPosts("userGallery", true);
      };
      reader.readAsDataURL(file);
    } else if (type === "video") {
      const videoURL = URL.createObjectURL(file);
      posts.unshift({
        src: videoURL,
        type,
        caption,
        user: user.name,
        likes: 0,
        time: new Date().toLocaleString(),
      });
      localStorage.setItem("posts", JSON.stringify(posts));
      alert("Video uploaded successfully!");
      fileInput.value = "";
      document.getElementById("caption").value = "";
      renderPosts("gallery");
      renderPosts("userGallery", true);
    }
  });
}

// ==========================
// RENDER POSTS
// ==========================
function renderPosts(targetId, onlyUser = false) {
  const el = document.getElementById(targetId);
  if (!el) return;

  let posts = JSON.parse(localStorage.getItem("posts") || "[]");
  if (onlyUser && user) posts = posts.filter((p) => p.user === user.name);

  if (posts.length === 0) {
    el.innerHTML = "<p class='no-posts'>No posts yet!</p>";
    return;
  }

  el.innerHTML = posts
    .map(
      (p, i) => `
      <div class="card">
        ${
          p.type === "image"
            ? `<img src="${p.src}" alt="post" />`
            : `<video controls src="${p.src}"></video>`
        }
        <div class="post-info">
          <p><b>${p.user}</b> — ${p.caption || ""}</p>
          <small>${p.time}</small>
        </div>
        <div class="actions">
          <button onclick="likePost(${i})">❤️ ${p.likes || 0}</button>
          <button onclick="sharePost(${i})">🔗 Share</button>
        </div>
      </div>
    `
    )
    .join("");
}

// ==========================
// LIKE / SHARE
// ==========================
function likePost(i) {
  let posts = JSON.parse(localStorage.getItem("posts") || "[]");
  posts[i].likes = (posts[i].likes || 0) + 1;
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts("gallery");
  renderPosts("userGallery", true);
}

function sharePost(i) {
  const posts = JSON.parse(localStorage.getItem("posts") || "[]");
  navigator.clipboard.writeText(posts[i].src);
  alert("Post link copied!");
}

// ==========================
// DARK MODE TOGGLE
// ==========================
const toggleBtn = document.getElementById("modeToggle");
if (toggleBtn) {
  const darkEnabled = localStorage.getItem("dark") === "true";
  if (darkEnabled) {
    document.body.classList.add("dark");
    toggleBtn.textContent = "☀️";
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("dark", isDark);
    toggleBtn.textContent = isDark ? "☀️" : "🌙";
  });
}

// ==========================
// INITIAL RENDER
// ==========================
renderPosts("gallery");
renderPosts("userGallery", true);

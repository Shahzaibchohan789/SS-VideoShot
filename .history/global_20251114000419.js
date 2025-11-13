// ---------- Auth Area ----------
const authArea = document.getElementById('authArea');
const user = JSON.parse(localStorage.getItem('currentUser'));

function renderAuth() {
  if (!authArea) return;
  if (user) {
    authArea.innerHTML = `<span>${user.name}</span> <button onclick="logout()">Logout</button>`;
  } else {
    authArea.innerHTML = `<a href='signin.html'>Sign In</a>`;
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  location.href = 'signin.html';
}

renderAuth();

// ---------- Upload Logic ----------
const uploadForm = document.getElementById('uploadForm');

if (uploadForm) {
  uploadForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!user) return alert('Please login first.');

    const file = document.getElementById('fileInput').files[0];
    const caption = document.getElementById('caption').value.trim();

    if (!file) return alert('Please select a file');

    const reader = new FileReader();
    reader.onload = () => {
      const posts = JSON.parse(localStorage.getItem('posts') || '[]');
      const newPost = {
        src: reader.result,
        type: file.type,
        caption,
        user: user.name,
        likes: 0,
        time: new Date().toLocaleString()
      };
      posts.unshift(newPost);
      localStorage.setItem('posts', JSON.stringify(posts));
      alert('Upload successful ✅');
      location.href = 'index.html';
    };
    reader.readAsDataURL(file);
  });
}

// ---------- Feed Rendering ----------
function renderPosts(targetId, onlyUser = false) {
  const el = document.getElementById(targetId);
  if (!el) return;

  let posts = JSON.parse(localStorage.getItem('posts') || '[]');
  if (onlyUser && user) posts = posts.filter(p => p.user === user.name);

  el.innerHTML = posts
    .map(
      (p, i) => `
      <div class='card'>
        ${
          p.type.startsWith('image')
            ? `<img src='${p.src}' alt='post'/>`
            : `<video controls src='${p.src}'></video>`
        }
        <p><b>${p.user}</b> — ${p.caption || ''}</p>
        <div class='actions'>
          <button onclick='likePost(${i})'>❤️ ${p.likes || 0}</button>
          <button onclick='sharePost(${i})'>🔗 Share</button>
        </div>
      </div>`
    )
    .join('');
}

function likePost(i) {
  const posts = JSON.parse(localStorage.getItem('posts') || '[]');
  posts[i].likes = (posts[i].likes || 0) + 1;
  localStorage.setItem('posts', JSON.stringify(posts));
  renderPosts('gallery');
  renderPosts('userGallery', true);
}

function sharePost(i) {
  const posts = JSON.parse(localStorage.getItem('posts') || '[]');
  navigator.clipboard.writeText(posts[i].src);
  alert('Post link copied ✅');
}

// ---------- Dark Mode ----------
const toggleBtn = document.getElementById('modeToggle');
if (toggleBtn) {
  if (localStorage.getItem('dark') === 'true') document.body.classList.add('dark');

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('dark', document.body.classList.contains('dark'));
    toggleBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  });
}

// Render posts on home and dashboard
renderPosts('gallery');
renderPosts('userGallery', true);

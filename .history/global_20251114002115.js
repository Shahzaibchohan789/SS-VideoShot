// Auth + LocalStorage + Posts + Dark Mode
const authArea = document.getElementById('authArea');
const user = JSON.parse(localStorage.getItem('currentUser'));

// Render Auth
function renderAuth(){
  if(!authArea) return;
  if(user){
    authArea.innerHTML = `<span>${user.name}</span> <button onclick="logout()">Logout</button>`;
  } else {
    authArea.innerHTML = `<a href='signin.html'>Sign In</a>`;
  }
}
function logout(){
  localStorage.removeItem('currentUser');
  location.href='signin.html';
}
renderAuth();

// Signup
const signupForm = document.getElementById('signupForm');
if(signupForm){
  signupForm.addEventListener('submit', e=>{
    e.preventDefault();
    const name = document.getElementById('suName').value;
    const email = document.getElementById('suEmail').value;
    const pass = document.getElementById('suPass').value;
    let users = JSON.parse(localStorage.getItem('users')||'[]');
    if(users.find(u=>u.email===email)) return alert('Email already exists');
    const newUser = {name,email,pass};
    users.push(newUser);
    localStorage.setItem('users',JSON.stringify(users));
    localStorage.setItem('currentUser',JSON.stringify(newUser));
    location.href='index.html';
  });
}

// Signin
const signinForm = document.getElementById('signinForm');
if(signinForm){
  signinForm.addEventListener('submit', e=>{
    e.preventDefault();
    const email = document.getElementById('siEmail').value;
    const pass = document.getElementById('siPass').value;
    let users = JSON.parse(localStorage.getItem('users')||'[]');
    const found = users.find(u=>u.email===email && u.pass===pass);
    if(!found) return alert('Invalid login');
    localStorage.setItem('currentUser',JSON.stringify(found));
    location.href='index.html';
  });
}

// Upload
const uploadForm = document.getElementById('uploadForm');
if(uploadForm){
  uploadForm.addEventListener('submit', e=>{
    e.preventDefault();
    if(!user) return alert('Login required');
    const file = document.getElementById('fileInput').files[0];
    const caption = document.getElementById('caption').value;
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      let posts = JSON.parse(localStorage.getItem('posts')||'[]');
      const newPost = {src:reader.result,type:file.type,caption,user:user.name,likes:0};
      posts.unshift(newPost);
      localStorage.setItem('posts',JSON.stringify(posts));
      location.href='index.html';
    };
    reader.readAsDataURL(file);
  });
}

// Render Feed
function renderPosts(targetId, onlyUser=false){
  const el = document.getElementById(targetId);
  if(!el) return;
  let posts = JSON.parse(localStorage.getItem('posts')||'[]');
  if(onlyUser && user){ posts = posts.filter(p=>p.user===user.name); }
  el.innerHTML = posts.map((p,i)=>`
    <div class='card'>
      ${p.type.startsWith('image')?`<img src='${p.src}'/>`:`<video controls src='${p.src}'></video>`}
      <p><b>${p.user}</b> — ${p.caption||''}</p>
      <div class='actions'>
        <button onclick='likePost(${i})'>❤️ ${p.likes||0}</button>
        <button onclick='sharePost(${i})'>🔗 Share</button>
      </div>
    </div>`).join('');
}
function likePost(i){
  let posts = JSON.parse(localStorage.getItem('posts')||'[]');
  posts[i].likes = (posts[i].likes||0)+1;
  localStorage.setItem('posts',JSON.stringify(posts));
  renderPosts('gallery');renderPosts('userGallery',true);
}
function sharePost(i){
  const posts = JSON.parse(localStorage.getItem('posts')||'[]');
  navigator.clipboard.writeText(posts[i].src);
  alert('Post link copied!');
}
renderPosts('gallery');
renderPosts('userGallery',true);

// Dark mode toggle
const toggleBtn = document.getElementById('modeToggle');
if(toggleBtn){
  if(localStorage.getItem('dark')==='true'){document.body.classList.add('dark');}
  toggleBtn.addEventListener('click',()=>{
    document.body.classList.toggle('dark');
    localStorage.setItem('dark',document.body.classList.contains('dark'));
    toggleBtn.textContent=document.body.classList.contains('dark')?'☀️':'🌙';
  });
}

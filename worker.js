// Cloudflare Workers - 用户认证 API
const API_ORIGIN = 'https://xyy-website.y434786896.workers.dev';

const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>用户中心 - 小一二官网</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root { --primary: #667eea; --secondary: #764ba2; --dark: #1a202c; --light: #f7fafc; --text: #4a5568; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); min-height: 100vh; color: var(--text); }
    .header { background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white; padding: 15px 20px; }
    .header a { color: white; text-decoration: none; }
    .container { max-width: 400px; margin: 50px auto; padding: 20px; }
    .card { background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    h1 { text-align: center; margin-bottom: 30px; color: var(--dark); }
    input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; }
    button { width: 100%; padding: 12px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
    button:hover { opacity: 0.9; }
    .link { text-align: center; margin-top: 15px; }
    .link a { color: var(--primary); text-decoration: none; }
    .error { color: red; text-align: center; margin-bottom: 15px; }
    .user-info { text-align: center; }
    .user-info img { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 15px; object-fit: cover; }
    .user-info h2 { margin-bottom: 10px; }
    .user-info p { color: #666; margin-bottom: 20px; }
    .logout { background: #e53e3e; }
  </style>
</head>
<body>
  <div class="header">
    <a href="https://y434786896-collab.github.io/xyy-website/">← 返回首页</a>
  </div>
  <div class="container">
    <div class="card" id="content"></div>
  </div>
  <script>
    const API = '${API_ORIGIN}';
    let currentUser = null;

    function init() {
      const token = localStorage.getItem("token");
      if (token && (window.location.hash === "#register" || window.location.hash === "#login")) { window.location.href = "https://y434786896-collab.github.io/xyy-website/"; return; }
      if (window.location.hash === '#register') showRegister();
      else if (window.location.hash === '#login') showLogin();
      else checkAuth();
    }

    async function checkAuth() {
      const token = localStorage.getItem('token');
      if (!token) { showLogin(); return; }
      try {
        const res = await fetch(API + '/api/me', { headers: { 'Authorization': 'Bearer ' + token } });
        if (res.ok) { currentUser = await res.json(); showUserCenter(); }
        else { localStorage.removeItem('token'); showLogin(); }
      } catch (e) { showLogin(); }
    }

    function showLogin() { const token = localStorage.getItem("token"); if (token) { window.location.href = "https://y434786896-collab.github.io/xyy-website/"; return; }
      document.getElementById('content').innerHTML = '<h1>登录</h1><div class="error" id="error"></div><input type="text" id="login-username" placeholder="用户名"><input type="password" id="login-password" placeholder="密码"><button onclick="doLogin()">登录</button><div class="link">没有账号？<a href="#register">立即注册</a></div>';
    }

    function showRegister() { const token = localStorage.getItem("token"); if (token) { window.location.href = "https://y434786896-collab.github.io/xyy-website/"; return; }
      document.getElementById('content').innerHTML = '<h1>注册</h1><div class="error" id="error"></div><input type="text" id="reg-username" placeholder="用户名"><input type="password" id="reg-password" placeholder="密码"><button onclick="doRegister()">注册</button><div class="link">已有账号？<a href="#login">立即登录</a></div>';
    }

    function showUserCenter() {
      const avatar = currentUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + currentUser.username;
      const created = new Date(currentUser.created_at).toLocaleDateString();
      document.getElementById('content').innerHTML = '<div class="user-info"><img src="' + avatar + '" alt="头像"><h2>' + currentUser.username + '</h2><p>注册时间：' + created + '</p><button class="logout" onclick="doLogout()">退出登录</button></div>';
    }

    async function doLogin() {
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      try {
        const res = await fetch(API + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
        const data = await res.json();
        if (res.ok) { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); window.location.href = 'https://y434786896-collab.github.io/xyy-website/'; }
        else { document.getElementById('error').textContent = data.error || '登录失败'; }
      } catch (e) { document.getElementById('error').textContent = '网络错误'; }
    }

    async function doRegister() {
      const username = document.getElementById('reg-username').value.trim();
      const password = document.getElementById('reg-password').value;
      const error = document.getElementById('error');
      
      if (!username || !password) {
        error.textContent = '请填写用户名和密码';
        return;
      }
      if (username.length < 2 || username.length > 20 || username.includes(' ')) {
        error.textContent = '用户名需要2-20个字符，且不能包含空格';
        return;
      }
      if (password.length < 6 || password.includes(' ')) {
        error.textContent = '密码至少需要6位，且不能包含空格';
        return;
      }

      try {
        const res = await fetch(API + '/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
        const data = await res.json();
        if (res.ok) { alert('注册成功！请登录'); window.location.hash = '#login'; showLogin(); }
        else { error.textContent = data.error || '注册失败'; }
      } catch (e) { error.textContent = '网络错误'; }
    }

    function doLogout() { localStorage.removeItem('token'); showLogin(); }

    window.addEventListener('hashchange', init);
    init();
  </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: { 
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
          'Access-Control-Allow-Headers': 'Content-Type, Authorization' 
        }
      });
    }

    if (path === '/api/register' && request.method === 'POST') {
      try {
        const { username, password } = await request.json();
        
        if (!username || !password) {
          return new Response(JSON.stringify({ error: '请填写用户名和密码' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
        
        if (username.length < 2 || username.length > 20 || username.includes(' ')) {
          return new Response(JSON.stringify({ error: '用户名需要2-20个字符' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
        
        if (password.length < 6 || password.includes(' ')) {
          return new Response(JSON.stringify({ error: '密码至少需要6位' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
        
        const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
        if (existing) {
          return new Response(JSON.stringify({ error: '用户名已存在' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        await env.DB.prepare('INSERT INTO users (username, password) VALUES (?, ?)').bind(username, password).run();
        return new Response(JSON.stringify({ message: '注册成功' }), { status: 201, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
    }

    if (path === '/api/login' && request.method === 'POST') {
      try {
        const { username, password } = await request.json();
        const user = await env.DB.prepare('SELECT * FROM users WHERE username = ? AND password = ?').bind(username, password).first();
        if (!user) {
          return new Response(JSON.stringify({ error: '用户名或密码错误' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
        const token = btoa(JSON.stringify({ id: user.id, username: user.username }));
        return new Response(JSON.stringify({ token, user: { id: user.id, username: user.username, avatar: user.avatar, created_at: user.created_at } }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
    }

    if (path === '/api/me' && request.method === 'GET') {
      try {
        const auth = request.headers.get('Authorization');
        if (!auth) {
          return new Response(JSON.stringify({ error: '未授权' }), { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
        const token = auth.replace('Bearer ', '');
        const payload = JSON.parse(atob(token));
        const user = await env.DB.prepare('SELECT id, username, avatar, created_at FROM users WHERE id = ?').bind(payload.id).first();
        if (!user) {
          return new Response(JSON.stringify({ error: '用户不存在' }), { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }
        return new Response(JSON.stringify(user), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      }
    }

    return new Response(HTML, { headers: { 'Content-Type': 'text/html' } });
  }
};

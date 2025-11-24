// Admin credentials key: "admin_user" & "admin_pass", adminLogged: "adminLogged"

// Initialize default admin if not set (one-time)
function adminInit(){
  if(localStorage.getItem("admin_user")){
    alert("Admin already initialized. Use Admin Login.");
    return;
  }
  const defUser = "admin";
  const defPass = "admin123";
  localStorage.setItem("admin_user", defUser);
  localStorage.setItem("admin_pass", defPass);
  alert(`Admin initialized.\nUsername: ${defUser}\nPassword: ${defPass}`);
}

// Admin login
function adminLogin(){
  const user = document.getElementById("adminUser").value.trim();
  const pass = document.getElementById("adminPass").value.trim();

  const aUser = localStorage.getItem("admin_user");
  const aPass = localStorage.getItem("admin_pass");

  if(!aUser || !aPass){
    alert("Admin not initialized. Click Init Admin to create default admin.");
    return;
  }
  if(user === aUser && pass === aPass){
    localStorage.setItem("adminLogged", "true");
    showAdminPanel();
  } else {
    alert("Invalid admin credentials");
  }
}

function adminLogout(){
  localStorage.removeItem("adminLogged");
  window.location.href = "admin.html";
}

function showAdminPanel(){
  document.getElementById("admin-login-wrap").classList.add("hide");
  document.getElementById("admin-panel").classList.remove("hide");
  refreshStats();
  refreshQuestionList();
}

// If already adminLogged, show panel
if(window.location.pathname.endsWith("admin.html")){
  if(localStorage.getItem("adminLogged") === "true"){
    // show panel
    setTimeout(() => showAdminPanel(), 50);
  }
}

// ---------------- Questions storage helpers ----------------
function loadExtraQuestions(){ return JSON.parse(localStorage.getItem("extraQuestions")) || []; }
function saveExtraQuestions(arr){ localStorage.setItem("extraQuestions", JSON.stringify(arr)); }

// Add question
function addQuestion(){
  const q = document.getElementById("qText").value.trim();
  const o1 = document.getElementById("opt1").value.trim();
  const o2 = document.getElementById("opt2").value.trim();
  const o3 = document.getElementById("opt3").value.trim();
  const o4 = document.getElementById("opt4").value.trim();
  const correct = document.getElementById("correct").value.trim();

  if(!q || !o1 || !o2 || !o3 || !o4 || !correct){
    alert("All fields required");
    return;
  }

  const newQ = { question: q, options: [o1,o2,o3,o4], answer: correct };
  const arr = loadExtraQuestions();
  arr.push(newQ);
  saveExtraQuestions(arr);

  // clear inputs
  document.getElementById("qText").value = "";
  document.getElementById("opt1").value = "";
  document.getElementById("opt2").value = "";
  document.getElementById("opt3").value = "";
  document.getElementById("opt4").value = "";
  document.getElementById("correct").value = "";

  refreshQuestionList();
  refreshStats();
  alert("Question added");
}

// Refresh list and show management UI
function refreshQuestionList(){
  const listWrap = document.getElementById("questionsList");
  listWrap.innerHTML = "";
  const arr = loadExtraQuestions();
  document.getElementById("countQuestions").innerText = arr.length + defaultQuestions.length;

  arr.forEach((q, idx) => {
    const item = document.createElement("div");
    item.className = "q-item";
    item.innerHTML = `
      <div class="q-text">
        <p><strong>Q${idx+1}.</strong> ${escapeHtml(q.question)}</p>
        <p class="muted">Options: ${escapeHtml(q.options.join(' | '))}</p>
        <p class="muted">Answer: ${escapeHtml(q.answer)}</p>
      </div>
      <div class="q-actions">
        <button onclick="editQuestion(${idx})">Edit</button>
        <button onclick="deleteQuestion(${idx})" class="btn-ghost">Delete</button>
      </div>
    `;
    listWrap.appendChild(item);
  });
}

// Delete
function deleteQuestion(index){
  if(!confirm("Delete this question?")) return;
  const arr = loadExtraQuestions();
  arr.splice(index,1);
  saveExtraQuestions(arr);
  refreshQuestionList();
  refreshStats();
}

// Edit (shows prompt-based editor)
function editQuestion(index){
  const arr = loadExtraQuestions();
  const q = arr[index];
  const newQ = prompt("Edit question text:", q.question);
  if(newQ === null) return; // cancelled
  const newO1 = prompt("Option 1:", q.options[0]); if(newO1 === null) return;
  const newO2 = prompt("Option 2:", q.options[1]); if(newO2 === null) return;
  const newO3 = prompt("Option 3:", q.options[2]); if(newO3 === null) return;
  const newO4 = prompt("Option 4:", q.options[3]); if(newO4 === null) return;
  const newAns = prompt("Correct answer (exact text):", q.answer); if(newAns === null) return;

  arr[index] = { question: newQ.trim(), options: [newO1.trim(),newO2.trim(),newO3.trim(),newO4.trim()], answer: newAns.trim() };
  saveExtraQuestions(arr);
  refreshQuestionList();
  refreshStats();
}

// ---------------- Dashboard & Stats ----------------
const defaultQuestions = [
  { question: "What is Manual Testing?", options: ["A","B","C","D"], answer: "B" },
  { question: "What is Smoke Testing?", options: ["A","B","C","D"], answer: "B" }
];

function refreshStats(){
  // total questions = default + extras
  const extra = loadExtraQuestions();
  const totalQ = defaultQuestions.length + extra.length;
  document.getElementById("totalQuestions").innerText = totalQ;

  // users: keys that start with "user_"
  const keys = Object.keys(localStorage).filter(k => k.startsWith("user_"));
  const users = keys.map(k => k.slice(5)); // usernames

  document.getElementById("totalUsers").innerText = users.length;

  // build top users list (best score pulled from username_scores)
  const topList = [];
  const recentAttempts = [];

  users.forEach(u => {
    const hist = JSON.parse(localStorage.getItem(u + "_scores")) || [];
    if(hist.length){
      const best = Math.max(...hist);
      topList.push({ user: u, best });
      // push recent attempts with timestamp if present
      // we store just score, but timestamp could be added later. For now use indices
      hist.slice(-3).forEach(s => recentAttempts.push({ user: u, score: s }));
    }
  });

  topList.sort((a,b) => b.best - a.best);
  const topUL = document.getElementById("topUsersList");
  topUL.innerHTML = "";
  topList.slice(0,8).forEach(t => {
    const li = document.createElement("li");
    li.innerText = `${t.user} — ${t.best}/${totalQ}`;
    topUL.appendChild(li);
  });

  // recent attempts
  recentAttempts.sort((a,b)=>0); // keep as is
  const ra = document.getElementById("recentAttempts");
  ra.innerHTML = "";
  recentAttempts.slice(-8).reverse().forEach(r => {
    const li = document.createElement("li");
    li.innerText = `${r.user} → ${r.score}/${totalQ}`;
    ra.appendChild(li);
  });

  // attempts chart: show number of attempts per user (bar chart)
  const attemptsCounts = users.map(u => {
    const hist = JSON.parse(localStorage.getItem(u + "_scores")) || [];
    return { user: u, count: hist.length };
  }).filter(x=>x.count>0);

  drawAttemptsChart(attemptsCounts);
}

// Simple bar chart using Canvas
function drawAttemptsChart(data){
  const canvas = document.getElementById("attemptChart");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(data.length === 0){
    ctx.fillStyle = "#666";
    ctx.font = "14px Arial";
    ctx.fillText("No attempts yet", 20, 60);
    return;
  }

  const pad = 30;
  const w = canvas.width - pad*2;
  const h = canvas.height - pad*2;
  const max = Math.max(...data.map(d=>d.count));
  const barW = Math.max(18, w / (data.length * 1.5));

  data.forEach((d, i) => {
    const x = pad + i * (barW + 12);
    const barH = (d.count / max) * (h - 20);
    // bar
    ctx.fillStyle = "#4a7cff";
    ctx.fillRect(x, pad + (h - barH), barW, barH);
    // label
    ctx.fillStyle = "#222";
    ctx.font = "12px Arial";
    ctx.fillText(d.user, x, pad + h + 16);
    // value
    ctx.fillStyle = "#000";
    ctx.fillText(d.count, x, pad + (h - barH) - 6);
  });
}

// ---------------- Export questions
function exportQuestions(){
  const full = [...defaultQuestions, ...loadExtraQuestions()];
  const dataStr = JSON.stringify(full, null, 2);
  const blob = new Blob([dataStr], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "questions.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------- Helpers ----------------
function escapeHtml(str){
  return (str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

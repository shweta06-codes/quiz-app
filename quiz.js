// Require login
if(!localStorage.getItem("loggedUser")){
  window.location.href = "index.html";
}

// Default questions (core) + extras from admin
const defaultQuestions = [
  {
    question: "1. What is Manual Testing?",
    options: [
      "Testing done by automation tools",
      "Testing performed manually without scripts",
      "Testing the performance of an application",
      "Testing only backend systems"
    ],
    answer: "Testing performed manually without scripts"
  },
  {
    question: "2. Exploratory testing is:",
    options: ["Planned with docs","Ad-hoc without docs","Performance only","Security check"],
    answer: "Ad-hoc without docs"
  }
];

const extraQ = JSON.parse(localStorage.getItem("extraQuestions")) || [];
const questions = [...defaultQuestions, ...extraQ];

let currentIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 15;

function startTimer(){
  clearInterval(timer);
  timeLeft = 15;
  document.getElementById("timer").innerText = timeLeft + "s";
  timer = setInterval(()=>{
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft + "s";
    if(timeLeft <= 0){
      clearInterval(timer);
      lockOptions();
      setTimeout(()=> nextQuestion(), 900);
    }
  },1000);
}

function loadQuestion(){
  clearInterval(timer);
  const q = questions[currentIndex];
  document.getElementById("question").innerText = q.question;

  const box = document.getElementById("options");
  box.innerHTML = "";
  q.options.forEach(opt=>{
    const b = document.createElement("button");
    b.innerText = opt;
    b.onclick = ()=> checkAnswer(b, opt);
    box.appendChild(b);
  });

  startTimer();
}

function checkAnswer(button, selected){
  clearInterval(timer);
  const correct = questions[currentIndex].answer;
  if(selected === correct){
    score++;
    button.classList.add("correct");
  } else {
    button.classList.add("wrong");
  }
  lockOptions();
}

function lockOptions(){
  document.querySelectorAll("#options button").forEach(btn=>{
    btn.disabled = true;
    if(btn.innerText === questions[currentIndex].answer) btn.classList.add("correct");
    else btn.classList.add("wrong");
  });
}

function nextQuestion(){
  clearInterval(timer);
  currentIndex++;
  if(currentIndex < questions.length){
    loadQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz(){
  // show score and save for user
  document.getElementById("quiz-wrap").classList.add("hide");
  document.getElementById("score-box").classList.remove("hide");

  const user = localStorage.getItem("loggedUser");
  const history = JSON.parse(localStorage.getItem(user + "_scores")) || [];
  history.push(score);
  localStorage.setItem(user + "_scores", JSON.stringify(history));

  // percent color
  const percent = Math.round((score / questions.length) * 100);
  const scoreElem = document.getElementById("score");
  scoreElem.innerText = `You scored ${score} out of ${questions.length} (${percent}%)`;
  if(percent >= 80) scoreElem.style.color = "#2ecc71";
  else if(percent >= 50) scoreElem.style.color = "#f1c40f";
  else scoreElem.style.color = "#e74c3c";
}

function restartQuiz(){
  currentIndex = 0;
  score = 0;
  document.getElementById("score-box").classList.add("hide");
  document.getElementById("quiz-wrap").classList.remove("hide");
  loadQuestion();
}

function logout(){
  localStorage.removeItem("loggedUser");
  window.location.href = "index.html";
}

// initial load
loadQuestion();

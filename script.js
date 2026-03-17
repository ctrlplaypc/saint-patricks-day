let players = 1
let currentPlayer = 1

let score1 = 0
let score2 = 0

let timer = null
let timeLeft = 10

let answered = false

let currentCorrect = 0

let gameMode = 0
let questionCount = 0

let perguntas = []

// 🔥 FALLBACK (caso JSON falhe)
let perguntasFallback = [
  {
    question: "Qual país comemora o St. Patrick’s Day?",
    options: ["Brasil","Irlanda","EUA","Canadá"],
    answer: "Irlanda"
  },
  {
    question: "Qual cor é símbolo do St. Patrick’s Day?",
    options: ["Azul","Verde","Vermelho","Amarelo"],
    answer: "Verde"
  }
]

const correctSound = new Audio("sounds/correct.mp3")
const wrongSound = new Audio("sounds/wrong.mp3")
const bgMusic = document.getElementById("bgMusic")

const questionEl = document.getElementById("question")
const answersEl = document.getElementById("answers")
const timerEl = document.getElementById("timer")
const statusEl = document.getElementById("status")

const score1El = document.getElementById("score1")
const score2El = document.getElementById("score2")
const score2box = document.getElementById("score2box")

function garantirFoco(){
  window.focus()
  document.body.setAttribute("tabindex","0")
  document.body.focus()
}

// 🔥 CARREGAR JSON COM SEGURANÇA
async function carregarPerguntas(){
  try{
    const res = await fetch("perguntas.json")
    perguntas = await res.json()
  }catch(e){
    console.error("Erro ao carregar JSON:", e)
    perguntas = perguntasFallback
  }
}

function startGame(n){
  players = n
  document.getElementById("modeSelect").style.display="block"
}

async function setMode(mode){

  gameMode = mode

  await carregarPerguntas()

  if(bgMusic){
    bgMusic.volume = 0.2
    bgMusic.play().catch(()=>{})
  }

  document.getElementById("setup").style.display="none"
  document.getElementById("game").style.display="block"

  garantirFoco()

  statusEl.innerText="Player 1 = setas | Player 2 = WASD"

  if(players === 1){
    score2box.style.display="none"
  }

  nextQuestion()
}

// 🎮 CONTROLES
document.addEventListener("keydown",(e)=>{

  if(answered) return

  if(players === 1){

    if(e.key==="ArrowUp") answer(0)
    if(e.key==="ArrowRight") answer(1)
    if(e.key==="ArrowDown") answer(2)
    if(e.key==="ArrowLeft") answer(3)

    return
  }

  if(currentPlayer===1){

    if(e.key==="ArrowUp") answer(0)
    if(e.key==="ArrowRight") answer(1)
    if(e.key==="ArrowDown") answer(2)
    if(e.key==="ArrowLeft") answer(3)

  }

  if(currentPlayer===2){

    if(e.key==="w" || e.key==="W") answer(0)
    if(e.key==="d" || e.key==="D") answer(1)
    if(e.key==="s" || e.key==="S") answer(2)
    if(e.key==="a" || e.key==="A") answer(3)

  }

})

// 🔥 USANDO JSON OU FALLBACK
function nextQuestion(){

  answered=false
  questionCount++

  statusEl.innerText="Player "+currentPlayer+" responda"

  let q = perguntas[Math.floor(Math.random()*perguntas.length)]

  let answers = [...q.options]
  answers.sort(()=>Math.random()-0.5)

  currentCorrect = answers.indexOf(q.answer)

  questionEl.innerText = q.question

  answersEl.innerHTML=""

  for(let i=0;i<answers.length;i++){

    let div=document.createElement("div")
    div.className="answer"

    div.innerText = String.fromCharCode(65+i)+") "+answers[i]

    answersEl.appendChild(div)

  }

  startTimer()
}

function startTimer(){

  timeLeft=10
  timerEl.innerText=timeLeft

  timer=setInterval(()=>{

    timeLeft--
    timerEl.innerText=timeLeft

    if(timeLeft<=0){

      clearInterval(timer)
      answered=true
      showCorrect()
      nextRound()

    }

  },1000)

}

function answer(index){

  if(answered) return

  answered=true
  clearInterval(timer)

  let options=document.querySelectorAll(".answer")

  if(index===currentCorrect){

    options[index].style.background="green"
    correctSound.play()

    let points=timeLeft

    if(currentPlayer===1){
      score1+=points
      score1El.innerText=score1
    }else{
      score2+=points
      score2El.innerText=score2
    }

  }else{

    options[index].style.background="red"
    options[currentCorrect].style.background="green"

    wrongSound.play()

    if(currentPlayer===1){
      score1=Math.max(0,score1-5)
      score1El.innerText=score1
    }else{
      score2=Math.max(0,score2-5)
      score2El.innerText=score2
    }

  }

  nextRound()
}

function showCorrect(){
  let options=document.querySelectorAll(".answer")
  options[currentCorrect].style.background="green"
}

function nextRound(){

  let count=3
  statusEl.innerText="Próxima pergunta em "+count

  let countdown=setInterval(()=>{

    count--

    if(count<=0){

      clearInterval(countdown)

      if(gameMode===10 && questionCount>=10) return endGame()
      if(gameMode===20 && questionCount>=20) return endGame()
      if(gameMode===100 && (score1>=100 || score2>=100)) return endGame()

      if(players===2){
        currentPlayer = currentPlayer===1 ? 2 : 1
      }

      nextQuestion()

    }else{
      statusEl.innerText="Próxima pergunta em "+count
    }

  },1000)

}

function endGame(){

  document.getElementById("game").style.display="none"
  document.getElementById("result").style.display="block"

  let text=""

  if(players===1){
    text="Pontuação final: "+score1
  }else{

    text="Player 1: "+score1+" pontos<br>Player 2: "+score2+" pontos"

    if(score1>score2) text+="<br><br>🏆 Player 1 venceu!"
    if(score2>score1) text+="<br><br>🏆 Player 2 venceu!"
    if(score1===score2) text+="<br><br>Empate!"
  }

  document.getElementById("finalScore").innerHTML=text
}
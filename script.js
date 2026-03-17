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

function startGame(n){
players = n
document.getElementById("modeSelect").style.display="block"
}

function setMode(mode){

gameMode = mode

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

// 🎮 CONTROLES (FINAL)
document.addEventListener("keydown",(e)=>{

if(answered) return

// 1 PLAYER
if(players === 1){

if(e.key==="ArrowUp") answer(0)
if(e.key==="ArrowRight") answer(1)
if(e.key==="ArrowDown") answer(2)
if(e.key==="ArrowLeft") answer(3)

return
}

// 2 PLAYERS

// PLAYER 1
if(currentPlayer===1){

if(e.key==="ArrowUp") answer(0)
if(e.key==="ArrowRight") answer(1)
if(e.key==="ArrowDown") answer(2)
if(e.key==="ArrowLeft") answer(3)

}

// PLAYER 2
if(currentPlayer===2){

if(e.key==="w" || e.key==="W") answer(0)
if(e.key==="d" || e.key==="D") answer(1)
if(e.key==="s" || e.key==="S") answer(2)
if(e.key==="a" || e.key==="A") answer(3)

}

})

async function nextQuestion(){

answered=false
questionCount++

statusEl.innerText="Player "+currentPlayer+" responda"

const categorias=[9,17,22,27]
let cat=categorias[Math.floor(Math.random()*categorias.length)]

const data = await fetch(`https://opentdb.com/api.php?amount=1&category=${cat}&type=multiple`)
const json = await data.json()

const q = json.results[0]

let answers=[...q.incorrect_answers]
answers.push(q.correct_answer)

answers.sort(()=>Math.random()-0.5)

currentCorrect = answers.indexOf(q.correct_answer)

questionEl.innerText = await traduzir(decode(q.question))

answersEl.innerHTML=""

for(let i=0;i<answers.length;i++){

let div=document.createElement("div")
div.className="answer"

let resposta = await traduzir(decode(answers[i]))

div.innerText = String.fromCharCode(65+i)+") "+resposta

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

function decode(str){
let txt=document.createElement("textarea")
txt.innerHTML=str
return txt.value
}

async function traduzir(texto){

try{

let url="https://api.mymemory.translated.net/get?q="+encodeURIComponent(texto)+"&langpair=en|pt-BR"

let res=await fetch(url)
let data=await res.json()

return data.responseData.translatedText

}catch{
return texto
}

}
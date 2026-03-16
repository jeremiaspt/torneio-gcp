const homeRaces = [

{sheet:"F25C", nome:"↩️ 25m COSTAS ♀️"},
{sheet:"M25C", nome:"↩️ 25m COSTAS ♂️"},

{sheet:"F25B", nome:"🐸 25m BRUÇOS ♀️"},
{sheet:"M25B", nome:"🐸 25m BRUÇOS ♂️"},

{sheet:"F25M", nome:"🦋 25m MARIPOSA ♀️"},
{sheet:"M25M", nome:"🦋 25m MARIPOSA ♂️"},

{sheet:"F25L", nome:"🏊 25m LIVRES ♀️"},
{sheet:"M25L", nome:"🏊 25m LIVRES ♂️"},

{sheet:"F50C", nome:"↩️ 50m COSTAS ♀️"},
{sheet:"M50C", nome:"↩️ 50m COSTAS ♂️"},

{sheet:"F50B", nome:"🐸 50m BRUÇOS ♀️"},
{sheet:"M50B", nome:"🐸 50m BRUÇOS ♂️"},

{sheet:"F50M", nome:"🦋 50m MARIPOSA ♀️"},
{sheet:"M50M", nome:"🦋 50m MARIPOSA ♂️"},

{sheet:"F50L", nome:"🏊 50m LIVRES ♀️"},
{sheet:"M50L", nome:"🏊 50m LIVRES ♂️"},

{sheet:"F100E", nome:"🔄 100m ESTILOS ♀️"},
{sheet:"M100E", nome:"🔄 100m ESTILOS ♂️"}

];

const spreadsheet="17xPSqXClyaxVtnntfR6tW8KxoxKnSwvKJN_XJUCEdys";

const resultsCache = {};
let currentSheet=null;
let currentButton=null;
let refreshCountdown=30;

/* ===============================
MENU MOBILE
=============================== */

function toggleMenu(){

const menu=document.querySelector(".menu");
const overlay=document.querySelector(".overlay");

menu.classList.toggle("open");
overlay.classList.toggle("show");

}

/* ===============================
BOTÃO ATIVO
=============================== */

function setActive(btn){

document.querySelectorAll(".menu button").forEach(b=>{
b.classList.remove("active");
});

if(btn) btn.classList.add("active");

}

/* ===============================
TEMPO CLASS
=============================== */
function getTempoClass(tempo){

if(!tempo) return "";

tempo = tempo.toString().toUpperCase();

if(tempo=="X") return "tempo-x";
if(tempo=="DNS") return "tempo-dns";
if(tempo=="DNF") return "tempo-dnf";
if(tempo=="DSQ") return "tempo-dsq";

return "";

}

/* ===============================
HOME
=============================== */

function loadHome(btn){

if(btn) setActive(btn);

history.replaceState(null,null,"index.html");

/* fechar menu mobile */
document.querySelector(".menu").classList.remove("open");
document.querySelector(".overlay").classList.remove("show");

/* mostrar coluna direita */
document.getElementById("rightColumn").style.display="block";

/* mostrar homepage */
document.getElementById("generalBox").style.display="block";
document.getElementById("raceBox").style.display="none";

document.getElementById("homePage").style.display="grid";

/* esconder resultados */

["cadetes","infantis","juvenis","juniores"].forEach(id=>{
document.getElementById(id).style.display="none";
document.getElementById(id).innerHTML="";
document.getElementById(id+"Title").style.display="none";
});

/* título */

document.getElementById("raceTitle").textContent="🏊 Torneio de Natação GCP";
document.getElementById("raceSub").textContent="Resumo da competição";

/* legenda */

document.querySelector(".race-legend").classList.add("legend-hidden");

/* ranking lateral */

document.getElementById("teamScores").innerHTML="";

/* carregar dados */

loadHomeData();

/* parar refresh de prova */

currentSheet=null;

document.querySelector(".race-title").scrollIntoView({
behavior:"smooth",
block:"start"
});

}

/* ===============================
DADOS HOMEPAGE
=============================== */

async function loadHomeData(){

try{

/* =====================
CLASSIFICAÇÃO GERAL
===================== */

const url=`https://opensheet.elk.sh/${spreadsheet}/M25L`;

const res = await fetch(url);
if(!res.ok) return;

const data=await res.json();

let total=[];
let section="race";

data.forEach(row=>{

const equipa=row["EQUIPA"];
const pontos=row["PONTOS"];

if(!equipa) return;

if(equipa==="EQUIPA") return;

if(equipa==="TOTAL"){
section="total";
return;
}

if(!isNaN(pontos) && section==="total"){

total.push({
equipa:equipa,
pontos:parseInt(pontos)
});

}

});

total.sort((a,b)=>b.pontos-a.pontos);

let html="<table class='team-table'>";
html+="<tr><th>Equipa</th><th>Pontos</th></tr>";

total.forEach((t,i)=>{

const gold = (i===0 && t.pontos>0) ? "team-gold" : "";

html+=`
<tr class="${gold}">
<td>${t.equipa}</td>
<td>${t.pontos}</td>
</tr>`;
});

html+="</table>";

document.getElementById("homeGeneral").innerHTML=html;


/* =====================
PONTUAÇÃO POR PROVA
===================== */

const scoreUrl=`https://opensheet.elk.sh/${spreadsheet}/SCOREBOARD`;

const resScore=await fetch(scoreUrl,{cache:"no-store"});
if(!resScore.ok) return;

const scoreData=await resScore.json();

let racesHtml="<div class='home-races-grid'>";

let currentRace="";
let teams=[];

function formatRaceTitle(title){

let t = title.toUpperCase();

t = t.replace("25M","25")
     .replace("50M","50")
     .replace("100M","100")

     .replace(" - FEMININO"," ♀️")
     .replace(" - MASCULINO"," ♂️")

     .replace("COSTAS","↩️ COSTAS")
     .replace("BRUÇOS","🐸 BRUÇOS")
     .replace("MARIPOSA","🦋 MARIPOSA")
     .replace("LIVRES","🏊 LIVRES")
     .replace("ESTILOS","🔄 ESTILOS");

return t;
}

function renderRace(){

if(!currentRace || teams.length===0) return;

teams.sort((a,b)=>b.pontos-a.pontos);

racesHtml+=`<div class="race-card"><h4>${formatRaceTitle(currentRace)}</h4>`;

teams.forEach((t,i)=>{

let medal="";
let cls="";

if(t.pontos>0){

if(i===0){medal="🥇";cls="gold";}
if(i===1){medal="🥈";cls="silver";}
if(i===2){medal="🥉";cls="bronze";}

}

racesHtml+=`
<div class="${cls}">
<span>${t.equipa} ${medal}</span>
<span>${t.pontos}</span>
</div>`;

});

racesHtml+="</div>";

}

scoreData.forEach(row=>{

const equipa=row["EQUIPA"];
const pontos=row["PONTOS"];

if(!equipa) return;

/* nova prova */

if(!pontos){

renderRace();

currentRace=equipa;
teams=[];
return;

}

/* ignorar cabeçalho */

if(equipa==="EQUIPA") return;

/* equipa válida */

if(!isNaN(pontos)){

teams.push({
equipa:equipa,
pontos:parseInt(pontos)
});

}

});

/* última prova */

renderRace();

racesHtml+="</div>";

document.getElementById("homeRaces").innerHTML=racesHtml;

}catch(e){

console.error("Erro homepage",e);

}

}

/* ===============================
CARREGAR PROVA
=============================== */

async function loadResults(sheet,btn,scroll=true){

document.querySelector(".teams-panel").style.display="block";

const legend = document.querySelector(".race-legend");

/* mostrar legenda */
document.getElementById("generalBox").style.display="none";
document.getElementById("raceBox").style.display="block";

legend.classList.remove("legend-hidden");

/* voltar a mostrar todos os elementos */

legend.querySelectorAll("span").forEach(el=>{
el.style.display="inline-block";
});

document.getElementById("homePage").style.display="none";

history.replaceState(null,null,"index.html?race="+sheet);

currentSheet = sheet;

if(btn){
currentButton = btn;
}

document.querySelector(".menu").classList.remove("open");
document.querySelector(".overlay").classList.remove("show");

if(btn) setActive(btn);

/* escalao */

let escalao="";

if(sheet.includes("25")) escalao="Cadetes / Infantis";
if(sheet.includes("50")) escalao="Juvenis / Juniores";
if(sheet.includes("100")) escalao="Todos os escalões";

/* carregar sheet */

const url=`https://opensheet.elk.sh/${spreadsheet}/${sheet}`;

let data;

const res = await fetch(url);

if(!res.ok){
console.error("Erro ao carregar sheet",sheet);
return;
}

data = await res.json();

/* arrays */

let cadetes=[],infantis=[],juvenis=[],juniores=[];
let raceTeams=[];
let totalTeams=[];
let teamSection="race";
let section="";

/* ===============================
LER DADOS
=============================== */

data.forEach(row=>{

const equipa=(row["EQUIPA"] ?? "").toString().trim();
const pontos=(row["PONTOS"] ?? "").toString().trim();

/* equipas */

if(equipa){

/* ignorar cabeçalho EQUIPA */

if(equipa==="EQUIPA"){
// não fazer nada
}

/* mudar para classificação geral */

else if(equipa==="TOTAL"){
teamSection="total";
}

/* ignorar título da prova */

else if(equipa.includes("25M")){
// não fazer nada
}

/* linha válida de pontuação */

else if(pontos!=="" && !isNaN(pontos)){

const t={
equipa:equipa,
pontos:parseInt(pontos)
};

if(teamSection==="race") raceTeams.push(t);
else totalTeams.push(t);

}

}

/* atletas */

const label=row["PROVA:"];

if(label==="CADETES") section="cadetes";
if(label==="INFANTIS") section="infantis";
if(label==="JUVENIS") section="juvenis";
if(label==="JUNIORES") section="juniores";

const values = Object.values(row);

/* garantir que é uma linha de atleta */

const numero = values[1];

if(!numero || isNaN(numero)) return;

const atleta={
numero: values[1],
nome: values[2],
clube: values[3],
tempo: values[4],
posicao: values[5],
pontos: values[0]
};

if(section==="cadetes") cadetes.push(atleta);
if(section==="infantis") infantis.push(atleta);
if(section==="juvenis") juvenis.push(atleta);
if(section==="juniores") juniores.push(atleta);

});

/* ===============================
FUNÇÕES
=============================== */

function medal(p){

if(!p) return "";

const pos = parseInt(p);

if(pos === 1) return "🥇";
if(pos === 2) return "🥈";
if(pos === 3) return "🥉";

return p;

}

function rankClass(p){

if(!p) return "";

const pos = parseInt(p);

if(pos === 1) return "rank1";
if(pos === 2) return "rank2";
if(pos === 3) return "rank3";

return "";

}

/* ===============================
TABELA ATLETAS
=============================== */

function build(rows){

let html="<table>";

html+="<tr><th class='center col-num'>Nº</th><th>Nome</th><th class='center col-clube'>Clube</th><th class='center col-tempo'>Tempo</th><th class='center col-pos'>Pos</th><th class='center col-pontos'>Pontos</th></tr>";

rows.forEach(r=>{

html+=`
<tr class="${rankClass(r.posicao)}">
<td class="center">${r.numero}</td>
<td>${r.nome}</td>
<td class="center">${r.clube}</td>
<td class="center col-tempo ${getTempoClass(r.tempo)}">${r.tempo}</td>
<td class="center">${medal(r.posicao)}</td>
<td class="center pontos-score">${r.pontos}</td>
</tr>
`;

});

html+="</table>";

return html;

}

/* ===============================
RENDER ESCALÕES
=============================== */

function render(name,data){

const table=document.getElementById(name);
const title=document.getElementById(name+"Title");

if(data.length){

title.style.display="block";
table.style.display="block";
table.innerHTML=build(data);

}else{

title.style.display="none";
table.style.display="none";

}

}

render("cadetes",cadetes);
render("infantis",infantis);
render("juvenis",juvenis);
render("juniores",juniores);

/* ===============================
EQUIPAS
=============================== */

raceTeams.sort((a,b)=>b.pontos-a.pontos);
totalTeams.sort((a,b)=>b.pontos-a.pontos);

function buildTeams(title,teams){

if(!teams.length) return "";

let html=`<h3>${title}</h3>`;
html+="<table class='team-table'>";
html+="<tr><th>Equipa</th><th>Pontos</th></tr>";

teams.forEach((t,i)=>{

const gold = (i===0 && parseInt(t.pontos) > 0) ? "team-gold" : "";

html+=`
<tr class="${gold}">
<td>${t.equipa}</td>
<td>${t.pontos}</td>
</tr>`;

});

html+="</table>";

return html;

}

const provaNome = currentButton ? currentButton.textContent.trim() : "Prova";
  
document.getElementById("teamScores").innerHTML=

buildTeams("Pontuação "+provaNome,raceTeams)+
buildTeams("🏆 Classificação Geral",totalTeams);

/* ===============================
INFO PROVA
=============================== */

const total=cadetes.length+infantis.length+juvenis.length+juniores.length;

if(btn){

document.getElementById("raceTitle").textContent=btn.textContent.trim();

document.getElementById("raceSub").textContent=
`${escalao} • ${total} atletas`;

}

/* ===============================
SCROLL PARA TOPO
=============================== */

if(scroll){
document.querySelector(".race-title").scrollIntoView({
behavior:"smooth",
block:"start"
});
}

/* ===============================
UPDATE TIMER
=============================== */

const now=new Date();

document.getElementById("lastUpdate").textContent=
now.toLocaleTimeString("pt-PT");

refreshCountdown=30;

}

/* ===============================
LOAD INICIAL
=============================== */

window.onload=()=>{

const params=new URLSearchParams(window.location.search);
const race=params.get("race");

if(race){

const btn=document.querySelector(
`button[onclick="loadResults('${race}',this)"]`
);

loadResults(race,btn);

}else{

const btn=document.getElementById("homeBtn");
loadHome(btn);

}

};

/* ===============================
AUTO REFRESH
=============================== */

async function autoRefresh(){

try{

if(currentSheet){
await loadResults(currentSheet,null,false);
}else{
await loadHomeData();
}

}catch(e){

console.error("Refresh error",e);

}

}

setInterval(autoRefresh,30000);

setInterval(()=>{

refreshCountdown--;

if(refreshCountdown<0) refreshCountdown=0;

document.getElementById("refreshTimer").textContent=refreshCountdown;

},1000);

const firebaseConfig = {
apiKey: "AIzaSyBYTx6s0XhoBblzvuGwrtmZfDn8Y7eeLsU",
authDomain: "gcp-scoreboard.firebaseapp.com",
databaseURL: "https://gcp-scoreboard-default-rtdb.europe-west1.firebasedatabase.app",
projectId: "gcp-scoreboard",
storageBucket: "gcp-scoreboard.firebasestorage.app",
messagingSenderId: "1080911760734",
appId: "1:1080911760734:web:9c81066ef9aac4cb6693cf"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const usersRef = db.ref("onlineUsers");

const userRef = usersRef.push();

userRef.set(true);

userRef.onDisconnect().remove();

usersRef.on("value", snapshot => {

const count = snapshot.numChildren();

document.getElementById("viewerCount").textContent =
"👥 "+count+" pessoas a acompanhar";

});

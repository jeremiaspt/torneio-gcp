let atletas = [];

async function loadAthletes(){

const url =
"https://opensheet.elk.sh/17xPSqXClyaxVtnntfR6tW8KxoxKnSwvKJN_XJUCEdys/DIPLOMAS";

const res = await fetch(url);

atletas = await res.json();

}

loadAthletes();


function searchAthlete(){

const input = document.getElementById("searchAthlete");

if(!input) return;

const q = input.value.trim().toLowerCase();

if(q.length < 2){
document.getElementById("athleteResults").innerHTML = "";
return;
}

const results = atletas.filter(a =>

(a["NOME"] && a["NOME"].toLowerCase().includes(q)) ||
(a["ATLETA Nº"] && a["ATLETA Nº"].toString().includes(q))

);

renderAthletes(results);

}


function renderAthletes(list){

const container = document.getElementById("athleteResults");

container.innerHTML = "";

list.slice(0,10).forEach(a => {

let html = `
<div class="athlete-card">

<h3>${a["NOME"]}</h3>

<div>
Nº ${a["ATLETA Nº"]} •
${a["CLUBE"]} •
${a["ESCALÃO"]}
</div>
`;

const provas = [

"25M LIVRES",
"50M LIVRES",
"25M MARIPOSA",
"50M MARIPOSA",
"25M COSTAS",
"50M COSTAS",
"25M BRUÇOS",
"50M BRUÇOS",
"100M ESTILOS"

];

provas.forEach(p => {

const tempo = a[p];

if(tempo && tempo !== "X"){

html += `
<div class="result-row">
<span>${p}</span>
<span>${tempo}</span>
</div>
`;

}

});

html += `
<button class="download-btn" onclick="gerarDiploma(${atletas.indexOf(a)})">
⬇️ Download Diploma
</button>

</div>
`;

container.innerHTML += html;

});

}

function normalize(str){
return str
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.trim()
.toUpperCase();
}

function getValue(obj,key){

const target = normalize(key);

const k = Object.keys(obj).find(
c => normalize(c) === target
);

return k ? obj[k] : "";

}

async function gerarDiploma(index){

const atleta = atletas[index];

console.log(atleta);

const template = document.getElementById("diplomaTemplate");

document.getElementById("pdfNome").textContent = getValue(atleta,"NOME");

const clube = atleta["CLUBE"] || "-";
const escalao = atleta["ESCALÃO"] || "-";
const genero = atleta["GÉNERO"] || "-";

document.getElementById("pdfInfo").textContent =
"Clube: " + clube + " • Escalão: " + escalao + " • Género: " + genero;

const resultados = document.getElementById("pdfResultados");

resultados.innerHTML="";

const provas=[

"25M LIVRES",
"50M LIVRES",
"25M MARIPOSA",
"50M MARIPOSA",
"25M COSTAS",
"50M COSTAS",
"25M BRUÇOS",
"50M BRUÇOS",
"100M ESTILOS"

];

provas.forEach(p=>{

const tempo = atleta[p];

if(tempo && tempo!=="X"){

resultados.innerHTML+=`
<div class="diploma-result">
<span>${p}</span>
<span>${tempo}</span>
</div>
`;

}

});

const canvas = await html2canvas(template);

const img = canvas.toDataURL("image/png");

const { jsPDF } = window.jspdf;

const pdf = new jsPDF("landscape");

pdf.addImage(img,"PNG",10,10,270,180);

pdf.save("diploma_"+atleta["NOME"]+".pdf");

}
const PROVAS = [
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

let atletas = [];

async function loadAthletes(){

const url =
"https://opensheet.elk.sh/17xPSqXClyaxVtnntfR6tW8KxoxKnSwvKJN_XJUCEdys/DIPLOMAS";

const res = await fetch(url);

const data = await res.json();

atletas = data.filter(a =>
PROVAS.some(p => isValidTime(a[p]))
);

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

function isValidTime(t){

if(!t) return false;

t = t.toString().trim().toUpperCase();

const invalid = ["X","DNF","DNS","DSQ",""];

if(invalid.includes(t)) return false;

// valida formato tempo: 0:00.00
return /^\d+:\d{2}\.\d{2}$/.test(t);

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

PROVAS.forEach(p => {

const tempo = a[p];

if(isValidTime(tempo)){

html += `
<div class="result-row">
<span>${p}</span>
<span>${tempo}</span>
</div>
`;

}

});

html += `
<button class="download-btn" onclick="gerarDiploma('${a["ATLETA Nº"]}')">
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

async function gerarDiploma(numero){

const atleta = atletas.find(a =>
a["ATLETA Nº"].toString() === numero.toString()
);

if(!atleta){
console.error("Atleta não encontrado");
return;
}

const template = document.getElementById("diplomaTemplate");

document.getElementById("pdfNome").textContent = getValue(atleta,"NOME");

const clube = atleta["CLUBE"] || "-";
const escalao = atleta["ESCALÃO"] || "-";
const genero = atleta["GÉNERO"] || "-";

document.getElementById("pdfInfo").textContent =
"Clube: " + clube + " • Escalão: " + escalao + " • Género: " + genero;

const resultados = document.getElementById("pdfResultados");

resultados.innerHTML="";

let listaResultados = [];

// recolher apenas as provas feitas
PROVAS.forEach(p=>{

const tempo = atleta[p];

if(isValidTime(tempo)){
listaResultados.push({prova:p, tempo:tempo});
}

});

// criar sempre 4 linhas fixas
for(let i=0;i<4;i++){

const linha = document.createElement("div");
linha.className="diploma-result";

if(listaResultados[i]){
linha.innerHTML=`
<span>${listaResultados[i].prova}</span>
<span>${listaResultados[i].tempo}</span>
`;
}else{
linha.innerHTML=`
<span>&nbsp;</span>
<span>&nbsp;</span>
`;
}

resultados.appendChild(linha);

}

const canvas = await html2canvas(template, {
  scale: 2,
  useCORS: true
});

const imgData = canvas.toDataURL("image/png");

const { jsPDF } = window.jspdf;

const pdf = new jspdf.jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
});

pdf.addImage(imgData, "PNG", 15, 15, 267, 180);
pdf.save("diploma_"+atleta["NOME"]+".pdf");

}

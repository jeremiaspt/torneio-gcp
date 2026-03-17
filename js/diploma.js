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

let listaResultados = [];

// recolher apenas as provas feitas
provas.forEach(p=>{

const tempo = atleta[p];

if(tempo && tempo!=="X"){
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
  scale: 4,
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

async function downloadTeamDiplomas(){

const team = prompt("Nome da equipa:");

if(!team) return;

const atletasTeam = atletas.filter(a => a.clube === team);

gerarDiplomasLote(atletasTeam);

}

function downloadTeamDiplomas(){

const team = prompt("Nome da equipa:");

if(!team) return;

const atletasEquipa = atletas.filter(a =>
a["CLUBE"] &&
a["CLUBE"].toLowerCase().includes(team.toLowerCase())
);

console.log("Encontrados:", atletasEquipa);

alert(atletasEquipa.length + " atletas encontrados");

}

async function gerarDiplomasLote(lista){

const zip = new JSZip();

for(const atleta of lista){

gerarDiploma(atleta);

await new Promise(r => setTimeout(r,100));

const canvas = await html2canvas(
document.getElementById("diplomaTemplate"),
{scale:3}
);

const imgData = canvas.toDataURL("image/png");

const pdf = new jspdf.jsPDF({
orientation:"landscape",
unit:"mm",
format:"a4"
});

pdf.addImage(imgData,"PNG",10,10,277,190);

const blob = pdf.output("blob");

zip.file(`${atleta.nome}.pdf`, blob);

}

const content = await zip.generateAsync({type:"blob"});

saveAs(content,"diplomas_equipa.zip");

}

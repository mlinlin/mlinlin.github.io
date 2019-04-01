// ==UserScript==
// @name         Congressional Roll Call CSV Downloader
// @namespace    https://mlinlin.github.io
// @version      0.16
// @description  Download roll calls from congressional websites in CSV format
// @include      https://www.senate.gov/legislative/LIS/roll_call_lists/*
// @include      http://clerk.house.gov/evs/*
// @grant        none
// ==/UserScript==

if (window.location.href.match(/house/g) != null && window.location.href.match(/xml/g) != null){
setTimeout(createHTML,25);
setTimeout(buttons,30);
function createHTML(){
  if(document.querySelectorAll('center')[0] != undefined
  ){
    const x = document.querySelectorAll('center')[0];
    const z = document.createElement("br");
    const h = document.createElement("BUTTON");
    const node = document.createTextNode("Get roll call CSV for this page only (Internet required)");
    h.appendChild(node);
    h.setAttribute("id", "housebutton");
    h.style.maxWidth="120px";
    x.insertBefore(z, x.childNodes[0]);
    x.insertBefore(h, x.childNodes[0]);
  };
};
function export_to_csv(xml, filename){
  const csv=[];
  const rows=xml.querySelectorAll("vote-data")[0].querySelectorAll("recorded-vote");
  for (let i=0; i<rows.length; i++){
    const row=[];
    const therow = rows[i].querySelectorAll("legislator")[0];
    row.push(therow.getAttribute("name-id"));
    row.push(therow.getAttribute("sort-field").split(",")[0]);
    row.push(therow.getAttribute("party"));
    row.push(therow.getAttribute("state"));
    row.push(rows[i].querySelectorAll("vote")[0].innerHTML);
    csv.push(row.join(","));
  }
  download_csv(csv.join("\n"), filename);
}
function buttons(){
  document.getElementById("housebutton").addEventListener("click", function () {
    const name=window.location.href.split("/")[4]+window.location.href.split("/")[5].split(".")[0];
    const xmlresponse=[];
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", window.location.href, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function() {
     if (xmlhttp.readyState == XMLHttpRequest.DONE) {
       if (xmlhttp.status != 200){console.log(xmlhttp.status)}
       else{xmlresponse.push(xmlhttp.responseXML); export_to_csv(xmlresponse[0], `${name}.csv`)};};
     };
  })
};
};
if (window.location.href.match(/senate/g) != null && window.location.href.match(/call_vote/g) != null){ //senate version
setTimeout(createHTML,25);
setTimeout(buttons,30);
function createHTML(){
    const x = document.getElementById("legislative_header");
    const z = document.createElement("br");
    const h = document.createElement("BUTTON");
    const node = document.createTextNode("Get roll call CSV for this page only (Internet required)");
    h.appendChild(node);
    h.setAttribute("id", "senatebutton");
    h.style.maxWidth="120px";
    x.insertBefore(z, x.childNodes[0]);
    x.insertBefore(h, x.childNodes[0]);
};
function export_to_csv(xml, filename){
  const csv=[];
  const rows=xml.querySelectorAll("members")[0].querySelectorAll("member");
  for (let i=0; i<rows.length; i++){
    const row=[];
    const therow = rows[i];
    row.push(therow.querySelectorAll("lis_member_id")[0].innerHTML);
    row.push(therow.querySelectorAll("last_name")[0].innerHTML);
    row.push(therow.querySelectorAll("party")[0].innerHTML);
    row.push(therow.querySelectorAll("state")[0].innerHTML);
    row.push(therow.querySelectorAll("vote_cast")[0].innerHTML);
    csv.push(row.join(","));
  }
  download_csv(csv.join("\n"), filename);
}
function buttons(){
  document.getElementById("senatebutton").addEventListener("click", function () {
    const namelong=document.getElementById("secondary_col2").querySelectorAll("span")[1].querySelectorAll("a")[0].getAttribute("href");
    const name = namelong.split("/")[5].split(".")[0];
    const xmlresponse=[];
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", namelong, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function() {
     if (xmlhttp.readyState == XMLHttpRequest.DONE) {
       if (xmlhttp.status != 200){console.log(xmlhttp.status)}
       else{xmlresponse.push(xmlhttp.responseXML); export_to_csv(xmlresponse[0], `${name}.csv`)};};
     };
  })
};
};
function download_csv(csv, filename) {
  const csvFile = new Blob([csv], {type: "text/csv"});
  const downloadLink = document.createElement("a");
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}

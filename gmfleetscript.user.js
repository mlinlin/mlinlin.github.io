// ==UserScript==
// @name         Script for GM Fleet Order Guide
// @namespace    https://congresscomparisons.site/
// @version      0.1
// @description  make the GM Fleet Order Guide more usable
// @grant        none
// @include      https://www.gmfleetorderguide.com/NASApp/domestic/proddesc.jsp*
// ==/UserScript==

window.addEventListener("load",linkschange);
function linkschange(){
  const firstlinks = [].slice.call(document.getElementsByTagName("a")).slice(6);
  for (let i=0; i<firstlinks.length; i++){
    if(firstlinks[i].href.split(",")[3] != undefined){
      const realfirstlink1 = firstlinks[i].href.split(",")[3].split(",")[0].replace(/'/g, '');
      const realfirstlink2 = firstlinks[i].href.split(",")[4].split(",")[0].replace(/'/g, '');
      const realfirstlinktrue = window.location.href.split("&section")[0]+"&section="+realfirstlink1+"&page="+realfirstlink2;
      firstlinks[i].href = realfirstlinktrue;
    };
  };
}
const allas=[];
const links=[];
const allpages=[];
if (window.location.href.match(/modelhome/g) != null || isNaN(window.location.href.split("vehicleID=")[1]) == false || (window.location.href.split("&type=0")[1] == "" && isNaN(window.location.href.split("&type=0")[0].split("vehicleID=")[1]) == false))
{setTimeout(createdivs,240);};
function createdivs(){
  const localpages = [];
  const hdiv = document.createElement("DIV");
  hdiv.setAttribute("id", "lodeouter2");
  hdiv.style.float="right";
  hdiv.style.width="90%";
  hdiv.style.backgroundColor="#9e9e9e";
  const table1 = document.getElementsByTagName("table")[1];
  table1.parentNode.insertBefore(hdiv, table1.nextSibling);
  const gdiv = document.createElement("DIV");
  gdiv.setAttribute("id", "lodebar2");
  gdiv.style.width="0%";
  gdiv.style.float="left";
  gdiv.style.height="25px";
  gdiv.style.backgroundColor="#9ffc4e";
  hdiv.appendChild(gdiv);
  get_as();
}
function get_as(){
  const firstlinks = [].slice.call(document.getElementsByTagName("a")).slice(6);
  for (let i=0; i<firstlinks.length; i++){
    if(firstlinks[i].href.includes("javascript") == false){
      allas.push(firstlinks[i].href);
    };
  };
  getpages();
};
function getpages(){
  for (let i=0; i<allas.length; i++){
      const darray = [];
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", allas[i], true);
      xmlhttp.responseType = "document";
      xmlhttp.send();
      xmlhttp.onreadystatechange = function() {
       if (xmlhttp.readyState == XMLHttpRequest.DONE) {
         if (xmlhttp.status != 200){console.log(xmlhttp.status)}
         else{darray.push(allas[i],xmlhttp.responseXML); allpages.push(darray); dupdate();};};
       };
    }
}
function dupdate(){
  if(allpages.length != allas.length){document.getElementById("lodebar2").style.width = ((100*allpages.length/allas.length)-15)+'%'}
  else{document.getElementById("lodebar2").style.backgroundColor = '#74f442'; document.getElementById("lodebar2").style.width = '100%'; setTimeout(getallminorpages,50)}
};
function getallminorpages(){
  for (let i=0; i<allpages.length; i++){
    if(allpages[i][1].getElementsByTagName("select")[1] != undefined){
      const ouroptions = allpages[i][1].getElementsByTagName("select")[1].children;
      for (let i=0; i<ouroptions.length; i++){
        if(ouroptions[i].selected != true){
          const darray = [];
          const link = "https://www.gmfleetorderguide.com/NASApp/domestic/"+ouroptions[i].value.trim();
          console.log(link);
          links.push(link);
          const xmlhttp = new XMLHttpRequest();
          xmlhttp.open("GET", link, true);
          xmlhttp.responseType = "document";
          xmlhttp.send();
          xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status != 200){console.log(xmlhttp.status)}
            else{darray.push(link,xmlhttp.responseXML); allpages.push(darray); if(allpages.length == (allas.length + links.length)){thesearchbox()};};};
          };
        };
      };
    };
  }
};
function thesearchbox(){
  const searchbox = document.createElement("INPUT");
  searchbox.type = "text";
  searchbox.name = "gmsearchbox";
  document.getElementById("lodebar2").append(searchbox);
  searchbox.addEventListener("keydown", thesearchfunction);
  searchbox.addEventListener("keyup", thesearchfunction);
  searchbox.addEventListener("click", thesearchfunction);
  searchbox.addEventListener("touchend", thesearchfunction);
}
function thesearchfunction(){
  const oldsearch = document.getElementsByName("searchresultsdisplay");
  for (let i=0; i<oldsearch.length; i++){oldsearch[i].remove()};
  const input = document.getElementsByName("gmsearchbox")[0].value;
  console.log(document.getElementsByName("gmsearchbox")[0].value);
  const searchresultsdisplay = document.createElement("DIV");
  searchresultsdisplay.setAttribute("name", "searchresultsdisplay");
  document.getElementById("lodeouter2").append(searchresultsdisplay)
  for (let i=0; i<allpages.length; i++){
    const truepage = allpages[i][1].getElementsByTagName("tbody")[2].textContent;
    const regex = RegExp(input);
    if (regex.test(truepage) == true){
      const content = document.createTextNode(allpages[i][0]);
      const content1 = document.createElement("a");
      const content2 = document.createElement("DIV");
      content1.href=allpages[i][0];
      content1.appendChild(content);
      content2.appendChild(content1);
      searchresultsdisplay.appendChild(content2);
    }
  }
}
// ==UserScript==
// @name         YouTube Thumbnail Likes/Dislikes
// @namespace    https://mlinlin.github.io/
// @version      0.12
// @description  Adds likes and dislikes to YouTube thumbnails
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

window.addEventListener("load", createHTML);
function createHTML(){
const thumbnails = document.getElementsByClassName("yt-simple-endpoint inline-block style-scope ytd-thumbnail");
setInterval(addbar,8000);
function addbar(){
  for (let i=0; i<thumbnails.length; i++){
    const name = thumbnails[i].href;
    const xmlresponse=[];
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", name, true);
    xmlhttp.responseType = "text";
    xmlhttp.send();
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) {
        if (xmlhttp.status != 200){console.log(xmlhttp.status)}
        else{xmlresponse.push(xmlhttp.responseText); addnumbers(xmlresponse[0])};};
      };
    function addnumbers(xmlresponse){
      const likes = xmlresponse.split("accessibilityData")[1].split("likes")[0].replace(/\D/g,'');
      const dislikes = xmlresponse.split("accessibilityData")[5].split("dislikes")[0].replace(/\D/g,'');
      const numcount = thumbnails[i].getElementsByClassName("style-scope ytd-thumbnail-overlay-time-status-renderer")[0].innerText.split("|")[0];
      thumbnails[i].getElementsByClassName("style-scope ytd-thumbnail-overlay-time-status-renderer")[0].innerText = numcount+"|"+likes+"↑|"+dislikes+"↓";
    };
  }
};
};
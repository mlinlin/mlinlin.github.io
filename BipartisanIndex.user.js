// ==UserScript==
// @name         Bipartisan Index for Legislators
// @namespace    https://mlinlin.github.io
// @version      0.1
// @description  Sorts legislators by their votes with members of the opposing party in each congress
// @include      https://www.senate.gov/legislative/LIS/roll_call_lists/*
// @include      http://clerk.house.gov/evs/*
// @grant        none
// ==/UserScript==

if (window.location.href.match(/house/g) != null && window.location.href.match(/xml/g) != null){setTimeout(calculateHouse,25);};
function calculateHouse(){
  const numleft=[];
  const xmlyearpage=[];
  const xmlsplitpages=[];
  const xmlallpages=[];
  const xmlresponse=[];
  const polnames=[];
  const relevantdata=[];
  const xmlhttp = new XMLHttpRequest();
  const pagelinksurl = window.location.href.substr(0, window.location.href.lastIndexOf("//"))+"index.asp";
  xmlhttp.open("GET", pagelinksurl, true);
  xmlhttp.responseType = "document";
  xmlhttp.send();
  xmlhttp.onreadystatechange = function() {
   if (xmlhttp.readyState == XMLHttpRequest.DONE) {
     if (xmlhttp.status != 200){console.log(xmlhttp.status)}
     else{xmlyearpage.push(xmlhttp.responseXML); getmorepagelinks()};};
   };
  function getmorepagelinks(){
    const theas = xmlyearpage[0].getElementsByTagName("font")[xmlyearpage[0].getElementsByTagName("font").length-1].getElementsByTagName("a");
    for (let i=0; i<theas.length; i++){
      const thehref = theas[i].getAttribute("href");
      const xmlhttp = new XMLHttpRequest();
      const pagelinksurl = window.location.href.substr(0, window.location.href.lastIndexOf("//"))+thehref;
      xmlhttp.open("GET", pagelinksurl, true);
      xmlhttp.responseType = "document";
      xmlhttp.send();
      xmlhttp.onreadystatechange = function() {
       if (xmlhttp.readyState == XMLHttpRequest.DONE) {
         if (xmlhttp.status != 200){console.log(xmlhttp.status)}
         else{xmlsplitpages.push(xmlhttp.responseXML); if(xmlsplitpages.length==theas.length){getallpagespush()};};};
       };
    }
  };
  function getallpagespush (){
    for (let i=0; i<xmlsplitpages.length; i++){
      const moreas = xmlsplitpages[i].getElementsByTagName("a");
      for (let i=0; i<moreas.length; i++){if(/roll/.test(moreas[i]) == true){numleft.push(moreas)}};
      for (let i=0; i<moreas.length; i++){if(/roll/.test(moreas[i]) == true){
        const thehref = moreas[i].getAttribute("href");
        const xmlhttp = new XMLHttpRequest();
        const pagelinksurl = "roll"+thehref.split("rollnumber=")[1].replace(/\d+/g, function(m){return "00".substr(m.length - 1) + m;})+".xml";
        xmlhttp.open("GET", pagelinksurl, true);
        xmlhttp.responseType = "document";
        xmlhttp.send();
        xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
          if (xmlhttp.status != 200){console.log(xmlhttp.status)}
          else{xmlallpages.push(xmlhttp.responseXML.querySelectorAll("vote-data")[0]); if(xmlallpages.length != numleft.length){dupdate()}; if(xmlallpages.length == numleft.length){currget()};};};
       };
      };}
    }
  }
  function dupdate(){
    console.log(100*(xmlallpages.length/numleft.length)+'% loaded');
  };
  function currget (){
    //sort thru politicians on the visible page first
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", window.location.href, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function() {
     if (xmlhttp.readyState == XMLHttpRequest.DONE) {
       if (xmlhttp.status != 200){console.log(xmlhttp.status)}
       else{xmlresponse.push(xmlhttp.responseXML); votesort()};};
     };
  };
//ISSUES: 1. Index does not adjust for overall bipartisanship of legislative chamber;
// as a result, Hern and Balderson look WAY more bipartisan than they really are. Fix this.
//ISSUES: 2. Should have done it by page, first, not by politician. Do this.
//
  function votesort (){
    //get each legislator's name *on the page we're on*:
    const rows=xmlresponse[0].querySelectorAll("vote-data")[0].querySelectorAll("recorded-vote");
    for (let i=0; i<rows.length; i++){
      polnames.push(rows[i].querySelectorAll("legislator")[0].getAttribute("name-id"));
    };
    //then sort thru xmlallpages for each politician's name and how the other party voted
    for (let i=0; i<polnames.length; i++){
      const therow = rows[i].querySelectorAll("legislator")[0];
      const polname = polnames[i];
      const polinfo=[];
      polinfo.push(polname);
      polinfo.push(therow.getAttribute("sort-field").split(",")[0]);
      polinfo.push(therow.getAttribute("party"));
      polinfo.push(therow.getAttribute("state"));
      polinfo.push(rows[i].querySelectorAll("vote")[0].innerHTML);
      const polbipart=[];
      for (let i=0; i<xmlallpages.length; i++){if (new XMLSerializer().serializeToString(xmlallpages[i]).includes(polname) == true){
        const localvote=[];
        const localrows=xmlallpages[i].querySelectorAll("recorded-vote");
        const xpartylocalrows=[];
        //here we push the legislator's vote into localrows and the votes of opposite-party legislators into xpartylocalrows
        for (let i=0; i<localrows.length; i++){
          if(localrows[i].outerHTML.indexOf(polname) != -1 && localrows[i].querySelectorAll("vote")[0].innerHTML != "Not Voting"){localvote.push(localrows[i].querySelectorAll("vote")[0].innerHTML)};
          if(localrows[i].querySelectorAll("legislator")[0].getAttribute("party").includes(polinfo[2]) == false && localrows[i].querySelectorAll("vote")[0].innerHTML != "Not Voting"){
            xpartylocalrows.push(localrows[i].querySelectorAll("vote")[0].innerHTML)};
        };
      //here we calculate the xpartylocalbipart for each legislator-page; then push that (i.e., the bipartisan index for that page) into polbipart
        if(localvote.length !=0){
          //use map, filter, sort functions to convert same votes as leg into 1s, different into 0s
          const xpartylocalbipart = xpartylocalrows.filter(word => word == localvote[0]);
          polbipart.push(xpartylocalbipart.length/xpartylocalrows.length);
        }
      }};
      if (polbipart.length !=0){polinfo.push((polbipart.reduce((x, y) => x+y))/polbipart.length)}else{polinfo.push(0)};
      console.log(polinfo);
      relevantdata.push(polinfo);
    };
  };
};

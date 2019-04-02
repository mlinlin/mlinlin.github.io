// ==UserScript==
// @name         Bipartisan Index for Legislators
// @namespace    https://mlinlin.github.io
// @version      0.13
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
  const realinfo=[];
  const realinfo2=[];
  const hdiv = document.createElement("DIV");
  hdiv.setAttribute("id", "lodeouter");
  hdiv.style.float="left";
  hdiv.style.width="100%";
  hdiv.style.backgroundColor="#9e9e9e";
  document.getElementsByTagName("center")[2].appendChild(hdiv);
  const gdiv = document.createElement("DIV");
  gdiv.setAttribute("id", "lodebar");
  gdiv.style.width="0%";
  gdiv.style.float="left";
  gdiv.style.height="25px";
  gdiv.style.backgroundColor="#9ffc4e";
  hdiv.appendChild(gdiv);
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
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", window.location.href, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
      if (xmlhttp.status != 200){console.log(xmlhttp.status)}
      else{xmlresponse.push(xmlhttp.responseXML.querySelectorAll("vote-data")[0])};};
    };
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
          else{xmlallpages.push(xmlhttp.responseXML.querySelectorAll("vote-data")[0]); dupdate()};};
       };
      };}
    }
  }
  function dupdate(){
    if(xmlallpages.length != numleft.length){document.getElementById("lodebar").style.width = 80*(xmlallpages.length/numleft.length)+'%'}
    else{document.getElementById("lodebar").style.backgroundColor = '#74f442'; setTimeout(votesort,50)}
  };
//ISSUES: 1. Index does not adjust for overall bipartisanship of legislative chamber;
// as a result, Hern and Balderson look WAY more bipartisan than they really are. Fix this.
  function votesort (){
    //get each legislator's name *on the page we're on*:
    const rows=xmlresponse[0].querySelectorAll("recorded-vote");
    for (let i=0; i<rows.length; i++){
      polnames.push(rows[i].querySelectorAll("legislator")[0].getAttribute("name-id"));
    };
    for (let i=0; i<polnames.length; i++){
      const therow = rows[i].querySelectorAll("legislator")[0];
      const polname = polnames[i];
      const polinfo=[];
      polinfo.push(polname);
      polinfo.push(therow.getAttribute("sort-field").split(",")[0]);
      polinfo.push(therow.getAttribute("party"));
      polinfo.push(therow.getAttribute("state"));
      polinfo.push(rows[i].querySelectorAll("vote")[0].innerHTML);
      realinfo.push(polinfo);
      realinfo2.push([]);
    };
    //then sort thru xmlallpages for each politician's name and how the other party voted
    for (let i=0; i<xmlallpages.length; i++){
      const localallpolinfo=[];
      const localrows=xmlallpages[i].querySelectorAll("recorded-vote");
      for (let i=0; i<localrows.length; i++){if(localrows[i].querySelectorAll("vote")[0].innerHTML != "Not Voting"){
        const localpolinfo =[];
        localpolinfo.push(localrows[i].querySelectorAll("legislator")[0].getAttribute("name-id"));
        localpolinfo.push(localrows[i].querySelectorAll("legislator")[0].getAttribute("party"));
        localpolinfo.push(localrows[i].querySelectorAll("vote")[0].innerHTML);
        localallpolinfo.push(localpolinfo)
      }};
      for (let i=0; i<localallpolinfo.length; i++){
        const xpartylocalrows = localallpolinfo.filter(subarray => subarray[1] != localallpolinfo[i][1]);
        const xpartylocalbipart = xpartylocalrows.filter(subarray => subarray[2] == localallpolinfo[i][2]);
        localallpolinfo[i].push(xpartylocalbipart.length/xpartylocalrows.length); //you could also do a Math.round( here; can be continuous or binary
      };
      for (let i=0; i<polnames.length; i++){ //push the average bipartisan score into the legislator's realinfo2[i]
        const newlocalpolinfo = localallpolinfo.filter(subarray => subarray[0] == polnames[i])[0]
        if(newlocalpolinfo != undefined){realinfo2[i].push(newlocalpolinfo[3])};
      };
      document.getElementById("lodebar").style.width = 100*(xmlallpages.length/numleft.length)+'%';
    };
    for (let i=0; i<realinfo.length; i++){
      if(realinfo2[i][0] != undefined){realinfo[i].push(+(((realinfo2[i].reduce((x, y) => x+y))/realinfo2[i].length).toFixed(4)));}
      else{realinfo[i].push(0)}
    };
    const repinfo = realinfo.filter(subarray => subarray[2] == "R" ).sort((a,b) => b[5]-a[5]);
    const deminfo = realinfo.filter(subarray => subarray[2] == "D" ).sort((a,b) => a[5]-b[5]);
    const truinfo = deminfo.concat(repinfo);
    console.log(truinfo);
    for (let i=0; i<truinfo.length; i++){
    };
  };
};

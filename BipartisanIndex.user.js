// ==UserScript==
// @name         Bipartisan Index for Legislators
// @namespace    https://mlinlin.github.io
// @version      0.19
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
  const realinfo3=[];
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
    if(xmlallpages.length != numleft.length){document.getElementById("lodebar").style.width = (100-(numleft.length/15))*(xmlallpages.length/numleft.length)+'%'}
    else{document.getElementById("lodebar").style.backgroundColor = '#74f442'; setTimeout(votesort,50)}
  };
  function votesort (){
    //get each legislator's name *on the page we're on*:
    const rows=xmlresponse[0].querySelectorAll("recorded-vote");
    if(Number(window.location.href.split("/")[4]) > 2002){for (let i=0; i<rows.length; i++){
      polnames.push(rows[i].querySelectorAll("legislator")[0].getAttribute("name-id"));
    }}else{for (let i=0; i<rows.length; i++){
      polnames.push(rows[i].querySelectorAll("legislator")[0].innerHTML);
    }};
    if(Number(window.location.href.split("/")[4]) > 2002){for (let i=0; i<polnames.length; i++){
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
      realinfo3.push([]);
    }};
    if(Number(window.location.href.split("/")[4] < 2002)){for (let i=0; i<polnames.length; i++){
      const therow = rows[i].querySelectorAll("legislator")[0];
      const polname = polnames[i];
      const polinfo=[];
      polinfo.push(polname);
      polinfo.push(rows[i].querySelectorAll("legislator")[0].innerHTML);
      if(therow.getAttribute("party") == "R"){polinfo.push(therow.getAttribute("party"))}else{polinfo.push("D")};
      polinfo.push(therow.getAttribute("state"));
      polinfo.push(rows[i].querySelectorAll("vote")[0].innerHTML);
      realinfo.push(polinfo);
      realinfo2.push([]);
      realinfo3.push([]);
    }};
    //then sort thru xmlallpages for each politician's name and how the other party voted
    for (let i=0; i<xmlallpages.length; i++){
      const localallpolinfo=[];
      const localrows=xmlallpages[i].querySelectorAll("recorded-vote");
      for (let i=0; i<localrows.length; i++){if(localrows[i].querySelectorAll("vote")[0].innerHTML != "Not Voting"){
        const localpolinfo =[];
        if(Number(window.location.href.split("/")[4]) > 2002){
          localpolinfo.push(localrows[i].querySelectorAll("legislator")[0].getAttribute("name-id"));
        }else{localpolinfo.push(localrows[i].querySelectorAll("legislator")[0].innerHTML);};
        if(localrows[i].querySelectorAll("legislator")[0].getAttribute("party") == "R"){
          localpolinfo.push(localrows[i].querySelectorAll("legislator")[0].getAttribute("party"))}else{
          localpolinfo.push("D")
        };
        localpolinfo.push(localrows[i].querySelectorAll("vote")[0].innerHTML);
        localallpolinfo.push(localpolinfo)
      }};
      for (let i=0; i<localallpolinfo.length; i++){
        //first we calculate the absolute bipartisan index
        const xpartylocalrows = localallpolinfo.filter(subarray => subarray[1] != localallpolinfo[i][1]);
        const xpartylocalbipart = xpartylocalrows.filter(subarray => subarray[2] == localallpolinfo[i][2]);
        localallpolinfo[i].push(xpartylocalbipart.length/xpartylocalrows.length); //you could also do a Math.round( here; can be continuous or binary
      };
      //THEN we calculate the relative bipartisan index; i.e., subtract % of own party members who voted with opposite party
      for (let i=0; i<localallpolinfo.length; i++){
        const localindices =[];
        const opartylocalrows = localallpolinfo.filter(subarray => subarray[1] == localallpolinfo[i][1]);
        for (let i=0; i<opartylocalrows.length; i++){localindices.push(opartylocalrows[i][3])}
        const avgpartyindex = localindices.reduce((x,y)=> x+y)/opartylocalrows.length; //get average bipartisan index for whole party
        localallpolinfo[i].push(localallpolinfo[i][3]-avgpartyindex); //you could also do a Math.round( here; can be continuous or binary
      };
      for (let i=0; i<polnames.length; i++){ //push all bipartisan scores into the legislator's realinfo2[i] for absolute and realinfo3[i] for relative
        const newlocalpolinfo = localallpolinfo.filter(subarray => subarray[0] == polnames[i])[0];
        if(newlocalpolinfo != undefined){realinfo2[i].push(newlocalpolinfo[3]); realinfo3[i].push(newlocalpolinfo[4])};
      };
      document.getElementById("lodebar").style.width = 100*(xmlallpages.length/numleft.length)+'%';
    };
    for (let i=0; i<realinfo.length; i++){
      if(realinfo2[i][0] != undefined){realinfo[i].push(+(((realinfo2[i].reduce((x, y) => x+y))/realinfo2[i].length).toFixed(4)));}
      else{realinfo[i].push(0)};
      if(realinfo3[i][0] != undefined){realinfo[i].push(+(((realinfo3[i].reduce((x, y) => x+y))/realinfo3[i].length).toFixed(4)));}
      else{realinfo[i].push(0)}
    };
    const x = 6;
    const repinfo = realinfo.filter(subarray => subarray[2] == "R" ).sort((a,b) => b[x]-a[x]);
    const deminfo = realinfo.filter(subarray => subarray[2] == "D" ).sort((a,b) => a[x]-b[x]);
    const truinfo = deminfo.concat(repinfo);
    document.getElementById("lodebar").remove();
    document.getElementById("lodeouter").style.wordWrap = "break-word";
    document.getElementById("lodeouter").style.textAlign="left";
    for (let i=0; i<truinfo.length; i++){
      const newdiv = document.createElement('span');
      newdiv.style.border = "thin solid #ffffff";
      if(truinfo[i][4] == "Yea"){newdiv.innerHTML= "__"; if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "red"}else{newdiv.style.backgroundColor = "#0050ff"};};
      if(truinfo[i][4] == "Aye"){newdiv.innerHTML= "__"; if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "red"}else{newdiv.style.backgroundColor = "#0050ff"};};
      if(truinfo[i][4] == "Nay"){newdiv.innerHTML= "__"; if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "#9c0000"}else{newdiv.style.backgroundColor = "#0026d5"};};
      if(truinfo[i][4] == "No"){newdiv.innerHTML= "__"; if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "#9c0000"}else{newdiv.style.backgroundColor = "#0026d5"};};
      if(truinfo[i][4] == "Present"){newdiv.innerHTML= "__"; if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "#ff2b2b"}else{newdiv.style.backgroundColor = "#2272ff"};};
      if(truinfo[i][4] == "Not Voting"){newdiv.innerHTML= "__"; if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "#ff8787"}else{newdiv.style.backgroundColor = "#6bbbff"};};
      newdiv.style.color = newdiv.style.backgroundColor;
      newdiv.addEventListener("mouseover", whenmouse);
      newdiv.addEventListener("click", whenmouse);
      newdiv.addEventListener("touchstart", whenmouse);
      function whenmouse(event){
        if(document.getElementById("specialbox") != null){document.getElementById("specialbox").remove()};
        if(newdiv.style.border == "thin solid black"){newdiv.style.border = "thin solid #ffffff"}else{newdiv.style.border = "thin solid black"};
        const specialbox = document.createElement("DIV");
        specialbox.setAttribute("id", "specialbox");
        document.getElementsByTagName("body")[0].appendChild(specialbox);
        specialbox.style.position = "absolute";
        specialbox.style.left = event.clientX;
        specialbox.style.top = event.clientY-100;
        specialbox.style.width = "130px"
        specialbox.style.height = "75px"
        specialbox.style.backgroundColor = "#f4c842";
        specialbox.style.wordWrap = "break-word";
        specialbox.innerHTML += truinfo[i][1];
        specialbox.innerHTML +="<br>";
        if (truinfo[i][1] != "Sanders"){specialbox.innerHTML += truinfo[i][2]}else{specialbox.innerHTML += "I"};
        specialbox.innerHTML +="<br>";
        specialbox.innerHTML += truinfo[i][3];
        specialbox.innerHTML +="<br>";
        specialbox.innerHTML += truinfo[i][4];
        specialbox.innerHTML +="<br>";
        specialbox.innerHTML += "Absolute Bipartisanship: "+String(truinfo[i][5]);
        specialbox.innerHTML +="<br>";
        specialbox.innerHTML += "Relative Bipartisanship: "+String(truinfo[i][6]);
        specialbox.style.fontSize = "xx-small";
      };
      document.getElementById("lodeouter").appendChild(newdiv);
    };
  };
};

// ==UserScript==
// @name         Bipartisan Index for Legislators
// @namespace    https://mlinlin.github.io
// @version      0.37
// @description  Sorts legislators by their votes with members of the opposing party in each congress
// @include      https://www.senate.gov/legislative/LIS/roll_call_lists/*
// @include      http://clerk.house.gov/evs/*
// @grant        none
// ==/UserScript==

if (window.location.href.match(/house/g) != null && window.location.href.match(/xml/g) != null){setTimeout(calculateHouse,25);};
if (window.location.href.match(/senate/g) != null && window.location.href.match(/call_vote/g) != null){setTimeout(calculateSenate,30);};
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
  const goode=[];
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
    const rows = xmlresponse[0].querySelectorAll("recorded-vote");
    const year = Number(window.location.href.split("/")[4]);
    if(Number(window.location.href.split("/")[4]) > 2002){for (let i=0; i<rows.length; i++){
      polnames.push(rows[i].querySelectorAll("legislator")[0].getAttribute("name-id"));
    }}else{for (let i=0; i<rows.length; i++){
      polnames.push(rows[i].querySelectorAll("legislator")[0].innerHTML);
    }};
    if(year > 2002){for (let i=0; i<polnames.length; i++){
      const therow = rows[i].querySelectorAll("legislator")[0];
      const polname = polnames[i];
      const polinfo=[];
      polinfo.push(polname);
      polinfo.push(therow.getAttribute("sort-field").split(",")[0]);
      if(therow.getAttribute("party") == "R"){polinfo.push(therow.getAttribute("party"))}else{polinfo.push("D")};
      polinfo.push(therow.getAttribute("state"));
      polinfo.push(rows[i].querySelectorAll("vote")[0].innerHTML);
      realinfo.push(polinfo);
      realinfo2.push([]);
      realinfo3.push([]);
    }};
    if(year < 2003){for (let i=0; i<polnames.length; i++){
      const therow = rows[i].querySelectorAll("legislator")[0];
      const polname = polnames[i];
      const polinfo=[];
      polinfo.push(polname);
      polinfo.push(therow.innerHTML);
      if (therow.innerHTML == "Goode" && therow.getAttribute("party") == "I")
      {polinfo.push("R"); goode.push(1)}
      else if(therow.getAttribute("party") == "R"){polinfo.push(therow.getAttribute("party"))}else{polinfo.push("D")};
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
        if(year > 2002){
          localpolinfo.push(localrows[i].querySelectorAll("legislator")[0].getAttribute("name-id"));
        }else{localpolinfo.push(localrows[i].querySelectorAll("legislator")[0].innerHTML);};
        if (localrows[i].querySelectorAll("legislator")[0].innerHTML == "Goode" && localrows[i].querySelectorAll("legislator")[0].getAttribute("party") == "I")
        {localpolinfo.push("R")}
        else if(localrows[i].querySelectorAll("legislator")[0].getAttribute("party") == "R"){
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
        localallpolinfo[i].push((localallpolinfo[i][3]-avgpartyindex)); //you could also do a Math.round( here; can be continuous or binary
      };
      for (let i=0; i<polnames.length; i++){ //push all bipartisan scores into the legislator's realinfo2[i] for absolute and realinfo3[i] for relative
        const newlocalpolinfo = localallpolinfo.filter(subarray => subarray[0] == polnames[i] && subarray[1] == realinfo[i][2])[0];
        if(newlocalpolinfo != undefined && newlocalpolinfo.length > 4){realinfo2[i].push(newlocalpolinfo[3]); realinfo3[i].push(newlocalpolinfo[4])};
      };
      document.getElementById("lodebar").style.width = 100*(xmlallpages.length/numleft.length)+'%';
    };
    const realinfo2flat =realinfo2.flat();
    const avgbipart = 1-(realinfo2flat.reduce((x, y) => x+y)/realinfo2flat.length);
    for (let i=0; i<realinfo.length; i++){
      if(realinfo2[i][0] != undefined){realinfo[i].push(+(((100*realinfo2[i].reduce((x, y) => x+y))/realinfo2[i].length).toFixed(2)));}
      else{realinfo[i].push(0)};
      //find
      if(realinfo3[i][0] != undefined && realinfo3[i].reduce((x, y) => x+y) > 0){realinfo[i].push((+(((100*(realinfo3[i].reduce((x, y) => x+y))/realinfo3[i].length)/avgbipart).toFixed(2))));}
      else if(realinfo3[i][0] != undefined && realinfo3[i].reduce((x, y) => x+y) < 0){realinfo[i].push((+(((100*(realinfo3[i].reduce((x, y) => x+y))/realinfo3[i].length)/(1-avgbipart)).toFixed(2))));}
      else{realinfo[i].push(0)}
    };
    const x = 6;
    const repinfo = realinfo.filter(subarray => subarray[2] == "R" ).sort((a,b) => b[x]-a[x]);
    const deminfo = realinfo.filter(subarray => subarray[2] == "D" ).sort((a,b) => a[x]-b[x]);
    const truinfo = deminfo.concat(repinfo);
    const presentinfo = truinfo.filter(subarray => subarray[4] != "Not Voting" && subarray[4] != "Present");
    document.getElementById("lodebar").remove();
    document.getElementById("lodeouter").style.wordWrap = "break-word";
    document.getElementById("lodeouter").style.textAlign="left";
    const yorn =[];
    //here we create the squares
    for (let i=0; i<truinfo.length; i++){
      const newdiv = document.createElement('span');
      newdiv.style.border = "thin solid #ffffff"
      newdiv.setAttribute("id", truinfo[i][1]);
      newdiv.innerHTML= "Њ";
      newdiv.style.userSelect = "none";
      newdiv.style.cursor = "pointer";
      if(truinfo[i][4] != "Not Voting" && truinfo[i][4] != "Present"){yorn.push(1)};
      if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "#7d0000"}else{newdiv.style.backgroundColor = "#000c7c"};
      if(year==2019 &&(truinfo[i][4] == "McCarthy" || truinfo[i][4] == "Pelosi"))
      {if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "red"}else{newdiv.style.backgroundColor = "#0050ff"};};
      const standardspeaker=[2015, 2013, 2011, 2009, 2007];
      const standardspeaker2=[2005, 2003, 2001, 1999];
      const standardspeaker3=[1997, 1995, 1993, 1991];
      if(standardspeaker.indexOf(year) != -1 &&(truinfo[i][4] == "Ryan (WI)" || truinfo[i][4] == "Pelosi" || truinfo[i][4] == "Boehner"))
      {if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "red"}else{newdiv.style.backgroundColor = "#0050ff"};};
      if(standardspeaker2.indexOf(year) != -1 &&(truinfo[i][4] == "Hastert" || truinfo[i][4] == "Pelosi" || truinfo[i][4] == "Gephardt"))
      {if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "red"}else{newdiv.style.backgroundColor = "#0050ff"};};
      if(standardspeaker3.indexOf(year) != -1 &&(truinfo[i][4] == "Foley" || truinfo[i][4] == "Michel" || truinfo[i][4] == "Gephardt" || truinfo[i][4] == "Gingrich"))
      {if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "red"}else{newdiv.style.backgroundColor = "#0050ff"};};
      if(truinfo[i][4] == "Yea" || truinfo[i][4] == "Aye"){if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "red"}else{newdiv.style.backgroundColor = "#0050ff"};};
      if(truinfo[i][4] == "Nay" || truinfo[i][4] == "No"){if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "#7d0000"}else{newdiv.style.backgroundColor = "#000c7c"};};
      if(truinfo[i][4] == "Present"){if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "#ff7d7d"}else{newdiv.style.backgroundColor = "#63b3ff"};};
      if(truinfo[i][4] == "Not Voting"){if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "#ffd1d1"}else{newdiv.style.backgroundColor = "#a3f3ff"};};
      newdiv.style.color = newdiv.style.backgroundColor;
      newdiv.addEventListener("mouseover", whenmouse);
      newdiv.addEventListener("click", whenmouse);
      newdiv.addEventListener("click", whenmouse2);
      newdiv.addEventListener("touchstart", whenmouse);
      window.addEventListener("scroll", whenmouse3);
      //here we create orange box
      function whenmouse(event){
        if(document.getElementById("specialbox") != null){document.getElementById("specialbox").remove()};
        const specialbox = document.createElement("DIV");
        specialbox.setAttribute("id", "specialbox");
        document.getElementsByTagName("body")[0].appendChild(specialbox);
        specialbox.style.position = "fixed";
        if(event.clientX < window.innerWidth-200){specialbox.style.left = event.clientX+"px"}else{specialbox.style.left = (event.clientX-130)+"px"};
        specialbox.style.top = (event.clientY-100)+"px";
        specialbox.style.width = "130px"
        specialbox.style.height = "75px"
        specialbox.style.backgroundColor = "#f4c842";
        specialbox.style.wordWrap = "break-word";
        specialbox.innerHTML += truinfo[i][1];
        specialbox.innerHTML +="<br>";
        if (truinfo[i][1] == "Sanders")
        {specialbox.innerHTML += "I"}
        else if (truinfo[i][1] == "Goode" && goode.length > 0)
        {specialbox.innerHTML += "I"}
        else{specialbox.innerHTML += truinfo[i][2]};
        specialbox.innerHTML +="<br>";
        specialbox.innerHTML += truinfo[i][3];
        specialbox.innerHTML +="<br>";
        specialbox.innerHTML += truinfo[i][4];
        specialbox.innerHTML +="<br>";
        specialbox.innerHTML += "Absolute Bipartisanship: "+String(truinfo[i][5])+'%';
        specialbox.innerHTML +="<br>";
        specialbox.innerHTML += "Relative Bipartisanship: "+String(truinfo[i][6])+'%';
        specialbox.style.fontSize = "xx-small";
      };
      function whenmouse2(event){
        if(newdiv.style.border == "thin solid black"){newdiv.style.border = "thin solid #ffffff"}else{newdiv.style.border = "thin solid black"};
      };
      function whenmouse3(event){
        if(document.getElementById("specialbox") != null){document.getElementById("specialbox").remove()};
      };
      document.getElementById("lodeouter").appendChild(newdiv);
      const realbreak = document.createElement('span');
      realbreak.innerHTML = "؁<br>";
      realbreak.style.color = "#9e9e9e"
      if(yorn.length == Math.ceil(presentinfo.length/2)){document.getElementById("lodeouter").appendChild(realbreak); yorn.push(0)}
    };
  };
};
function calculateSenate(){
  window.addEventListener("load", changehead);
  function changehead(){
    if(document.getElementsByClassName("mobilehead clearfix")[0].style.position != null){
    document.getElementsByClassName("mobilehead clearfix")[0].style.position = "relative"}
  };
  const xmlyearpage=[];
  const xmlresponse=[];
  const numleft=[];
  const xmlallpages=[];
  const polnames=[];
  const realinfo=[];
  const realinfo2=[];
  const realinfo3=[];
  const hdiv = document.createElement("DIV");
  hdiv.setAttribute("id", "lodeouter");
  hdiv.style.float="left";
  hdiv.style.width="100%";
  hdiv.style.backgroundColor="#9e9e9e";
  document.getElementsByTagName("p")[1].appendChild(hdiv);
  const gdiv = document.createElement("DIV");
  gdiv.setAttribute("id", "lodebar");
  gdiv.style.width="0%";
  gdiv.style.float="left";
  gdiv.style.height="20px";
  gdiv.style.backgroundColor="#9ffc4e";
  hdiv.appendChild(gdiv);
  const xmlhttp = new XMLHttpRequest();
  const origpage = "https://www.senate.gov/legislative/LIS/roll_call_lists/vote_menu_"
  const origpageproto = window.location.href.split("congress=")[1].split("&")[0]+"_";
  const origpageproto2 = window.location.href.split("session=")[1].split("&")[0];
  const pagelinksurl = origpage+origpageproto+origpageproto2+".htm";
  xmlhttp.open("GET", pagelinksurl, true);
  xmlhttp.responseType = "document";
  xmlhttp.send();
  xmlhttp.onreadystatechange = function() {
   if (xmlhttp.readyState == XMLHttpRequest.DONE) {
     if (xmlhttp.status != 200){console.log(xmlhttp.status)}
     else{xmlyearpage.push(xmlhttp.responseXML.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0]); getallpagespush()};};
   };
  function getallpagespush (){
    const pagelinksurl = document.getElementById("secondary_col2").querySelectorAll("span")[1].querySelectorAll("a")[0].getAttribute("href");
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", pagelinksurl, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
      if (xmlhttp.status != 200){console.log(xmlhttp.status)}
      else{xmlresponse.push(xmlhttp.responseXML)};};
    };
    const moreas = xmlyearpage[0].getElementsByTagName("a");
    for (let i=0; i<moreas.length; i++){
      if(moreas[i].getAttribute("href").includes("roll") == true && moreas[i].getAttribute("href").includes("=") == true){
        numleft.push(moreas[i])
    }};
      const senarray=[];
      senateavoid(numleft[0]);
      function senateavoid(reallinks){
        senarray.push(1);
        const thehref = reallinks.getAttribute("href");
        const xmlhttp = new XMLHttpRequest();
        const origurl = "https://www.senate.gov/legislative/LIS/roll_call_votes/vote";
        const num1 = thehref.split("=")[1].split("&")[0];
        const num2 = thehref.split("=")[2].split("&")[0];
        const num3 = thehref.split("=")[3];
        const pagelinksurl = origurl+num1+num2+"/vote_"+num1+"_"+num2+"_"+num3+".xml";
        xmlhttp.open("GET", pagelinksurl, true);
        xmlhttp.responseType = "document";
        xmlhttp.send();
        xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
          if (xmlhttp.status != 200){console.log(xmlhttp.status)}
          else{xmlallpages.push(xmlhttp.responseXML.querySelectorAll("members")[0]); dupdate()}};
        };
        const x = 100+100*Math.random();
        setTimeout(realdelay,x);
      };
      function realdelay(){if(senarray.length < numleft.length){senateavoid(numleft[senarray.length])}};
  }
  function dupdate(){
    if(xmlallpages.length != numleft.length){document.getElementById("lodebar").style.width = (100-(numleft.length/30))*(xmlallpages.length/numleft.length)+'%'}
    else{document.getElementById("lodebar").style.backgroundColor = '#74f442'; setTimeout(votesort,50)}
  };
  function votesort (){
    //get each legislator's name *on the page we're on*:
    const rows=xmlresponse[0].querySelectorAll("member");
    for (let i=0; i<rows.length; i++){
      polnames.push(rows[i].querySelectorAll("lis_member_id")[0].innerHTML);
    }
    for (let i=0; i<polnames.length; i++){
      const therow = rows[i];
      const polname = polnames[i];
      const polinfo=[];
      polinfo.push(polname);
      polinfo.push(therow.querySelectorAll("last_name")[0].innerHTML);
      if(therow.querySelectorAll("party")[0].innerHTML == "R"){polinfo.push("R")}else{polinfo.push("D")};
      polinfo.push(therow.querySelectorAll("state")[0].innerHTML);
      polinfo.push(therow.querySelectorAll("vote_cast")[0].innerHTML);
      realinfo.push(polinfo);
      realinfo2.push([]);
      realinfo3.push([]);
    };
    //then sort thru xmlallpages for each politician's name and how the other party voted
    for (let i=0; i<xmlallpages.length; i++){
      const localallpolinfo=[];
      const localrows=xmlallpages[i].querySelectorAll("member");
      for (let i=0; i<localrows.length; i++){if(localrows[i].querySelectorAll("vote_cast")[0].innerHTML != "Not Voting"){
        const localpolinfo =[];
        localpolinfo.push(localrows[i].querySelectorAll("lis_member_id")[0].innerHTML);
        if(localrows[i].querySelectorAll("party")[0].innerHTML == "R"){
          localpolinfo.push("R")}else{
          localpolinfo.push("D")
        };
        localpolinfo.push(localrows[i].querySelectorAll("vote_cast")[0].innerHTML);
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
        localallpolinfo[i].push((localallpolinfo[i][3]-avgpartyindex)); //you could also do a Math.round( here; can be continuous or binary
      };
      for (let i=0; i<polnames.length; i++){ //push all bipartisan scores into the legislator's realinfo2[i] for absolute and realinfo3[i] for relative
        const newlocalpolinfo = localallpolinfo.filter(subarray => subarray[0] == polnames[i] && subarray[1] == realinfo[i][2])[0];
        if(newlocalpolinfo != undefined && newlocalpolinfo.length > 4){realinfo2[i].push(newlocalpolinfo[3]); realinfo3[i].push(newlocalpolinfo[4])};
      };
      document.getElementById("lodebar").style.width = 100*(xmlallpages.length/numleft.length)+'%';
    };
    const realinfo2flat =realinfo2.flat();
    const avgbipart = 1-(realinfo2flat.reduce((x, y) => x+y)/realinfo2flat.length);
    for (let i=0; i<realinfo.length; i++){
      if(realinfo2[i][0] != undefined){realinfo[i].push(+((100*(realinfo2[i].reduce((x, y) => x+y))/realinfo2[i].length).toFixed(2)));}
      else{realinfo[i].push(0)};
      //find
      if(realinfo3[i][0] != undefined && realinfo3[i].reduce((x, y) => x+y) > 0){realinfo[i].push(+(((100*(realinfo3[i].reduce((x, y) => x+y))/realinfo3[i].length)/(avgbipart)).toFixed(2)));}
      else if(realinfo3[i][0] != undefined && realinfo3[i].reduce((x, y) => x+y) < 0){realinfo[i].push(+(((100*(realinfo3[i].reduce((x, y) => x+y))/realinfo3[i].length)/(1-avgbipart)).toFixed(2)));}
      else{realinfo[i].push(0)}
    };
    const x = 6;
    const repinfo = realinfo.filter(subarray => subarray[2] == "R" ).sort((a,b) => b[x]-a[x]);
    const deminfo = realinfo.filter(subarray => subarray[2] == "D" ).sort((a,b) => a[x]-b[x]);
    const truinfo = deminfo.concat(repinfo);
    const presentinfo = truinfo.filter(subarray => subarray[4] != "Not Voting" && subarray[4] != "Present");
    document.getElementById("lodebar").remove();
    document.getElementById("lodeouter").style.wordWrap = "break-word";
    document.getElementById("lodeouter").style.textAlign="left";
    const yorn =[];
    //here we create the squares
    for (let i=0; i<truinfo.length; i++){
      const newdiv = document.createElement('span');
      newdiv.style.border = "thin solid #ffffff"
      newdiv.setAttribute("id", truinfo[i][1]);
      newdiv.innerHTML= "Ǆ";
      newdiv.style.userSelect = "none";
      newdiv.style.cursor = "pointer";
      if(truinfo[i][4] != "Not Voting" && truinfo[i][4] != "Present"){yorn.push(1)};
      if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "#ff7d7d"}else{newdiv.style.backgroundColor = "#63b3ff"};
      if(truinfo[i][4] == "Yea" || truinfo[i][4] == "Aye"){if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "red"}else{newdiv.style.backgroundColor = "#0050ff"};};
      if(truinfo[i][4] == "Nay" || truinfo[i][4] == "No"){if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "#7d0000"}else{newdiv.style.backgroundColor = "#000c7c"};};
      if(truinfo[i][4] == "Present"){if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "#ff7d7d"}else{newdiv.style.backgroundColor = "#63b3ff"};};
      if(truinfo[i][4] == "Not Voting"){if(truinfo[i][2] == "R"){newdiv.style.backgroundColor = "#ffd1d1"}else{newdiv.style.backgroundColor = "#a3f3ff"};};
      newdiv.style.color = newdiv.style.backgroundColor;
      newdiv.addEventListener("mouseover", whenmouse);
      newdiv.addEventListener("click", whenmouse);
      newdiv.addEventListener("click", whenmouse2);
      newdiv.addEventListener("touchstart", whenmouse);
      window.addEventListener("scroll", whenmouse3);
      //here we create orange box
      function whenmouse(event){
        if(document.getElementById("specialbox") != null){document.getElementById("specialbox").remove()};
        const specialbox = document.createElement("DIV");
        specialbox.setAttribute("id", "specialbox");
        document.getElementsByTagName("body")[0].appendChild(specialbox);
        specialbox.style.position = "fixed";
        if(event.clientX < window.innerWidth-200){specialbox.style.left = event.clientX+"px"}else{specialbox.style.left = (event.clientX-130)+"px"};
        specialbox.style.top = (event.clientY-100)+"px";
        specialbox.style.width = "130px"
        specialbox.style.height = "75px"
        specialbox.style.backgroundColor = "#f4c842";
        specialbox.style.wordWrap = "break-word";
        specialbox.innerHTML += truinfo[i][1];
        specialbox.innerHTML +="<br>";
        if (truinfo[i][1] == "Sanders" || truinfo[i][1] == "King" )
        {specialbox.innerHTML += "I"} else
        if (truinfo[i][1] == "Jeffords" && truinfo[i][2] == "D")
        {specialbox.innerHTML += "I"} else
        if (truinfo[i][1] == "Barkley" && truinfo[i][2] == "D")
        {specialbox.innerHTML += "I"}
        else{specialbox.innerHTML += truinfo[i][2]};
        specialbox.innerHTML +="<br>";
        specialbox.innerHTML += truinfo[i][3];
        specialbox.innerHTML +="<br>";
        specialbox.innerHTML += truinfo[i][4];
        specialbox.innerHTML +="<br>";
        specialbox.innerHTML += "Absolute Bipartisanship: "+String(truinfo[i][5])+'%';
        specialbox.innerHTML +="<br>";
        specialbox.innerHTML += "Relative Bipartisanship: "+String(truinfo[i][6])+'%';
        specialbox.style.fontSize = "xx-small";
      };
      function whenmouse2(event){
        if(newdiv.style.border == "thin solid black"){newdiv.style.border = "thin solid #ffffff"}else{newdiv.style.border = "thin solid black"};
      };
      function whenmouse3(event){
        if(document.getElementById("specialbox") != null){document.getElementById("specialbox").remove()};
      };
      document.getElementById("lodeouter").appendChild(newdiv);
      const realbreak = document.createElement('span');
      realbreak.innerHTML = "؁<br>";
      realbreak.style.color = "#9e9e9e"
      if(yorn.length == Math.ceil(presentinfo.length/2)){document.getElementById("lodeouter").appendChild(realbreak); yorn.push(0)}
    };
  };
};

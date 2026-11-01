/* Gemeinsames Verhalten für alle Kapitel-Seiten.
   Jede Seite legt vorher fest:
   CHAPTERS – die Abschnitte mit Texten und Videos
   KEY      – Name, unter dem der Fortschritt gespeichert wird (pro Kapitel anders)
   LAST     – Knopf im letzten Abschnitt (z. B. „Weiter zu Kapitel 2 →“), leer = keiner
   END      – HTML, das ganz unten nach allen Abschnitten erscheint, leer = nichts */

/* Fortschritt wird nach Titel gespeichert, damit er beim Einfügen/Verschieben von Abschnitten erhalten bleibt.
   Alte Einträge (nach Position gespeichert) werden einmalig umgewandelt. */
let done=new Set();
try{done=new Set(JSON.parse(localStorage.getItem(KEY)||"[]").map(x=>typeof x==="number"?(CHAPTERS[x]||{}).title:x).filter(Boolean))}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify([...done]))}catch(e){}}

function media(c){
  const v=(c.video||"").trim();
  if(!v)return '<div class="ph"><div class="play">▶</div><div>Video folgt · ca. 40 Sek.</div></div>';
  if(/youtu\.?be/.test(v)){
    const m=v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
    if(m)return '<iframe src="https://www.youtube-nocookie.com/embed/'+m[1]+'?rel=0&playsinline=1" title="'+c.title+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>';
  }
  return '<video controls playsinline preload="metadata" src="'+v+'"></video>';
}

function progress(){
  const n=CHAPTERS.length,d=CHAPTERS.filter(c=>done.has(c.title)).length;
  document.getElementById("fill").style.width=(d/n*100)+"%";
  document.getElementById("cnt").textContent=d+" / "+n;
}

function subsHtml(c){
  if(!c.subs||!c.subs.length)return "";
  return '<div class="subs"><div class="subs-h">Mehr dazu – öffne, was dich interessiert</div>'+
    c.subs.map(d=>
      '<details class="sub"><summary>'+d.title+'</summary><div class="subbody"><div class="vid">'+media(d)+'</div>'+
      '<p class="lead">'+d.text+'</p>'+
      (d.points?'<ul class="pts">'+d.points.map(p=>'<li>'+p+'</li>').join("")+'</ul>':'')+
      '</div></details>').join("")+'</div>';
}

const root=document.getElementById("chapters");
CHAPTERS.forEach((c,i)=>{
  const last=i===CHAPTERS.length-1;
  const s=document.createElement("section");
  s.className="ch";s.id="k"+(i+1);
  s.innerHTML=
    '<div class="num">Abschnitt '+(i+1)+' / '+CHAPTERS.length+'</div>'+
    '<h2>'+c.title+'</h2>'+
    '<div class="vid">'+media(c)+'</div>'+
    '<p class="lead">'+c.text+'</p>'+
    '<ul class="pts">'+c.points.map(p=>'<li>'+p+'</li>').join("")+'</ul>'+
    subsHtml(c)+
    '<div class="actions"><button class="btn ghost" data-i="'+i+'"></button>'+
    (last?LAST:'<a class="btn" href="#k'+(i+2)+'">Weiter →</a>')+'</div>';
  root.appendChild(s);
});
root.insertAdjacentHTML("beforeend",END);

function paint(btn){
  const on=done.has(CHAPTERS[+btn.dataset.i].title);
  btn.classList.toggle("on",on);
  btn.textContent=on?"✓ completed":"erledigt?";
}
root.querySelectorAll("button[data-i]").forEach(b=>{
  paint(b);
  b.addEventListener("click",()=>{
    const i=+b.dataset.i,t=CHAPTERS[i].title;
    done.has(t)?done.delete(t):done.add(t);
    save();paint(b);progress();
    /* Beim Abhaken direkt zum nächsten Abschnitt springen */
    const next=document.getElementById("k"+(i+2));
    if(done.has(t)&&next)next.scrollIntoView({behavior:"smooth"});
  });
});
progress();

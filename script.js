(function(){
  document.getElementById('art2').src = document.getElementById('art').src;
  var target = new Date(2026, 10, 14, 16, 0, 0).getTime();
  var el = {d:document.getElementById('d'),h:document.getElementById('h'),m:document.getElementById('m'),s:document.getElementById('s')};
  var msg = document.getElementById('count-msg');
  function pad(n){return n<10?'0'+n:''+n}
  function tick(){
    var diff = target - Date.now();
    if(diff <= 0){
      el.d.textContent=el.h.textContent=el.m.textContent=el.s.textContent='00';
      msg.textContent = (Date.now() - target < 6*3600*1000) ? 'O chá começou! Venha celebrar com a gente 💗' : 'Obrigada a todos que celebraram com a Laura 💗';
      return;
    }
    var t = Math.floor(diff/1000);
    el.d.textContent = pad(Math.floor(t/86400));
    el.h.textContent = pad(Math.floor(t%86400/3600));
    el.m.textContent = pad(Math.floor(t%3600/60));
    el.s.textContent = pad(t%60);
    msg.textContent = 'até a chegada da nossa festa!';
  }
  tick(); setInterval(tick,1000);

  var qtd = 0, MAX = 10;
  var qEl = document.getElementById('qtd'), totalEl = document.getElementById('total');
  function render(){
    qEl.textContent = qtd;
    var tot = qtd + 1;
    totalEl.textContent = qtd === 0 ? 'Total: 1 pessoa (só você)' : 'Total: ' + tot + ' pessoas (você + ' + qtd + (qtd===1?' acompanhante)':' acompanhantes)');
  }
  document.getElementById('minus').onclick = function(){ if(qtd>0){qtd--;render();} };
  document.getElementById('plus').onclick = function(){ if(qtd<MAX){qtd++;render();} };

  var form = document.getElementById('form'), ok = document.getElementById('ok'),
      err = document.getElementById('err'), nome = document.getElementById('nome'), msgEl = document.getElementById('msg');

  function showOk(data){
    var tot = data.qtd + 1;
    document.getElementById('ok-text').textContent = 'Obrigada, ' + data.nome + '! Anotamos ' + tot + (tot===1?' pessoa':' pessoas') + ' para o chá da Laura, dia 14 de novembro às 16h.';
    var txt = 'Olá! Confirmo presença no chá de bebê da Laura (14/11 às 16h). Nome: ' + data.nome + '. Total de pessoas: ' + tot + '.' + (data.msg ? ' Recado: ' + data.msg : '');
    document.getElementById('wa').href = 'https://wa.me/qr/5XQ5B7ORHMKNL1' + encodeURIComponent(txt);
    form.style.display = 'none'; ok.style.display = 'block';
  }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var n = nome.value.trim();
    if(n.length < 2){ err.textContent = 'Por favor, digite seu nome.'; nome.focus(); return; }
    err.textContent = '';
    var data = {nome:n, qtd:qtd, msg:msgEl.value.trim()};
    try{ localStorage.setItem('rsvp-laura', JSON.stringify(data)); }catch(x){}
    saveShared(data);
    showOk(data);
  });
  document.getElementById('edit').onclick = function(){ ok.style.display='none'; form.style.display='grid'; };

  try{
    var saved = JSON.parse(localStorage.getItem('rsvp-laura') || 'null');
    if(saved && saved.nome){ nome.value = saved.nome; qtd = Math.min(MAX, saved.qtd||0); msgEl.value = saved.msg||''; render(); showOk(saved); }
  }catch(x){}

  /* Contagem compartilhada de confirmados (só funciona na página publicada) */
  var colRef = null, myId = null;
  function localId(){
    try{
      var k = localStorage.getItem('rsvp-laura-id');
      if(!k){ k = 'g' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('rsvp-laura-id', k); }
      return k;
    }catch(x){ return 'g' + Math.random().toString(36).slice(2); }
  }
  function showCount(total){
    document.getElementById('conf-n').textContent = total;
    document.getElementById('conf-t').textContent = total === 1 ? 'pessoa já confirmou presença 💗' : 'pessoas já confirmaram presença 💗';
    document.getElementById('confirmed').hidden = false;
  }
  function saveShared(data){
    if(!colRef || !myId) return;
    try{
      colRef.doc(myId).set({nome:data.nome, qtd:data.qtd, total:data.qtd+1, em:Date.now()}).catch(function(){});
    }catch(x){}
  }
  if(window.claude && window.claude.use){
    Promise.all([window.claude.use('db'), window.claude.use('user')]).then(function(r){
      var db = r[0], user = r[1];
      if(!db) return;
      var idp = (user && user.id) ? Promise.resolve(user.id()).catch(function(){return null;}) : Promise.resolve(null);
      return idp.then(function(id){
        myId = id || localId();
        colRef = db.collection('confirmacoes');
        colRef.onSnapshot(function(snap){
          var total = 0;
          snap.docs.forEach(function(d){ var x = d.data() || {}; total += Number(x.total) || 0; });
          showCount(total);
        }, function(){});
      });
    }).catch(function(){});
  }
  render();
})();

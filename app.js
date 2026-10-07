(() => {
const URL='https://qdcnzraotcfdupmnapqo.supabase.co';
const KEY='sb_publishable_UGo_9Ma67h0WPZdbuBU_cw_FGHgUEHH';
const supabase=window.supabase.createClient(URL,KEY);
const tg=window.Telegram?.WebApp;
if(tg){tg.ready();tg.expand();}
let all=[], current='all';

const $=id=>document.getElementById(id);
const status=$('status'), products=$('products');

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function money(v){return Number(v||0).toLocaleString('uk-UA')+' грн';}
function specs(p){
 if(p.category==='pc') return [p.cpu,p.gpu,p.ram,p.storage].filter(Boolean).join(' • ');
 return [p.memory,p.color,p.condition,p.battery].filter(Boolean).join(' • ');
}
function card(p){
 const pic=p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" onerror="this.style.display='none'">`:`<div class="placeholder">FORMA</div>`;
 return `<article class="card" data-id="${p.id}"><div class="pic">${pic}</div><div class="info"><div class="cat">${p.category==='pc'?'PC':'iPhone'}</div><div class="name">${esc(p.name)}</div><div class="spec">${esc(specs(p))}</div><div class="price">${money(p.price)}</div></div></article>`;
}
function render(){
 const list=current==='all'?all:all.filter(p=>p.category===current);
 products.innerHTML=list.length?list.map(card).join(''):'<div class="status">У цій категорії поки немає товарів.</div>';
 products.querySelectorAll('.card').forEach(x=>x.onclick=()=>openDetail(all.find(p=>String(p.id)===x.dataset.id)));
}
function openDetail(p){
 if(!p)return;
 const img=p.image?`<img class="detail-img" src="${esc(p.image)}" alt="${esc(p.name)}">`:`<div class="detail-img" style="display:flex;align-items:center;justify-content:center"><div class="placeholder">FORMA</div></div>`;
 const facts=p.category==='pc'
 ?[['CPU',p.cpu],['GPU',p.gpu],['RAM',p.ram],['Накопичувач',p.storage],['Гарантія',p.warranty]]
 :[['Памʼять',p.memory],['Колір',p.color],['Стан',p.condition],['АКБ',p.battery],['Гарантія',p.warranty]];
 const factHtml=facts.filter(x=>x[1]).map(x=>`<div class="fact">${esc(x[0])}<b>${esc(x[1])}</b></div>`).join('');
 const text=`Хочу придбати ${p.name} за ${money(p.price)}.`;
 const link='https://t.me/Sundayass?text='+encodeURIComponent(text);
 $('detailContent').innerHTML=`<div class="detail">${img}<div class="cat">${p.category==='pc'?'PC':'iPhone'}</div><h2>${esc(p.name)}</h2><div class="detail-price">${money(p.price)}</div><div class="facts">${factHtml}</div><a class="buy" href="${link}" target="_blank">ХОЧУ ПРИДБАТИ</a></div>`;
 $('detail').classList.remove('hidden');
}
function close(){ $('detail').classList.add('hidden'); }
$('closeDetail').onclick=close;$('closeBg').onclick=close;
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');current=b.dataset.cat;render();});
$('channelBtn').onclick=()=>location.href='https://t.me/StoreFORMA_bot?startapp';

async function load(){
 const {data,error}=await supabase.from('products').select('*').eq('available',true).order('id',{ascending:false});
 if(error){status.textContent='Не вдалося завантажити каталог. Спробуйте оновити сторінку.';return;}
 all=data||[];status.textContent=all.length?'':'Товарів поки немає.';
 render();
}
load();
})();
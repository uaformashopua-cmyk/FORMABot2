const SUPABASE_URL = "https://qdcnzraotcfdupmnapqo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_UGo_9Ma67h0WPZdbuBU_cw_FGHgUEHH";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const app = document.getElementById("admin-app");
let products = [];
let editingId = null;

function esc(v){
  return String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function price(v){return new Intl.NumberFormat("uk-UA").format(Number(v||0))+" грн"}

async function start(){
  const {data:{session}} = await supabase.auth.getSession();
  if(!session){
    renderLogin();
    return;
  }
  await loadProducts();
}

async function renderLogin(message=""){
  app.innerHTML = `
    <div class="center">
      <div style="width:min(420px,100%)">
        <div class="logo">FORMA</div>
        <p class="muted">Адмін-панель магазину</p>
        ${message ? `<div class="error">${esc(message)}</div>` : ""}
        <form id="loginForm" class="form" style="margin-top:18px">
          <div class="field"><label>Email</label><input id="email" type="email" required></div>
          <div class="field"><label>Пароль</label><input id="password" type="password" required></div>
          <button class="btn primary" type="submit">УВІЙТИ</button>
        </form>
      </div>
    </div>`;
  document.getElementById("loginForm").onsubmit = login;
}

async function login(e){
  e.preventDefault();
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value;
  const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error){renderLogin("Невірний email або пароль.");return;}
  await loadProducts();
}

async function logout(){
  await supabase.auth.signOut();
  renderLogin("Ви вийшли з акаунта.");
}

async function loadProducts(){
  app.innerHTML=`<div class="center"><div><div class="logo">FORMA</div><p class="muted">Завантаження товарів…</p></div></div>`;
  const {data,error}=await supabase.from("products").select("*").order("created_at",{ascending:false});
  if(error){
    app.innerHTML=`<div class="center"><div style="width:min(600px,100%)"><div class="logo">FORMA</div><div class="error">${esc(error.message)}</div><p class="muted">Якщо це помилка доступу — перевір SQL-політики для адміна.</p><button class="btn" onclick="loadProducts()">Спробувати ще раз</button></div></div>`;
    return;
  }
  products=data||[];
  renderDashboard();
}

function renderDashboard(){
  const iphone=products.filter(p=>String(p.category).toLowerCase()==="iphone").length;
  const pc=products.filter(p=>["pc","computer","комп'ютери"].includes(String(p.category).toLowerCase())).length;
  const available=products.filter(p=>p.available!==false).length;

  app.innerHTML=`
    <div class="shell">
      <div class="top">
        <div><div class="logo">FORMA</div><div class="muted">Адмін-панель</div></div>
        <div class="actions"><button class="btn primary" onclick="openProductForm()">+ Додати товар</button><button class="btn" onclick="logout()">Вийти</button></div>
      </div>
      <div class="stats">
        <div class="stat"><span class="muted">Всього товарів</span><strong>${products.length}</strong></div>
        <div class="stat"><span class="muted">iPhone / PC</span><strong>${iphone} / ${pc}</strong></div>
        <div class="stat"><span class="muted">В наявності</span><strong>${available}</strong></div>
      </div>
      <div class="toolbar">
        <button class="btn" onclick="loadProducts()">↻ Оновити</button>
        <button class="btn" onclick="filterProducts('all')">Всі</button>
        <button class="btn" onclick="filterProducts('iphone')">iPhone</button>
        <button class="btn" onclick="filterProducts('pc')">PC</button>
      </div>
      <div id="table"></div>
    </div>`;
  drawTable(products);
}

function filterProducts(type){
  if(type==="all") drawTable(products);
  else drawTable(products.filter(p=>String(p.category).toLowerCase()===type));
}

function drawTable(list){
  document.getElementById("table").innerHTML=`
    <div class="table-wrap"><table>
      <thead><tr><th>Фото</th><th>Товар</th><th>Категорія</th><th>Ціна</th><th>Наявність</th><th>Дії</th></tr></thead>
      <tbody>
        ${list.map(p=>`
          <tr>
            <td>${p.image ? `<img class="thumb" src="${esc(p.image)}" onerror="this.style.display='none'">` : `<div class="thumb">${String(p.category).toLowerCase()==="iphone"?"📱":"🖥️"}</div>`}</td>
            <td><strong>${esc(p.name)}</strong><br><span class="muted">${esc(p.warranty||"")}</span></td>
            <td>${esc(p.category)}</td>
            <td>${price(p.price)}</td>
            <td>${p.available!==false ? '<span style="color:#62d98b">Так</span>' : '<span style="color:#ff7777">Ні</span>'}</td>
            <td><div class="actions"><button class="btn" onclick="openProductForm('${esc(p.id)}')">Редагувати</button><button class="btn danger" onclick="deleteProduct('${esc(p.id)}')">Видалити</button></div></td>
          </tr>`).join("")}
      </tbody>
    </table></div>`;
}

function openProductForm(id=null){
  editingId=id;
  const p=id ? products.find(x=>String(x.id)===String(id)) : {};
  const isIphone=String(p.category||"iphone").toLowerCase()==="iphone";
  document.body.insertAdjacentHTML("beforeend",`
    <div class="modal-bg" id="modal">
      <div class="modal">
        <h2>${id?"Редагувати товар":"Новий товар"}</h2>
        <form id="productForm" class="form">
          <div class="grid2">
            <div class="field"><label>Назва</label><input id="f_name" required value="${esc(p.name)}"></div>
            <div class="field"><label>Категорія</label><select id="f_category"><option value="iphone" ${isIphone?"selected":""}>iPhone</option><option value="pc" ${!isIphone?"selected":""}>PC</option></select></div>
          </div>
          <div class="grid2">
            <div class="field"><label>Ціна, грн</label><input id="f_price" type="number" min="0" required value="${esc(p.price??0)}"></div>
            <div class="field"><label>Посилання на фото</label><input id="f_image" type="url" value="${esc(p.image)}" placeholder="https://..."></div>
          </div>
          <div class="grid2">
            <div class="field"><label>Пам'ять / RAM</label><input id="f_memory" value="${esc(p.memory)}" placeholder="128 GB / 16 GB"></div>
            <div class="field"><label>Колір</label><input id="f_color" value="${esc(p.color)}"></div>
          </div>
          <div class="grid2">
            <div class="field"><label>Стан</label><input id="f_condition" value="${esc(p.condition)}"></div>
            <div class="field"><label>Акумулятор</label><input id="f_battery" value="${esc(p.battery)}"></div>
          </div>
          <div class="grid2">
            <div class="field"><label>CPU</label><input id="f_cpu" value="${esc(p.cpu)}"></div>
            <div class="field"><label>GPU</label><input id="f_gpu" value="${esc(p.gpu)}"></div>
          </div>
          <div class="grid2">
            <div class="field"><label>RAM</label><input id="f_ram" value="${esc(p.ram)}"></div>
            <div class="field"><label>Storage</label><input id="f_storage" value="${esc(p.storage)}"></div>
          </div>
          <div class="field"><label>Гарантія</label><input id="f_warranty" value="${esc(p.warranty)}"></div>
          <label class="check"><input id="f_available" type="checkbox" ${p.available!==false?"checked":""}> Товар в наявності</label>
          <div class="modal-actions"><button type="button" class="btn" onclick="closeModal()">Скасувати</button><button class="btn primary" type="submit">Зберегти</button></div>
        </form>
      </div>
    </div>`);
  document.getElementById("productForm").onsubmit=saveProduct;
}

function closeModal(){document.getElementById("modal")?.remove()}

async function saveProduct(e){
  e.preventDefault();
  const row={
    name:document.getElementById("f_name").value.trim(),
    category:document.getElementById("f_category").value,
    price:Number(document.getElementById("f_price").value||0),
    image:document.getElementById("f_image").value.trim()||null,
    memory:document.getElementById("f_memory").value.trim()||null,
    color:document.getElementById("f_color").value.trim()||null,
    condition:document.getElementById("f_condition").value.trim()||null,
    battery:document.getElementById("f_battery").value.trim()||null,
    cpu:document.getElementById("f_cpu").value.trim()||null,
    gpu:document.getElementById("f_gpu").value.trim()||null,
    ram:document.getElementById("f_ram").value.trim()||null,
    storage:document.getElementById("f_storage").value.trim()||null,
    warranty:document.getElementById("f_warranty").value.trim()||null,
    available:document.getElementById("f_available").checked
  };
  let result;
  if(editingId){
    result=await supabase.from("products").update(row).eq("id",editingId);
  }else{
    result=await supabase.from("products").insert(row);
  }
  if(result.error){alert("Помилка: "+result.error.message);return}
  closeModal();
  await loadProducts();
}

async function deleteProduct(id){
  const p=products.find(x=>String(x.id)===String(id));
  if(!p || !confirm(`Видалити "${p.name}"?`)) return;
  const {error}=await supabase.from("products").delete().eq("id",id);
  if(error){alert("Помилка: "+error.message);return}
  await loadProducts();
}

window.openProductForm=openProductForm;
window.closeModal=closeModal;
window.saveProduct=saveProduct;
window.deleteProduct=deleteProduct;
window.filterProducts=filterProducts;
window.loadProducts=loadProducts;
window.logout=logout;

supabase.auth.onAuthStateChange((_event,session)=>{
  if(!session) renderLogin();
});

start();

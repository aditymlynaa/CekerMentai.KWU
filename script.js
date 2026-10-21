/* ====== PENGATURAN TOKO — ubah di sini ====== */
const NO_WA_PENJUAL = "6281234567890";           // format 62, tanpa 0 / +
const INFO_PO = "Batch terdekat: pengiriman Sabtu & Minggu. Kuota terbatas.";
const TANGGAL_PO = ["Sabtu, 25 Okt 2026","Minggu, 26 Okt 2026","Sabtu, 1 Nov 2026"]; // batch PO
const LEVEL = ["Level 0 (Original)","Level 1 (Pedas Ringan)","Level 2 (Pedas Sedang)","Level 3 (Pedas)","Level 4 (Sangat Pedas)","Level 5 (Extra Mercon)"];
const TOPPING = [
  {n:"Keju Mozzarella",h:5000},{n:"Telur Puyuh",h:4000},{n:"Bakso",h:4000},
  {n:"Sosis",h:4000},{n:"Dumpling",h:5000},{n:"Tahu Bakso",h:3000}
];
const PRODUK = [
  {id:"p1",n:"Ceker Original Box",e:"🍗",h:25000,d:"Isi 10 pcs ceker empuk, bumbu gurih khas rumahan."},
  {id:"p2",n:"Ceker Pedas Daun Jeruk",e:"🌶️",h:28000,d:"Isi 10 pcs, harum daun jeruk dengan cabai segar."},
  {id:"p3",n:"Ceker Mercon Jumbo",e:"🔥",h:45000,d:"Isi 20 pcs untuk berbagi. Cocok untuk pecinta pedas."},
  {id:"p4",n:"Ceker Boneless",e:"🥘",h:35000,d:"Tanpa tulang, isi 150 gram, praktis dimakan."}
];
/* ============================================ */
 
// Rapikan nomor: boleh ditulis 0812..., +62812..., atau 62812...
const noWA = n => { n = String(n).replace(/\D/g,""); if(n.startsWith("0")) n = "62"+n.slice(1); else if(n.startsWith("8")) n = "62"+n; return n; };
const NOMOR_CONTOH = "6281234567890";
 
const rp = n => "Rp " + n.toLocaleString("id-ID");
const $ = id => document.getElementById(id);
let cart = [];
try { cart = JSON.parse(localStorage.getItem("po_cart")||"[]"); } catch(e){ cart = []; }
const save = () => { try{ localStorage.setItem("po_cart", JSON.stringify(cart)); }catch(e){} };
let cur = null, qty = 1;
 
$("poInfo").textContent = INFO_PO;
$("grid").innerHTML = PRODUK.map(p => `
  <article class="card"><div class="thumb" aria-hidden="true">${p.e}</div>
  <div class="body"><h3>${p.n}</h3><p>${p.d}</p><div class="price">${rp(p.h)}</div>
  <button class="btn" data-id="${p.id}">Pilih topping &amp; PO</button></div></article>`).join("");
$("grid").onclick = e => { const b = e.target.closest("button[data-id]"); if (b) openModal(b.dataset.id); };
 
function openModal(id){
  cur = PRODUK.find(p => p.id === id); qty = 1;
  $("mName").textContent = cur.n; $("mBase").textContent = rp(cur.h);
  $("mLevel").innerHTML = LEVEL.map((l,i)=>`<label class="opt"><input type="radio" name="lv" value="${i}" ${i===0?"checked":""}>${l}</label>`).join("");
  $("mTop").innerHTML = TOPPING.map((t,i)=>`<label class="opt"><input type="checkbox" name="tp" value="${i}">${t.n}<em>+${rp(t.h)}</em></label>`).join("");
  $("mDate").innerHTML = `<option value="">— Pilih tanggal —</option>` + TANGGAL_PO.map(t=>`<option>${t}</option>`).join("");
  $("mErr").textContent = ""; $("mQty").textContent = 1; calc();
  $("modal").classList.add("open");
}
function picked(){ return [...document.querySelectorAll('input[name=tp]:checked')].map(c=>TOPPING[+c.value]); }
function unit(){ return cur.h + picked().reduce((s,t)=>s+t.h,0); }
function calc(){ $("mSub").textContent = rp(unit()*qty); }
$("modal").addEventListener("change", calc);
$("mPlus").onclick = () => { qty++; $("mQty").textContent = qty; calc(); };
$("mMin").onclick = () => { if(qty>1){ qty--; $("mQty").textContent = qty; calc(); } };
$("mCancel").onclick = () => $("modal").classList.remove("open");
$("mAdd").onclick = () => {
  if (!$("mDate").value){ $("mErr").textContent = "Pilih tanggal kirim PO dulu."; return; }
  const lv = document.querySelector('input[name=lv]:checked').value;
  const tp = picked();
  cart.push({nama:cur.n, level:LEVEL[lv], topping:tp.map(t=>t.n), tanggalPO:$("mDate").value, qty, unit:unit()});
  save(); render(); $("modal").classList.remove("open");
};
 
function total(){ return cart.reduce((s,i)=>s+i.unit*i.qty,0); }
function render(){
  $("count").textContent = cart.reduce((s,i)=>s+i.qty,0);
  $("total").textContent = rp(total());
  $("checkout").style.display = cart.length ? "block" : "none";
  $("cartList").innerHTML = cart.length ? cart.map((i,x)=>`
    <div class="item"><b>${i.nama}</b>
      <small>${i.level} · ${i.topping.length?i.topping.join(", "):"Tanpa topping"}</small>
      <small>Kirim PO: ${i.tanggalPO}</small>
      <div class="row" style="justify-content:space-between;margin-top:6px">
        <div class="qty"><button data-a="min" data-i="${x}" aria-label="Kurangi">−</button><b>${i.qty}</b><button data-a="plus" data-i="${x}" aria-label="Tambah">+</button></div>
        <b>${rp(i.unit*i.qty)}</b>
        <button data-a="del" data-i="${x}" class="btn ghost" style="width:auto;padding:6px 10px">Hapus</button>
      </div></div>`).join("") : `<div class="empty">Keranjang masih kosong. Pilih ceker dulu, ya.</div>`;
}
$("cartList").onclick = e => {
  const b = e.target.closest("button[data-a]"); if(!b) return;
  const i = +b.dataset.i;
  if (b.dataset.a==="plus") cart[i].qty++;
  if (b.dataset.a==="min") cart[i].qty = Math.max(1, cart[i].qty-1);
  if (b.dataset.a==="del") cart.splice(i,1);
  save(); render();
};
$("fab").onclick = () => $("cartM").classList.add("open");
$("cClose").onclick = () => $("cartM").classList.remove("open");
[$("modal"),$("cartM")].forEach(o => o.addEventListener("click", e => { if(e.target===o) o.classList.remove("open"); }));
document.addEventListener("keydown", e => { if(e.key==="Escape") document.querySelectorAll(".overlay").forEach(o=>o.classList.remove("open")); });
 
$("send").onclick = () => {
  const nama = $("nama").value.trim(), hp = $("wa").value.trim(), alamat = $("alamat").value.trim();
  if (!cart.length) return;
  if (!nama || !hp || !alamat){ $("cErr").textContent = "Isi nama, nomor WhatsApp, dan alamat lengkap."; return; }
  if (noWA(NO_WA_PENJUAL) === NOMOR_CONTOH){ $("cErr").textContent = "Nomor WA penjual belum diganti. Edit NO_WA_PENJUAL di script.js."; return; }
  $("cErr").textContent = "";
  let p = "Halo Admin, saya mau konfirmasi Pre-Order Ceker:\n\n";
  cart.forEach((it,i)=>{
    p += `${i+1}. *${it.nama}* (${it.qty}x)\n`;
    p += `   - Level: ${it.level}\n`;
    p += `   - Topping: ${it.topping.length?it.topping.join(", "):"-"}\n`;
    p += `   - Tanggal Kirim PO: ${it.tanggalPO}\n`;
    p += `   - Subtotal: ${rp(it.unit*it.qty)}\n\n`;
  });
  p += `💰 *TOTAL:* ${rp(total())}\n\n👤 *DATA PEMESAN:*\n`;
  p += `- Nama: ${nama}\n- No. WA: ${hp}\n- Alamat: ${alamat}\n- Opsi Kirim: ${$("kirim").value}\n\n`;
  p += "Mohon info total ongkir & nomor rekening pembayaran. Terima kasih!";
  // HP: api.whatsapp.com membuka aplikasi WA langsung ke chat penjual.
  // Laptop/PC: web.whatsapp.com langsung masuk ke chat (tanpa halaman perantara wa.me).
  const nomor = noWA(NO_WA_PENJUAL), teks = encodeURIComponent(p);
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const url = mobile
    ? `https://api.whatsapp.com/send?phone=${nomor}&text=${teks}`
    : `https://web.whatsapp.com/send?phone=${nomor}&text=${teks}`;
  const w = window.open(url, "_blank");
  if (!w) { window.location.href = url; return; } // popup diblokir: buka di tab ini, keranjang tetap aman
 
  // Pesanan terkirim: kosongkan keranjang & form
  cart = []; save(); render();
  ["nama","wa","alamat"].forEach(id => $(id).value = "");
  $("cartM").classList.remove("open");
  toast("Pesanan dikirim ke WhatsApp. Terima kasih!");
};
 
function toast(msg){
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg; t.setAttribute("role","status");
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}
render();
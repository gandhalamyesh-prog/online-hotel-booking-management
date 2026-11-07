const adminLoginForm = document.getElementById('adminLoginForm');
adminLoginForm?.addEventListener('submit', async e => {
  e.preventDefault(); const msg=document.getElementById('message');
  try { const data=Object.fromEntries(new FormData(adminLoginForm).entries()); const r=await api('/api/admin/login',{method:'POST',body:JSON.stringify(data)}); showMessage(msg,r.message); location.href='admin-dashboard.html'; }
  catch(err){showMessage(msg,err.message,true);}
});
document.getElementById('adminLogout')?.addEventListener('click', async()=>{try{await api('/api/admin/logout',{method:'POST',body:'{}'});location.href='admin-login.html';}catch(e){location.href='admin-login.html';}});
(async()=>{
  const stats=document.getElementById('stats');
  if(stats){try{const s=await api('/api/admin/stats');stats.innerHTML=[['Customers',s.customers],['Total Rooms',s.rooms],['Available Rooms',s.available],['Bookings',s.bookings]].map(([k,v])=>`<div class="stat-card"><span>${k}</span><strong>${v}</strong></div>`).join('');}catch(e){document.getElementById('message').textContent=e.message;setTimeout(()=>location.href='admin-login.html',900);}}
  if(document.getElementById('roomsTable')) loadAdminRooms();
  if(document.getElementById('bookingsTable')) loadAdminBookings();
})();
const roomForm=document.getElementById('roomForm');
roomForm?.addEventListener('submit',async e=>{
  e.preventDefault();const msg=document.getElementById('message');const v=Object.fromEntries(new FormData(roomForm).entries());const id=v.room_id;delete v.room_id;
  try{const r=await api(id?`/api/admin/rooms/${id}`:'/api/admin/rooms',{method:id?'PUT':'POST',body:JSON.stringify(v)});showMessage(msg,r.message);roomForm.reset();roomForm.elements.room_id.value='';loadAdminRooms();}
  catch(err){showMessage(msg,err.message,true);}
});
document.getElementById('clearRoom')?.addEventListener('click',()=>{roomForm.elements.room_id.value='';});
async function loadAdminRooms(){
  const target=document.getElementById('roomsTable');
  try{const rows=await api('/api/admin/rooms');if(!rows.length){target.innerHTML='<div class="empty">No rooms added yet.</div>';return;}
  target.innerHTML=`<table><thead><tr><th>ID</th><th>Room No.</th><th>Type</th><th>Price</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.room_id}</td><td>${safe(r.room_number)}</td><td>${safe(r.room_type)}</td><td>${money(r.price)}</td><td>${r.capacity}</td><td>${safe(r.status)}</td><td><button class="btn btn-outline" data-edit="${r.room_id}">Edit</button> <button class="btn btn-outline" data-delete="${r.room_id}">Delete</button></td></tr>`).join('')}</tbody></table>`;
  target.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{const r=rows.find(x=>x.room_id==b.dataset.edit);for(const k of ['room_id','room_number','room_type','price','capacity','status'])roomForm.elements[k].value=r[k];roomForm.scrollIntoView({behavior:'smooth'});});
  target.querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{if(!confirm('Delete this room?'))return;try{const r=await api(`/api/admin/rooms/${b.dataset.delete}`,{method:'DELETE'});showMessage(document.getElementById('message'),r.message);loadAdminRooms();}catch(e){showMessage(document.getElementById('message'),e.message,true);}});
  }catch(e){showMessage(document.getElementById('message'),e.message,true);setTimeout(()=>location.href='admin-login.html',1000);}
}
async function loadAdminBookings(){
  const target=document.getElementById('bookingsTable');
  try{const rows=await api('/api/admin/bookings');if(!rows.length){target.innerHTML='<div class="empty">No customer bookings yet.</div>';return;}
  target.innerHTML=`<table><thead><tr><th>Booking</th><th>Customer</th><th>Phone</th><th>Room</th><th>Dates</th><th>Total</th><th>Status</th><th>Update</th></tr></thead><tbody>${rows.map(b=>`<tr><td>${b.booking_id}</td><td>${safe(b.name)}<br><small>${safe(b.email)}</small></td><td>${safe(b.phone)}</td><td>${safe(b.room_type)} (${safe(b.room_number)})</td><td>${b.check_in_date} → ${b.check_out_date}</td><td>${money(b.total_amount)}</td><td>${safe(b.status)}</td><td><select data-status="${b.booking_id}"><option ${b.status==='Confirmed'?'selected':''}>Confirmed</option><option ${b.status==='Cancelled'?'selected':''}>Cancelled</option><option ${b.status==='Completed'?'selected':''}>Completed</option></select></td></tr>`).join('')}</tbody></table>`;
  target.querySelectorAll('[data-status]').forEach(s=>s.addEventListener('change',async()=>{try{const r=await api(`/api/admin/bookings/${s.dataset.status}/status`,{method:'PATCH',body:JSON.stringify({status:s.value})});showMessage(document.getElementById('message'),r.message);}catch(e){showMessage(document.getElementById('message'),e.message,true);}}));
  }catch(e){showMessage(document.getElementById('message'),e.message,true);setTimeout(()=>location.href='admin-login.html',1000);}
}
function safe(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

(async () => {
  const target = document.getElementById('bookingList'), msg = document.getElementById('message');
  try {
    const rows = await api('/api/customers/my-bookings');
    if (!rows.length) { target.innerHTML = '<div class="empty">You have no bookings yet. <a href="rooms.html">Explore rooms</a>.</div>'; return; }
    target.innerHTML = `<table><thead><tr><th>Booking ID</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Total</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows.map(b=>`<tr><td>${b.booking_id}</td><td>${safe(b.room_type)} (${safe(b.room_number)})</td><td>${b.check_in_date}</td><td>${b.check_out_date}</td><td>${money(b.total_amount)}</td><td><span class="status ${b.status.toLowerCase()}">${b.status}</span></td><td>${b.status==='Confirmed'?`<button class="btn btn-outline" data-cancel="${b.booking_id}">Cancel</button>`:'—'}</td></tr>`).join('')}</tbody></table>`;
    target.querySelectorAll('[data-cancel]').forEach(btn=>btn.addEventListener('click', async()=>{
      if(!confirm('Cancel this reservation?')) return;
      try { const result=await api(`/api/bookings/${btn.dataset.cancel}/cancel`,{method:'PATCH',body:'{}'}); showMessage(msg,result.message); location.reload(); }
      catch(e){showMessage(msg,e.message,true);}
    }));
  } catch(e) { showMessage(msg, e.message, true); if(e.message.includes('log in')) setTimeout(()=>location.href='login.html',1000); }
})();
function safe(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

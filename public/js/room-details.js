(async () => {
  const id = new URLSearchParams(location.search).get('room_id');
  const target = document.getElementById('roomDetails');
  if (!id) { target.textContent = 'No room was selected.'; return; }
  try {
    const r = await api(`/api/rooms/${encodeURIComponent(id)}`);
    target.innerHTML = `<p class="eyebrow">ROOM INFORMATION</p><h1>${safe(r.room_type)} Room</h1><p>Room number: <strong>${safe(r.room_number)}</strong></p><p>Room type: ${safe(r.room_type)}</p><p>Capacity: ${r.capacity} guest(s)</p><p>Price: <strong>${money(r.price)} per night</strong></p><p>Status: ${safe(r.status)}</p><a class="btn btn-primary" href="booking.html?room_id=${r.room_id}">Book This Room</a> <a class="btn btn-outline" href="rooms.html">Back to Rooms</a>`;
  } catch (e) { target.textContent = e.message; }
})();
function safe(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

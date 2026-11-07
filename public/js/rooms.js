const grid = document.getElementById('roomGrid');
const searchForm = document.getElementById('searchForm');
const message = document.getElementById('message');
const today = new Date().toISOString().slice(0,10);
searchForm.elements.check_in_date.min = today;
searchForm.elements.check_out_date.min = today;
searchForm.elements.check_in_date.addEventListener('change', () => {
  searchForm.elements.check_out_date.min = searchForm.elements.check_in_date.value || today;
});
function renderRooms(rooms) {
  if (!rooms.length) { grid.innerHTML = '<div class="empty">No rooms match your search. Try different dates or filters.</div>'; return; }
  grid.innerHTML = rooms.map(r => `<article class="room-card"><div class="room-visual">▣</div><div class="room-body"><h3>${escapeHtml(r.room_type)} Room</h3><div class="room-meta"><span>Room ${escapeHtml(r.room_number)}</span><span>Up to ${r.capacity} guest(s)</span><span>${escapeHtml(r.status)}</span></div><p class="price">${money(r.price)} <small>/ night</small></p><div class="room-actions"><a class="btn btn-primary" href="booking.html?room_id=${r.room_id}">Book Now</a><a class="btn btn-outline" href="room-details.html?room_id=${r.room_id}">View Details</a></div></div></article>`).join('');
}
function escapeHtml(v) { return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
async function loadRooms(params = '') {
  try { const rooms = await api(`/api/rooms${params}`); renderRooms(rooms); showMessage(message, `${rooms.length} room(s) found.`); }
  catch (err) { showMessage(message, err.message, true); }
}
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(searchForm).entries());
  if (values.check_in_date && values.check_out_date && values.check_out_date <= values.check_in_date) {
    showMessage(message, 'Check-out date must be after check-in date.', true); return;
  }
  const params = new URLSearchParams(Object.fromEntries(Object.entries(values).filter(([,v]) => v)));
  loadRooms(`?${params.toString()}`);
});
loadRooms();

const form = document.getElementById('bookingForm');
const msg = document.getElementById('message');
const roomId = new URLSearchParams(location.search).get('room_id');
let selectedPrice = 0;
(async () => {
  if (!roomId) { showMessage(msg, 'Please select a room first.', true); return; }
  try {
    const r = await api(`/api/rooms/${encodeURIComponent(roomId)}`);
    selectedPrice = Number(r.price);
    form.elements.room_id.value = r.room_id;
    document.getElementById('selectedRoom').textContent = `${r.room_type} Room • Room ${r.room_number} • ${money(r.price)} per night`;
  } catch(e) { showMessage(msg, e.message, true); }
})();
const today = new Date().toISOString().slice(0,10);
form.elements.check_in_date.min = today;
form.elements.check_out_date.min = today;
form.elements.check_in_date.addEventListener('change', () => form.elements.check_out_date.min = form.elements.check_in_date.value || today);
function updateEstimate() {
  const a = form.elements.check_in_date.value, b = form.elements.check_out_date.value;
  if (a && b && b > a) {
    const nights = Math.round((new Date(b+'T00:00:00') - new Date(a+'T00:00:00')) / 86400000);
    document.getElementById('estimate').textContent = `${nights} night(s) • Estimated total: ${money(nights * selectedPrice)}`;
  } else document.getElementById('estimate').textContent = '';
}
form.elements.check_in_date.addEventListener('change', updateEstimate);
form.elements.check_out_date.addEventListener('change', updateEstimate);
form.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    const result = await api('/api/bookings', { method:'POST', body:JSON.stringify({
      room_id: form.elements.room_id.value,
      check_in_date: form.elements.check_in_date.value,
      check_out_date: form.elements.check_out_date.value
    })});
    showMessage(msg, `${result.message} Booking ID: ${result.booking_id}. Total: ${money(result.total_amount)}`);
    setTimeout(() => location.href = 'my-bookings.html', 1600);
  } catch(err) { showMessage(msg, err.message, true); }
});

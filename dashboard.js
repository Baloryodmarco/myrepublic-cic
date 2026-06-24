const leadsBody = document.getElementById('leadsBody');
const statusFilter = document.getElementById('statusFilter');
const clearDataBtn = document.getElementById('clearDataBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');

const statuses = [
  'Baru Masuk',
  'Sudah Dihubungi',
  'Menunggu Verifikasi Coverage',
  'Menunggu Jadwal Teknisi',
  'Proses Pemasangan',
  'Berhasil Terpasang',
  'Tidak Lanjut',
];

function getLeads() {
  try { return JSON.parse(localStorage.getItem('myrepLeads') || '[]'); }
  catch { return []; }
}

function setLeads(leads) {
  localStorage.setItem('myrepLeads', JSON.stringify(leads));
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function waLink(number, name) {
  const normalized = String(number || '').replace(/\D/g, '').replace(/^0/, '62');
  const text = encodeURIComponent(`Halo Kak ${name || ''}, saya Maura dari MyRepublic CIC. Saya ingin follow-up pengajuan pemasangan internet.`);
  return `https://wa.me/${normalized}?text=${text}`;
}

function updateLeadStatus(id, value) {
  const leads = getLeads().map((lead) => lead.id === id ? { ...lead, requestStatus: value } : lead);
  setLeads(leads);
  renderLeads();
}

function renderLeads() {
  const filter = statusFilter?.value || '';
  const leads = getLeads().filter((lead) => !filter || lead.requestStatus === filter);
  if (!leads.length) {
    leadsBody.innerHTML = '<tr><td colspan="8">Belum ada leads untuk ditampilkan.</td></tr>';
    return;
  }
  leadsBody.innerHTML = leads.map((lead) => {
    const address = [lead.address, lead.village, lead.district, lead.city].filter(Boolean).join(', ');
    const options = statuses.map((status) => `<option ${lead.requestStatus === status ? 'selected' : ''}>${status}</option>`).join('');
    return `
      <tr>
        <td>${formatDate(lead.createdAt)}</td>
        <td><strong>${lead.fullName || '-'}</strong><br><span class="muted">${lead.propertyType || '-'}</span></td>
        <td><a class="btn btn-small btn-outline" href="${waLink(lead.whatsapp, lead.fullName)}" target="_blank" rel="noopener">Chat WA</a><br><span class="muted">${lead.whatsapp || '-'}</span></td>
        <td>${address || '-'}<br>${lead.mapsUrl ? `<a href="${lead.mapsUrl}" target="_blank" rel="noopener">Buka Maps</a>` : '<span class="muted">GPS belum ada</span>'}</td>
        <td>${lead.packageName || '-'}</td>
        <td>${lead.coverageStatus || '-'}</td>
        <td><select class="status-select" data-id="${lead.id}">${options}</select></td>
        <td>${lead.notes || '-'}<br><span class="muted">Patokan: ${lead.landmark || '-'}</span></td>
      </tr>
    `;
  }).join('');
  document.querySelectorAll('.status-select').forEach((select) => {
    select.addEventListener('change', () => updateLeadStatus(select.dataset.id, select.value));
  });
}

function exportCsv() {
  const leads = getLeads();
  const headers = ['Tanggal','Nama','WhatsApp','Email','Alamat','Kota','Kecamatan','Kelurahan','RT/RW','Patokan','Jenis Tempat','Latitude','Longitude','Akurasi','Google Maps','Paket','Promo','Coverage','Status','Catatan'];
  const rows = leads.map((lead) => [
    lead.createdAt, lead.fullName, lead.whatsapp, lead.email, lead.address, lead.city, lead.district, lead.village, lead.rtrw, lead.landmark, lead.propertyType,
    lead.latitude, lead.longitude, lead.accuracy, lead.mapsUrl, lead.packageName, lead.promo, lead.coverageStatus, lead.requestStatus, lead.notes
  ]);
  const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value || '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-myrepublic-cic-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

statusFilter?.addEventListener('change', renderLeads);
clearDataBtn?.addEventListener('click', () => {
  if (confirm('Hapus semua data demo di browser ini?')) {
    localStorage.removeItem('myrepLeads');
    renderLeads();
  }
});
exportCsvBtn?.addEventListener('click', exportCsv);
renderLeads();

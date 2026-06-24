const SALES_WA = '6281327424953';
const defaultWaText = encodeURIComponent('Halo Kak Maura, saya tertarik memasang MyRepublic. Saya ingin cek coverage dan konsultasi paket.');
const waUrl = `https://wa.me/${SALES_WA}?text=${defaultWaText}`;
['waTop', 'waHero', 'waBottom', 'waFloat'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.href = waUrl;
});

const getLocationBtn = document.getElementById('getLocationBtn');
const locationResult = document.getElementById('locationResult');
const latInput = document.getElementById('latitude');
const lngInput = document.getElementById('longitude');
const accInput = document.getElementById('accuracy');
const mapsInput = document.getElementById('mapsUrl');

function setLocationUI({ latitude, longitude, accuracy }) {
  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  latInput.value = latitude;
  lngInput.value = longitude;
  accInput.value = Math.round(accuracy || 0);
  mapsInput.value = mapsUrl;
  locationResult.innerHTML = `
    <h3>Lokasi berhasil diambil</h3>
    <p><strong>Latitude:</strong> ${latitude}</p>
    <p><strong>Longitude:</strong> ${longitude}</p>
    <p><strong>Akurasi:</strong> ±${Math.round(accuracy || 0)} meter</p>
    <a class="btn btn-outline" href="${mapsUrl}" target="_blank" rel="noopener">Buka di Google Maps</a>
  `;
}

if (getLocationBtn) {
  getLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      locationResult.innerHTML = '<p class="muted">Browser Anda belum mendukung fitur geolocation.</p>';
      return;
    }
    locationResult.innerHTML = '<p class="muted">Mengambil lokasi perangkat...</p>';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocationUI({
          latitude: latitude.toFixed(7),
          longitude: longitude.toFixed(7),
          accuracy,
        });
      },
      () => {
        locationResult.innerHTML = '<p class="muted">Lokasi gagal diambil. Pastikan izin lokasi diaktifkan, lalu coba lagi.</p>';
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

const packageSelect = document.getElementById('packageSelect');
document.querySelectorAll('.choose-package').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.package-card');
    const packageName = card?.dataset.package;
    if (packageName && packageSelect) {
      packageSelect.value = packageName;
      document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

const leadForm = document.getElementById('leadForm');
const formMessage = document.getElementById('formMessage');

function getLeads() {
  try { return JSON.parse(localStorage.getItem('myrepLeads') || '[]'); }
  catch { return []; }
}

function saveLead(lead) {
  const leads = getLeads();
  leads.unshift(lead);
  localStorage.setItem('myrepLeads', JSON.stringify(leads));
}

if (leadForm) {
  leadForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(leadForm);
    const lead = Object.fromEntries(formData.entries());
    lead.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    lead.createdAt = new Date().toISOString();
    lead.coverageStatus = lead.latitude && lead.longitude ? 'Menunggu Verifikasi Coverage' : 'Belum ada titik GPS';
    lead.requestStatus = 'Baru Masuk';
    lead.mapsUrl = lead.mapsUrl || '';
    saveLead(lead);
    formMessage.textContent = 'Pengajuan berhasil dikirim. Data demo tersimpan dan bisa dilihat di Dashboard.';
    leadForm.reset();
    locationResult.innerHTML = '<p class="muted">Koordinat belum diambil.</p>';
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
  });
}

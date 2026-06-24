const SALES_WA = '6281327424953';
const SUPABASE_URL = 'https://oxhdvcewariltlcsqeqq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_J8dJT0lq5pF6Du8Xj_R4Aw_kBdXbPuX';

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

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function getSource() {
  const params = new URLSearchParams(window.location.search);
  return params.get('source') || params.get('utm_source') || 'website';
}

function buildLeadPayload(formData) {
  const latitude = formData.get('latitude');
  const longitude = formData.get('longitude');
  const accuracy = formData.get('accuracy');

  return {
    full_name: formData.get('fullName')?.trim(),
    whatsapp: formData.get('whatsapp')?.trim(),
    email: formData.get('email')?.trim() || null,
    preferred_contact_time: formData.get('contactTime') || null,

    full_address: formData.get('address')?.trim(),
    city: formData.get('city')?.trim() || null,
    district: formData.get('district')?.trim() || null,
    village: formData.get('village')?.trim() || null,
    rt_rw: formData.get('rtrw')?.trim() || null,
    landmark: formData.get('landmark')?.trim() || null,
    place_type: formData.get('propertyType') || null,

    latitude: toNumberOrNull(latitude),
    longitude: toNumberOrNull(longitude),
    location_accuracy: toNumberOrNull(accuracy),
    maps_url: formData.get('mapsUrl') || null,

    package_name: formData.get('packageName') || null,
    promo_name: formData.get('promo')?.trim() || null,
    notes: formData.get('notes')?.trim() || null,

    consent: formData.get('consent') === 'on',
    coverage_status: latitude && longitude ? 'pending_verification' : 'no_gps',
    lead_status: 'new',
    source: getSource(),
    user_agent: navigator.userAgent,
  };
}

function saveLeadBackup(payload) {
  try {
    const backups = JSON.parse(localStorage.getItem('myrepLeadBackups') || '[]');
    backups.unshift({ ...payload, backup_created_at: new Date().toISOString() });
    localStorage.setItem('myrepLeadBackups', JSON.stringify(backups.slice(0, 30)));
  } catch (error) {
    console.warn('Backup lokal gagal dibuat:', error);
  }
}

async function submitLeadToSupabase(payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Supabase insert error:', errorText);
    throw new Error(errorText || 'Gagal mengirim data ke database.');
  }

  return true;
}

if (leadForm) {
  leadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = leadForm.querySelector('button[type="submit"]');
    const formData = new FormData(leadForm);
    const payload = buildLeadPayload(formData);

    if (!payload.consent) {
      formMessage.textContent = 'Mohon centang persetujuan penggunaan data terlebih dahulu.';
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Mengirim pengajuan...';
    }
    formMessage.textContent = 'Sedang mengirim data ke database...';

    try {
      await submitLeadToSupabase(payload);
      saveLeadBackup(payload);
      formMessage.textContent = 'Pengajuan berhasil dikirim. Maura akan segera menghubungi Anda melalui WhatsApp.';
      leadForm.reset();
      if (locationResult) {
        locationResult.innerHTML = '<p class="muted">Koordinat belum diambil.</p>';
      }
    } catch (error) {
      console.error(error);
      saveLeadBackup(payload);
      formMessage.textContent = 'Pengajuan belum berhasil masuk database. Data dicadangkan di browser ini. Silakan coba lagi atau chat Maura via WhatsApp.';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Kirim Pengajuan';
      }
    }
  });
}

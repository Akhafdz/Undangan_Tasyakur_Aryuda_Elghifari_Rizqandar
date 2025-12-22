// Konfigurasi acara
const EVENT = {
  title: "Tasyakur Aqiqah & Khitan Aryuda Elghifari Rizqandar",
  details: "Acara Tasyakur Aqiqah dan Khitan",
  location: "Kediaman SERTU I. Iskandar",
  startUtc: "20251227T020000Z", // 09.00 WIB
  endUtc: "20251227T070000Z"    // 14.00 WIB (misal)
};

// Parse string waktu format 20251227T020000Z jadi Date
function parseIcalDate(dateStr) {
  const year = Number(dateStr.slice(0, 4));
  const month = Number(dateStr.slice(4, 6)) - 1;
  const day = Number(dateStr.slice(6, 8));
  const hour = Number(dateStr.slice(9, 11));
  const minute = Number(dateStr.slice(11, 13));
  const second = Number(dateStr.slice(13, 15));
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

/* GOOGLE CALENDAR */
function initGoogleCalendar() {
  const gcalLink = document.getElementById("gcal");
  if (!gcalLink) return;

  const text = encodeURIComponent(EVENT.title);
  const details = encodeURIComponent(EVENT.details || "");
  const location = encodeURIComponent(EVENT.location || "");
  const dates = `${EVENT.startUtc}/${EVENT.endUtc}`;

  const url =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${text}` +
    `&details=${details}` +
    `&location=${location}` +
    `&dates=${dates}`;

  gcalLink.href = url;
}

/* NAV */
function initNav() {
  const buttons = document.querySelectorAll(".bottom-nav button");
  const sections = document.querySelectorAll(".section");

  buttons.forEach((b) => {
    b.onclick = () => {
      sections.forEach((s) => s.classList.remove("active"));
      buttons.forEach((x) => x.classList.remove("active"));

      const targetId = b.dataset.go;
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.classList.add("active");
      b.classList.add("active");
    };
  });
}

/* COUNTDOWN */
function initCountdown() {
  const dEl = document.getElementById("d");
  const hEl = document.getElementById("h");
  const mEl = document.getElementById("m");
  const sEl = document.getElementById("s");

  if (!dEl || !hEl || !mEl || !sEl) return;

  const target = parseIcalDate(EVENT.startUtc);

  function updateCountdown() {
    let diff = target - new Date();
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000) % 24;
    const minutes = Math.floor(diff / 60000) % 60;
    const seconds = Math.floor(diff / 1000) % 60;

    dEl.textContent = days;
    hEl.textContent = hours;
    mEl.textContent = minutes;
    sEl.textContent = seconds;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* MUSIK */
function initMusic() {
  const audio = document.getElementById("bg-music");
  const btn = document.getElementById("music-toggle");
  if (!audio || !btn) return;

  let isPlaying = false;

  // Coba autoplay saat halaman selesai dimuat
  audio.play().then(() => {
    isPlaying = true;
    btn.textContent = "Jeda Musik";
  }).catch(() => {
    // Kalau autoplay diblokir browser, biarkan tombol dalam keadaan "Putar Musik"
    isPlaying = false;
    btn.textContent = "Putar Musik";
  });

  btn.onclick = () => {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      btn.textContent = "Putar Musik";
    } else {
      audio.play().then(() => {
        isPlaying = true;
        btn.textContent = "Jeda Musik";
      }).catch(() => {
        alert("Browser memblokir pemutaran otomatis. Coba tekan tombol sekali lagi ya.");
      });
    }
  };

  audio.addEventListener("ended", () => {
    isPlaying = false;
    btn.textContent = "Putar Musik";
  });
}

/* UCAPAN (guestbook) */
function initUcapan() {
  const form = document.getElementById("form");
  const list = document.getElementById("list");
  const namaInput = document.getElementById("nama");
  const pesanInput = document.getElementById("pesan");

  if (!form || !list || !namaInput || !pesanInput) return;

  function getUcapanData() {
    return JSON.parse(localStorage.ucapan || "[]");
  }

  function renderList() {
    list.innerHTML = "";
    const data = getUcapanData();

    if (!data.length) {
      list.innerHTML = "<p>Belum ada ucapan. Jadilah yang pertama mengirim doa 🤍</p>";
      return;
    }

    data.forEach((u) => {
      const p = document.createElement("p");
      p.innerHTML = `<strong>${u.n}</strong><br>${u.p}`;
      list.appendChild(p);

      const hr = document.createElement("hr");
      hr.style.border = "none";
      hr.style.borderTop = "1px solid #c8d5c2";
      list.appendChild(hr);
    });
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const nama = namaInput.value.trim();
    const pesan = pesanInput.value.trim();
    if (!nama || !pesan) return;

    const data = getUcapanData();
    data.push({ n: nama, p: pesan });
    localStorage.ucapan = JSON.stringify(data);

    form.reset();
    renderList();
  };

  renderList();
}

/* KONFIRMASI KEHADIRAN (RSVP) */
function initRsvp() {
  const form = document.getElementById("form-rsvp");
  const list = document.getElementById("list-rsvp");
  const namaInput = document.getElementById("nama-rsvp");
  const jumlahInput = document.getElementById("jumlah-rsvp");
  const statusSelect = document.getElementById("status-rsvp");
  const catatanInput = document.getElementById("catatan-rsvp");

  const waNumberInput = document.getElementById("wa-number");
  const waSendBtn = document.getElementById("wa-send");

  if (!form || !list || !namaInput || !jumlahInput || !statusSelect || !catatanInput) return;

  function getRsvpData() {
    return JSON.parse(localStorage.rsvp || "[]");
  }

  function renderRsvpList() {
    list.innerHTML = "";
    const data = getRsvpData();

    if (!data.length) {
      list.innerHTML = "<p>Belum ada konfirmasi kehadiran.</p>";
      return;
    }

    data.forEach((item) => {
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "10px";

      wrapper.innerHTML = `
        <strong>${item.n}</strong><br>
        Status: ${item.s}<br>
        Jumlah: ${item.j}${item.c ? `<br><em>${item.c}</em>` : ""}
      `;

      list.appendChild(wrapper);

      const hr = document.createElement("hr");
      hr.style.border = "none";
      hr.style.borderTop = "1px dashed #c8d5c2";
      list.appendChild(hr);
    });
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const nama = namaInput.value.trim();
    const jumlah = Number(jumlahInput.value);
    const status = statusSelect.value;
    const catatan = catatanInput.value.trim();

    if (!nama || !jumlah || !status) return;

    const data = getRsvpData();
    data.push({ n: nama, j: jumlah, s: status, c: catatan });
    localStorage.rsvp = JSON.stringify(data);

    form.reset();
    renderRsvpList();
  };

  // EXPORT KE WHATSAPP
  if (waSendBtn && waNumberInput) {
    waSendBtn.onclick = () => {
      const numberRaw = waNumberInput.value.trim();
      const number = numberRaw.replace(/\D/g, "");

      if (!number) {
        alert("Isi nomor WhatsApp tujuan dulu, ya. Contoh: 62812xxxxxxx");
        return;
      }

      const data = getRsvpData();
      if (!data.length) {
        alert("Belum ada data konfirmasi yang bisa dikirim.");
        return;
      }

      let text = "Assalamu'alaikum,\nBerikut rekap konfirmasi kehadiran acara:\n\n";
      data.forEach((item, idx) => {
        text += `${idx + 1}. ${item.n} - ${item.s}, ${item.j} orang`;
        if (item.c) {
          text += ` (${item.c})`;
        }
        text += "\n";
      });

      text += "\nDikirim dari undangan online Aryuda Elghifari Rizqandar.";

      const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    };
  }

  renderRsvpList();
}

/* INIT SEMUA */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initGoogleCalendar();
  initCountdown();
  initMusic();
  initUcapan();
  initRsvp();
});

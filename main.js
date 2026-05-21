// ===================================================
// main.js - ملف JavaScript الرئيسي
// Khawla Al Gahrani Photography
// ===================================================

// ===== إعدادات JSONBin.io =====
const MASTER_KEY = "$2a$10$674DeomPKlC0zd4hmiftveDrQ2GMoi3GUwUx7hGLMzys26kwqR.xC";
const BIN_ID = "6991a8ebd0ea881f40bc0b28";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// =====================================================
// بناء الباقات ديناميكياً من ملف packages.js
// =====================================================
function buildPackagesHTML() {
  const restContent = document.getElementById('restContent');
  if (!restContent || typeof PACKAGES === 'undefined') return;

  let html = '';

  Object.values(PACKAGES).forEach(section => {
    html += `<h2 class="section-subtitle">${section.sectionTitle}</h2>`;
    html += `<div class="packages-grid">`;

    section.items.forEach(pkg => {
      const fullWidthClass = pkg.fullWidth ? ' full-width' : '';
      const featuresHTML = pkg.features.map(f => `<li>${f}</li>`).join('');

      html += `
        <div class="glass-box package-card${fullWidthClass}" data-package="${pkg.key}">
          <h3>${pkg.title}</h3>
          <ul>${featuresHTML}</ul>
          <div class="price-tag">${pkg.price}</div>
        </div>`;
    });

    html += `</div>`;
  });

  // إدراج قبل معرض الصور مباشرة
  const galleryTitle = restContent.querySelector('.section-title');
  if (galleryTitle) {
    galleryTitle.insertAdjacentHTML('beforebegin', html);
  } else {
    restContent.insertAdjacentHTML('afterbegin', html);
  }

  // ربط أحداث النقر على البطاقات بعد بنائها
  attachPackageCardEvents();
}

// =====================================================
// بناء مودال الباقة من بيانات packages.js
// =====================================================
function buildModalContent(pkg) {
  const detailsHTML = pkg.modalDetails
    .map(d => `<p>${d}</p>`)
    .join('');

  const notesHTML = (typeof GENERAL_NOTES !== 'undefined' ? GENERAL_NOTES : [])
    .map(n => `<p>${n}</p>`)
    .join('');

  return `
    <h2>${pkg.title}</h2>
    <div class="detail-box">${detailsHTML}</div>
    <div class="price-box">${pkg.price}</div>
    <div class="notes-box">
      <h3>ملاحظات هامة</h3>
      ${notesHTML}
    </div>
    <div style="text-align:center; margin:15px 0;">
      <p>
        <a href="https://www.instagram.com/khawla_photographer" target="_blank" style="color:#FFD966;text-decoration:none;">Instagram</a> |
        <a href="https://www.tiktok.com/@khawla_photographer" target="_blank" style="color:#FFD966;text-decoration:none;">TikTok</a>
      </p>
      <p style="color:#FFD966; margin-top:6px;">KHAWLA AL GAHRANI</p>
    </div>
    <a href="https://wa.me/201142308981?text=${encodeURIComponent('السلام عليكم، أريد الاستفسار عن ' + pkg.title)}"
       class="modal-wa-btn" target="_blank">
      <i class="fab fa-whatsapp"></i> احجز الآن عبر واتساب
    </a>`;
}

// =====================================================
// الحصول على باقة بالمفتاح من أي قسم
// =====================================================
function getPackageByKey(key) {
  if (typeof PACKAGES === 'undefined') return null;
  for (const section of Object.values(PACKAGES)) {
    const found = section.items.find(p => p.key === key);
    if (found) return found;
  }
  return null;
}

// =====================================================
// فتح مودال الباقة
// =====================================================
function openPackageModal(packageKey) {
  const pkg = getPackageByKey(packageKey);
  if (!pkg) return;
  document.getElementById('modalContent').innerHTML = buildModalContent(pkg);
  document.getElementById('packageModal').style.display = 'flex';
}

// =====================================================
// ربط النقر على بطاقات الباقات
// =====================================================
function attachPackageCardEvents() {
  document.querySelectorAll('.package-card').forEach(card => {
    card.addEventListener('click', function () {
      const key = this.dataset.package;
      if (key) openPackageModal(key);
    });
  });
}

// =====================================================
// نظام العرض المؤقت
// =====================================================
function initSpecialOffer() {
  if (typeof SPECIAL_OFFER === 'undefined' || !SPECIAL_OFFER.enabled) return;

  const offerHTML = `
    <div class="glass-box" style="background:rgba(255,215,0,0.15);border:2px solid #FFD966;margin-bottom:20px;padding:15px;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
        <div style="text-align:right;">
          <h3 style="color:#FFE5A3;margin:0;font-size:1.3rem;">${SPECIAL_OFFER.title}</h3>
          <p style="margin:5px 0 0 0;font-size:0.95rem;">${SPECIAL_OFFER.description}</p>
        </div>
        <div id="offerTimer" style="background:rgba(0,0,0,0.3);padding:8px 15px;border-radius:50px;border:1px solid #FFD966;font-size:0.9rem;min-width:200px;text-align:center;">
          <i class="fas fa-clock" style="color:#FFD966;margin-left:5px;"></i>
          <span style="color:#FFE5A3;">ينتهي العرض بعد</span><br>
          <span id="days">0</span>d <span id="hours">0</span>h <span id="minutes">0</span>m
        </div>
      </div>
    </div>`;

  document.getElementById('restContent').insertAdjacentHTML('afterbegin', offerHTML);
  updateOfferTimer();
  setInterval(updateOfferTimer, 60000);
}

function updateOfferTimer() {
  if (typeof SPECIAL_OFFER === 'undefined') return;
  const end = new Date(SPECIAL_OFFER.endsAt);
  const now = new Date();
  const diff = end - now;
  if (diff <= 0) return;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const d = document.getElementById('days');
  const h = document.getElementById('hours');
  const m = document.getElementById('minutes');
  if (d) d.textContent = days;
  if (h) h.textContent = hours;
  if (m) m.textContent = minutes;
}

// =====================================================
// نظام التعليقات
// =====================================================
function getCurrentUserId() {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
  }
  return userId;
}

async function loadTestimonials() {
  try {
    const res = await fetch(`${BIN_URL}/latest`, {
      headers: { 'X-Master-Key': MASTER_KEY }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.record.testimonials || [];
  } catch (e) {
    console.error("خطأ في جلب التعليقات:", e);
    return [];
  }
}

async function saveTestimonials(testimonials) {
  try {
    const res = await fetch(BIN_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': MASTER_KEY },
      body: JSON.stringify({ testimonials })
    });
    return res.ok;
  } catch (e) {
    console.error("خطأ في الحفظ:", e);
    return false;
  }
}

function getTimeAgo(dateString) {
  const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 2592000) return `منذ ${Math.floor(diff / 86400)} يوم`;
  return `منذ ${Math.floor(diff / 2592000)} شهر`;
}

function buildTestimonialCard(t, userId, isModal = false) {
  const hasLiked = t.likedBy && t.likedBy.includes(userId);
  const cardClass = isModal ? 'all-testimonial-item' : 'testimonial-item';
  const headerClass = isModal ? 'all-testimonial-header' : 'testimonial-header';
  const footerClass = isModal ? 'all-testimonial-footer' : 'testimonial-footer';
  const nameClass = isModal ? 'all-testimonial-name' : 'testimonial-name';
  const timeClass = isModal ? 'all-testimonial-time' : 'testimonial-time';
  const btnClass = isModal ? 'all-like-button' : 'like-button';

  const deleteBtn = t.userId === userId
    ? `<button class="delete-button" onclick="handleDelete('${t.id}')">
         <i class="fas fa-trash"></i>${isModal ? ' حذف' : ''}
       </button>`
    : '';

  return `
    <div class="${cardClass}" data-id="${t.id}">
      <div class="${headerClass}">
        <span class="${nameClass}">${t.name}</span>
        <span class="${timeClass}">${getTimeAgo(t.date)}</span>
      </div>
      <p class="${isModal ? '' : 'testimonial-text'}">"${t.comment}"</p>
      <div class="${footerClass}">
        <button class="${btnClass} ${hasLiked ? 'liked' : ''}" onclick="handleLike('${t.id}')">
          <i class="fas ${hasLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          <span class="like-count">${t.likes || 0}</span>
        </button>
        ${deleteBtn}
      </div>
    </div>`;
}

async function displayTestimonials() {
  const container = document.getElementById('testimonialsContainer');
  if (!container) return;

  const testimonials = await loadTestimonials();
  const userId = getCurrentUserId();

  if (testimonials.length === 0) {
    container.innerHTML = '<div class="empty-testimonials">لا توجد آراء بعد... كن أول من يشارك!</div>';
    return;
  }

  const sorted = [...testimonials].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest = sorted.slice(0, 3);

  const scrollDiv = document.createElement('div');
  scrollDiv.className = 'testimonials-scroll-container';
  scrollDiv.innerHTML = latest.map(t => buildTestimonialCard(t, userId)).join('');

  container.innerHTML = '';
  container.appendChild(scrollDiv);

  if (testimonials.length > 3) {
    scrollDiv.addEventListener('scroll', function () {
      if (this.scrollTop + this.clientHeight >= this.scrollHeight - 50) {
        loadMoreTestimonials(this, sorted, userId);
      }
    });
  }
}

async function loadMoreTestimonials(container, allTestimonials, userId) {
  if (container.loadingMore) return;
  container.loadingMore = true;
  const currentCount = container.children.length;
  if (currentCount >= allTestimonials.length) { container.loadingMore = false; return; }
  const next = allTestimonials.slice(currentCount, currentCount + 3);
  next.forEach(t => { container.insertAdjacentHTML('beforeend', buildTestimonialCard(t, userId)); });
  container.loadingMore = false;
}

async function displayAllTestimonials() {
  const container = document.getElementById('allTestimonialsList');
  if (!container) return;

  const testimonials = await loadTestimonials();
  const userId = getCurrentUserId();

  if (testimonials.length === 0) {
    container.innerHTML = '<div class="empty-testimonials">لا توجد آراء بعد...</div>';
    return;
  }

  const sorted = [...testimonials].sort((a, b) => {
    if (b.likes !== a.likes) return (b.likes || 0) - (a.likes || 0);
    return new Date(b.date) - new Date(a.date);
  });

  const scrollDiv = document.createElement('div');
  scrollDiv.className = 'all-testimonials-scroll';
  scrollDiv.innerHTML = sorted.map(t => buildTestimonialCard(t, userId, true)).join('');

  container.innerHTML = '';
  container.appendChild(scrollDiv);
}

async function handleLike(commentId) {
  const testimonials = await loadTestimonials();
  const userId = getCurrentUserId();
  const comment = testimonials.find(t => t.id === commentId);
  if (!comment) return;
  if (!comment.likedBy) comment.likedBy = [];
  const idx = comment.likedBy.indexOf(userId);
  if (idx !== -1) {
    comment.likes = Math.max((comment.likes || 0) - 1, 0);
    comment.likedBy.splice(idx, 1);
  } else {
    comment.likes = (comment.likes || 0) + 1;
    comment.likedBy.push(userId);
  }
  if (await saveTestimonials(testimonials)) {
    displayTestimonials();
    displayAllTestimonials();
  }
}

async function handleDelete(commentId) {
  if (!confirm('هل أنت متأكد من حذف تعليقك؟')) return;
  const testimonials = await loadTestimonials();
  const userId = getCurrentUserId();
  const idx = testimonials.findIndex(t => t.id === commentId);
  if (idx === -1) return;
  if (testimonials[idx].userId !== userId) { alert('لا يمكنك حذف تعليق شخص آخر'); return; }
  testimonials.splice(idx, 1);
  if (await saveTestimonials(testimonials)) {
    displayTestimonials();
    displayAllTestimonials();
  }
}

async function addTestimonial(name, comment) {
  const testimonials = await loadTestimonials();
  const userId = getCurrentUserId();
  testimonials.push({
    id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name, comment,
    date: new Date().toISOString(),
    likes: 0, likedBy: [],
    userId
  });
  if (await saveTestimonials(testimonials)) {
    alert("✅ تم إضافة رأيك! شكراً لك");
    displayTestimonials();
    displayAllTestimonials();
  } else {
    alert("❌ حدث خطأ في الحفظ، حاول مرة أخرى");
  }
}

function closeAllTestimonialsModal() {
  document.getElementById('allTestimonialsModal').style.display = 'none';
  document.body.style.overflow = 'auto';
}

// =====================================================
// ١. شريط تقدم الحجز
// =====================================================

// إعدادات الشريط — عدّل هذه الأرقام من packages.js أو هنا مباشرة
const BOOKING_BAR = {
  totalSlots: 8,       // إجمالي أيام الفرح المتاحة في الشهر
  bookedSlots: 5,      // كم يوم تم حجزه فعلاً (عدّلها يدوياً)
  monthLabel: "يونيو"  // اسم الشهر الحالي
};

function buildBookingBar() {
  const free = BOOKING_BAR.totalSlots - BOOKING_BAR.bookedSlots;
  const pct = Math.round((BOOKING_BAR.bookedSlots / BOOKING_BAR.totalSlots) * 100);

  // لون الشريط حسب التوفر
  const urgencyColor = free <= 2
    ? 'linear-gradient(90deg,#ff4757,#ff6b81)'
    : free <= 4
      ? 'linear-gradient(90deg,#ffa502,#ff9f43)'
      : 'linear-gradient(90deg,#FFD966,#ff9f43)';

  const urgencyText = free === 0
    ? 'مكتمل الحجز ❌'
    : free === 1
      ? 'تاريخ واحد فقط! 🔥'
      : `${free} تواريخ متبقية في ${BOOKING_BAR.monthLabel}`;

  const barHTML = `
    <div class="glass-box" style="padding:14px 18px; margin-bottom:5px;">
      <div class="booking-bar">
        <div class="booking-bar-icon">📅</div>
        <div class="booking-bar-text">
          <div class="booking-bar-label">جدول الحجز لشهر ${BOOKING_BAR.monthLabel}</div>
          <div class="booking-bar-track">
            <div class="booking-bar-fill" id="bookingFill"
                 style="width:0%; background:${urgencyColor}"></div>
          </div>
        </div>
        <div class="booking-bar-slots">
          <span>${free}</span> ${urgencyText.replace(/^\d+ /, '')}
        </div>
      </div>
    </div>`;

  const barEl = document.getElementById('bookingAvailBar');
  if (barEl) {
    barEl.innerHTML = barHTML;
  }

  // تحريك الشريط بعد لحظة
  setTimeout(() => {
    const fill = document.getElementById('bookingFill');
    if (fill) fill.style.width = pct + '%';
  }, 300);
}

// =====================================================
// ٣. حاسبة السعر
// =====================================================

// بيانات الحاسبة — مبنية من منطق الباقات الموجودة
const CALC_DATA = {
  types: [
    { key: 'photo',    label: '📸 تصوير فوتو',    base: 160 },
    { key: 'video',    label: '🎬 تصوير فيديو',   base: 80  },
    { key: 'fullday',  label: '🌟 فل داي',         base: 280 },
    { key: 'both',     label: '📸🎬 فوتو + فيديو', base: 220 },
  ],
  hours: [
    { key: '2',   label: 'ساعتين',   extra: 0    },
    { key: '3',   label: '3 ساعات',  extra: 0    },
    { key: '4',   label: '4 ساعات',  extra: 30   },
    { key: '6',   label: '6 ساعات',  extra: 60   },
    { key: 'full',label: 'فل داي',   extra: 120  },
  ],
  addons: [
    { key: 'album',   label: '📒 البوم حراري',      price: 40  },
    { key: 'print10', label: '🖼️ 10 صور مطبوعة',   price: 20  },
    { key: 'rush',    label: '⚡ تسليم استعجال',    price: 60  },
    { key: 'album_gold', label: '✨ البوم جولدن',   price: 100 },
  ]
};

let calcState = { type: null, hours: null, addons: new Set() };

function buildPriceCalc() {
  const typesHTML = CALC_DATA.types.map(t =>
    `<button class="calc-chip" data-calc-type="${t.key}" onclick="calcSelectType('${t.key}')">${t.label}</button>`
  ).join('');

  const hoursHTML = CALC_DATA.hours.map(h =>
    `<button class="calc-chip" data-calc-hours="${h.key}" onclick="calcSelectHours('${h.key}')">${h.label}</button>`
  ).join('');

  const addonsHTML = CALC_DATA.addons.map(a =>
    `<button class="calc-chip addon" data-calc-addon="${a.key}" onclick="calcToggleAddon('${a.key}')">
       ${a.label} <small style="opacity:.6">+${a.price}$</small>
     </button>`
  ).join('');

  const calcHTML = `
    <h2 class="section-title">💰 احسب سعرك</h2>
    <div class="glass-box">
      <div class="calc-section">
        <span class="calc-label">١. اختاري نوع التصوير</span>
        <div class="calc-options">${typesHTML}</div>
      </div>
      <hr class="calc-divider">
      <div class="calc-section">
        <span class="calc-label">٢. كم ساعة تحتاجين؟</span>
        <div class="calc-options">${hoursHTML}</div>
      </div>
      <hr class="calc-divider">
      <div class="calc-section">
        <span class="calc-label">٣. إضافات (اختياري)</span>
        <div class="calc-options">${addonsHTML}</div>
      </div>
      <div class="calc-result-box">
        <div>
          <div class="calc-result-label">السعر التقريبي</div>
          <div class="calc-result-price" id="calcPrice">—</div>
          <div class="calc-result-note">* السعر النهائي يُحدد بعد التواصل</div>
        </div>
        <a id="calcBookBtn" href="#" class="calc-book-btn" style="pointer-events:none;opacity:.4;">
          <i class="fab fa-whatsapp"></i> احجزي الآن
        </a>
      </div>
    </div>`;

  const restContent = document.getElementById('restContent');
  const galleryTitle = restContent.querySelector('.section-title');
  if (galleryTitle) {
    galleryTitle.insertAdjacentHTML('beforebegin', calcHTML);
  }
}

function calcSelectType(key) {
  calcState.type = key;
  document.querySelectorAll('[data-calc-type]').forEach(el => {
    el.classList.toggle('selected', el.dataset.calcType === key);
  });
  updateCalcResult();
}

function calcSelectHours(key) {
  calcState.hours = key;
  document.querySelectorAll('[data-calc-hours]').forEach(el => {
    el.classList.toggle('selected', el.dataset.calcHours === key);
  });
  updateCalcResult();
}

function calcToggleAddon(key) {
  if (calcState.addons.has(key)) {
    calcState.addons.delete(key);
  } else {
    calcState.addons.add(key);
  }
  document.querySelectorAll('[data-calc-addon]').forEach(el => {
    el.classList.toggle('selected', calcState.addons.has(el.dataset.calcAddon));
  });
  updateCalcResult();
}

function updateCalcResult() {
  if (!calcState.type || !calcState.hours) return;

  const typeData  = CALC_DATA.types.find(t => t.key === calcState.type);
  const hoursData = CALC_DATA.hours.find(h => h.key === calcState.hours);
  let total = typeData.base + hoursData.extra;

  let addonNames = [];
  calcState.addons.forEach(k => {
    const a = CALC_DATA.addons.find(x => x.key === k);
    if (a) { total += a.price; addonNames.push(a.label); }
  });

  const priceEl = document.getElementById('calcPrice');
  const btnEl   = document.getElementById('calcBookBtn');

  if (priceEl) {
    priceEl.textContent = total + '$';
    priceEl.style.transform = 'scale(1.15)';
    setTimeout(() => priceEl.style.transform = 'scale(1)', 200);
  }

  if (btnEl) {
    const msg = `السلام عليكم، أريد الاستفسار عن:\nنوع: ${typeData.label}\nالمدة: ${hoursData.label}${addonNames.length ? '\nإضافات: ' + addonNames.join('، ') : ''}\nالسعر التقريبي: ${total}$`;
    btnEl.href = `https://wa.me/201142308981?text=${encodeURIComponent(msg)}`;
    btnEl.style.pointerEvents = 'auto';
    btnEl.style.opacity = '1';
  }
}

// =====================================================
// ١. نموذج الحجز المباشر
// =====================================================

function buildBookingSection() {
  const allPackageOptions = [];
  if (typeof PACKAGES !== 'undefined') {
    Object.values(PACKAGES).forEach(sec => {
      sec.items.forEach(p => {
        allPackageOptions.push(`<option value="${p.title}">${p.title} — ${p.price}</option>`);
      });
    });
  }

  const bookingHTML = `
    <h2 class="section-title">📋 احجزي موعدك</h2>
    <div class="glass-box">
      <p style="color:rgba(255,255,255,0.6);font-size:0.95rem;margin-bottom:18px;text-align:right;">
        املئي النموذج وسيُفتح واتساب بالتفاصيل جاهزة ✨
      </p>
      <div class="booking-form">

        <div class="booking-form-row">
          <div class="booking-field">
            <label>الاسم الكريم</label>
            <input type="text" id="bk_name" placeholder="مثال: نورة العتيبي">
          </div>
          <div class="booking-field">
            <label>رقم الجوال</label>
            <input type="tel" id="bk_phone" placeholder="+966 5x xxx xxxx">
          </div>
        </div>

        <div class="booking-form-row">
          <div class="booking-field">
            <label>📅 تاريخ الفرح</label>
            <input type="date" id="bk_date">
          </div>
          <div class="booking-field">
            <label>🕐 الوقت المتوقع</label>
            <input type="time" id="bk_time">
          </div>
        </div>

        <div class="booking-field">
          <label>الباقة المطلوبة</label>
          <select id="bk_package">
            <option value="">— اختاري الباقة —</option>
            ${allPackageOptions.join('')}
          </select>
        </div>

        <div class="booking-field">
          <label>📍 مكان الفرح (اختياري)</label>
          <input type="text" id="bk_location" placeholder="مثال: قاعة الأفراح، الرياض">
        </div>

        <div class="booking-field">
          <label>ملاحظات إضافية (اختياري)</label>
          <textarea id="bk_notes" placeholder="أي تفاصيل أو طلبات خاصة..."></textarea>
        </div>

        <button class="booking-submit-btn" onclick="submitBooking()">
          <i class="fab fa-whatsapp"></i>
          إرسال الحجز عبر واتساب
        </button>

      </div>
    </div>`;

  const restContent = document.getElementById('restContent');
  const galleryTitle = restContent.querySelector('.section-title');
  if (galleryTitle) {
    galleryTitle.insertAdjacentHTML('beforebegin', bookingHTML);
  }

  // تعيين تاريخ افتراضي (اليوم)
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('bk_date');
  if (dateInput) dateInput.min = today;
}

function submitBooking() {
  const name     = document.getElementById('bk_name')?.value.trim();
  const phone    = document.getElementById('bk_phone')?.value.trim();
  const date     = document.getElementById('bk_date')?.value;
  const time     = document.getElementById('bk_time')?.value;
  const pkg      = document.getElementById('bk_package')?.value;
  const location = document.getElementById('bk_location')?.value.trim();
  const notes    = document.getElementById('bk_notes')?.value.trim();

  if (!name) { alert('من فضلك أدخلي اسمك الكريم'); return; }
  if (!date) { alert('من فضلك اختاري تاريخ الفرح');  return; }
  if (!pkg)  { alert('من فضلك اختاري الباقة');        return; }

  // تنسيق التاريخ للعربية
  const dateAr = new Date(date).toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let msg = `السلام عليكم خولة 🌸\nأرغب في حجز جلسة تصوير:\n\n`;
  msg += `👤 الاسم: ${name}\n`;
  if (phone)    msg += `📱 الجوال: ${phone}\n`;
  msg += `📅 التاريخ: ${dateAr}\n`;
  if (time)     msg += `🕐 الوقت: ${time}\n`;
  msg += `📦 الباقة: ${pkg}\n`;
  if (location) msg += `📍 المكان: ${location}\n`;
  if (notes)    msg += `📝 ملاحظات: ${notes}\n`;
  msg += `\nأنتظر ردكم لتأكيد الحجز 🙏`;

  window.open(`https://wa.me/201142308981?text=${encodeURIComponent(msg)}`, '_blank');
}

// =====================================================
// تهيئة الصفحة عند التحميل
// =====================================================
window.onload = function () {
  // بناء الباقات من الملف الخارجي
  buildPackagesHTML();

  // ١. شريط الحجز
  buildBookingBar();

  // ٣. حاسبة السعر
  buildPriceCalc();

  // ١. نموذج الحجز
  buildBookingSection();

  // تأثيرات الظهور
  setTimeout(() => document.getElementById('welcomeBox').classList.add('welcome-animation'), 500);
  setTimeout(() => document.getElementById('restContent').classList.add('show'), 2500);

  // تحميل التعليقات
  displayTestimonials();

  // العرض المؤقت
  initSpecialOffer();

  // حدث نموذج التعليق
  document.getElementById('addTestimonialForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('newName').value.trim();
    const comment = document.getElementById('newComment').value.trim();
    if (name && comment) { addTestimonial(name, comment); this.reset(); }
  });

  // زر عرض جميع التعليقات
  document.getElementById('showTestimonialsBtn')?.addEventListener('click', async function () {
    await displayAllTestimonials();
    document.getElementById('allTestimonialsModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });

  // إغلاق المودالات بعلامة X
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function () {
      this.closest('.modal').style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  });

  // إغلاق المودال بالنقر خارجه
  window.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });

  // زر العودة للأعلى
  const topBtn = document.getElementById('topBtn');
  window.onscroll = () => { topBtn.style.display = window.scrollY > 300 ? 'block' : 'none'; };
  topBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Lightbox للصور
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  document.querySelectorAll('.gallery-container img').forEach(img => {
    img.addEventListener('click', () => {
      lightbox.style.display = 'flex';
      lightboxImg.src = img.src;
      document.body.style.overflow = 'hidden';
    });
  });
  lightbox.addEventListener('click', () => {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
  });
};

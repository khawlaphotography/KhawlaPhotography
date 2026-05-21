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
// تهيئة الصفحة عند التحميل
// =====================================================
window.onload = function () {
  // بناء الباقات من الملف الخارجي
  buildPackagesHTML();

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

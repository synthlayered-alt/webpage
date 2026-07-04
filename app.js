/* ═══════════════════════════════════════════════════════════════
   SYNTH LAYERED — NEW PORTFOLIO APP SCRIPT (ASTRA REPLICA)
   Handles single-page smooth scrolling, dynamic link highlighting,
   multilingual toggles, dynamic grid rendering, and detailed video modals.
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initScrollSystem();
  initLanguageSystem();
  initMobileMenu();
  initPortfolioGrid();
  initVideoModal();
  initFaqAccordion();
  initGlobalVideoSettings();
  initScrollRevealSystem();
  initScrollProgressAndParallax();
});

// ── INERTIAL SMOOTH SCROLL STATE ──
let currentScroll = window.scrollY;
let targetScroll = window.scrollY;
let isSmoothScrolling = false;

// 휠 스크롤 및 메뉴 클릭 시 부드럽게 감속하며 스크롤하는 함수 (Lerp)
function smoothScrollStep() {
  const diff = targetScroll - currentScroll;
  currentScroll += diff * 0.085; // 0.085의 쫀득한 감속 계수 적용

  if (Math.abs(diff) > 0.5) {
    window.scrollTo(0, currentScroll);
    requestAnimationFrame(smoothScrollStep);
  } else {
    currentScroll = targetScroll;
    window.scrollTo(0, currentScroll);
    isSmoothScrolling = false;
  }
}

// ── 1. SINGLE-PAGE SCROLL & ACTIVE LINK HIGHLIGHT ──
function initScrollSystem() {
  const sections = document.querySelectorAll('main > section');
  const navLinks = document.querySelectorAll('.nav-links a, #mobile-menu nav a');
  const nav = document.getElementById('nav');

  // Smooth scroll for nav anchor clicks (Lerp 모듈 연동)
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSec = document.querySelector(targetId);
      if (targetSec) {
        const targetPos = targetSec.offsetTop - 70;
        targetScroll = targetPos;
        currentScroll = window.scrollY; // 현재의 실제 스크롤 좌표와 동기화
        
        if (!isSmoothScrolling) {
          isSmoothScrolling = true;
          requestAnimationFrame(smoothScrollStep);
        }
      }
    });
  });

  // Wheel event for desktop mouse scrolling (옵션 A 핵심)
  window.addEventListener('wheel', e => {
    // 모달창이나 모바일 메뉴 오버레이가 열려 있을 때는 관성 스크롤을 방지
    const modal = document.getElementById('videoModal');
    const menu = document.getElementById('mobile-menu');
    if ((modal && modal.classList.contains('open')) || (menu && menu.classList.contains('open'))) {
      return;
    }

    e.preventDefault();
    
    // 타겟 위치 갱신 및 최대/최소 범위 클램핑
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetScroll = Math.max(0, Math.min(maxScroll, targetScroll + e.deltaY * 0.9));
    currentScroll = window.scrollY;

    if (!isSmoothScrolling) {
      isSmoothScrolling = true;
      requestAnimationFrame(smoothScrollStep);
    }
  }, { passive: false });

  // 휠 조작이 아닌 브라우저 스크롤바 드래그나 키보드 조작 대응 동기화
  window.addEventListener('scroll', () => {
    if (!isSmoothScrolling) {
      targetScroll = window.scrollY;
      currentScroll = window.scrollY;
    }
  }, { passive: true });

  // Track header height adjustment on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // Highlight active menu item depending on viewport scroll position
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

// ── 2. MULTI-LANGUAGE SYSTEM ──
function initLanguageSystem() {
  window.setLanguage = function(lang) {
    document.body.classList.remove('en-mode', 'ja-mode');
    if (lang === 'en') {
      document.body.classList.add('en-mode');
    } else if (lang === 'ja') {
      document.body.classList.add('ja-mode');
    }

    try {
      localStorage.setItem('sl-lang', lang);
    } catch (e) {}

    // Update flags active states
    document.querySelectorAll('.lang-flag-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('on');
      } else {
        btn.classList.remove('on');
      }
    });
    // Mobile lang state
    document.querySelectorAll('#mobile-menu-lang button').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('on');
      } else {
        btn.classList.remove('on');
      }
    });
  };

  // Restore saved lang
  try {
    const saved = localStorage.getItem('sl-lang') || 'kr';
    window.setLanguage(saved);
  } catch (e) {
    window.setLanguage('kr');
  }
}

// ── 3. MOBILE MENU ──
function initMobileMenu() {
  const menu = document.getElementById('mobile-menu');

  window.openMobileMenu = function() {
    if (!menu) return;
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeMobileMenu = function() {
    if (!menu) return;
    menu.classList.remove('open');
    document.body.style.overflow = 'auto';
  };

  window.toggleMobileMenu = function() {
    if (menu && menu.classList.contains('open')) {
      window.closeMobileMenu();
    } else {
      window.openMobileMenu();
    }
  };
}

// ── 4. PORTFOLIO GRID RENDER & FILTERS ──
let currentCategory = 'all';
let currentPage = 1;
const itemsPerPage = 6;

function initPortfolioGrid() {
  const grid = document.getElementById('portfolio-grid');
  const paginationContainer = document.getElementById('portfolio-pagination');
  if (!grid) return;

  const CURRENT_VERSION = "v3";
  let allWorks = [];
  try {
    const stored = localStorage.getItem('sl-works-db');
    const savedVersion = localStorage.getItem('sl-db-version');

    if (stored && savedVersion === CURRENT_VERSION) {
      allWorks = JSON.parse(stored);
    } else {
      allWorks = window.SL_WORKS || [];
      localStorage.setItem('sl-works-db', JSON.stringify(allWorks));
      localStorage.setItem('sl-db-version', CURRENT_VERSION);
    }
  } catch (e) {
    allWorks = window.SL_WORKS || [];
  }

  // Handle URL YouTube / Vimeo parsing helper
  function parseVideoUrl(url) {
    let videoUrl = url || '';
    const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('youtube-nocookie.com');
    const isVimeo = videoUrl.includes('vimeo.com');

    if (isYoutube) {
      const ytReg = /(?:v=|\/embed\/|\/shorts\/|\/live\/|\/v\/|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = videoUrl.match(ytReg);
      if (match && match[1]) {
        const videoId = match[1];
        // Stripped enablejsapi and origin to bypass strict domain/port checks causing Error 153
        videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
      }
    } else if (isVimeo && !videoUrl.includes('player.vimeo.com/video/')) {
      const vimReg = /(?:vimeo\.com\/(?:channels\/\w+\/|groups\/\w+\/videos\/|manage\/videos\/)?|player\.vimeo\.com\/video\/)(\d+)/;
      const match = videoUrl.match(vimReg);
      if (match && match[1]) {
        videoUrl = `https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1&loop=1`;
      }
    }
    return videoUrl;
  }

  window.filterPortfolio = function(category) {
    currentCategory = category;
    currentPage = 1;
    
    document.querySelectorAll('.portfolio-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-filter') === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    renderPortfolio();
  };

  window.changePage = function(page) {
    currentPage = page;
    renderPortfolio();
    
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioSection) {
      window.scrollTo({
        top: portfolioSection.offsetTop - 70,
        behavior: 'smooth'
      });
    }
  };

  function renderPortfolio() {
    grid.innerHTML = '';

    const filteredItems = allWorks.filter(item => {
      if (currentCategory === 'all') return true;
      return (item.categories || []).includes(currentCategory);
    });

    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalItems === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;padding:80px 20px;text-align:center;color:#8fa89b;font-family:monospace;font-size:13px;">No projects found.</div>';
      if (paginationContainer) paginationContainer.style.display = 'none';
      return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pagedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    pagedItems.forEach(w => {
      const card = document.createElement('div');
      card.setAttribute('data-id', w.id);
      card.className = 'portfolio-card reveal-element';
      card.onclick = () => openVideoModal(w.id);

      const titleText = w.title.kr;
      const categoryText = w.category.kr;
      const parsedVideo = parseVideoUrl(w.videoUrl);

      // ASTRA structured header/thumbnail/footer card markup
      card.innerHTML = `
        <span class="card-header">
          <span class="brand-category">
            <span class="ko">[ ${w.id} ] ${w.category.kr} · ${w.client}</span>
            <span class="en">[ ${w.id} ] ${w.category.en || w.category.kr} · ${w.client}</span>
            <span class="ja">[ ${w.id} ] ${w.category.ja || w.category.kr} · ${w.client}</span>
          </span>
          <span class="arrow-indicator"><i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></span>
        </span>
        <div class="thumbnail-container">
          <img src="${w.thumbnail || 'images/work-biome.png'}" alt="${titleText}" class="portfolio-thumb-img" onerror="this.onerror=null; this.src='images/work-biome.png';">
          <video src="${w.videoUrl}" loop muted playsinline class="portfolio-video" style="display: none;"></video>
          <div class="portfolio-play-btn">
            <i data-lucide="play" class="w-4 h-4 fill-white translate-x-0.5"></i>
          </div>
        </div>
        <span class="card-footer">
          <span class="korean-title serif-heading">
            <span class="ko">${w.title.kr}</span>
            <span class="en">${w.title.en || w.title.kr}</span>
            <span class="ja">${w.title.ja || w.title.kr}</span>
          </span>
          <span class="english-subtitle">${w.title.en || w.title.kr}</span>
        </span>
      `;

      // Hover Play (only for raw video files, skip if video is empty)
      const video = card.querySelector('.portfolio-video');
      const isRawVideo = w.videoUrl && !w.videoUrl.includes('youtube') && !w.videoUrl.includes('vimeo');
      
      if (video && isRawVideo) {
        card.addEventListener('mouseenter', () => {
          video.style.display = 'block';
          if (video.readyState === 0) video.load();
          video.play().then(() => {
            video.style.opacity = '1';
          }).catch(err => console.log("Hover play failed:", err));
        });
        card.addEventListener('mouseleave', () => {
          video.style.opacity = '0';
          video.pause();
          video.currentTime = 0;
          setTimeout(() => {
            if (video.style.opacity === '0') video.style.display = 'none';
          }, 300);
        });
      }

      grid.appendChild(card);
      if (window.revealObserver) {
        window.revealObserver.observe(card);
      }
    });

    // Render Pagination Buttons
    if (totalPages > 1 && paginationContainer) {
      let paginationHTML = `<button onclick="changePage(${currentPage - 1})" class="portfolio-filter-btn" ${currentPage === 1 ? 'disabled' : ''} style="opacity:${currentPage === 1 ? '0.3' : '1'}; cursor:pointer;"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>`;
      for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        paginationHTML += `<button onclick="changePage(${i})" class="portfolio-filter-btn ${isActive ? 'active' : ''}" style="cursor:pointer;">${i}</button>`;
      }
      paginationHTML += `<button onclick="changePage(${currentPage + 1})" class="portfolio-filter-btn" ${currentPage === totalPages ? 'disabled' : ''} style="opacity:${currentPage === totalPages ? '0.3' : '1'}; cursor:pointer;"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>`;
      
      paginationContainer.innerHTML = paginationHTML;
      paginationContainer.style.display = 'flex';
    } else if (paginationContainer) {
      paginationContainer.style.display = 'none';
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderPortfolio();
}

// ── 5. FULLSCREEN VIDEO MODAL PLAYER ──
function initVideoModal() {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('modalVideo');
  const videoPlayer = document.getElementById('modalVideoPlayer');
  const modalTitle = document.getElementById('modalTitle');
  const modalClient = document.getElementById('modalClient');
  const modalDesc = document.getElementById('modalDesc');
  const modalCategory = document.getElementById('modalCategory');

  window.openVideoModal = function(id) {
    if (!modal || !iframe || !videoPlayer) return;

    let allWorks = [];
    try {
      const stored = localStorage.getItem('sl-works-db');
      if (stored) {
        allWorks = JSON.parse(stored);
      } else {
        allWorks = window.SL_WORKS || [];
      }
    } catch (e) {
      allWorks = window.SL_WORKS || [];
    }

    const w = allWorks.find(item => item.id === id);
    if (!w) return;

    // Convert Youtube/Vimeo raw watch url to embed link
    let videoUrl = w.videoUrl || '';
    const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('youtube-nocookie.com');
    const isVimeo = videoUrl.includes('vimeo.com');

    if (isYoutube || isVimeo) {
      // Hide video player, show iframe
      videoPlayer.style.display = 'none';
      videoPlayer.src = '';

      if (isYoutube) {
        const ytReg = /(?:v=|\/embed\/|\/shorts\/|\/live\/|\/v\/|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = videoUrl.match(ytReg);
        if (match && match[1]) {
          const videoId = match[1];
          // Use standard youtube.com domain and omit origin parameter to avoid security/policy blocks on local environments
          videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        }
      } else if (isVimeo && !videoUrl.includes('player.vimeo.com/video/')) {
        const vimReg = /(?:vimeo\.com\/(?:channels\/\w+\/|groups\/\w+\/videos\/|manage\/videos\/)?|player\.vimeo\.com\/video\/)(\d+)/;
        const match = videoUrl.match(vimReg);
        if (match && match[1]) {
          videoUrl = `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
        }
      }

      iframe.src = videoUrl;
      iframe.style.display = 'block';
    } else {
      // Direct MP4 file: Hide iframe, show native video player
      iframe.style.display = 'none';
      iframe.src = '';

      videoPlayer.src = videoUrl;
      videoPlayer.style.display = 'block';
      videoPlayer.load();
      videoPlayer.play().catch(err => console.log("Modal auto-play blocked:", err));
    }

    if (modalTitle) {
      modalTitle.innerHTML = `
        <span class="ko">${w.title.kr}</span>
        <span class="en">${w.title.en || w.title.kr}</span>
        <span class="ja">${w.title.ja || w.title.kr}</span>
      `;
    }
    if (modalClient) {
      modalClient.textContent = w.client || 'SYNTH LAYERED';
    }
    if (modalDesc) {
      modalDesc.innerHTML = `
        <span class="ko">${w.description ? w.description.kr : ''}</span>
        <span class="en">${w.description ? (w.description.en || w.description.kr) : ''}</span>
        <span class="ja">${w.description ? (w.description.ja || w.description.kr) : ''}</span>
      `;
    }
    if (modalCategory) {
      modalCategory.innerHTML = `
        <span class="ko">${w.category.kr}</span>
        <span class="en">${w.category.en || w.category.kr}</span>
        <span class="ja">${w.category.ja || w.category.kr}</span>
      `;
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeVideoModal = function() {
    if (iframe) {
      iframe.src = '';
    }
    if (videoPlayer) {
      videoPlayer.pause();
      videoPlayer.src = '';
    }
    if (modal) {
      modal.classList.remove('open');
    }
    document.body.style.overflow = 'auto';
  };
}

// ── 6. EMAILJS CONTACT SUBMIT ──
window.handleContactSubmit = function(e) {
  e.preventDefault();
  const form = document.getElementById('contact-form');
  const statusMsg = document.getElementById('form-status-msg');
  if (!form || !statusMsg) return;

  statusMsg.style.display = 'block';
  statusMsg.style.color = 'var(--gray)';
  statusMsg.textContent = '문의 내용을 전송 중입니다... Sending...';

  // EmailJS integration parameters
  const templateParams = {
    from_name: form.querySelector('[name="name"]').value,
    from_company: form.querySelector('[name="company"]').value,
    reply_to: form.querySelector('[name="email"]').value,
    message: form.querySelector('[name="message"]').value
  };

  emailjs.send('synthlayered@gmail.com', 'template_gmrppsi', templateParams)
    .then(() => {
      statusMsg.style.color = '#8fa89b';
      statusMsg.textContent = '문의가 정상적으로 성공 전송되었습니다. 24시간 내에 회신 드리겠습니다.';
      form.reset();
      setTimeout(() => {
        statusMsg.style.display = 'none';
      }, 5000);
    }, (error) => {
      console.log('FAILED...', error);
      statusMsg.style.color = '#B02E0C';
      statusMsg.textContent = '전송 중 문제가 발생했습니다. contact@synthlayered.com 으로 메일을 직접 발송 부탁드립니다.';
    });
};

// ── 7. FAQ ACCORDION ──
function initFaqAccordion() {
  window.toggleFaq = function(index) {
    const content = document.getElementById('faq-content-' + index);
    const icon = document.getElementById('faq-icon-' + index);

    if (!content) return;

    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
      content.classList.add('hidden');
      if (icon) icon.style.transform = 'rotate(0deg)';
    }
  };
}


// ── 9. ABOUT WORKFLOW TABS ──
window.setLayer = function(layerNum) {
  const data = {
    1: {
      badge: 'STAGE 01',
      title: 'Logic Layer (기획 및 시나리오)',
      desc1: '자체 개발한 AI 모듈을 바탕으로 광고주 브랜드에 대한 분석을 진행합니다. 타겟 집단 분석, 소구점을 수립하여 단순 대본을 넘어 AI 이미지/영상 생성을 위한 척추가 될 고유 마케팅 프롬프트 아키텍처를 설계하는 모든 시퀀스의 사령탑입니다.',
      desc2: '"기술의 발전이 인간의 영혼과 만나는 가장 중요한 접점이며, 오직 100% 브랜드 맞춤형 오리지널 기획 시나리오만을 인도합니다."',
      tools: 'Claude Opus, Antigravity, In-house developed AI module',
      status: '품질 정합도 확보',
      icon: 'brain'
    },
    2: {
      badge: 'STAGE 02',
      title: 'Image Layer (사전 비주얼 매칭)',
      desc1: '확정된 시나리오 시퀀스를 바탕으로 고유 인물 룩(cref)과 컨셉 샷의 프롬프트를 GPT Image, Nanobanana 등으로 1차 렌더링합니다. 컷 바이 컷 비주얼 키프레임을 미리 감독과 일치시켜 후반 리테이크 소모를 완벽히 제거합니다.',
      desc2: '"스틸 단계에서 비주얼 합을 맞춘 뒤 비디오 렌더링에 돌입하여 오차 범위 제로의 통제감을 획득합니다."',
      tools: 'Higgsfield Engine, GPT Image, Nanobanana',
      status: '비주얼 일치도 확보',
      icon: 'image'
    },
    3: {
      badge: 'STAGE 03',
      title: 'Motion Layer (비디오 디퓨전 연산)',
      desc1: '확정된 L2 키프레임 이미지를 디렉티브 모션 프롬프트를 통해 물리적으로 구동시킵니다. Kling 3.0의 글로벌 무브먼트와 Seedance 2.0의 극사실 미장센 렌더링을 병렬 적용하여 자연스러운 시네마틱 모션을 합성합니다.',
      desc2: '"정적인 이미지를 넘어 유체 역학 및 카메라 카메라 이동의 물리 연산을 탑재해 자연스럽고 웅장하게 고동치는 생명력을 부여합니다."',
      tools: 'Kling 3.0, Seedance 2.0',
      status: '확정된 일관성 확보',
      icon: 'video'
    },
    4: {
      badge: 'STAGE 04',
      title: 'Audio Layer (청각 합성 다이렉션)',
      desc1: '영상 컷 단위의 흐름과 사운드 비트 율을 정밀 계산하여 ElevenLabs 기반 AI 다국적 보이스오버(VO)와 Suno AI 작곡 트랙을 싱크합니다. 효과음(SFX) 레이어링을 통해 귀를 채우는 현장감 있는 볼륨을 조화롭게 적층합니다.',
      desc2: '"인공지능 사운드는 생명력을 좌우하는 보이지 않는 50%의 레이어이며, 감정의 깊이를 배가시키는 사운드스케이프를 창조합니다."',
      tools: 'ElevenLabs, Suno AI',
      status: '오디오 레이턴시 제어',
      icon: 'music'
    },
    5: {
      badge: 'STAGE 05',
      title: 'Mastering (컷편집 및 업스케일러)',
      desc1: '최종 비디오의 노이즈 제거와 디테일 복원 텐서 프로세서를 거쳐 모바일 화면과 전시용 대형 스크린에 최적화된 4K HDR 완성본을 출력합니다.',
      desc2: '"가상 스튜디오 공정의 마지막 화룡점정으로서, 시네마틱 규격의 해상도 복원 및 프레임 보간을 통해 압도적인 완성도를 마감합니다."',
      tools: 'Topaz Video AI, Premiere',
      status: '4K Ultra HD 마스터링 출력',
      icon: 'sparkles'
    }
  };

  const item = data[layerNum];
  if (!item) return;

  document.querySelectorAll('.wf-tab-btn').forEach(btn => {
    btn.classList.remove('active-tab');
  });

  const activeBtn = document.getElementById('tab-' + layerNum);
  if (activeBtn) {
    activeBtn.classList.add('active-tab');
  }

  const badgeEl = document.getElementById('panel-stage-badge');
  const titleEl = document.getElementById('panel-title');
  const desc1El = document.getElementById('panel-desc-1');
  const desc2El = document.getElementById('panel-desc-2');
  const toolsEl = document.getElementById('panel-tools');
  const statusEl = document.getElementById('panel-status');
  const iconEl = document.getElementById('panel-icon');

  if (badgeEl) badgeEl.textContent = item.badge;
  if (titleEl) titleEl.textContent = item.title;
  if (desc1El) desc1El.textContent = item.desc1;
  if (desc2El) desc2El.textContent = item.desc2;
  if (toolsEl) toolsEl.textContent = item.tools;
  if (statusEl) statusEl.textContent = item.status;
  
  if (iconEl && window.lucide) {
    iconEl.setAttribute('data-lucide', item.icon);
    window.lucide.createIcons();
  }
};

// ── 10. GLOBAL HERO VIDEO SETTINGS INITIALIZER ──
function initGlobalVideoSettings() {
  let settings = {
    homeHeroVideo: "https://etdhihayhlponkmmnemj.supabase.co/storage/v1/object/public/video/portfolio_1.mp4"
  };

  try {
    const stored = localStorage.getItem('sl-global-settings');
    if (stored) {
      settings = JSON.parse(stored);
    } else if (window.SL_SETTINGS) {
      settings = window.SL_SETTINGS;
    }
  } catch (e) {}

  const homeVideo = document.getElementById('hero-video');
  if (homeVideo && settings.homeHeroVideo) {
    homeVideo.src = settings.homeHeroVideo;
  }
}

// ── 11. SCROLL REVEAL SYSTEM ──
function initScrollRevealSystem() {
  const revealObserverOptions = {
    root: null,
    rootMargin: '0px 0px -12% 0px', // Trigger when element is 12% above viewport bottom
    threshold: 0.05
  };
  
  window.revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, revealObserverOptions);
  
  document.querySelectorAll('.reveal-element').forEach(el => {
    window.revealObserver.observe(el);
  });
}

// ── 12. SCROLL PROGRESS & HERO PARALLAX SYSTEM ──
function initScrollProgressAndParallax() {
  const progress = document.getElementById('scroll-progress');
  const heroContent = document.querySelector('.hero-content');
  const heroSection = document.getElementById('home');
  
  let ticking = false;

  function updateScrollEffects() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // 1. Scroll Progress Bar Update
    if (progress && docHeight > 0) {
      const progressPercent = (scrollY / docHeight) * 100;
      progress.style.width = `${progressPercent}%`;
    }
    
    // 2. Hero Content Parallax & Smooth Scale/Fade Update
    if (heroContent) {
      const heroHeight = heroSection ? heroSection.offsetHeight : 800;
      if (scrollY <= heroHeight) {
        const ratio = scrollY / heroHeight; // 0 to 1
        
        // Scale down from 1 to 0.92, opacity from 1 to 0.15
        const scale = 1 - (ratio * 0.08);
        const opacity = 1 - (ratio * 0.85);
        
        heroContent.style.setProperty('--hero-scale', scale);
        heroContent.style.setProperty('--hero-opacity', opacity);
      } else {
        // Fallback for sections scrolled past entirely
        heroContent.style.setProperty('--hero-scale', '0.92');
        heroContent.style.setProperty('--hero-opacity', '0.15');
      }
    }
    
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrollEffects();
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial update
  updateScrollEffects();
}


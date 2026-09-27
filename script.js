const screens = Array.from(document.querySelectorAll('.screen'));
const switcher = document.getElementById('switcher');
const timers = {};
const navigationHistory = [];
let selectedJobId = 'ux';
let applicationUploadReturn = false;
let activeWorkType = '';
const jobs = {
  ux: {title:'UX/UI Designer', company:'Northstar Labs', location:'Remote', type:'Full-time', experience:'2–4 years', match:'92%', icon:'UX', required:'2+ years', companyAbout:'Northstar Labs builds thoughtful digital tools for modern teams.', role:'You will shape clear, useful product experiences from early ideas through polished delivery, working closely with product and engineering.'},
  product: {title:'Product Designer', company:'Fieldnote', location:'Hybrid', type:'Full-time', experience:'1–3 years', match:'86%', icon:'PD', required:'1+ years', companyAbout:'Fieldnote makes collaborative tools for teams that care about their craft.', role:'You will turn customer insight into simple product flows and partner with a small, focused design team.'},
  service: {title:'Service Designer', company:'Brightwell', location:'Remote', type:'Full-time', experience:'3–5 years', match:'81%', icon:'SD', required:'3+ years', companyAbout:'Brightwell helps organizations make complex services easier to use.', role:'You will map service journeys, find meaningful opportunities and help teams deliver better end-to-end experiences.'}
};

if (switcher) {
  screens.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.textContent = s.dataset.name;
    btn.dataset.name = s.dataset.name;
    if (i === 0) btn.classList.add('active');
    btn.addEventListener('click', () => goTo(s.dataset.name));
    switcher.appendChild(btn);
  });
}

function clearAutoTimers(){
  Object.values(timers).forEach(t => clearTimeout(t));
}

function goTo(name, options = {}){
  clearAutoTimers();
  const current = screens.find(sc => sc.classList.contains('active'))?.dataset.name;
  if (options.replaceCurrent && navigationHistory[navigationHistory.length - 1] === current){
    navigationHistory.pop();
  }
  if (options.record !== false && current && current !== name && current !== 'Splash' && name !== 'Login' && name !== 'Authentication'){
    navigationHistory.push(current);
  }
  screens.forEach(sc => sc.classList.remove('active'));
  if (switcher) {
    switcher.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.name === name));
  }
  const target = screens.find(sc => sc.dataset.name === name);
  if (target) target.classList.add('active');
  updateNavIndicators(name);

  if (name === 'Splash'){
    timers.splash = setTimeout(() => goTo('Login'), 2200);
  }
  if (name === 'Analyzing'){
    timers.analyzing = setTimeout(() => goTo('ATS Result'), 1700);
  }
  if (name === 'Authentication'){
    timers.authentication = setTimeout(() => goTo('Home'), 950);
  }
  if (name === 'Home'){
    setTimeout(checkAndShowOnboardingModal, 400);
  }
  if (name === 'Application Requirements'){
    applicationUploadReturn = false;
  }
}

function goBack(){
  const activeElement = document.activeElement;
  if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)){
    activeElement.blur();
    return;
  }
  const previous = navigationHistory.pop();
  if (previous){
    goTo(previous, {record:false});
    return;
  }
  goTo('Login', {record:false});
}

function beginAuth(provider){
  goTo(provider === 'Google' ? 'Google Account' : 'LinkedIn Account');
}

function selectAuthAccount(provider, row){
  const screen = row.closest('.screen');
  screen.querySelectorAll('.account-row').forEach(account => account.classList.remove('selected'));
  row.classList.add('selected');
  const copy = document.getElementById('authLoadingCopy');
  copy.textContent = `Signing in with ${provider}.`;
  setTimeout(() => goTo('Authentication'), 360);
}

function selectJob(id){
  selectedJobId = id;
  const job = jobs[id];
  document.getElementById('detailIcon').textContent = job.icon;
  document.getElementById('detailTitle').textContent = job.title;
  document.getElementById('detailCompany').textContent = job.company;
  document.getElementById('detailLocation').textContent = job.location;
  document.getElementById('detailType').textContent = job.type;
  document.getElementById('detailExperience').textContent = job.experience;
  document.getElementById('detailMatch').textContent = job.match;
  document.getElementById('detailCompanyAbout').textContent = job.companyAbout;
  document.getElementById('detailRole').textContent = job.role;
  document.getElementById('detailRequiredExperience').textContent = job.required;
  document.getElementById('matchSummaryScore').textContent = job.match;
  document.getElementById('applyJobTitle').textContent = job.title;
  document.getElementById('reviewJobTitle').textContent = job.title;
  document.getElementById('reviewCompany').textContent = job.company;
  document.getElementById('reviewMatch').textContent = job.match;
  goTo('Job Details');
}

function filterJobs(query){
  const term = query.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll('#jobList .job-item').forEach(item => {
    const matchesSearch = !term || item.dataset.search.toLowerCase().includes(term);
    const matchesWorkType = !activeWorkType || item.dataset.workType === activeWorkType;
    const matches = matchesSearch && matchesWorkType;
    item.style.display = matches ? 'flex' : 'none';
    if (matches) visible += 1;
  });
  document.getElementById('jobEmpty').style.display = visible ? 'none' : 'block';
}

function toggleJobFilter(){
  document.getElementById('jobFilterSheet').classList.toggle('open');
  document.getElementById('jobFilterBackdrop').classList.toggle('open');
}

function applyJobFilter(){
  activeWorkType = document.querySelector('input[name="workType"]:checked')?.value || '';
  const search = document.querySelector('.job-search input')?.value || '';
  filterJobs(search);
  toggleJobFilter();
}

function startApplicationUpload(){
  applicationUploadReturn = true;
  resetUpload();
  goTo('Upload');
}

function submitApplication(){
  const job = jobs[selectedJobId];
  document.getElementById('confirmationJobTitle').textContent = job.title;
  document.getElementById('confirmationCompany').textContent = job.company;
  goTo('Application Confirmation');
}

function toggleHelp(item){
  item.classList.toggle('open');
}

const defaultProfile = {
  name: '',
  email: '',
  phone: '',
  location: '',
  role: '',
  isComplete: false
};

function getStoredProfile(){
  try {
    const saved = localStorage.getItem('meletnova_user_profile');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return defaultProfile;
}

function saveProfileData(profile){
  try {
    localStorage.setItem('meletnova_user_profile', JSON.stringify(profile));
  } catch (e) {}
}

function updateProfileUI(){
  const profile = getStoredProfile();
  
  const nameInput = document.getElementById('profileInputName');
  const emailInput = document.getElementById('profileInputEmail');
  const phoneInput = document.getElementById('profileInputPhone');
  const locationInput = document.getElementById('profileInputLocation');
  const roleInput = document.getElementById('profileInputRole');

  if (nameInput) nameInput.value = profile.name || '';
  if (emailInput) emailInput.value = profile.email || '';
  if (phoneInput) phoneInput.value = profile.phone || '';
  if (locationInput) locationInput.value = profile.location || '';
  if (roleInput) roleInput.value = profile.role || '';

  const profileName = document.getElementById('profileDisplayName');
  const profileRole = document.getElementById('profileDisplayRole');
  const profileFooter = document.getElementById('profileDisplayFooter');
  const homeGreeting = document.getElementById('homeGreetingHeader');
  const homeAvatar = document.getElementById('homeAvatar');

  if (profile.isComplete && profile.name.trim()){
    const firstName = profile.name.trim().split(' ')[0];
    if (profileName) profileName.textContent = profile.name;
    if (profileRole) profileRole.textContent = `${profile.role || 'Resume Profile'}${profile.location ? ' • ' + profile.location : ''}`;
    if (profileFooter) profileFooter.textContent = `Building clear products, stronger applications and a career story as a ${profile.role || 'professional'}.`;
    if (homeGreeting) homeGreeting.textContent = `Good morning, ${firstName}`;
    if (homeAvatar) homeAvatar.textContent = firstName.charAt(0).toUpperCase();
  } else {
    if (profileName) profileName.textContent = 'Complete your profile';
    if (profileRole) profileRole.textContent = 'Tap Edit Profile to add your details';
    if (profileFooter) profileFooter.textContent = 'Upload a resume or add your details below to personalize your ATS scores and career insights.';
    if (homeGreeting) homeGreeting.textContent = 'Good morning';
    if (homeAvatar) homeAvatar.textContent = '👤';
  }
}

function savePersonalDetails(){
  const nameInput = document.getElementById('profileInputName')?.value || '';
  const emailInput = document.getElementById('profileInputEmail')?.value || '';
  const phoneInput = document.getElementById('profileInputPhone')?.value || '';
  const locationInput = document.getElementById('profileInputLocation')?.value || '';
  const roleInput = document.getElementById('profileInputRole')?.value || '';

  const updated = {
    name: nameInput,
    email: emailInput,
    phone: phoneInput,
    location: locationInput,
    role: roleInput,
    isComplete: Boolean(nameInput.trim())
  };

  saveProfileData(updated);
  updateProfileUI();
  toast('Changes saved');
  setTimeout(() => goBack(), 350);
}

function bindNativeInputScrolling(){
  document.querySelectorAll('.screen[data-name="Personal Details"] .form-stack input').forEach(input => {
    input.addEventListener('focus', () => {
      setTimeout(() => input.scrollIntoView({block:'center', behavior:'smooth'}), 100);
    });
  });
}

function normalizeStatusBars(){
  document.querySelectorAll('.statusbar').forEach(bar => {
    const signal = bar.querySelector('span:last-child');
    if (!signal) return;
    signal.className = 'status-icons';
    signal.innerHTML = '<span class="status-signal" aria-label="Mobile signal"><i></i><i></i><i></i><i></i></span><span class="status-wifi" aria-label="Wi-Fi"></span><span class="status-battery" aria-label="Battery"></span>';
  });
}

function updateNavIndicators(name){
  const targetMap = { 'Home': 0, 'Upload': 1, 'History': 2, 'Profile': 3 };
  const targetIndex = targetMap[name];
  
  document.querySelectorAll('.bottomnav').forEach(nav => {
    const icons = nav.querySelectorAll('.navicon');
    icons.forEach((icon) => {
      const isActive = icon.dataset.target === name;
      icon.classList.toggle('active', isActive);
    });
    if (targetIndex !== undefined) {
      nav.setAttribute('data-active-index', targetIndex);
    }
  });
}

function navTap(el, target){
  goTo(target);
}

function setHomeMode(mode){
  const isEmployer = mode === 'employer';
  const seekerButton = document.getElementById('jobSeekerModeBtn');
  const employerButton = document.getElementById('employerModeBtn');
  const seekerPanel = document.getElementById('jobSeekerPanel');
  const employerPanel = document.getElementById('employerPanel');
  if (!seekerButton || !employerButton || !seekerPanel || !employerPanel) return;

  seekerButton.classList.toggle('active', !isEmployer);
  employerButton.classList.toggle('active', isEmployer);
  seekerButton.setAttribute('aria-selected', String(!isEmployer));
  employerButton.setAttribute('aria-selected', String(isEmployer));
  seekerPanel.classList.toggle('active', !isEmployer);
  employerPanel.classList.toggle('active', isEmployer);
  seekerPanel.hidden = isEmployer;
  employerPanel.hidden = !isEmployer;
}

function setEmployerSource(source, button){
  document.querySelectorAll('.employer-source').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const textarea = document.getElementById('employerJobDescription');
  const fileNote = document.getElementById('employerFileNote');
  const isFile = source === 'file';
  textarea.hidden = isFile;
  fileNote.hidden = !isFile;
}

function handleLogin(){
  const btn = document.getElementById('loginBtn');
  const original = btn.textContent;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Logging in…';
  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = original;
    goTo('Home');
  }, 900);
}

function handleReset(){
  const btn = document.getElementById('resetBtn');
  const success = document.getElementById('resetSuccess');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner spinner-navy"></span> Sending…';
  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = 'Send reset link';
    success.style.display = 'block';
    success.style.animation = 'fadeUp .35s ease';
  }, 800);
}

let currentSelectedFile = null;

function triggerFileSelect(){
  const input = document.getElementById('realFileInput');
  if (input) input.click();
}

function bytesToSize(bytes){
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function handleDragOver(e){
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById('dropzone');
  if (dz) dz.style.borderColor = '#2563EB';
}

function handleDragLeave(e){
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById('dropzone');
  if (dz) dz.style.borderColor = 'rgba(23,42,56,0.22)';
}

function handleFileDrop(e){
  e.preventDefault();
  e.stopPropagation();
  handleDragLeave(e);
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0){
    processSelectedFile(e.dataTransfer.files[0]);
  }
}

function handleFileSelect(e){
  if (e.target.files && e.target.files.length > 0){
    processSelectedFile(e.target.files[0]);
  }
}

function processSelectedFile(file){
  currentSelectedFile = file;
  const dropzone = document.getElementById('dropzone');
  const doneWrap = document.getElementById('uploadDoneWrap');
  const errorWrap = document.getElementById('uploadErrorWrap');
  const errorText = document.getElementById('uploadErrorText');
  const analyzeBtn = document.getElementById('analyzeBtn');

  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['pdf', 'doc', 'docx', 'txt'];

  if (!allowed.includes(ext)){
    dropzone.style.display = 'none';
    doneWrap.style.display = 'none';
    errorWrap.style.display = 'block';
    errorText.textContent = `Unsupported file format (.${ext}). Please upload a PDF, DOC, DOCX, or TXT file.`;
    analyzeBtn.disabled = true;
    return;
  }

  if (file.size > 10 * 1024 * 1024){
    dropzone.style.display = 'none';
    doneWrap.style.display = 'none';
    errorWrap.style.display = 'block';
    errorText.textContent = `File size (${bytesToSize(file.size)}) exceeds the 10MB limit. Please compress or select a smaller file.`;
    analyzeBtn.disabled = true;
    return;
  }

  // Valid file
  errorWrap.style.display = 'none';
  dropzone.style.display = 'none';
  doneWrap.style.display = 'block';

  document.getElementById('uploadedFileName').textContent = file.name;
  document.getElementById('selectedFileNameProgress').textContent = file.name;
  document.getElementById('uploadedFileSize').textContent = `${bytesToSize(file.size)} · Ready for analysis`;
  document.getElementById('uploadedBadge').textContent = ext.toUpperCase();

  // Update other dynamic labels across the app if available
  const matchResumeName = document.querySelectorAll('.selected-resume strong');
  matchResumeName.forEach(el => el.textContent = file.name);

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = applicationUploadReturn ? 'Continue to requirements' : 'Analyze resume';
  analyzeBtn.onclick = () => startAnalysisFromUpload();
}

const ALL_SKILLS_BANK = [
  "Project management", "SQL", "Stakeholder comms", "Agile", "Data analysis", "Roadmapping",
  "Figma", "User research", "UI Design", "Prototyping", "A/B testing", "Python", "Budget ownership",
  "Product Strategy", "Wireframing", "Scrum", "Customer interviews", "Metrics tracking"
];

function analyzeFileContent(file, rawText = ""){
  const textUpper = (rawText || "").toUpperCase();
  const fileName = file ? file.name : "Resume_Sample.pdf";
  const fileSizeStr = file ? bytesToSize(file.size) : "1.8 MB";
  const ext = fileName.split('.').pop().toUpperCase();

  const matched = [];
  const missing = [];

  ALL_SKILLS_BANK.forEach(skill => {
    if (textUpper.includes(skill.toUpperCase()) || Math.random() > 0.45){
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const finalMatched = matched.slice(0, 12);
  const finalMissing = missing.slice(0, 4);
  const rawScore = Math.round((finalMatched.length / (finalMatched.length + finalMissing.length)) * 100);
  const score = Math.max(68, Math.min(94, rawScore));

  let candidateName = "";
  const nameMatch = (rawText || "").match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
  if (nameMatch) candidateName = nameMatch[1];

  const analysisRecord = {
    id: Date.now(),
    fileName: fileName,
    fileSize: fileSizeStr,
    fileType: ext,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    score: score,
    matched: finalMatched,
    missing: finalMissing,
    candidateName: candidateName
  };

  saveAnalysisToHistory(analysisRecord);
  displayAnalysisResults(analysisRecord);

  if (candidateName){
    const currentProfile = getStoredProfile();
    currentProfile.name = candidateName;
    currentProfile.isComplete = true;
    saveProfileData(currentProfile);
    updateProfileUI();
  }
}

function saveAnalysisToHistory(record){
  try {
    let history = JSON.parse(localStorage.getItem('meletnova_history') || '[]');
    history = history.filter(item => item.fileName !== record.fileName);
    history.unshift(record);
    localStorage.setItem('meletnova_history', JSON.stringify(history));
  } catch (e) {}
  renderHistoryList();
}

function renderHistoryList(){
  const container = document.getElementById('historyCardList');
  const badge = document.getElementById('historyCountBadge');
  if (!container) return;

  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('meletnova_history') || '[]');
  } catch (e) {}

  if (history.length === 0){
    history = [
      { id: 1, fileName: 'Resume_Aditi_v3.pdf', date: 'Sep 11, 2026', score: 82, fileType: 'PDF' },
      { id: 2, fileName: 'Resume_Aditi_v2.pdf', date: 'Sep 4, 2026', score: 68, fileType: 'PDF' },
      { id: 3, fileName: 'Resume_Aditi_v1.pdf', date: 'Aug 22, 2026', score: 61, fileType: 'PDF' }
    ];
  }

  if (badge) badge.textContent = `${history.length} ${history.length === 1 ? 'Resume' : 'Resumes'}`;

  container.innerHTML = history.map((item, idx) => `
    <button class="ref2-list-item ref2-history-item" onclick="loadHistoryItem(${item.id})">
      <div class="ref2-item-icon ${idx % 2 === 0 ? 'icon-bg-blue' : 'icon-bg-sky'}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
      </div>
      <div class="ref2-item-text">
        <strong>${item.fileName}</strong>
        <small>${item.date} · Complete</small>
      </div>
      <div class="ref2-score-chip ${item.score >= 80 ? 'chip-royal' : 'chip-sky'}">
        ${item.score}
      </div>
      <div class="ref2-chevron">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </button>
  `).join('');
}

function loadHistoryItem(id){
  let history = [];
  try { history = JSON.parse(localStorage.getItem('meletnova_history') || '[]'); } catch (e) {}
  const item = history.find(h => h.id === id);
  if (item){
    displayAnalysisResults(item);
  }
  goTo('ATS Result');
}

function displayAnalysisResults(record){
  const scoreEl = document.getElementById('atsScoreDisplay');
  const badgeEl = document.getElementById('atsMatchBadge');
  const matchedEl = document.getElementById('atsMatchedCount');
  const missingEl = document.getElementById('atsMissingCount');

  if (scoreEl) scoreEl.textContent = record.score || 82;
  if (badgeEl) badgeEl.textContent = (record.score || 82) >= 80 ? 'Strong match' : 'Moderate match';
  if (matchedEl) matchedEl.textContent = record.matched ? record.matched.length : 12;
  if (missingEl) missingEl.textContent = record.missing ? record.missing.length : 4;
}

function toggleAnalysisDropdown(e){
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('analysisTypeDropdown');
  if (dropdown) dropdown.classList.toggle('open');
}

function selectAnalysisOption(label, element){
  const labelEl = document.getElementById('selectedAnalysisTypeLabel');
  if (labelEl) labelEl.textContent = label;

  document.querySelectorAll('#analysisDropdownPanel .select-option').forEach(opt => {
    opt.classList.remove('selected');
    const check = opt.querySelector('.check-ico');
    if (check) check.remove();
  });

  element.classList.add('selected');
  element.insertAdjacentHTML('beforeend', '<svg class="check-ico" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2563EB" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>');

  const dropdown = document.getElementById('analysisTypeDropdown');
  if (dropdown) dropdown.classList.remove('open');
}

document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('analysisTypeDropdown');
  if (dropdown && !dropdown.contains(e.target)){
    dropdown.classList.remove('open');
  }
});

function startAnalysisFromUpload(){
  const progressWrap = document.getElementById('uploadProgressWrap');
  const doneWrap = document.getElementById('uploadDoneWrap');
  const bar = document.getElementById('progressBar');
  const pct = document.getElementById('progressPct');

  doneWrap.style.display = 'none';
  progressWrap.style.display = 'block';
  bar.style.width = '0%';
  pct.textContent = '0%';

  if (currentSelectedFile){
    const reader = new FileReader();
    reader.onload = function(e){
      const text = e.target.result || "";
      analyzeFileContent(currentSelectedFile, text);
    };
    reader.onerror = function(){
      analyzeFileContent(currentSelectedFile, "");
    };
    try {
      reader.readAsText(currentSelectedFile);
    } catch (err){
      analyzeFileContent(currentSelectedFile, "");
    }
  }

  let p = 0;
  const iv = setInterval(() => {
    p += 22 + Math.random() * 15;
    if (p >= 100){
      p = 100;
      clearInterval(iv);
      setTimeout(() => {
        progressWrap.style.display = 'none';
        doneWrap.style.display = 'block';
        if (applicationUploadReturn){
          goTo('Application Requirements', {replaceCurrent:true});
        } else {
          goTo('Analyzing');
        }
      }, 200);
    }
    bar.style.width = p + '%';
    pct.textContent = Math.round(p) + '%';
  }, 140);
}

function resetUpload(){
  currentSelectedFile = null;
  const input = document.getElementById('realFileInput');
  if (input) input.value = '';
  document.getElementById('uploadDoneWrap').style.display = 'none';
  document.getElementById('uploadErrorWrap').style.display = 'none';
  document.getElementById('uploadProgressWrap').style.display = 'none';
  document.getElementById('dropzone').style.display = 'block';
  const analyzeBtn = document.getElementById('analyzeBtn');
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyze resume';
  analyzeBtn.onclick = () => startAnalysisFromUpload();
}

let toastTimer;
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg === 'Changes saved' ? '✓ Changes saved' : msg + ' — coming soon';
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
  }, 1400);
}

normalizeStatusBars();
bindNativeInputScrolling();
updateProfileUI();
renderHistoryList();

// ==========================================================================
// CENTRALIZED SUBSCRIPTION CONFIGURATION & ENTITLEMENT SYSTEM (INR ₹)
// ==========================================================================
const SUBSCRIPTION_CONFIG = {
  currency: 'INR',
  currencySymbol: '₹',
  billingCycles: {
    monthly: { label: 'Monthly', discountBadge: null },
    yearly: { label: 'Yearly', discountBadge: 'Save 17%' }
  },
  plans: {
    free: {
      id: 'free',
      name: 'Free Trial',
      badge: 'Current Plan',
      price: { monthly: 0, yearly: 0 },
      datasetLimit: 1,
      uploadLimit: 1,
      fileFormats: ['CSV'],
      dashboardAccess: '50% Preview',
      isPopular: false
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      badge: 'Recommended',
      price: { monthly: 799, yearly: 7990 },
      datasetLimit: 3,
      uploadLimit: 3,
      fileFormats: ['CSV', 'Excel (.xlsx)'],
      dashboardAccess: '100% Full Unlocked',
      isPopular: true
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      badge: 'Custom',
      price: { monthly: 2499, yearly: 24990 },
      isContactSales: true,
      datasetLimit: 'Unlimited',
      uploadLimit: 'Unlimited',
      fileFormats: ['CSV', 'Excel', 'PDF Tables', 'JSON'],
      dashboardAccess: 'Advanced Interactive + Custom Filters',
      isPopular: false
    }
  }
};

let currentBillingCycle = 'monthly';
let currentPaymentProvider = 'razorpay';
let selectedCheckoutPlanId = 'pro';

function getStoredSubscription(){
  try {
    const saved = localStorage.getItem('meletnova_subscription');
    if (saved) return JSON.parse(saved);
  } catch(e){}
  return {
    planId: 'free',
    planName: 'Free Trial',
    status: 'active',
    billingCycle: 'monthly',
    startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    nextBillingDate: 'Lifetime',
    amountPaid: 0,
    paymentProvider: 'Free Onboarding',
    transactionId: 'TXN_FREE_INITIAL',
    usage: { datasets: 1, aiQueries: 5, reportsGenerated: 1, forecastsRun: 0 }
  };
}

function saveSubscriptionState(sub){
  try {
    localStorage.setItem('meletnova_subscription', JSON.stringify(sub));
  } catch(e){}
}

function hasEntitlement(featureName){
  const sub = getStoredSubscription();
  if (sub.planId === 'enterprise') return true;
  if (sub.planId === 'pro') {
    return featureName !== 'customFilters' && featureName !== 'ensembleML';
  }
  return false;
}

// First Login Onboarding Modal
function checkAndShowOnboardingModal(){
  const dismissed = localStorage.getItem('meletnova_onboarding_dismissed');
  if (!dismissed) {
    const modal = document.getElementById('premiumOnboardingModal');
    if (modal) modal.style.display = 'flex';
  }
}

function closeOnboardingModal(){
  const modal = document.getElementById('premiumOnboardingModal');
  if (modal) modal.style.display = 'none';
  localStorage.setItem('meletnova_onboarding_dismissed', 'true');
}

function selectOnboardingPlan(planId){
  closeOnboardingModal();
  initiateUpgrade(planId);
}

// Pricing Page Cycle Toggle
function setBillingCycle(cycle){
  currentBillingCycle = cycle;
  const monthlyBtn = document.getElementById('toggleMonthlyBtn');
  const yearlyBtn = document.getElementById('toggleYearlyBtn');
  const proPriceDisplay = document.getElementById('proPriceDisplay');
  const enterprisePriceDisplay = document.getElementById('enterprisePriceDisplay');
  const cycleTexts = document.querySelectorAll('.cycle-text');

  if (monthlyBtn) monthlyBtn.classList.toggle('active', cycle === 'monthly');
  if (yearlyBtn) yearlyBtn.classList.toggle('active', cycle === 'yearly');

  if (cycle === 'yearly') {
    if (proPriceDisplay) proPriceDisplay.textContent = '₹7,990';
    if (enterprisePriceDisplay) enterprisePriceDisplay.textContent = '₹24,990';
    cycleTexts.forEach(el => el.textContent = '/ year');
  } else {
    if (proPriceDisplay) proPriceDisplay.textContent = '₹799';
    if (enterprisePriceDisplay) enterprisePriceDisplay.textContent = '₹2,499';
    cycleTexts.forEach(el => el.textContent = '/ month');
  }
}

function setPaymentProvider(provider){
  currentPaymentProvider = provider;
  const razorpayBtn = document.getElementById('providerRazorpayBtn');
  const phonepeBtn = document.getElementById('providerPhonepeBtn');
  if (razorpayBtn) razorpayBtn.classList.toggle('active', provider === 'razorpay');
  if (phonepeBtn) phonepeBtn.classList.toggle('active', provider === 'phonepe');
}

function selectPlan(planId){
  if (planId === 'free') {
    toast('You are currently on the Free Trial');
    return;
  }
  initiateUpgrade(planId);
}

// Checkout & Razorpay/PhonePe Payment Flow
function initiateUpgrade(planId){
  if (planId === 'free') {
    toast('You are currently on the Free Trial');
    return;
  }
  selectedCheckoutPlanId = planId;
  const plan = SUBSCRIPTION_CONFIG.plans[planId] || SUBSCRIPTION_CONFIG.plans.pro;
  
  const titleEl = document.getElementById('checkoutPlanTitle');
  const planNameEl = document.getElementById('checkoutSelectedPlan');
  const cycleEl = document.getElementById('checkoutSelectedCycle');
  const amountEl = document.getElementById('checkoutTotalAmount');
  const modal = document.getElementById('checkoutModal');

  const price = plan.price[currentBillingCycle];
  if (titleEl) titleEl.textContent = `Upgrade to ${plan.name}`;
  if (planNameEl) planNameEl.textContent = plan.name;
  if (cycleEl) cycleEl.textContent = currentBillingCycle === 'yearly' ? 'Yearly (Save 17%)' : 'Monthly';
  if (amountEl) amountEl.textContent = `₹${price.toLocaleString()}`;

  setCheckoutProvider(currentPaymentProvider);
  if (modal) modal.style.display = 'flex';
}

function closeCheckoutModal(){
  const modal = document.getElementById('checkoutModal');
  if (modal) modal.style.display = 'none';
}

function setCheckoutProvider(provider){
  currentPaymentProvider = provider;
  const choiceRazorpay = document.getElementById('choiceRazorpay');
  const choicePhonepe = document.getElementById('choicePhonepe');
  if (choiceRazorpay) choiceRazorpay.classList.toggle('active', provider === 'razorpay');
  if (choicePhonepe) choicePhonepe.classList.toggle('active', provider === 'phonepe');
}

async function executeCheckoutPayment(){
  const plan = SUBSCRIPTION_CONFIG.plans[selectedCheckoutPlanId] || SUBSCRIPTION_CONFIG.plans.pro;
  const price = plan.price[currentBillingCycle];
  const startBtn = document.getElementById('startPaymentBtn');
  
  if (startBtn) {
    startBtn.disabled = true;
    startBtn.textContent = 'Processing Server Order...';
  }

  try {
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: selectedCheckoutPlanId,
        billingCycle: currentBillingCycle,
        paymentProvider: currentPaymentProvider
      })
    });

    const orderData = await response.json();
    closeCheckoutModal();

    if (currentPaymentProvider === 'razorpay' && window.Razorpay) {
      const options = {
        key: orderData.key || 'rzp_test_meletnova_demo123',
        amount: orderData.amount || Math.round(price * 100),
        currency: 'INR',
        name: 'Meletnova Solutions',
        description: `Upgrade to ${plan.name} (${currentBillingCycle})`,
        order_id: orderData.orderId,
        handler: async function (razorpayResponse) {
          toast('Verifying payment on server...');
          await verifyPaymentOnServer({
            razorpay_order_id: razorpayResponse.razorpay_order_id || orderData.orderId,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id || `pay_${Date.now()}`,
            razorpay_signature: razorpayResponse.razorpay_signature || 'demo_sig_verified',
            planId: selectedCheckoutPlanId,
            billingCycle: currentBillingCycle,
            paymentProvider: 'Razorpay'
          });
        },
        prefill: {
          name: getStoredProfile().name || 'Aditi Rao',
          email: getStoredProfile().email || 'user@email.com',
          contact: getStoredProfile().phone || '+91 98765 43210'
        },
        theme: { color: '#2563EB' },
        modal: {
          ondismiss: function () {
            toast('Payment checkout cancelled');
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      toast('Processing secure server payment...');
      setTimeout(async () => {
        await verifyPaymentOnServer({
          razorpay_order_id: orderData.orderId || `ord_${Date.now()}`,
          razorpay_payment_id: `pay_${currentPaymentProvider}_${Date.now()}`,
          razorpay_signature: 'demo_sig_verified',
          planId: selectedCheckoutPlanId,
          billingCycle: currentBillingCycle,
          paymentProvider: currentPaymentProvider === 'phonepe' ? 'PhonePe UPI' : 'Razorpay'
        });
      }, 900);
    }
  } catch (error) {
    console.error('Payment error:', error);
    await verifyPaymentOnServer({
      razorpay_order_id: `ord_${Date.now()}`,
      razorpay_payment_id: `pay_demo_${Date.now()}`,
      razorpay_signature: 'demo_sig_verified',
      planId: selectedCheckoutPlanId,
      billingCycle: currentBillingCycle,
      paymentProvider: currentPaymentProvider === 'phonepe' ? 'PhonePe UPI' : 'Razorpay'
    });
  } finally {
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = 'Proceed to Payment 🔒';
    }
  }
}

async function verifyPaymentOnServer(paymentData){
  try {
    const res = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    const data = await res.json();
    if (data.success && data.subscription) {
      saveSubscriptionState(data.subscription);
      updateProfileSubscriptionUI();
      renderBillingHistory();
      showPaymentConfirmation(data.subscription);
      return;
    }
  } catch (e) {}

  const plan = SUBSCRIPTION_CONFIG.plans[paymentData.planId] || SUBSCRIPTION_CONFIG.plans.pro;
  const price = plan.price[paymentData.billingCycle];
  const now = new Date();
  const renewal = new Date();
  if (paymentData.billingCycle === 'yearly') renewal.setFullYear(now.getFullYear() + 1);
  else renewal.setMonth(now.getMonth() + 1);

  const newSub = {
    planId: plan.id,
    planName: plan.name,
    status: 'active',
    billingCycle: paymentData.billingCycle,
    startDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    nextBillingDate: renewal.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    amountPaid: price,
    paymentProvider: paymentData.paymentProvider || 'Razorpay',
    transactionId: paymentData.razorpay_payment_id || `TXN_${Date.now()}`,
    usage: { datasets: 1, aiQueries: 8, reportsGenerated: 4, forecastsRun: 1 }
  };

  saveSubscriptionState(newSub);
  updateProfileSubscriptionUI();
  renderBillingHistory();
  showPaymentConfirmation(newSub);
}

function showPaymentConfirmation(sub){
  const nameEl = document.getElementById('confirmPlanName');
  const amountEl = document.getElementById('confirmAmountPaid');
  const cycleEl = document.getElementById('confirmBillingCycle');
  const txnEl = document.getElementById('confirmTxnId');
  const renewalEl = document.getElementById('confirmRenewalDate');

  if (nameEl) nameEl.textContent = sub.planName || 'Pro Plan';
  if (amountEl) amountEl.textContent = `₹${(sub.amountPaid || 799).toLocaleString()}`;
  if (cycleEl) cycleEl.textContent = sub.billingCycle === 'yearly' ? 'Yearly' : 'Monthly';
  if (txnEl) txnEl.textContent = sub.transactionId || 'TXN_987123';
  if (renewalEl) renewalEl.textContent = sub.nextBillingDate || 'Oct 27, 2026';

  goTo('Payment Confirmation');
}

function updateProfileSubscriptionUI(){
  const sub = getStoredSubscription();
  const plan = SUBSCRIPTION_CONFIG.plans[sub.planId] || SUBSCRIPTION_CONFIG.plans.free;

  const badgeEl = document.getElementById('profilePlanBadge');
  const nameEl = document.getElementById('profilePlanName');
  const statusEl = document.getElementById('profilePlanStatus');
  const cycleEl = document.getElementById('profileBillingCycle');
  const renewalEl = document.getElementById('profileRenewalDate');
  const amountEl = document.getElementById('profileAmountPaid');
  const providerEl = document.getElementById('profilePaymentProvider');

  if (badgeEl) {
    badgeEl.textContent = plan.name.toUpperCase();
    badgeEl.style.background = sub.planId === 'pro' ? '#2563EB' : sub.planId === 'enterprise' ? '#7C3AED' : 'rgba(255,255,255,0.2)';
  }
  if (nameEl) nameEl.textContent = `${plan.name} Plan`;
  if (statusEl) statusEl.textContent = sub.status === 'active' ? '● Active' : '○ Pending';
  if (cycleEl) cycleEl.textContent = sub.billingCycle === 'yearly' ? 'Yearly (Save 17%)' : 'Monthly';
  if (renewalEl) renewalEl.textContent = sub.nextBillingDate || 'Lifetime';
  if (amountEl) amountEl.textContent = `₹${(sub.amountPaid || 0).toLocaleString()}`;
  if (providerEl) providerEl.textContent = sub.paymentProvider || 'Free Onboarding';

  // Progress Bars
  const datasetText = document.getElementById('datasetUsageText');
  const datasetFill = document.getElementById('datasetUsageFill');
  const aiText = document.getElementById('aiUsageText');
  const aiFill = document.getElementById('aiUsageFill');
  const reportText = document.getElementById('reportUsageText');
  const reportFill = document.getElementById('reportUsageFill');
  const forecastText = document.getElementById('forecastUsageText');
  const forecastFill = document.getElementById('forecastUsageFill');

  if (sub.planId === 'enterprise') {
    if (datasetText) datasetText.textContent = 'Unlimited';
    if (datasetFill) datasetFill.style.width = '100%';
    if (aiText) aiText.textContent = 'Unlimited';
    if (aiFill) aiFill.style.width = '100%';
    if (reportText) reportText.textContent = 'Unlimited';
    if (reportFill) reportFill.style.width = '100%';
    if (forecastText) { forecastText.textContent = 'Unlimited'; forecastText.style.color = '#A7F3D0'; }
    if (forecastFill) { forecastFill.style.width = '100%'; forecastFill.style.background = '#A7F3D0'; }
  } else if (sub.planId === 'pro') {
    if (datasetText) datasetText.textContent = '2 / 3';
    if (datasetFill) datasetFill.style.width = '66%';
    if (aiText) aiText.textContent = '8 / 20';
    if (aiFill) aiFill.style.width = '40%';
    if (reportText) reportText.textContent = '4 / 10';
    if (reportFill) reportFill.style.width = '40%';
    if (forecastText) { forecastText.textContent = '1 / 5'; forecastText.style.color = '#FFFFFF'; }
    if (forecastFill) { forecastFill.style.width = '20%'; forecastFill.style.background = '#60A5FA'; }
  } else {
    if (datasetText) datasetText.textContent = '1 / 1';
    if (datasetFill) datasetFill.style.width = '100%';
    if (aiText) aiText.textContent = '5 / 5';
    if (aiFill) aiFill.style.width = '100%';
    if (reportText) reportText.textContent = '1 / 1';
    if (reportFill) reportFill.style.width = '100%';
    if (forecastText) { forecastText.textContent = '🔒 Locked'; forecastText.style.color = '#FDE047'; }
    if (forecastFill) { forecastFill.style.width = '0%'; forecastFill.style.background = '#FDE047'; }
  }

  // Feature Lock Overlay
  const mlOverlay = document.getElementById('mlForecastLockOverlay');
  const mlBadge = document.getElementById('mlForecastBadge');
  if (sub.planId !== 'free') {
    if (mlOverlay) mlOverlay.style.display = 'none';
    if (mlBadge) { mlBadge.textContent = '✓ Unlocked'; mlBadge.style.background = '#D1FAE5'; mlBadge.style.color = '#059669'; }
  } else {
    if (mlOverlay) mlOverlay.style.display = 'flex';
    if (mlBadge) { mlBadge.textContent = '🔒 Pro Feature'; mlBadge.style.background = '#FEF3C7'; mlBadge.style.color = '#D97706'; }
  }
}

function renderBillingHistory(){
  const container = document.getElementById('billingHistoryList');
  if (!container) return;

  const sub = getStoredSubscription();
  const history = [
    {
      id: sub.transactionId || 'TXN_89712345',
      date: sub.startDate || 'Sep 27, 2026',
      planName: sub.planName || (sub.planId === 'pro' ? 'Pro Plan' : 'Free Trial'),
      amount: sub.amountPaid || 0,
      currency: 'INR',
      status: 'Paid',
      provider: sub.paymentProvider || 'Razorpay'
    },
    {
      id: 'TXN_10928374',
      date: 'Sep 25, 2026',
      planName: 'Free Trial',
      amount: 0,
      currency: 'INR',
      status: 'Paid',
      provider: 'Free Onboarding'
    }
  ];

  container.innerHTML = history.map(item => `
    <div class="card" style="padding:16px;border-radius:18px;margin-bottom:12px;background:#FFFFFF;border:1px solid #E2E8F0;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <strong style="font-family:'Sora';font-size:14.5px;color:var(--navy);">${item.planName}</strong>
          <div style="font-size:11.5px;color:var(--ink-muted);margin-top:2px;">${item.date} · ${item.provider}</div>
        </div>
        <div style="text-align:right;">
          <strong style="font-family:'Sora';font-size:16px;color:${item.amount > 0 ? '#2563EB' : 'var(--navy)'};">₹${item.amount.toLocaleString()}</strong>
          <div style="margin-top:3px;"><span class="status-chip chip-paid" style="background:#D1FAE5;color:#059669;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;">● ${item.status}</span></div>
        </div>
      </div>
      <div style="margin-top:12px;padding-top:10px;border-top:1px solid #F1F5F9;display:flex;justify-content:space-between;align-items:center;font-size:11.5px;">
        <span style="font-family:monospace;color:var(--ink-muted);">${item.id}</span>
        <button class="tappable" style="color:#2563EB;font-weight:700;background:none;border:none;" onclick="toast('Downloading receipt PDF...')">Download Receipt 📥</button>
      </div>
    </div>
  `).join('');
}

updateProfileSubscriptionUI();
renderBillingHistory();

// kick off splash auto-advance on load
goTo('Splash');


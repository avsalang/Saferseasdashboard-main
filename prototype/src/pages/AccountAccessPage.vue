<template>
  <main class="login-page">
    <div class="bg-photo" :style="{ backgroundImage: `url(${maritimeBg})` }"></div>
    <div class="bg-overlay"></div>
    <div class="bg-grid"></div>

    <div class="desktop-layout">
      <!-- Left Side - Info Section -->
      <div class="left-section">

        <div class="info-content" :class="{ 'animate-in': isVisible }">
          <div class="logo-area q-mb-xl">
            <h1 class="logo-text">SAFER<span class="text-cyan">SEAS</span></h1>
            <p class="logo-tagline">MARINA · Reporting & Administration</p>
          </div>

          <h1 class="desktop-title">
            <span class="title-line">SAFERSEAS:</span>
            <span class="title-line text-cyan">MARINA Platform</span>
          </h1>

          <p class="desktop-subtitle">
            Sign in with your MARINA-issued account to report maritime incidents, review submissions, manage investigations and prepare required outputs.
          </p>

          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-icon"><q-icon name="assignment_turned_in" size="22px" /></div>
              <span>Manage Reports</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><q-icon name="supervisor_account" size="22px" /></div>
              <span>Staff Oversight</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"><q-icon name="lock" size="22px" /></div>
              <span>Issued Accounts</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Form Section -->
      <div class="right-section">
        <div class="login-card" :class="{ 'animate-in': isVisible }">
<q-btn flat no-caps icon="arrow_back" label="Back to sign in" to="/login" class="q-mb-lg"/>
<h2 class="step-title">{{activation?'Activate your account':'Recover access'}}</h2><p class="step-desc">{{activation?'Use the invitation provided by MARINA.':'Request help for your issued account.'}}</p><q-form @submit="process" v-if="!done"><q-select v-if="activation" v-model="invited" :options="invites" option-label="email" option-value="id" emit-value map-options outlined label="Issued demo invitation" class="q-mb-md" :rules="[v=>!!v||'Select an issued invitation']"/><q-input v-else v-model="email" outlined label="Account email" type="email" class="q-mb-md" :rules="[v=>!!v||'Enter account email']"/><q-input v-if="activation" v-model="password" outlined label="Set demo password" type="password" hint="Use Demo2026! for this demonstration." class="q-mb-lg" :rules="[v=>v==='Demo2026!'||'Use Demo2026! in this demonstration']"/><q-btn type="submit" color="primary" unelevated no-caps :label="activation?'Activate demo account':'Request recovery'" class="full-width"/></q-form><q-banner v-else class="bg-blue-1 text-primary"><q-icon name="check_circle" class="q-mr-sm"/>{{activation?'The issued demonstration account is active. Sign in using its email and Demo2026!.':'Recovery request recorded in this preview. No email has been sent; production recovery requires the backend.'}}</q-banner><div class="help-note q-mt-lg">This screen does not create an unapproved account. MARINA must issue the invitation first.</div></div><div class="footer-simple external-links">Fictional account lifecycle · no email is sent</div></div></div></main></template><script setup>import{ref,computed}from'vue';import{useRoute}from'vue-router';import{useDemo}from'../stores/demo.js';const isVisible=true,maritimeBg=import.meta.env.BASE_URL+'admin-command-bg.png';const store=useDemo(),route=useRoute(),activation=computed(()=>route.path==='/activate'),email=ref(''),password=ref(''),invited=ref('u-invited'),done=ref(false),invites=computed(()=>store.state.users.filter(u=>u.status==='invited'));function process(){if(activation.value){const u=store.state.users.find(u=>u.id===invited.value&&u.status==='invited');if(!u)return;u.status='active';store.audit('Demo invitation activated',u.id,'Issued account only; no real identity service.');store.persist()}done.value=true}</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

.login-page {
  min-height: 100vh;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.desktop-layout {
  display: flex;
  min-height: 100vh;
}

/* Left Section: Maritime Cinematic */
.left-section {
  flex: 1.1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  overflow: hidden;
}

.bg-photo {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.9;
  filter: blur(4px);
  transform: scale(1.1);
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(6, 23, 46, 0.40) 0%,
    rgba(6, 23, 46, 0.45) 100%
  );
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(43, 108, 176, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(43, 108, 176, 0.04) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.6;
}

.info-content {
  position: relative;
  z-index: 1;
  max-width: 520px;
  opacity: 0;
  transform: translateX(-30px);
  transition: all 1s ease;
}

.info-content.animate-in {
  opacity: 1;
  transform: translateX(0);
}

.logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: -0.02em;
}

.text-cyan { color: #2B6CB0; }

.logo-tagline {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-top: 4px;
}

.desktop-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 3.4rem;
  font-weight: 700;
  line-height: 1.1;
  color: white;
  margin-bottom: 24px;
  letter-spacing: -0.03em;
}

.title-line { display: block; }

.desktop-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 48px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(43, 108, 176, 0.1);
  border: 1px solid rgba(43, 108, 176, 0.2);
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: white;
  overflow: hidden;
}

.feature-icon :deep(i) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-item span {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

/* Right Section: Glassmorphic Card */
.right-section {
  flex: 1;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 28px;
  padding: 48px 40px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04);
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.2s;
}

.login-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.step-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px;
  text-align: center;
}

.step-desc {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  color: #475569;
  margin-bottom: 32px;
  text-align: center;
}

/* Inputs & Buttons */
.input-field { margin-bottom: 24px; }

.inner-label {
  display: block;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  color: #002147;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
  margin-left: 4px;
}

.nise-input :deep(.q-field__control) {
  border-radius: 12px !important;
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  transition: all 0.3s ease;
}

.nise-input :deep(.q-field--focused .q-field__control) {
  border-color: #002147 !important;
  box-shadow: 0 0 15px rgba(0, 33, 71, 0.15);
}

.nise-input :deep(.q-field__native), .nise-input :deep(.q-field__input) {
  color: #0f172a !important;
  font-family: 'Inter', sans-serif;
}

.nise-btn {
  height: 54px;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #002147 0%, #0c3666 100%);
  color: #ffffff;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 33, 71, 0.3);
}

.forgot-pwd {
  text-align: center;
  margin-top: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #002147;
  font-weight: 500;
  cursor: pointer;
}

.step-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  cursor: pointer;
  margin-bottom: 20px;
}

.divider-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #cbd5e1;
  z-index: 0;
}

.divider-text {
  position: relative;
  z-index: 1;
}

.google-btn-wrapper {
  margin: 16px 0 20px;
  display: flex;
  justify-content: center;
  min-height: 40px;
}

.google-btn-wrapper :deep(iframe) {
  margin: 0 auto;
}

.turnstile-wrapper { margin: 20px 0; display: flex; justify-content: center; }

.security-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #94a3b8;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  padding-top: 24px;
}

.footer-simple {
  margin-top: 32px;
  display: flex;
  gap: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.footer-simple span { cursor: pointer; }
.footer-simple span:not(.dot):hover { color: white; }

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.4s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-10px); }

@media (max-width: 1024px) {
  .left-section {
    position: absolute;
    inset: 0;
    flex: none;
    z-index: 0;
    padding: 0;
  }
  .info-content { display: none; }
  .right-section { flex: 1; width: 100%; min-height: 100vh; background: transparent; z-index: 1; position: relative; }
  .bg-photo { opacity: 0.6; }
  .login-card { max-width: 480px; background: rgba(255, 255, 255, 0.95); border-color: rgba(15, 23, 42, 0.1); }
}

@media (max-width: 600px) {
  .right-section { padding: 20px; }
  .login-card { padding: 32px 24px; border-radius: 20px; }
  .step-title { font-size: 1.5rem; }
}
.demo-selector{position:relative;z-index:1;width:100%;max-width:440px;background:white;border-radius:24px;margin-top:18px;padding:20px}.demo-selector .auth-demo{margin:0;border:0;padding:0}.right-section{padding-top:30px;padding-bottom:30px}.login-card{padding:32px 36px}@media(max-width:700px){.demo-selector{padding:16px}.login-card{padding:28px 24px}}
</style>

<template>
  <q-layout view="hHh lpR fFf" class="dashboard-layout">

    <!-- ──────────────────────────────────────────
         Top Header Navigation Bar (Replaces Left Sidebar)
    ────────────────────────────────────────── -->
    <q-header elevated class="header-navbar" :class="{ 'header-scrolled': isScrolled }">
      <div class="header-container">
        <!-- Existing mobile menu also accommodates the additional account navigation entries. -->
        <button v-show="!showDesktopNav" class="mobile-burger-btn" aria-label="Toggle navigation" @click="mobileMenuOpen = !mobileMenuOpen">
          <q-icon :name="mobileMenuOpen ? 'close' : 'menu'" size="20px" />
        </button>

        <!-- Left: Brand Logo -->
        <div class="header-brand" role="link" tabindex="0" aria-label="SAFERSEAS dashboard" @click="goToDashboard" @keydown.enter="goToDashboard">
          <img :src="logo" alt="SaferSeas Logo" class="brand-logo-img" />
          <span class="brand-title">SAFERSEAS</span>
        </div>

        <!-- Vertical Separator Divider after Logo -->
        <div class="nav-separator"></div>

        <!-- Center: Horizontal Navigation Links -->
        <nav v-show="showDesktopNav" class="header-nav">
          <router-link v-for="item in visibleNavItems" :key="item.to" :to="item.to" class="header-nav-item"
            :class="{ 'header-nav-item--active': isNavItemActive(item) }">
            <q-icon :name="item.icon" size="18px" class="nav-icon" />
            <span>{{ item.label }}</span>
          </router-link>

          <!-- Vertical Separator Divider -->
          <div v-if="visibleNavItems.length > 0" class="nav-separator"></div>

          <!-- Help and workflow Link -->
          <router-link to="/help" class="header-nav-item">
            <q-icon name="help_outline" size="18px" class="nav-icon" />
            <span class="gt-xs">Help</span>
          </router-link>
        </nav>

        <q-space />

        <!-- Right: Actions & User Profile -->
        <div class="header-right-actions">
          <!-- New incident CTA (Desktop & Mobile) -->
          <button class="header-report-btn" aria-label="New incident"
            @click="router.push('/reporter/reports/new')">
            <q-icon name="add_circle_outline" size="18px" />
            <span class="gt-xs q-ml-xs">New incident</span>
          </button>

          <!-- User Profile Dropdown -->
          <q-btn-dropdown v-if="getUser" flat no-caps class="header-user-dropdown" aria-label="Account menu" menu-anchor="bottom right"
            menu-self="top right" :dropdown-icon="''">
            <template v-slot:label>
              <div class="header-user-row">
                <div class="header-user-text gt-xs">
                  <span class="greeting-text">{{ timeGreeting }}</span>
                  <span class="user-name-text">{{ userDisplayName }}</span>
                </div>
                <div class="header-avatar-wrapper">
                  <q-avatar size="34px" class="header-avatar">
                    <q-img v-if="userProfilePicture" :src="userProfilePicture" referrerpolicy="no-referrer" />
                    <span v-else>{{ userInitials }}</span>
                  </q-avatar>
                  <q-badge v-if="unreadCount > 0" color="red-5" floating rounded class="nav-badge" />
                </div>
              </div>
            </template>

            <!-- Dropdown Menu -->
            <q-list class="dropdown-panel-glass">
              <div class="dropdown-header">
                <q-avatar size="42px" class="user-avatar-initials">
                  <q-img v-if="userProfilePicture" :src="userProfilePicture" spinner-color="white" />
                  <span v-else>{{ userInitials }}</span>
                </q-avatar>
                <div class="user-info">
                  <p class="user-name">{{ userDisplayName }}</p>
                  <p class="user-email">{{ getUser?.email || '' }}</p>
                </div>
              </div>

              <div class="dropdown-items-section">
                <q-item clickable v-close-popup to="/profile?tab=profile" class="dropdown-item">
                  <span class="dropdown-icon-wrapper"><q-icon name="person_outline" /></span>
                  <div class="dropdown-item-text">
                    <p class="dropdown-item-title">My profile</p>
                    <p class="dropdown-item-description">View and update personal details</p>
                  </div>
                </q-item>
                <q-item clickable v-close-popup to="/profile?tab=security" class="dropdown-item">
                  <span class="dropdown-icon-wrapper"><q-icon name="settings" /></span>
                  <div class="dropdown-item-text">
                    <p class="dropdown-item-title">Security settings</p>
                    <p class="dropdown-item-description">Issued account and demonstration preferences</p>
                  </div>
                </q-item>
                <q-item clickable v-close-popup to="/notifications" class="dropdown-item">
                  <span class="dropdown-icon-wrapper" style="position: relative;">
                    <q-icon name="notifications" />
                    <q-badge v-if="unreadCount > 0" color="red-5" floating rounded
                      class="text-bold text-white">{{ unreadCount }}</q-badge>
                  </span>
                  <div class="dropdown-item-text">
                    <p class="dropdown-item-title">Notifications</p>
                    <p class="dropdown-item-description">View alerts and updates</p>
                  </div>
                </q-item>
                <q-item clickable v-close-popup @click="showPrivacyDialog = true" class="dropdown-item">
                  <span class="dropdown-icon-wrapper"><q-icon name="policy" /></span>
                  <div class="dropdown-item-text">
                    <p class="dropdown-item-title">Demonstration privacy</p>
                    <p class="dropdown-item-description">Browser-local data and selected files</p>
                  </div>
                </q-item>
                <q-item clickable v-close-popup @click="showTermsDialog = true" class="dropdown-item">
                  <span class="dropdown-icon-wrapper"><q-icon name="gavel" /></span>
                  <div class="dropdown-item-text">
                    <p class="dropdown-item-title">About this demonstration</p>
                    <p class="dropdown-item-description">Fictional records and workflow guidance</p>
                  </div>
                </q-item>
              </div>

              <div class="dropdown-footer-section">
                <q-item clickable v-close-popup @click="logout" class="dropdown-item logout-item">
                  <span class="logout-icon-wrapper"><q-icon name="logout" /></span>
                  <div class="dropdown-item-text">
                    <p class="dropdown-item-title logout-title">Sign out</p>
                    <p class="dropdown-item-description logout-description">Securely log out of your session</p>
                  </div>
                </q-item>
              </div>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>
    </q-header>

    <!-- Mobile Overlay Menu -->
    <transition name="mmo-fade">
      <div v-if="mobileMenuOpen" class="mobile-menu-overlay" @click.self="mobileMenuOpen = false">
        <transition name="mmo-flip" appear>
          <div v-if="mobileMenuOpen" class="mmo-card">
            <div class="mmo-items">
              <router-link v-for="item in visibleNavItems" :key="item.to" :to="item.to" class="mmo-item"
                :class="{ 'mmo-item--active': isNavItemActive(item) }" @click="mobileMenuOpen = false">
                {{ item.label }}
              </router-link>
              <div class="mmo-separator" />
              <router-link to="/help" class="mmo-item mmo-item-home" @click="mobileMenuOpen = false">
                Help and workflow
              </router-link>
            </div>

            <!-- CTA inside the card -->
            <button class="mmo-btn"
              @click="mobileMenuOpen = false; router.push('/reporter/reports/new')">
              New incident
            </button>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Page Content Container -->
    <q-page-container class="dashboard-page-container">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition ?? 'page'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- Local demonstration information; production notices are supplied by MARINA. -->
    <q-dialog v-model="showPrivacyDialog">
      <q-card class="setup-password-dialog">
        <q-card-section class="dialog-header"><h3 class="text-h6 q-ma-none">Demonstration privacy</h3></q-card-section>
        <q-card-section><p>This mockup uses fictional accounts and records. Changes are retained in this browser. Selected documents retain metadata only; file contents are not uploaded.</p><p>Official privacy notices belong to the production platform and must be supplied by MARINA.</p></q-card-section>
        <q-card-actions align="right"><q-btn flat no-caps label="Close" v-close-popup /></q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showTermsDialog">
      <q-card class="setup-password-dialog">
        <q-card-section class="dialog-header"><h3 class="text-h6 q-ma-none">About this demonstration</h3></q-card-section>
        <q-card-section><p>This account-only workflow demonstrates reporting, review and local document metadata. It does not submit a real incident or connect to production services.</p><p>Use the Help and workflow guide for reporting stages and unknown values.</p></q-card-section>
        <q-card-actions align="right"><q-btn flat no-caps label="Close" v-close-popup /><q-btn color="primary" no-caps label="Help and workflow" to="/help" v-close-popup /></q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useDemo } from '../stores/demo.js'
const router = useRouter(), route = useRoute(), store = useDemo()
const $q = useQuasar(), showDesktopNav = computed(() => $q.screen.width >= 1260)
const logo = import.meta.env.BASE_URL + 'reporter-logo.png'
const isScrolled = ref(false), mobileMenuOpen = ref(false)
const showPrivacyDialog = ref(false), showTermsDialog = ref(false)
const getUser = computed(() => store.currentUser.value)
const userProfilePicture = computed(() => null)
const userDisplayName = computed(() => getUser.value?.name || 'Issued reporter')
const userInitials = computed(() => userDisplayName.value.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase())
const unreadCount = computed(() => store.state.notifications.filter(item => item.userId === getUser.value?.id && !item.read).length)
const timeGreeting = computed(() => { const hour = new Date().getHours(); return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening' })
const visibleNavItems = [
  { label: 'Dashboard', icon: 'grid_view', to: '/reporter' },
  { label: 'My reports', icon: 'warning_amber', to: '/reporter/reports' },
  { label: 'Drafts', icon: 'edit_note', to: '/reporter/drafts' },
  { label: 'Vessels', icon: 'directions_boat', to: '/reporter/vessels' },
  { label: 'Documents', icon: 'folder_open', to: '/reporter/documents' }
]
function isNavItemActive(item) { return item.to === '/reporter' ? route.path === '/reporter' : route.path === item.to || route.path.startsWith(item.to + '/') }
function handleScroll() { isScrolled.value = window.scrollY > 20 }
function goToDashboard() { router.push('/reporter') }
function logout() { store.signOut(); router.push('/login') }
watch(() => route.fullPath, () => { mobileMenuOpen.value = false; document.title = (route.meta.title || 'SAFERSEAS') + ' · SAFERSEAS' })
onMounted(() => { window.addEventListener('scroll', handleScroll, { passive: true }); handleScroll() })
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

/* ── Layout Shell ── */
.dashboard-layout {
  background: #f3f4f6;
  min-height: 100vh;
}

.dashboard-page-container {
  padding-top: 68px !important;
}

@media (min-width: 768px) {
  .dashboard-page-container {
    padding-left: 32px !important;
    padding-right: 32px !important;
    max-width: 1440px;
    margin: 0 auto;
  }
}

/* ── Header Navbar ── */
.header-navbar {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  color: #0f172a !important;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03) !important;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000 !important;
  height: 68px;
  display: flex;
  align-items: center;
}

.header-scrolled {
  background: #ffffff !important;
  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.08) !important;
}

.header-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

@media (max-width: 599px) {
  .header-container {
    padding: 0 12px !important;
    gap: 8px !important;
  }
}

/* Brand */
.header-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.brand-logo-img {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.brand-title {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
}

/* Horizontal Navigation Links */
.header-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-separator {
  width: 1px;
  height: 20px;
  background: #cbd5e1;
  margin: 0 4px;
}

.header-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 9999px;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.header-nav-item:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.header-nav-item--active {
  color: #0d9488 !important;
  background: #f0fdfa !important;
  font-weight: 700;
}

.header-nav-item--active .nav-icon {
  color: #0d9488;
}

/* Right Actions */
.header-right-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.return-site-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  text-decoration: none;
  padding: 0 14px;
  height: 38px;
  border-radius: 9999px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.return-site-btn:hover {
  color: #0d9488;
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

@media (max-width: 599px) {
  .return-site-btn {
    padding: 0;
    width: 36px;
    height: 36px;
    justify-content: center;
    border-radius: 50%;
  }
}

.header-report-btn {
  display: inline-flex;
  align-items: center;
  background: #0f172a;
  color: #ffffff;
  border: none;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: 9999px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
  transition: all 0.2s ease;
}

.header-report-btn:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
}

@media (max-width: 599px) {
  .header-report-btn {
    padding: 0;
    width: 36px;
    height: 36px;
    justify-content: center;
  }
}

/* Mobile Burger Button */
.mobile-burger-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-burger-btn:hover {
  background: #f1f5f9;
}

/* User Profile Dropdown */
.header-user-dropdown {
  padding: 0 !important;
  border-radius: 9999px !important;
}

.header-user-dropdown :deep(.q-btn-dropdown__arrow) {
  display: none !important;
}

.header-user-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  border-radius: 9999px;
  transition: background 0.2s ease;
}

.header-user-row:hover {
  background: #f1f5f9;
}

.header-avatar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.header-avatar {
  background: #f0fdfa;
  color: #0d9488;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 700;
  border: 1px solid #ccfbf1;
}

.header-user-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.25;
}

.greeting-text {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  color: #64748b;
}

.user-name-text {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.user-chevron {
  color: #64748b;
}

.nav-badge {
  width: 10px;
  height: 10px;
  padding: 0;
  min-height: 0;
  border: 2px solid #ffffff;
  right: -2px;
  top: -2px;
}

/* ── User Dropdown Panel ── */
.dropdown-panel-glass {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12) !important;
  min-width: 280px !important;
  overflow: hidden !important;
  padding: 0 !important;
}

.dropdown-header {
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.user-avatar-initials {
  background: #f0fdfa;
  color: #0d9488;
  font-weight: 700;
  border: 1px solid #ccfbf1;
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.user-email {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.dropdown-items-section {
  padding: 8px 0;
}

.dropdown-item {
  padding: 10px 18px !important;
  min-height: auto !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  transition: background 0.15s ease !important;
}

.dropdown-item:hover {
  background: #f1f5f9 !important;
}

.dropdown-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  flex-shrink: 0;
}

.dropdown-item-text {
  display: flex;
  flex-direction: column;
}

.dropdown-item-title {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.dropdown-item-description {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
}

.dropdown-footer-section {
  border-top: 1px solid #f1f5f9;
  padding: 6px 0;
  background: #fff;
}

.logout-item:hover {
  background: #fef2f2 !important;
}

.logout-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  flex-shrink: 0;
}

.logout-title {
  color: #ef4444 !important;
}

.logout-description {
  color: #f87171 !important;
}

/* ── Mobile Overlay Menu ── */
.mobile-menu-overlay {
  position: fixed !important;
  top: 64px !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(15, 23, 42, 0.4) !important;
  backdrop-filter: blur(4px) !important;
  z-index: 9999 !important;
  display: flex !important;
  align-items: flex-start !important;
  justify-content: center !important;
  padding: 16px !important;
}

.mmo-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  padding: 20px !important;
  width: 100% !important;
  max-width: 100% !important;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.15) !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}

.mmo-items {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}

.mmo-item {
  font-family: 'Hanken Grotesk', sans-serif !important;
  font-size: 1rem !important;
  color: #475569 !important;
  text-decoration: none !important;
  padding: 12px 16px !important;
  display: block !important;
  text-align: left !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  transition: all 0.2s ease !important;
}

.mmo-item:hover,
.mmo-item--active {
  color: #0d9488 !important;
  background: #f0fdfa !important;
}

.mmo-separator {
  height: 1px;
  background: #e2e8f0;
  margin: 8px 0;
}

.mmo-item-home {
  border-radius: 10px !important;
}

.mmo-btn {
  width: 100% !important;
  background: #0f172a !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 9999px !important;
  padding: 12px !important;
  font-family: 'Hanken Grotesk', sans-serif !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  margin-top: 12px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.mmo-btn:hover {
  background: #1e293b !important;
  transform: translateY(-1px) !important;
}

/* Animations */
.mmo-fade-enter-active,
.mmo-fade-leave-active {
  transition: opacity 0.3s ease;
}

.mmo-fade-enter-from,
.mmo-fade-leave-to {
  opacity: 0;
}

.mmo-flip-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.mmo-flip-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.mmo-flip-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(-10px);
}

.mmo-flip-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media (max-width: 600px) {
  .header-container {
    padding: 0 16px;
  }
}

/* Dialog Styles */
.gap-sm {
  gap: 8px;
}

.text-slate-900 {
  color: #000a1e;
}

.setup-password-dialog {
  width: 100%;
  max-width: 500px;
  background: #ffffff !important;
  border: 1px solid #e2e5ea !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
}

.dialog-header {
  border-bottom: 1px solid #e2e5ea;
}

.dialog-title h3 {
  margin: 0;
  color: #000a1e;
  font-size: 1.25rem;
}

.dialog-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 10, 30, 0.15) transparent;
}

.dialog-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: rgba(0, 10, 30, 0.15);
  border-radius: 100px;
}

.acknowledge-btn {
  padding: 8px 24px;
  transition: all 0.2s ease;
}
</style>
<style>
.header-user-dropdown .q-btn-dropdown__arrow,
.header-user-dropdown .q-btn__content>i.q-icon,
.header-user-dropdown .q-btn__content>.q-icon,
.header-user-dropdown .q-anchor--inset {
  display: none !important;
  visibility: hidden !important;
  width: 0 !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
</style>

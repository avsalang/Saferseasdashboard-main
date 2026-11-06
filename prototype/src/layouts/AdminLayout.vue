<template>
  <q-layout view="lHh Lpr lFf" class="dashboard-bg-navy" :class="{ 'body--dark': isDark, 'body--light': !isDark }">
    <!-- Sidebar -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="280"
      :mini-width="72"
      :mini="miniState"
      mini-to-overlay
      class="sidebar-v2"
      @mouseenter="miniState = false"
      @mouseleave="onMouseOut"
    >
      <div class="column no-wrap full-height nav-container">
        <div class="sidebar-header q-pa-lg flex flex-center column" v-if="!miniState">
          <div class="logo-area q-mb-lg flex items-center">
            <q-avatar size="40px" class="q-mr-md bg-white shadow-premium-logo">
               <q-icon name="shield" style="color: #465f88;" size="24px" />
            </q-avatar>
            <div class="column">
              <div class="text-subtitle1 text-weight-bold text-primary brand-name" style="line-height: 1.1;">SAFER<span style="color: #465f88;">SEAS</span></div>
              <div class="text-caption text-weight-bold text-uppercase" style="letter-spacing: 2px; font-size: 8px; color: #465f88; line-height: 1.1; margin-top: 2px;">Admin Command</div>
            </div>
          </div>
        </div>

        <div class="mini-header q-py-lg flex column items-center" v-else>
          <q-avatar size="32px" class="bg-white shadow-premium-logo">
            <q-icon name="shield" size="20px" style="color: #465f88;" />
          </q-avatar>
        </div>

        <q-scroll-area class="col relative-position">
          <q-list class="q-px-md nav-list">
            <template v-for="item in filteredNavItems" :key="item.label">
              <!-- Level 1 Group -->
              <q-expansion-item
                v-if="item.children"
                :icon="item.icon"
                :label="item.label"
                class="nav-group q-mb-xs"
                :class="[isActiveGroup(item) ? 'nav-item-active' : '']"
                :header-class="['nav-item nav-group-header', isActiveGroup(item) ? 'nav-group-active' : '']"
                expand-icon-class="text-grey-5"
                group="sidebar-level-1"
              >
                <q-list class="q-pl-lg">
                  <template v-for="child in item.children" :key="child.label">
                    <!-- Level 2 Group -->
                    <q-expansion-item
                      v-if="child.children"
                      :label="child.label"
                      :icon="child.icon"
                      :header-class="['nav-item sub-group-header', (isActiveGroup(child) && miniState) ? 'nav-item-active' : (isActiveGroup(child) ? 'nav-group-active' : '')]"
                      class="sub-group q-mb-xs"
                      :class="{ 'group-active': isActiveGroup(child) }"
                      expand-icon-class="text-grey-6"
                      dense
                      group="sidebar-level-2"
                    >
                      <q-list class="q-pl-sm">
                        <q-item
                          v-for="grandChild in child.children"
                          :key="grandChild.label"
                          clickable
                          v-ripple
                          :to="grandChild.to"
                          exact
                          class="nav-item sub-item q-mb-xs"
                          active-class="nav-item-active"
                        >
                          <q-item-section>
                            <q-item-label class="text-weight-medium no-wrap-label text-caption">{{ grandChild.label }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-expansion-item>

                    <!-- Level 2 Single Item -->
                    <q-item
                      v-else
                      clickable
                      v-ripple
                      :to="child.to"
                      exact
                      class="nav-item sub-item q-mb-xs"
                      active-class="nav-item-active"
                    >
                      <q-item-section>
                        <q-item-label class="text-weight-medium no-wrap-label">{{ child.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-list>

                <q-tooltip v-if="miniState" anchor="center right" self="center left" :offset="[14, 14]" class="glass-tooltip">{{ item.label }}</q-tooltip>
              </q-expansion-item>

              <!-- Single Item -->
              <q-item
                v-else
                clickable
                v-ripple
                :to="item.to"
                exact
                class="nav-item q-mb-xs"
                active-class="nav-item-active"
              >
                <q-item-section avatar>
                  <q-icon :name="item.icon" size="22px" class="nav-icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium no-wrap-label">{{ item.label }}</q-item-label>
                </q-item-section>

                <q-tooltip v-if="miniState" anchor="center right" self="center left" :offset="[14, 14]" class="glass-tooltip">{{ item.label }}</q-tooltip>
              </q-item>
            </template>
          </q-list>
        </q-scroll-area>
      </div>
    </q-drawer>

    <!-- TopNavBar (Layout Header next to Sidebar) -->
    <q-header class="bg-surface text-primary-theme header-premium q-py-sm shadow-sm">
      <q-toolbar class="q-px-lg flex items-center justify-between">
        <!-- Toggle button and dynamic page title -->
        <div class="row items-center q-gutter-x-md">
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Menu"
            @click="toggleLeftDrawer"
            class="text-primary-theme lt-md"
          />
          <div class="column gt-xs">
            <div class="text-subtitle1 text-weight-bold text-primary-theme tracking-tight" style="line-height: 1.2;">{{ currentPageTitle }}</div>
            <div class="text-caption text-secondary-theme gt-sm" style="line-height: 1.2;">{{ currentPageSubtitle }}</div>
          </div>
        </div>

        <!-- Search, Mail, Alerts, Profile on Right -->
        <div class="row items-center q-gutter-md">
          <!-- Search input (Desktop/Tablet-landscape only) -->
          <div class="gt-sm relative-position" style="width: 260px;">
            <q-input
              dense
              outlined
              rounded
              placeholder="Search records..."
              v-model="search"
              @keyup.enter="searchOpen=true"
              @focus="searchOpen=true"
              class="nise-search-input"
              bg-color="white"
            >
              <template v-slot:prepend>
                <q-icon name="search" size="18px" style="color: #505f76;" />
              </template>
            </q-input>
          </div>

          <div class="row items-center q-gutter-sm">
            <q-btn
              flat
              round
              dense
              icon="notifications"
              class="header-action-btn"
              style="color: #505f76;"
            >
              <q-badge v-if="unreadCount > 0" color="red-5" floating rounded class="text-bold">{{ unreadCount }}</q-badge>
              <q-tooltip class="glass-tooltip">Notifications ({{ unreadCount }} new)</q-tooltip>
              <q-menu
                class="glass-dropdown"
                anchor="bottom right"
                self="top right"
                :offset="[0, 10]"
                width="320px"
              >
                <div class="q-pa-md">
                  <div class="row items-center justify-between q-mb-sm">
                    <div class="text-subtitle2 text-weight-bold text-primary-theme">Alert Feed</div>
                    <q-btn flat dense color="primary" label="Mark all read" size="xs" @click="markAllRead" no-caps />
                  </div>

                  <q-list class="q-gutter-y-xs">
                    <q-item
                      v-for="n in sortedNotifications.slice(0, 5)"
                      :key="n.id"
                      clickable
                      v-ripple
                      v-close-popup
                      class="notification-item rounded-borders no-padding"
                      :class="{ 'opacity-60': n.read }"
                      style="min-height: 48px;"
                      @click="handleNotificationClick(n)"
                    >
                      <q-item-section avatar style="min-width: 40px;" class="q-pl-sm">
                        <q-icon
                          :name="n.type === 'risk' ? 'warning' : n.type === 'system' ? 'hub' : 'directions_boat'"
                          :color="n.type === 'risk' ? 'red-5' : n.type === 'system' ? 'cyan-5' : 'amber-5'"
                          size="xs"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold text-primary-theme" style="font-size: 11px;">{{ n.title }}</q-item-label>
                        <q-item-label caption class="text-micro opacity-70">{{ n.desc }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>

                  <q-separator class="q-my-sm opacity-20" />
                  <q-btn
                    outline
                    dense
                    color="primary"
                    label="View Inbox & Notifications"
                    class="full-width"
                    size="sm"
                    no-caps
                    to="/notifications"
                  />
                </div>
              </q-menu>
            </q-btn>
          </div>

          <div class="h-8 w-px bg-outline-variant mx-2 gt-xs"></div>

          <!-- User Profile Dropdown -->
          <div role="button" tabindex="0" aria-label="Account menu" class="row items-center cursor-pointer user-profile-trigger q-py-xs q-px-sm rounded-borders transition-colors">
            <div class="column items-end q-mr-sm gt-sm">
              <span class="text-caption text-secondary-theme text-weight-medium" style="font-size: 10px; line-height: 1.1; letter-spacing: 0.5px;">{{ greetingMessage }}</span>
              <span class="text-weight-bold text-primary-theme text-uppercase" style="line-height: 1.2;">{{ user?.name }}</span>
            </div>
            <q-avatar size="32px" class="border-avatar">
              <q-img v-if="profilePictureUrl" :src="profilePictureUrl" />
              <q-icon v-else name="person" style="color: #465f88;" />
            </q-avatar>

            <q-menu
              class="glass-dropdown"
              anchor="bottom right"
              self="top right"
              :offset="[0, 10]"
            >
              <q-list style="min-width: 220px" class="q-pa-sm">
                <q-item clickable v-ripple v-close-popup to="/profile" class="nav-item q-mb-xs">
                  <q-item-section avatar>
                    <q-icon name="person_outline" style="color: #465f88;" />
                  </q-item-section>
                  <q-item-section class="text-weight-medium">Profile</q-item-section>
                </q-item>

                <q-item clickable v-ripple v-close-popup to="/profile" class="nav-item q-mb-xs">
                  <q-item-section avatar>
                    <q-icon name="settings" style="color: #465f88;" />
                  </q-item-section>
                  <q-item-section class="text-weight-medium">Settings</q-item-section>
                </q-item>

                <q-separator class="q-my-sm opacity-20" />

                <q-item clickable v-ripple v-close-popup @click="router.push('/help')" class="nav-item q-mb-xs">
                  <q-item-section avatar>
                    <q-icon name="gavel" style="color: #465f88;" />
                  </q-item-section>
                  <q-item-section class="text-weight-medium">Help & workflow</q-item-section>
                </q-item>

                <q-item clickable v-ripple v-close-popup @click="router.push('/handoff')" class="nav-item q-mb-xs">
                  <q-item-section avatar>
                    <q-icon name="description" style="color: #465f88;" />
                  </q-item-section>
                  <q-item-section class="text-weight-medium">Developer handoff</q-item-section>
                </q-item>

                <q-separator class="q-my-sm opacity-20" />

                <q-item clickable v-ripple v-close-popup @click="logout" class="nav-item text-red-5">
                  <q-item-section avatar>
                    <q-icon name="logout" color="red-5" />
                  </q-item-section>
                  <q-item-section class="text-weight-bold">Sign out</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container><router-view/></q-page-container>
    <q-dialog v-model="searchOpen"><q-card class="wide-dialog"><q-card-section><h3>Search your permitted incident records</h3><q-input v-model="search" outlined dense autofocus placeholder="Reference, vessel, location or incident type" clearable><template #prepend><q-icon name="search"/></template></q-input></q-card-section><q-list separator><q-item v-for="e in searchRows" :key="e.id" clickable v-close-popup :to="(isReporter?'/reporter/reports/':'/admin/incidents/')+e.id"><q-item-section><q-item-label>{{e.ref}} Â· {{e.vessels.map(v=>v.name).join(' / ')}}</q-item-label><q-item-label caption>{{e.type}} Â· {{e.place}}</q-item-label></q-item-section><q-item-section side><StatusBadge :status="e.status"/></q-item-section></q-item><q-item v-if="!searchRows.length"><q-item-section>No records match this selection.</q-item-section></q-item></q-list><q-card-actions align="right"><q-btn flat label="Close" v-close-popup/></q-card-actions></q-card></q-dialog>
  </q-layout>
</template>
<script setup>
import{computed,ref}from'vue';import{useRoute,useRouter}from'vue-router';import{useQuasar}from'quasar';import{useDemo}from'../stores/demo.js';import StatusBadge from'../components/StatusBadge.vue';
const store=useDemo(),route=useRoute(),router=useRouter(),$q=useQuasar(),leftDrawerOpen=ref($q.screen.gt.sm),miniState=ref(true),searchOpen=ref(false),search=ref('');
const user=computed(()=>store.currentUser.value),isReporter=computed(()=>false),isDark=computed(()=>$q.dark.isActive),profilePictureUrl=null;
const currentPageTitle=computed(()=>route.meta.title||'SAFERSEAS'),currentPageSubtitle=computed(()=>`${user.value?.officeId||'MARINA'} · ${user.value?.role||''} · Fictional demonstration`);
const sortedNotifications=computed(()=>store.state.notifications.filter(n=>n.userId===user.value?.id).map(n=>({...n,desc:n.message}))),unreadCount=computed(()=>sortedNotifications.value.filter(n=>!n.read).length);
const greetingMessage=new Date().getHours()<12?'Good morning':new Date().getHours()<18?'Good afternoon':'Good evening';
const searchRows=computed(()=>store.selectEvents({search:search.value}).slice(0,12));
function onMouseOut(){miniState.value=true}function toggleLeftDrawer(){leftDrawerOpen.value=!leftDrawerOpen.value;miniState.value=false}function isActiveGroup(item){return item.children?.some(x=>x.children?isActiveGroup(x):route.path===x.to||route.path.startsWith(x.to+'/'))}
function markAllRead(){store.state.notifications.filter(n=>n.userId===user.value?.id).forEach(n=>n.read=true);store.persist()}
function handleNotificationClick(n){const original=store.state.notifications.find(x=>x.id===n.id);if(original)original.read=true;router.push(n.link||'/notifications')}
function logout(){store.signOut();router.push('/login')}
const item=(label,to,icon,permission)=>({label,to,icon,permission});
const navigation=computed(()=>{
  if(isReporter.value)return[{label:'Reporting',items:[item('Overview','/reporter','space_dashboard'),item('My reports','/reporter/reports','description'),item('Draft reports','/reporter/drafts','edit_note'),item('New incident','/reporter/reports/new','add_circle_outline'),item('Vessel directory','/reporter/vessels','directions_boat'),item('Documents','/reporter/documents','folder_open')]},{label:'Your workspace',items:[item('Notifications','/notifications','notifications_none'),item('My account','/profile','person_outline'),item('Help & workflow','/help','help_outline'),item('Developer handoff','/handoff','integration_instructions')]}];
  const groups=[{label:'Operations',items:[item('Overview','/admin','space_dashboard'),item('Incident register','/admin/incidents','description'),item('Review queue','/admin/review','fact_check','review'),item('Investigations','/admin/investigations','travel_explore','investigate'),item('Recommendations','/admin/actions','checklist','investigate'),item('Enforcement cases','/admin/cases','gavel','enforce')]},{label:'Intelligence & reporting',items:[item('GIS workspace','/admin/map','map','analyze'),item('Analytics','/admin/analytics','query_stats','analyze'),item('Report catalogue','/admin/reports','summarize','export'),item('Exports & issued reports','/admin/exports','download','export'),item('Historical imports','/admin/imports','upload_file','analyze'),item('Reconciliation','/admin/reconciliation','difference','analyze'),item('Location review','/admin/locations','pin_drop','investigate'),item('Risk assessments','/admin/risk','shield','analyze'),item('Policy review','/admin/policy','policy','analyze')]},{label:'Registry',items:[item('Vessels','/admin/vessels','directions_boat'),item('Owners & operators','/admin/companies','business'),item('Evidence register','/admin/documents','folder_open')]},{label:'Administration',items:[item('Account management','/admin/accounts','manage_accounts','manage_accounts'),item('Roles & permissions','/admin/roles','admin_panel_settings','configure'),item('MARINA offices','/admin/offices','account_balance','configure'),item('Reference data','/admin/reference-data','category','configure'),item('Workflow & templates','/admin/workflows','account_tree','configure'),item('Audit trail','/admin/audit','history','audit'),item('System settings','/admin/settings','settings','configure')]},{label:'Support',items:[item('My account','/profile','person_outline'),item('Help & workflow','/help','help_outline'),item('Developer handoff','/handoff','integration_instructions')]}];return groups.map(g=>({...g,items:g.items.filter(i=>!i.permission||store.can(i.permission))})).filter(g=>g.items.length);
});

const filteredNavItems=computed(()=>[{label:'Dashboard',to:'/admin',icon:'dashboard'},...navigation.value.map(g=>({label:g.label,icon:g.items[0]?.icon||'folder',children:g.items.filter(x=>x.to!=='/admin')})).filter(g=>g.children.length)]);
</script>
<style scoped>
.sidebar-v2 {
  background: var(--sidebar-bg) !important;
  border-right: 1px solid var(--header-border) !important;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.status-box {
  background: var(--status-box-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.status-box.active { border-color: rgba(16, 185, 129, 0.3); color: #10b981; }
.status-box.disconn { border-color: rgba(239, 68, 68, 0.3); color: #ef4444; }
.status-box.pending { border-color: rgba(245, 158, 11, 0.3); color: #f59e0b; }

.status-label {
  font-size: 8px;
  text-transform: uppercase;
  font-weight: 800;
  opacity: 0.7;
  margin-top: 2px;
}

.nav-item {
  color: var(--sidebar-text);
  border-radius: 12px;
  margin: 4px 0;
  transition: all 0.2s ease-in-out;
  min-height: 48px;
}

.nav-item:hover {
  background: #f2f3ff;
  color: #000a1e;
}

.nav-item-active {
  background: rgba(43, 108, 176, 0.08) !important;
  color: #2b6cb0 !important;
  border: 1px solid rgba(43, 108, 176, 0.2) !important;
  border-radius: 12px !important;
  overflow: hidden;
  font-weight: 700;
}

/* 🛡️ Mini Sidebar Highlighting Synchronization */
.sidebar-v2.q-drawer--mini .q-expansion-item.nav-item-active :deep(.q-expansion-item__container > .q-item) {
  background: rgba(43, 108, 176, 0.10) !important;
  color: #2b6cb0 !important;
  border-radius: 12px !important;
  border: 1px solid rgba(43, 108, 176, 0.22) !important;
  position: relative;
}

/* Active icon color in mini mode */
.sidebar-v2.q-drawer--mini .q-expansion-item.nav-item-active :deep(.q-expansion-item__container > .q-item .q-icon) {
  color: #2b6cb0 !important;
}

/* Active indicator dot below icon in mini mode */
.sidebar-v2.q-drawer--mini .q-expansion-item.nav-item-active :deep(.q-expansion-item__container > .q-item)::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2b6cb0;
}

.sidebar-v2.q-drawer--mini .nav-item-active .nav-icon {
  color: #2b6cb0 !important;
}

/* Hide expand arrow in mini mode */
.sidebar-v2.q-drawer--mini :deep(.q-expansion-item__toggle-icon) {
  display: none !important;
}

.sidebar-v2.q-drawer--mini .nav-icon {
  font-size: 18px !important;
}

.sidebar-v2.q-drawer--mini :deep(.q-item) {
  padding: 0 !important;
  justify-content: center;
  min-height: 44px;
}

.sidebar-v2.q-drawer--mini :deep(.q-item__section--avatar) {
  min-width: unset !important;
  padding: 0 !important;
}

/* Ensure non-active groups in mini mode have clean styling */
.sidebar-v2.q-drawer--mini :deep(.q-expansion-item__container > .q-item) {
  border: 1px solid transparent !important;
  border-radius: 12px !important;
  transition: all 0.2s ease;
}

.sidebar-v2.q-drawer--mini :deep(.q-expansion-item__container > .q-item:hover) {
  background: #f2f3ff !important;
}

.body--light .nav-item-active {
  background: rgba(43, 108, 176, 0.08) !important;
  color: #2b6cb0 !important;
  border-color: rgba(43, 108, 176, 0.2) !important;
}

.nav-group-active {
  background: rgba(43, 108, 176, 0.06) !important;
  color: #2b6cb0 !important;
  border-radius: 12px !important;
}

/* Active group icon and text color in expanded mode */
.nav-group-active :deep(.q-icon) {
  color: #2b6cb0 !important;
}
.nav-group-active :deep(.q-item__label) {
  color: #2b6cb0 !important;
  font-weight: 600;
}

.sub-group-header {
  font-size: 0.85rem !important;
  color: var(--sidebar-text) !important;
  opacity: 0.8;
}

.sub-item {
  min-height: 40px !important;
  margin: 1px 0 !important;
  border-radius: 10px !important;
}

.glass-tooltip {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 8px;
  font-weight: 500;
}

.ribbon-header {
  border-bottom: 1px solid var(--header-border);
  padding-bottom: 8px;
}

.glass-action-btn {
  background: var(--status-box-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
}

.opacity-60 { opacity: 0.6; }
.opacity-20 { opacity: 0.2; }

.no-decoration {
  text-decoration: none;
}

.hover-primary:hover {
  color: var(--q-primary) !important;
  opacity: 1 !important;
}

.header-premium {
  background: var(--header-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--header-border);
  height: 80px;
  display: flex;
  align-items: center;
}

.header-action-btn {
  color: var(--text-secondary);
  border-radius: 50% !important;
  width: 40px;
  height: 40px;
  min-height: 40px !important;
  min-width: 40px !important;
  padding: 0 !important;
  transition: all 0.2s ease-in-out;
}

.header-action-btn:hover {
  background: #f2f3ff !important;
  color: #000a1e;
}

.user-profile-trigger {
  padding: 6px 12px;
  border-radius: 100px;
  transition: all 0.2s ease-in-out;
}

.user-profile-trigger:hover {
  background: #f2f3ff !important;
}

.nise-search-input :deep(.q-field__control) {
  background: #f2f3ff !important;
  border-radius: 9999px !important;
  padding: 0 16px !important;
  transition: all 0.2s ease-in-out;
  height: 40px !important;
}

.nise-search-input :deep(.q-field__control:before) {
  border: 1px solid var(--card-border) !important;
  border-radius: 9999px !important;
  transition: all 0.2s ease-in-out;
}

.nise-search-input :deep(.q-field__control:hover:before) {
  border-color: #465f88 !important;
}

.nise-search-input :deep(.q-field__control:focus-within) {
  background: #ffffff !important;
}

.nise-search-input :deep(.q-field__control:focus-within:before) {
  border-color: #465f88 !important;
  box-shadow: 0 0 0 2px rgba(70, 95, 136, 0.1) !important;
}

.nise-search-input :deep(.q-field__marginal) {
  height: 40px !important;
}

.primary-glow {
  background: rgba(43, 108, 176, 0.15);
  border-color: rgba(43, 108, 176, 0.4);
  color: #2B6CB0;
}

.user-dropdown-premium {
  background: var(--status-box-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 4px 8px;
}

.border-avatar {
  border: 1.5px solid var(--card-border);
  transition: all 0.2s ease-in-out;
}

.user-profile-trigger:hover .border-avatar {
  border-color: #465f88;
}

.shadow-premium-logo {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08);
}

.glass-dropdown {
  background: var(--sidebar-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--header-border);
  color: var(--text-primary);
}

.sidebar-footer {
  border-top: 1px solid var(--header-border);
  background: rgba(43, 108, 176, 0.02);
}

.user-dropdown-sidebar {
  width: 100%;
  border-radius: 14px;
  background: var(--status-box-bg);
  border: 1px solid var(--card-border);
  transition: all 0.3s ease;
}

.user-dropdown-sidebar:hover {
  background: rgba(43, 108, 176, 0.05);
  border-color: rgba(43, 108, 176, 0.3);
}

.mini-dropdown {
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  min-height: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.theme-item {
  height: 50px;
  padding: 0 !important;
}

.notification-pulse {
  animation: alertPulse 2s infinite;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

@keyframes alertPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
}

.notification-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--q-primary);
  transform: translateX(4px);
}

.header-alert-btn {
  color: var(--q-primary);
  opacity: 0.8;
  transition: all 0.3s ease;
}

.header-alert-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.05);
}
.line-height-1 { line-height: 1; }

.tracking-tight { letter-spacing: -0.02em; }
</style>

<style>
.custom-notify-width {
  width: 380px !important;
  max-width: 380px !important;
  min-width: 380px !important;
  border-radius: 12px !important;
  padding: 12px 16px !important;
}
</style>

<template>
  <div>
    <!-- 1 Top / 3 Down Layout -->
    <div v-if="layoutMode === 'split1x3'" class="column q-col-gutter-y-md q-mb-lg">
      <!-- Top Card (Full Width) -->
      <div class="col-12">
        <q-card flat class="stat-card featured-card relative-position">
          <template v-if="loading">
            <q-skeleton type="QAvatar" size="40px" />
            <div class="stat-content">
              <q-skeleton type="text" width="120px" height="12px" class="q-mb-xs" />
              <q-skeleton type="text" width="220px" height="24px" />
            </div>
          </template>
          <template v-else>
            <div class="stat-icon" :style="`background: ${topCard.iconBg || 'rgba(24, 95, 165, 0.1)'}`">
              <q-icon :name="topCard.icon" size="20px" :style="`color: ${topCard.iconColor || '#185FA5'}`" />
            </div>
            <div class="stat-content">
              <p class="stat-label">{{ topCard.label }}</p>
              <p class="stat-val text-primary text-weight-bold" :class="{ 'long-val': isLongValue(topCard.value) }">
                {{ topCard.value }}
              </p>
            </div>
          </template>
        </q-card>
      </div>

      <!-- Bottom 3 Cards (Row) -->
      <div class="col-12">
        <div class="row q-col-gutter-lg">
          <div
            v-for="(stat, index) in bottomCards"
            :key="stat.label"
            :class="index === 2 ? 'col-12 col-sm-4' : 'col-6 col-sm-4'"
          >
            <q-card flat class="stat-card relative-position">
              <template v-if="loading">
                <q-skeleton type="QAvatar" size="40px" />
                <div class="stat-content">
                  <q-skeleton type="text" width="80px" height="12px" class="q-mb-xs" />
                  <q-skeleton type="text" width="100px" height="24px" />
                </div>
              </template>
              <template v-else>
                <div class="stat-icon" :style="`background: ${stat.iconBg || 'rgba(0, 0, 0, 0.05)'}`">
                  <q-icon :name="stat.icon" size="18px" :style="`color: ${stat.iconColor || 'inherit'}`" />
                </div>
                <div class="stat-content">
                  <p class="stat-label">{{ stat.label }}</p>
                  <p class="stat-val" :class="{ 'long-val': isLongValue(stat.value) }">
                    {{ stat.value }}
                  </p>
                </div>
              </template>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid Layouts (2x2 or 4 in a Row) -->
    <div v-else class="row q-col-gutter-lg q-mb-lg">
      <div
        v-for="stat in (loading ? [1, 2, 3, 4] : stats)"
        :key="loading ? stat : stat.label"
        :class="layoutMode === 'grid2x2' ? 'col-12 col-sm-6' : 'col-12 col-sm-6 col-md-3'"
      >
        <q-card flat class="stat-card relative-position">
          <template v-if="loading">
            <q-skeleton type="QAvatar" size="40px" />
            <div class="stat-content">
              <q-skeleton type="text" width="100px" height="12px" class="q-mb-xs" />
              <q-skeleton type="text" width="140px" height="24px" />
            </div>
          </template>
          <template v-else>
            <div class="stat-icon" :style="`background: ${stat.iconBg || 'rgba(0, 0, 0, 0.05)'}`">
              <q-icon :name="stat.icon" size="18px" :style="`color: ${stat.iconColor || 'inherit'}`" />
            </div>
            <div class="stat-content">
              <p class="stat-label">{{ stat.label }}</p>
              <p class="stat-val" :class="{ 'long-val': isLongValue(stat.value) }">
                {{ stat.value }}
              </p>
            </div>
          </template>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  stats: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const layoutMode = ref('split1x3')

// For split layout
const topCard = computed(() => props.stats[3] || props.stats[0])
const bottomCards = computed(() => props.stats.slice(0, 3))

const isLongValue = (val) => {
  if (!val) return false
  return String(val).length > 10
}
</script>

<style scoped>
.layout-toggle {
  background: #f1f5f9;
  border: 0.5px solid #e2e8f0;
  border-radius: 6px;
  padding: 2px;
}
.layout-toggle :deep(.q-btn) {
  font-size: 11px !important;
  font-weight: 600 !important;
  min-height: 26px !important;
  padding: 0 10px !important;
  border-radius: 4px !important;
}

.stat-card {
  background: #ffffff;
  border: 0.5px solid #e2e5ea;
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02) !important;
  height: 86px;
  box-sizing: border-box;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02) !important;
}

.featured-card {
  height: 96px;
  border-color: #cbd5e1;
  background: #f8fafc;
}

.stat-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.02em;
  text-transform: none;
  margin-bottom: 4px;
  line-height: 1.2;
}

.stat-val {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.1;
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-val.long-val {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  white-space: normal;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
}

@media (max-width: 599px) {
  .stat-card {
    padding: 10px 12px !important;
    gap: 8px !important;
    height: 78px !important;
  }
  .stat-icon {
    width: 32px !important;
    height: 32px !important;
  }
  .stat-icon :deep(.q-icon) {
    font-size: 14px !important;
  }
  .stat-label {
    font-size: 10px !important;
    margin-bottom: 2px !important;
  }
  .stat-val {
    font-size: 18px !important;
  }
  .featured-card {
    height: 86px !important;
  }
}
</style>

<template>
  <div class="account-manager">
    <div class="account-header">
      <h1>Управление учетными записями</h1>
      <el-button type="primary" @click="addAccount" class="add-button">
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <div class="account-info">
      <p>Метка: необязательное поле, максимум 50 символов. Введите текстовые метки через знак ;</p>
    </div>

    <div v-if="accountsStore.accounts.length === 0" class="no-accounts">
      <p>Нет добавленных учетных записей. Добавьте новую с помощью кнопки "+"</p>
    </div>

    <div v-else class="account-list">
      <div class="account-list-header">
        <div class="field-header">Метка</div>
        <div class="field-header">Тип записи</div>
        <div class="field-header">Логин</div>
        <div class="field-header">Пароль</div>
        <div class="field-header">Действия</div>
      </div>

      <div 
        v-for="account in accountsStore.accounts" 
        :key="account.id" 
        class="account-item"
      >
        <div class="account-field">
          <el-input
            v-model="tagsMap[account.id]"
            placeholder="Введите метки через ;"
            maxlength="50"
            show-word-limit
            @blur="updateTags(account)"
          />
          <div v-if="account.tags.length > 0" class="tags-container">
            <el-tag
              v-for="tag in account.tags"
              :key="tag.text"
              size="small"
              class="tag-item"
              :color="tagColors[tag.text] || getRandomTagColor(tag.text)"
              effect="dark"
            >
              {{ tag.text }}
            </el-tag>
          </div>
        </div>

        <div class="account-field">
          <el-select 
            v-model="account.type" 
            placeholder="Выберите тип"
            @change="handleTypeChange(account)"
          >
            <el-option label="LDAP" value="LDAP" />
            <el-option label="Локальная" value="Локальная" />
          </el-select>
        </div>

        <div class="account-field">
          <el-input
            v-model="account.login"
            placeholder="Введите логин"
            maxlength="100"
            show-word-limit
            :class="{ 'is-error': validationErrors[account.id]?.login }"
            @blur="validateAccount(account)"
          />
        </div>

        <div class="account-field">
          <el-input
            v-if="account.type === 'Локальная'"
            v-model="account.password"
            placeholder="Введите пароль"
            maxlength="100"
            show-word-limit
            type="password"
            :class="{ 'is-error': validationErrors[account.id]?.password }"
            @blur="validateAccount(account)"
          />
          <span v-else class="disabled-field">Не требуется для LDAP</span>
        </div>

        <div class="account-field account-actions">
          <el-button type="danger" @click="deleteAccount(account.id)" class="delete-button">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useAccountsStore, type Account } from '@/stores/accounts'

// Инициализация хранилища
const accountsStore = useAccountsStore()

// Соответствие ID учетной записи и строки с тегами
const tagsMap = reactive<Record<number, string>>({})

// Ошибки валидации
interface ValidationError {
  login?: boolean
  password?: boolean
}

const validationErrors = reactive<Record<number, ValidationError>>({})

// Кэш для цветов тегов
const tagColors = reactive<Record<string, string>>({})

// Генератор случайного цвета для тега
function getRandomTagColor(tag: string): string {
  if (!tagColors[tag]) {
    // Создаём пастельные цвета
    const hue = Math.floor(Math.random() * 360)
    const color = `hsl(${hue}, 70%, 60%)`
    tagColors[tag] = color
  }
  return tagColors[tag]
}

// Преобразование тегов в строку
function tagsToString(tags: { text: string }[]): string {
  return tags.map(tag => tag.text).join('; ')
}

// Добавление новой учетной записи
function addAccount() {
  const newAccount = accountsStore.addAccount()
  tagsMap[newAccount.id] = ''
  validationErrors[newAccount.id] = {}
}

// Обновление тегов при потере фокуса
function updateTags(account: Account) {
  account.tags = accountsStore.parseTagsString(tagsMap[account.id])
  accountsStore.updateAccount(account)
}

// Обработка изменения типа учетной записи
function handleTypeChange(account: Account) {
  accountsStore.updateAccount(account)
  validateAccount(account)
}

// Удаление учетной записи
function deleteAccount(id: number) {
  accountsStore.deleteAccount(id)
  delete tagsMap[id]
  delete validationErrors[id]
}

// Валидация учетной записи
function validateAccount(account: Account) {
  const errors: ValidationError = {}
  
  // Проверка логина
  if (!account.login.trim()) {
    errors.login = true
  }
  
  // Проверка пароля только для локальных учетных записей
  if (account.type === 'Локальная' && (!account.password || !account.password.trim())) {
    errors.password = true
  }
  
  validationErrors[account.id] = errors
  
  // Если ошибок нет, обновляем запись
  if (!errors.login && !errors.password) {
    accountsStore.updateAccount(account)
  }
  
  return Object.keys(errors).length === 0
}

// При монтировании компонента
onMounted(() => {
  // Инициализация карты тегов для существующих учетных записей
  accountsStore.accounts.forEach(account => {
    tagsMap[account.id] = tagsToString(account.tags)
  })
})
</script>

<style scoped>
.account-manager {
  width: 100%;
  max-width: 1400px;
  padding: 30px;
  margin: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background-color: var(--card-background);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--primary-light);
  padding-bottom: 16px;
}

.account-header h1 {
  color: var(--primary-color);
  margin: 0;
  font-size: 28px;
}

.add-button {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  font-size: 18px;
  padding: 12px;
  border-radius: 50%;
  height: 50px;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-info {
  margin-bottom: 24px;
  padding: 12px;
  border-radius: 4px;
  background-color: var(--primary-light);
  color: var(--text-color);
}

.no-accounts {
  text-align: center;
  padding: 60px;
  color: #999;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px dashed var(--border-color);
}

.account-list {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.account-list-header {
  display: flex;
  background-color: var(--primary-color);
  padding: 16px;
  font-weight: bold;
  color: white;
}

.account-item {
  display: flex;
  padding: 16px;
  border-top: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

.account-item:hover {
  background-color: rgba(0, 0, 0, 0.01);
}

.field-header,
.account-field {
  flex: 1;
  padding: 0 12px;
}

.account-actions {
  flex: 0 0 100px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.is-error {
  border-color: var(--secondary-color);
}

:deep(.el-input__wrapper.is-error) {
  box-shadow: 0 0 0 1px var(--secondary-color) inset;
}

.tags-container {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  margin-right: 0;
  color: white;
}

.delete-button {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.disabled-field {
  color: #999;
  font-style: italic;
  display: block;
  padding: 8px;
  border: 1px dashed var(--border-color);
  border-radius: 4px;
  text-align: center;
}

:deep(.el-select) {
  width: 100%;
}
</style> 
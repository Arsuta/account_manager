import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// Типы данных для учетной записи
export type AccountType = 'LDAP' | 'Локальная'

export interface Tag {
  text: string
}

export interface Account {
  id: number
  tags: Tag[]
  type: AccountType
  login: string
  password: string | null
}

// Ключ для localStorage
const STORAGE_KEY = 'account-manager-accounts'

export const useAccountsStore = defineStore('accounts', () => {
  // Загрузка данных из localStorage
  const storedData = localStorage.getItem(STORAGE_KEY)
  let initialAccounts: Account[] = []
  let initialLastId = 0

  if (storedData) {
    try {
      const parsed = JSON.parse(storedData)
      initialAccounts = parsed.accounts || []
      initialLastId = parsed.lastId || 0
    } catch (e) {
      console.error('Ошибка при загрузке данных из localStorage:', e)
    }
  }

  // Состояние
  const accounts = ref<Account[]>(initialAccounts)
  const lastId = ref(initialLastId)

  // Сохранить состояние в localStorage
  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accounts: accounts.value,
      lastId: lastId.value
    }))
  }

  // Отслеживание изменений и сохранение в localStorage
  watch(accounts, () => {
    saveToLocalStorage()
  }, { deep: true })

  watch(lastId, () => {
    saveToLocalStorage()
  })

  // Добавить новую учетную запись
  function addAccount() {
    const newAccount: Account = {
      id: ++lastId.value,
      tags: [],
      type: 'Локальная',
      login: '',
      password: ''
    }
    accounts.value.push(newAccount)
    return newAccount
  }

  // Обновить учетную запись
  function updateAccount(account: Account) {
    const index = accounts.value.findIndex(acc => acc.id === account.id)
    if (index !== -1) {
      // Если тип LDAP, пароль должен быть null
      if (account.type === 'LDAP') {
        account.password = null
      }
      accounts.value[index] = { ...account }
    }
  }

  // Удалить учетную запись
  function deleteAccount(id: number) {
    const index = accounts.value.findIndex(acc => acc.id === id)
    if (index !== -1) {
      accounts.value.splice(index, 1)
    }
  }

  // Парсинг строки тегов в массив объектов
  function parseTagsString(tagsString: string): Tag[] {
    if (!tagsString) return []
    return tagsString
      .split(';')
      .filter(tag => tag.trim() !== '')
      .map(tag => ({ text: tag.trim() }))
  }

  return {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    parseTagsString
  }
}) 
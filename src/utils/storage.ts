import { User, StudySlot, WeeklyTarget, MonthlyTarget, TaskLog, NotificationLog } from '../types';
import { INITIAL_USERS, INITIAL_SLOTS, INITIAL_WEEKLY_TARGETS, INITIAL_MONTHLY_TARGETS, INITIAL_TASKS, INITIAL_NOTIFICATIONS } from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'mcd_clean_users_v2',
  SLOTS: 'mcd_clean_slots_v2',
  WEEKLY_TARGETS: 'mcd_clean_weekly_targets_v2',
  MONTHLY_TARGETS: 'mcd_clean_monthly_targets_v2',
  TASKS: 'mcd_clean_tasks_v2',
  NOTIFICATIONS: 'mcd_clean_notifications_v2',
  CREDENTIALS: 'mcd_clean_credentials_v2',
  THEME: 'theme'
};

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_USERS;
}

export function saveStoredUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getStoredSlots(): StudySlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SLOTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_SLOTS;
}

export function saveStoredSlots(slots: StudySlot[]): void {
  localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
}

export function getStoredWeeklyTargets(): WeeklyTarget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_TARGETS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_WEEKLY_TARGETS;
}

export function saveStoredWeeklyTargets(targets: WeeklyTarget[]): void {
  localStorage.setItem(STORAGE_KEYS.WEEKLY_TARGETS, JSON.stringify(targets));
}

export function getStoredMonthlyTargets(): MonthlyTarget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MONTHLY_TARGETS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_MONTHLY_TARGETS;
}

export function saveStoredMonthlyTargets(targets: MonthlyTarget[]): void {
  localStorage.setItem(STORAGE_KEYS.MONTHLY_TARGETS, JSON.stringify(targets));
}

export function getStoredTasks(): TaskLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_TASKS;
}

export function saveStoredTasks(tasks: TaskLog[]): void {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

export function getStoredNotifications(): NotificationLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifs: NotificationLog[]): void {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
}

export function getStoredCredentials(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {};
}

export function saveStoredCredentials(creds: Record<string, string>): void {
  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(creds));
}

export function storeUserCredential(email: string, pass: string): void {
  const creds = getStoredCredentials();
  creds[email.trim().toLowerCase()] = pass;
  saveStoredCredentials(creds);
}

export function getUserCredential(email: string): string | null {
  const creds = getStoredCredentials();
  return creds[email.trim().toLowerCase()] || null;
}

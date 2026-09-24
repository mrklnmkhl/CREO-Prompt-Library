import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  Timestamp,
  getDoc,
  setDoc,
  getDocFromServer,
  where,
  getDocs,
  increment
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import { db, auth } from './firebase';
import { Prompt, UserProfile, OperationType } from './types';
import { handleFirestoreError } from './utils/error-handler';
import {
  Plus,
  Search,
  Copy,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Check,
  Filter,
  ChevronRight,
  ChevronLeft,
  Upload,
  Loader2,
  Calendar,
  User as UserIcon,
  CopyPlus,
  Link2,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { cn } from './lib/cn';
import { useTheme } from './hooks/useTheme';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { PromptCard, ViewMode } from './components/PromptCard';
import { AdminPanel } from './components/AdminPanel';
import { Toolbar, SortBy } from './components/Toolbar';
import { isAdminUser, canManagePrompt } from './lib/admin';
import { MarkdownPrompt } from './components/MarkdownPrompt';

const TRANSLATIONS = {
  en: {
    search: "Search",
    addPrompt: "Add",
    copyPrompt: "Copy",
    noPrompts: "No prompts found",
    noPromptsSub: "Try adjusting your search or category filter",
    editPrompt: "Edit Prompt",
    addNewPrompt: "Add New Prompt",
    title: "Title",
    category: "Category",
    type: "Type",
    image: "Image",
    video: "Video",
    closeInstruction: "Click in the empty space to close",
    unsavedChanges: "Unsaved Changes",
    unsavedChangesSub: "Do you want to apply or discard your changes?",
    apply: "Apply",
    discard: "Discard",
    exampleUrl: "Visual Example URL (Image/Video)",
    content: "Prompt Content",
    cancel: "Cancel",
    update: "Update",
    updatePrompt: "Update Prompt",
    createPrompt: "Create Prompt",
    thePrompt: "The Prompt",
    created: "Created",
    lastUpdate: "Last Update",
    copyToClipboard: "Copy to Clipboard",
    placeholders: "Placeholders",
    login: "Login",
    loginSuccess: "Successfully logged in!",
    loginFail: "Failed to login",
    logoutSuccess: "Logged out",
    password: "Password",
    createAccount: "Create account",
    alreadyHaveAccount: "Already have an account? Log in",
    noAccount: "No account? Create one",
    authEmailInUse: "This email is already registered",
    authWeakPassword: "Password must be at least 6 characters",
    authInvalidEmail: "Invalid email address",
    authInvalidCredentials: "Wrong email or password",
    promptUpdated: "Prompt updated",
    promptAdded: "Prompt added",
    promptDeleted: "Prompt deleted",
    saveFail: "Failed to save prompt",
    deleteConfirm: "Are you sure you want to delete this prompt?",
    copySuccess: "Prompt copied to clipboard!",
    noPreview: "No Preview",
    all: "All",
    uploadImage: "Upload Image",
    uploading: "Uploading...",
    orUrl: "or use URL",
    fileTooLarge: "File is too large",
    uploadError: "Image upload error.",
    favorites: "Favorites",
    tags: "Tags",
    addTag: "Add Tag",
    newCategory: "New Category",
    linkedPrompt: "Linked Prompts",
    switchToVideo: "Switch to Video",
    switchToImage: "Switch to Image",
    none: "None",
    linkPrompt: "Link Prompts",
    addLinkedPrompt: "Add Linked Prompts",
    searchPrompts: "Search prompts...",
    deleteCategory: "Delete Category",
    manageCategories: "Manage Categories",
    rename: "Rename",
    save: "Save",
    sortNewest: "Newest",
    sortOldest: "Oldest",
    sortAlphabetical: "A–Z",
    sortMostCopied: "Most copied",
    exportPrompts: "Export",
    importPrompts: "Import",
    importSuccess: "Imported prompts",
    importFail: "Import failed. Check the file format.",
    exportSuccess: "Library exported",
    duplicate: "Duplicate",
    duplicateSuccess: "Prompt duplicated",
    copySuffix: "(copy)",
    selectMode: "Select",
    selectedCount: "selected",
    deleteSelected: "Delete",
    changeCategory: "Change category",
    bulkDeleteConfirm: "Delete the selected prompts?",
    copiedLabel: "Copied",
    brandName: "Prompt Library",
    toggleSidebar: "Collapse/expand menu",
    categoriesLabel: "Categories",
    settings: "Settings",
    theme: "Theme",
    language: "Language",
    logout: "Log out",
    viewGrid: "Grid",
    viewCompact: "Compact grid",
    viewList: "List",
    library: "Library",
    exportHint: "Download all prompts as JSON",
    importHint: "Add prompts from a JSON file",
    importLoginRequired: "Log in to import",
    share: "Copy link",
    linkCopied: "Link copied",
    promptNotFound: "The shared prompt was not found",
    back: "Back",
    open: "Open",
    adminPanel: "Admin panel",
    statPrompts: "Prompts",
    statUsers: "Users",
    statAdmins: "Admins",
    promptsCountLabel: "prompts",
    makeAdmin: "Make admin",
    revokeAdmin: "Revoke admin",
    roleOwner: "Owner",
    roleUpdated: "Role updated",
    you: "you",
    permissionDenied: "You don't have permission for this",
    deleteIrreversible: "This action cannot be undone. The prompt will be permanently removed.",
    deleteAction: "Delete",
    scrollTop: "Back to top",
    personalLabel: "Mine",
    createdByMe: "Created by me",
    resetFilters: "Show all (reset filters)"
  },
  ru: {
    search: "Поиск",
    addPrompt: "Добавить",
    copyPrompt: "Копировать",
    noPrompts: "Промпты не найдены",
    noPromptsSub: "Попробуйте изменить поиск или фильтр категорий",
    editPrompt: "Редактировать промпт",
    addNewPrompt: "Добавить новый промпт",
    title: "Название",
    category: "Категория",
    type: "Тип",
    image: "Image",
    video: "Video",
    closeInstruction: "Нажмите в пустом месте чтобы закрыть",
    unsavedChanges: "Несохраненные изменения",
    unsavedChangesSub: "Применить или отменить внесенные изменения?",
    apply: "Применить",
    discard: "Отменить",
    exampleUrl: "URL примера (фото/видео)",
    content: "Текст промпта",
    cancel: "Отмена",
    update: "Обновить",
    updatePrompt: "Обновить промпт",
    createPrompt: "Создать промпт",
    thePrompt: "Промпт",
    created: "Создано",
    lastUpdate: "Обновлено",
    copyToClipboard: "Копировать в буфер",
    placeholders: "Заполнители",
    login: "Войти",
    loginSuccess: "Успешный вход!",
    loginFail: "Ошибка входа",
    logoutSuccess: "Выход выполнен",
    password: "Пароль",
    createAccount: "Создать аккаунт",
    alreadyHaveAccount: "Уже есть аккаунт? Войти",
    noAccount: "Нет аккаунта? Создать",
    authEmailInUse: "Этот email уже зарегистрирован",
    authWeakPassword: "Пароль должен быть не короче 6 символов",
    authInvalidEmail: "Некорректный email",
    authInvalidCredentials: "Неверный email или пароль",
    promptUpdated: "Промпт обновлен",
    promptAdded: "Промпт добавлен",
    promptDeleted: "Промпт удален",
    saveFail: "Ошибка сохранения",
    deleteConfirm: "Вы уверены, что хотите удалить этот промпт?",
    copySuccess: "Промпт скопирован!",
    noPreview: "Нет превью",
    all: "Все",
    uploadImage: "Загрузить фото",
    uploading: "Загрузка...",
    orUrl: "или используйте URL",
    fileTooLarge: "Файл слишком большой",
    uploadError: "Ошибка сохранения изображения.",
    favorites: "Избранное",
    tags: "Теги",
    addTag: "Добавить тег",
    newCategory: "Новая категория",
    linkedPrompt: "Связанные промпты",
    switchToVideo: "Перейти к видео",
    switchToImage: "Перейти к фото",
    none: "Нет",
    linkPrompt: "Связать промпты",
    addLinkedPrompt: "Добавить связанные промпты",
    searchPrompts: "Поиск промптов...",
    deleteCategory: "Удалить категорию",
    manageCategories: "Управление категориями",
    rename: "Переименовать",
    save: "Сохранить",
    sortNewest: "Сначала новые",
    sortOldest: "Сначала старые",
    sortAlphabetical: "А–Я",
    sortMostCopied: "Часто копируемые",
    exportPrompts: "Экспорт",
    importPrompts: "Импорт",
    importSuccess: "Промпты импортированы",
    importFail: "Ошибка импорта. Проверьте формат файла.",
    exportSuccess: "Библиотека экспортирована",
    duplicate: "Дублировать",
    duplicateSuccess: "Промпт продублирован",
    copySuffix: "(копия)",
    selectMode: "Выбрать",
    selectedCount: "выбрано",
    deleteSelected: "Удалить",
    changeCategory: "Изменить категорию",
    bulkDeleteConfirm: "Удалить выбранные промпты?",
    copiedLabel: "Скопировано",
    brandName: "Prompt Library",
    toggleSidebar: "Свернуть/развернуть меню",
    categoriesLabel: "Категории",
    settings: "Настройки",
    theme: "Тема",
    language: "Язык",
    logout: "Выйти",
    viewGrid: "Сетка",
    viewCompact: "Компактная сетка",
    viewList: "Список",
    library: "Библиотека",
    exportHint: "Скачать все промпты в JSON",
    importHint: "Добавить промпты из JSON-файла",
    importLoginRequired: "Войдите, чтобы импортировать",
    share: "Скопировать ссылку",
    linkCopied: "Ссылка скопирована",
    promptNotFound: "Промпт по ссылке не найден",
    back: "Назад",
    open: "Открыть",
    adminPanel: "Админ-панель",
    statPrompts: "Промптов",
    statUsers: "Пользователи",
    statAdmins: "Админы",
    promptsCountLabel: "промптов",
    makeAdmin: "Сделать админом",
    revokeAdmin: "Снять админа",
    roleOwner: "Владелец",
    roleUpdated: "Роль обновлена",
    you: "вы",
    permissionDenied: "Недостаточно прав для этого действия",
    deleteIrreversible: "Это действие нельзя отменить. Промпт будет удалён навсегда.",
    deleteAction: "Удалить",
    scrollTop: "Наверх",
    personalLabel: "Моё",
    createdByMe: "Создано мной",
    resetFilters: "Показать все (сбросить фильтры)"
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const formatDate = (timestamp: any) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '—';
  const date = timestamp.toDate();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'ru'>('ru');
  const t = TRANSLATIONS[lang];
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // Category filters are toggles combined with OR; an empty list means "all".
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const stored = localStorage.getItem('creo-view-mode');
    return stored === 'compact' || stored === 'list' ? stored : 'grid';
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState(['Outdoor', 'Studio', 'Interiors', 'People (GEO)', 'Verticals', 'Hands']);
  // Seeded from ?prompt=<id> so shared links open the prompt once data arrives.
  const [viewingPromptId, setViewingPromptId] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get('prompt')
  );
  // Prompts visited before the current one via "linked prompts", for the back button.
  const [viewHistory, setViewHistory] = useState<string[]>([]);
  const [promptsLoaded, setPromptsLoaded] = useState(false);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  // Where the user was heading when the unsaved-changes prompt appeared:
  // 'close' = leave the modal, 'exitEdit' = back from edit form to the prompt view.
  const [leaveIntent, setLeaveIntent] = useState<'close' | 'exitEdit'>('close');
  const afterSaveIntent = useRef<'close' | 'exitEdit' | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [modalView, setModalView] = useState<'form' | 'link'>('form');
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [linkSelectedCategory, setLinkSelectedCategory] = useState('All');
  const [selectedLinkedPromptIds, setSelectedLinkedPromptIds] = useState<string[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const { theme, setTheme, isLight } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem('creo-sidebar-open');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('creo-sidebar-open', String(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    localStorage.setItem('creo-view-mode', viewMode);
  }, [viewMode]);

  const closeModal = useCallback(() => {
    setViewingPromptId(null);
    setViewHistory([]);
    setShowDeleteConfirm(false);
    setIsModalOpen(false);
    setIsCategoryModalOpen(false);
    setEditingPrompt(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDirty(false);
    setShowUnsavedConfirm(false);
    setModalView('form');
    setLinkSearchQuery('');
    setLinkSelectedCategory('All');
    setSelectedLinkedPromptIds([]);
    setRenamingCategory(null);
    setRenameValue('');
  }, []);

  // Sync categories with existing prompts and Firestore
  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbCategories = snapshot.docs.map(doc => doc.data().name);
      const promptCategories = [...new Set(prompts.map(p => p.category))].filter(Boolean);
      const combined = [...new Set([...dbCategories, ...promptCategories])].sort();
      if (combined.length > 0) {
        setCategories(combined);
      }
    });
    return () => unsubscribe();
  }, [prompts]);

  const handleDeleteCategory = useCallback(async (categoryName: string) => {
    if (!window.confirm(`${t.deleteConfirm} (${categoryName})`)) return;
    try {
      // 1. Delete from categories collection
      const q = query(collection(db, 'categories'), where('name', '==', categoryName));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      // 2. Update all prompts that use this category
      const promptQ = query(collection(db, 'prompts'), where('category', '==', categoryName));
      const promptSnapshot = await getDocs(promptQ);
      const updatePromisesFixed = promptSnapshot.docs.map(d => updateDoc(d.ref, { category: '' }));
      await Promise.all(updatePromisesFixed);

      toast.success("Category deleted and prompts updated");
      setSelectedCategories(prev => prev.filter(c => c !== categoryName));
    } catch (e) {
      console.error("Error deleting category:", e);
      toast.error("Failed to delete category");
    }
  }, [t.deleteConfirm]);

  const handleRenameCategory = useCallback(async (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) {
      setRenamingCategory(null);
      return;
    }
    try {
      // 1. Update categories collection
      const q = query(collection(db, 'categories'), where('name', '==', oldName));
      const snapshot = await getDocs(q);
      const updateCatPromises = snapshot.docs.map(d => updateDoc(d.ref, { name: newName.trim() }));
      await Promise.all(updateCatPromises);

      // 2. Update all prompts that use this category
      const promptQ = query(collection(db, 'prompts'), where('category', '==', oldName));
      const promptSnapshot = await getDocs(promptQ);
      const updatePromptPromises = promptSnapshot.docs.map(d => updateDoc(d.ref, { category: newName.trim() }));
      await Promise.all(updatePromptPromises);

      toast.success("Category renamed");
      setSelectedCategories(prev => prev.map(c => (c === oldName ? newName.trim() : c)));
      setRenamingCategory(null);
    } catch (e) {
      console.error("Error renaming category:", e);
      toast.error("Failed to rename category");
    }
  }, []);

  useEffect(() => {
    if (editingPrompt) {
      setSelectedLinkedPromptIds(editingPrompt.linkedPromptIds || []);
    } else {
      setSelectedLinkedPromptIds([]);
    }
  }, [editingPrompt]);

  const viewingPrompt = useMemo(() => {
    if (!viewingPromptId) return null;
    return prompts.find(p => p.id === viewingPromptId) || null;
  }, [viewingPromptId, prompts]);

  const isAdmin = isAdminUser(user, userProfile);
  const canManage = useCallback(
    (prompt: Prompt) => canManagePrompt(prompt, user, isAdmin),
    [user, isAdmin]
  );

  // Keep ?prompt=<id> in the address bar in sync with the open prompt, so the
  // current URL is always shareable. replaceState keeps browser Back untouched.
  useEffect(() => {
    if (!promptsLoaded) return;
    const url = new URL(window.location.href);
    if (viewingPromptId) url.searchParams.set('prompt', viewingPromptId);
    else url.searchParams.delete('prompt');
    window.history.replaceState(null, '', url);
  }, [viewingPromptId, promptsLoaded]);

  // A shared link may point at a deleted prompt: tell the user once data is in.
  const sharedLinkChecked = useRef(false);
  useEffect(() => {
    if (!promptsLoaded || sharedLinkChecked.current) return;
    sharedLinkChecked.current = true;
    if (viewingPromptId && !prompts.some(p => p.id === viewingPromptId)) {
      toast.error(t.promptNotFound);
      setViewingPromptId(null);
    }
  }, [promptsLoaded, prompts, viewingPromptId, t.promptNotFound]);

  // Jumping between linked prompts should start at the top, not mid-scroll.
  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0 });
  }, [viewingPromptId]);

  const openLinkedPrompt = useCallback((id: string) => {
    if (viewingPromptId) setViewHistory(prev => [...prev, viewingPromptId]);
    setViewingPromptId(id);
  }, [viewingPromptId]);

  const goBackInHistory = useCallback(() => {
    const previousId = viewHistory[viewHistory.length - 1];
    if (!previousId) return;
    setViewHistory(viewHistory.slice(0, -1));
    setViewingPromptId(previousId);
  }, [viewHistory]);

  const previousPrompt = useMemo(() => {
    const previousId = viewHistory[viewHistory.length - 1];
    return previousId ? prompts.find(p => p.id === previousId) || null : null;
  }, [viewHistory, prompts]);

  const copyShareLink = useCallback((id: string) => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('prompt', id);
    navigator.clipboard.writeText(url.toString());
    toast.success(t.linkCopied);
  }, [t.linkCopied]);

  const extractPlaceholders = (text: string) => {
    const regex = /\[([^\]]+)\]/g;
    const matches = Array.from(text.matchAll(regex));
    const uniquePlaceholders = new Set<string>();
    matches.forEach(match => uniquePlaceholders.add(match[1]));
    return Array.from(uniquePlaceholders);
  };

  useEffect(() => {
    if (viewingPrompt) {
      const placeholders = extractPlaceholders(viewingPrompt.content);
      const initialValues: Record<string, string> = {};
      placeholders.forEach(p => {
        initialValues[p] = '';
      });
      setPlaceholderValues(initialValues);
    } else {
      setPlaceholderValues({});
    }
  }, [viewingPrompt]);


  // Test Connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // Create new profile
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || ''
            };
            try {
              await setDoc(userRef, newProfile);
              setUserProfile(newProfile);
            } catch (createError) {
              console.error("Error creating user profile:", createError);
            }
          }
        } catch (fetchError) {
          console.error("Error fetching user profile:", fetchError);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const q = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const promptData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Migration: handle old linkedPromptId
        if (data.linkedPromptId && !data.linkedPromptIds) {
          data.linkedPromptIds = [data.linkedPromptId];
        }
        return {
          id: doc.id,
          ...data
        };
      }) as Prompt[];
      setPrompts(promptData);
      setPromptsLoaded(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'prompts');
      setPromptsLoaded(true);
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    setAuthMode('login');
    setAuthEmail('');
    setAuthPassword('');
  }, []);

  const handleAuthSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAuthSubmitting(true);
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
      toast.success(t.loginSuccess);
      closeLoginModal();
    } catch (error) {
      console.error("Auth error:", error);
      const code = (error as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') toast.error(t.authEmailInUse);
      else if (code === 'auth/weak-password') toast.error(t.authWeakPassword);
      else if (code === 'auth/invalid-email') toast.error(t.authInvalidEmail);
      else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') toast.error(t.authInvalidCredentials);
      else toast.error(t.loginFail);
    } finally {
      setIsAuthSubmitting(false);
    }
  }, [authMode, authEmail, authPassword, closeLoginModal, t]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success(t.logoutSuccess);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleFavorite = async (promptId: string) => {
    if (!user || !userProfile) return;
    
    const favorites = userProfile.favoritePromptIds || [];
    const isFavorite = favorites.includes(promptId);
    const newFavorites = isFavorite 
      ? favorites.filter(id => id !== promptId)
      : [...favorites, promptId];
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { favoritePromptIds: newFavorites });
      setUserProfile({ ...userProfile, favoritePromptIds: newFavorites });
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  const filteredPrompts = useMemo(() => {
    const filtered = prompts.filter(p => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = p.title.toLowerCase().includes(query) ||
                            p.content.toLowerCase().includes(query) ||
                            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)));
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category || '');
      const matchesFavorites = !showFavoritesOnly || (userProfile?.favoritePromptIds?.includes(p.id!) || false);
      const matchesMine = !showMineOnly || (!!user && p.authorUid === user.uid);
      const matchesType = selectedTypeFilter === 'all' || p.type === selectedTypeFilter;
      return matchesSearch && matchesCategory && matchesFavorites && matchesMine && matchesType;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'mostCopied':
          return (b.copyCount ?? 0) - (a.copyCount ?? 0);
        case 'newest':
        default:
          return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
      }
    });
  }, [prompts, searchQuery, selectedCategories, showFavoritesOnly, showMineOnly, user, userProfile, selectedTypeFilter, sortBy]);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  }, []);

  // "All" is the master switch: it turns every category and personal filter off.
  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setShowFavoritesOnly(false);
    setShowMineOnly(false);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach(p => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [prompts]);

  const favoritesCount = userProfile?.favoritePromptIds?.filter(id => prompts.some(p => p.id === id)).length ?? 0;
  const mineCount = user ? prompts.filter(p => p.authorUid === user.uid).length : 0;

  const handleSavePrompt = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];
    let exampleUrl = formData.get('exampleUrl') as string;

    setIsUploading(true);

    try {
      // Handle file upload if a file is selected
      if (selectedFile) {
        console.log("Converting image to base64...");
        try {
          exampleUrl = await fileToBase64(selectedFile);
          console.log("Conversion successful");
        } catch (uploadErr) {
          console.error("Base64 conversion error:", uploadErr);
          toast.error(t.uploadError || "Upload failed");
          setIsUploading(false);
          return;
        }
      }

      const promptData: any = {
        title,
        content,
        category,
        type: formData.get('type') as 'image' | 'video' || 'image',
        tags,
        exampleUrl,
        linkedPromptIds: selectedLinkedPromptIds.length > 0 ? selectedLinkedPromptIds : [],
        updatedAt: Timestamp.now(),
        authorName: userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Unknown'
      };

      if (editingPrompt?.id) {
        await updateDoc(doc(db, 'prompts', editingPrompt.id), promptData);
        toast.success(t.promptUpdated);
        if (afterSaveIntent.current === 'close') {
          closeModal();
        } else {
          setEditingPrompt(null);
          setSelectedFile(null);
          setPreviewUrl(null);
          setIsDirty(false);
          setShowUnsavedConfirm(false);
        }
      } else {
        await addDoc(collection(db, 'prompts'), {
          ...promptData,
          createdAt: Timestamp.now(),
          authorUid: user.uid,
        });
        toast.success(t.promptAdded);
        closeModal();
      }
    } catch (error) {
      const code = handleFirestoreError(error, editingPrompt ? OperationType.UPDATE : OperationType.CREATE, 'prompts');
      toast.error(code === 'permission-denied' ? t.permissionDenied : t.saveFail);
    } finally {
      afterSaveIntent.current = null;
      setIsUploading(false);
    }
  }, [user, userProfile, selectedFile, selectedLinkedPromptIds, editingPrompt, closeModal, t]);

  // Leaving the form (backdrop click, Cancel, X) goes through here so unsaved
  // edits are never dropped silently.
  const leaveForm = useCallback((intent: 'close' | 'exitEdit') => {
    if (intent === 'exitEdit' && editingPrompt) {
      setEditingPrompt(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsDirty(false);
      setShowUnsavedConfirm(false);
      setModalView('form');
    } else {
      closeModal();
    }
  }, [editingPrompt, closeModal]);

  const requestLeave = useCallback((intent: 'close' | 'exitEdit') => {
    if (isDirty) {
      setLeaveIntent(intent);
      setShowUnsavedConfirm(true);
    } else {
      leaveForm(intent);
    }
  }, [isDirty, leaveForm]);

  const applyUnsavedChanges = useCallback(() => {
    setShowUnsavedConfirm(false);
    // Show the form first (it may be hidden behind the linked-prompt picker) so
    // the browser can point at an invalid field instead of failing silently.
    setModalView('form');
    requestAnimationFrame(() => {
      const form = document.getElementById('prompt-form') as HTMLFormElement | null;
      if (!form) return;
      // If the form is invalid no submit happens; the intent is reset by the next save.
      afterSaveIntent.current = leaveIntent;
      form.requestSubmit();
    });
  }, [leaveIntent]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDeletePrompt = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'prompts', id));
      toast.success(t.promptDeleted);
    } catch (error) {
      const code = handleFirestoreError(error, OperationType.DELETE, `prompts/${id}`);
      toast.error(code === 'permission-denied' ? t.permissionDenied : t.saveFail);
    }
  }, [t.promptDeleted, t.saveFail, t.permissionDenied]);

  const copyToClipboard = useCallback((text: string, promptId?: string) => {
    let finalPrompt = text;
    // Only apply replacements if we are copying the content of the currently viewed prompt
    if (viewingPrompt && text === viewingPrompt.content) {
      Object.entries(placeholderValues).forEach(([key, val]) => {
        if (val.trim()) {
          finalPrompt = finalPrompt.replaceAll(`[${key}]`, val);
        }
      });
    }
    navigator.clipboard.writeText(finalPrompt);
    toast.success(t.copySuccess);
    if (promptId && user) {
      updateDoc(doc(db, 'prompts', promptId), { copyCount: increment(1) }).catch((error) => {
        console.error("Error incrementing copy count:", error);
      });
    }
  }, [viewingPrompt, placeholderValues, user, t.copySuccess]);

  const handleDuplicatePrompt = useCallback(async (prompt: Prompt) => {
    if (!user) return;
    // Legacy documents can miss fields or exceed the validation limits in
    // firestore.rules; normalise everything so the copy is always a valid prompt.
    const suffix = ` ${t.copySuffix}`;
    const baseTitle = (prompt.title || 'Untitled').slice(0, 199 - suffix.length);
    try {
      const newRef = await addDoc(collection(db, 'prompts'), {
        title: `${baseTitle}${suffix}`,
        content: prompt.content || '',
        category: typeof prompt.category === 'string' ? prompt.category.slice(0, 49) : '',
        type: prompt.type === 'video' ? 'video' : 'image',
        tags: Array.isArray(prompt.tags) ? prompt.tags.filter(tag => typeof tag === 'string').slice(0, 19) : [],
        exampleUrl: typeof prompt.exampleUrl === 'string' ? prompt.exampleUrl : '',
        linkedPromptIds: Array.isArray(prompt.linkedPromptIds) ? prompt.linkedPromptIds.slice(0, 19) : [],
        copyCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        authorUid: user.uid,
        authorName: userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Unknown'
      });
      toast.success(t.duplicateSuccess, {
        action: {
          label: t.open,
          onClick: () => {
            setViewHistory([]);
            setViewingPromptId(newRef.id);
          }
        }
      });
    } catch (error) {
      const code = handleFirestoreError(error, OperationType.CREATE, 'prompts');
      toast.error(code === 'permission-denied' ? t.permissionDenied : t.saveFail);
    }
  }, [user, userProfile, t.copySuffix, t.duplicateSuccess, t.saveFail, t.permissionDenied, t.open]);

  const toggleBulkSelect = useCallback((id: string) => {
    setSelectedBulkIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  }, []);

  const exitBulkMode = useCallback(() => {
    setIsBulkMode(false);
    setSelectedBulkIds([]);
  }, []);

  const toggleBulkMode = useCallback(() => {
    if (isBulkMode) exitBulkMode(); else setIsBulkMode(true);
  }, [isBulkMode, exitBulkMode]);

  const openNewPromptForm = useCallback(() => {
    setEditingPrompt(null);
    setIsModalOpen(true);
  }, []);

  // Show the floating island once the full toolbar has scrolled above the viewport.
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [showIsland, setShowIsland] = useState(false);
  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowIsland(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  const handleBulkDelete = useCallback(async () => {
    try {
      await Promise.all(selectedBulkIds.map(id => deleteDoc(doc(db, 'prompts', id))));
      toast.success(t.promptDeleted);
      setShowBulkDeleteConfirm(false);
      exitBulkMode();
    } catch (error) {
      const code = handleFirestoreError(error, OperationType.DELETE, 'prompts');
      toast.error(code === 'permission-denied' ? t.permissionDenied : t.saveFail);
    }
  }, [selectedBulkIds, exitBulkMode, t.promptDeleted, t.saveFail, t.permissionDenied]);

  const handleBulkCategoryChange = useCallback(async (newCategory: string) => {
    if (!newCategory) return;
    try {
      await Promise.all(selectedBulkIds.map(id => updateDoc(doc(db, 'prompts', id), { category: newCategory })));
      toast.success(t.promptUpdated);
      exitBulkMode();
    } catch (error) {
      const code = handleFirestoreError(error, OperationType.UPDATE, 'prompts');
      toast.error(code === 'permission-denied' ? t.permissionDenied : t.saveFail);
    }
  }, [selectedBulkIds, exitBulkMode, t.promptUpdated, t.saveFail, t.permissionDenied]);

  const handleExport = useCallback(() => {
    const exportData = prompts.map(({ id, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `creo-prompts-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t.exportSuccess);
  }, [prompts, t.exportSuccess]);

  const handleImportFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('Invalid import format: expected an array');

      let importedCount = 0;
      for (const item of parsed) {
        if (!item || typeof item.title !== 'string' || typeof item.content !== 'string') continue;
        await addDoc(collection(db, 'prompts'), {
          title: item.title,
          content: item.content,
          category: typeof item.category === 'string' ? item.category : '',
          type: item.type === 'video' ? 'video' : 'image',
          tags: Array.isArray(item.tags) ? item.tags.filter((tag: unknown) => typeof tag === 'string') : [],
          exampleUrl: typeof item.exampleUrl === 'string' ? item.exampleUrl : '',
          linkedPromptIds: [],
          copyCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          authorUid: user.uid,
          authorName: userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Unknown'
        });
        importedCount++;
      }
      toast.success(`${t.importSuccess}: ${importedCount}`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(t.importFail);
    } finally {
      setIsImporting(false);
    }
  }, [user, userProfile, t.importSuccess, t.importFail]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-ink">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    // overflow-x-clip (not -hidden): -hidden would make this div a scroll
    // container and the sidebar's position:sticky would stop working.
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-accent/30 relative overflow-x-clip">
      <Toaster position="top-right" theme={isLight ? 'light' : 'dark'} />
      
      {/* Background Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-bg to-surface-2" />
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="flex relative z-10">
        <Sidebar
          categories={categories}
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          onClearFilters={clearFilters}
          categoryCounts={categoryCounts}
          totalCount={prompts.length}
          selectedTypeFilter={selectedTypeFilter}
          onSelectType={setSelectedTypeFilter}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
          favoritesCount={favoritesCount}
          showMineOnly={showMineOnly}
          onToggleMineOnly={() => setShowMineOnly(!showMineOnly)}
          mineCount={mineCount}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onManageCategories={() => setIsCategoryModalOpen(true)}
          onOpenAdmin={() => setIsAdminPanelOpen(true)}
          isAdmin={isAdmin}
          user={user}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          isLight={isLight}
          t={t}
        />

        <main className="flex-1 min-w-0 py-8 px-6 md:px-10 flex flex-col min-h-screen">
          {/* Controls */}
          <div ref={toolbarRef} className="mb-8">
            <Toolbar
              variant="full"
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortBy={sortBy}
                setSortBy={setSortBy}
                viewMode={viewMode}
                setViewMode={setViewMode}
                canEdit={!!user}
                isBulkMode={isBulkMode}
                onToggleBulkMode={toggleBulkMode}
                onAddPrompt={openNewPromptForm}
              t={t}
            />
          </div>

          {/* Floating "island": the same controls, once the toolbar scrolls out of view.
              A zero-height sticky rail keeps it centred over the content column. */}
          <div className="sticky top-3 z-40 h-0 flex justify-center pointer-events-none">
            <AnimatePresence>
              {showIsland && (
                <motion.div
                  initial={{ opacity: 0, y: -24, scale: 0.6, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -24, scale: 0.6, filter: 'blur(6px)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  className="pointer-events-auto h-fit rounded-full bg-surface/85 backdrop-blur-xl border border-ink/10 shadow-2xl shadow-black/30 p-1.5 pl-2"
                >
                  <Toolbar
                    variant="island"
                searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    canEdit={!!user}
                    isBulkMode={isBulkMode}
                    onToggleBulkMode={toggleBulkMode}
                    onAddPrompt={openNewPromptForm}
                    onScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    t={t}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategories.join('|') + showFavoritesOnly + showMineOnly + searchQuery + selectedTypeFilter + sortBy}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className={cn(
                "grid relative",
                viewMode === 'grid' && "gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                viewMode === 'compact' && "gap-4 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7",
                viewMode === 'list' && "gap-4 grid-cols-1"
              )}
            >
              {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  viewMode={viewMode}
                  user={user}
                  userProfile={userProfile}
                  isLight={isLight}
                  toggleFavorite={toggleFavorite}
                  setViewingPromptId={setViewingPromptId}
                  copyToClipboard={copyToClipboard}
                  onDuplicate={handleDuplicatePrompt}
                  onShare={copyShareLink}
                  isBulkMode={isBulkMode}
                  isSelectable={canManage(prompt)}
                  isSelected={selectedBulkIds.includes(prompt.id!)}
                  onToggleSelect={toggleBulkSelect}
                  t={t}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredPrompts.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-ink/5 rounded-full mb-4 text-ink/20">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.noPrompts}</h3>
              <p className="text-ink/40">{t.noPromptsSub}</p>
            </div>
          )}

          <footer className="mt-auto pt-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-ink/10 pt-8">
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-6 h-6 bg-ink/20 rounded flex items-center justify-center font-display font-bold text-bg text-xs">
                  C
                </div>
                <span className="text-sm font-medium">CREO Prompt Library &copy; 2026</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-ink/40">
                <a href="#" className="hover:text-ink transition-colors">Privacy</a>
                <a href="#" className="hover:text-ink transition-colors">Terms</a>
                <a href="#" className="hover:text-ink transition-colors">Support</a>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        onExport={handleExport}
        onImportFile={handleImportFile}
        canImport={!!user}
        isImporting={isImporting}
        promptCount={prompts.length}
        t={t}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen && isAdmin}
        onClose={() => setIsAdminPanelOpen(false)}
        prompts={prompts}
        currentUid={user?.uid}
        onManageCategories={() => {
          setIsAdminPanelOpen(false);
          setIsCategoryModalOpen(true);
        }}
        t={t}
      />

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {isBulkMode && selectedBulkIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-surface-2 border border-ink/10 rounded-2xl px-5 py-3 shadow-2xl"
          >
            <span className="text-sm font-bold text-ink/80 whitespace-nowrap">
              {selectedBulkIds.length} {t.selectedCount}
            </span>
            <div className="w-[1px] h-5 bg-ink/10" />
            <select
              value=""
              onChange={(e) => handleBulkCategoryChange(e.target.value)}
              className="bg-ink/5 border border-ink/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-accent/50"
            >
              <option value="" className="bg-surface">{t.changeCategory}</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-surface">{cat}</option>
              ))}
            </select>
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg text-xs font-bold transition-all"
            >
              <Trash2 size={14} />
              {t.deleteSelected}
            </button>
            <button
              onClick={exitBulkMode}
              className="p-1.5 hover:bg-ink/10 rounded-lg text-ink/40 hover:text-ink transition-all"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation */}
      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-2 border border-ink/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.bulkDeleteConfirm}</h3>
              <p className="text-ink/40 text-sm mb-8">{selectedBulkIds.length} {t.selectedCount}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1 py-3 bg-ink/5 hover:bg-ink/10 rounded-xl font-bold transition-all"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 py-3 bg-danger text-ink rounded-xl font-bold hover:bg-danger-hover transition-all shadow-lg shadow-danger/20"
                >
                  {t.deleteSelected}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Modal (Add/Edit/View) */}
      <AnimatePresence>
        {(viewingPrompt || isModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => requestLeave('close')}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <div className="relative flex flex-col items-center gap-4 w-full max-w-7xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 5 }}
                transition={{ type: "spring", damping: 25, stiffness: 500 }}
                className="relative w-full bg-surface border border-ink/10 rounded-3xl overflow-hidden flex flex-col md:flex-row h-[85vh] shadow-2xl"
              >
                {modalView === 'link' && (
                  <div className="flex-1 flex flex-col bg-surface overflow-hidden">
                    <div className="px-8 py-6 border-b border-ink/10 flex items-center justify-between bg-surface z-10">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setModalView('form')}
                          className="p-2 hover:bg-ink/10 rounded-full text-ink/60 hover:text-ink transition-all"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-xl font-bold text-ink">{t.addLinkedPrompt}</h2>
                      </div>
                      <button 
                        onClick={() => requestLeave('close')}
                        className="p-2 hover:bg-ink/10 rounded-full text-ink/60 hover:text-ink transition-all"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="px-8 py-4 border-b border-ink/10 space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={18} />
                        <input 
                          type="text" 
                          placeholder={t.searchPrompts}
                          value={linkSearchQuery}
                          onChange={(e) => setLinkSearchQuery(e.target.value)}
                          className="w-full bg-ink/5 border border-ink/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                          autoFocus
                        />
                      </div>

                      {/* Category Filter for Link View */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                        <button
                          onClick={() => setLinkSelectedCategory('All')}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                            linkSelectedCategory === 'All' 
                              ? "bg-accent text-accent-ink shadow-lg shadow-accent/20" 
                              : "bg-ink/5 text-ink/40 hover:text-ink hover:bg-ink/10"
                          )}
                        >
                          {t.all}
                        </button>
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setLinkSelectedCategory(cat)}
                            className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shrink-0",
                              linkSelectedCategory === cat 
                                ? "bg-accent text-accent-ink shadow-lg shadow-accent/20" 
                                : "bg-ink/5 text-ink/40 hover:text-ink hover:bg-ink/10"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                      {prompts
                        .filter(p => {
                          if (editingPrompt && p.id === editingPrompt.id) return false;
                          const query = linkSearchQuery.toLowerCase();
                          const matchesSearch = p.title.toLowerCase().includes(query) || 
                                               p.content.toLowerCase().includes(query) ||
                                               (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)));
                          const matchesCategory = linkSelectedCategory === 'All' || p.category === linkSelectedCategory;
                          return matchesSearch && matchesCategory;
                        })
                        .map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedLinkedPromptIds(prev => 
                                prev.includes(p.id!) 
                                  ? prev.filter(id => id !== p.id) 
                                  : [...prev, p.id!]
                              );
                              setIsDirty(true);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-4 rounded-2xl border transition-all group/item",
                              selectedLinkedPromptIds.includes(p.id!) 
                                ? "bg-accent/10 border-accent/50" 
                                : "bg-ink/5 border-ink/10 hover:bg-ink/10 hover:border-ink/20"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                p.type === 'video' ? "bg-chip-video/20 text-chip-video-text" : "bg-chip-image/20 text-chip-image-text"
                              )}>
                                {p.type === 'video' ? <Loader2 size={24} /> : <ImageIcon size={24} />}
                              </div>
                              <div className="text-left">
                                <div className="text-xs font-bold text-ink group-hover/item:text-accent transition-colors line-clamp-1">
                                  {p.title}
                                </div>
                                <div className="text-[10px] text-ink/30 uppercase tracking-widest font-bold mt-1">
                                  {p.category || 'General'} • {p.type === 'video' ? 'Video' : 'Image'}
                                </div>
                              </div>
                            </div>
                            {selectedLinkedPromptIds.includes(p.id!) && (
                              <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-ink">
                                <Check size={14} strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        ))}
                    </div>

                    {selectedLinkedPromptIds.length > 0 && (
                      <div className="p-6 border-t border-ink/10 bg-surface animate-in slide-in-from-bottom-4 duration-300">
                        <button
                          onClick={() => setModalView('form')}
                          className="w-full py-4 bg-accent text-accent-ink rounded-2xl font-bold hover:bg-accent-hover transition-all active:scale-95 shadow-xl shadow-accent/20 flex items-center justify-center gap-2"
                        >
                          <Check size={20} />
                          {t.apply} ({selectedLinkedPromptIds.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
                  {/* The form stays mounted while picking linked prompts so typed values survive. */}
                  <div className={cn("contents", modalView === 'link' && "hidden")}>
                    {/* Media Side */}
                    <div className="w-full md:w-[calc(85vh*0.75)] shrink-0 bg-black flex items-center justify-center relative group min-h-[300px] md:min-h-0">
                  {(editingPrompt || (isModalOpen && !viewingPrompt)) ? (
                    <label className="w-full h-full cursor-pointer group/upload relative flex items-center justify-center">
                      {(previewUrl || editingPrompt?.exampleUrl) ? (
                        <>
                          <img 
                            src={previewUrl || editingPrompt?.exampleUrl} 
                            className="w-full h-full object-cover" 
                            alt="Preview"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="text-ink" size={48} />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-ink/20 group-hover/upload:text-accent transition-colors">
                          <Upload size={64} />
                          <span className="text-sm font-bold uppercase tracking-widest">{t.uploadImage}</span>
                          <span className="text-[10px] opacity-50">PNG, JPG</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    <>
                      {viewingPrompt?.exampleUrl ? (
                        <img 
                          src={viewingPrompt.exampleUrl} 
                          alt={viewingPrompt?.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-ink/10">
                          <ImageIcon size={80} />
                          <span className="text-xs uppercase tracking-widest mt-4">No Preview Available</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Info Side */}
                <div className="flex-[1.5] flex flex-col border-l border-ink/10 bg-surface overflow-hidden relative">
                  <form 
                    id="prompt-form"
                    onSubmit={handleSavePrompt}
                    onChange={() => setIsDirty(true)}
                    className="flex flex-col h-full overflow-hidden"
                  >
                    {/* Fixed Header */}
                    <div className="px-8 py-6 border-b border-ink/10 shrink-0 bg-surface z-10">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                        {(editingPrompt || (isModalOpen && !viewingPrompt)) ? (
                          <div className="flex flex-col gap-4 w-full">
                            <div className="flex items-center gap-2 w-full">
                              <div className="relative flex-1">
                                <select 
                                  name="category" 
                                  defaultValue={editingPrompt?.category || 'Outdoor'}
                                  className="w-full bg-ink/5 text-ink/80 px-4 py-2.5 rounded-xl text-xs font-medium focus:outline-none border border-ink/10 focus:border-accent/50 appearance-none cursor-pointer hover:bg-ink/10 transition-all"
                                >
                                  {categories.map(c => (
                                    <option key={c} value={c} className="bg-surface text-ink">{c}</option>
                                  ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink/30">
                                  <Filter size={14} />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                                className={cn(
                                  "p-2.5 border rounded-xl transition-all",
                                  showNewCategoryInput 
                                    ? "bg-accent border-accent text-accent-ink" 
                                    : "bg-ink/5 border-ink/10 text-ink/40 hover:text-ink hover:bg-ink/10"
                                )}
                              >
                                <Plus size={18} />
                              </button>
                            </div>

                            {/* Type Toggle */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.type}</h4>
                              <div className="flex p-1 bg-ink/5 rounded-xl border border-ink/10 w-fit">
                                <label className="relative cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="type" 
                                    value="image" 
                                    defaultChecked={!editingPrompt || editingPrompt.type === 'image'} 
                                    className="peer sr-only"
                                  />
                                  <div className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all peer-checked:bg-chip-image peer-checked:text-chip-image-text text-ink/40 hover:text-ink">
                                    Image
                                  </div>
                                </label>
                                <label className="relative cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="type" 
                                    value="video" 
                                    defaultChecked={editingPrompt?.type === 'video'} 
                                    className="peer sr-only"
                                  />
                                  <div className="px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all peer-checked:bg-chip-video peer-checked:text-chip-video-text text-ink/40 hover:text-ink">
                                    Video
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            {previousPrompt && (
                              <>
                                <button
                                  type="button"
                                  onClick={goBackInHistory}
                                  title={previousPrompt.title}
                                  className="flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full bg-ink/5 hover:bg-accent hover:text-accent-ink text-ink/60 text-[10px] font-bold uppercase tracking-widest transition-all max-w-[220px]"
                                >
                                  <ArrowLeft size={12} className="shrink-0" />
                                  <span className="truncate">{t.back}: {previousPrompt.title}</span>
                                </button>
                                <div className="w-[1px] h-3 bg-ink/10" />
                              </>
                            )}
                            <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">
                              {viewingPrompt?.category || t.all}
                            </span>
                            <div className="w-[1px] h-3 bg-ink/10" />
                            <span className={cn(
                              "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                              viewingPrompt?.type === 'video' 
                                ? "bg-chip-video/20 text-chip-video-text border border-chip-video/30 shadow-[0_0_10px_rgba(203,191,255,0.25)]" 
                                : "bg-chip-image/10 text-chip-image-text border border-chip-image/20 shadow-[0_0_10px_rgba(255,199,147,0.2)]"
                            )}>
                              {viewingPrompt?.type === 'video' ? 'Video' : 'Image'}
                            </span>
                            <div className="w-[1px] h-3 bg-ink/10" />
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ink/30">
                              <UserIcon size={12} className="text-accent/50" />
                              <span>{viewingPrompt?.authorName || '—'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {showNewCategoryInput && (
                        <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder={t.newCategory}
                            className="flex-1 bg-ink/5 border border-ink/10 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-accent transition-colors"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
                                try {
                                  await addDoc(collection(db, 'categories'), { name: newCategoryName.trim() });
                                  setNewCategoryName('');
                                  setShowNewCategoryInput(false);
                                  toast.success("Category added");
                                } catch (e) {
                                  console.error("Error adding category:", e);
                                  toast.error("Failed to add category");
                                }
                              }
                            }}
                            className="px-4 py-2 bg-accent text-accent-ink rounded-xl text-xs font-bold hover:bg-accent-hover transition-all"
                          >
                            {t.addPrompt}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewCategoryInput(false)}
                            className="p-2 bg-ink/5 hover:bg-ink/10 rounded-xl text-ink/40"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}

                      <div className="space-y-2">
                        {(editingPrompt || (isModalOpen && !viewingPrompt)) ? (
                          <input 
                            name="title"
                            required
                            defaultValue={editingPrompt?.title}
                            placeholder={t.title}
                            className="text-2xl font-extrabold bg-transparent border-b border-ink/10 w-full focus:outline-none focus:border-accent transition-colors pb-1"
                          />
                        ) : (
                          <div className="space-y-2">
                            <h2 className="text-3xl font-display font-extrabold leading-tight tracking-tight text-ink">{viewingPrompt?.title}</h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-ink/30 uppercase tracking-widest font-bold">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-accent/50" />
                                <span>{t.created}: {formatDate(viewingPrompt?.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Loader2 size={12} className="text-chip-video-text/50" />
                                <span>{t.lastUpdate}: {formatDate(viewingPrompt?.updatedAt)}</span>
                              </div>
                              {typeof viewingPrompt?.copyCount === 'number' && viewingPrompt.copyCount > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <Copy size={12} className="text-accent/50" />
                                  <span>{t.copiedLabel}: {viewingPrompt.copyCount}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                    <div ref={contentScrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30">{t.thePrompt}</h4>
                        <div className="relative group">
                          {(editingPrompt || (isModalOpen && !viewingPrompt)) ? (
                            <textarea 
                              name="content"
                              required
                              rows={10}
                              defaultValue={editingPrompt?.content}
                              placeholder={t.content}
                              className="w-full bg-ink/5 border border-ink/10 rounded-2xl p-6 text-sm text-ink/80 whitespace-pre-wrap font-mono leading-relaxed focus:outline-none focus:border-accent transition-colors resize-none"
                            />
                          ) : (
                            <div className="bg-ink/5 border border-ink/10 rounded-2xl p-6 text-sm text-ink/80 leading-relaxed selection:bg-accent/30 relative group">
                              <MarkdownPrompt content={viewingPrompt?.content || ''} values={placeholderValues} />
                              
                              <button 
                                type="button"
                                onClick={() => viewingPrompt && copyToClipboard(viewingPrompt.content, viewingPrompt.id)}
                                className="absolute top-4 right-4 p-2.5 bg-ink/10 hover:bg-accent hover:text-accent-ink rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                              >
                                <Copy size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {(!editingPrompt && viewingPrompt && Object.keys(placeholderValues).length > 0) && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30">{t.placeholders}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(placeholderValues).map(key => (
                              <div key={key} className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/20 ml-1">
                                  {key}
                                </label>
                                <input
                                  type="text"
                                  value={placeholderValues[key]}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setPlaceholderValues(prev => ({ ...prev, [key]: e.target.value }));
                                  }}
                                  placeholder={`Enter ${key}...`}
                                  className="w-full bg-ink/5 border border-ink/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-ph transition-colors"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(editingPrompt || (isModalOpen && !viewingPrompt)) && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40">{t.tags}</h4>
                          <input 
                            name="tags"
                            defaultValue={editingPrompt?.tags?.join(', ')}
                            placeholder="tag1, tag2, tag3..."
                            className="w-full bg-ink/5 border border-ink/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-accent transition-colors"
                          />
                        </div>
                      )}

                      {(!editingPrompt && !(isModalOpen && !viewingPrompt)) && viewingPrompt?.tags && viewingPrompt.tags.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40">{t.tags}</h4>
                          <div className="flex flex-wrap gap-2">
                            {viewingPrompt.tags.map((tag, idx) => (
                              <span key={idx} className="px-3 py-1 bg-ink/5 border border-ink/10 rounded-full text-xs text-ink/60">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(editingPrompt || (isModalOpen && !viewingPrompt)) && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40">{t.exampleUrl}</h4>
                          <input 
                            name="exampleUrl"
                            defaultValue={editingPrompt?.exampleUrl}
                            placeholder="https://..."
                            className="w-full bg-ink/5 border border-ink/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-accent transition-colors"
                          />
                        </div>
                      )}

                      {(editingPrompt || (isModalOpen && !viewingPrompt)) && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40">{t.linkedPrompt}</h4>
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setModalView('link')}
                              className="w-full flex items-center justify-between px-4 py-2.5 bg-ink/5 border border-ink/10 rounded-xl text-xs text-ink/80 hover:bg-ink/10 transition-all"
                            >
                              <span>{t.addLinkedPrompt}</span>
                              <div className="flex items-center gap-2">
                                {selectedLinkedPromptIds.length > 0 && (
                                  <span className="bg-accent text-accent-ink px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    {selectedLinkedPromptIds.length}
                                  </span>
                                )}
                                <ChevronRight size={14} className="text-ink/30" />
                              </div>
                            </button>
                            
                            {selectedLinkedPromptIds.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {selectedLinkedPromptIds.map(id => {
                                  const p = prompts.find(prompt => prompt.id === id);
                                  if (!p) return null;
                                  return (
                                    <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-ink/5 border border-ink/10 rounded-lg text-[10px] text-ink/60">
                                      <span className="truncate max-w-[120px]">{p.title}</span>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedLinkedPromptIds(prev => prev.filter(pid => pid !== id))}
                                        className="hover:text-danger transition-colors"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(!editingPrompt && !(isModalOpen && !viewingPrompt)) && viewingPrompt?.linkedPromptIds && viewingPrompt.linkedPromptIds.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-ink/40">{t.linkedPrompt}</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {viewingPrompt.linkedPromptIds.map(id => {
                              const linked = prompts.find(p => p.id === id);
                              if (!linked) return null;
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => openLinkedPrompt(linked.id!)}
                                  className="w-full flex items-center justify-between p-4 bg-ink/5 border border-ink/10 rounded-2xl hover:bg-ink/10 transition-all group/link"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-10 h-10 rounded-lg flex items-center justify-center",
                                      linked.type === 'video' ? "bg-chip-video/20 text-chip-video-text" : "bg-chip-image/20 text-chip-image-text"
                                    )}>
                                      {linked.type === 'video' ? <Loader2 size={20} /> : <ImageIcon size={20} />}
                                    </div>
                                    <div className="text-left">
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-ink/30">
                                        {linked.type === 'video' ? t.switchToVideo : t.switchToImage}
                                      </div>
                                      <div className="text-sm font-bold text-ink group-hover/link:text-accent transition-colors line-clamp-1">
                                        {linked.title}
                                      </div>
                                    </div>
                                  </div>
                                  <ChevronRight size={18} className="text-ink/20 group-hover/link:text-accent group-hover/link:translate-x-1 transition-all" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fixed Footer */}
                    <div className="px-8 py-6 border-t border-ink/10 shrink-0 bg-surface z-10 flex gap-3">
                      {(editingPrompt || (isModalOpen && !viewingPrompt)) ? (
                        <>
                          <button 
                            type="submit"
                            onClick={() => { afterSaveIntent.current = null; }}
                            disabled={isUploading}
                            className="flex-[2] py-3.5 bg-accent text-accent-ink rounded-2xl font-bold hover:bg-accent-hover transition-all active:scale-95 shadow-xl shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isUploading && <Loader2 className="animate-spin" size={18} />}
                            {isUploading ? t.uploading : (editingPrompt ? t.update : t.createPrompt)}
                          </button>

                          <button 
                            type="button"
                            onClick={() => requestLeave(editingPrompt ? 'exitEdit' : 'close')}
                            className="flex-1 py-3.5 bg-ink/5 hover:bg-ink/10 rounded-2xl font-bold transition-all active:scale-95 text-ink/60"
                          >
                            {t.cancel}
                          </button>
                          
                          {editingPrompt && (
                            <button 
                              type="button"
                              onClick={() => setShowDeleteConfirm(true)}
                              className="w-14 h-14 shrink-0 flex items-center justify-center bg-ink/5 hover:bg-danger/20 rounded-2xl text-ink/40 hover:text-danger transition-all active:scale-95 border border-ink/10 hover:border-danger/30"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button 
                            type="button"
                            onClick={() => viewingPrompt && copyToClipboard(viewingPrompt.content, viewingPrompt.id)}
                            className="flex-1 flex items-center justify-center gap-3 py-4 bg-accent text-accent-ink rounded-2xl font-bold hover:bg-accent-hover transition-all active:scale-95 shadow-xl shadow-accent/20"
                          >
                            <Copy size={20} />
                            <span className="truncate">{t.copyToClipboard}</span>
                          </button>
                          
                          {viewingPrompt && (
                            <button
                              type="button"
                              onClick={() => copyShareLink(viewingPrompt.id!)}
                              title={t.share}
                              aria-label={t.share}
                              className="w-14 h-14 shrink-0 flex items-center justify-center bg-ink/10 hover:bg-ink/20 rounded-2xl text-ink/60 hover:text-ink transition-all active:scale-95"
                            >
                              <Link2 size={20} />
                            </button>
                          )}

                          {viewingPrompt && canManage(viewingPrompt) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingPrompt(viewingPrompt);
                              }}
                              title={t.editPrompt}
                              className="w-14 h-14 shrink-0 flex items-center justify-center bg-ink/10 hover:bg-ink/20 rounded-2xl text-ink/60 hover:text-ink transition-all active:scale-95"
                            >
                              <Edit2 size={20} />
                            </button>
                          )}

                          {user && viewingPrompt && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDuplicatePrompt(viewingPrompt);
                              }}
                              title={t.duplicate}
                              className="w-14 h-14 shrink-0 flex items-center justify-center bg-ink/10 hover:bg-ink/20 rounded-2xl text-ink/60 hover:text-ink transition-all active:scale-95"
                            >
                              <CopyPlus size={20} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </form>
                </div>
              </div>


                  {/* Custom Delete Confirmation Overlay */}
                  <AnimatePresence>
                    {showDeleteConfirm && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                      >
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          className="bg-surface-2 border border-ink/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
                        >
                          <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                          </div>
                          <h3 className="text-xl font-bold mb-2">{t.deleteConfirm}</h3>
                          <p className="text-ink/40 text-sm mb-8">{t.deleteIrreversible}</p>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => setShowDeleteConfirm(false)}
                              className="flex-1 py-3 bg-ink/5 hover:bg-ink/10 rounded-xl font-bold transition-all"
                            >
                              {t.cancel}
                            </button>
                            <button 
                              onClick={() => {
                                if (editingPrompt?.id) {
                                  handleDeletePrompt(editingPrompt.id);
                                  closeModal();
                                }
                              }}
                              className="flex-1 py-3 bg-danger text-ink rounded-xl font-bold hover:bg-danger-hover transition-all shadow-lg shadow-danger/20"
                            >
                              {t.deleteAction}
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-ink/20 text-[10px] uppercase tracking-[0.2em] font-medium"
              >
                {t.closeInstruction}
              </motion.p>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        isAuthSubmitting={isAuthSubmitting}
        onSubmit={handleAuthSubmit}
        t={t}
      />

      {/* Category Management Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => closeModal()}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-ink/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[70vh]"
            >
              <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink">{t.manageCategories}</h3>
                <button 
                  onClick={() => closeModal()}
                  className="p-2 hover:bg-ink/10 rounded-full text-ink/40 hover:text-ink transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {categories.map(cat => (
                  <div 
                    key={cat}
                    className="flex items-center justify-between p-3 bg-ink/5 border border-ink/10 rounded-2xl group"
                  >
                    {renamingCategory === cat ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input 
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="flex-1 bg-ink/10 border border-accent/50 rounded-lg px-3 py-1 text-sm text-ink focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameCategory(cat, renameValue);
                            if (e.key === 'Escape') setRenamingCategory(null);
                          }}
                        />
                        <button 
                          onClick={() => handleRenameCategory(cat, renameValue)}
                          className="p-1.5 bg-accent text-accent-ink rounded-lg hover:bg-accent-hover transition-all"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => setRenamingCategory(null)}
                          className="p-1.5 bg-ink/10 text-ink/40 rounded-lg hover:text-ink transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-ink/80">{cat}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setRenamingCategory(cat);
                              setRenameValue(cat);
                            }}
                            className="p-2 hover:bg-ink/10 rounded-lg text-ink/40 hover:text-accent transition-all"
                            title={t.rename}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-2 hover:bg-ink/10 rounded-lg text-ink/40 hover:text-danger transition-all"
                            title={t.deleteCategory}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unsaved Changes Confirmation */}
      <AnimatePresence>
        {showUnsavedConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUnsavedConfirm(false)}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-surface-2 border border-ink/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <button
                onClick={() => setShowUnsavedConfirm(false)}
                aria-label={t.cancel}
                title={t.cancel}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-ink/40 hover:text-ink hover:bg-ink/10 transition-all"
              >
                <X size={18} />
              </button>
              <div className="w-16 h-16 bg-chip-image/10 text-chip-image-text rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.unsavedChanges}</h3>
              <p className="text-ink/40 text-sm mb-8">{t.unsavedChangesSub}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => leaveForm(leaveIntent)}
                  className="flex-1 py-3 bg-ink/5 hover:bg-ink/10 rounded-xl font-bold transition-all text-ink/60"
                >
                  {t.discard}
                </button>
                <button 
                  onClick={applyUnsavedChanges}
                  className="flex-1 py-3 bg-accent text-accent-ink rounded-xl font-bold hover:bg-accent-hover transition-all"
                >
                  {t.apply}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

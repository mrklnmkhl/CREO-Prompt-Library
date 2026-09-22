import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
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
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { Prompt, UserProfile, OperationType } from './types';
import { handleFirestoreError } from './utils/error-handler';
import { 
  Plus, 
  Search, 
  Copy, 
  Edit2, 
  Trash2, 
  LogOut, 
  LogIn, 
  X, 
  Image as ImageIcon,
  Video,
  ExternalLink,
  Check,
  Filter,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  List as ListIcon,
  Upload,
  Loader2,
  Heart,
  Tag,
  Calendar,
  Pencil,
  User as UserIcon,
  Download,
  FileUp,
  CopyPlus,
  ArrowUpDown,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';
import remarkHighlightPlaceholders from './utils/highlightPlaceholders';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES = ['All', 'Outdoor', 'Studio', 'Interiors', 'People (GEO)', 'Verticals', 'Hands'];

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
    copiedLabel: "Copied"
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
    copiedLabel: "Скопировано"
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

const HighlightedPrompt = memo(({ content, values = {} }: { content: string; values?: Record<string, string> }) => {
  const parts = content.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const key = part.slice(1, -1);
          return (
            <span key={i} className="text-ph font-bold bg-ph/10 px-0.5 rounded">
              {values[key] || part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
});

const MarkdownPrompt = memo(({ content, values = {} }: { content: string; values?: Record<string, string> }) => {
  return (
    <div className="prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkHighlightPlaceholders]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
          em: ({ children }) => <em className="italic text-ink/70">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-ink/80">{children}</li>,
          code: ({ children }) => <code className="bg-ink/10 px-1.5 py-0.5 rounded text-accent-hover text-xs">{children}</code>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-ink">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-ink">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-ink">{children}</h3>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-accent underline">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent/40 pl-4 italic text-ink/60 mb-3">{children}</blockquote>
          ),
          mark: (props: any) => {
            const key = props['data-placeholder'];
            return (
              <span className="text-ph font-bold bg-ph/10 px-0.5 rounded">
                {values[key] || props.children}
              </span>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

const PromptCard = memo(({
  prompt,
  viewMode,
  user,
  userProfile,
  toggleFavorite,
  setViewingPromptId,
  copyToClipboard,
  onDuplicate,
  isBulkMode,
  isSelected,
  onToggleSelect,
  t
}: {
  prompt: Prompt;
  viewMode: 'grid' | 'list';
  user: any;
  userProfile: UserProfile | null;
  toggleFavorite: (id: string) => void;
  setViewingPromptId: (id: string) => void;
  copyToClipboard: (text: string, promptId?: string) => void;
  onDuplicate: (prompt: Prompt) => void;
  isBulkMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  t: any;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.08 } }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      onClick={isBulkMode ? () => onToggleSelect(prompt.id!) : undefined}
      className={cn(
        "group relative bg-ink/5 border rounded-xl overflow-hidden transition-colors duration-200 flex flex-col shadow-lg",
        isBulkMode ? "cursor-pointer" : "hover:border-accent/30 hover:shadow-accent/5",
        isSelected ? "border-accent/60 ring-2 ring-accent/30" : "border-ink/10",
        viewMode === 'list' && "flex flex-row h-48"
      )}
    >
      {isBulkMode && (
        <div className={cn(
          "absolute top-3 left-3 z-30 w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all",
          isSelected ? "bg-accent border-accent text-accent-ink" : "bg-black/40 border-ink/30 text-transparent"
        )}>
          <Check size={14} strokeWidth={3} />
        </div>
      )}

      {/* Preview Image */}
      <div
        className={cn(
          "relative bg-surface-2 overflow-hidden shrink-0",
          isBulkMode ? "" : "cursor-pointer",
          viewMode === 'grid' ? "aspect-square" : "w-64 h-full"
        )}
        onClick={isBulkMode ? undefined : () => setViewingPromptId(prompt.id!)}
      >
        {prompt.exampleUrl ? (
          <img
            src={prompt.exampleUrl}
            alt={prompt.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-ink/10">
            <ImageIcon size={32} />
            <span className="text-[8px] uppercase tracking-widest mt-2">{t.noPreview}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-ink/10 backdrop-blur-md p-2 rounded-full border border-ink/20">
            <ExternalLink size={16} className="text-ink" />
          </div>
        </div>

        {/* Favorite Button */}
        {user && !isBulkMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(prompt.id!);
            }}
            className={cn(
              "absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md border transition-all",
              userProfile?.favoritePromptIds?.includes(prompt.id!)
                ? "bg-danger/20 border-danger/30 text-danger"
                : "bg-black/20 border-ink/10 text-ink/40 hover:text-ink hover:bg-black/40"
            )}
          >
            <Heart size={14} fill={userProfile?.favoritePromptIds?.includes(prompt.id!) ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent/80">
            {prompt.category || 'General'}
          </span>
          <div className="w-[1px] h-3 bg-ink/10" />
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm",
            prompt.type === 'video'
              ? "bg-chip-video/20 text-chip-video-text border border-chip-video/30 shadow-[0_0_10px_rgba(203,191,255,0.25)]"
              : "bg-chip-image/10 text-chip-image-text"
          )}>
            {prompt.type === 'video' ? 'Video' : 'Image'}
          </span>
          {typeof prompt.copyCount === 'number' && prompt.copyCount > 0 && (
            <>
              <div className="w-[1px] h-3 bg-ink/10 ml-auto" />
              <span className="flex items-center gap-1 text-[9px] font-bold text-ink/20">
                <Copy size={9} />
                {prompt.copyCount}
              </span>
            </>
          )}
        </div>

        <h3 className="text-base font-display font-bold mb-1 line-clamp-1 group-hover:text-accent transition-colors">
          {prompt.title}
        </h3>

        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {prompt.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[8px] px-1.5 py-0.5 bg-ink/5 text-ink/40 rounded-full border border-ink/5">
                #{tag}
              </span>
            ))}
            {prompt.tags.length > 3 && (
              <span className="text-[8px] px-1.5 py-0.5 text-ink/20">
                +{prompt.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <p className="text-xs text-ink/40 line-clamp-2 mb-4 flex-1 leading-relaxed">
          <HighlightedPrompt content={prompt.content} />
        </p>

        {!isBulkMode && (
          <div className="flex items-center gap-2 mt-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(prompt.content, prompt.id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-ink/5 hover:bg-ink/10 border border-ink/10 rounded-lg text-xs font-medium transition-all active:scale-95"
            >
              <Copy size={14} />
              <span>{t.copyPrompt}</span>
            </button>
            {user && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(prompt);
                }}
                title={t.duplicate}
                className="p-2 bg-ink/5 hover:bg-ink/10 border border-ink/10 rounded-lg text-ink/40 hover:text-accent transition-all active:scale-95"
              >
                <CopyPlus size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default function App() {
  const [lang, setLang] = useState<'en' | 'ru'>('ru');
  const t = TRANSLATIONS[lang];
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState(['Outdoor', 'Studio', 'Interiors', 'People (GEO)', 'Verticals', 'Hands']);
  const [viewingPromptId, setViewingPromptId] = useState<string | null>(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [modalView, setModalView] = useState<'form' | 'link'>('form');
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [linkSelectedCategory, setLinkSelectedCategory] = useState('All');
  const [selectedLinkedPromptIds, setSelectedLinkedPromptIds] = useState<string[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical' | 'mostCopied'>('newest');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // Use a small threshold for better reliability
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  }, []);

  useEffect(() => {
    // Check multiple times to ensure layout has settled
    checkScroll();
    const timer = setTimeout(checkScroll, 100);
    const timer2 = setTimeout(checkScroll, 500);
    
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories, checkScroll, prompts]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  const closeModal = useCallback(() => {
    setViewingPromptId(null);
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
      if (selectedCategory === categoryName) setSelectedCategory('All');
    } catch (e) {
      console.error("Error deleting category:", e);
      toast.error("Failed to delete category");
    }
  }, [selectedCategory, t.deleteConfirm]);

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
      if (selectedCategory === oldName) setSelectedCategory(newName.trim());
      setRenamingCategory(null);
    } catch (e) {
      console.error("Error renaming category:", e);
      toast.error("Failed to rename category");
    }
  }, [selectedCategory]);

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
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'prompts');
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success(t.loginSuccess);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(t.loginFail);
    }
  };

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
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || (userProfile?.favoritePromptIds?.includes(p.id!) || false);
      const matchesType = selectedTypeFilter === 'all' || p.type === selectedTypeFilter;
      return matchesSearch && matchesCategory && matchesFavorites && matchesType;
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
  }, [prompts, searchQuery, selectedCategory, showFavoritesOnly, userProfile, selectedTypeFilter, sortBy]);

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
        setEditingPrompt(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsDirty(false);
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
      handleFirestoreError(error, editingPrompt ? OperationType.UPDATE : OperationType.CREATE, 'prompts');
      toast.error(t.saveFail);
    } finally {
      setIsUploading(false);
    }
  }, [user, selectedFile, selectedLinkedPromptIds, editingPrompt, closeModal, t]);

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
      handleFirestoreError(error, OperationType.DELETE, `prompts/${id}`);
      toast.error(t.saveFail);
    }
  }, [t.promptDeleted, t.saveFail]);

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
    if (promptId) {
      updateDoc(doc(db, 'prompts', promptId), { copyCount: increment(1) }).catch((error) => {
        console.error("Error incrementing copy count:", error);
      });
    }
  }, [viewingPrompt, placeholderValues, t.copySuccess]);

  const handleDuplicatePrompt = useCallback(async (prompt: Prompt) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'prompts'), {
        title: `${prompt.title} ${t.copySuffix}`,
        content: prompt.content,
        category: prompt.category || '',
        type: prompt.type,
        tags: prompt.tags || [],
        exampleUrl: prompt.exampleUrl || '',
        linkedPromptIds: prompt.linkedPromptIds || [],
        copyCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        authorUid: user.uid,
        authorName: userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Unknown'
      });
      toast.success(t.duplicateSuccess);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'prompts');
      toast.error(t.saveFail);
    }
  }, [user, userProfile, t.copySuffix, t.duplicateSuccess, t.saveFail]);

  const toggleBulkSelect = useCallback((id: string) => {
    setSelectedBulkIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  }, []);

  const exitBulkMode = useCallback(() => {
    setIsBulkMode(false);
    setSelectedBulkIds([]);
  }, []);

  const handleBulkDelete = useCallback(async () => {
    try {
      await Promise.all(selectedBulkIds.map(id => deleteDoc(doc(db, 'prompts', id))));
      toast.success(t.promptDeleted);
      setShowBulkDeleteConfirm(false);
      exitBulkMode();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'prompts');
      toast.error(t.saveFail);
    }
  }, [selectedBulkIds, exitBulkMode, t.promptDeleted, t.saveFail]);

  const handleBulkCategoryChange = useCallback(async (newCategory: string) => {
    if (!newCategory) return;
    try {
      await Promise.all(selectedBulkIds.map(id => updateDoc(doc(db, 'prompts', id), { category: newCategory })));
      toast.success(t.promptUpdated);
      exitBulkMode();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'prompts');
      toast.error(t.saveFail);
    }
  }, [selectedBulkIds, exitBulkMode, t.promptUpdated, t.saveFail]);

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
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-accent/30 relative overflow-x-hidden">
      <Toaster position="top-right" theme="dark" />
      
      {/* Background Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-bg to-surface-2" />
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-display font-bold text-accent-ink rotate-3">
              C
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight bg-gradient-to-r from-ink to-ink/60 bg-clip-text text-transparent">
              CREO <span className="text-accent">Prompt</span> Library
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-ink/5 rounded-full p-1 border border-ink/10">
              <button 
                onClick={() => setSelectedTypeFilter(selectedTypeFilter === 'image' ? 'all' : 'image')}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5",
                  selectedTypeFilter === 'image' ? "bg-chip-image text-chip-image-text shadow-lg shadow-chip-image-text/20" : "text-ink/40 hover:text-ink"
                )}
              >
                <ImageIcon size={12} />
                IMAGE
              </button>
              <button 
                onClick={() => setSelectedTypeFilter(selectedTypeFilter === 'video' ? 'all' : 'video')}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5",
                  selectedTypeFilter === 'video' ? "bg-chip-video text-chip-video-text shadow-lg shadow-chip-video-text/20" : "text-ink/40 hover:text-ink"
                )}
              >
                <Video size={12} />
                VIDEO
              </button>
            </div>

            <div className="flex items-center bg-ink/5 rounded-full p-1 border border-ink/10">
              <button 
                onClick={() => setLang('en')}
                className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold transition-all",
                  lang === 'en' ? "bg-ink text-bg" : "text-ink/40 hover:text-ink"
                )}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('ru')}
                className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold transition-all",
                  lang === 'ru' ? "bg-ink text-bg" : "text-ink/40 hover:text-ink"
                )}
              >
                RU
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    showFavoritesOnly ? "bg-danger/20 text-danger" : "hover:bg-ink/5 text-ink/60 hover:text-ink"
                  )}
                  title={t.favorites}
                >
                  <Heart size={20} fill={showFavoritesOnly ? "currentColor" : "none"} />
                </button>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium">{user.displayName}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-ink/5 rounded-full transition-colors text-ink/60 hover:text-ink"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-ink rounded-full font-bold hover:bg-accent-hover transition-all active:scale-95"
              >
                <LogIn size={18} />
                <span>{t.login}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="w-full py-8 relative z-10">
        {/* Controls */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={18} />
              <input 
                type="text" 
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-ink/5 border border-ink/10 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-1 flex items-center group/categories overflow-hidden">
                {canScrollLeft && (
                  <button 
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-0 bottom-0 z-20 px-3 text-ink/40 hover:text-ink transition-colors bg-gradient-to-r from-bg via-bg/95 to-transparent flex items-center"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                
                <div 
                  ref={scrollContainerRef}
                  onScroll={checkScroll}
                  className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-10"
                >
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
                      selectedCategory === 'All' 
                        ? "bg-accent text-accent-ink shadow-lg shadow-accent/20" 
                        : "bg-ink/5 text-ink/60 hover:bg-ink/10"
                    )}
                  >
                    {t.all}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
                        selectedCategory === cat 
                          ? "bg-accent text-accent-ink shadow-lg shadow-accent/20" 
                          : "bg-ink/5 text-ink/60 hover:bg-ink/10"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {canScrollRight && (
                  <button 
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-0 bottom-0 z-20 px-3 text-ink/40 hover:text-ink transition-colors bg-gradient-to-l from-bg via-bg/95 to-transparent flex items-center"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>

              {user && (
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="p-2 bg-ink/5 border border-ink/10 rounded-full text-ink/40 hover:text-accent hover:bg-ink/10 transition-all shrink-0"
                  title={t.manageCategories}
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>

            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none bg-ink/5 border border-ink/10 rounded-full pl-8 pr-4 py-2 text-xs font-medium text-ink/70 focus:outline-none focus:border-accent/50 hover:bg-ink/10 transition-all cursor-pointer"
              >
                <option value="newest" className="bg-surface">{t.sortNewest}</option>
                <option value="oldest" className="bg-surface">{t.sortOldest}</option>
                <option value="alphabetical" className="bg-surface">{t.sortAlphabetical}</option>
                <option value="mostCopied" className="bg-surface">{t.sortMostCopied}</option>
              </select>
              <ArrowUpDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30 pointer-events-none" />
            </div>

            <button
              onClick={handleExport}
              title={t.exportPrompts}
              className="p-2.5 bg-ink/5 border border-ink/10 rounded-full text-ink/40 hover:text-accent hover:bg-ink/10 transition-all shrink-0"
            >
              <Download size={18} />
            </button>

            {user && (
              <>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImportFile}
                />
                <button
                  onClick={() => importInputRef.current?.click()}
                  disabled={isImporting}
                  title={t.importPrompts}
                  className="p-2.5 bg-ink/5 border border-ink/10 rounded-full text-ink/40 hover:text-accent hover:bg-ink/10 transition-all shrink-0 disabled:opacity-50"
                >
                  {isImporting ? <Loader2 size={18} className="animate-spin" /> : <FileUp size={18} />}
                </button>

                <button
                  onClick={() => {
                    if (isBulkMode) exitBulkMode(); else setIsBulkMode(true);
                  }}
                  title={t.selectMode}
                  className={cn(
                    "p-2.5 rounded-full border transition-all shrink-0",
                    isBulkMode ? "bg-accent border-accent text-accent-ink" : "bg-ink/5 border-ink/10 text-ink/40 hover:text-accent hover:bg-ink/10"
                  )}
                >
                  <CheckSquare size={18} />
                </button>
              </>
            )}

            <div className="flex items-center gap-2 border-l border-ink/10 pl-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-lg", viewMode === 'grid' ? "bg-ink/10 text-ink" : "text-ink/40")}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn("p-2 rounded-lg", viewMode === 'list' ? "bg-ink/10 text-ink" : "text-ink/40")}
              >
                <ListIcon size={20} />
              </button>
            </div>

            {user && (
              <button
                onClick={() => {
                  setEditingPrompt(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-accent text-accent-ink rounded-xl font-bold hover:bg-accent-hover transition-all active:scale-95 shadow-lg shadow-accent/20 whitespace-nowrap"
              >
                <Plus size={20} />
                <span>{t.addPrompt}</span>
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-full px-[10%]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + showFavoritesOnly + searchQuery + selectedTypeFilter + sortBy}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className={cn(
                "grid gap-6 relative",
                viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"
              )}
            >
              {filteredPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  viewMode={viewMode}
                  user={user}
                  userProfile={userProfile}
                  toggleFavorite={toggleFavorite}
                  setViewingPromptId={setViewingPromptId}
                  copyToClipboard={copyToClipboard}
                  onDuplicate={handleDuplicatePrompt}
                  isBulkMode={isBulkMode}
                  isSelected={selectedBulkIds.includes(prompt.id!)}
                  onToggleSelect={toggleBulkSelect}
                  t={t}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-ink/5 rounded-full mb-4 text-ink/20">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t.noPrompts}</h3>
            <p className="text-ink/40">{t.noPromptsSub}</p>
          </div>
        )}
      </main>

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
              onClick={() => {
                if (isDirty) {
                  setShowUnsavedConfirm(true);
                } else {
                  closeModal();
                }
              }}
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
                {modalView === 'link' ? (
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
                        onClick={closeModal}
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
                ) : (
                  <>
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
                          <div className="flex items-center gap-2">
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
                    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar">
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
                                  onClick={() => setViewingPromptId(linked.id!)}
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
                            disabled={isUploading}
                            className="flex-[2] py-3.5 bg-accent text-accent-ink rounded-2xl font-bold hover:bg-accent-hover transition-all active:scale-95 shadow-xl shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isUploading && <Loader2 className="animate-spin" size={18} />}
                            {isUploading ? t.uploading : (editingPrompt ? t.update : t.createPrompt)}
                          </button>

                          <button 
                            type="button"
                            onClick={() => {
                              if (isDirty) {
                                setShowUnsavedConfirm(true);
                              } else if (editingPrompt) {
                                setEditingPrompt(null);
                              } else {
                                closeModal();
                              }
                            }}
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
                          
                          {user && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingPrompt(viewingPrompt);
                              }}
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
              </>
            )}

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
                          <p className="text-ink/40 text-sm mb-8">This action cannot be undone. The prompt will be permanently removed.</p>
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
                                  setShowDeleteConfirm(false);
                                  setEditingPrompt(null);
                                  setViewingPromptId(null);
                                  setIsModalOpen(false);
                                }
                              }}
                              className="flex-1 py-3 bg-danger text-ink rounded-xl font-bold hover:bg-danger-hover transition-all shadow-lg shadow-danger/20"
                            >
                              Delete
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
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-2 border border-ink/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-chip-image/10 text-chip-image-text rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.unsavedChanges}</h3>
              <p className="text-ink/40 text-sm mb-8">{t.unsavedChangesSub}</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    const form = document.getElementById('prompt-form') as HTMLFormElement;
                    if (form) form.requestSubmit();
                  }}
                  className="w-full py-3 bg-accent text-accent-ink rounded-xl font-bold hover:bg-accent-hover transition-all"
                >
                  {t.apply}
                </button>
                <button 
                  onClick={closeModal}
                  className="w-full py-3 bg-ink/5 hover:bg-ink/10 rounded-xl font-bold transition-all text-ink/60"
                >
                  {t.discard}
                </button>
                <button 
                  onClick={() => setShowUnsavedConfirm(false)}
                  className="w-full py-3 bg-transparent hover:bg-ink/5 rounded-xl font-medium transition-all text-ink/40"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-ink/10 mt-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
    </div>
  );
}

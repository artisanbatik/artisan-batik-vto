/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import StartScreen from './components/StartScreen';
import Canvas from './components/Canvas';
import WardrobeModal, { CategorizeGarmentModal, EditGarmentModal, TextureSelectionModal } from './components/WardrobeSheet';
import OutfitStack from './components/OutfitStack';
import SavedOutfitsPanel from './components/AdjustmentPanel';
import { generateVirtualTryOnImage, generatePoseVariation, generateProductInformation, generateLookbookImages, regenerateLookbookImage, SHOT_TYPES } from './services/geminiService';
import { OutfitLayer, WardrobeItem, SavedOutfit, WardrobeCategory, CustomModel, ProductInfoHistoryItem, LookbookImage, SavedLookbook } from './types';
import { ChevronDownIcon, ChevronUpIcon, XIcon, DownloadIcon, PencilIcon, PlusCircleIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, FileTextIcon, CheckCircleIcon, SlidersIcon, ClockIcon, PackageIcon, LibraryIcon, BookOpenIcon, WandSparklesIcon } from './components/icons';
import { defaultWardrobe } from './wardrobe';
import Footer from './components/Footer';
import { getFriendlyErrorMessage, urlToFile, cn, appDB, dataUrlToBlob, resizeImage } from './lib/utils';
import Spinner from './components/Spinner';
import ConfirmationDialog from './components/AddProductModal';
import FilterPanel from './components/FilterPanel';
import HistoryPanel from './components/HistoryPanel';
import LookbookStyleModal from './components/lookbook/LookbookStyleModal';
import LookbookModal from './components/lookbook/LookbookModal';
import SavedLookbooksPanel from './components/SavedLookbooksPanel';


const POSE_INSTRUCTIONS = [
  "Tampak depan, tangan di pinggul",
  "Sedikit berputar, tampak 3/4",
  "Tampak dari samping",
  "Berjalan ke arah kamera",
  "Bersandar di dinding",
  "Lengan bersedekap, sikap percaya diri",
  "Tangan di saku, sikap santai",
  "Duduk di bangku",
  "Duduk bersila di lantai",
  "Melompat di udara, foto aksi",
  "Menari dengan tangan terentang",
  "Berjongkok, melihat ke atas",
  "Berbaring di lantai, dilihat dari atas",
];

// Type used for storing model metadata in localStorage, omitting the large data URL
type StoredCustomModel = Omit<CustomModel, 'imageUrl'>;

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQueryList.addEventListener('change', listener);
    
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches);
    }

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query, matches]);

  return matches;
};

// --- Bottom Sheet Component for Mobile ---
interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, children }) => {
    const controls = useAnimation();
    const [currentSnap, setCurrentSnap] = useState<'hidden' | 'visible' | 'expanded'>('hidden');

    const [height, setHeight] = useState(0);
    useEffect(() => {
        setHeight(window.innerHeight);
        const handleResize = () => setHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const variants = useMemo(() => ({
        hidden: { y: height },
        visible: { y: height * 0.6 }, // 40% visible
        expanded: { y: height * 0.1 }, // 90% visible
    }), [height]);

    useEffect(() => {
        if (isOpen) {
            controls.start('visible');
            setCurrentSnap('visible');
        } else {
            controls.start('hidden');
            setCurrentSnap('hidden');
        }
    }, [isOpen, controls]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number; }; velocity: { x: number; y: number; }; }) => {
        const { offset, velocity } = info;
        const dragThreshold = 50;
        const velocityThreshold = 500;

        if (velocity.y > velocityThreshold || offset.y > dragThreshold) { // Swiped down
            if (currentSnap === 'expanded') {
                controls.start('visible');
                setCurrentSnap('visible');
            } else {
                controls.start('hidden').then(onClose);
                setCurrentSnap('hidden');
            }
        } else if (velocity.y < -velocityThreshold || offset.y < -dragThreshold) { // Swiped up
            controls.start('expanded');
            setCurrentSnap('expanded');
        } else {
            // Snap back to the current position if not dragged enough
            controls.start(currentSnap);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        drag="y"
                        onDragEnd={handleDragEnd}
                        initial="hidden"
                        animate={controls}
                        transition={{ type: "spring", damping: 40, stiffness: 400 }}
                        variants={variants}
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        className="fixed bottom-0 left-0 right-0 h-full bg-stone-100 dark:bg-stone-950 rounded-t-2xl z-50 flex flex-col"
                    >
                        <div className="absolute top-0 left-0 right-0 h-8 flex justify-center items-center cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                        </div>
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// --- Product Info Modal Component ---
interface ProductInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  productInfoMarkdown: string | null;
  error: string | null;
  onRegenerate: () => void;
}

interface ParsedProductInfo {
    title: string | null;
    shortDescription: string | null;
    longDescription: string | null;
    details: { attribute: string; value: string }[];
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({ isOpen, onClose, isLoading, productInfoMarkdown, error, onRegenerate }) => {
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

    const parsedInfo = useMemo<ParsedProductInfo | null>(() => {
        if (!productInfoMarkdown) return null;
        try {
            const sections = productInfoMarkdown.split('### ').filter(s => s.trim());
            const parsed: ParsedProductInfo = {
                title: null,
                shortDescription: null,
                longDescription: null,
                details: [],
            };

            sections.forEach(section => {
                const lines = section.split('\n').filter(l => l.trim());
                const title = lines[0]?.trim();
                const content = lines.slice(1).join('\n').replace(/```/g, '').trim();

                if (title === 'Nama Produk') parsed.title = content;
                else if (title === 'Deskripsi Singkat') parsed.shortDescription = content;
                else if (title === 'Deskripsi Lengkap') {
                    parsed.longDescription = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                }
                else if (title === 'Detail Produk') {
                    const tableLines = content.split('\n').slice(2); // Skip header and separator
                    parsed.details = tableLines.map(line => {
                        const [attribute, value] = line.split('|').slice(1).map(s => s.trim().replace(/\*\*/g, ''));
                        return { attribute, value };
                    }).filter(item => item.attribute && item.value);
                }
            });
            return parsed;
        } catch (e) {
            console.error("Failed to parse markdown", e);
            return null; // Return null if parsing fails
        }
    }, [productInfoMarkdown]);
    
    const handleCopy = (text: string | null, key: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
    };

    const copyAll = () => {
        if (!productInfoMarkdown) return;
        navigator.clipboard.writeText(productInfoMarkdown);
        setCopiedStates({ all: true });
        setTimeout(() => setCopiedStates({ all: false }), 2000);
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-stone-50 dark:bg-stone-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800">
                            <h2 className="text-2xl font-serif tracking-wider text-stone-800 dark:text-stone-200">Informasi Produk</h2>
                            <button onClick={onClose} className="p-1 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800" aria-label="Tutup">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 flex-grow overflow-y-auto space-y-6">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-full min-h-64">
                                  <Spinner />
                                  <p className="text-lg font-serif text-stone-700 dark:text-stone-300 mt-4">Membuat info produk...</p>
                                </div>
                            )}
                            {error && !isLoading && (
                                <div className="text-center min-h-64 flex flex-col items-center justify-center">
                                    <p className="text-lg font-semibold text-red-600">Gagal Membuat</p>
                                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 max-w-md mx-auto">{error}</p>
                                </div>
                            )}
                            {!isLoading && !error && !productInfoMarkdown && (
                                <div className="flex flex-col items-center justify-center h-full min-h-64 text-center">
                                    <FileTextIcon className="w-16 h-16 text-stone-400 dark:text-stone-600 mb-4" />
                                    <h3 className="text-xl font-serif text-stone-800 dark:text-stone-200">Siap Membuat Informasi Produk?</h3>
                                    <p className="text-stone-600 dark:text-stone-400 mt-2 max-w-sm">
                                        Buat nama produk yang menarik, deskripsi, dan detail untuk koleksi Anda saat ini.
                                    </p>
                                    <button
                                        onClick={onRegenerate}
                                        className="mt-6 flex items-center gap-2 px-5 py-2.5 font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-md hover:bg-stone-700 dark:hover:bg-stone-300"
                                    >
                                        <WandSparklesIcon className="w-5 h-5" />
                                        Buat Sekarang
                                    </button>
                                </div>
                            )}
                            {parsedInfo && !isLoading && !error && (
                                <>
                                    {parsedInfo.title && (
                                        <div className="p-4 bg-white dark:bg-stone-800 rounded-lg border dark:border-stone-700">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-stone-600 dark:text-stone-400 text-sm">Nama Produk</h3>
                                                    <p className="text-xl font-serif text-stone-900 dark:text-stone-100 mt-1">{parsedInfo.title}</p>
                                                </div>
                                                <button onClick={() => handleCopy(parsedInfo.title, 'title')} className="text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">{copiedStates['title'] ? 'Disalin!' : 'Salin'}</button>
                                            </div>
                                        </div>
                                    )}

                                    {parsedInfo.shortDescription && (
                                        <div className="p-4 bg-white dark:bg-stone-800 rounded-lg border dark:border-stone-700">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-stone-600 dark:text-stone-400 text-sm">Deskripsi Singkat</h3>
                                                    <p className="text-stone-700 dark:text-stone-300 mt-1">{parsedInfo.shortDescription}</p>
                                                </div>
                                                <button onClick={() => handleCopy(parsedInfo.shortDescription, 'short')} className="text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex-shrink-0 ml-4">{copiedStates['short'] ? 'Disalin!' : 'Salin'}</button>
                                            </div>
                                        </div>
                                    )}

                                    {parsedInfo.longDescription && (
                                        <div className="p-4 bg-white dark:bg-stone-800 rounded-lg border dark:border-stone-700">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-stone-600 dark:text-stone-400 text-sm">Deskripsi Lengkap</h3>
                                                    <div className="prose prose-sm max-w-none text-stone-700 dark:text-stone-300 mt-2" dangerouslySetInnerHTML={{ __html: parsedInfo.longDescription.replace(/\n/g, '<br />') }} />
                                                </div>
                                                <button onClick={() => handleCopy(parsedInfo.longDescription, 'long')} className="text-sm font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex-shrink-0 ml-4">{copiedStates['long'] ? 'Disalin!' : 'Salin'}</button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {parsedInfo.details.length > 0 && (
                                        <div className="p-4 bg-white dark:bg-stone-800 rounded-lg border dark:border-stone-700">
                                            <h3 className="font-semibold text-stone-600 dark:text-stone-400 text-sm mb-3">Detail Produk</h3>
                                            <table className="w-full text-sm">
                                                <tbody>
                                                    {parsedInfo.details.map((detail, index) => (
                                                        <tr key={index} className="border-b last:border-b-0 dark:border-stone-700">
                                                            <td className="py-2 pr-4 font-semibold text-stone-800 dark:text-stone-200 w-1/3">{detail.attribute}</td>
                                                            <td className="py-2 text-stone-700 dark:text-stone-300">{detail.value}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="flex justify-between items-center p-4 border-t border-stone-200 dark:border-stone-800">
                            <div>
                                {(productInfoMarkdown || error) && (
                                    <button
                                        onClick={onRegenerate}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-700 rounded-md hover:bg-stone-300 dark:hover:bg-stone-600 disabled:opacity-50"
                                    >
                                        <WandSparklesIcon className="w-4 h-4" />
                                        Buat Ulang
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-200 dark:bg-stone-700 rounded-md hover:bg-stone-300 dark:hover:bg-stone-600">Tutup</button>
                                {!isLoading && !error && productInfoMarkdown && (
                                    <button onClick={copyAll} className="px-5 py-2 font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-md hover:bg-stone-700 dark:hover:bg-stone-300">
                                        {copiedStates['all'] ? 'Disalin Semua!' : 'Salin Semua Teks'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// --- Main App Component ---
const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('theme');
      if (typeof storedPrefs === 'string') {
        return storedPrefs as 'light' | 'dark';
      }
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }
    return 'light';
  });
  
  const [activeScreen, setActiveScreen] = useState<'start' | 'dressing'>('start');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // History and Undo/Redo
  const [history, setHistory] = useState<OutfitLayer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const currentOutfit = history[currentIndex];
  const activeOutfitLayers = history.slice(0, currentIndex + 1);

  // Wardrobe and Modals
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [isTextureModalOpen, setIsTextureModalOpen] = useState(false);
  const [isCategorizeModalOpen, setIsCategorizeModalOpen] = useState(false);
  const [garmentToCategorize, setGarmentToCategorize] = useState<File | null>(null);
  const [isEditGarmentModalOpen, setIsEditGarmentModalOpen] = useState(false);
  const [garmentToEdit, setGarmentToEdit] = useState<WardrobeItem | null>(null);
  const [garmentForTexture, setGarmentForTexture] = useState<WardrobeItem | null>(null);
  const [fileForTexture, setFileForTexture] = useState<File | null>(null);
  const [customWardrobe, setCustomWardrobe] = useState<WardrobeItem[]>([]);
  const [deletingGarment, setDeletingGarment] = useState<WardrobeItem | null>(null);

  // Saved Outfits
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  
  // Custom Models
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);
  
  // Product Info
  const [isProductInfoModalOpen, setIsProductInfoModalOpen] = useState(false);
  const [isProductInfoLoading, setIsProductInfoLoading] = useState(false);
  const [productInfoMarkdown, setProductInfoMarkdown] = useState<string | null>(null);
  const [productInfoError, setProductInfoError] = useState<string | null>(null);
  const [productInfoHistory, setProductInfoHistory] = useState<ProductInfoHistoryItem[]>([]);
  const [productInfoForOutfitKey, setProductInfoForOutfitKey] = useState<string | null>(null);

  // Lookbook
  const [savedLookbooks, setSavedLookbooks] = useState<SavedLookbook[]>([]);
  const [isLookbookStyleModalOpen, setIsLookbookStyleModalOpen] = useState(false);
  const [isLookbookModalOpen, setIsLookbookModalOpen] = useState(false);
  const [lookbookImages, setLookbookImages] = useState<LookbookImage[]>([]);
  const [lookbookStyle, setLookbookStyle] = useState<string>('');
  const [lookbookAspectRatio, setLookbookAspectRatio] = useState<string>('3:4');
  const [isLookbookLoading, setIsLookbookLoading] = useState(false);
  const [lookbookError, setLookbookError] = useState<string | null>(null);
  const [regeneratingImageId, setRegeneratingImageId] = useState<string | null>(null);
  const [isLookbookSaved, setIsLookbookSaved] = useState(false);


  // Filters
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 });

  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(!isMobile);
  const [activeRightPanelTab, setActiveRightPanelTab] = useState<'outfit' | 'saved' | 'lookbooks' | 'history' | 'adjust'>('outfit');
  
  const wardrobe = useMemo(() => [...defaultWardrobe, ...customWardrobe], [customWardrobe]);
  
  // --- Theme Management ---
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
    const refreshCustomModels = useCallback(async () => {
        try {
            const modelsMeta = await appDB.getAll('customModels');

            const loadedModels = await Promise.all(
                modelsMeta.map(async (meta) => {
                    const imageBlob = await appDB.getImage(meta.id);
                    if (imageBlob) {
                        return {
                            ...meta,
                            imageUrl: URL.createObjectURL(imageBlob),
                        };
                    }
                    console.warn(`Gambar untuk model ${meta.name} (ID: ${meta.id}) tidak ditemukan di penyimpanan.`);
                    return null;
                })
            );

            setCustomModels(prevModels => {
                // Revoke URLs from the previous state before setting the new state
                prevModels.forEach(model => {
                    if (model.imageUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(model.imageUrl);
                    }
                });
                // Return the new state
                return loadedModels.filter((m): m is CustomModel => m !== null);
            });

        } catch (e) {
            console.error("Gagal memuat ulang model kustom:", e);
            setLoadingError("Tidak dapat memuat ulang model kustom Anda.");
        }
    }, []);
  
  // --- Effects for loading from IndexedDB ---
  useEffect(() => {
      const loadData = async () => {
          try {
              await appDB.init();

              // Load all data types from IndexedDB
              const [outfits, wardrobeItems, productInfo, lookbooks] = await Promise.all([
                  appDB.getAll('savedOutfits'),
                  appDB.getAll('wardrobe'),
                  appDB.getAll('productInfoHistory'),
                  appDB.getAll('savedLookbooks'),
              ]);
              
              setSavedOutfits(outfits);
              setCustomWardrobe(wardrobeItems);
              setProductInfoHistory(productInfo.sort((a,b) => b.timestamp - a.timestamp)); // Sort by newest first
              setSavedLookbooks(lookbooks.sort((a, b) => (b.id > a.id ? 1 : -1)));

              await refreshCustomModels();

          } catch (e) {
              console.error("Gagal memuat data dari IndexedDB:", e);
              setLoadingError("Tidak dapat memuat data yang disimpan. Mode penjelajahan pribadi mungkin menjadi penyebabnya.");
          }
      };

      loadData();
  }, [refreshCustomModels]);

  // --- History Management ---
  const updateHistory = (newLayer: OutfitLayer) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newLayer);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setCurrentPoseIndex(0); // Reset to default pose when a new garment is added
  };

  const handleUndo = () => {
    if (!canUndo) return;
    const lastLayer = history[currentIndex];
    
    // Check if we are removing a custom garment and if it exists in the custom wardrobe
    if (lastLayer.garment?.id.startsWith('temp-')) {
        setCustomWardrobe(prev => prev.filter(item => item.id !== lastLayer.garment?.id));
    }
    
    setCurrentIndex(currentIndex - 1);
    setCurrentPoseIndex(0); // Reset pose on undo
  };

  const handleRedo = () => {
    if (canRedo) {
        setCurrentIndex(currentIndex + 1);
        setCurrentPoseIndex(0); // Reset pose on redo
    }
  };
  
  const handleJumpToState = (index: number) => {
    if (index >= 0 && index < history.length) {
        setCurrentIndex(index);
        setCurrentPoseIndex(0); // Reset pose on jump
    }
  };
  
  // --- Core VTO Logic ---
  const handleGenerateVTO = useCallback(async (garmentFile: File, garmentInfo: WardrobeItem, texture: string) => {
    if (!currentOutfit) return;
    
    setIsLoading(true);
    setLoadingMessage('Menerapkan karya batik...');
    setLoadingError(null);
    const baseImageUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];

    try {
      const newImageUrl = await generateVirtualTryOnImage(baseImageUrl, garmentFile, garmentInfo, texture);
      
      const newLayer: OutfitLayer = {
        garment: garmentInfo,
        texture,
        poseImages: { [POSE_INSTRUCTIONS[0]]: newImageUrl },
      };
      
      updateHistory(newLayer);

    } catch (err) {
      console.error("VTO generation failed:", err);
      setLoadingError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), 'Gagal membuat karya'));
      // Revert to previous state on failure
      setCurrentIndex(prev => Math.max(0, prev - 1));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [currentOutfit, currentIndex, history]);
  
  // --- Pose Generation ---
  const handleSelectPose = useCallback(async (index: number) => {
      const poseInstruction = POSE_INSTRUCTIONS[index];
      
      if (currentOutfit?.poseImages[poseInstruction]) {
          setCurrentPoseIndex(index);
          return;
      }
      
      if (!currentOutfit || isLoading) {
          return;
      }
      
      setIsLoading(true);
      setLoadingMessage(`Membuat pose: ${poseInstruction}`);
      setLoadingError(null);
      const baseImageUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];

      try {
          const newImageUrl = await generatePoseVariation(baseImageUrl, poseInstruction, activeOutfitLayers);
          
          setHistory(prevHistory => {
              const newHistory = [...prevHistory];
              const updatedLayer = { ...newHistory[currentIndex] };
              updatedLayer.poseImages = { ...updatedLayer.poseImages, [poseInstruction]: newImageUrl };
              newHistory[currentIndex] = updatedLayer;
              return newHistory;
          });
          setCurrentPoseIndex(index);
      } catch (err) {
          console.error("Pose generation failed:", err);
          setLoadingError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), `Gagal membuat pose: ${poseInstruction}`));
      } finally {
          setIsLoading(false);
          setLoadingMessage('');
      }
  }, [currentOutfit, isLoading, currentIndex, activeOutfitLayers]);

  const handleGenerateCommonPoses = useCallback(async () => {
    if (!currentOutfit || isLoading) return;
    
    const posesToGenerate = ["Sedikit berputar, tampak 3/4", "Tampak dari samping", "Berjalan ke arah kamera"];
    const baseImageUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
    const currentPoseKeys = Object.keys(currentOutfit.poseImages);

    const posePromises = posesToGenerate.map(async (pose) => {
        if (currentPoseKeys.includes(pose)) return;
        
        try {
            setLoadingMessage(`Membuat pose: ${pose}`);
            const newImageUrl = await generatePoseVariation(baseImageUrl, pose, activeOutfitLayers);
            return { pose, url: newImageUrl };
        } catch (err) {
            console.error(`Gagal membuat pose ${pose}:`, err);
            // Propagate the error to be caught by Promise.all
            throw err; 
        }
    });

    setIsLoading(true);
    try {
        const results = await Promise.all(posePromises);
        
        setHistory(prevHistory => {
            const newHistory = [...prevHistory];
            const updatedLayer = { ...newHistory[currentIndex] };
            results.forEach(result => {
                if (result) {
                    updatedLayer.poseImages[result.pose] = result.url;
                }
            });
            newHistory[currentIndex] = updatedLayer;
            return newHistory;
        });

    } catch (err) {
        console.error("Gagal membuat pose umum:", err);
        setLoadingError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), `Gagal membuat pose umum`));
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [currentOutfit, isLoading, currentIndex, activeOutfitLayers]);

  // --- Wardrobe & Outfit Management ---
  const handleGarmentSelect = (garmentFile: File, garmentInfo: WardrobeItem) => {
    setIsWardrobeOpen(false);
    
    // Garments that can have textures need the texture modal
    if (['top', 'bottom', 'outerwear', 'dress'].includes(garmentInfo.category)) {
      setGarmentForTexture(garmentInfo);
      setFileForTexture(garmentFile);
      setIsTextureModalOpen(true);
    } else {
      // Accessories are applied directly without texture choice
      handleGenerateVTO(garmentFile, garmentInfo, 'default'); 
    }
  };
  
  const handleTextureConfirm = (texture: string) => {
    setIsTextureModalOpen(false);
    if (fileForTexture && garmentForTexture) {
      handleGenerateVTO(fileForTexture, garmentForTexture, texture);
    }
    setFileForTexture(null);
    setGarmentForTexture(null);
  };
  
  const handleFileUpload = (file: File) => {
    setGarmentToCategorize(file);
    setIsCategorizeModalOpen(true);
    setIsWardrobeOpen(false);
  };
  
  const handleCategorizeConfirm = async (category: WardrobeCategory) => {
    setIsCategorizeModalOpen(false);
    if (garmentToCategorize) {
      const newGarment: WardrobeItem = {
        id: `custom-${Date.now()}`,
        name: garmentToCategorize.name.split('.').slice(0, -1).join('.') || 'Karya Unggahan',
        url: URL.createObjectURL(garmentToCategorize),
        category,
      };
      await appDB.saveItem('wardrobe', newGarment);
      setCustomWardrobe(prev => [...prev, newGarment]);
      
      // After adding, select it
      handleGarmentSelect(garmentToCategorize, newGarment);
    }
    setGarmentToCategorize(null);
  };
  
  const handleEditGarment = (garment: WardrobeItem) => {
      setGarmentToEdit(garment);
      setIsEditGarmentModalOpen(true);
      setIsWardrobeOpen(false);
  };

  const handleSaveGarmentEdit = async (updatedGarment: WardrobeItem) => {
    await appDB.saveItem('wardrobe', updatedGarment);
    setCustomWardrobe(prev => prev.map(item => item.id === updatedGarment.id ? updatedGarment : item));
    setIsEditGarmentModalOpen(false);
    setGarmentToEdit(null);
    setIsWardrobeOpen(true);
  };
  
  const handleDeleteGarment = (garmentToDelete: WardrobeItem) => {
      setDeletingGarment(garmentToDelete);
      setIsEditGarmentModalOpen(false); // Close edit modal if it was open
      setIsWardrobeOpen(false);
  };

  const handleConfirmDeleteGarment = async () => {
      if (deletingGarment) {
        await appDB.deleteItem('wardrobe', deletingGarment.id);
        setCustomWardrobe(prev => prev.filter(item => item.id !== deletingGarment.id));
      }
      setDeletingGarment(null);
      setIsWardrobeOpen(true);
  };

  const handleStartOver = () => {
    setHistory(history.slice(0, 1));
    setCurrentIndex(0);
    setCurrentPoseIndex(0);
    setActiveScreen('start');
    setFilters({ brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 });
  };
  
  const handleSaveOutfit = async () => {
    if (activeOutfitLayers.length <= 1) return;
    try {
        const thumbnailUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
        const resizedThumbnailUrl = await resizeImage(thumbnailUrl, 200, 267); // Approx 3:4 ratio

        const name = `Koleksi ${new Date().toLocaleString()}`;
        const newSavedOutfit: SavedOutfit = {
            id: `outfit-${Date.now()}`,
            name,
            thumbnailUrl: resizedThumbnailUrl,
            layers: activeOutfitLayers.slice(1).map(layer => ({
                garmentId: layer.garment!.id,
                texture: layer.texture,
            })),
            poseInstruction: POSE_INSTRUCTIONS[0],
        };
        await appDB.saveItem('savedOutfits', newSavedOutfit);
        setSavedOutfits(prev => [...prev, newSavedOutfit]);
        setActiveRightPanelTab('saved');
    } catch (error) {
        console.error("Gagal menyimpan koleksi:", error);
        setLoadingError("Gagal menyimpan koleksi karena tidak dapat memproses gambar mini.");
    }
  };

  const handleLoadOutfit = (outfitToLoad: SavedOutfit) => {
    const baseLayer = history[0];
    if (!baseLayer) {
        console.error("Tidak dapat memuat koleksi, lapisan dasar tidak ditemukan.");
        return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Memuat koleksi...');
    setLoadingError(null);

    const loadLayers = async () => {
        let currentHistory = [baseLayer];
        let currentAppliedLayers = 1;

        for (const layerInfo of outfitToLoad.layers) {
            const garment = wardrobe.find(g => g.id === layerInfo.garmentId);
            if (!garment) {
                console.warn(`Garmen dengan ID ${layerInfo.garmentId} tidak ditemukan di koleksi.`);
                continue;
            }
            
            try {
                setLoadingMessage(`Menerapkan ${garment.name}...`);
                const garmentFile = await urlToFile(garment.url, garment.name);
                const baseImageUrl = currentHistory[currentHistory.length - 1].poseImages[POSE_INSTRUCTIONS[0]];
                
                const newImageUrl = await generateVirtualTryOnImage(baseImageUrl, garmentFile, garment, layerInfo.texture);
                const newLayer: OutfitLayer = {
                    garment,
                    texture: layerInfo.texture,
                    poseImages: { [POSE_INSTRUCTIONS[0]]: newImageUrl },
                };
                currentHistory.push(newLayer);
                currentAppliedLayers++;
            } catch (err) {
                console.error(`Gagal memuat lapisan ${garment.name}:`, err);
                setLoadingError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), `Gagal memuat ${garment.name}`));
                // Stop loading further layers on error
                break;
            }
        }
        
        setHistory(currentHistory);
        setCurrentIndex(currentAppliedLayers - 1);
        setCurrentPoseIndex(0);
    };

    loadLayers().finally(() => {
        setIsLoading(false);
        setLoadingMessage('');
    });
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    await appDB.deleteItem('savedOutfits', outfitId);
    setSavedOutfits(prev => prev.filter(o => o.id !== outfitId));
  };

  const handleRenameOutfit = async (outfitId: string, newName: string) => {
    const outfitToUpdate = await appDB.getItem('savedOutfits', outfitId);
    if (outfitToUpdate) {
        const updatedOutfit = { ...outfitToUpdate, name: newName };
        await appDB.saveItem('savedOutfits', updatedOutfit);
        setSavedOutfits(prev => prev.map(o => o.id === outfitId ? updatedOutfit : o));
    }
  };
  
  // --- Custom Model Management ---
  const handleAddModel = async (modelUrl: string, aspectRatio: string) => {
      const name = `Model ${customModels.length + 1}`;
      const newModel: CustomModel = {
          id: `model-${Date.now()}`,
          name: name,
          imageUrl: modelUrl, // This is a temporary data URL
          aspectRatio,
      };

      try {
          const imageBlob = await dataUrlToBlob(modelUrl);
          // Save metadata and image to IndexedDB
          const modelMetadata: StoredCustomModel = { id: newModel.id, name: newModel.name, aspectRatio: newModel.aspectRatio };
          await appDB.saveItem('customModels', modelMetadata);
          await appDB.saveImage(newModel.id, imageBlob);

          const blobUrl = URL.createObjectURL(imageBlob);
          const modelForState: CustomModel = { ...newModel, imageUrl: blobUrl };

          setCustomModels(prev => [...prev, modelForState]);
          handleSelectModel(modelForState);
      } catch (error) {
          console.error("Gagal menyimpan model baru:", error);
          setLoadingError(getFriendlyErrorMessage(error instanceof Error ? error.message : String(error), "Gagal menyimpan model baru"));
      }
  };
  
  const handleSelectModel = (model: CustomModel) => {
      const baseLayer: OutfitLayer = {
          garment: null,
          poseImages: { [POSE_INSTRUCTIONS[0]]: model.imageUrl }
      };
      setHistory([baseLayer]);
      setCurrentIndex(0);
      setCurrentPoseIndex(0);
      setActiveScreen('dressing');
  };

  const handleDeleteModel = async (modelId: string) => {
      try {
          await appDB.deleteItem('customModels', modelId);
          await appDB.deleteImage(modelId);
          setCustomModels(prev => prev.filter(m => m.id !== modelId));
      } catch (error) {
          console.error("Gagal menghapus model:", error);
          setLoadingError("Gagal menghapus model.");
      }
  };

  const handleRenameModel = async (modelId: string, newName: string) => {
      const modelToUpdate = await appDB.getItem('customModels', modelId);
      if(modelToUpdate) {
        const updatedModel = { ...modelToUpdate, name: newName };
        await appDB.saveItem('customModels', updatedModel);
        setCustomModels(prev => prev.map(m => m.id === modelId ? { ...m, name: newName } : m));
      }
  };
  
    const getOutfitKey = (layers: OutfitLayer[]): string => {
        return layers
            .slice(1) // Skip base model
            .map(l => `${l.garment?.id ?? 'none'}:${l.texture ?? 'default'}`)
            .join('|');
    };

    // --- Product Info Logic ---
    const handleGenerateProductInfo = async (forceRegenerate = false) => {
      if (activeOutfitLayers.length <= 1) return;
  
      const currentOutfitKey = getOutfitKey(activeOutfitLayers);
  
      // If forcing regeneration, go straight to the generation logic.
      // This is called by "Regenerate" or the initial "Generate" button in the modal.
      if (forceRegenerate) {
          setIsProductInfoModalOpen(true);
          setIsProductInfoLoading(true);
          setProductInfoError(null);
          setProductInfoMarkdown(null);
  
          const baseImageUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
  
          try {
              const markdown = await generateProductInformation(baseImageUrl, activeOutfitLayers);
              setProductInfoMarkdown(markdown);
              setProductInfoForOutfitKey(currentOutfitKey);
              
              const resizedThumbnailUrl = await resizeImage(baseImageUrl, 200, 267);
  
              const newInfo: ProductInfoHistoryItem = {
                  id: `prodinfo-${Date.now()}`,
                  timestamp: Date.now(),
                  info: markdown,
                  thumbnailUrl: resizedThumbnailUrl,
                  title: markdown.split('\n')[2]?.replace(/`/g, '').trim() || `Produk ${new Date().toLocaleTimeString()}`,
                  outfitKey: currentOutfitKey,
              };
              await appDB.saveItem('productInfoHistory', newInfo);
              setProductInfoHistory(prev => [newInfo, ...prev].sort((a, b) => b.timestamp - a.timestamp));
  
          } catch (err) {
              console.error("Gagal membuat info produk:", err);
              setProductInfoError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), 'Gagal membuat info produk.'));
          } finally {
              setIsProductInfoLoading(false);
          }
          return;
      }
  
      // This path is for the main "Info Produk" button click. It only checks caches.
      // Check state cache first.
      if (productInfoMarkdown && productInfoForOutfitKey === currentOutfitKey) {
        setIsProductInfoModalOpen(true);
        return;
      }
  
      // If not in state cache, check the persistent history from IndexedDB.
      const existingInfo = productInfoHistory.find(item => item.outfitKey === currentOutfitKey);
      if (existingInfo) {
          setProductInfoMarkdown(existingInfo.info);
          setProductInfoForOutfitKey(existingInfo.outfitKey);
          setProductInfoError(null);
          setIsProductInfoLoading(false);
          setIsProductInfoModalOpen(true);
          return;
      }
      
      // If not found anywhere, open modal in an empty state without generating.
      setIsProductInfoModalOpen(true);
      setIsProductInfoLoading(false);
      setProductInfoError(null);
      setProductInfoMarkdown(null);
      setProductInfoForOutfitKey(currentOutfitKey);
    };

  // --- Lookbook Logic ---
  const handleGenerateLookbook = async (style: string, aspectRatio: string, customPrompt?: string) => {
    if (!currentOutfit) return;
    setIsLookbookStyleModalOpen(false);
    setIsLookbookModalOpen(true);
    setIsLookbookLoading(true);
    setLookbookError(null);
    setLookbookImages([]);
    setLookbookStyle(style);
    setLookbookAspectRatio(aspectRatio);
    setIsLookbookSaved(false);

    const baseImageUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
    const shotTypePrompt = SHOT_TYPES[style as keyof typeof SHOT_TYPES].prompt;

    const variations = customPrompt ? [customPrompt] : [
      "Potret seluruh badan, tatapan percaya diri ke kamera.",
      "Candid, momen tertawa atau tersenyum alami.",
      "Detail close-up pada tekstur dan pola batik.",
      "Pose berjalan, menangkap gerakan dinamis dari pakaian.",
    ];
    
    try {
        const imagePromises = variations.map(variation => 
            generateLookbookImages(baseImageUrl, activeOutfitLayers, shotTypePrompt, variation, aspectRatio, customPrompt)
        );

        const results = await Promise.all(imagePromises);
        
        const newLookbookImages = results.map((url, index) => ({
            id: `lookbook-img-${Date.now()}-${index}`,
            url: url
        }));
        
        setLookbookImages(newLookbookImages);

    } catch (err) {
        console.error("Gagal membuat lookbook:", err);
        setLookbookError(getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), 'Gagal membuat gambar lookbook.'));
    } finally {
        setIsLookbookLoading(false);
    }
  };

  const handleRegenerateLookbookImage = async (imageToRegen: LookbookImage, refinementPrompt: string) => {
    if (!currentOutfit) return;
    setRegeneratingImageId(imageToRegen.id);
    const shotTypePrompt = SHOT_TYPES[lookbookStyle as keyof typeof SHOT_TYPES].prompt;

    try {
        const newImageUrl = await regenerateLookbookImage(imageToRegen.url, activeOutfitLayers, shotTypePrompt, refinementPrompt, lookbookAspectRatio);
        setLookbookImages(prev => prev.map(img => 
            img.id === imageToRegen.id ? { ...img, url: newImageUrl } : img
        ));
    } catch (err) {
        console.error("Gagal membuat ulang gambar lookbook:", err);
        setLoadingError(`Gagal membuat ulang gambar: ${getFriendlyErrorMessage(err instanceof Error ? err.message : String(err), '')}`);
    } finally {
        setRegeneratingImageId(null);
    }
  };

  const handleSaveLookbook = async () => {
    if (!currentOutfit || lookbookImages.length === 0 || isLookbookSaved) return;
    
    try {
        const timestamp = Date.now();
        const outfitId = `outfit-${timestamp}`;
        const lookbookId = `lookbook-${timestamp}`;

        // Simpan koleksi pakaian terlebih dahulu
        const outfitThumbnailUrl = currentOutfit.poseImages[POSE_INSTRUCTIONS[0]];
        const resizedOutfitThumbnailUrl = await resizeImage(outfitThumbnailUrl, 200, 267);

        const newSavedOutfit: SavedOutfit = {
            id: outfitId,
            name: `Koleksi untuk Lookbook ${lookbookStyle}`,
            thumbnailUrl: resizedOutfitThumbnailUrl,
            layers: activeOutfitLayers.slice(1).map(layer => ({
                garmentId: layer.garment!.id,
                texture: layer.texture,
            })),
            poseInstruction: POSE_INSTRUCTIONS[0],
            lookbookId: lookbookId
        };
        await appDB.saveItem('savedOutfits', newSavedOutfit);
        setSavedOutfits(prev => [...prev, newSavedOutfit]);
        
        // Sekarang simpan lookbook
        const lookbookThumbnailUrl = await resizeImage(lookbookImages[0].url, 200, 267);
        const newLookbook: SavedLookbook = {
            id: lookbookId,
            name: `Lookbook: ${lookbookStyle}`,
            style: lookbookStyle,
            images: lookbookImages,
            outfitId: outfitId,
            thumbnailUrl: lookbookThumbnailUrl,
            aspectRatio: lookbookAspectRatio,
        };
        await appDB.saveItem('savedLookbooks', newLookbook);
        setSavedLookbooks(prev => [newLookbook, ...prev].sort((a, b) => (b.id > a.id ? 1 : -1)));
        setIsLookbookSaved(true);
        setActiveRightPanelTab('lookbooks');
    } catch (err) {
        console.error("Gagal menyimpan lookbook:", err);
        setLoadingError("Gagal menyimpan lookbook.");
    }
  };
  
  const handleViewLookbook = (lookbookToView: SavedLookbook) => {
    const associatedOutfit = savedOutfits.find(o => o.id === lookbookToView.outfitId);
    if (!associatedOutfit) {
        setLoadingError(`Koleksi pakaian yang terhubung dengan lookbook '${lookbookToView.name}' tidak ditemukan.`);
        console.error(`Outfit with id ${lookbookToView.outfitId} not found for lookbook ${lookbookToView.id}`);
        return;
    }

    // Load the associated outfit onto the canvas
    handleLoadOutfit(associatedOutfit);

    // Prepare and open the lookbook modal
    setLookbookImages(lookbookToView.images);
    setLookbookStyle(lookbookToView.style);
    setLookbookAspectRatio(lookbookToView.aspectRatio || '3:4'); // Fallback for old saves
    setIsLookbookSaved(true); // It's a saved one, so disable the "Save" button
    setIsLookbookModalOpen(true);
  };

  const handleDeleteLookbook = async (lookbookId: string) => {
    await appDB.deleteItem('savedLookbooks', lookbookId);
    setSavedLookbooks(prev => prev.filter(lb => lb.id !== lookbookId));
  };
  
  const handleRenameLookbook = async (lookbookId: string, newName: string) => {
    const lookbookToUpdate = await appDB.getItem('savedLookbooks', lookbookId);
    if(lookbookToUpdate) {
        const updatedLookbook = { ...lookbookToUpdate, name: newName };
        await appDB.saveItem('savedLookbooks', updatedLookbook);
        setSavedLookbooks(prev => prev.map(lb => lb.id === lookbookId ? updatedLookbook : lb));
    }
  };


  if (activeScreen === 'start') {
    return (
      <div className="w-screen h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col p-4 sm:p-6 md:p-8 overflow-hidden">
          <main className="flex-grow flex items-center justify-center">
              <StartScreen 
                onAddModel={handleAddModel} 
                onSelectModel={handleSelectModel}
                customModels={customModels}
                onDeleteModel={handleDeleteModel}
                onRenameModel={handleRenameModel}
                onModelsImported={refreshCustomModels}
                setLoadingError={setLoadingError}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
          </main>
          <Footer />
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-stone-200 dark:bg-stone-900 flex flex-col md:flex-row font-sans relative overflow-hidden">
      <main className="flex-grow h-full w-full relative">
        <Canvas
          displayImageUrl={currentOutfit?.poseImages[POSE_INSTRUCTIONS[currentPoseIndex]] ?? null}
          onStartOver={handleStartOver}
          isLoading={isLoading}
          loadingMessage={loadingMessage}
          onSelectPose={handleSelectPose}
          poseInstructions={POSE_INSTRUCTIONS}
          currentPoseIndex={currentPoseIndex}
          availablePoseKeys={Object.keys(currentOutfit?.poseImages ?? {})}
          filters={filters}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onGenerateCommonPoses={handleGenerateCommonPoses}
          isMobile={isMobile}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        {isMobile && !isRightPanelOpen && (
            <button 
                onClick={() => setIsRightPanelOpen(true)}
                className="fixed bottom-20 right-4 z-30 bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-900 font-semibold py-3 px-5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in"
            >
                <SlidersIcon className="w-5 h-5" />
                Studio
            </button>
        )}
        {loadingError && (
          <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50"
          >
            {loadingError}
            <button onClick={() => setLoadingError(null)} className="ml-4 font-bold">X</button>
          </motion.div>
        )}
      </main>
      
      {/* Desktop Side Panel */}
      {!isMobile && (
          <aside className={cn(
            "bg-stone-100 dark:bg-stone-950 font-sans flex flex-col z-50 transition-all duration-300 ease-in-out relative border-l border-stone-300/80 dark:border-stone-800/80",
            isRightPanelOpen ? 'w-1/4 min-w-[320px] max-w-[420px]' : 'w-16'
          )}>
            <div className="p-4 flex-shrink-0 flex items-center justify-between border-b border-stone-300/50 dark:border-stone-800/50">
              <AnimatePresence>
              {isRightPanelOpen && (
                <motion.h2 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-2xl font-serif tracking-widest text-stone-800 dark:text-stone-200"
                >
                  Koleksi Anda
                </motion.h2>
              )}
              </AnimatePresence>
              <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors">
                {isRightPanelOpen ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
            {isRightPanelOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-grow overflow-y-auto"
              >
                  <div className="flex items-center justify-around border-b border-stone-300/50 dark:border-stone-800/50">
                      <TabButton id="outfit" activeTab={activeRightPanelTab} setActiveTab={setActiveRightPanelTab} label="Koleksi" Icon={PackageIcon} />
                      <TabButton id="saved" activeTab={activeRightPanelTab} setActiveTab={setActiveRightPanelTab} label="Tersimpan" Icon={LibraryIcon} />
                      <TabButton id="lookbooks" activeTab={activeRightPanelTab} setActiveTab={setActiveRightPanelTab} label="Lookbook" Icon={BookOpenIcon} />
                      <TabButton id="history" activeTab={activeRightPanelTab} setActiveTab={setActiveRightPanelTab} label="Riwayat" Icon={ClockIcon} />
                      <TabButton id="adjust" activeTab={activeRightPanelTab} setActiveTab={setActiveRightPanelTab} label="Sesuaikan" Icon={SlidersIcon} />
                  </div>

                  <div className="p-4">
                      {activeRightPanelTab === 'outfit' && ( <OutfitStack outfitHistory={history.slice(0, currentIndex + 1)} onUndo={handleUndo} onSaveOutfit={handleSaveOutfit} isLoading={isLoading} onAddGarment={() => setIsWardrobeOpen(true)} onGenerateProductInfo={() => handleGenerateProductInfo(false)} onGenerateLookbook={() => setIsLookbookStyleModalOpen(true)} /> )}
                      {activeRightPanelTab === 'saved' && ( <SavedOutfitsPanel savedOutfits={savedOutfits} onLoadOutfit={handleLoadOutfit} onDeleteOutfit={handleDeleteOutfit} onRenameOutfit={handleRenameOutfit} isLoading={isLoading} /> )}
                      {activeRightPanelTab === 'lookbooks' && ( <SavedLookbooksPanel savedLookbooks={savedLookbooks} onDeleteLookbook={handleDeleteLookbook} onRenameLookbook={handleRenameLookbook} onViewLookbook={handleViewLookbook} isLoading={isLoading} /> )}
                      {activeRightPanelTab === 'history' && ( <HistoryPanel history={history} currentIndex={currentIndex} onJumpToState={handleJumpToState} isLoading={isLoading} /> )}
                      {activeRightPanelTab === 'adjust' && ( <FilterPanel filters={filters} onFilterChange={(newFilters) => setFilters(f => ({ ...f, ...newFilters }))} onResetFilters={() => setFilters({ brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 })} isDisabled={isLoading} /> )}
                  </div>

              </motion.div>
            )}
            </AnimatePresence>
          </aside>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
          <BottomSheet isOpen={isRightPanelOpen} onClose={() => setIsRightPanelOpen(false)}>
              <div className="pt-8 p-4 flex-shrink-0 flex items-center justify-between border-b border-stone-300/50 dark:border-stone-800/50">
                  <h2 className="text-2xl font-serif tracking-widest text-stone-800 dark:text-stone-200">
                    Studio Anda
                  </h2>
                  <button onClick={() => setIsRightPanelOpen(false)} className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors">
                      <XIcon className="w-5 h-5" />
                  </button>
              </div>
              <div className="flex-grow overflow-y-auto">
                  <div className="flex items-center justify-around border-b border-stone-300/50 dark:border-stone-800/50 sticky top-0 bg-stone-100 dark:bg-stone-950 z-10">
                      <TabButton id="outfit" activeTab={activeRightPanelTab} setActiveTab={setActiveRightPanelTab} label="Koleksi" Icon={PackageIcon} />
                      <TabButton id="saved" activeTab={activeRightPanelTab} setActiveTab={setActiveRightPanelTab} label="Tersimpan" Icon={LibraryIcon} />
                      <TabButton id="lookbooks" activeTab={activeRightPanelTab} setActiveTab={setActiveRightPanelTab} label="Lookbook" Icon={BookOpenIcon} />
                      <TabButton id="history" activeTab={activeRightPanelTab} setActiveTab={setActiveRightPanelTab} label="Riwayat" Icon={ClockIcon} />
                      <TabButton id="adjust" activeTab={activeRightPanelTab} setActiveTab={setActiveRightPanelTab} label="Sesuaikan" Icon={SlidersIcon} />
                  </div>
                   <div className="p-4">
                      {activeRightPanelTab === 'outfit' && ( <OutfitStack outfitHistory={history.slice(0, currentIndex + 1)} onUndo={handleUndo} onSaveOutfit={handleSaveOutfit} isLoading={isLoading} onAddGarment={() => setIsWardrobeOpen(true)} onGenerateProductInfo={() => handleGenerateProductInfo(false)} onGenerateLookbook={() => setIsLookbookStyleModalOpen(true)} /> )}
                      {activeRightPanelTab === 'saved' && ( <SavedOutfitsPanel savedOutfits={savedOutfits} onLoadOutfit={handleLoadOutfit} onDeleteOutfit={handleDeleteOutfit} onRenameOutfit={handleRenameOutfit} isLoading={isLoading} /> )}
                      {activeRightPanelTab === 'lookbooks' && ( <SavedLookbooksPanel savedLookbooks={savedLookbooks} onDeleteLookbook={handleDeleteLookbook} onRenameLookbook={handleRenameLookbook} onViewLookbook={handleViewLookbook} isLoading={isLoading} /> )}
                      {activeRightPanelTab === 'history' && ( <HistoryPanel history={history} currentIndex={currentIndex} onJumpToState={handleJumpToState} isLoading={isLoading} /> )}
                      {activeRightPanelTab === 'adjust' && ( <FilterPanel filters={filters} onFilterChange={(newFilters) => setFilters(f => ({ ...f, ...newFilters }))} onResetFilters={() => setFilters({ brightness: 100, contrast: 100, saturation: 100, hue: 0, sepia: 0 })} isDisabled={isLoading} /> )}
                  </div>
              </div>
          </BottomSheet>
      )}

      <Footer isOnDressingScreen />

      {/* Modals */}
      <WardrobeModal
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
        onGarmentSelect={handleGarmentSelect}
        onFileUpload={handleFileUpload}
        activeGarmentIds={activeOutfitLayers.map(l => l.garment?.id).filter((id): id is string => !!id)}
        isLoading={isLoading}
        wardrobe={wardrobe}
        onEditGarment={handleEditGarment}
        onDeleteGarment={handleDeleteGarment}
      />
      <TextureSelectionModal
        isOpen={isTextureModalOpen}
        onClose={() => setIsTextureModalOpen(false)}
        onConfirm={handleTextureConfirm}
        garment={garmentForTexture}
      />
      <CategorizeGarmentModal
        isOpen={isCategorizeModalOpen}
        onClose={() => setIsCategorizeModalOpen(false)}
        onConfirm={handleCategorizeConfirm}
        garmentPreviewUrl={garmentToCategorize ? URL.createObjectURL(garmentToCategorize) : null}
      />
      <EditGarmentModal
        isOpen={isEditGarmentModalOpen}
        onClose={() => setIsEditGarmentModalOpen(false)}
        onSave={handleSaveGarmentEdit}
        onDelete={handleDeleteGarment}
        garment={garmentToEdit}
      />
      {deletingGarment && (
        <ConfirmationDialog
            itemType="karya"
            itemName={deletingGarment.name}
            onConfirm={handleConfirmDeleteGarment}
            onCancel={() => setDeletingGarment(null)}
        />
      )}
      <ProductInfoModal 
        isOpen={isProductInfoModalOpen}
        onClose={() => setIsProductInfoModalOpen(false)}
        isLoading={isProductInfoLoading}
        productInfoMarkdown={productInfoMarkdown}
        error={productInfoError}
        onRegenerate={() => handleGenerateProductInfo(true)}
      />

      <LookbookStyleModal
        isOpen={isLookbookStyleModalOpen}
        onClose={() => setIsLookbookStyleModalOpen(false)}
        onGenerate={handleGenerateLookbook}
        isLoading={isLookbookLoading}
      />

      <LookbookModal
        isOpen={isLookbookModalOpen}
        onClose={() => setIsLookbookModalOpen(false)}
        isLoading={isLookbookLoading}
        images={lookbookImages}
        error={lookbookError}
        style={lookbookStyle}
        aspectRatio={lookbookAspectRatio}
        onRegenerate={handleRegenerateLookbookImage}
        regeneratingImageId={regeneratingImageId}
        onSave={handleSaveLookbook}
        isSaved={isLookbookSaved}
        isMobile={isMobile}
      />


    </div>
  );
};

type PanelTabId = 'outfit' | 'saved' | 'lookbooks' | 'history' | 'adjust';

interface TabButtonProps {
    id: PanelTabId;
    activeTab: PanelTabId;
    setActiveTab: (id: PanelTabId) => void;
    label: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const TabButton: React.FC<TabButtonProps> = ({ id, activeTab, setActiveTab, label, Icon }) => {
    const isActive = activeTab === id;
    return (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                "w-full flex flex-col items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors border-b-2",
                isActive
                    ? "text-stone-900 dark:text-stone-50 border-stone-900 dark:border-stone-50"
                    : "text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50"
            )}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    )
}

export default App;
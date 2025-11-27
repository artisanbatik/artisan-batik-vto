/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { 
  Shirt, 
  Scissors, 
  UploadCloud, 
  RotateCcw, 
  CheckCircle, 
  MoreVertical, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Save, 
  Pencil, 
  Download, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Wand2, 
  FileText, 
  PlusCircle, 
  SlidersHorizontal, 
  Clock, 
  Package, 
  Library, 
  BookOpen, 
  Camera, 
  FileUp, 
  Sun, 
  Moon, 
  RefreshCcw,
  ShoppingBag
} from 'lucide-react';

// Re-export Lucide icons with mapped names to match existing app usage
export const ShirtIcon = Shirt;
export const UploadCloudIcon = UploadCloud;
export const RotateCcwIcon = RotateCcw;
export const CheckCircleIcon = CheckCircle;
export const DotsVerticalIcon = MoreVertical;
export const Trash2Icon = Trash2;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;
export const XIcon = X;
export const PlusIcon = Plus;
export const ChevronUpIcon = ChevronUp;
export const ChevronDownIcon = ChevronDown;
export const SaveIcon = Save;
export const PencilIcon = Pencil;
export const DownloadIcon = Download;
export const UndoIcon = Undo;
export const RedoIcon = Redo;
export const ZoomInIcon = ZoomIn;
export const ZoomOutIcon = ZoomOut;
export const MaximizeIcon = Maximize;
export const WandSparklesIcon = Wand2; // Mapping WandSparkles to Wand2
export const FileTextIcon = FileText;
export const PlusCircleIcon = PlusCircle;
export const SlidersIcon = SlidersHorizontal;
export const ClockIcon = Clock;
export const PackageIcon = Package;
export const LibraryIcon = Library;
export const BookOpenIcon = BookOpen;
export const CameraIcon = Camera;
export const FileUpIcon = FileUp;
export const SunIcon = Sun;
export const MoonIcon = Moon;
export const SwitchCameraIcon = RefreshCcw;
export const ShoppingBagIcon = ShoppingBag;

// Custom Icons for specific garments where Lucide doesn't have an exact match
// Keeping these consistent with the app's visual language

export const BatikIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 0 0-10 10c0 4.42 2.87 8.17 6.84 9.5.6.11.82-.26.82-.57v-2.1c-2.78.6-3.37-1.34-3.37-1.34-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.83 1.23 1.83 1.23 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.3 1.23-1.6-2.67-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23.95-.26 1.98-.4 3-.4s2.05.13 3 .4c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.82 1.1.82 2.22v3.29c0 .31.22.69.82.57A10 10 0 0 0 12 2Z" />
  </svg>
);

export const JacketIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 4l-2 3-2-3h-2v5l2 2 2-2 2 2 2-2V4z" />
    <path d="M18 8h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1" />
    <path d="M12 13v8" />
  </svg>
);

export const DressIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
        <path d="M12 2l-3 6h6z" />
        <path d="M5 8h14l-2 12H7z" />
    </svg>
);

export const PantsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
        <path d="M6 2h12v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2z" />
        <path d="M8 9l-2 13h12l-2-13" />
    </svg>
);

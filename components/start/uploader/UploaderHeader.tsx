import React from 'react';

export const UploaderHeader: React.FC = () => (
    <div className="mb-6">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight">
            Studio Virtual<br /><span className="text-stone-500">Artisan Batik</span>
        </h1>
        <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-md">
            Unggah foto diri Anda untuk membuat model virtual yang dipersonalisasi. Coba koleksi batik eksklusif kami secara instan.
        </p>
    </div>
);
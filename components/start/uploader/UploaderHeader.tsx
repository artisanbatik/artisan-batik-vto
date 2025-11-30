
import React from 'react';
import { Heading, Text } from '../../ui/typography';

export const UploaderHeader: React.FC = () => (
    <div className="mb-6">
        <Heading level={1}>
            Studio Virtual<br /><span className="text-stone-500">Artisan Batik</span>
        </Heading>
        <Text variant="large" className="mt-4 max-w-md">
            Unggah foto diri Anda untuk membuat model virtual yang dipersonalisasi. Coba koleksi batik eksklusif kami secara instan.
        </Text>
    </div>
);


'use client';
import Image from 'next/image';

export const WhatsAppIcon = ({ width = 32, height = 32 }: { width?: number; height?: number }) => (
    <Image src="/imagenes/logos/Logo Whatsapp.png" alt="WhatsApp" width={width} height={height} />
);

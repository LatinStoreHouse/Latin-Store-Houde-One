
import React from 'react';
import Image from 'next/image';
import WhatsappLogo from '@/assets/images/logos/Logo Whatsapp.svg';

export const WhatsAppIcon = () => (
    <Image src={WhatsappLogo} alt="WhatsApp" width={32} height={32} />
);

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  type?: 'student' | 'course' | 'signature' | 'id' | 'generic';
}

/**
 * A wrapper around Next.js Image component that provides fallback for failed images
 */
export default function SafeImage({ 
  src, 
  alt, 
  fallbackSrc,
  type = 'generic',
  ...props 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src as string);
  const [error, setError] = useState(false);

  // Generate a default fallback if none provided
  const getDefaultFallback = () => {
    const width = Number(props.width) || 400;
    const height = Number(props.height) || 400;
    const text = encodeURIComponent(alt || 'Image');

    switch (type) {
      case 'student':
        return `/placeholder.svg?text=Student&width=${width}&height=${height}`;
      case 'course':
        return `/placeholder.svg?text=Course&width=${width}&height=${height}`;
      case 'signature':
        return `/placeholder.svg?text=Signature&width=${width}&height=${height < 200 ? height : 100}`;
      case 'id':
        return `/placeholder.svg?text=ID&width=${width}&height=${height}`;
      default:
        return `/placeholder.svg?text=${text}&width=${width}&height=${height}`;
    }
  };

  // Handle image load error
  const handleError = () => {
    if (!error) {
      console.log(`Image failed to load: ${src}`);
      setError(true);
      setImgSrc(fallbackSrc || getDefaultFallback());
    }
  };

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
} 
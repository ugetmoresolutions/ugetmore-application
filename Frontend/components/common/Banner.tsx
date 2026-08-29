import Image from 'next/image';

interface BannerProps {
  src: string;
  alt: string;
  height?: number | string; 
}

const Banner: React.FC<BannerProps> = ({ src, alt, height = 200 }) => {
  const heightClass = typeof height === 'number'
    ? `h-[${height}px]`
    : height;

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover w-full h-full object-center"
        quality={50}
        priority
        sizes="100vw"
      />
    </div>
  );
};

export default Banner;
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  href: string;
  image: string;
  title: string;
  showPlaceholder?: boolean;
}

export default function ProductCard({ href, image, title, showPlaceholder = false }: ProductCardProps) {
  return (
    <Link 
      href={href}
      className="flex flex-col cursor-pointer no-underline"
      style={{ width: '268.5px' }}
    >
      <div 
        className="relative overflow-hidden block"
        style={{ 
          width: '268.5px', 
          height: '265.266px',
          borderRadius: '3px 3px 0px 0px'
        }}
      >
        {showPlaceholder && (
          <Image
            src="https://images-fe.thortful.com/cdn-cgi/image/width=250,format=auto,quality=90/img/hosted/carousel-blank-tile.png"
            alt=""
            fill
            className="object-cover"
            style={{ borderRadius: '0px' }}
            sizes="268.5px"
          />
        )}
        <Image
          src={image}
          alt={title}
          width={showPlaceholder ? 159 : 269}
          height={265}
          className={showPlaceholder ? "absolute" : ""}
          style={{ 
            width: showPlaceholder ? '158.953px' : '268.5px',
            height: '265.266px',
            position: showPlaceholder ? 'absolute' : 'static',
            top: showPlaceholder ? '50%' : 'auto',
            left: showPlaceholder ? '50%' : 'auto',
            objectFit: showPlaceholder ? 'fill' : 'cover',
            borderRadius: showPlaceholder ? '1px' : '0px',
            transform: showPlaceholder ? 'translate(-50%, -50%)' : 'none'
          }}
          sizes="268.5px"
        />
      </div>
      <h3 
        className="block text-center text-black"
        style={{ 
          fontSize: '20px',
          fontWeight: '500',
          lineHeight: 'normal',
          margin: '0px',
          padding: '0px',
          fontFamily: 'Roboto, Arial, Helvetica, sans-serif',
          textDecoration: 'none'
        }}
      >
        {title}
      </h3>
      <p
        className="block text-center"
        style={{
          fontSize: '14px',
          fontWeight: '600',
          margin: '8px 0',
          color: '#005A86',
          textDecoration: 'underline'
        }}
      >
        View Details
      </p>
    </Link>
  );
}
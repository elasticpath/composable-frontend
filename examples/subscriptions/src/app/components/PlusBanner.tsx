import Link from 'next/link';

export default function PlusBanner() {
  return (
    <div className="bg-gradient-to-br from-[#ff6b6b] to-[#ff8e53] text-white py-3">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-center gap-5 flex-wrap max-md:gap-3">
          <span className="bg-white/20 px-3 py-1 rounded-[20px] font-semibold text-sm uppercase tracking-wide max-md:text-xs">
            Thortful Plus
          </span>
          <span className="text-base leading-snug max-md:text-sm max-md:text-center">
            Get <strong className="font-semibold">FREE delivery</strong> on all orders, <strong className="font-semibold">10% off</strong> everything & more!
          </span>
          <Link
            href="/plus"
            className="bg-white text-[#ff6b6b] px-5 py-2 rounded-[25px] no-underline font-semibold text-sm transition-all duration-200 shadow-sm hover:-translate-y-px hover:shadow-md max-md:text-[13px] max-md:px-4 max-md:py-1.5"
          >
            Join Now
          </Link>
        </div>
      </div>
    </div>
  );
}

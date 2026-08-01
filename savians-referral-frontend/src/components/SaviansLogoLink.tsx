import Image from 'next/image';

type SaviansLogoLinkProps = {
  className?: string;
  priority?: boolean;
};

export default function SaviansLogoLink({
  className = '',
  priority = false,
}: SaviansLogoLinkProps) {
  return (
    <a
      href="https://savians.com"
      aria-label="Savians home"
      className={`focus-ring inline-flex shrink-0 items-center transition-opacity hover:opacity-90 ${className}`}
    >
      <Image
        src="/savians-logo.png"
        alt="Savians Tax Advisors"
        width={1996}
        height={773}
        priority={priority}
        className="h-10 w-auto object-contain sm:h-12"
      />
    </a>
  );
}

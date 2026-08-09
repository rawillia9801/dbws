import Link from "next/link";

export function Logo() {
  return (
    <Link className="brand" href="/" aria-label="Dog Breeder Web home">
      <svg className="brand-mark" viewBox="0 0 80 80" aria-hidden="true">
        <path d="M18 64c3-15 2-25-4-37 7 4 12 5 17 1 7-6 12-14 21-12 7 2 9 9 16 11l8 4-9 5c-1 9-5 16-13 19-7 3-14 1-20-3 0 7 4 12 10 16M30 29c0 9 5 15 12 18M57 25l-3 7" />
        <circle cx="58" cy="26" r="1.5" fill="currentColor" stroke="none" />
      </svg>
      <span>
        <strong>DOG BREEDER WEB</strong>
        <small>.SITE</small>
      </span>
    </Link>
  );
}

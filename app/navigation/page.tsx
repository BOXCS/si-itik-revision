// app/navigation/page.tsx
"use client"; // Next.js environment requirement

import Link from 'next/link';

const Page = () => {
  return (
    <nav>
      <Link href="/signup">Sign Up</Link>
      <Link href="/signin">Sign In</Link>
      <Link href="/landing">Landing Page</Link>
    </nav>
  );
};

export default Page;

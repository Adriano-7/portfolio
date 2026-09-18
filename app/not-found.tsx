import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <div className="text-center">
        <p className="mono text-muted">404</p>
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.02em]">Nothing here.</h1>
        <Link href="/" className="pill mt-8">
          back to works
        </Link>
      </div>
    </div>
  );
}

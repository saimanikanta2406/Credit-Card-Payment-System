
import { Link } from "react-router-dom";

export default function AuthLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLabel,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            C
          </span>
          CardPay
        </Link>

        <h1 className="text-2xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {subtitle}
        </p>

        <div className="mt-7">{children}</div>

        <p className="mt-6 text-center text-sm text-slate-600">
          {footerText}{" "}
          <Link
            to={footerLink}
            className="font-semibold text-slate-900 underline underline-offset-4"
          >
            {footerLabel}
          </Link>
        </p>
      </section>
    </main>
  );
}

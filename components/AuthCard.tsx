import { ReactNode } from "react";

export default function AuthCard({
  judul,
  subjudul,
  children,
}: {
  judul: string;
  subjudul: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="text-4xl">📸</div>
          <p className="mt-1 text-sm font-semibold tracking-widest text-indigo-600">SNAPQ</p>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">{judul}</h1>
          <p className="mt-1 text-sm text-gray-500">{subjudul}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
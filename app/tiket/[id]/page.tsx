import { Suspense } from "react";
import TiketIsi from "./TiketIsi";

async function Isi({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TiketIsi id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">Memuat tiket...</p>
        </main>
      }
    >
      <Isi params={params} />
    </Suspense>
  );
}
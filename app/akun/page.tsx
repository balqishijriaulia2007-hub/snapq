"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthCard from "@/components/AuthCard";

export default function Akun() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/masuk");
      else {
        setEmail(data.user.email ?? "");
        setNama(data.user.user_metadata?.nama ?? "");
      }
    });
  }, [router]);

  async function keluar() {
    await supabase.auth.signOut();
    router.push("/masuk");
  }

  return (
    <AuthCard judul={`Halo, ${nama || "pelanggan"}`} subjudul={email}>
      <button onClick={keluar} className="w-full rounded-xl bg-red-500 py-3 font-semibold text-white shadow hover:bg-red-600">
        Keluar
      </button>
    </AuthCard>
  );
}
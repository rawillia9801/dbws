import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LoginForm } from "@/components/login-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Breeder Sign In" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/builder";
  const supabase = await createServerSupabaseClient();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (data.user) redirect(next);

  return (
    <>
      <Header />
      <main className="login-main">
        <section className="login-copy">
          <p className="eyebrow">BREEDER WORKSPACE</p>
          <h1>Your website, always ready to evolve.</h1>
          <p>Edit your story, announce a litter, add a dog, change the look, or ask BreederWeb Designer to do it with you.</p>
        </section>
        <LoginForm next={next} />
      </main>
      <Footer />
    </>
  );
}


import Hero from "@/components/Hero";
import ActiveContestsPreview from "@/components/ActiveContestsPreview";
import MovieRatingsPreview from "@/components/MovieRatingsPreview";

export default function Home() {
  return (
    <main>
      <Hero />
      <ActiveContestsPreview />
      <MovieRatingsPreview />

      <footer className="border-t border-white/10 px-4 py-10 text-center text-sm text-white/40 sm:px-6">
        <p className="font-display font-bold text-white/70">
          Friends<span className="text-brand-green">Community</span> 🤝
        </p>
        <p className="mt-2">
          Built for fun, bragging rights, and questionable predictions.
        </p>
      </footer>
    </main>
  );
}

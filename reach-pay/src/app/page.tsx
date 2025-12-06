import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Formula from "@/components/Formula";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Formula />
      <HowItWorks />
      <Footer />
    </main>
  );
}

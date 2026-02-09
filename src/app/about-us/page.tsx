import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function AboutUsPage() {
  return (
    <div className="bg-[#fff9f2] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Banner */}
        <section className="py-24 px-4 bg-[#fdf5e6]">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="section-title">About Our Bakery</h1>
            <p className="section-subtitle">A Sweet Story Since 1995</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 relative aspect-square w-full max-w-lg">
               <Image 
                src="/images/cake-3.png" 
                alt="Our Bakery" 
                fill 
                className="object-contain drop-shadow-2xl"
              />
            </div>
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-bold font-serif text-[#2d1e1e]">Baked with Love & Passion</h2>
              <p className="text-[#8c7676] leading-relaxed text-lg">
                At Cake Shop Bakery, we believe that every cake tells a story. From small beginnings in a family kitchen, we&apos;ve grown into a destination for those who appreciate the art of traditional baking combined with modern flair.
              </p>
              <p className="text-[#8c7676] leading-relaxed text-lg">
                Our master bakers use only the finest locally-sourced ingredients, ensuring that every bite is a moment of pure bliss. Whether it&apos;s a wedding, a birthday, or just a Tuesday, we&apos;re here to make it special.
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div>
                  <h4 className="text-3xl font-bold text-[#e85d41]">100%</h4>
                  <p className="text-sm font-bold uppercase tracking-widest text-[#2d1e1e]">Natural Ingredients</p>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-[#e85d41]">25+</h4>
                  <p className="text-sm font-bold uppercase tracking-widest text-[#2d1e1e]">Years of Experience</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

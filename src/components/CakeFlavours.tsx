"use client";
import Image from "next/image";



export default function CakeFlavours() {
  return (
    <section className="py-24 px-4 bg-[#fff9f2] overflow-hidden">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="section-title">Flavours of Cake</h2>
        <p className="text-[#8c7676] max-w-2xl mx-auto">
          Try our most popular signature cupcakes and taste the difference!
        </p>
      </div>

      <div className="max-w-6xl mx-auto relative flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
        {/* Left Side Flavors */}
        <div className="flex flex-col gap-12 text-right">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center justify-end gap-6 group">
              <div className="max-w-[180px]">
                <h4 className="font-bold text-lg text-[#2d1e1e]">Fruit Cake</h4>
                <p className="text-sm text-[#8c7676]">Try our most popular signature cupcakes and taste the difference</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center p-2 border border-[#fdf5e6] group-hover:border-[#e85d41] transition-all relative">
                <Image src={`/images/cake-5.png`} alt="Flavor" width={40} height={40} className="object-contain" />
                <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-8 h-[1px] bg-[#e85d41]/30 hidden md:block"></div>
                <div className="absolute right-[-44px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#e85d41] hidden md:block"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Center Image with Circle Border */}
        <div className="relative p-8 md:p-12">
          <div className="absolute inset-0 border-[1px] border-[#e85d41]/20 rounded-full animate-[spin_20s_linear_infinite] hidden md:block"></div>
          <div className="relative z-10 w-[300px] h-[300px] md:w-[450px] md:h-[450px]">
            <Image 
              src="/images/cake-3.png" 
              alt="Main Flavor Cake" 
              fill 
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Right Side Flavors */}
        <div className="flex flex-col gap-12 text-left">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center gap-6 group">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center p-2 border border-[#fdf5e6] group-hover:border-[#e85d41] transition-all relative">
                <Image src={`/images/cake-1.png`} alt="Flavor" width={40} height={40} className="object-contain" />
                <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 w-8 h-[1px] bg-[#e85d41]/30 hidden md:block"></div>
                <div className="absolute left-[-44px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#e85d41] hidden md:block"></div>
              </div>
              <div className="max-w-[180px]">
                <h4 className="font-bold text-lg text-[#2d1e1e]">Fruit Cake</h4>
                <p className="text-sm text-[#8c7676]">Try our most popular signature cupcakes and taste the difference</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

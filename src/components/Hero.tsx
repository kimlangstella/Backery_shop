"use client";
import Image from "next/image";
import Link from "next/link";
import { PlayIcon } from "./Icons";

export default function Hero() {
  return (
    <section className="relative pt-12 pb-24 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Text Content */}
        <div className="flex-1 space-y-8 z-10">
          <div className="flex items-center space-x-4 group cursor-pointer">
            <PlayIcon />
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#8c7676] group-hover:text-[#e85d41] transition-colors">Watch Video</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold leading-tight text-[#2d1e1e]">
            Yummy sweeties <br />
            delivered to <br />
            your dining table!
          </h1>

          <div className="flex flex-wrap gap-4">
            <Link href="/about-us" className="bg-white border-2 border-[#e85d41] text-[#e85d41] px-10 py-4 rounded-md font-bold uppercase tracking-widest text-sm hover:bg-[#e85d41] hover:text-white transition-all text-center">
              Read More
            </Link>
            <Link href="/products" className="bg-[#e85d41] text-white px-10 py-4 rounded-md font-bold uppercase tracking-widest text-sm hover:bg-[#d14d34] transition-all flex items-center justify-center">
              Order now <span className="ml-2">›</span>
            </Link>
          </div>
        </div>

        {/* Hero Images */}
        <div className="flex-1 relative min-h-[500px] w-full mt-12 md:mt-0">
          <div className="absolute top-0 right-0 w-[85%] h-full">
            <Image
              src="/images/cake-3.png"
              alt="Main Hero Cake"
              width={600}
              height={600}
              className="object-contain"
              priority
            />
          </div>
          <div className="absolute -bottom-10 -left-10 w-[60%] h-[60%]">
             <Image
              src="/images/cake-1.png"
              alt="Sub Hero Cake"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-10 right-0 w-[40%] h-[40%]">
             <Image
              src="/images/cake-6.png"
              alt="Small Hero Cake"
              width={250}
              height={250}
              className="object-contain"
            />
          </div>
          
          {/* Decorative indicator dots */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#e85d41]"></div>
            <div className="w-2.5 h-2.5 rounded-full border border-[#e85d41]"></div>
            <div className="w-2.5 h-2.5 rounded-full border border-[#e85d41]"></div>
          </div>
        </div>
      </div>
      
      {/* Wave background decorative element */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-white rounded-[100%_100%_0_0] scale-x-125 z-0"></div>
    </section>
  );
}

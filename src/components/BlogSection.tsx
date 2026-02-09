"use client";
import Image from "next/image";

const BLOGS = [
  {
    title: "scrambled make to specimen.",
    date: "5 Jun",
    author: "Magnifico_a dmin",
    excerpt: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took",
    image: "/images/cake-1.png"
  },
  {
    title: "scrambled make to specimen.",
    date: "5 Jun",
    author: "Magnifico_a dmin",
    excerpt: "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took",
    image: "/images/cake-6.png"
  }
];

export default function BlogSection() {
  return (
    <section className="py-24 px-4 bg-white relative">
       <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="section-title">Blog</h2>
        <p className="text-[#8c7676] max-w-2xl mx-auto">
          Try our most popular signature cupcakes and taste the difference!
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {BLOGS.map((blog, i) => (
          <div key={i} className="flex flex-col md:flex-row gap-6 items-center group">
            <div className="relative w-full md:w-1/2 aspect-square overflow-hidden rounded-lg border-2 border-[#e85d41]/10 p-2">
              <Image 
                src={blog.image} 
                alt={blog.title} 
                fill 
                className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            <div className="w-full md:w-1/2 bg-white p-8 shadow-xl md:-ml-20 z-10 rounded-lg">
              <div className="flex items-center gap-4 text-xs font-bold text-[#8c7676] uppercase tracking-widest mb-4">
                <span className="flex items-center gap-1">🕒 {blog.date}</span>
                <span className="flex items-center gap-1">👤 {blog.author}</span>
                <span className="flex items-center gap-1">💬 0</span>
              </div>
              <h3 className="text-2xl font-bold font-serif text-[#2d1e1e] mb-4 group-hover:text-[#e85d41] transition-colors">
                {blog.title}
              </h3>
              <p className="text-[#8c7676] text-sm leading-relaxed mb-6">
                {blog.excerpt}
              </p>
              <button className="text-[#e85d41] font-bold text-sm uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="max-w-7xl mx-auto flex justify-end gap-4 mt-12 md:mt-0 md:absolute md:top-1/2 md:-translate-y-1/2 md:right-8 md:flex-col">
        <button className="w-12 h-12 rounded-full border-2 border-[#e85d41] text-[#e85d41] flex items-center justify-center hover:bg-[#e85d41] hover:text-white transition-all">‹</button>
        <button className="w-12 h-12 rounded-full border-2 border-[#e85d41] text-[#e85d41] flex items-center justify-center hover:bg-[#e85d41] hover:text-white transition-all">›</button>
      </div>
    </section>
  );
}

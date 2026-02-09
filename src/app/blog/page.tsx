import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

const ALL_BLOGS = [
  {
    title: "Mastering the Art of Sponge Cake",
    date: "12 Dec",
    author: "Chef Emma",
    excerpt: "Learn the secrets to achieving the perfect, airy sponge cake every single time with our professional tips.",
    image: "/images/cake-1.png"
  },
  {
    title: "Top 5 Winter Flavors",
    date: "10 Dec",
    author: "Magnifico_a dmin",
    excerpt: "Discover the most popular flavors this season, from spiced pumpkin to decadent dark chocolate peppermint.",
    image: "/images/cake-6.png"
  },
  {
    title: "Healthy Alternitaves for Baking",
    date: "05 Dec",
    author: "Sara Sweets",
    excerpt: "Exploring natural sweeteners and flour alternatives that don't compromise on flavor or texture.",
    image: "/images/cake-3.png"
  }
];

export default function BlogPage() {
  return (
    <div className="bg-[#fff9f2] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="section-title">Latest from Our Blog</h1>
            <p className="section-subtitle">Insights, Tips & Sweet News</p>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_BLOGS.map((blog, i) => (
              <div key={i} className="flex flex-col group cursor-pointer">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-6 shadow-sm border border-slate-100">
                  <Image 
                    src={blog.image} 
                    alt={blog.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-md font-bold text-xs uppercase tracking-widest text-[#e85d41]">
                    {blog.date}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8c7676] uppercase tracking-widest">
                    <span>By {blog.author}</span>
                    <span>•</span>
                    <span>0 Comments</span>
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-[#2d1e1e] group-hover:text-[#e85d41] transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-[#8c7676] leading-relaxed">
                    {blog.excerpt}
                  </p>
                  <button className="text-[#e85d41] font-bold text-sm uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
                    Read More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

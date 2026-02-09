"use client";

const FEATURE_DATA = [
  {
    title: "Baked With Care",
    description: "Lorem ipsum dolor sit amet, consectetur lorem ipsum dolor sit amet, elit.",
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e85d41" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 13.8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5.8a2 2 0 0 1-2 2" />
        <path d="M6 13a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2" />
        <path d="M9 13v-3" />
        <path d="M15 13v-3" />
      </svg>
    )
  },
  {
    title: "Flavor Oriented",
    description: "Lorem ipsum dolor sit amet, consectetur lorem ipsum dolor sit amet, elit.",
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e85d41" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a9 9 0 1 0-9-9 9 9 0 0 0 9 9z" />
        <path d="M12 11l2 2-2 2-2-2 2-2z" />
        <path d="M12 7l1 1-1 1-1-1 1-1z" />
        <path d="M12 15l1 1-1 1-1-1 1-1z" />
        <path d="M8 11l1 1-1 1-1-1 1-1z" />
        <path d="M16 11l1 1-1 1-1-1 1-1z" />
      </svg>
    )
  },
  {
    title: "Signature Smoothness",
    description: "Lorem ipsum dolor sit amet, consectetur lorem ipsum dolor sit amet, elit.",
    icon: (
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e85d41" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
        <path d="M12 6v6l4 2" />
      </svg>
    )
  }
];

export default function Features() {
  return (
    <section className="bg-white py-24 px-4 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {FEATURE_DATA.map((feat, i) => (
          <div key={i} className="flex flex-col items-center text-center space-y-4 group">
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
              {feat.icon}
            </div>
            <h3 className="text-2xl font-bold font-serif text-[#2d1e1e]">{feat.title}</h3>
            <p className="text-[#8c7676] leading-relaxed max-w-[280px]">
              {feat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

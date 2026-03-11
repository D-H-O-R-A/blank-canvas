export interface Sponsor {
  name: string;
  logo: string;
}

const placeholders: Sponsor[] = [
  { name: "Patrocinador 1", logo: "/placeholder.svg" },
  { name: "Patrocinador 2", logo: "/placeholder.svg" },
  { name: "Patrocinador 3", logo: "/placeholder.svg" },
  { name: "Patrocinador 4", logo: "/placeholder.svg" },
  { name: "Patrocinador 5", logo: "/placeholder.svg" },
  { name: "Patrocinador 6", logo: "/placeholder.svg" },
];

interface SponsorsSectionProps {
  sponsors?: Sponsor[];
}

const SponsorsSection = ({ sponsors = placeholders }: SponsorsSectionProps) => {
  return (
    <section className="w-full py-16 px-6">
      <h2 className="text-center text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground mb-12">
        Patrocinadores
      </h2>
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.name}
            className="w-24 h-24 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
          >
            <img
              src={sponsor.logo}
              alt={sponsor.name}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SponsorsSection;

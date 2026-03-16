import { motion } from "framer-motion";
import { Handshake } from "lucide-react";

const partners = [
  { name: "Casa do Forro", logo: "/lovable-uploads/partner-1.jpeg" },
  { name: "Adapta Esquadrias", logo: "/lovable-uploads/partner-2.png" },
  { name: "Casa do Encanador", logo: "/lovable-uploads/partner-3.jpeg" },
  { name: "Rede da Construção", logo: "/lovable-uploads/partner-4.png" },
  { name: "José Luiz Domingos Odontologia", logo: "/lovable-uploads/partner-5.jpeg" },
  { name: "Vidraçaria Agmar", logo: "/lovable-uploads/partner-6.jpeg" },
  { name: "3M Metalúrgica", logo: "/lovable-uploads/partner-7.jpeg" },
  { name: "Lucas Polimento e Estética", logo: "/lovable-uploads/partner-8.jpeg" },
  { name: "TV Quirinópolis", logo: "/lovable-uploads/partner-9.jpeg" },
  { name: "Zaltran Supermercado", logo: "/lovable-uploads/partner-10.jpeg" },
  { name: "Brasil Materiais", logo: "/lovable-uploads/partner-11.jpeg" },
  { name: "Sarah Cris", logo: "/lovable-uploads/partner-12.jpeg" },
  { name: "Casa das Bombas", logo: "/lovable-uploads/partner-13.jpeg" },
  { name: "LA Construções", logo: "/lovable-uploads/partner-14.jpeg" },
  { name: "Açaí God's", logo: "/lovable-uploads/partner-15.jpeg" },
  { name: "Auto Posto São Judas Tadeu", logo: "/lovable-uploads/partner-16.jpeg" },
  { name: "Dr. Miquele Adriano", logo: "/lovable-uploads/partner-17.jpeg" },
  { name: "Empório das Tintas", logo: "/lovable-uploads/partner-18.png" },
  { name: "Nova", logo: "/lovable-uploads/partner-19.png" },
  { name: "Ponto da Ressaca", logo: "/lovable-uploads/partner-20.jpeg" },
  { name: "Master Frio", logo: "/lovable-uploads/partner-21.jpeg" },
  { name: "Central Energia", logo: "/lovable-uploads/partner-22.jpeg" },
  { name: "Casa das Calhas Bom Preço", logo: "/lovable-uploads/partner-23.png" },
];

export const PartnersSection = () => {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Handshake className="w-4 h-4" />
            <span>Parcerias</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nossos <span className="text-primary">Parceiros</span>
          </h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Empresas que confiam na Click Serviços para conectar seus negócios aos melhores profissionais.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium flex items-center justify-center aspect-[4/3] border border-primary/5 cursor-pointer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

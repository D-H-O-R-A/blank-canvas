import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import reviewPerson1 from "@/assets/review-person-1.jpg";
import reviewPerson2 from "@/assets/review-person-2.jpg";
import reviewPerson3 from "@/assets/review-person-3.jpg";
import reviewPerson4 from "@/assets/review-person-4.jpg";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Testadora Beta",
      avatar: reviewPerson1,
      rating: 5,
      text: "Testei a plataforma e achei incrível a facilidade de encontrar profissionais. A interface é muito intuitiva e prática!"
    },
    {
      name: "João Santos",
      role: "Profissional Pré-cadastrado",
      avatar: reviewPerson2,
      rating: 5,
      text: "Me pré-cadastrei e já estou ansioso para começar. A proposta da Click Serviços é exatamente o que o mercado precisava!"
    },
    {
      name: "Ana Costa",
      role: "Testadora Beta",
      avatar: reviewPerson3,
      rating: 5,
      text: "A facilidade de navegação e a proposta de conectar clientes a profissionais verificados me conquistou. Mal posso esperar!"
    },
    {
      name: "Carlos Oliveira",
      role: "Profissional Pré-cadastrado",
      avatar: reviewPerson4,
      rating: 5,
      text: "Plataforma com muito potencial. A ideia de ter um perfil profissional e receber clientes diretamente é fantástica!"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4 fill-current" />
            <span>Depoimentos</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            O que nossos{" "}
            <span className="text-primary">testadores e profissionais</span>{" "}
            estão dizendo
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Pessoas que já testaram a plataforma e profissionais pré-cadastrados compartilham suas impressões.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Quote className="w-5 h-5 text-primary" />
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-3">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-medium text-foreground text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-white rounded-3xl p-8 md:p-12 shadow-soft"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { stat: "4.9/5", label: "Avaliação dos testadores", showStars: true },
              { stat: "+1k", label: "Profissionais pré-cadastrados" },
              { stat: "+150", label: "Categorias de serviço" },
              { stat: "99%", label: "Aprovação nos testes" },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }}>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">{item.stat}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
                {item.showStars && (
                  <div className="flex justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

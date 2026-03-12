import { motion } from "framer-motion";
import { Shield, Zap, Users, CheckCircle, ArrowRight, Star, TrendingUp } from "lucide-react";
import proJoao from "@/assets/pro-joao.jpg";
import proMaria from "@/assets/pro-maria.jpg";
import proCarlos from "@/assets/pro-carlos.jpg";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6 },
};

export const AboutSection = () => {
  const principles = [
    {
      icon: Shield,
      title: "Segurança",
      description: "Profissionais verificados com validação de dados e acompanhamento de reputação na plataforma",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Rapidez",
      description: "Encontre e contrate o profissional ideal em poucos cliques, de forma simples e ágil",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Confiança",
      description: "Avaliações reais de outros clientes e transparência total na escolha do profissional",
      color: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <section id="sobre" className="section-padding bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-l from-primary/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div className="text-center max-w-4xl mx-auto mb-12 lg:mb-20" {...fadeInUp}>
          <div className="inline-flex items-center gap-3 glass-effect text-primary px-6 py-3 rounded-2xl text-sm font-semibold mb-6 lg:mb-8">
            <Star className="w-5 h-5 fill-current" />
            <span>Sobre a Plataforma</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 lg:mb-8 leading-tight">
            Conectamos{" "}
            <span className="text-gradient-primary relative">
              necessidades
              <div className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-emerald opacity-20 rounded-full transform -rotate-1"></div>
            </span>{" "}
            com{" "}
            <span className="text-gradient-primary relative">
              soluções
              <div className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-emerald opacity-20 rounded-full transform rotate-1"></div>
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed font-light">
            A Click Serviços revoluciona a forma como você encontra profissionais qualificados.
            <br className="hidden md:block" />
            Tecnologia de ponta, experiência humana excepcional.
          </p>
        </motion.div>

        {/* Three Principles */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-8 mb-16 lg:mb-24">
          {principles.map((principle, i) => (
            <motion.div
              key={principle.title}
              className="group hover-lift"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <div className="relative bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-soft border border-primary/5 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${principle.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="relative z-10 mb-4 lg:mb-6">
                  <div className={`w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br ${principle.color} rounded-xl lg:rounded-2xl flex items-center justify-center shadow-medium group-hover:shadow-large group-hover:scale-110 transition-all duration-500`}>
                    <principle.icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3 lg:mb-4 group-hover:text-primary transition-colors duration-300">
                    {principle.title}
                  </h3>
                  <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">{principle.description}</p>
                </div>
                <div className="absolute inset-0 rounded-2xl lg:rounded-3xl border-2 border-transparent group-hover:border-primary/20 transition-all duration-500"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Persuasive Section */}
        <motion.div
          className="bg-gradient-to-br from-navy to-navy-light rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-16 mb-16 lg:mb-24 text-white relative overflow-hidden"
          {...fadeInUp}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium mb-4 lg:mb-6">
                <TrendingUp className="w-4 h-4" />
                <span>Por que a Click Serviços?</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 lg:mb-6 leading-tight">
                Seu próximo cliente está a um clique de distância
              </h3>
              <p className="text-white/80 text-sm lg:text-lg leading-relaxed mb-6 lg:mb-8">
                A Click Serviços é a sua vitrine digital. 
                Profissionais que se cadastram aumentam sua visibilidade, conquistam novos clientes 
                e constroem uma reputação sólida com avaliações verificadas.
              </p>
              <div className="space-y-3 lg:space-y-4">
                {[
                  "Apareça para clientes na sua região",
                  "Receba agendamentos diretamente no seu celular",
                  "Construa sua marca pessoal com perfil profissional",
                  "Planos acessíveis — você fica com o que é seu",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-white/90 text-sm lg:text-base">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:gap-6">
              {[
                { number: "+1k", label: "Pré-cadastrados" },
                { number: "24h", label: "Para 1º cliente*" },
                { number: "4.9★", label: "Avaliação testadores" },
                { number: "0%", label: "Taxa de adesão*" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 text-center hover:bg-white/15 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <div className="text-2xl lg:text-3xl font-black text-primary mb-1">{stat.number}</div>
                  <div className="text-xs lg:text-sm text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
          <p className="text-white/50 text-xs mt-6 text-center">*Estimativas baseadas em testes internos. Resultados podem variar.</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl lg:rounded-3xl p-6 lg:p-12"
          {...fadeInUp}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 text-center">
            {[
              { value: "+1k", title: "Pro pré-cadastrado", sub: "E crescendo" },
              { value: "+150", title: "Tipos de serviços", sub: "Categorias disponíveis" },
              { value: "4.9★", title: "Avaliação dos testadores", sub: "Média da plataforma" },
              { value: "99%", title: "Satisfação", sub: "Dos testadores" },
            ].map((stat, i) => (
              <div key={i} className="group">
                <motion.div className="text-3xl lg:text-5xl font-black text-primary mb-2 lg:mb-3" whileHover={{ scale: 1.1 }}>
                  {stat.value}
                </motion.div>
                <div className="text-sm lg:text-lg font-semibold text-foreground mb-1">{stat.title}</div>
                <div className="text-xs lg:text-sm text-muted-foreground">{stat.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <div className="mt-16 lg:mt-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div className="space-y-6 lg:space-y-8" {...fadeInUp}>
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground">Por que somos diferentes?</h3>
            <div className="space-y-4 lg:space-y-6">
              <motion.div className="flex items-start gap-4 p-3 lg:p-4 rounded-2xl hover:bg-primary/5 transition-colors duration-300" whileHover={{ x: 5 }}>
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm lg:text-base">Verificação em 3 níveis</h4>
                  <p className="text-muted-foreground text-sm lg:text-base">Background check, validação com base em experiências na plataforma e verificação de dados do profissional.</p>
                </div>
              </motion.div>

              <motion.div className="flex items-start gap-4 p-3 lg:p-4 rounded-2xl hover:bg-primary/5 transition-colors duration-300" whileHover={{ x: 5 }}>
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-sm lg:text-base">Matching inteligente</h4>
                  <p className="text-muted-foreground text-sm lg:text-base">IA que conecta você com o profissional ideal baseado em localização, especialidade, disponibilidade e necessidade.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative z-10 bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl">
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-emerald rounded-xl lg:rounded-2xl flex items-center justify-center">
                    <Star className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm lg:text-base">Match perfeito encontrado!</div>
                    <div className="text-xs lg:text-sm text-muted-foreground">3 profissionais disponíveis agora</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "João Silva", role: "Eletricista • 4.9★ • 2.1km", price: "R$ 120", img: proJoao, highlight: true },
                    { name: "Maria Santos", role: "Eletricista • 4.8★ • 3.5km", price: "R$ 150", img: proMaria, highlight: false },
                    { name: "Carlos Lima", role: "Eletricista • 4.7★ • 4.2km", price: "R$ 130", img: proCarlos, highlight: false },
                  ].map((pro, i) => (
                    <motion.div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer ${pro.highlight ? "bg-primary/5" : "border border-primary/10"}`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <img src={pro.img} alt={pro.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm">{pro.name}</div>
                        <div className="text-xs lg:text-sm text-muted-foreground truncate">{pro.role}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-sm font-medium ${pro.highlight ? "text-primary" : "text-foreground"}`}>{pro.price}</div>
                        <div className="text-xs text-muted-foreground">Visita</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  className="w-full bg-gradient-emerald text-white py-3 lg:py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Contratar João Silva
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </div>
            </div>

            <motion.div
              className="absolute -top-4 -right-4 bg-success text-white px-4 py-2 rounded-2xl text-sm font-medium shadow-large hidden sm:block"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              Disponível agora
            </motion.div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 shadow-large hidden sm:block">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Verificado</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

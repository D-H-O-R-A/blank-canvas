import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Shield, FileText } from "lucide-react";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-28 pb-20">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-foreground mb-4">
                Termos de Uso
              </h1>
              <p className="text-muted-foreground">
                Última atualização: Março de 2025
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none space-y-8 text-foreground/90">
              <section>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  1. Objeto
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  A plataforma <strong>Click Serviços</strong> é uma intermediadora digital que conecta
                  pessoas que necessitam de serviços com profissionais qualificados cadastrados na
                  plataforma. A Click Serviços <strong>não é prestadora de serviços</strong>, atuando
                  exclusivamente como facilitadora do encontro entre contratantes e profissionais.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Ao utilizar a plataforma, o usuário declara ter lido, compreendido e aceito
                  integralmente estes Termos de Uso, em conformidade com o Código de Defesa do
                  Consumidor (Lei nº 8.078/1990), o Marco Civil da Internet (Lei nº 12.965/2014) e a
                  Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">2. Cadastro e Conta</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para utilizar os serviços da plataforma, o usuário deve realizar cadastro fornecendo
                  informações verdadeiras, completas e atualizadas. O usuário é responsável por manter
                  a confidencialidade de suas credenciais de acesso e por todas as atividades
                  realizadas em sua conta.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>O cadastro é pessoal e intransferível.</li>
                  <li>O usuário deve ser maior de 18 anos ou possuir autorização legal.</li>
                  <li>
                    Informações falsas podem resultar no cancelamento imediato da conta, sem
                    direito a reembolso.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">
                  3. Obrigações do Profissional
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  O profissional cadastrado na plataforma compromete-se a:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Fornecer informações verdadeiras sobre suas qualificações e experiência.</li>
                  <li>Prestar os serviços contratados com diligência, qualidade e pontualidade.</li>
                  <li>Manter suas informações de contato e perfil atualizados.</li>
                  <li>
                    Respeitar os prazos e condições acordados diretamente com o contratante.
                  </li>
                  <li>Cumprir todas as obrigações fiscais e trabalhistas aplicáveis.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">
                  4. Obrigações do Contratante
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  O contratante compromete-se a:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    Fornecer informações claras e completas sobre o serviço desejado.
                  </li>
                  <li>
                    Tratar o profissional com respeito e dignidade durante toda a prestação do
                    serviço.
                  </li>
                  <li>
                    Realizar os pagamentos conforme acordado com o profissional.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">
                  5. Pagamentos e Planos de Assinatura
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  A Click Serviços oferece planos de assinatura para profissionais que desejam
                  disponibilizar seus serviços na plataforma. Os valores, condições e benefícios de
                  cada plano estão descritos na página de cadastro profissional.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    Os pagamentos são processados por meio do <strong>Mercado Pago</strong>, em
                    ambiente seguro.
                  </li>
                  <li>
                    A cobrança é recorrente conforme o plano escolhido (mensal, trimestral ou anual).
                  </li>
                  <li>
                    A plataforma não armazena dados de cartão de crédito, sendo o processamento
                    realizado integralmente pelo gateway de pagamento.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">
                  6. Responsabilidades e Limitações
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  A Click Serviços atua exclusivamente como <strong>intermediadora</strong> e não se
                  responsabiliza por:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    Qualidade, adequação ou resultado dos serviços prestados pelos profissionais.
                  </li>
                  <li>
                    Danos diretos ou indiretos decorrentes da relação entre contratante e
                    profissional.
                  </li>
                  <li>
                    Indisponibilidade temporária da plataforma por motivos técnicos ou de força
                    maior.
                  </li>
                  <li>
                    Condutas dos usuários que violem estes Termos ou a legislação vigente.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">
                  7. Cancelamento e Reembolso
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  O profissional pode cancelar sua assinatura a qualquer momento. Conforme o Código de
                  Defesa do Consumidor (art. 49), o usuário tem direito de arrependimento no prazo de
                  7 (sete) dias corridos a partir da contratação, com direito a reembolso integral.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Após o período de arrependimento, o cancelamento será efetivado ao final do ciclo de
                  cobrança vigente, sem direito a reembolso proporcional, salvo disposição legal em
                  contrário.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">
                  8. Propriedade Intelectual
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Todo o conteúdo da plataforma Click Serviços, incluindo, mas não se limitando a,
                  textos, imagens, logotipos, layout, código-fonte e design, é de propriedade
                  exclusiva da Click Serviços ou de seus licenciadores, protegido pela Lei de Direitos
                  Autorais (Lei nº 9.610/1998) e demais legislação aplicável.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">
                  9. Modificações dos Termos
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  A Click Serviços reserva-se o direito de alterar estes Termos de Uso a qualquer
                  momento, mediante publicação da versão atualizada na plataforma. O uso continuado
                  após a publicação das alterações constitui aceitação dos novos termos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">
                  10. Foro Competente
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Fica eleito o foro da comarca do domicílio do usuário, conforme previsto no art. 101,
                  I, do Código de Defesa do Consumidor (Lei nº 8.078/1990), para dirimir quaisquer
                  controvérsias decorrentes destes Termos de Uso.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">11. Contato</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para dúvidas, sugestões ou reclamações relacionadas a estes Termos de Uso, entre em
                  contato conosco através da página de{" "}
                  <a href="/contato" className="text-primary hover:underline font-medium">
                    Contato
                  </a>
                  .
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfUse;

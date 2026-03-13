import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserCheck, Database, Trash2, Mail } from "lucide-react";
import lgpdSeal from "@/assets/lgpd-seal.png";

const PrivacyPolicy = () => {
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
              <img
                src={lgpdSeal}
                alt="Selo LGPD - Lei Geral de Proteção de Dados"
                className="w-20 h-20 mx-auto mb-6 object-contain"
              />
              <h1 className="text-3xl lg:text-4xl font-black text-foreground mb-4">
                Política de Privacidade
              </h1>
              <p className="text-muted-foreground mb-2">
                Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)
              </p>
              <p className="text-muted-foreground text-sm">
                Última atualização: Março de 2025
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none space-y-8 text-foreground/90">
              <section>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  1. Introdução
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  A <strong>Click Serviços</strong> tem o compromisso de proteger a privacidade e os
                  dados pessoais de seus usuários, em conformidade com a Lei Geral de Proteção de
                  Dados Pessoais (LGPD — Lei nº 13.709/2018), o Marco Civil da Internet (Lei nº
                  12.965/2014) e demais legislações aplicáveis.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos,
                  compartilhamos e protegemos seus dados pessoais ao utilizar nossa plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  2. Dados Coletados
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Coletamos os seguintes dados pessoais para a prestação de nossos serviços:
                </p>
                <div className="bg-muted/50 rounded-2xl p-6 space-y-3">
                  <h3 className="font-semibold text-foreground">Dados de cadastro:</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Nome completo</li>
                    <li>Endereço de e-mail</li>
                    <li>Número de telefone/WhatsApp</li>
                    <li>CPF (para profissionais)</li>
                    <li>Endereço e cidade de atuação</li>
                  </ul>
                  <h3 className="font-semibold text-foreground mt-4">Dados profissionais:</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Categoria de serviço e especialidades</li>
                    <li>Experiência profissional</li>
                    <li>Foto de perfil</li>
                  </ul>
                  <h3 className="font-semibold text-foreground mt-4">Dados de pagamento:</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>
                      Dados de transação processados pelo Mercado Pago (não armazenamos dados de
                      cartão)
                    </li>
                  </ul>
                  <h3 className="font-semibold text-foreground mt-4">Dados de navegação:</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Endereço IP, tipo de navegador e dispositivo</li>
                    <li>Páginas acessadas e tempo de permanência</li>
                    <li>Cookies e tecnologias similares</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  3. Finalidade e Base Legal
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos seus dados pessoais com as seguintes finalidades e bases legais,
                  conforme art. 7º da LGPD:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-muted-foreground border border-border rounded-xl overflow-hidden">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold text-foreground">Finalidade</th>
                        <th className="text-left p-3 font-semibold text-foreground">Base Legal (LGPD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="p-3">Criação e gerenciamento de conta</td>
                        <td className="p-3">Execução de contrato (art. 7º, V)</td>
                      </tr>
                      <tr>
                        <td className="p-3">Conexão entre contratantes e profissionais</td>
                        <td className="p-3">Execução de contrato (art. 7º, V)</td>
                      </tr>
                      <tr>
                        <td className="p-3">Processamento de pagamentos</td>
                        <td className="p-3">Execução de contrato (art. 7º, V)</td>
                      </tr>
                      <tr>
                        <td className="p-3">Envio de comunicações e novidades</td>
                        <td className="p-3">Consentimento (art. 7º, I)</td>
                      </tr>
                      <tr>
                        <td className="p-3">Melhoria da plataforma e análise de uso</td>
                        <td className="p-3">Interesse legítimo (art. 7º, IX)</td>
                      </tr>
                      <tr>
                        <td className="p-3">Cumprimento de obrigações legais</td>
                        <td className="p-3">Obrigação legal (art. 7º, II)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  4. Compartilhamento de Dados
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Seus dados pessoais podem ser compartilhados com os seguintes terceiros, conforme
                  necessário para a operação da plataforma:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Mercado Pago:</strong> para processamento seguro de pagamentos.
                  </li>
                  <li>
                    <strong>Google Firebase:</strong> para armazenamento de dados, autenticação e
                    análise de uso.
                  </li>
                  <li>
                    <strong>Google Analytics:</strong> para métricas de uso e melhoria da experiência.
                  </li>
                  <li>
                    <strong>Autoridades competentes:</strong> quando exigido por lei ou ordem
                    judicial.
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Não comercializamos, vendemos ou alugamos seus dados pessoais a terceiros.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  5. Direitos do Titular dos Dados
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Em conformidade com os artigos 17 a 22 da LGPD, você tem os seguintes direitos em
                  relação aos seus dados pessoais:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: "Confirmação", desc: "Confirmar a existência de tratamento de dados" },
                    { title: "Acesso", desc: "Acessar seus dados pessoais armazenados" },
                    { title: "Correção", desc: "Corrigir dados incompletos, inexatos ou desatualizados" },
                    { title: "Anonimização", desc: "Solicitar anonimização ou bloqueio de dados excessivos" },
                    { title: "Portabilidade", desc: "Solicitar a portabilidade dos dados a outro fornecedor" },
                    { title: "Eliminação", desc: "Solicitar a eliminação dos dados tratados com consentimento" },
                    { title: "Informação", desc: "Saber com quem seus dados foram compartilhados" },
                    { title: "Revogação", desc: "Revogar o consentimento a qualquer momento" },
                  ].map((right) => (
                    <div
                      key={right.title}
                      className="bg-muted/50 rounded-xl p-4 border border-border/50"
                    >
                      <h4 className="font-semibold text-foreground text-sm">{right.title}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{right.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Para exercer qualquer desses direitos, entre em contato conosco através da página de{" "}
                  <a href="/contato" className="text-primary hover:underline font-medium">
                    Contato
                  </a>{" "}
                  ou pelo e-mail do Encarregado de Dados (DPO) indicado abaixo.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">
                  6. Cookies e Tecnologias de Rastreamento
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência na
                  plataforma. Os cookies podem ser:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Essenciais:</strong> necessários para o funcionamento básico da
                    plataforma.
                  </li>
                  <li>
                    <strong>De desempenho:</strong> coletam informações anônimas sobre como os
                    usuários utilizam o site.
                  </li>
                  <li>
                    <strong>Funcionais:</strong> permitem personalizar a experiência do usuário.
                  </li>
                  <li>
                    <strong>De marketing:</strong> utilizados para exibir anúncios relevantes.
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Você pode gerenciar suas preferências de cookies através das configurações do seu
                  navegador.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-primary" />
                  7. Retenção e Eliminação de Dados
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Seus dados pessoais serão armazenados pelo tempo necessário para cumprir as
                  finalidades descritas nesta Política, observando os seguintes prazos:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>
                    <strong>Dados de conta:</strong> mantidos enquanto a conta estiver ativa. Após
                    exclusão, os dados são eliminados em até 30 dias.
                  </li>
                  <li>
                    <strong>Dados financeiros:</strong> mantidos por 5 anos conforme legislação
                    fiscal (CTN, art. 173).
                  </li>
                  <li>
                    <strong>Registros de acesso:</strong> mantidos por 6 meses conforme o Marco Civil
                    da Internet (art. 15).
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">
                  8. Segurança dos Dados
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados
                  pessoais contra acesso não autorizado, destruição, perda, alteração ou qualquer
                  forma de tratamento inadequado, incluindo:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
                  <li>Controle de acesso restrito a dados pessoais</li>
                  <li>Monitoramento e registro de acessos (logs)</li>
                  <li>Infraestrutura em nuvem com certificações de segurança (Google Cloud)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  9. Encarregado de Dados (DPO)
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Conforme o art. 41 da LGPD, o Encarregado de Proteção de Dados (DPO) da Click
                  Serviços pode ser contatado para quaisquer questões relacionadas ao tratamento de
                  dados pessoais:
                </p>
                <div className="bg-muted/50 rounded-2xl p-6 border border-border/50">
                  <p className="text-foreground font-semibold">Encarregado de Dados (DPO)</p>
                  <p className="text-muted-foreground">
                    E-mail:{" "}
                    <a
                      href="mailto:privacidade@clickservicos.com.br"
                      className="text-primary hover:underline"
                    >
                      privacidade@clickservicos.com.br
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    Ou através da nossa página de{" "}
                    <a href="/contato" className="text-primary hover:underline font-medium">
                      Contato
                    </a>
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-foreground">
                  10. Alterações desta Política
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Esta Política de Privacidade pode ser atualizada periodicamente. Quaisquer
                  alterações serão publicadas nesta página com a data da última atualização. O uso
                  continuado da plataforma após as alterações constitui aceitação da política
                  atualizada.
                </p>
              </section>

              {/* LGPD Seal */}
              <div className="flex items-center justify-center gap-4 pt-8 border-t border-border">
                <img
                  src={lgpdSeal}
                  alt="Selo LGPD"
                  className="w-14 h-14 object-contain"
                />
                <div>
                  <p className="text-foreground font-semibold text-sm">
                    Em conformidade com a LGPD
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Lei Geral de Proteção de Dados — Lei nº 13.709/2018
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

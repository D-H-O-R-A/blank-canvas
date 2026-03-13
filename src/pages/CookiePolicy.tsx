import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, Cookie } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-custom py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Cookie className="w-8 h-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Política de Cookies
            </h1>
          </div>
          <p className="text-muted-foreground mb-8 text-sm sm:text-base">
            Última atualização: 13 de março de 2026
          </p>

          <div className="prose prose-sm sm:prose-base max-w-none space-y-8">
            {/* O que são cookies */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">1. O que são Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies são pequenos arquivos de texto armazenados no seu navegador ou dispositivo quando você
                visita um site. Eles permitem que o site reconheça seu dispositivo e armazene informações sobre
                suas preferências ou ações anteriores. Os cookies são amplamente utilizados para fazer sites
                funcionarem de maneira mais eficiente e fornecer informações aos proprietários do site.
              </p>
            </section>

            {/* Base Legal */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">2. Base Legal (LGPD)</h2>
              <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4 sm:p-6">
                <Shield className="w-6 h-6 text-primary shrink-0 mt-1" />
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)</strong>,
                  utilizamos cookies com base no seu <strong>consentimento</strong> (Art. 7º, I) e no
                  nosso <strong>legítimo interesse</strong> (Art. 7º, IX) para cookies estritamente necessários
                  ao funcionamento da plataforma. Você pode revogar seu consentimento a qualquer momento.
                </p>
              </div>
            </section>

            {/* Tipos de Cookies */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">3. Tipos de Cookies Utilizados</h2>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.1 Cookies Essenciais</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Necessários para o funcionamento básico da plataforma. Não podem ser desativados.
              </p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Cookie</TableHead>
                      <TableHead className="text-xs sm:text-sm">Finalidade</TableHead>
                      <TableHead className="text-xs sm:text-sm">Duração</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-xs sm:text-sm font-mono">cookie-consent</TableCell>
                      <TableCell className="text-xs sm:text-sm">Armazena sua escolha de consentimento de cookies</TableCell>
                      <TableCell className="text-xs sm:text-sm">1 ano</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs sm:text-sm font-mono">firebase:authUser</TableCell>
                      <TableCell className="text-xs sm:text-sm">Autenticação e sessão do usuário</TableCell>
                      <TableCell className="text-xs sm:text-sm">Sessão</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.2 Cookies de Desempenho</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Coletam informações sobre como você utiliza a plataforma para melhorar o desempenho.
              </p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Cookie</TableHead>
                      <TableHead className="text-xs sm:text-sm">Finalidade</TableHead>
                      <TableHead className="text-xs sm:text-sm">Duração</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-xs sm:text-sm font-mono">_ga</TableCell>
                      <TableCell className="text-xs sm:text-sm">Google Analytics — identificação de visitantes únicos</TableCell>
                      <TableCell className="text-xs sm:text-sm">2 anos</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs sm:text-sm font-mono">_ga_*</TableCell>
                      <TableCell className="text-xs sm:text-sm">Firebase Analytics — persistência do estado da sessão</TableCell>
                      <TableCell className="text-xs sm:text-sm">2 anos</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.3 Cookies Funcionais</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Permitem funcionalidades avançadas e personalização, como preferências de idioma.
              </p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Cookie</TableHead>
                      <TableHead className="text-xs sm:text-sm">Finalidade</TableHead>
                      <TableHead className="text-xs sm:text-sm">Duração</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-xs sm:text-sm font-mono">user-preferences</TableCell>
                      <TableCell className="text-xs sm:text-sm">Preferências de interface do usuário</TableCell>
                      <TableCell className="text-xs sm:text-sm">1 ano</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3.4 Cookies de Marketing</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Utilizados para rastrear visitantes em sites e exibir anúncios relevantes. Atualmente,
                a Click Serviços <strong>não utiliza</strong> cookies de marketing de terceiros.
              </p>
            </section>

            {/* Como gerenciar */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">4. Como Gerenciar seus Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4 text-sm sm:text-base">
                Você pode gerenciar ou desativar cookies das seguintes formas:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 text-sm sm:text-base">
                <li>
                  <strong>Banner de consentimento:</strong> Ao acessar a plataforma pela primeira vez, você pode
                  escolher entre aceitar todos os cookies ou apenas os essenciais.
                </li>
                <li>
                  <strong>Configurações do navegador:</strong> A maioria dos navegadores permite que você controle
                  cookies pelas configurações. Consulte a documentação do seu navegador.
                </li>
                <li>
                  <strong>Revogar consentimento:</strong> Você pode limpar os cookies do navegador a qualquer
                  momento para redefinir suas preferências.
                </li>
              </ul>
            </section>

            {/* Direitos */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">5. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4 text-sm sm:text-base">
                Conforme a LGPD, você tem direito a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 text-sm sm:text-base">
                <li>Saber quais cookies estão sendo utilizados</li>
                <li>Revogar o consentimento para cookies não essenciais</li>
                <li>Solicitar a exclusão de dados coletados por cookies</li>
                <li>Obter informações claras sobre o tratamento de dados</li>
              </ul>
            </section>

            {/* Contato */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">6. Contato</h2>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Para exercer seus direitos ou esclarecer dúvidas sobre o uso de cookies, entre em contato
                com nosso Encarregado de Proteção de Dados (DPO):
              </p>
              <div className="bg-muted/50 rounded-xl p-4 sm:p-6 mt-4">
                <p className="text-foreground font-semibold">Click Serviços — DPO</p>
                <p className="text-muted-foreground text-sm sm:text-base">
                  E-mail: privacidade@clickservicos.com.br
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;

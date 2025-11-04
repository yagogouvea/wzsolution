'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/pt"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o site
          </Link>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Política de Privacidade
          </h1>
          <p className="text-slate-400 text-lg">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8 sm:p-12 space-y-8"
        >
          {/* Introdução */}
          <section className="border-b border-slate-700 pb-6">
            <p className="text-slate-300 leading-relaxed mb-4">
              A <strong className="text-white">WZ Solutions</strong> ("nós", "nosso" ou "empresa") respeita sua privacidade e está comprometida em proteger suas informações pessoais. Esta Política de Privacidade descreve como coletamos, usamos, compartilhamos e protegemos suas informações quando você utiliza nossos serviços, incluindo nosso site, plataforma de criação de sites com inteligência artificial e demais serviços relacionados.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Ao utilizar nossos serviços, você concorda com a coleta e uso de informações de acordo com esta política. Esta política está em conformidade com a <strong className="text-white">Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong> e demais legislações aplicáveis.
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">Última atualização:</strong> {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Informações que Coletamos
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              A <strong className="text-white">WZ Solutions</strong> coleta informações de diferentes formas para fornecer e melhorar nossos serviços:
            </p>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              1.1. Informações Fornecidas Diretamente
            </h3>
            <p className="text-slate-300 leading-relaxed mb-3">
              Quando você interage com nossos serviços, coletamos:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
              <li><strong className="text-white">Dados de identificação:</strong> nome completo, endereço de e-mail, número de telefone/WhatsApp</li>
              <li><strong className="text-white">Dados profissionais:</strong> nome da empresa, cargo, setor de atuação</li>
              <li><strong className="text-white">Dados de projeto:</strong> tipo de projeto desejado, descrição detalhada, requisitos técnicos, preferências de design</li>
              <li><strong className="text-white">Dados de comunicação:</strong> mensagens enviadas através de formulários, chat, e-mail ou WhatsApp</li>
              <li><strong className="text-white">Dados de autenticação:</strong> quando você cria uma conta em nossos sistemas</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              1.2. Informações Coletadas Automaticamente
            </h3>
            <p className="text-slate-300 leading-relaxed mb-3">
              Quando você acessa nosso site ou utiliza nossos serviços, coletamos automaticamente:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
              <li><strong className="text-white">Dados técnicos:</strong> endereço IP, tipo de navegador, sistema operacional, páginas visitadas</li>
              <li><strong className="text-white">Dados de uso:</strong> tempo de permanência no site, cliques, interações com elementos da página</li>
              <li><strong className="text-white">Dados de dispositivo:</strong> informações sobre o dispositivo utilizado (desktop, tablet, mobile)</li>
              <li><strong className="text-white">Cookies e tecnologias similares:</strong> para melhorar a experiência e personalizar conteúdo</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              1.3. Informações de Terceiros
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Podemos receber informações sobre você de terceiros, como provedores de serviços de análise, 
              plataformas de publicidade ou outras empresas parceiras, sempre respeitando as políticas de privacidade aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Como Utilizamos suas Informações
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              A <strong className="text-white">WZ Solutions</strong> utiliza suas informações pessoais para os seguintes propósitos:
            </p>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              2.1. Prestação de Serviços
            </h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
              <li>Processar e responder suas solicitações de orçamento e contato</li>
              <li>Desenvolver e personalizar sites, aplicativos e soluções digitais conforme suas necessidades</li>
              <li>Gerar conteúdo utilizando inteligência artificial para seus projetos</li>
              <li>Gerenciar sua conta e projetos em nossos sistemas</li>
              <li>Fornecer suporte técnico e atendimento ao cliente</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              2.2. Comunicação
            </h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
              <li>Enviar informações sobre o status de seus projetos</li>
              <li>Responder suas dúvidas e solicitações</li>
              <li>Enviar comunicações de marketing (apenas com seu consentimento)</li>
              <li>Notificar sobre atualizações importantes de nossos serviços</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              2.3. Melhoria dos Serviços
            </h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
              <li>Analisar padrões de uso para melhorar nossos serviços</li>
              <li>Desenvolver novos recursos e funcionalidades</li>
              <li>Personalizar sua experiência de uso</li>
              <li>Realizar pesquisas e análises de mercado</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              2.4. Conformidade Legal
            </h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Cumprir obrigações legais e regulatórias</li>
              <li>Responder a solicitações de autoridades competentes</li>
              <li>Proteger nossos direitos legais e prevenir fraudes</li>
              <li>Garantir a segurança de nossos sistemas e usuários</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Compartilhamento de Informações
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              A <strong className="text-white">WZ Solutions</strong> valoriza sua privacidade e <strong className="text-white">não vende, aluga ou comercializa</strong> suas informações pessoais para terceiros. Compartilhamos informações apenas nas seguintes situações:
            </p>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              3.1. Prestadores de Serviços
            </h3>
            <p className="text-slate-300 leading-relaxed mb-3">
              Podemos compartilhar informações com provedores de serviços que nos auxiliam na operação, incluindo:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
              <li>Provedores de hospedagem e infraestrutura em nuvem</li>
              <li>Serviços de processamento de pagamento</li>
              <li>Plataformas de análise e métricas</li>
              <li>Serviços de e-mail e comunicação</li>
              <li>Provedores de serviços de inteligência artificial</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mb-4">
              Todos esses prestadores são contratualmente obrigados a proteger suas informações e utilizá-las apenas para os fins autorizados.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              3.2. Requisitos Legais
            </h3>
            <p className="text-slate-300 leading-relaxed mb-3">
              Podemos divulgar informações quando necessário para:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
              <li>Cumprir leis, regulamentos ou processos legais</li>
              <li>Responder a solicitações de autoridades governamentais</li>
              <li>Proteger nossos direitos, propriedade ou segurança</li>
              <li>Proteger os direitos, propriedade ou segurança de nossos usuários</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              3.3. Com Seu Consentimento
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Compartilhamos informações com terceiros quando você nos dá consentimento explícito para fazê-lo, 
              ou quando você opta por compartilhar informações através de nossos serviços (por exemplo, ao usar 
              funcionalidades de compartilhamento social).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Segurança dos Dados
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              A <strong className="text-white">WZ Solutions</strong> implementa medidas de segurança técnicas e organizacionais robustas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              4.1. Medidas de Segurança Técnicas
            </h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
              <li>Criptografia SSL/TLS para transmissão de dados</li>
              <li>Armazenamento seguro em servidores com certificações de segurança</li>
              <li>Backups regulares e sistemas de recuperação de desastres</li>
              <li>Monitoramento contínuo de sistemas e detecção de ameaças</li>
              <li>Controles de acesso baseados em permissões</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              4.2. Medidas de Segurança Organizacionais
            </h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
              <li>Treinamento regular de funcionários sobre proteção de dados</li>
              <li>Políticas internas de acesso e confidencialidade</li>
              <li>Auditorias periódicas de segurança</li>
              <li>Gestão de incidentes e planos de resposta</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              4.3. Limitações
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Embora nos esforcemos para proteger suas informações pessoais, nenhum método de transmissão pela Internet 
              ou armazenamento eletrônico é 100% seguro. Não podemos garantir segurança absoluta, mas comprometemo-nos 
              a notificá-lo imediatamente em caso de violação de dados que possa afetá-lo, conforme exigido pela LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Seus Direitos (LGPD)
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a exclusão de dados desnecessários ou excessivos</li>
              <li>Solicitar a portabilidade dos dados</li>
              <li>Revogar seu consentimento a qualquer momento</li>
              <li>Saber com quem compartilhamos seus dados</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Para exercer seus direitos, entre em contato conosco através do e-mail: 
              <a href="mailto:contact@wzsolutions.com.br" className="text-cyan-400 hover:text-cyan-300 ml-1">
                contact@wzsolutions.com.br
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              6. Cookies e Tecnologias Similares
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              A <strong className="text-white">WZ Solutions</strong> utiliza cookies e tecnologias similares para melhorar sua experiência, analisar o uso do site e personalizar conteúdo.
            </p>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              6.1. Tipos de Cookies Utilizados
            </h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
              <li><strong className="text-white">Cookies essenciais:</strong> necessários para o funcionamento básico do site</li>
              <li><strong className="text-white">Cookies de desempenho:</strong> coletam informações sobre como você usa o site</li>
              <li><strong className="text-white">Cookies de funcionalidade:</strong> permitem que o site lembre suas preferências</li>
              <li><strong className="text-white">Cookies de marketing:</strong> utilizados para exibir anúncios relevantes (com seu consentimento)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              6.2. Gerenciamento de Cookies
            </h3>
            <p className="text-slate-300 leading-relaxed mb-3">
              Você pode gerenciar suas preferências de cookies através das configurações do seu navegador. 
              No entanto, ao desabilitar cookies essenciais, algumas funcionalidades do site podem não funcionar corretamente.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Para mais informações sobre como gerenciar cookies, consulte:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mt-3">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/pt-BR/kb/desativar-cookies-que-os-sites-usam-para-rastrear" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">Safari</a></li>
              <li><a href="https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">Microsoft Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              7. Retenção de Dados
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              A <strong className="text-white">WZ Solutions</strong> mantém suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta política, respeitando os seguintes critérios:
            </p>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              7.1. Critérios de Retenção
            </h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
              <li><strong className="text-white">Duração do relacionamento:</strong> enquanto você utilizar nossos serviços</li>
              <li><strong className="text-white">Obrigações legais:</strong> quando a retenção é exigida por lei</li>
              <li><strong className="text-white">Resolução de disputas:</strong> quando necessário para resolver disputas ou fazer cumprir acordos</li>
              <li><strong className="text-white">Segurança:</strong> quando necessário para proteger nossos direitos legais</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              7.2. Exclusão de Dados
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Quando suas informações pessoais não forem mais necessárias para os propósitos para os quais foram coletadas, 
              ou quando você solicitar a exclusão (e não houver impedimento legal), excluiremos ou anonimizaremos seus dados 
              de forma segura e permanente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              8. Alterações nesta Política
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              A <strong className="text-white">WZ Solutions</strong> pode atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas, serviços ou requisitos legais.
            </p>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              8.1. Notificação de Alterações
            </h3>
            <p className="text-slate-300 leading-relaxed mb-3">
              Quando fizermos alterações significativas nesta política, notificaremos você através de:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4 mb-4">
              <li>Publicação da nova política nesta página</li>
              <li>Atualização da data de "Última atualização"</li>
              <li>Notificação por e-mail (para alterações substanciais)</li>
              <li>Banner ou aviso no site (quando aplicável)</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">
              8.2. Aceitação
            </h3>
            <p className="text-slate-300 leading-relaxed">
              O uso continuado de nossos serviços após a publicação de alterações nesta política constitui sua 
              aceitação das mesmas. Recomendamos que você revise esta política periodicamente para se manter 
              informado sobre como protegemos suas informações.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              9. Contato
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade ou sobre como 
              tratamos suas informações pessoais, entre em contato conosco:
            </p>
            <div className="bg-slate-800/50 rounded-lg p-6 space-y-3">
              <p className="text-slate-300">
                <strong className="text-white">WZ Solutions</strong>
              </p>
              <p className="text-slate-300">
                <strong className="text-white">E-mail:</strong>{' '}
                <a href="mailto:contact@wzsolutions.com.br" className="text-cyan-400 hover:text-cyan-300">
                  contact@wzsolutions.com.br
                </a>
              </p>
              <p className="text-slate-300">
                <strong className="text-white">WhatsApp:</strong>{' '}
                <a href="https://wa.me/5511947293221" className="text-cyan-400 hover:text-cyan-300" target="_blank" rel="noopener noreferrer">
                  +55 11 94729-3221
                </a>
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}


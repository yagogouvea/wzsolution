'use client';

export default function SchemaMarkup() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WZ Solution",
    "description": "Soluções digitais inovadoras para transformar suas ideias em realidade digital. Desenvolvimento de apps mobile, web apps e sites institucionais.",
    "url": "https://app.wzsolutions.com.br",
    "logo": "https://app.wzsolutions.com.br/images/wzlogo_trans.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+55-11-94729-3221",
      "contactType": "customer service",
      "availableLanguage": ["Portuguese", "English"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR",
      "addressRegion": "São Paulo"
    },
    "sameAs": [
      "https://app.wzsolutions.com.br"
    ],
    "foundingDate": "2019",
    "numberOfEmployees": "5-10",
    "areaServed": "Brazil",
    "serviceType": [
      "Desenvolvimento de Software",
      "Apps Mobile",
      "Web Apps",
      "Sites Institucionais",
      "Soluções Personalizadas",
      "Projetos de IA"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "WZ Solution",
    "url": "https://app.wzsolutions.com.br",
    "description": "Desenvolvimento de software, apps mobile, web apps e sites institucionais de alta qualidade.",
    "publisher": {
      "@type": "Organization",
      "name": "WZ Solution",
      "logo": "https://app.wzsolutions.com.br/images/wzlogo_trans.png"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://app.wzsolutions.com.br/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Desenvolvimento de Software",
    "description": "Desenvolvemos soluções digitais inovadoras que impulsionam seu negócio para o futuro.",
    "provider": {
      "@type": "Organization",
      "name": "WZ Solution",
      "url": "https://app.wzsolutions.com.br"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Brazil"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Serviços de Desenvolvimento",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Desenvolvimento de Apps Mobile",
            "description": "Apps nativos e híbridos para iOS e Android com performance otimizada e design moderno."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Desenvolvimento Web",
            "description": "Web apps responsivos e escaláveis com as mais modernas tecnologias do mercado."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Criação de Sites Institucionais",
            "description": "Sites corporativos elegantes e otimizados para conversão e SEO."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Soluções Personalizadas",
            "description": "Desenvolvimento sob medida para atender necessidades específicas do seu negócio."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Projetos IA",
            "description": "Integração de inteligência artificial em seus projetos para automação e análise de dados."
          }
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema)
        }}
      />
    </>
  );
}

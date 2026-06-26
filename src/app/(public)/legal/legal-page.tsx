import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export type LegalKind = "aviso" | "privacidad" | "reembolsos" | "terminos";

type LegalCopy = {
  back: string;
  contact: string;
  updated: string;
  pages: Record<
    LegalKind,
    {
      badge: string;
      intro: string;
      sections: Array<{ text: string; title: string }>;
      title: string;
    }
  >;
};

const legalCopyByLocale: Record<AppLocale, LegalCopy> = {
  ht: {
    back: "Retounen",
    contact: "Pale ak AUM",
    updated: "Mizajou: jen 2026",
    pages: {
      aviso: {
        badge: "Avi legal",
        intro:
          "Enfòmasyon sa a esplike kijan AUM PRODZ prezante sèvis li yo ak kijan kominikasyon ofisyèl fèt.",
        sections: [
          {
            title: "Operasyon",
            text: "AUM PRODZ bay sèvis dijital, kontni, akonpayman ak zouti pou kominote ayisyèn nan.",
          },
          {
            title: "Kominikasyon",
            text: "Kominikasyon sou pwojè, pri ak livrezon fèt atravè chanèl ofisyèl AUM PRODZ yo.",
          },
          {
            title: "Chanjman",
            text: "Kondisyon yo ka mete ajou lè sèvis yo evolye oswa lè gen nouvo kondisyon operasyon.",
          },
        ],
        title: "Avi legal AUM PRODZ",
      },
      privacidad: {
        badge: "Konfidansyalite",
        intro:
          "AUM PRODZ mande sèlman enfòmasyon ki nesesè pou konprann bezwen ou, travay sou pwojè a ak fè swivi.",
        sections: [
          {
            title: "Done nou mande",
            text: "Nou ka mande non, imel, telefòn, lyen kont, fichye oswa enfòmasyon pwojè selon sèvis la.",
          },
          {
            title: "Itilizasyon",
            text: "Done yo itilize pou kontakte w, bay sèvis la, òganize fichye yo epi verifye pwochen etap yo.",
          },
          {
            title: "Aksè ak fichye",
            text: "Aksè ak fichye yo dwe trete ak anpil swen. Nou mande sèlman sa ki nesesè pou travay la.",
          },
        ],
        title: "Politik konfidansyalite",
      },
      reembolsos: {
        badge: "Ranbousman",
        intro:
          "Paske anpil sèvis yo pèsonalize, chak demann ranbousman revize selon etap travay la.",
        sections: [
          {
            title: "Anvan travay kòmanse",
            text: "Si travay la poko kòmanse, demann lan ka revize pou ranbousman selon metòd peman an.",
          },
          {
            title: "Travay ki deja fèt",
            text: "Lè analiz, konsepsyon, dosye oswa livrezon deja fèt, ranbousman an ka limite oswa pa aplikab.",
          },
          {
            title: "Swivi",
            text: "Si gen yon pwoblèm ak sèvis la, kontakte AUM pou revize ka a anvan ouvèti nenpòt reklamasyon.",
          },
        ],
        title: "Politik ranbousman",
      },
      terminos: {
        badge: "Tèm sèvis",
        intro:
          "Lè w itilize oswa mande yon sèvis AUM PRODZ, ou dakò pou travay la fèt ak enfòmasyon klè ak kominikasyon responsab.",
        sections: [
          {
            title: "Sèvis",
            text: "Chak sèvis gen objektif, pri, delè ak livrezon ki dwe konfime anvan travay la avanse.",
          },
          {
            title: "Peman",
            text: "Peman, abònman oswa depo dwe fèt nan chanèl ofisyèl yo epi yo ka depann de tip sèvis la.",
          },
          {
            title: "Responsablite",
            text: "Kliyan an dwe bay enfòmasyon, aksè ak fichye ki kòrèk pou sèvis la ka fèt byen.",
          },
        ],
        title: "Tèm ak kondisyon",
      },
    },
  },
  es: {
    back: "Volver",
    contact: "Hablar con AUM",
    updated: "Actualizado: junio 2026",
    pages: {
      aviso: {
        badge: "Aviso legal",
        intro:
          "Esta información explica cómo AUM PRODZ presenta sus servicios y cómo se maneja la comunicación oficial.",
        sections: [
          {
            title: "Operación",
            text: "AUM PRODZ ofrece servicios digitales, contenido, acompañamiento y herramientas para la comunidad haitiana.",
          },
          {
            title: "Comunicación",
            text: "La comunicación sobre proyectos, precios y entregas se realiza por canales oficiales de AUM PRODZ.",
          },
          {
            title: "Cambios",
            text: "Estas condiciones pueden actualizarse cuando los servicios evolucionen o cambien los requisitos operativos.",
          },
        ],
        title: "Aviso legal de AUM PRODZ",
      },
      privacidad: {
        badge: "Privacidad",
        intro:
          "AUM PRODZ solicita solo la información necesaria para entender tu necesidad, trabajar el proyecto y dar seguimiento.",
        sections: [
          {
            title: "Datos solicitados",
            text: "Podemos solicitar nombre, correo, teléfono, enlaces de cuentas, archivos o información del proyecto según el servicio.",
          },
          {
            title: "Uso de la información",
            text: "Los datos se usan para contactarte, entregar el servicio, organizar archivos y confirmar próximos pasos.",
          },
          {
            title: "Acceso y archivos",
            text: "Los accesos y archivos se tratan con cuidado. Solo pedimos lo necesario para realizar el trabajo.",
          },
        ],
        title: "Política de privacidad",
      },
      reembolsos: {
        badge: "Reembolsos",
        intro:
          "Como muchos servicios son personalizados, cada solicitud de reembolso se revisa según el avance del trabajo.",
        sections: [
          {
            title: "Antes de iniciar",
            text: "Si el trabajo todavía no comenzó, la solicitud puede revisarse para reembolso según el método de pago.",
          },
          {
            title: "Trabajo ya realizado",
            text: "Cuando ya existe análisis, diseño, archivos o entrega parcial, el reembolso puede ser limitado o no aplicar.",
          },
          {
            title: "Seguimiento",
            text: "Si hay un problema con el servicio, contacta a AUM para revisar el caso antes de abrir cualquier reclamo.",
          },
        ],
        title: "Política de reembolsos",
      },
      terminos: {
        badge: "Términos",
        intro:
          "Al usar o solicitar un servicio de AUM PRODZ, aceptas que el trabajo se haga con información clara y comunicación responsable.",
        sections: [
          {
            title: "Servicios",
            text: "Cada servicio tiene objetivo, precio, duración y entregables que deben confirmarse antes de avanzar.",
          },
          {
            title: "Pagos",
            text: "Los pagos, suscripciones o depósitos deben realizarse por canales oficiales y pueden depender del tipo de servicio.",
          },
          {
            title: "Responsabilidad",
            text: "El cliente debe entregar información, accesos y archivos correctos para que el servicio pueda realizarse bien.",
          },
        ],
        title: "Términos y condiciones",
      },
    },
  },
  en: {
    back: "Back",
    contact: "Talk to AUM",
    updated: "Updated: June 2026",
    pages: {
      aviso: {
        badge: "Legal notice",
        intro:
          "This page explains how AUM PRODZ presents its services and handles official communication.",
        sections: [
          {
            title: "Operation",
            text: "AUM PRODZ provides digital services, content, guidance and tools for the Haitian community.",
          },
          {
            title: "Communication",
            text: "Project, pricing and delivery communication happens through official AUM PRODZ channels.",
          },
          {
            title: "Changes",
            text: "These conditions may be updated when services evolve or operational requirements change.",
          },
        ],
        title: "AUM PRODZ legal notice",
      },
      privacidad: {
        badge: "Privacy",
        intro:
          "AUM PRODZ only asks for the information needed to understand your request, work on the project and follow up.",
        sections: [
          {
            title: "Information requested",
            text: "We may request name, email, phone, account links, files or project information depending on the service.",
          },
          {
            title: "Use",
            text: "Information is used to contact you, deliver the service, organize files and confirm next steps.",
          },
          {
            title: "Access and files",
            text: "Access and files are handled carefully. We only request what is needed for the work.",
          },
        ],
        title: "Privacy policy",
      },
      reembolsos: {
        badge: "Refunds",
        intro:
          "Because many services are personalized, each refund request is reviewed according to the progress of the work.",
        sections: [
          {
            title: "Before work begins",
            text: "If work has not started, the request may be reviewed for a refund depending on the payment method.",
          },
          {
            title: "Work already completed",
            text: "When analysis, design, files or partial delivery already exist, refunds may be limited or not applicable.",
          },
          {
            title: "Follow-up",
            text: "If there is an issue with the service, contact AUM to review the case before opening any claim.",
          },
        ],
        title: "Refund policy",
      },
      terminos: {
        badge: "Terms",
        intro:
          "By using or requesting an AUM PRODZ service, you agree that the work depends on clear information and responsible communication.",
        sections: [
          {
            title: "Services",
            text: "Each service has a goal, price, timeline and deliverables that must be confirmed before work moves forward.",
          },
          {
            title: "Payments",
            text: "Payments, subscriptions or deposits must be made through official channels and may depend on the service type.",
          },
          {
            title: "Responsibility",
            text: "The client must provide correct information, access and files so the service can be completed properly.",
          },
        ],
        title: "Terms and conditions",
      },
    },
  },
  fr: {
    back: "Retour",
    contact: "Parler avec AUM",
    updated: "Mis à jour: juin 2026",
    pages: {
      aviso: {
        badge: "Mentions légales",
        intro:
          "Cette page explique comment AUM PRODZ présente ses services et gère la communication officielle.",
        sections: [
          {
            title: "Opération",
            text: "AUM PRODZ propose des services digitaux, du contenu, un accompagnement et des outils pour la communauté haïtienne.",
          },
          {
            title: "Communication",
            text: "La communication sur les projets, prix et livraisons se fait par les canaux officiels AUM PRODZ.",
          },
          {
            title: "Changements",
            text: "Ces conditions peuvent être mises à jour lorsque les services ou les besoins opérationnels évoluent.",
          },
        ],
        title: "Mentions légales AUM PRODZ",
      },
      privacidad: {
        badge: "Confidentialité",
        intro:
          "AUM PRODZ demande seulement les informations nécessaires pour comprendre le besoin, travailler le projet et assurer le suivi.",
        sections: [
          {
            title: "Données demandées",
            text: "Nous pouvons demander nom, email, téléphone, liens de comptes, fichiers ou informations du projet selon le service.",
          },
          {
            title: "Utilisation",
            text: "Les informations servent à vous contacter, livrer le service, organiser les fichiers et confirmer les prochaines étapes.",
          },
          {
            title: "Accès et fichiers",
            text: "Les accès et fichiers sont traités avec soin. Nous demandons uniquement ce qui est nécessaire.",
          },
        ],
        title: "Politique de confidentialité",
      },
      reembolsos: {
        badge: "Remboursements",
        intro:
          "Comme beaucoup de services sont personnalisés, chaque demande de remboursement est étudiée selon l'avancement du travail.",
        sections: [
          {
            title: "Avant le début",
            text: "Si le travail n'a pas commencé, la demande peut être étudiée selon le mode de paiement.",
          },
          {
            title: "Travail déjà réalisé",
            text: "Quand une analyse, un design, des fichiers ou une livraison partielle existent déjà, le remboursement peut être limité.",
          },
          {
            title: "Suivi",
            text: "En cas de problème avec le service, contactez AUM pour revoir le dossier avant toute réclamation.",
          },
        ],
        title: "Politique de remboursement",
      },
      terminos: {
        badge: "Conditions",
        intro:
          "En utilisant ou demandant un service AUM PRODZ, vous acceptez que le travail dépende d'informations claires et d'une communication responsable.",
        sections: [
          {
            title: "Services",
            text: "Chaque service a un objectif, un prix, un délai et des livrables à confirmer avant d'avancer.",
          },
          {
            title: "Paiements",
            text: "Les paiements, abonnements ou dépôts doivent passer par les canaux officiels selon le type de service.",
          },
          {
            title: "Responsabilité",
            text: "Le client doit fournir les informations, accès et fichiers corrects pour réaliser le service.",
          },
        ],
        title: "Conditions générales",
      },
    },
  },
  pt: {
    back: "Voltar",
    contact: "Falar com AUM",
    updated: "Atualizado: junho de 2026",
    pages: {
      aviso: {
        badge: "Aviso legal",
        intro:
          "Esta página explica como a AUM PRODZ apresenta seus serviços e administra a comunicação oficial.",
        sections: [
          {
            title: "Operação",
            text: "AUM PRODZ oferece serviços digitais, conteúdo, acompanhamento e ferramentas para a comunidade haitiana.",
          },
          {
            title: "Comunicação",
            text: "A comunicação sobre projetos, preços e entregas acontece pelos canais oficiais da AUM PRODZ.",
          },
          {
            title: "Mudanças",
            text: "Estas condições podem ser atualizadas quando os serviços evoluem ou requisitos operacionais mudam.",
          },
        ],
        title: "Aviso legal da AUM PRODZ",
      },
      privacidad: {
        badge: "Privacidade",
        intro:
          "AUM PRODZ pede apenas as informações necessárias para entender sua necessidade, trabalhar no projeto e acompanhar.",
        sections: [
          {
            title: "Dados solicitados",
            text: "Podemos pedir nome, email, telefone, links de contas, arquivos ou informações do projeto conforme o serviço.",
          },
          {
            title: "Uso",
            text: "Os dados são usados para contato, entrega do serviço, organização dos arquivos e confirmação dos próximos passos.",
          },
          {
            title: "Acessos e arquivos",
            text: "Acessos e arquivos são tratados com cuidado. Pedimos apenas o necessário para o trabalho.",
          },
        ],
        title: "Política de privacidade",
      },
      reembolsos: {
        badge: "Reembolsos",
        intro:
          "Como muitos serviços são personalizados, cada pedido de reembolso é analisado conforme o avanço do trabalho.",
        sections: [
          {
            title: "Antes de iniciar",
            text: "Se o trabalho ainda não começou, o pedido pode ser analisado para reembolso conforme o método de pagamento.",
          },
          {
            title: "Trabalho já realizado",
            text: "Quando já existe análise, design, arquivos ou entrega parcial, o reembolso pode ser limitado ou não aplicável.",
          },
          {
            title: "Acompanhamento",
            text: "Se houver problema com o serviço, fale com AUM para revisar o caso antes de abrir qualquer reclamação.",
          },
        ],
        title: "Política de reembolsos",
      },
      terminos: {
        badge: "Termos",
        intro:
          "Ao usar ou solicitar um serviço da AUM PRODZ, você aceita que o trabalho depende de informações claras e comunicação responsável.",
        sections: [
          {
            title: "Serviços",
            text: "Cada serviço tem objetivo, preço, prazo e entregáveis que devem ser confirmados antes de avançar.",
          },
          {
            title: "Pagamentos",
            text: "Pagamentos, assinaturas ou depósitos devem ser feitos por canais oficiais e podem depender do tipo de serviço.",
          },
          {
            title: "Responsabilidade",
            text: "O cliente deve fornecer informações, acessos e arquivos corretos para que o serviço seja realizado.",
          },
        ],
        title: "Termos e condições",
      },
    },
  },
};

export async function LegalPage({ kind }: { kind: LegalKind }) {
  const locale = await getCurrentLocale();
  const copy = legalCopyByLocale[locale] ?? legalCopyByLocale.ht;
  const page = copy.pages[kind];

  return (
    <section className="public-section-tight">
      <PublicEventTracker eventName="page_view" page={`/legal/${kind}`} source="legal" />

      <div className="public-shell">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {copy.back}
          </Link>

          <div className="space-y-5">
            <div className="mammouth-pill inline-flex rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-primary">
              {page.badge}
            </div>
            <h1 className="mammouth-title text-4xl sm:text-6xl">
              {page.title}
            </h1>
            <p className="mammouth-subtitle text-xl leading-relaxed">
              {page.intro}
            </p>
            <p className="text-sm font-semibold text-muted-foreground">
              {copy.updated}
            </p>
          </div>

          <div className="mt-10 grid gap-4">
            {page.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.5rem] border border-border bg-surface/78 p-6 shadow-soft"
              >
                <h2 className="text-2xl font-black text-foreground">
                  {section.title}
                </h2>
                <p className="mt-3 text-base font-medium leading-7 text-muted-foreground">
                  {section.text}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/contacto" className={cn(buttonVariants({ size: "lg" }))}>
              {copy.contact}
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/"
              className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}
            >
              {copy.back}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

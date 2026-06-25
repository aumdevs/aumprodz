import type { AppLocale } from "@/lib/i18n/config";

type DictionaryKey =
  | "nav.home"
  | "nav.services"
  | "nav.youtube"
  | "nav.contact"
  | "nav.artists"
  | "footer.platform"
  | "footer.private"
  | "footer.tagline"
  | "home.badge"
  | "home.title"
  | "home.description"
  | "home.services"
  | "home.youtube"
  | "home.whatsapp"
  | "home.servicesBadge"
  | "home.servicesTitle"
  | "home.servicesText"
  | "home.workBadge"
  | "home.workTitle"
  | "home.step1Title"
  | "home.step1Text"
  | "home.step2Title"
  | "home.step2Text"
  | "home.step3Title"
  | "home.step3Text"
  | "artistShell.home"
  | "artistShell.profile"
  | "artistShell.verification"
  | "artistShell.contracts"
  | "artistShell.releases"
  | "artistShell.payments"
  | "artistShell.security"
  | "artistShell.support"
  | "artistShell.dashboard"
  | "artistShell.welcome"
  | "login.title"
  | "login.description"
  | "login.back"
  | "login.email"
  | "login.password"
  | "login.submit"
  | "login.submitting"
  | "login.forgot"
  | "login.resetHelp"
  | "login.resetSubmit"
  | "login.resetSubmitting"
  | "artistLanding.badge"
  | "artistLanding.title"
  | "artistLanding.description"
  | "artistLanding.create"
  | "artistLanding.login"
  | "youtube.badge"
  | "youtube.title"
  | "youtube.description"
  | "empty.reports"
  | "common.view"
  | "common.download"
  | "common.save"
  | "common.cancel";

const dictionaries: Record<AppLocale, Record<DictionaryKey, string>> = {
  ht: {
    "nav.home": "Akèy",
    "nav.services": "Sèvis",
    "nav.youtube": "YouTube",
    "nav.contact": "Kontak",
    "nav.artists": "Atis",
    "footer.platform": "Platfòm",
    "footer.private": "Aksè prive",
    "footer.tagline": "AUM PRODZ Platform - enfrastrikti dijital pou sèvis, atis ak operasyon.",
    "home.badge": "YouTuber + sèvis dijital",
    "home.title": "Mwen se Aum. Mwen fè kontni epi mwen ede w grandi sou dijital.",
    "home.description": "Si ou bezwen mete chanèl ou an lòd, rezoud yon pwoblèm YouTube oswa AdSense, kreye yon sit, amelyore imaj ou oswa avanse mizik ou, ou kòmanse isit la avè m.",
    "home.services": "Gade sèvis mwen yo",
    "home.youtube": "Gade YouTube",
    "home.whatsapp": "Pale ak Aum",
    "home.servicesBadge": "Sa ou ka mande m",
    "home.servicesTitle": "Sèvis klè, fèt pou moun reyèl.",
    "home.servicesText": "Chwazi zòn ou bezwen an epi n ap ale dwat sou pwen an: chanèl ou, sit ou, imaj ou oswa karyè atistik ou.",
    "home.workBadge": "Kijan m travay avè w",
    "home.workTitle": "Pa gen bagay konplike: nou pale, nou verifye epi nou avanse.",
    "home.step1Title": "Ou di m sa ou bezwen",
    "home.step1Text": "Chanèl, sit, miniati, videyo, mizik oswa yon lide ou vle mete an lòd.",
    "home.step2Title": "Mwen revize ka a avè w",
    "home.step2Text": "Mwen di w sa ki vo fè an premye ak sa ki pa vo fòse.",
    "home.step3Title": "Nou fè travay la",
    "home.step3Text": "Sèvis la rete konekte ak WhatsApp pou nou pale klè epi avanse rapid.",
    "artistShell.home": "Akèy",
    "artistShell.profile": "Pwofil",
    "artistShell.verification": "Verifikasyon",
    "artistShell.contracts": "Kontra",
    "artistShell.releases": "Lansman",
    "artistShell.payments": "Peman",
    "artistShell.security": "Sekirite",
    "artistShell.support": "Sipò",
    "artistShell.dashboard": "Dashboard",
    "artistShell.welcome": "Byenveni nan panèl atis la.",
    "login.title": "Aksè kont atis",
    "login.description": "Antre ak imèl ak modpas kont ou.",
    "login.back": "Retounen sou sit piblik la",
    "login.email": "Imèl",
    "login.password": "Modpas",
    "login.submit": "Antre",
    "login.submitting": "Ap antre...",
    "login.forgot": "Mwen bliye modpas mwen",
    "login.resetHelp": "Ekri imèl kont atis ou a epi n ap voye yon lyen pou kreye yon nouvo modpas.",
    "login.resetSubmit": "Voye lyen",
    "login.resetSubmitting": "Ap voye...",
    "artistLanding.badge": "Atis",
    "artistLanding.title": "Karyè mizikal ou kòmanse isit la.",
    "artistLanding.description": "Ak AUM PRODZ li pi fasil pou jere karyè mizikal ou. Nan lojisyèl an ou gen pwofil, lansman, fichye, eta, kontra ak sipò nan yon sèl kote.",
    "artistLanding.create": "Kreye kont",
    "artistLanding.login": "Mwen deja atis",
    "youtube.badge": "YouTube",
    "youtube.title": "Dènye videyo yo",
    "youtube.description": "Videyo ofisyèl ak kontni resan AUM PRODZ.",
    "empty.reports": "Pa gen rapò ankò.",
    "common.view": "Gade",
    "common.download": "Telechaje",
    "common.save": "Sove",
    "common.cancel": "Anile",
  },
  es: {
    "nav.home": "Inicio",
    "nav.services": "Servicios",
    "nav.youtube": "YouTube",
    "nav.contact": "Contacto",
    "nav.artists": "Artistas",
    "footer.platform": "Plataforma",
    "footer.private": "Acceso privado",
    "footer.tagline": "AUM PRODZ Platform - infraestructura digital para servicios, artistas y operación.",
    "home.badge": "YouTuber + servicios digitales",
    "home.title": "Soy Aum. Hago contenido y también te ayudo a crecer en digital.",
    "home.description": "Si necesitas ordenar tu canal, resolver algo de YouTube o AdSense, crear una página web, mejorar tu imagen o mover tu música, aquí empiezas conmigo.",
    "home.services": "Ver mis servicios",
    "home.youtube": "Ver YouTube",
    "home.whatsapp": "Hablar con Aum",
    "home.servicesBadge": "Lo que puedes pedirme",
    "home.servicesTitle": "Servicios claros, hechos para personas reales.",
    "home.servicesText": "Elige el área que necesitas y vamos directo al punto: tu canal, tu web, tu imagen o tu carrera artística.",
    "home.workBadge": "Cómo trabajo contigo",
    "home.workTitle": "Nada complicado: hablamos, revisamos y avanzamos.",
    "home.step1Title": "Me cuentas qué necesitas",
    "home.step1Text": "Canal, web, miniatura, video, música o una idea que quieres ordenar.",
    "home.step2Title": "Reviso el caso contigo",
    "home.step2Text": "Te digo qué conviene hacer primero y qué no vale la pena forzar.",
    "home.step3Title": "Hacemos el trabajo",
    "home.step3Text": "El servicio queda conectado a WhatsApp para hablar claro y avanzar rápido.",
    "artistShell.home": "Inicio",
    "artistShell.profile": "Perfil",
    "artistShell.verification": "Verificación",
    "artistShell.contracts": "Contratos",
    "artistShell.releases": "Lanzamientos",
    "artistShell.payments": "Pagos",
    "artistShell.security": "Seguridad",
    "artistShell.support": "Soporte",
    "artistShell.dashboard": "Dashboard",
    "artistShell.welcome": "Bienvenido al panel de artista.",
    "login.title": "Acceso a cuenta artista",
    "login.description": "Entra con el correo y la contraseña de tu cuenta.",
    "login.back": "Volver a la web pública",
    "login.email": "Email",
    "login.password": "Contraseña",
    "login.submit": "Entrar",
    "login.submitting": "Entrando...",
    "login.forgot": "Olvidé contraseña",
    "login.resetHelp": "Escribe el correo de tu cuenta artista y te enviaremos un enlace para crear una contraseña nueva.",
    "login.resetSubmit": "Enviar enlace",
    "login.resetSubmitting": "Enviando...",
    "artistLanding.badge": "Artistas",
    "artistLanding.title": "Tu carrera musical empieza aquí.",
    "artistLanding.description": "Con AUM PRODZ es más fácil manejar tu carrera musical. En el software tienes tu perfil, tus lanzamientos, archivos, estados, contratos y comunicación con soporte en un solo lugar.",
    "artistLanding.create": "Crear cuenta",
    "artistLanding.login": "Ya soy artista",
    "youtube.badge": "YouTube",
    "youtube.title": "Últimos videos",
    "youtube.description": "Videos oficiales y contenido reciente de AUM PRODZ.",
    "empty.reports": "Todavía no hay reportes.",
    "common.view": "Ver",
    "common.download": "Descargar",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
  },
  en: {
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.youtube": "YouTube",
    "nav.contact": "Contact",
    "nav.artists": "Artists",
    "footer.platform": "Platform",
    "footer.private": "Private access",
    "footer.tagline": "AUM PRODZ Platform - digital infrastructure for services, artists and operations.",
    "home.badge": "YouTuber + digital services",
    "home.title": "I am Aum. I create content and help you grow online.",
    "home.description": "If you need to organize your channel, solve a YouTube or AdSense issue, build a website, improve your image or move your music forward, this is where you start with me.",
    "home.services": "View my services",
    "home.youtube": "View YouTube",
    "home.whatsapp": "Talk to Aum",
    "home.servicesBadge": "What you can ask me",
    "home.servicesTitle": "Clear services made for real people.",
    "home.servicesText": "Choose what you need and we go straight to the point: your channel, website, image or music career.",
    "home.workBadge": "How I work with you",
    "home.workTitle": "Simple: we talk, review and move forward.",
    "home.step1Title": "You tell me what you need",
    "home.step1Text": "A channel, website, thumbnail, video, music or an idea you want to organize.",
    "home.step2Title": "I review the case with you",
    "home.step2Text": "I tell you what makes sense first and what is not worth forcing.",
    "home.step3Title": "We do the work",
    "home.step3Text": "The service stays connected to WhatsApp so we can talk clearly and move fast.",
    "artistShell.home": "Home",
    "artistShell.profile": "Profile",
    "artistShell.verification": "Verification",
    "artistShell.contracts": "Contracts",
    "artistShell.releases": "Releases",
    "artistShell.payments": "Payments",
    "artistShell.security": "Security",
    "artistShell.support": "Support",
    "artistShell.dashboard": "Dashboard",
    "artistShell.welcome": "Welcome to the artist panel.",
    "login.title": "Artist account access",
    "login.description": "Sign in with your account email and password.",
    "login.back": "Back to public website",
    "login.email": "Email",
    "login.password": "Password",
    "login.submit": "Sign in",
    "login.submitting": "Signing in...",
    "login.forgot": "Forgot password",
    "login.resetHelp": "Enter your artist account email and we will send a link to create a new password.",
    "login.resetSubmit": "Send link",
    "login.resetSubmitting": "Sending...",
    "artistLanding.badge": "Artists",
    "artistLanding.title": "Your music career starts here.",
    "artistLanding.description": "With AUM PRODZ it is easier to manage your music career. The software keeps your profile, releases, files, statuses, contracts and support in one place.",
    "artistLanding.create": "Create account",
    "artistLanding.login": "I am already an artist",
    "youtube.badge": "YouTube",
    "youtube.title": "Latest videos",
    "youtube.description": "Official videos and recent AUM PRODZ content.",
    "empty.reports": "No reports yet.",
    "common.view": "View",
    "common.download": "Download",
    "common.save": "Save",
    "common.cancel": "Cancel",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.services": "Services",
    "nav.youtube": "YouTube",
    "nav.contact": "Contact",
    "nav.artists": "Artistes",
    "footer.platform": "Plateforme",
    "footer.private": "Acces prive",
    "footer.tagline": "AUM PRODZ Platform - infrastructure numerique pour services, artistes et operations.",
    "home.badge": "YouTuber + services digitaux",
    "home.title": "Je suis Aum. Je cree du contenu et je vous aide a grandir en ligne.",
    "home.description": "Si vous devez organiser votre chaine, resoudre un probleme YouTube ou AdSense, creer un site, ameliorer votre image ou avancer votre musique, vous commencez ici avec moi.",
    "home.services": "Voir mes services",
    "home.youtube": "Voir YouTube",
    "home.whatsapp": "Parler avec Aum",
    "home.servicesBadge": "Ce que vous pouvez me demander",
    "home.servicesTitle": "Des services clairs pour des personnes reelles.",
    "home.servicesText": "Choisissez ce dont vous avez besoin et nous allons droit au but: votre chaine, site, image ou carriere musicale.",
    "home.workBadge": "Comment je travaille avec vous",
    "home.workTitle": "Simple: on parle, on verifie et on avance.",
    "home.step1Title": "Vous me dites ce dont vous avez besoin",
    "home.step1Text": "Chaine, site, miniature, video, musique ou idee a organiser.",
    "home.step2Title": "Je revise le cas avec vous",
    "home.step2Text": "Je vous dis ce qui vaut la peine de faire d'abord.",
    "home.step3Title": "Nous faisons le travail",
    "home.step3Text": "Le service reste connecte a WhatsApp pour avancer clairement et rapidement.",
    "artistShell.home": "Accueil",
    "artistShell.profile": "Profil",
    "artistShell.verification": "Verification",
    "artistShell.contracts": "Contrats",
    "artistShell.releases": "Sorties",
    "artistShell.payments": "Paiements",
    "artistShell.security": "Securite",
    "artistShell.support": "Support",
    "artistShell.dashboard": "Dashboard",
    "artistShell.welcome": "Bienvenue dans le panneau artiste.",
    "login.title": "Acces au compte artiste",
    "login.description": "Connectez-vous avec votre email et mot de passe.",
    "login.back": "Retour au site public",
    "login.email": "Email",
    "login.password": "Mot de passe",
    "login.submit": "Se connecter",
    "login.submitting": "Connexion...",
    "login.forgot": "Mot de passe oublie",
    "login.resetHelp": "Entrez l'email de votre compte artiste et nous enverrons un lien pour creer un nouveau mot de passe.",
    "login.resetSubmit": "Envoyer le lien",
    "login.resetSubmitting": "Envoi...",
    "artistLanding.badge": "Artistes",
    "artistLanding.title": "Votre carriere musicale commence ici.",
    "artistLanding.description": "Avec AUM PRODZ, il est plus facile de gerer votre carriere musicale: profil, sorties, fichiers, statuts, contrats et support au meme endroit.",
    "artistLanding.create": "Creer un compte",
    "artistLanding.login": "Je suis deja artiste",
    "youtube.badge": "YouTube",
    "youtube.title": "Dernieres videos",
    "youtube.description": "Videos officielles et contenu recent de AUM PRODZ.",
    "empty.reports": "Aucun rapport pour le moment.",
    "common.view": "Voir",
    "common.download": "Telecharger",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
  },
  pt: {
    "nav.home": "Inicio",
    "nav.services": "Servicos",
    "nav.youtube": "YouTube",
    "nav.contact": "Contato",
    "nav.artists": "Artistas",
    "footer.platform": "Plataforma",
    "footer.private": "Acesso privado",
    "footer.tagline": "AUM PRODZ Platform - infraestrutura digital para servicos, artistas e operacao.",
    "home.badge": "YouTuber + servicos digitais",
    "home.title": "Eu sou Aum. Crio conteudo e ajudo voce a crescer no digital.",
    "home.description": "Se voce precisa organizar seu canal, resolver algo no YouTube ou AdSense, criar um site, melhorar sua imagem ou mover sua musica, voce comeca aqui comigo.",
    "home.services": "Ver meus servicos",
    "home.youtube": "Ver YouTube",
    "home.whatsapp": "Falar com Aum",
    "home.servicesBadge": "O que voce pode pedir",
    "home.servicesTitle": "Servicos claros, feitos para pessoas reais.",
    "home.servicesText": "Escolha a area que precisa e vamos direto ao ponto: seu canal, site, imagem ou carreira artistica.",
    "home.workBadge": "Como trabalho com voce",
    "home.workTitle": "Nada complicado: falamos, revisamos e avancamos.",
    "home.step1Title": "Voce me conta o que precisa",
    "home.step1Text": "Canal, site, miniatura, video, musica ou uma ideia para organizar.",
    "home.step2Title": "Reviso o caso com voce",
    "home.step2Text": "Digo o que convem fazer primeiro e o que nao vale forcar.",
    "home.step3Title": "Fazemos o trabalho",
    "home.step3Text": "O servico fica conectado ao WhatsApp para falar claro e avancar rapido.",
    "artistShell.home": "Inicio",
    "artistShell.profile": "Perfil",
    "artistShell.verification": "Verificacao",
    "artistShell.contracts": "Contratos",
    "artistShell.releases": "Lancamentos",
    "artistShell.payments": "Pagamentos",
    "artistShell.security": "Seguranca",
    "artistShell.support": "Suporte",
    "artistShell.dashboard": "Dashboard",
    "artistShell.welcome": "Bem-vindo ao painel de artista.",
    "login.title": "Acesso a conta artista",
    "login.description": "Entre com o email e a senha da sua conta.",
    "login.back": "Voltar ao site publico",
    "login.email": "Email",
    "login.password": "Senha",
    "login.submit": "Entrar",
    "login.submitting": "Entrando...",
    "login.forgot": "Esqueci a senha",
    "login.resetHelp": "Digite o email da sua conta artista e enviaremos um link para criar uma nova senha.",
    "login.resetSubmit": "Enviar link",
    "login.resetSubmitting": "Enviando...",
    "artistLanding.badge": "Artistas",
    "artistLanding.title": "Sua carreira musical comeca aqui.",
    "artistLanding.description": "Com AUM PRODZ e mais facil gerenciar sua carreira musical. No software voce tem perfil, lancamentos, arquivos, status, contratos e suporte em um so lugar.",
    "artistLanding.create": "Criar conta",
    "artistLanding.login": "Ja sou artista",
    "youtube.badge": "YouTube",
    "youtube.title": "Ultimos videos",
    "youtube.description": "Videos oficiais e conteudo recente da AUM PRODZ.",
    "empty.reports": "Ainda nao ha relatorios.",
    "common.view": "Ver",
    "common.download": "Baixar",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
  },
};

export function t(locale: AppLocale, key: DictionaryKey) {
  return dictionaries[locale]?.[key] ?? dictionaries.ht[key];
}

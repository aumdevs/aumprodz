"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CreditCard, Plus, Send, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveReleaseAction } from "@/app/artist/releases/actions";
import {
  buildReleaseUploadSlot,
  ReleaseFileUploader,
} from "@/components/artist/release-file-uploader";
import type { ArtistSongOption } from "@/lib/artist-song-options";
import { musicGenreOptions } from "@/lib/artist-options";
import type { AppLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const releaseTypes = ["single", "ep", "album", "video"] as const;
type ReleaseType = (typeof releaseTypes)[number];

const releaseTypeLabelsByLocale: Record<AppLocale, Record<ReleaseType, string>> = {
  ht: { single: "Chante", ep: "EP", album: "Albòm", video: "Videyo" },
  es: { single: "Canción", ep: "EP", album: "Álbum", video: "Video" },
  en: { single: "Song", ep: "EP", album: "Album", video: "Video" },
  fr: { single: "Chanson", ep: "EP", album: "Album", video: "Vidéo" },
  pt: { single: "Música", ep: "EP", album: "Álbum", video: "Vídeo" },
};

const musicPlatforms = [
  "Spotify",
  "Apple Music",
  "YouTube Music",
  "TikTok",
  "Instagram/Facebook",
  "Deezer",
  "Amazon Music",
  "Tidal",
  "Todas",
] as const;

const languageOptions = [
  "Kreyòl ayisyen",
  "Español",
  "Inglés",
  "Francés",
  "Portugués",
  "Otro",
] as const;

const languageOptionLabelsByLocale: Record<AppLocale, Record<string, string>> = {
  ht: {
    "Kreyòl ayisyen": "Kreyòl ayisyen",
    Español: "Panyòl",
    Inglés: "Angle",
    Francés: "Franse",
    Portugués: "Pòtigè",
    Otro: "Lòt",
  },
  es: {},
  en: {
    "Kreyòl ayisyen": "Haitian Creole",
    Español: "Spanish",
    Inglés: "English",
    Francés: "French",
    Portugués: "Portuguese",
    Otro: "Other",
  },
  fr: {
    "Kreyòl ayisyen": "Créole haïtien",
    Español: "Espagnol",
    Inglés: "Anglais",
    Francés: "Français",
    Portugués: "Portugais",
    Otro: "Autre",
  },
  pt: {
    "Kreyòl ayisyen": "Crioulo haitiano",
    Español: "Espanhol",
    Inglés: "Inglês",
    Francés: "Francês",
    Portugués: "Português",
    Otro: "Outro",
  },
};

const genreLabelsByLocale: Record<AppLocale, Record<string, string>> = {
  ht: { Otro: "Lòt" },
  es: {},
  en: { Otro: "Other" },
  fr: { Otro: "Autre" },
  pt: { Otro: "Outro" },
};

const platformLabelsByLocale: Record<AppLocale, Record<string, string>> = {
  ht: { Todas: "Tout" },
  es: {},
  en: { Todas: "All" },
  fr: { Todas: "Toutes" },
  pt: { Todas: "Todas" },
};

const releaseFormCopyByLocale: Record<
  AppLocale,
  {
    prepareError: string;
    checkoutError: string;
    missingTitle: string;
    missingPrimaryArtist: string;
    missingPlatform: string;
    missingTracks: (count: number) => string;
    missingVideoSong: string;
    missingFiles: string;
    submitHint: string;
    cardTitle: string;
    type: string;
    titleLabels: Record<ReleaseType, string>;
    primaryArtist: string;
    collaborations: string;
    genre: string;
    language: string;
    desiredDate: string;
    explicitContent: string;
    useCredit: (type: ReleaseType) => string;
    buyCredit: (type: ReleaseType) => string;
    availableCredits: (count: number) => string;
    buyCreditHelp: string;
    useOneCredit: string;
    preparingPayment: string;
    buyAnotherCredit: string;
    music: string;
    videoSongHelp: string;
    relatedSong: string;
    selectSong: string;
    independentVideo: string;
    noSongs: string;
    platforms: string;
    tracksTitle: (type: ReleaseType) => string;
    tracksHelp: (max: number) => string;
    trackLabel: (index: number) => string;
    trackPlaceholder: (index: number) => string;
    collaborator: string;
    collaboratorPlaceholder: string;
    addTrack: string;
    fileUpload: string;
    uploadVideo: string;
    uploadSong: string;
    uploadArtwork: string;
    sameArtwork: string;
    goToFileUpload: string;
    completeTitleArtist: string;
    notes: string;
    notesPlaceholder: string;
    payAndContinue: (type: ReleaseType) => string;
    submit: string;
    uploadSlotSong: string;
    uploadSlotArtwork: string;
    uploadSlotGeneralArtwork: (type: ReleaseType) => string;
    uploadSlotTrack: (index: number, title: string) => string;
    uploadSlotTrackArtwork: (index: number, title: string) => string;
  }
> = {
  ht: {
    prepareError: "Nou pa t kapab prepare lansman an.",
    checkoutError: "Nou pa t kapab kòmanse peman an.",
    missingTitle: "Tit la manke.",
    missingPrimaryArtist: "Atis prensipal la manke.",
    missingPlatform: "Chwazi omwen yon platfòm.",
    missingTracks: (count) => `Ranpli omwen ${count} chante.`,
    missingVideoSong:
      "Chwazi chante ki konekte ak videyo a oswa make videyo a endepandan.",
    missingFiles: "Telechaje yon fichye oswa mete yon lyen.",
    submitHint: "Gen yon bagay ki manke pou fini.",
    cardTitle: "Done lansman an",
    type: "Tip",
    titleLabels: {
      single: "Tit chante a",
      ep: "Tit EP a",
      album: "Tit albòm nan",
      video: "Tit videyo a",
    },
    primaryArtist: "Atis prensipal",
    collaborations: "Kolaborasyon",
    genre: "Stil",
    language: "Lang",
    desiredDate: "Dat ou ta renmen",
    explicitContent: "Kontni eksplisit",
    useCredit: (type) => (type === "album" ? "Itilize plas albòm" : "Itilize plas EP"),
    buyCredit: (type) => (type === "album" ? "Achte plas albòm" : "Achte plas EP"),
    availableCredits: (count) => `Ou gen ${count} plas disponib. Itilize youn pou fini lansman sa a.`,
    buyCreditHelp:
      "Achte yon plas pou ouvri fòm konplè a epi voye lansman sa a.",
    useOneCredit: "Itilize 1 plas",
    preparingPayment: "Ap prepare peman...",
    buyAnotherCredit: "Achte yon lòt plas",
    music: "Mizik",
    videoSongHelp: "Chwazi pou ki chante videyo sa a ye.",
    relatedSong: "Chante ki konekte",
    selectSong: "Chwazi chante",
    independentVideo: "Videyo sa a pa pou yon chante nan kont mwen.",
    noSongs:
      "Pa gen chante nan kont ou ankò; ou ka voye l kòm videyo endepandan.",
    platforms: "Platfòm",
    tracksTitle: (type) => `Chante ${type === "ep" ? "EP a" : "albòm nan"}`,
    tracksHelp: (max) => `Ajoute tit chak chante. Maksimòm ${max}.`,
    trackLabel: (index) => `Chante ${index + 1}`,
    trackPlaceholder: (index) => `Tit chante ${index + 1}`,
    collaborator: "Kolaborasyon / atis",
    collaboratorPlaceholder: "Eg: Atis 1, Atis 2",
    addTrack: "Ajoute chante",
    fileUpload: "Chaje fichye",
    uploadVideo: "Chaje videyo",
    uploadSong: "Chaje chante",
    uploadArtwork: "Chaje portada",
    sameArtwork: "Itilize menm portada pou tout chante yo",
    goToFileUpload: "Ale nan chaje fichye",
    completeTitleArtist: "Ranpli tit ak atis pou aktive chajman prive a.",
    notes: "Nòt oswa mo kle pou AUM PRODZ",
    notesPlaceholder:
      "Eg: vèsyon clean, dat enpòtan, kontèks lansman an, kredi oswa enstriksyon.",
    payAndContinue: (type) =>
      type === "album" ? "Peye albòm epi kontinye" : "Peye EP epi kontinye",
    submit: "Voye lansman",
    uploadSlotSong: "Chante",
    uploadSlotArtwork: "Portada",
    uploadSlotGeneralArtwork: (type) =>
      `Portada jeneral ${type === "ep" ? "EP a" : "albòm nan"}`,
    uploadSlotTrack: (index, title) =>
      `Chante ${index + 1}${title.trim() ? `: ${title.trim()}` : ""}`,
    uploadSlotTrackArtwork: (index, title) =>
      `Portada chante ${index + 1}${title.trim() ? `: ${title.trim()}` : ""}`,
  },
  es: {
    prepareError: "No se pudo preparar el lanzamiento.",
    checkoutError: "No se pudo iniciar el pago.",
    missingTitle: "Falta el título.",
    missingPrimaryArtist: "Falta el artista principal.",
    missingPlatform: "Selecciona al menos una plataforma.",
    missingTracks: (count) => `Completa mínimo ${count} canciones.`,
    missingVideoSong:
      "Selecciona la canción relacionada o marca que el video es independiente.",
    missingFiles: "Sube un archivo o pega un link.",
    submitHint: "Falta algo para completar.",
    cardTitle: "Datos del lanzamiento",
    type: "Tipo",
    titleLabels: {
      single: "Título de la canción",
      ep: "Título del EP",
      album: "Título del álbum",
      video: "Título del video",
    },
    primaryArtist: "Artista principal",
    collaborations: "Colaboraciones",
    genre: "Género",
    language: "Idioma",
    desiredDate: "Fecha deseada",
    explicitContent: "Contenido explícito",
    useCredit: (type) => (type === "album" ? "Usar cupo álbum" : "Usar cupo EP"),
    buyCredit: (type) => (type === "album" ? "Comprar cupo álbum" : "Comprar cupo EP"),
    availableCredits: (count) =>
      `Tienes ${count} cupo${count === 1 ? "" : "s"} disponible${count === 1 ? "" : "s"}. Usa uno para completar este lanzamiento.`,
    buyCreditHelp:
      "Compra un cupo para abrir el formulario completo y enviar este lanzamiento.",
    useOneCredit: "Usar 1 cupo",
    preparingPayment: "Preparando pago...",
    buyAnotherCredit: "Comprar otro cupo",
    music: "Música",
    videoSongHelp: "Selecciona para qué canción es este video.",
    relatedSong: "Canción relacionada",
    selectSong: "Seleccionar canción",
    independentVideo: "Este video no pertenece a una canción de mi cuenta.",
    noSongs:
      "No hay canciones en tu cuenta todavía; puedes enviarlo como video independiente.",
    platforms: "Plataformas",
    tracksTitle: (type) => `Canciones del ${type === "ep" ? "EP" : "álbum"}`,
    tracksHelp: (max) => `Agrega el título de cada canción. Máximo ${max}.`,
    trackLabel: (index) => `Canción ${index + 1}`,
    trackPlaceholder: (index) => `Título canción ${index + 1}`,
    collaborator: "Colaboración / artista",
    collaboratorPlaceholder: "Ej: Artista 1, Artista 2",
    addTrack: "Agregar canción",
    fileUpload: "Carga de archivos",
    uploadVideo: "Cargar video",
    uploadSong: "Cargar canción",
    uploadArtwork: "Cargar portada",
    sameArtwork: "Usar la misma portada para todas las canciones",
    goToFileUpload: "Ir a carga de archivos",
    completeTitleArtist: "Completa título y artista para activar la carga privada.",
    notes: "Notas o palabras clave para AUM PRODZ",
    notesPlaceholder:
      "Ej: versión clean, fecha importante, contexto del lanzamiento, créditos o instrucciones.",
    payAndContinue: (type) =>
      type === "album" ? "Pagar álbum y continuar" : "Pagar EP y continuar",
    submit: "Enviar lanzamiento",
    uploadSlotSong: "Canción",
    uploadSlotArtwork: "Portada",
    uploadSlotGeneralArtwork: (type) =>
      `Portada general del ${type === "ep" ? "EP" : "álbum"}`,
    uploadSlotTrack: (index, title) =>
      `Canción ${index + 1}${title.trim() ? `: ${title.trim()}` : ""}`,
    uploadSlotTrackArtwork: (index, title) =>
      `Portada canción ${index + 1}${title.trim() ? `: ${title.trim()}` : ""}`,
  },
  en: {
    prepareError: "The release could not be prepared.",
    checkoutError: "The payment could not be started.",
    missingTitle: "Title is missing.",
    missingPrimaryArtist: "Main artist is missing.",
    missingPlatform: "Select at least one platform.",
    missingTracks: (count) => `Complete at least ${count} songs.`,
    missingVideoSong:
      "Select the related song or mark the video as independent.",
    missingFiles: "Upload a file or add a link.",
    submitHint: "Something is missing to complete.",
    cardTitle: "Release details",
    type: "Type",
    titleLabels: {
      single: "Song title",
      ep: "EP title",
      album: "Album title",
      video: "Video title",
    },
    primaryArtist: "Main artist",
    collaborations: "Collaborations",
    genre: "Genre",
    language: "Language",
    desiredDate: "Desired date",
    explicitContent: "Explicit content",
    useCredit: (type) => (type === "album" ? "Use album slot" : "Use EP slot"),
    buyCredit: (type) => (type === "album" ? "Buy album slot" : "Buy EP slot"),
    availableCredits: (count) =>
      `You have ${count} available slot${count === 1 ? "" : "s"}. Use one to complete this release.`,
    buyCreditHelp:
      "Buy a slot to open the full form and submit this release.",
    useOneCredit: "Use 1 slot",
    preparingPayment: "Preparing payment...",
    buyAnotherCredit: "Buy another slot",
    music: "Music",
    videoSongHelp: "Select which song this video is for.",
    relatedSong: "Related song",
    selectSong: "Select song",
    independentVideo: "This video does not belong to a song in my account.",
    noSongs: "There are no songs in your account yet; you can submit it as an independent video.",
    platforms: "Platforms",
    tracksTitle: (type) => `${type === "ep" ? "EP" : "Album"} songs`,
    tracksHelp: (max) => `Add each song title. Maximum ${max}.`,
    trackLabel: (index) => `Song ${index + 1}`,
    trackPlaceholder: (index) => `Song title ${index + 1}`,
    collaborator: "Collaboration / artist",
    collaboratorPlaceholder: "Example: Artist 1, Artist 2",
    addTrack: "Add song",
    fileUpload: "File upload",
    uploadVideo: "Upload video",
    uploadSong: "Upload song",
    uploadArtwork: "Upload cover",
    sameArtwork: "Use the same cover for all songs",
    goToFileUpload: "Go to file upload",
    completeTitleArtist: "Complete title and artist to activate private upload.",
    notes: "Notes or keywords for AUM PRODZ",
    notesPlaceholder:
      "Example: clean version, important date, release context, credits or instructions.",
    payAndContinue: (type) =>
      type === "album" ? "Pay album and continue" : "Pay EP and continue",
    submit: "Submit release",
    uploadSlotSong: "Song",
    uploadSlotArtwork: "Cover",
    uploadSlotGeneralArtwork: (type) =>
      `General ${type === "ep" ? "EP" : "album"} cover`,
    uploadSlotTrack: (index, title) =>
      `Song ${index + 1}${title.trim() ? `: ${title.trim()}` : ""}`,
    uploadSlotTrackArtwork: (index, title) =>
      `Song ${index + 1} cover${title.trim() ? `: ${title.trim()}` : ""}`,
  },
  fr: {
    prepareError: "La sortie n'a pas pu être préparée.",
    checkoutError: "Le paiement n'a pas pu démarrer.",
    missingTitle: "Le titre manque.",
    missingPrimaryArtist: "L'artiste principal manque.",
    missingPlatform: "Sélectionnez au moins une plateforme.",
    missingTracks: (count) => `Complétez au moins ${count} chansons.`,
    missingVideoSong:
      "Sélectionnez la chanson liée ou marquez la vidéo comme indépendante.",
    missingFiles: "Téléchargez un fichier ou ajoutez un lien.",
    submitHint: "Il manque quelque chose pour terminer.",
    cardTitle: "Données de la sortie",
    type: "Type",
    titleLabels: {
      single: "Titre de la chanson",
      ep: "Titre de l'EP",
      album: "Titre de l'album",
      video: "Titre de la vidéo",
    },
    primaryArtist: "Artiste principal",
    collaborations: "Collaborations",
    genre: "Genre",
    language: "Langue",
    desiredDate: "Date souhaitée",
    explicitContent: "Contenu explicite",
    useCredit: (type) => (type === "album" ? "Utiliser une place album" : "Utiliser une place EP"),
    buyCredit: (type) => (type === "album" ? "Acheter une place album" : "Acheter une place EP"),
    availableCredits: (count) =>
      `Vous avez ${count} place${count === 1 ? "" : "s"} disponible${count === 1 ? "" : "s"}. Utilisez-en une pour terminer cette sortie.`,
    buyCreditHelp:
      "Achetez une place pour ouvrir le formulaire complet et envoyer cette sortie.",
    useOneCredit: "Utiliser 1 place",
    preparingPayment: "Préparation du paiement...",
    buyAnotherCredit: "Acheter une autre place",
    music: "Musique",
    videoSongHelp: "Sélectionnez pour quelle chanson est cette vidéo.",
    relatedSong: "Chanson liée",
    selectSong: "Sélectionner une chanson",
    independentVideo: "Cette vidéo n'appartient pas à une chanson de mon compte.",
    noSongs:
      "Il n'y a pas encore de chansons dans votre compte; vous pouvez l'envoyer comme vidéo indépendante.",
    platforms: "Plateformes",
    tracksTitle: (type) => `Chansons de ${type === "ep" ? "l'EP" : "l'album"}`,
    tracksHelp: (max) => `Ajoutez le titre de chaque chanson. Maximum ${max}.`,
    trackLabel: (index) => `Chanson ${index + 1}`,
    trackPlaceholder: (index) => `Titre chanson ${index + 1}`,
    collaborator: "Collaboration / artiste",
    collaboratorPlaceholder: "Ex: Artiste 1, Artiste 2",
    addTrack: "Ajouter une chanson",
    fileUpload: "Chargement de fichiers",
    uploadVideo: "Charger vidéo",
    uploadSong: "Charger chanson",
    uploadArtwork: "Charger pochette",
    sameArtwork: "Utiliser la même pochette pour toutes les chansons",
    goToFileUpload: "Aller au chargement de fichiers",
    completeTitleArtist:
      "Complétez titre et artiste pour activer le chargement privé.",
    notes: "Notes ou mots-clés pour AUM PRODZ",
    notesPlaceholder:
      "Ex: version clean, date importante, contexte de la sortie, crédits ou instructions.",
    payAndContinue: (type) =>
      type === "album" ? "Payer l'album et continuer" : "Payer l'EP et continuer",
    submit: "Envoyer la sortie",
    uploadSlotSong: "Chanson",
    uploadSlotArtwork: "Pochette",
    uploadSlotGeneralArtwork: (type) =>
      `Pochette générale de ${type === "ep" ? "l'EP" : "l'album"}`,
    uploadSlotTrack: (index, title) =>
      `Chanson ${index + 1}${title.trim() ? `: ${title.trim()}` : ""}`,
    uploadSlotTrackArtwork: (index, title) =>
      `Pochette chanson ${index + 1}${title.trim() ? `: ${title.trim()}` : ""}`,
  },
  pt: {
    prepareError: "Não foi possível preparar o lançamento.",
    checkoutError: "Não foi possível iniciar o pagamento.",
    missingTitle: "Falta o título.",
    missingPrimaryArtist: "Falta o artista principal.",
    missingPlatform: "Selecione pelo menos uma plataforma.",
    missingTracks: (count) => `Complete no mínimo ${count} músicas.`,
    missingVideoSong:
      "Selecione a música relacionada ou marque o vídeo como independente.",
    missingFiles: "Envie um arquivo ou adicione um link.",
    submitHint: "Falta algo para completar.",
    cardTitle: "Dados do lançamento",
    type: "Tipo",
    titleLabels: {
      single: "Título da música",
      ep: "Título do EP",
      album: "Título do álbum",
      video: "Título do vídeo",
    },
    primaryArtist: "Artista principal",
    collaborations: "Colaborações",
    genre: "Gênero",
    language: "Idioma",
    desiredDate: "Data desejada",
    explicitContent: "Conteúdo explícito",
    useCredit: (type) => (type === "album" ? "Usar vaga de álbum" : "Usar vaga de EP"),
    buyCredit: (type) => (type === "album" ? "Comprar vaga de álbum" : "Comprar vaga de EP"),
    availableCredits: (count) =>
      `Você tem ${count} vaga${count === 1 ? "" : "s"} disponível${count === 1 ? "" : "is"}. Use uma para completar este lançamento.`,
    buyCreditHelp:
      "Compre uma vaga para abrir o formulário completo e enviar este lançamento.",
    useOneCredit: "Usar 1 vaga",
    preparingPayment: "Preparando pagamento...",
    buyAnotherCredit: "Comprar outra vaga",
    music: "Música",
    videoSongHelp: "Selecione para qual música é este vídeo.",
    relatedSong: "Música relacionada",
    selectSong: "Selecionar música",
    independentVideo: "Este vídeo não pertence a uma música da minha conta.",
    noSongs:
      "Ainda não há músicas na sua conta; você pode enviá-lo como vídeo independente.",
    platforms: "Plataformas",
    tracksTitle: (type) => `Músicas do ${type === "ep" ? "EP" : "álbum"}`,
    tracksHelp: (max) => `Adicione o título de cada música. Máximo ${max}.`,
    trackLabel: (index) => `Música ${index + 1}`,
    trackPlaceholder: (index) => `Título música ${index + 1}`,
    collaborator: "Colaboração / artista",
    collaboratorPlaceholder: "Ex: Artista 1, Artista 2",
    addTrack: "Adicionar música",
    fileUpload: "Envio de arquivos",
    uploadVideo: "Enviar vídeo",
    uploadSong: "Enviar música",
    uploadArtwork: "Enviar capa",
    sameArtwork: "Usar a mesma capa para todas as músicas",
    goToFileUpload: "Ir para envio de arquivos",
    completeTitleArtist: "Complete título e artista para ativar o envio privado.",
    notes: "Notas ou palavras-chave para AUM PRODZ",
    notesPlaceholder:
      "Ex: versão clean, data importante, contexto do lançamento, créditos ou instruções.",
    payAndContinue: (type) =>
      type === "album" ? "Pagar álbum e continuar" : "Pagar EP e continuar",
    submit: "Enviar lançamento",
    uploadSlotSong: "Música",
    uploadSlotArtwork: "Capa",
    uploadSlotGeneralArtwork: (type) =>
      `Capa geral do ${type === "ep" ? "EP" : "álbum"}`,
    uploadSlotTrack: (index, title) =>
      `Música ${index + 1}${title.trim() ? `: ${title.trim()}` : ""}`,
    uploadSlotTrackArtwork: (index, title) =>
      `Capa música ${index + 1}${title.trim() ? `: ${title.trim()}` : ""}`,
  },
};

const releaseTrackLimits: Record<ReleaseType, { initial: number; max: number }> = {
  single: { initial: 1, max: 1 },
  ep: { initial: 3, max: 6 },
  album: { initial: 3, max: 50 },
  video: { initial: 1, max: 1 },
};

type ReleaseFormData = {
  id?: string;
  release_type?: string;
  title?: string | null;
  primary_artist?: string | null;
  featured_artists?: string | null;
  genre?: string | null;
  language?: string | null;
  explicit_content?: boolean | null;
  desired_release_date?: string | null;
  external_files_url?: string | null;
  notes?: string | null;
  related_track_id?: string | null;
  related_track_note?: string | null;
};

type ReleaseFormProps = {
  locale: AppLocale;
  release?: ReleaseFormData | null;
  selectedPlatforms?: string[];
  tracks?: string[];
  trackFeaturedArtists?: string[];
  availablePaymentProductKeys?: string[];
  artistSongOptions?: ArtistSongOption[];
  hasUploadedFiles?: boolean;
  autoSubmitOnReady?: boolean;
  editable?: boolean;
  showInlineUploader?: boolean;
};

type ReleaseValidationErrors = Partial<
  Record<
    "title" | "primaryArtist" | "platforms" | "tracks" | "files" | "videoSong",
    string
  >
>;

export function ReleaseForm({
  locale,
  release,
  selectedPlatforms = [],
  tracks = [],
  trackFeaturedArtists = [],
  availablePaymentProductKeys = [],
  artistSongOptions = [],
  hasUploadedFiles = false,
  autoSubmitOnReady = false,
  editable = true,
  showInlineUploader = false,
}: ReleaseFormProps) {
  const copy = releaseFormCopyByLocale[locale] ?? releaseFormCopyByLocale.ht;
  const releaseTypeLabels = releaseTypeLabelsByLocale[locale] ?? releaseTypeLabelsByLocale.ht;
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const initialReleaseType = releaseTypes.includes(
    release?.release_type as ReleaseType,
  )
    ? (release?.release_type as ReleaseType)
    : "single";
  const [selectedReleaseType, setSelectedReleaseType] =
    useState<ReleaseType>(initialReleaseType);
  const [releaseId, setReleaseId] = useState(release?.id ?? "");
  const [title, setTitle] = useState(release?.title ?? "");
  const [trackTitles, setTrackTitles] = useState<string[]>(() =>
    getInitialTrackTitles(initialReleaseType, tracks),
  );
  const [trackCollaborators, setTrackCollaborators] = useState<string[]>(() =>
    getInitialTrackCollaborators(initialReleaseType, tracks, trackFeaturedArtists),
  );
  const [sameArtworkForAll, setSameArtworkForAll] = useState(true);
  const [selectedRelatedTrackId, setSelectedRelatedTrackId] = useState(
    release?.related_track_id ?? "",
  );
  const [videoNotOwnSong, setVideoNotOwnSong] = useState(
    initialReleaseType === "video" &&
      !release?.related_track_id &&
      Boolean(release?.related_track_note),
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] =
    useState<ReleaseValidationErrors>({});
  const [submitHint, setSubmitHint] = useState<string | null>(null);
  const [hasUploadedReleaseFile, setHasUploadedReleaseFile] = useState(false);
  const [unlockedPaymentProductKey, setUnlockedPaymentProductKey] = useState<
    string | null
  >(null);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const autoSubmittedRef = useRef(false);
  const [platformSelection, setPlatformSelection] = useState<Set<string>>(
    () => new Set(selectedPlatforms),
  );
  const showsTrackList =
    selectedReleaseType === "ep" || selectedReleaseType === "album";
  const isVideoRelease = selectedReleaseType === "video";
  const requiredPaymentProductKey =
    selectedReleaseType === "ep"
      ? "ep_release"
      : selectedReleaseType === "album"
        ? "album_release"
        : null;
  const hasPaymentForSelection =
    !requiredPaymentProductKey ||
    availablePaymentProductKeys.includes(requiredPaymentProductKey);
  const availablePaymentCount = requiredPaymentProductKey
    ? availablePaymentProductKeys.filter((key) => key === requiredPaymentProductKey)
        .length
    : 0;
  const hasExistingReleasePaymentFlow = Boolean(
    releaseId && requiredPaymentProductKey && hasPaymentForSelection,
  );
  const hasUnlockedPaymentForSelection =
    !requiredPaymentProductKey ||
    hasExistingReleasePaymentFlow ||
    autoSubmitOnReady ||
    unlockedPaymentProductKey === requiredPaymentProductKey;
  const effectiveVideoNotOwnSong =
    videoNotOwnSong ||
    (selectedReleaseType === "video" && artistSongOptions.length === 0);
  const requiresPaymentGate = Boolean(
    requiredPaymentProductKey && !hasUnlockedPaymentForSelection,
  );
  const trackLimit = releaseTrackLimits[selectedReleaseType];
  const titleLabel = copy.titleLabels[selectedReleaseType];
  const uploadSlots = getReleaseUploadSlots({
    copy,
    locale,
    releaseType: selectedReleaseType,
    trackTitles,
    sameArtworkForAll,
  });
  const mainUploadSlots = uploadSlots.filter(
    (slot) => slot.fileType === "audio" || slot.fileType === "video",
  );
  const artworkUploadSlots = uploadSlots.filter(
    (slot) => slot.fileType === "artwork",
  );

  useEffect(() => {
    if (
      !autoSubmitOnReady ||
      autoSubmittedRef.current ||
      !editable ||
      !hasPaymentForSelection
    ) {
      return;
    }

    autoSubmittedRef.current = true;
    if (submitButtonRef.current) {
      formRef.current?.requestSubmit(submitButtonRef.current);
    }
  }, [autoSubmitOnReady, editable, hasPaymentForSelection]);

  function clearValidationError(field: keyof ReleaseValidationErrors) {
    setValidationErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitHint(null);
  }

  function updatePlatform(platform: string, checked: boolean) {
    clearValidationError("platforms");
    setPlatformSelection((current) => {
      const next = new Set(current);

      if (platform === "Todas") {
        return checked ? new Set(musicPlatforms) : new Set();
      }

      if (checked) {
        next.add(platform);
      } else {
        next.delete(platform);
      }

      const everySpecificPlatformSelected = musicPlatforms
        .filter((item) => item !== "Todas")
        .every((item) => next.has(item));

      if (everySpecificPlatformSelected) {
        next.add("Todas");
      } else {
        next.delete("Todas");
      }

      return next;
    });
  }

  function updateTrackTitle(index: number, value: string) {
    if (value.trim()) {
      clearValidationError("tracks");
    }

    setTrackTitles((current) =>
      current.map((trackTitle, currentIndex) =>
        currentIndex === index ? value : trackTitle,
      ),
    );
  }

  function updateTrackCollaborator(index: number, value: string) {
    setTrackCollaborators((current) =>
      current.map((collaborator, currentIndex) =>
        currentIndex === index ? value : collaborator,
      ),
    );
  }

  function setReleaseType(nextType: ReleaseType) {
    setValidationErrors({});
    setSubmitHint(null);
    setSelectedReleaseType(nextType);
    const nextTitles = getTrackTitlesForReleaseType(nextType, trackTitles);
    setTrackTitles(nextTitles);
    setTrackCollaborators(
      getTrackCollaboratorsForReleaseType(nextType, trackCollaborators, nextTitles.length),
    );
    setSameArtworkForAll(true);
  }

  async function ensureDraftForUpload() {
    if (!formRef.current) {
      return releaseId;
    }

    if (releaseId) {
      await syncDraft(releaseId);
      return releaseId;
    }

    const id = await syncDraft();
    setReleaseId(id);
    return id;
  }

  async function syncDraft(existingReleaseId?: string) {
    const formData = new FormData(formRef.current!);
    const response = await fetch("/api/artist/releases/ensure-draft", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        releaseId: existingReleaseId || null,
        releaseType: selectedReleaseType,
        title,
        primaryArtist: String(formData.get("primary_artist") ?? ""),
        featuredArtists: String(formData.get("featured_artists") ?? ""),
        genre: String(formData.get("genre") ?? ""),
        language: String(formData.get("language") ?? ""),
        explicitContent: formData.get("explicit_content") === "on",
        desiredReleaseDate: String(formData.get("desired_release_date") ?? ""),
        externalFilesUrl: String(formData.get("external_files_url") ?? ""),
        externalFiles: getExternalFilesPayload(formData),
        relatedTrackId: String(formData.get("related_track_id") ?? ""),
        videoNotOwnSong: formData.get("video_not_own_song") === "on",
        hasLyrics: false,
        lyricsText: "",
        notes: String(formData.get("notes") ?? ""),
        platforms: Array.from(platformSelection),
        tracks: String(formData.get("tracks") ?? ""),
        trackFeaturedArtists: String(formData.get("track_featured_artists") ?? ""),
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      throw new Error(body?.error ?? copy.prepareError);
    }

    const body = (await response.json()) as { releaseId?: string };

    if (!body.releaseId) {
      throw new Error(copy.prepareError);
    }

    return body.releaseId;
  }

  async function startReleaseCheckout({ force = false }: { force?: boolean } = {}) {
    if (!requiredPaymentProductKey) {
      return;
    }

    setCheckoutError(null);
    setIsStartingCheckout(true);

    try {
      const checkoutPath =
        requiredPaymentProductKey === "ep_release"
          ? "/api/checkout/ep-release"
          : "/api/checkout/album-release";
      const checkoutUrl = new URL(checkoutPath, window.location.origin);

      if (releaseId) {
        const id = await ensureDraftForUpload();
        checkoutUrl.searchParams.set("releaseId", id);
      } else {
        checkoutUrl.searchParams.set("next", "/artist/releases/new");
      }

      if (force) {
        checkoutUrl.searchParams.set("force", "1");
      }

      window.location.href = checkoutUrl.toString();
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : copy.checkoutError,
      );
      setIsStartingCheckout(false);
    }
  }

  function handleUploadedFile(_: string, uploadedReleaseId: string) {
    setReleaseId(uploadedReleaseId);
    setHasUploadedReleaseFile(true);
    clearValidationError("files");
  }

  function handleExternalLinkChange(hasExternalLink: boolean) {
    if (hasExternalLink) {
      clearValidationError("files");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as
      | HTMLButtonElement
      | null;

    if (submitter?.name === "intent" && submitter.value !== "submit") {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const nextErrors: ReleaseValidationErrors = {};
    const externalLinks = formData
      .getAll("external_file_url")
      .some((value) => String(value).trim().length > 0);
    const readyFileExists = hasUploadedReleaseFile || hasUploadedFiles;

    if (!title.trim()) {
      nextErrors.title = copy.missingTitle;
    }

    if (
      !isVideoRelease &&
      !String(formData.get("primary_artist") ?? "").trim()
    ) {
      nextErrors.primaryArtist = copy.missingPrimaryArtist;
    }

    if (platformSelection.size === 0) {
      nextErrors.platforms = copy.missingPlatform;
    }

    if (showsTrackList) {
      const minimumTracks = releaseTrackLimits[selectedReleaseType].initial;
      const completedTracks = trackTitles.filter((trackTitle) =>
        trackTitle.trim(),
      ).length;

      if (completedTracks < minimumTracks) {
        nextErrors.tracks = copy.missingTracks(minimumTracks);
      }
    }

    if (
      isVideoRelease &&
      !effectiveVideoNotOwnSong &&
      !selectedRelatedTrackId
    ) {
      nextErrors.videoSong =
        copy.missingVideoSong;
    }

    if (!externalLinks && !readyFileExists) {
      nextErrors.files = copy.missingFiles;
    }

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      setValidationErrors(nextErrors);
      setSubmitHint(copy.submitHint);
      return;
    }

    setValidationErrors({});
    setSubmitHint(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.cardTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={saveReleaseAction}
          onSubmit={handleSubmit}
          className="grid gap-6"
        >
          {releaseId ? <input type="hidden" name="id" value={releaseId} /> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              {copy.type}
              <select
                name="release_type"
                value={selectedReleaseType}
                onChange={(event) => {
                  setReleaseType(event.target.value as ReleaseType);
                }}
                disabled={!editable}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                {releaseTypes.map((type) => (
                  <option key={type} value={type}>
                    {releaseTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            {requiresPaymentGate ? null : (
              <>
            <label className="grid gap-2 text-sm font-medium">
              {titleLabel}
              <Input
                name="title"
                value={title}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setTitle(nextValue);

                  if (nextValue.trim()) {
                    clearValidationError("title");
                  }
                }}
                disabled={!editable}
                className={validationErrors.title ? "border-destructive" : ""}
              />
              {validationErrors.title ? (
                <span className="text-xs font-normal text-destructive">
                  {validationErrors.title}
                </span>
              ) : null}
            </label>
            {isVideoRelease ? (
              <>
                <input
                  type="hidden"
                  name="primary_artist"
                  value={release?.primary_artist ?? ""}
                />
                <input type="hidden" name="featured_artists" value="" />
              </>
            ) : (
              <>
                <Field
                  label={copy.primaryArtist}
                  name="primary_artist"
                  defaultValue={release?.primary_artist}
                  disabled={!editable}
                  invalid={Boolean(validationErrors.primaryArtist)}
                  helper={validationErrors.primaryArtist}
                  onChange={() => clearValidationError("primaryArtist")}
                />
                {!showsTrackList ? (
                  <Field
                    label={copy.collaborations}
                    name="featured_artists"
                    defaultValue={release?.featured_artists}
                    disabled={!editable}
                  />
                ) : null}
              </>
            )}
            <SelectField
              label={copy.genre}
              name="genre"
              defaultValue={release?.genre}
              options={musicGenreOptions}
              getOptionLabel={(option) => getGenreLabel(locale, option)}
              disabled={!editable}
            />
            <Field
              label={copy.language}
              name="language"
              defaultValue={release?.language}
              disabled={!editable}
            >
              <select
                name="language"
                defaultValue={getLanguageDefaultValue(release?.language)}
                disabled={!editable}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                {languageOptions.map((language) => (
                  <option key={language} value={language}>
                    {getLanguageLabel(locale, language)}
                  </option>
                ))}
              </select>
            </Field>
            <label className="grid gap-2 text-sm font-medium">
              {copy.desiredDate}
              <Input
                type="date"
                name="desired_release_date"
                defaultValue={release?.desired_release_date ?? ""}
                disabled={!editable}
              />
            </label>
            <label className="flex items-center gap-3 self-end rounded-md border border-border p-3 text-sm font-medium">
              <input
                type="checkbox"
                name="explicit_content"
                defaultChecked={Boolean(release?.explicit_content)}
                disabled={!editable}
              />
              {copy.explicitContent}
            </label>
              </>
            )}
          </div>

          {requiresPaymentGate ? (
            <div className="grid gap-4 rounded-md border border-border bg-muted p-4">
              <div>
                <p className="text-base font-semibold">
                  {hasPaymentForSelection
                    ? copy.useCredit(selectedReleaseType)
                    : copy.buyCredit(selectedReleaseType)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasPaymentForSelection
                    ? copy.availableCredits(availablePaymentCount)
                    : copy.buyCreditHelp}
                </p>
              </div>
              {checkoutError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {checkoutError}
                </div>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                {hasPaymentForSelection ? (
                  <Button
                    type="button"
                    className="w-full sm:w-fit"
                    onClick={() =>
                      setUnlockedPaymentProductKey(requiredPaymentProductKey)
                    }
                    disabled={!editable}
                  >
                    {copy.useOneCredit}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="w-full sm:w-fit"
                    onClick={() => startReleaseCheckout()}
                    disabled={isStartingCheckout || !editable}
                  >
                    <CreditCard className="size-4" />
                    {isStartingCheckout
                      ? copy.preparingPayment
                      : copy.buyCredit(selectedReleaseType)}
                  </Button>
                )}
                {hasPaymentForSelection ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-fit"
                    onClick={() => startReleaseCheckout({ force: true })}
                    disabled={isStartingCheckout || !editable}
                  >
                    <CreditCard className="size-4" />
                    {copy.buyAnotherCredit}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <>

          {isVideoRelease ? (
            <div className="grid gap-4 rounded-md border border-border p-4">
              <div>
                <p className="text-sm font-semibold">{copy.music}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {copy.videoSongHelp}
                </p>
              </div>
              <label className="grid gap-2 text-sm font-medium">
                {copy.relatedSong}
                <select
                  name="related_track_id"
                  value={effectiveVideoNotOwnSong ? "" : selectedRelatedTrackId}
                  onChange={(event) => {
                    setSelectedRelatedTrackId(event.currentTarget.value);

                    if (event.currentTarget.value) {
                      clearValidationError("videoSong");
                    }
                  }}
                  disabled={
                    !editable || effectiveVideoNotOwnSong || artistSongOptions.length === 0
                  }
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="">{copy.selectSong}</option>
                  {artistSongOptions.map((song) => (
                    <option key={song.id} value={song.id}>
                      {song.label}
                    </option>
                  ))}
                </select>
                {validationErrors.videoSong ? (
                  <span className="text-xs font-normal text-destructive">
                    {validationErrors.videoSong}
                  </span>
                ) : null}
              </label>
              <label className="flex items-center gap-3 rounded-md border border-border bg-background p-3 text-sm font-medium">
                <input
                  type="checkbox"
                  name="video_not_own_song"
                  checked={effectiveVideoNotOwnSong}
                  onChange={(event) => {
                    setVideoNotOwnSong(event.currentTarget.checked);

                    if (event.currentTarget.checked) {
                      clearValidationError("videoSong");
                    }
                  }}
                  disabled={!editable || artistSongOptions.length === 0}
                  className="accent-primary"
                />
                {copy.independentVideo}
              </label>
              <input
                type="hidden"
                name="video_not_own_song"
                value={effectiveVideoNotOwnSong ? "on" : ""}
              />
              {artistSongOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {copy.noSongs}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-2">
            <p className="text-sm font-medium">{copy.platforms}</p>
            <div className="grid gap-2 rounded-md md:grid-cols-3">
              {musicPlatforms.map((platform) => (
                <label
                  key={platform}
                  className="flex items-center gap-3 rounded-md border border-border p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    name="platforms"
                    value={platform}
                    checked={platformSelection.has(platform)}
                    onChange={(event) =>
                      updatePlatform(platform, event.currentTarget.checked)
                    }
                    disabled={!editable}
                    className="accent-primary"
                  />
                  {getPlatformLabel(locale, platform)}
                </label>
              ))}
            </div>
            {validationErrors.platforms ? (
              <p className="text-xs font-normal text-destructive">
                {validationErrors.platforms}
              </p>
            ) : null}
          </div>

          {showsTrackList ? (
            <div
              className={cn(
                "grid gap-3 rounded-md border p-4",
                validationErrors.tracks
                  ? "border-destructive/60"
                  : "border-border",
              )}
            >
              <div>
                <p className="text-sm font-semibold">
                  {copy.tracksTitle(selectedReleaseType)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {copy.tracksHelp(trackLimit.max)}
                </p>
              </div>
              {validationErrors.tracks ? (
                <p className="text-xs font-normal text-destructive">
                  {validationErrors.tracks}
                </p>
              ) : null}
              <input type="hidden" name="tracks" value={trackTitles.join("\n")} />
              <input
                type="hidden"
                name="track_featured_artists"
                value={trackCollaborators.join("\n")}
              />
              <div className="grid gap-3">
                {trackTitles.map((trackTitle, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-md border border-border bg-background p-3"
                  >
                    <label className="grid gap-2 text-sm font-medium md:grid-cols-[160px_1fr] md:items-center">
                      <span>{copy.trackLabel(index)}</span>
                      <Input
                        value={trackTitle}
                        onChange={(event) =>
                          updateTrackTitle(index, event.target.value)
                        }
                        disabled={!editable}
                        placeholder={copy.trackPlaceholder(index)}
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium md:grid-cols-[160px_1fr] md:items-center">
                      <span>{copy.collaborator}</span>
                      <Input
                        value={trackCollaborators[index] ?? ""}
                        onChange={(event) =>
                          updateTrackCollaborator(index, event.target.value)
                        }
                        disabled={!editable}
                        placeholder={copy.collaboratorPlaceholder}
                      />
                    </label>
                  </div>
                ))}
              </div>
              {trackTitles.length < trackLimit.max ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-fit"
                  onClick={() => {
                    setTrackTitles((current) => [...current, ""]);
                    setTrackCollaborators((current) => [...current, ""]);
                  }}
                  disabled={!editable}
                >
                  <Plus className="size-4" />
                  {copy.addTrack}
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4">
            <div
              className={cn(
                "grid gap-4 rounded-md border bg-muted p-4",
                validationErrors.files
                  ? "border-destructive/60"
                  : "border-border",
              )}
            >
              <div className="flex items-center gap-2 text-base font-semibold">
                <UploadCloud className="size-4 text-primary" />
                {copy.fileUpload}
              </div>
              {validationErrors.files ? (
                <p className="text-xs font-normal text-destructive">
                  {validationErrors.files}
                </p>
              ) : null}
              {showInlineUploader ? (
                <div className="grid gap-4">
                  <div className="grid gap-3 rounded-md border border-border bg-background p-4">
                    <p className="text-sm font-semibold">
                      {selectedReleaseType === "video"
                        ? copy.uploadVideo
                        : copy.uploadSong}
                    </p>
                    <ReleaseFileUploader
                      releaseId={releaseId || null}
                      locale={locale}
                      resolveReleaseId={ensureDraftForUpload}
                      onUploaded={handleUploadedFile}
                      onExternalLinkChange={handleExternalLinkChange}
                      disabled={!editable}
                      slots={mainUploadSlots}
                      withExternalLinks
                    />
                  </div>

                  <div className="grid gap-3 rounded-md border border-border bg-background p-4">
                    <p className="text-sm font-semibold">{copy.uploadArtwork}</p>
                    {showsTrackList ? (
                    <label className="flex items-center gap-3 rounded-md border border-border bg-background p-3 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={sameArtworkForAll}
                        onChange={(event) =>
                          setSameArtworkForAll(event.currentTarget.checked)
                        }
                        disabled={!editable}
                        className="accent-primary"
                      />
                      {copy.sameArtwork}
                    </label>
                    ) : null}
                    <ReleaseFileUploader
                      releaseId={releaseId || null}
                      locale={locale}
                      resolveReleaseId={ensureDraftForUpload}
                      onUploaded={handleUploadedFile}
                      onExternalLinkChange={handleExternalLinkChange}
                      disabled={!editable}
                      slots={artworkUploadSlots}
                      withExternalLinks
                    />
                  </div>
                </div>
              ) : releaseId ? (
                <a
                  href="#release-files"
                  className="text-sm font-semibold text-primary"
                >
                  {copy.goToFileUpload}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {copy.completeTitleArtist}
                </p>
              )}
            </div>
          </div>

          <label className="grid gap-2 text-sm font-medium">
            {copy.notes}
            <textarea
              name="notes"
              defaultValue={release?.notes ?? ""}
              disabled={!editable}
              placeholder={copy.notesPlaceholder}
              className="min-h-28 rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          {editable ? (
            <div className="grid gap-3">
              {checkoutError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {checkoutError}
                </div>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                {submitHint ? (
                  <p className="self-center text-sm font-semibold text-destructive">
                    {submitHint}
                  </p>
                ) : null}
                {requiredPaymentProductKey && !hasUnlockedPaymentForSelection ? (
                  <Button
                    type="button"
                    onClick={() => startReleaseCheckout()}
                    disabled={isStartingCheckout}
                  >
                    <CreditCard className="size-4" />
                    {isStartingCheckout
                      ? copy.preparingPayment
                      : copy.payAndContinue(selectedReleaseType)}
                  </Button>
                ) : (
                  <Button
                    ref={submitButtonRef}
                    type="submit"
                    name="intent"
                    value="submit"
                  >
                    <Send className="size-4" />
                    {copy.submit}
                  </Button>
                )}
              </div>
            </div>
          ) : null}
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  defaultValue,
  disabled,
  invalid,
  onChange,
  helper,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  disabled?: boolean;
  invalid?: boolean;
  onChange?: () => void;
  helper?: string;
  children?: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span className={label.includes("Link externo") ? "text-base font-semibold" : ""}>
        {label}
      </span>
      {children ?? (
        <Input
          name={name}
          defaultValue={defaultValue ?? ""}
          disabled={disabled}
          onChange={onChange}
          className={invalid ? "border-destructive" : ""}
        />
      )}
      {helper ? (
        <span
          className={cn(
            "text-xs font-normal",
            invalid ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {helper}
        </span>
      ) : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  getOptionLabel,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: readonly string[];
  getOptionLabel?: (option: string) => string;
  disabled?: boolean;
}) {
  const value =
    defaultValue && options.includes(defaultValue) ? defaultValue : "Otro";

  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        name={name}
        defaultValue={value}
        disabled={disabled}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getOptionLabel ? getOptionLabel(option) : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function getReleaseUploadSlots({
  copy,
  locale,
  releaseType,
  trackTitles,
  sameArtworkForAll,
}: {
  copy: (typeof releaseFormCopyByLocale)[AppLocale];
  locale: AppLocale;
  releaseType: ReleaseType;
  trackTitles: string[];
  sameArtworkForAll: boolean;
}) {
  if (releaseType === "video") {
    return [
      buildReleaseUploadSlot({ fileType: "video", label: "Video", locale }),
      buildReleaseUploadSlot({
        fileType: "artwork",
        label: copy.uploadSlotArtwork,
        locale,
      }),
    ];
  }

  if (releaseType === "single") {
    return [
      buildReleaseUploadSlot({
        fileType: "audio",
        label: copy.uploadSlotSong,
        locale,
      }),
      buildReleaseUploadSlot({
        fileType: "artwork",
        label: copy.uploadSlotArtwork,
        locale,
      }),
    ];
  }

  const audioSlots = trackTitles.map((trackTitle, index) =>
    buildReleaseUploadSlot({
      fileType: "audio",
      label: copy.uploadSlotTrack(index, trackTitle),
      locale,
    }),
  );
  const artworkSlots = [
    buildReleaseUploadSlot({
      fileType: "artwork",
      label: copy.uploadSlotGeneralArtwork(releaseType),
      locale,
    }),
  ];

  if (!sameArtworkForAll) {
    artworkSlots.push(
      ...trackTitles.map((trackTitle, index) =>
        buildReleaseUploadSlot({
          fileType: "artwork",
          label: copy.uploadSlotTrackArtwork(index, trackTitle),
          locale,
        }),
      ),
    );
  }

  return [...audioSlots, ...artworkSlots];
}

function getInitialTrackTitles(releaseType: ReleaseType, tracks: string[]) {
  if (releaseType !== "ep" && releaseType !== "album") {
    return [];
  }

  return getTrackTitlesForReleaseType(releaseType, tracks);
}

function getInitialTrackCollaborators(
  releaseType: ReleaseType,
  tracks: string[],
  collaborators: string[],
) {
  if (releaseType !== "ep" && releaseType !== "album") {
    return [];
  }

  return getTrackCollaboratorsForReleaseType(
    releaseType,
    collaborators,
    getInitialTrackTitles(releaseType, tracks).length,
  );
}

function getTrackTitlesForReleaseType(releaseType: ReleaseType, current: string[]) {
  if (releaseType !== "ep" && releaseType !== "album") {
    return [];
  }

  const limit = releaseTrackLimits[releaseType];
  const cleaned = current.map((track) => track.trim()).filter(Boolean);
  const next =
    cleaned.length > 0
      ? cleaned.slice(0, limit.max)
      : getEmptyTrackTitles(limit.initial);

  while (next.length < limit.initial) {
    next.push("");
  }

  return next;
}

function getTrackCollaboratorsForReleaseType(
  releaseType: ReleaseType,
  current: string[],
  targetCount?: number,
) {
  if (releaseType !== "ep" && releaseType !== "album") {
    return [];
  }

  const limit = releaseTrackLimits[releaseType];
  const count = Math.min(targetCount ?? limit.initial, limit.max);
  const next = current.slice(0, count);

  while (next.length < count) {
    next.push("");
  }

  return next;
}

function getEmptyTrackTitles(count: number) {
  return Array.from({ length: count }, () => "");
}

function getLanguageDefaultValue(value?: string | null) {
  return typeof value === "string" &&
    languageOptions.includes(value as (typeof languageOptions)[number])
    ? value
    : languageOptions[0];
}

function getExternalFilesPayload(formData: FormData) {
  const types = formData.getAll("external_file_type").map(String);
  const labels = formData.getAll("external_file_label").map(String);
  const urls = formData.getAll("external_file_url").map(String);

  return urls
    .map((url, index) => ({
      fileType: types[index] ?? "external_link",
      label: labels[index] ?? "Link externo",
      url: url.trim(),
    }))
    .filter((item) => item.url.length > 0);
}

function getGenreLabel(locale: AppLocale, genre: string) {
  return genreLabelsByLocale[locale]?.[genre] ?? genre;
}

function getLanguageLabel(locale: AppLocale, language: string) {
  return languageOptionLabelsByLocale[locale]?.[language] ?? language;
}

function getPlatformLabel(locale: AppLocale, platform: string) {
  return platformLabelsByLocale[locale]?.[platform] ?? platform;
}

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
import { cn } from "@/lib/utils";

const releaseTypes = ["single", "ep", "album", "video"] as const;
type ReleaseType = (typeof releaseTypes)[number];

const releaseTypeLabels: Record<ReleaseType, string> = {
  single: "Canción",
  ep: "EP",
  album: "Álbum",
  video: "Video",
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
  const titleLabel = getTitleLabel(selectedReleaseType);
  const uploadSlots = getReleaseUploadSlots({
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
      throw new Error(body?.error ?? "No se pudo preparar el lanzamiento.");
    }

    const body = (await response.json()) as { releaseId?: string };

    if (!body.releaseId) {
      throw new Error("No se pudo preparar el lanzamiento.");
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
          : "No se pudo iniciar el pago.",
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
      nextErrors.title = "Falta el título.";
    }

    if (
      !isVideoRelease &&
      !String(formData.get("primary_artist") ?? "").trim()
    ) {
      nextErrors.primaryArtist = "Falta el artista principal.";
    }

    if (platformSelection.size === 0) {
      nextErrors.platforms = "Selecciona al menos una plataforma.";
    }

    if (showsTrackList) {
      const minimumTracks = releaseTrackLimits[selectedReleaseType].initial;
      const completedTracks = trackTitles.filter((trackTitle) =>
        trackTitle.trim(),
      ).length;

      if (completedTracks < minimumTracks) {
        nextErrors.tracks = `Completa mínimo ${minimumTracks} canciones.`;
      }
    }

    if (
      isVideoRelease &&
      !effectiveVideoNotOwnSong &&
      !selectedRelatedTrackId
    ) {
      nextErrors.videoSong =
        "Selecciona la canción relacionada o marca que el video es independiente.";
    }

    if (!externalLinks && !readyFileExists) {
      nextErrors.files = "Sube un archivo o pega un link.";
    }

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      setValidationErrors(nextErrors);
      setSubmitHint("Falta algo para completar.");
      return;
    }

    setValidationErrors({});
    setSubmitHint(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del lanzamiento</CardTitle>
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
              Tipo
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
                  label="Artista principal"
                  name="primary_artist"
                  defaultValue={release?.primary_artist}
                  disabled={!editable}
                  invalid={Boolean(validationErrors.primaryArtist)}
                  helper={validationErrors.primaryArtist}
                  onChange={() => clearValidationError("primaryArtist")}
                />
                {!showsTrackList ? (
                  <Field
                    label="Colaboraciones"
                    name="featured_artists"
                    defaultValue={release?.featured_artists}
                    disabled={!editable}
                  />
                ) : null}
              </>
            )}
            <SelectField
              label="Género"
              name="genre"
              defaultValue={release?.genre}
              options={musicGenreOptions}
              disabled={!editable}
            />
            <Field
              label="Idioma"
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
                    {language}
                  </option>
                ))}
              </select>
            </Field>
            <label className="grid gap-2 text-sm font-medium">
              Fecha deseada
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
              Contenido explícito
            </label>
              </>
            )}
          </div>

          {requiresPaymentGate ? (
            <div className="grid gap-4 rounded-md border border-border bg-muted p-4">
              <div>
                <p className="text-base font-semibold">
                  {hasPaymentForSelection
                    ? selectedReleaseType === "ep"
                      ? "Usar cupo EP"
                      : "Usar cupo álbum"
                    : selectedReleaseType === "ep"
                      ? "Comprar cupo EP"
                      : "Comprar cupo álbum"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasPaymentForSelection
                    ? `Tienes ${availablePaymentCount} cupo${availablePaymentCount === 1 ? "" : "s"} disponible${availablePaymentCount === 1 ? "" : "s"}. Usa uno para completar este lanzamiento.`
                    : "Compra un cupo para abrir el formulario completo y enviar este lanzamiento."}
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
                    Usar 1 cupo
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
                      ? "Preparando pago..."
                      : selectedReleaseType === "ep"
                        ? "Comprar cupo EP"
                        : "Comprar cupo álbum"}
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
                    Comprar otro cupo
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <>

          {isVideoRelease ? (
            <div className="grid gap-4 rounded-md border border-border p-4">
              <div>
                <p className="text-sm font-semibold">Música</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Selecciona para qué canción es este video.
                </p>
              </div>
              <label className="grid gap-2 text-sm font-medium">
                Canción relacionada
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
                  <option value="">Seleccionar canción</option>
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
                Este video no pertenece a una canción de mi cuenta.
              </label>
              <input
                type="hidden"
                name="video_not_own_song"
                value={effectiveVideoNotOwnSong ? "on" : ""}
              />
              {artistSongOptions.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No hay canciones en tu cuenta todavía; puedes enviarlo como
                  video independiente.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-2">
            <p className="text-sm font-medium">Plataformas</p>
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
                  {platform}
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
                  Canciones del {selectedReleaseType === "ep" ? "EP" : "álbum"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Agrega el título de cada canción. Máximo {trackLimit.max}.
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
                      <span>Canción {index + 1}</span>
                      <Input
                        value={trackTitle}
                        onChange={(event) =>
                          updateTrackTitle(index, event.target.value)
                        }
                        disabled={!editable}
                        placeholder={`Título canción ${index + 1}`}
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium md:grid-cols-[160px_1fr] md:items-center">
                      <span>Colaboración / artista</span>
                      <Input
                        value={trackCollaborators[index] ?? ""}
                        onChange={(event) =>
                          updateTrackCollaborator(index, event.target.value)
                        }
                        disabled={!editable}
                        placeholder="Ej: Artista 1, Artista 2"
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
                  Agregar canción
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
                Carga de archivos
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
                        ? "Cargar video"
                        : "Cargar canción"}
                    </p>
                    <ReleaseFileUploader
                      releaseId={releaseId || null}
                      resolveReleaseId={ensureDraftForUpload}
                      onUploaded={handleUploadedFile}
                      onExternalLinkChange={handleExternalLinkChange}
                      disabled={!editable}
                      slots={mainUploadSlots}
                      withExternalLinks
                    />
                  </div>

                  <div className="grid gap-3 rounded-md border border-border bg-background p-4">
                    <p className="text-sm font-semibold">Cargar portada</p>
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
                      Usar la misma portada para todas las canciones
                    </label>
                    ) : null}
                    <ReleaseFileUploader
                      releaseId={releaseId || null}
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
                  Ir a carga de archivos
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Completa título y artista para activar la carga privada.
                </p>
              )}
            </div>
          </div>

          <label className="grid gap-2 text-sm font-medium">
            Notas o palabras clave para AUM PRODZ
            <textarea
              name="notes"
              defaultValue={release?.notes ?? ""}
              disabled={!editable}
              placeholder="Ej: versión clean, fecha importante, contexto del lanzamiento, créditos o instrucciones."
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
                      ? "Preparando pago..."
                      : selectedReleaseType === "ep"
                        ? "Pagar EP y continuar"
                        : "Pagar álbum y continuar"}
                  </Button>
                ) : (
                  <Button
                    ref={submitButtonRef}
                    type="submit"
                    name="intent"
                    value="submit"
                  >
                    <Send className="size-4" />
                    Enviar lanzamiento
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
  disabled,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: readonly string[];
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
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function getReleaseUploadSlots({
  releaseType,
  trackTitles,
  sameArtworkForAll,
}: {
  releaseType: ReleaseType;
  trackTitles: string[];
  sameArtworkForAll: boolean;
}) {
  if (releaseType === "video") {
    return [
      buildReleaseUploadSlot({ fileType: "video", label: "Video" }),
      buildReleaseUploadSlot({ fileType: "artwork", label: "Portada" }),
    ];
  }

  if (releaseType === "single") {
    return [
      buildReleaseUploadSlot({ fileType: "audio", label: "Canción" }),
      buildReleaseUploadSlot({ fileType: "artwork", label: "Portada" }),
    ];
  }

  const releaseName = releaseType === "ep" ? "EP" : "álbum";
  const audioSlots = trackTitles.map((trackTitle, index) =>
    buildReleaseUploadSlot({
      fileType: "audio",
      label: `Canción ${index + 1}${trackTitle.trim() ? `: ${trackTitle.trim()}` : ""}`,
    }),
  );
  const artworkSlots = [
    buildReleaseUploadSlot({
      fileType: "artwork",
      label: `Portada general del ${releaseName}`,
    }),
  ];

  if (!sameArtworkForAll) {
    artworkSlots.push(
      ...trackTitles.map((trackTitle, index) =>
        buildReleaseUploadSlot({
          fileType: "artwork",
          label: `Portada canción ${index + 1}${trackTitle.trim() ? `: ${trackTitle.trim()}` : ""}`,
        }),
      ),
    );
  }

  return [...audioSlots, ...artworkSlots];
}

function getTitleLabel(releaseType: ReleaseType) {
  if (releaseType === "ep") {
    return "Título del EP";
  }

  if (releaseType === "album") {
    return "Título del álbum";
  }

  if (releaseType === "video") {
    return "Título del video";
  }

  return "Título de la canción";
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

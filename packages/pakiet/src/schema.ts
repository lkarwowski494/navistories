import { z } from "zod";
import { AUDIO_EXTENSIONS, FORMAT_VERSION } from "./config";

/**
 * Format pakietu trasy (wersja 1).
 *
 * Pakiet to katalog z plikiem `pakiet.json` (ten schemat) i plikami audio, do
 * których prowadzą ścieżki względne w `points[].audio`. Pakiety układa warsztat;
 * aplikacja tylko je czyta.
 */

const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "id: małe litery, cyfry i myślniki");
const nonEmpty = z.string().trim().min(1);

/** [szerokość, długość] w stopniach WGS84. */
const latLon = z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]);

const segment = "[A-Za-z0-9_-][A-Za-z0-9._-]*";
const audioPath = new RegExp(`^(?:${segment}/)*${segment}\\.(?:${AUDIO_EXTENSIONS.join("|")})$`);

/** Źródło historii: instytucja i adres strony, z której pochodzi informacja. */
export const sourceSchema = z.strictObject({
  institution: nonEmpty,
  url: z.url({ protocol: /^https?$/, error: "url: wymagany adres http(s)" }),
});

export const pointSchema = z.strictObject({
  id,
  /** Postęp wzdłuż trasy od startu [m]. */
  progressM: z.number().nonnegative(),
  /** Wyższa liczba = ważniejsza historia (rozstrzyga, która gra po przerwie w GPS). */
  priority: z.number().int().nonnegative(),
  title: nonEmpty,
  /** Ścieżka względna do pliku audio w katalogu pakietu (bez „..”, bez adresów). */
  audio: z.string().regex(audioPath, "audio: ścieżka względna do pliku .m4a/.mp3/.aac/.wav"),
  /** Motywy punktu (id z `themes` pakietu); filtr motywów w samochodzie. */
  themes: z.array(id).min(1),
  /** Źródła historii: co najmniej jedno (ekran „Źródła”). */
  sources: z.array(sourceSchema).min(1),
});

export const themeSchema = z.strictObject({ id, name: nonEmpty });

export const pakietSchema = z
  .strictObject({
    formatVersion: z.literal(FORMAT_VERSION),
    id,
    /** Wersja treści pakietu (nadaje warsztat). */
    version: nonEmpty,
    title: nonEmpty,
    mode: z.enum(["car", "walk"]),
    themes: z.array(themeSchema).min(1),
    /** Przybliżony czas spaceru [min]; wymagany w trybie walk. */
    durationMin: z.number().positive().optional(),
    /** Oznaczenie treści generowanych przez AI (ujawnienie w aplikacji). */
    aiGenerated: z.strictObject({ text: z.boolean(), voice: z.boolean() }),
    /** Polilinia trasy (np. z OpenStreetMap). */
    route: z.array(latLon).min(2),
    points: z.array(pointSchema).min(1),
  })
  .superRefine((p, ctx) => {
    if (p.mode === "walk" && p.durationMin === undefined) {
      ctx.addIssue({ code: "custom", path: ["durationMin"], message: "durationMin: wymagane dla spaceru" });
    }
  });

export type Source = z.infer<typeof sourceSchema>;
export type Point = z.infer<typeof pointSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type Pakiet = z.infer<typeof pakietSchema>;
export type Mode = Pakiet["mode"];

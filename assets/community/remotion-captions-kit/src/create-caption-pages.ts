import type {Caption, TikTokPage, TikTokToken} from '@remotion/captions';
import type {NormalizedWord} from './normalize-captions';
import {normalizeCaptions} from './normalize-captions';
import {endsClause, endsSentence} from './sentence-boundaries';

export type CreateCaptionPagesInput = {
	captions: Caption[];
	/**
	 * Soft cap on how much speech a page holds. A page breaks before the
	 * word that would push it past this. Default 1200.
	 */
	maxDurationMs?: number;
	/**
	 * A silence of at least this length between words starts a new page:
	 * a pause is a beat, and captions should breathe with it. Default 400.
	 */
	silenceGapMs?: number;
	/**
	 * Break after words that end a sentence. Abbreviation-aware, so "Dr."
	 * and "U.S." don't split a line. Default true.
	 */
	breakOnPunctuation?: boolean;
	/**
	 * Hard cap on characters per page, so fast speech can't overflow the
	 * safe area — time alone doesn't bound line length. Default 42, about
	 * two comfortable lines at typical short-form caption sizes.
	 */
	maxCharsPerPage?: number;
	/**
	 * Pages that would show for less than this get merged into a neighbour.
	 * Much below this a page reads as a flash rather than a line. Default
	 * 300. Set to 0 to keep every break.
	 */
	minDurationMs?: number;
	/**
	 * Fewest words a page should hold. A page left with less than this — the
	 * one-word orphan a cap break strands at the end of a phrase — is either
	 * merged into a neighbour or evened out by pulling a word across the
	 * break. Default 2. Set to 1 to allow orphans, which is what you want
	 * for deliberate one-word-at-a-time pacing.
	 *
	 * Never applied across a silence or a sentence end: a beat and a full
	 * stop are real boundaries, so an orphan next to one stays put.
	 *
	 * Best-effort, therefore, not a guarantee. A page can end up under the
	 * threshold when a real boundary sits on both sides, when merging would
	 * blow `maxDurationMs` or `maxCharsPerPage`, or when the only donor is
	 * itself down to the threshold. Raising `maxDurationMs` is usually what
	 * unblocks it.
	 */
	minWordsPerPage?: number;
};

export type CreateCaptionPagesOutput = {
	pages: TikTokPage[];
};

type Limits = {
	maxDurationMs: number;
	maxCharsPerPage: number;
	minDurationMs: number;
	minWordsPerPage: number;
	silenceGapMs: number;
};

type Page = {
	words: NormalizedWord[];
	startMs: number;
	endMs: number;
};

const pageText = (words: NormalizedWord[]): string =>
	words.map((w) => w.text).join(' ');

const page = (words: NormalizedWord[]): Page => ({
	words,
	startMs: words[0].startMs,
	endMs: words.reduce((max, w) => Math.max(max, w.endMs), words[0].endMs),
});

const toTikTokPage = (p: Page, displayMs: number): TikTokPage => ({
	text: pageText(p.words),
	startMs: p.startMs,
	// The first token of a page carries no leading space; the rest do, which
	// is what @remotion/captions consumers expect to be able to join().
	tokens: p.words.map(
		(word, i): TikTokToken => ({
			text: i === 0 ? word.text : ` ${word.text}`,
			fromMs: word.startMs,
			toMs: word.endMs,
		}),
	),
	durationMs: displayMs,
});

/**
 * How long each page is actually on screen: up to the next page's start, so
 * a caption holds through a pause instead of blinking out. The last page
 * gets only its own span, since there is nothing after it to hold for.
 */
const displayDurations = (pages: Page[]): number[] =>
	pages.map((p, i) => {
		const next = pages[i + 1];
		return Math.max(0, (next ? next.startMs : p.endMs) - p.startMs);
	});

const withinLimits = (words: NormalizedWord[], limits: Limits): boolean => {
	const span =
		words.reduce((max, w) => Math.max(max, w.endMs), words[0].endMs) -
		words[0].startMs;

	return (
		pageText(words).length <= limits.maxCharsPerPage &&
		span <= limits.maxDurationMs
	);
};

/**
 * Can these two adjacent pages be made into one? Only when no beat sits
 * between them — a pause is a real boundary, and welding across it is the
 * exact thing the stock paginator gets wrong.
 */
const joinable = (a: Page, b: Page, limits: Limits): boolean =>
	b.startMs - a.endMs < limits.silenceGapMs &&
	withinLimits([...a.words, ...b.words], limits);

/**
 * Can a word be moved across the break between these two pages? Everything
 * `joinable` requires, and the word on the left must not end a sentence:
 * shunting "fine." onto the front of the next page to even out the word
 * count trades one bad line for two.
 */
const shiftable = (a: Page, b: Page, limits: Limits): boolean =>
	b.startMs - a.endMs < limits.silenceGapMs &&
	!endsSentence(a.words[a.words.length - 1].text, b.words[0].text);

/**
 * Where a cap-forced break should really go. Splitting "down to the /
 * river, which was frozen" mid-phrase reads badly when a clause boundary
 * sits a word or two back, so look for one — but only take it if both
 * halves still hold something and the carried words still fit.
 */
const clauseSplit = (
	words: NormalizedWord[],
	incoming: NormalizedWord,
	limits: Limits,
): number | null => {
	// Never rewind to before the first word, and never past the last: a
	// break after the final word is just the plain break.
	for (let i = words.length - 2; i >= 1; i--) {
		if (!endsClause(words[i].text)) {
			continue;
		}

		const carried = [...words.slice(i + 1), incoming];

		if (withinLimits(carried, limits)) {
			return i + 1;
		}
	}

	return null;
};

/**
 * Sentence- and pause-aware alternative to createTikTokStyleCaptions().
 *
 * The stock paginator groups purely by time window, so a page can read
 * "the blank page. This", welding a sentence end to the start of the next
 * one across a pause. This paginator breaks on sentence punctuation and on
 * silences, caps pages by length as well as duration, prefers clause
 * boundaries when a cap forces the break, and cleans up after itself by
 * merging away flash pages and evening out one-word orphans.
 *
 * Emits the same TikTokPage shape, so every preset (and anything else
 * built on @remotion/captions) consumes it unchanged.
 */
export const createCaptionPages = ({
	captions,
	maxDurationMs = 1200,
	silenceGapMs = 400,
	breakOnPunctuation = true,
	maxCharsPerPage = 42,
	minDurationMs = 300,
	minWordsPerPage = 2,
}: CreateCaptionPagesInput): CreateCaptionPagesOutput => {
	const limits: Limits = {
		maxDurationMs,
		maxCharsPerPage,
		minDurationMs,
		minWordsPerPage,
		silenceGapMs,
	};
	const words = normalizeCaptions(captions);
	const pages: Page[] = [];
	let open: NormalizedWord[] = [];

	const flush = () => {
		if (open.length > 0) {
			pages.push(page(open));
			open = [];
		}
	};

	for (let i = 0; i < words.length; i++) {
		const word = words[i];

		if (open.length === 0) {
			open = [word];
		} else {
			const previousEnd = open.reduce(
				(max, w) => Math.max(max, w.endMs),
				open[0].endMs,
			);
			const silence = word.startMs - previousEnd;
			const overCap = !withinLimits([...open, word], limits);

			if (silence >= silenceGapMs) {
				// A pause is a beat: always break there, never rewind past it.
				flush();
				open = [word];
			} else if (overCap) {
				const split = clauseSplit(open, word, limits);

				if (split === null) {
					flush();
					open = [word];
				} else {
					const carried = open.slice(split);
					open = open.slice(0, split);
					flush();
					open = [...carried, word];
				}
			} else {
				open.push(word);
			}
		}

		if (breakOnPunctuation && endsSentence(word.text, words[i + 1]?.text)) {
			flush();
		}
	}

	flush();

	const tidied = fixOrphans(mergeShortPages(pages, limits), limits);
	const durations = displayDurations(tidied);

	return {pages: tidied.map((p, i) => toTikTokPage(p, durations[i]))};
};

/**
 * A page showing for 150ms reads as a flicker, not a line. Merge those into
 * a neighbour — forward by preference, since a clipped page is usually the
 * head of what follows — but never into one that would then break a cap.
 */
const mergeShortPages = (pages: Page[], limits: Limits): Page[] => {
	if (limits.minDurationMs <= 0) {
		return pages;
	}

	const merged = [...pages];
	let i = 0;

	while (i < merged.length) {
		if (displayDurations(merged)[i] >= limits.minDurationMs) {
			i++;
			continue;
		}

		const next = merged[i + 1];
		const previous = merged[i - 1];

		if (next && joinable(merged[i], next, limits)) {
			merged.splice(i, 2, page([...merged[i].words, ...next.words]));
			// Re-check in place: the merged page may still be too short.
			continue;
		}

		if (previous && joinable(previous, merged[i], limits)) {
			merged.splice(i - 1, 2, page([...previous.words, ...merged[i].words]));
			i = Math.max(0, i - 1);
			continue;
		}

		// Merging either way would overfill. A short page beats a broken one.
		i++;
	}

	return merged;
};

/**
 * A cap break at the end of a phrase strands the tail on its own: "This is
 * where you" / "start." Merge the orphan away if there is room, and if not,
 * even the split out by pulling one word across the break — "This is where"
 * / "you start." — which costs nothing, since a cap break was arbitrary to
 * begin with.
 *
 * Both moves refuse to cross a silence or a sentence end, so an orphan
 * sitting next to a real boundary is left alone rather than papered over.
 */
const fixOrphans = (pages: Page[], limits: Limits): Page[] => {
	if (limits.minWordsPerPage <= 1) {
		return pages;
	}

	const out = [...pages];

	/**
	 * Move one word from `donor` to `orphan`, if the donor can spare it and
	 * both pages stay legal afterwards. Returns whether the move happened.
	 */
	const shift = (donorIndex: number, orphanIndex: number): boolean => {
		const donor = out[donorIndex];
		const orphan = out[orphanIndex];
		const donorLeads = donorIndex < orphanIndex;

		// The donor has to stay above the threshold itself, or we have simply
		// moved the orphan along one page.
		if (donor.words.length <= limits.minWordsPerPage) {
			return false;
		}

		const [left, right] = donorLeads ? [donor, orphan] : [orphan, donor];

		if (!shiftable(left, right, limits)) {
			return false;
		}

		// Take from the end of a leading donor, the start of a trailing one:
		// always the word adjacent to the break.
		const moved = donorLeads
			? donor.words[donor.words.length - 1]
			: donor.words[0];
		const keptWords = donorLeads
			? donor.words.slice(0, -1)
			: donor.words.slice(1);
		const grownWords = donorLeads
			? [moved, ...orphan.words]
			: [...orphan.words, moved];

		if (!withinLimits(grownWords, limits)) {
			return false;
		}

		const kept = page(keptWords);
		const grown = page(grownWords);
		const candidate = [...out];
		candidate[donorIndex] = kept;
		candidate[orphanIndex] = grown;

		// Shrinking the donor shortens how long it shows. Refuse the move if
		// that turns a solved problem into a flash page.
		if (limits.minDurationMs > 0) {
			const durations = displayDurations(candidate);
			if (durations[donorIndex] < limits.minDurationMs) {
				return false;
			}
		}

		out[donorIndex] = kept;
		out[orphanIndex] = grown;
		return true;
	};

	let i = 0;

	while (i < out.length) {
		if (out[i].words.length >= limits.minWordsPerPage) {
			i++;
			continue;
		}

		const previous = out[i - 1];
		const next = out[i + 1];

		// One fuller page beats two thin ones, so try merging first.
		if (previous && joinable(previous, out[i], limits)) {
			out.splice(i - 1, 2, page([...previous.words, ...out[i].words]));
			i = Math.max(0, i - 1);
			continue;
		}

		if (next && joinable(out[i], next, limits)) {
			out.splice(i, 2, page([...out[i].words, ...next.words]));
			continue;
		}

		// No room to merge: even out the split instead.
		if (previous && shift(i - 1, i)) {
			continue;
		}

		if (next && shift(i + 1, i)) {
			continue;
		}

		// A real boundary on both sides and no room to grow. Leave it.
		i++;
	}

	return out;
};

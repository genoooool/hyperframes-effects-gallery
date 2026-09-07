import type {Caption} from '@remotion/captions';

export type NormalizedWord = {
	/** The word, no surrounding whitespace. */
	text: string;
	startMs: number;
	endMs: number;
};

/**
 * `Caption.text` is whitespace-sensitive in @remotion/captions: a leading
 * space means "new word", no leading space means "continuation of the
 * previous one". That convention is easy to miss, and missing it merges the
 * whole transcript into one unreadable page — `[{text:'hello'},
 * {text:'there'}]` comes out as "hellothere".
 *
 * Most speech APIs emit bare words with no spaces at all (Deepgram,
 * AssemblyAI), while Whisper's tokenizer emits them space-prefixed. Rather
 * than make callers know which they have, decide from the whole array: if
 * no caption carries a leading space, the array is one-word-per-caption and
 * we insert the separators. If any does, the convention is in use and we
 * honour it exactly — so genuine sub-word splits still join up.
 *
 * The one input this reads wrong is a single word split into pieces with no
 * spaces anywhere (`['Re','mo','tion']`), which becomes "Re mo tion". Any
 * such array with a second word in it has a leading space to go on, so this
 * only bites on single-word input.
 */
export const normalizeCaptions = (captions: Caption[]): NormalizedWord[] => {
	const usable = captions.filter(
		(c) =>
			Number.isFinite(c.startMs) &&
			Number.isFinite(c.endMs) &&
			c.text.trim() !== '',
	);

	// Overlapping or out-of-order words otherwise corrupt the page spans.
	// Stable, so a well-formed array keeps the order it arrived in.
	const sorted = [...usable].sort((a, b) => a.startMs - b.startMs);

	const usesLeadingSpaces = sorted.some((c) => /^\s/u.test(c.text));

	const words: NormalizedWord[] = [];

	for (const caption of sorted) {
		const startMs = caption.startMs;
		// A word can't end before it starts.
		const endMs = Math.max(caption.endMs, startMs);
		const text = caption.text.trim();

		const isContinuation =
			words.length > 0 && usesLeadingSpaces && !/^\s/u.test(caption.text);

		if (isContinuation) {
			const previous = words[words.length - 1];
			previous.text += text;
			previous.endMs = Math.max(previous.endMs, endMs);
			continue;
		}

		words.push({text, startMs, endMs});
	}

	return words;
};

import type {Caption} from '@remotion/captions';

export type SplitCaptionsIntoWordsInput = {
	captions: Caption[];
};

export type SplitCaptionsIntoWordsOutput = {
	captions: Caption[];
};

/**
 * Split block-level captions (one Caption per SRT cue, from parseSrt())
 * into per-word captions so word-level styles work on SRT input.
 *
 * SRT carries no word timing, so each word gets a share of the cue's
 * duration proportional to its length. Not perfect sync, but close enough
 * that karaoke-style highlighting reads correctly.
 */
export const splitCaptionsIntoWords = ({
	captions,
}: SplitCaptionsIntoWordsInput): SplitCaptionsIntoWordsOutput => {
	const out: Caption[] = [];

	for (const caption of captions) {
		const words = caption.text.split(/\s+/).filter(Boolean);
		if (words.length === 0) {
			continue;
		}

		const totalChars = words.reduce((sum, w) => sum + w.length, 0);
		const span = caption.endMs - caption.startMs;
		let cursor = caption.startMs;

		for (const word of words) {
			const duration = span * (word.length / totalChars);
			out.push({
				text: ' ' + word,
				startMs: cursor,
				endMs: cursor + duration,
				timestampMs: cursor,
				confidence: caption.confidence,
			});
			cursor += duration;
		}

		// Pin the last word to the cue end so float error can't leave a gap.
		out[out.length - 1].endMs = caption.endMs;
	}

	return {captions: out};
};

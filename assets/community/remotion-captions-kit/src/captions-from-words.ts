import type {Caption} from '@remotion/captions';
import type {WordTiming} from './types';

export type CaptionsFromWordsInput = {
	words: WordTiming[];
	/**
	 * Unit of the start/end values. Speech pipelines usually emit seconds;
	 * @remotion/captions speaks milliseconds. Default: "seconds".
	 */
	timeUnit?: 'seconds' | 'milliseconds';
};

export type CaptionsFromWordsOutput = {
	captions: Caption[];
};

/**
 * Convert plain word timings into the Caption[] that
 * createTikTokStyleCaptions() expects. Each word is prefixed with a space:
 * that's what tells the paginator where token boundaries are.
 */
export const captionsFromWords = ({
	words,
	timeUnit = 'seconds',
}: CaptionsFromWordsInput): CaptionsFromWordsOutput => {
	const scale = timeUnit === 'seconds' ? 1000 : 1;

	const captions: Caption[] = words.map((w) => {
		const startMs = w.start * scale;
		const endMs = w.end * scale;
		return {
			text: ' ' + w.word.trim(),
			startMs,
			endMs,
			timestampMs: startMs,
			confidence: null,
		};
	});

	return {captions};
};

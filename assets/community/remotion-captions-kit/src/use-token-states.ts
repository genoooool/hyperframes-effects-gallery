import type {TikTokPage, TikTokToken} from '@remotion/captions';
import {useCurrentFrame, useVideoConfig} from 'remotion';

export type TokenState = {
	token: TikTokToken;
	index: number;
	/** The word is being spoken right now. */
	isActive: boolean;
	/** The word's start time has passed (includes active + finished words). */
	hasAppeared: boolean;
	/** 0 before the word, 0→1 while spoken, 1 after. */
	progress: number;
};

/**
 * Absolute timeline position in ms, valid inside a <Sequence> that started
 * at the page's startMs (which is what <CaptionTrack> sets up).
 */
export const useCaptionTimeMs = (page: TikTokPage): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return page.startMs + (frame / fps) * 1000;
};

/**
 * Per-token timing state, the one computation every caption style needs.
 * Time math is absolute-vs-relative safe: the page's own startMs is added
 * back to the sequence-local frame, so tokens can never light up early/late.
 */
export const useTokenStates = ({
	page,
}: {
	page: TikTokPage;
}): {tokens: TokenState[]; timeMs: number} => {
	const timeMs = useCaptionTimeMs(page);

	const tokens = page.tokens.map((token, index) => {
		const span = token.toMs - token.fromMs;
		const progress =
			span <= 0
				? timeMs >= token.fromMs
					? 1
					: 0
				: Math.min(1, Math.max(0, (timeMs - token.fromMs) / span));
		return {
			token,
			index,
			isActive: timeMs >= token.fromMs && timeMs < token.toMs,
			hasAppeared: timeMs >= token.fromMs,
			progress,
		};
	});

	return {tokens, timeMs};
};

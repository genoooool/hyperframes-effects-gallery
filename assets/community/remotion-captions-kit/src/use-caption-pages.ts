import type {Caption, TikTokPage} from '@remotion/captions';
import {useMemo} from 'react';
import {createCaptionPages} from './create-caption-pages';

export type UseCaptionPagesInput = {
	captions: Caption[];
	/**
	 * Soft cap on how much speech a page holds.
	 * Higher = more words on screen at once. Default 1200.
	 */
	maxDurationMs?: number;
	/** A silence of at least this length starts a new page. Default 400. */
	silenceGapMs?: number;
	/** Break pages after sentence-ending punctuation. Default true. */
	breakOnPunctuation?: boolean;
	/** Hard cap on characters per page. Default 42. */
	maxCharsPerPage?: number;
	/** Merge pages that would show for less than this. Default 300. */
	minDurationMs?: number;
	/** Fewest words a page should hold. Default 2, set to 1 to allow orphans. */
	minWordsPerPage?: number;
};

/**
 * Memoized pagination via createCaptionPages(), sentence- and
 * pause-aware, unlike the stock time-window-only paginator.
 */
export const useCaptionPages = ({
	captions,
	maxDurationMs = 1200,
	silenceGapMs = 400,
	breakOnPunctuation = true,
	maxCharsPerPage = 42,
	minDurationMs = 300,
	minWordsPerPage = 2,
}: UseCaptionPagesInput): {pages: TikTokPage[]} => {
	return useMemo(
		() =>
			createCaptionPages({
				captions,
				maxDurationMs,
				silenceGapMs,
				breakOnPunctuation,
				maxCharsPerPage,
				minDurationMs,
				minWordsPerPage,
			}),
		[
			captions,
			maxDurationMs,
			silenceGapMs,
			breakOnPunctuation,
			maxCharsPerPage,
			minDurationMs,
			minWordsPerPage,
		],
	);
};

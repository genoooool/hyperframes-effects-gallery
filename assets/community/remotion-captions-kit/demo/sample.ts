import type {WordTiming} from '../src/types';

/**
 * Hand-written timings (~9.5s) pacing like real speech, with natural pauses,
 * so page-splitting and hold-through-pause behavior is visible in the demo.
 */
export const SAMPLE_WORDS: WordTiming[] = [
	{word: 'every', start: 0.25, end: 0.55},
	{word: 'great', start: 0.55, end: 0.9},
	{word: 'video', start: 0.9, end: 1.35},
	{word: 'starts', start: 1.35, end: 1.8},
	{word: 'with', start: 1.8, end: 2.0},
	{word: 'a', start: 2.0, end: 2.1},
	{word: 'story', start: 2.1, end: 2.6},
	{word: 'worth', start: 2.75, end: 3.1},
	{word: 'telling,', start: 3.1, end: 3.7},
	{word: 'but', start: 4.2, end: 4.4},
	{word: 'most', start: 4.4, end: 4.75},
	{word: 'people', start: 4.75, end: 5.1},
	{word: 'never', start: 5.1, end: 5.5},
	{word: 'get', start: 5.5, end: 5.7},
	{word: 'past', start: 5.7, end: 6.1},
	{word: 'the', start: 6.1, end: 6.25},
	{word: 'blank', start: 6.25, end: 6.7},
	{word: 'page.', start: 6.7, end: 7.2},
	{word: 'This', start: 7.7, end: 7.95},
	{word: 'is', start: 7.95, end: 8.1},
	{word: 'where', start: 8.1, end: 8.35},
	{word: 'you', start: 8.35, end: 8.6},
	{word: 'start.', start: 8.6, end: 9.2},
];

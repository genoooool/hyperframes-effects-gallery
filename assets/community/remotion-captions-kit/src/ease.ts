/**
 * Tiny internal easings so presets stay dependency-free and deterministic.
 * All take and return 0–1.
 */

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Overshoots past 1 then settles, the "slam" feel. */
export const easeOutBack = (t: number) => {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Progress of `timeMs` through a window starting at `fromMs`, clamped. */
export const windowProgress = (
	timeMs: number,
	fromMs: number,
	durationMs: number,
) => Math.min(1, Math.max(0, (timeMs - fromMs) / durationMs));

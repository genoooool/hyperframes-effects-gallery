import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeOutCubic, windowProgress} from '../ease';
import {resolveEmphasis} from '../emphasis';
import {placementStyle, resolveTheme} from '../theme';
import type {PresetProps} from '../types';
import {useTokenStates} from '../use-token-states';

const SHIFT_MS = 160;

/**
 * The quiet one for talking heads: every word is visible, the active word
 * carries the weight while the rest sit back. No color unless emphasis
 * rules add it.
 *
 * The lift is built ONLY from things that don't touch layout: transform
 * scale, opacity, and -webkit-text-stroke (which thickens glyph outlines
 * without changing their advance widths). Word metrics therefore never
 * change, so lines cannot re-wrap and spacing stays a font's natural
 * spacing. An earlier version swapped fontWeight and reserved bold-width
 * boxes per word — stable, but the per-word slack made inter-word gaps
 * visibly uneven. Don't reintroduce metric changes here; an emphasis rule
 * that sets fontWeight or fontStyle will bring the re-wrap back.
 */
export const WeightShift: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	const t = resolveTheme(theme);
	const {tokens, timeMs} = useTokenStates({page});

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				style={{
					fontFamily: t.fontFamily,
					fontSize: t.fontSize,
					fontWeight: 600,
					textAlign: 'center',
					whiteSpace: 'pre-wrap',
					textWrap: 'balance',
					lineHeight: 1.3,
					textShadow: '0 2px 14px rgba(0,0,0,0.6)',
				}}
			>
				{tokens.map(({token, index, isActive, hasAppeared}) => {
					const em = resolveEmphasis({token, index, rules: emphasis});
					// Ease in on activation; ease back out when the word ends.
					const inP = easeOutCubic(
						windowProgress(timeMs, token.fromMs, SHIFT_MS),
					);
					const outP = hasAppeared && !isActive
						? easeOutCubic(windowProgress(timeMs, token.toMs, SHIFT_MS))
						: 0;
					const lift = inP * (1 - outP);
					const color = em?.color ?? t.textColor;

					return (
						<span
							key={token.fromMs}
							style={{
								display: 'inline-block',
								whiteSpace: 'pre',
								color,
								opacity: 0.55 + 0.45 * lift,
								transform: `scale(${1 + 0.07 * lift})`,
								WebkitTextStroke: `${(t.fontSize / 40) * lift}px ${color}`,
								...em?.style,
							}}
						>
							{token.text}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

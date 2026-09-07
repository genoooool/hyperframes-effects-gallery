import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {resolveEmphasis} from '../emphasis';
import {placementStyle, resolveTheme} from '../theme';
import type {PresetProps} from '../types';
import {useTokenStates} from '../use-token-states';

/**
 * The classic karaoke: every word is visible; color sweeps left-to-right
 * through the active word as it is spoken, leaving spoken words filled.
 */
export const KaraokeFill: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	const t = resolveTheme(theme);
	const {tokens} = useTokenStates({page});

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				style={{
					fontFamily: t.fontFamily,
					fontSize: t.fontSize,
					fontWeight: 800,
					textAlign: 'center',
					whiteSpace: 'pre-wrap',
					textWrap: 'balance',
					lineHeight: 1.25,
					textShadow: '0 2px 12px rgba(0,0,0,0.65)',
				}}
			>
				{tokens.map(({token, index, progress}) => {
					const em = resolveEmphasis({token, index, rules: emphasis});
					const fillColor = em?.color ?? t.activeColor;

					return (
						<span
							key={token.fromMs}
							style={{
								position: 'relative',
								display: 'inline-block',
								whiteSpace: 'pre',
								color: t.textColor,
								...em?.style,
							}}
						>
							{token.text}
							{progress > 0 ? (
								<span
									aria-hidden
									style={{
										position: 'absolute',
										inset: 0,
										color: fillColor,
										clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
									}}
								>
									{token.text}
								</span>
							) : null}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

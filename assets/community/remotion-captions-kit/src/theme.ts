import type React from 'react';
import type {CaptionTheme} from './types';

export const defaultTheme: Required<
	Pick<
		CaptionTheme,
		| 'fontFamily'
		| 'fontSize'
		| 'textColor'
		| 'activeColor'
		| 'pillColor'
		| 'position'
		| 'edgeOffset'
		| 'paddingX'
		| 'maxWidth'
	>
> = {
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
	fontSize: 72,
	textColor: '#ffffff',
	activeColor: '#4ade80',
	pillColor: '#ececee',
	position: 'bottom',
	edgeOffset: 0.1,
	paddingX: 0.06,
	maxWidth: 1,
};

export const resolveTheme = (theme?: CaptionTheme) => ({
	...defaultTheme,
	...Object.fromEntries(
		Object.entries(theme ?? {}).filter(([, v]) => v !== undefined),
	),
});

export type ResolvedTheme = ReturnType<typeof resolveTheme>;

/**
 * AbsoluteFill style that places a caption block per the theme's position.
 * Text shadows/strokes are the preset's job; placement is shared.
 */
export const placementStyle = (theme: ResolvedTheme): React.CSSProperties => {
	const offset = `${theme.edgeOffset * 100}%`;
	// Blocks are centered, so maxWidth is equivalent to symmetric padding;
	// whichever inset is larger wins.
	const inset = `${Math.max(theme.paddingX, (1 - theme.maxWidth) / 2) * 100}%`;
	return {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent:
			theme.position === 'top'
				? 'flex-start'
				: theme.position === 'center'
					? 'center'
					: 'flex-end',
		paddingTop: theme.position === 'top' ? offset : 0,
		paddingBottom: theme.position === 'bottom' ? offset : 0,
		paddingLeft: inset,
		paddingRight: inset,
	};
};

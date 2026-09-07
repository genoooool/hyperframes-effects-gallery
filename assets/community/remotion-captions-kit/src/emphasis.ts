import type {TikTokToken} from '@remotion/captions';
import type React from 'react';
import type {EmphasisRule} from './types';

const normalize = (text: string) =>
	text
		.trim()
		.toLowerCase()
		.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');

export type ResolvedEmphasis = {
	color?: string;
	style?: React.CSSProperties;
};

/**
 * Resolve which emphasis rules apply to a token. Later rules win on
 * conflicting fields; styles merge.
 */
export const resolveEmphasis = ({
	token,
	index,
	rules,
}: {
	token: TikTokToken;
	index: number;
	rules?: EmphasisRule[];
}): ResolvedEmphasis | null => {
	if (!rules || rules.length === 0) {
		return null;
	}

	const tokenText = normalize(token.text);
	let hit = false;
	let color: string | undefined;
	let style: React.CSSProperties | undefined;

	for (const rule of rules) {
		const wordHit = rule.words?.some((w) => normalize(w) === tokenText);
		const matchHit = rule.match?.(token, index);
		if (!wordHit && !matchHit) {
			continue;
		}
		hit = true;
		if (rule.color !== undefined) {
			color = rule.color;
		}
		if (rule.style) {
			style = {...style, ...rule.style};
		}
	}

	return hit ? {color, style} : null;
};

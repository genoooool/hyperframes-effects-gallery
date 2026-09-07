import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {captionsFromWords} from '../src/captions-from-words';
import {CaptionTrack} from '../src/caption-track';
import {EditorialEmphasis} from '../src/presets/editorial-emphasis';
import {KaraokeFill} from '../src/presets/karaoke-fill';
import {KineticSlam} from '../src/presets/kinetic-slam';
import {NeonGlow} from '../src/presets/neon-glow';
import {PillKaraoke} from '../src/presets/pill-karaoke';
import {WeightShift} from '../src/presets/weight-shift';
import type {EmphasisRule, PresetProps} from '../src/types';
import {useCaptionPages} from '../src/use-caption-pages';
import {SAMPLE_WORDS} from './sample';
import {showcaseCompositions} from './Showcase';

const FPS = 30;
const DURATION_S = 10;

const EMPHASIS: EmphasisRule[] = [
	{words: ['story', 'start.'], color: '#FFD400'},
];

/**
 * Backdrop stands in for footage: a slow-moving gradient so we can judge
 * legibility over non-flat, changing background, without shipping a video
 * file in the repo.
 */
const Backdrop: React.FC<{dark?: boolean}> = ({dark}) => (
	<AbsoluteFill
		style={{
			background: dark
				? 'linear-gradient(160deg, #0b0f1c 0%, #1a1033 55%, #041b14 100%)'
				: 'linear-gradient(160deg, #3f5f7a 0%, #7a5a3f 55%, #2f4858 100%)',
		}}
	/>
);

// Components can't travel through defaultProps (Remotion serializes them),
// so each preset gets a concrete demo component via this factory.
const makeDemo = (
	Preset: React.FC<
		PresetProps & {page: import('@remotion/captions').TikTokPage}
	>,
	opts: {dark?: boolean; withEmphasis?: boolean} = {},
): React.FC => {
	const Demo: React.FC = () => {
		const {captions} = captionsFromWords({words: SAMPLE_WORDS});
		const {pages} = useCaptionPages({captions, maxDurationMs: 1500});

		return (
			<AbsoluteFill>
				<Backdrop dark={opts.dark} />
				<CaptionTrack pages={pages}>
					{(page) => (
						<Preset
							page={page}
							emphasis={opts.withEmphasis ? EMPHASIS : undefined}
						/>
					)}
				</CaptionTrack>
			</AbsoluteFill>
		);
	};
	return Demo;
};

const DEMOS: [string, React.FC][] = [
	['KaraokeFill', makeDemo(KaraokeFill)],
	['KineticSlam', makeDemo(KineticSlam, {withEmphasis: true})],
	['PillKaraoke', makeDemo(PillKaraoke)],
	['WeightShift', makeDemo(WeightShift)],
	['NeonGlow', makeDemo(NeonGlow, {dark: true})],
	['EditorialEmphasis', makeDemo(EditorialEmphasis, {withEmphasis: true})],
];

export const Root: React.FC = () => (
	<>
		{showcaseCompositions}
		{DEMOS.map(([id, Demo]) => (
			<Composition
				key={id}
				id={id}
				component={Demo}
				durationInFrames={FPS * DURATION_S}
				fps={FPS}
				width={1080}
				height={1920}
			/>
		))}
	</>
);

import React from 'react';
import {AbsoluteFill, Composition, Freeze} from 'remotion';
import type {TikTokPage} from '@remotion/captions';
import {captionsFromWords} from '../src/captions-from-words';
import {CaptionTrack} from '../src/caption-track';
import {createCaptionPages} from '../src/create-caption-pages';
import {EditorialEmphasis} from '../src/presets/editorial-emphasis';
import {KaraokeFill} from '../src/presets/karaoke-fill';
import {KineticSlam} from '../src/presets/kinetic-slam';
import {NeonGlow} from '../src/presets/neon-glow';
import {PillKaraoke} from '../src/presets/pill-karaoke';
import {WeightShift} from '../src/presets/weight-shift';
import type {CaptionTheme, EmphasisRule, PresetProps} from '../src/types';
import {SAMPLE_WORDS} from './sample';

/**
 * README artwork, rendered by the library itself so it can never drift
 * from what the presets actually look like. Not part of the npm package;
 * package.json ships dist/ only.
 */

type Preset = React.FC<PresetProps & {page: TikTokPage}>;

const CELL_THEME: CaptionTheme = {position: 'center', fontSize: 58};

const pagesFor = () => {
	const {captions} = captionsFromWords({words: SAMPLE_WORDS});
	return createCaptionPages({captions, maxDurationMs: 1500}).pages;
};

const Cell: React.FC<{
	label: string;
	frame: number;
	Preset: Preset;
	dark?: boolean;
	emphasis?: EmphasisRule[];
}> = ({label, frame, Preset, dark, emphasis}) => {
	const pages = pagesFor();

	return (
		<div style={{position: 'relative', overflow: 'hidden', borderRadius: 12}}>
			<AbsoluteFill
				style={{
					background: dark
						? 'linear-gradient(160deg, #0b0f1c 0%, #1a1033 55%, #041b14 100%)'
						: 'linear-gradient(160deg, #3f5f7a 0%, #7a5a3f 55%, #2f4858 100%)',
				}}
			/>
			<Freeze frame={frame}>
				<CaptionTrack pages={pages}>
					{(page) => (
						<Preset page={page} theme={CELL_THEME} emphasis={emphasis} />
					)}
				</CaptionTrack>
			</Freeze>
			<span
				style={{
					position: 'absolute',
					top: 14,
					left: 16,
					fontFamily: 'ui-monospace, Menlo, monospace',
					fontSize: 21,
					letterSpacing: '0.08em',
					color: 'rgba(255,255,255,0.75)',
				}}
			>
				{label}
			</span>
		</div>
	);
};

const EMPHASIS: EmphasisRule[] = [{words: ['story'], color: '#FFD400'}];

/** All six presets, each frozen mid-motion. */
export const ShowcaseGrid: React.FC = () => (
	<AbsoluteFill
		style={{
			background: '#0a0a0c',
			display: 'grid',
			gridTemplateColumns: '1fr 1fr',
			gridAutoRows: '1fr',
			gap: 10,
			padding: 10,
		}}
	>
		<Cell label="KaraokeFill" frame={33} Preset={KaraokeFill} />
		<Cell label="KineticSlam" frame={66} Preset={KineticSlam} emphasis={EMPHASIS} />
		{/* Frozen mid-page so the grey not-yet-spoken words are visible. */}
		<Cell label="PillKaraoke" frame={20} Preset={PillKaraoke} />
		<Cell label="WeightShift" frame={33} Preset={WeightShift} />
		<Cell label="NeonGlow" frame={33} Preset={NeonGlow} dark />
		<Cell label="EditorialEmphasis" frame={37} Preset={EditorialEmphasis} />
	</AbsoluteFill>
);

/** The same page with and without an emphasis rule, for the README. */
export const EmphasisShowcase: React.FC = () => (
	<AbsoluteFill
		style={{
			background: '#0a0a0c',
			display: 'grid',
			gridTemplateRows: '1fr 1fr',
			gap: 10,
			padding: 10,
		}}
	>
		<Cell label="no emphasis" frame={69} Preset={KineticSlam} />
		<Cell
			label='emphasis: {words: ["story"], color: "#FFD400"}'
			frame={69}
			Preset={KineticSlam}
			emphasis={EMPHASIS}
		/>
	</AbsoluteFill>
);

export const showcaseCompositions = (
	<>
		{/* Not 1 frame: useCurrentFrame clamps to durationInFrames - 1, so a
		    1-frame composition would clamp every <Freeze frame> back to 0. */}
		<Composition
			id="Showcase"
			component={ShowcaseGrid}
			durationInFrames={90}
			fps={30}
			width={1440}
			height={1080}
		/>
		<Composition
			id="EmphasisShowcase"
			component={EmphasisShowcase}
			durationInFrames={90}
			fps={30}
			width={1440}
			height={720}
		/>
	</>
);

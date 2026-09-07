import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';

export type CaptionTrackProps = {
	pages: TikTokPage[];
	children: (page: TikTokPage, index: number) => React.ReactNode;
};

/**
 * Lays every page out on the timeline as a <Sequence>. The render prop
 * receives the page; put a preset (or your own component) inside.
 *
 * page.durationMs already extends each page to the start of the next one
 * (that's how createTikTokStyleCaptions emits it), so pages hold on screen
 * through pauses instead of flashing off.
 */
export const CaptionTrack: React.FC<CaptionTrackProps> = ({
	pages,
	children,
}) => {
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill>
			{pages.map((page, index) => {
				const from = Math.round((page.startMs / 1000) * fps);
				const durationInFrames = Math.max(
					1,
					Math.round((page.durationMs / 1000) * fps),
				);

				return (
					<Sequence key={page.startMs} from={from} durationInFrames={durationInFrames}>
						{children(page, index)}
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

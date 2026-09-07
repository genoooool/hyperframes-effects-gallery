import type { FC } from "react";

export interface TemplateMeta {
  id: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
}

export interface TemplateEntry extends TemplateMeta {
  component: FC;
}

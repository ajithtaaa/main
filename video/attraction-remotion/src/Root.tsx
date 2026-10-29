import React from 'react';
import {Composition} from 'remotion';
import '@fontsource/anek-malayalam/malayalam-800.css';
import '@fontsource/anek-malayalam/latin-800.css';
import '@fontsource/anek-malayalam/malayalam-700.css';
import '@fontsource/anek-malayalam/latin-700.css';
import '@fontsource/baloo-chettan-2/malayalam-800.css';
import '@fontsource/baloo-chettan-2/latin-800.css';
import '@fontsource/baloo-chettan-2/malayalam-700.css';
import '@fontsource/baloo-chettan-2/latin-700.css';
import {Main, TOTAL} from './Main';
import {StickMain, STICK_TOTAL} from './stick/StickMain';
import {CharacterSheet, CastSheet} from './stick/CharacterSheet';

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="SheetArjun" component={CharacterSheet} defaultProps={{who: 'arjun' as const}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="SheetGirl" component={CharacterSheet} defaultProps={{who: 'girl' as const}} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="SheetCast" component={CastSheet} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Stick" component={StickMain} durationInFrames={STICK_TOTAL} fps={30} width={1920} height={1080} />
  </>
);

import React from 'react';
import {Composition} from 'remotion';
import '@fontsource/baloo-chettan-2/malayalam-800.css';
import '@fontsource/baloo-chettan-2/latin-800.css';
import '@fontsource/baloo-chettan-2/malayalam-700.css';
import '@fontsource/baloo-chettan-2/latin-700.css';
import {Main, TOTAL} from './Main';

export const Root: React.FC = () => (
  <Composition id="Main" component={Main} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
);

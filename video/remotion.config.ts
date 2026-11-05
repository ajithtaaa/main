import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// "angle" gives WebGL in headless Chrome so Three.js scenes render on servers too.
Config.setChromiumOpenGlRenderer("angle");

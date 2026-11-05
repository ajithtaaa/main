// cast.js — signature colour per character, fixed for the whole video.
export const ELON = { top: 'tshirt', color: '#d11f2a', head: 'none' };                        // Elon: red tee
export const PETER = { top: 'suit', color: '#4a6a9a', color2: '#e8e2d6', face: 'glasses', head: 'none' }; // Peter Thiel: blue suit, glasses
export const FAN = { top: 'tshirt', color: '#56606a', head: 'cap', headColor: '#2a2a2a' };
export const EXTRA = { top: 'tshirt', color: '#56606a', head: 'none' };
export const ARJUN = ELON, MEERA = PETER;   // aliases used by shared templates (end screen)
export const CAST = { ELON, PETER, FAN, EXTRA, ARJUN, MEERA };

export const COLORS = {
  white: '#ffffff',
  gray50: '#f9f9f9',
  gray100: '#f5f5f5',
  gray150: '#eaeaea',
  gray200: '#e0e0e0',
  gray250: '#dcdcdc',
  gray300: '#d8d8d8',
  gray350: '#bdbdbd',
  gray400: '#a2a2a2',
  gray450: '#939393',
  gray500: '#848484',
  gray550: '#767676',
  gray600: '#686868',
  gray650: '#5c5c5c',
  gray700: '#515151',
  gray750: '#474747',
  gray800: '#3d3d3d',
  gray850: '#333333',
  gray900: '#2a2a2a',
  teal50: '#eff4f5',
  teal100: '#dfe9ea',
  teal150: '#cfdee0',
  teal200: '#bfd4d6',
  teal250: '#afc9cc',
  teal300: '#9fbec1',
  teal350: '#8fb4b7',
  teal400: '#7fa9ad',
  teal450: '#6f9fa4',
  teal500: '#5f959a',
  teal550: '#4e8b90',
  teal600: '#3c8187',
  teal650: '#27777d',
  teal700: '#036d74',
  teal750: '#025e64',
  teal800: '#025055',
  teal850: '#014246',
  teal900: '#013437',
  blue50: '#f2f2fc',
  blue100: '#e2e2f8',
  blue150: '#d3d3f3',
  blue200: '#c3c4ef',
  blue250: '#b3b5eb',
  blue300: '#a2a6e6',
  blue350: '#9197e1',
  blue400: '#7f89dd',
  blue450: '#6c7bd8',
  blue500: '#576ed3',
  blue550: '#3d61ce',
  blue600: '#0e54c9',
  blue650: '#0d4caf',
  blue700: '#0c4396',
  blue750: '#093b7e',
  blue800: '#073366',
  blue850: '#042b50',
  blue900: '#01233a',
  green50: '#e9fff0',
  green100: '#d6fce2',
  green150: '#c3f8d4',
  green200: '#aff4c6',
  green250: '#a8eabe',
  green300: '#a1e0b6',
  green350: '#9bd7af',
  green400: '#94cda7',
  green450: '#8dc49f',
  green500: '#87ba98',
  green550: '#80b190',
  green600: '#7aa789',
  green650: '#739e82',
  green700: '#6d957a',
  green750: '#668c73',
  green800: '#60836c',
  green850: '#5a7b65',
  green900: '#54725e',
  yellow50: '#fff9e9',
  yellow100: '#fff7e1',
  yellow150: '#ffedc3',
  yellow200: '#ffe3a5',
  yellow250: '#ffda87',
  yellow300: '#ffd068',
  yellow350: '#ffc745',
  yellow400: '#fcbe11',
  yellow450: '#eeb314',
  yellow500: '#e0a916',
  yellow550: '#d29f17',
  yellow600: '#c59418',
  yellow650: '#b78a19',
  yellow700: '#aa8019',
  yellow750: '#9d7719',
  yellow800: '#906d19',
  yellow850: '#836319',
  yellow900: '#775a18',
  orange50: '#fff6f0',
  orange100: '#ffe8d9',
  orange150: '#ffdac3',
  orange200: '#ffccad',
  orange250: '#ffbe97',
  orange300: '#ffb082',
  orange350: '#ffa26d',
  orange400: '#ff9457',
  orange450: '#ff8541',
  orange500: '#ff7629',
  orange550: '#ed6e27',
  orange600: '#dc6726',
  orange650: '#cb6024',
  orange700: '#ba5822',
  orange750: '#a95121',
  orange800: '#994a1f',
  orange850: '#89431d',
  orange900: '#793c1b',
  red50: '#fff2ee',
  red100: '#ffe3da',
  red150: '#ffd3c6',
  red200: '#fec4b2',
  red250: '#fcb49f',
  red300: '#faa58c',
  red350: '#f69579',
  red400: '#f28667',
  red450: '#ed7555',
  red500: '#e76543',
  red550: '#e15331',
  red600: '#da401e',
  red650: '#c63c1d',
  red700: '#b3381b',
  red750: '#a0331a',
  red800: '#8d2f18',
  red850: '#7b2b17',
  red900: '#692615',
};

export const HEADER_HEIGHT = 56;

export const FONT_SIZES = {
  xxs: 10, // micro / tab
  xs: 12, // caption, badge, helper, field error
  sm: 14, // secondary text, field label
  base: 16, // default body, input text, button title
  lg: 18, // emphasised body, large label
  xl: 20, // small heading
  '2xl': 24, // section heading
  '3xl': 30, // page title
  '4xl': 36, // hero / large numerals
} as const;

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500', // field label, secondary emphasis
  semibold: '600', // selected state, minor headings
  bold: '700', // titles, amounts, primary emphasis — always '700', never 'bold'
} as const;

// Leading grows by a flat 6px, so the ratio tightens as type scales up — what large text needs.
// Only for text that can wrap; a single line next to an icon wants CENTERED_TEXT instead.
export const LINE_HEIGHTS = {
  xxs: 16,
  xs: 18,
  sm: 20,
  base: 22,
  lg: 24,
  xl: 26,
  '2xl': 30,
  '3xl': 36,
  '4xl': 42,
} as const;

// Android pads the line box using the font's max ascender/descender — Vietnamese diacritics make
// that padding thick — which drops the glyphs below the row's centre axis. Ignored on iOS.
export const CENTERED_TEXT = {
  includeFontPadding: false,
  textAlignVertical: 'center',
} as const;

export const ICON_SIZES = {
  xs: 12, // tiny indicators (chevrons in dense rows)
  sm: 16, // inside inputs / badges
  md: 20, // default (nav, buttons)
  lg: 24, // header, small empty-state
  xl: 32, // illustration
  xxl: 40,
} as const;

export const AVATAR_SIZES = {
  xs: 24, // inline mention / dense row
  sm: 32, // dense lists
  md: 40, // list item default + header trigger + account menu
  lg: 64, // profile screen
  xl: 96, // reserved
} as const;

export const SPACING = {
  '2xs': 2, // hairline gap in dense rows (badge, inline label)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;

export const RADIUS = {
  xs: 4, // checkbox, elements < 20px
  sm: 6,
  md: 8, // inputs, buttons, notices — the auth default
  lg: 12,
  full: 9999, // pills / circular
} as const;

export const BADGE_VARIANT = {
  GREEN: 'GREEN',
  BLUE: 'BLUE',
  ORANGE: 'ORANGE',
  RED: 'RED',
  GRAY: 'GRAY',
} as const;

export type BadgeVariant = (typeof BADGE_VARIANT)[keyof typeof BADGE_VARIANT];

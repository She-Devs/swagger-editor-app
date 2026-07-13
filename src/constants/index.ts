import { IconCode, IconSchool, IconUsers, IconWorld } from '@tabler/icons-react';

export const LOGO = '🦄 She-devs';
export const RS_SCHOOL = 'RS School';
export const RS_SCHOOL_LINK = 'https://rs.school/courses/javascript';
export const FOOTER_YEAR = '2026';
export const THEME_DARK = 'dark';
export const lANG_RU = 'RU';
export const lANG_EN = 'EN';

export const THEME_ICONS = {
  dark: '🌙',
  light: '☀️',
} as const;

export const DATA_FORMATS = {
  JSON: 'json',
  YAML: 'yaml',
} as const;

export const METHOD_COLORS: Record<string, string> = {
  get: 'teal',
  post: 'blue',
  put: 'orange',
  delete: 'red',
  patch: 'yellow',
  options: 'gray',
  head: 'gray',
  trace: 'gray',
};

export const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];

export const TEAM = [
  { name: 'Margarita', role: 'Developer, Team Lead', github: 'solarsungai' },
  { name: 'Marta', role: 'Developer', github: '27moon' },
  { name: 'Vika', role: 'Developer', github: 'oneilcode' },
] as const;

export const MENTORS = [
  { name: 'Diana', role: 'Mentor · Rolling Scopes School', github: 'bt-diana' },
  { name: 'Margarita', role: 'Mentor · Rolling Scopes School', github: 'Margaryta-Maletz' },
] as const;

export const HIGHLIGHTS_ABOUT = [
  {
    key: 'handsOnLearning',
    icon: IconSchool,
  },
  {
    key: 'realProjects',
    icon: IconUsers,
  },
  {
    key: 'modernStack',
    icon: IconCode,
  },
  {
    key: 'community',
    icon: IconWorld,
  },
] as const;

export const TECH = [
  {
    name: 'Next.js',
    url: 'https://nextjs.org/',
  },
  {
    name: 'React',
    url: 'https://react.dev/',
  },
  {
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org/',
  },
  {
    name: 'Mantine UI',
    url: 'https://mantine.dev/',
  },
  {
    name: 'OpenAPI',
    url: 'https://www.openapis.org/',
  },
  {
    name: 'Swagger',
    url: 'https://swagger.io/',
  },
  {
    name: 'Vitest',
    url: 'https://vitest.dev/',
  },
  {
    name: 'React Testing Library',
    url: 'https://testing-library.com/docs/react-testing-library/intro/',
  },
  {
    name: 'ESLint',
    url: 'https://eslint.org/',
  },
  {
    name: 'Husky',
    url: 'https://typicode.github.io/husky/',
  },
  {
    name: 'GitHub Actions',
    url: 'https://github.com/features/actions',
  },
  {
    name: 'Netlify',
    url: 'https://www.netlify.com/',
  },
] as const;

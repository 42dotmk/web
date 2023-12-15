const getClassesFromCsharp = (content) => {
  const regex = /@class\(\"(.*)\"\)/mg;
  const res = [...content.matchAll(regex)].map(x => x[1].split(" ")).flat();
  return res;
}

/** @type {import('tailwindcss').Config} */
export const darkMode = 'class';
export const content = {
  files: ["../**/*.{cs,cshtml}"],
  extract: {
    cs: getClassesFromCsharp,
  }
};
export const theme = {
  extend: {
    colors: {
      primary: "#fae127",
      secondary: {
        '50': '#ecfffd',
        '100': '#cffefc',
        '200': '#a6fbf9',
        '300': '#68f8f6',
        '400': '#2beded',
        '500': '#08d0d2',
        '600': '#09a6b1',
        '700': '#0f848f',
        '800': '#166a74',
        '900': '#175862',
        '950': '#083b44',
        '1000': '#151c1f',
      },
    },
    fontFamily: {
      'sans': ['JetBrains Mono', 'sans-serif'],
    },
    animation: {
      marquee: 'marquee 3s linear infinite',
      marquee2: 'marquee2 3s linear infinite',
    },
    keyframes: {
      marquee: {
        '0%': { transform: 'translateX(0%)' },
        '100%': { transform: 'translateX(-100%)' },
      },
      marquee2: {
        '0%': { transform: 'translateX(100%)' },
        '100%': { transform: 'translateX(0%)' },
      },
    },
  },
};
export const plugins = [
  require('@tailwindcss/typography'),
];


const getClassesFromCsharp = (content) => {
  const regex = /@class\(\"(.*)\"\)/mg;
  const res = [...content.matchAll(regex)].map(x => x[1].split(" ")).flat();
  if (res.length > 0) {
    // console.log(res);
  }
  return res;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: { 
    files: ["../**/*.{cs,cshtml}"],
    extract: {
      cshtml: getClassesFromCsharp,
      cs: getClassesFromCsharp,
    }
  },
  theme: {
    extend: {
      colors: {
        primary: "#fae127",
        secondary: "#2beded",
      },
      fontFamily: {
        'sans': ['JetBrains Mono', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}


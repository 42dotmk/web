const getClassesFromCsharp = (content) => {
  const regex = /@class\(\"(.*)\"\)/mg;
  const res = [...content.matchAll(regex)].map(x => x[1].split(" ")).flat();
  return res;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: { 
    files: ["../**/*.cs"],
    extract: {
      cshtml: getClassesFromCsharp,
      cs: getClassesFromCsharp,
    }
  },
  theme: {
    extend: {
      fontFamily: {
        'sans': ['JetBrains Mono', 'sans-serif'],
      }
    },
  },
  plugins: [],
}


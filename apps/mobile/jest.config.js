/** Testy ekranów: jest-expo + @testing-library/react-native. */
module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts?(x)"],
  // Pakiety workspace (@navistories/*) są w TypeScript; pnpm trzyma zależności w node_modules/.pnpm.
  transformIgnorePatterns: [
    "node_modules/(?!(\\.pnpm|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@navistories/.*))",
  ],
};

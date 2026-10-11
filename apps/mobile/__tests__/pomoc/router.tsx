/** Wspólna atrapa expo-router dla testów ekranów (jest.mock w każdym pliku testu). */
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  dismissTo: jest.fn(),
};

export const mockParams: { current: Record<string, string | undefined> } = { current: {} };

export function expoRouterMock() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  return {
    useRouter: () => mockRouter,
    useLocalSearchParams: () => mockParams.current,
    Redirect: ({ href }: { href: string }) => <Text>{`przekierowanie:${href}`}</Text>,
  };
}

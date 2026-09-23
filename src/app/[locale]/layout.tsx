import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Baihe - 百合 Series',
  description: 'Fan translation site for 百合 (GL) Chinese dramas',
};

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
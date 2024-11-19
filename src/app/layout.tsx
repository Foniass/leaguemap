import PlausibleProvider from "next-plausible";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Map LoL d'Analyse Stratégique - LeagueMap",
	description:
		"Map d'analyse pour League of Legends, crée par Kazewa. Analysez vos games, élaborez des stratégies, approfondissez l'aspect macro et optimisez votre coaching grâce à des outils avancés.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="fr">
			<head>
				<PlausibleProvider domain="map.leaguebuilder.gg" taggedEvents={true} />
			</head>
			<body className={inter.className}>{children}</body>
		</html>
	);
}

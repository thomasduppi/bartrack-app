import { FeatureCard } from "../components/FeatureCard";
import { FaChartBar, FaBullseye, FaClock } from "react-icons/fa";
import type { IconType } from "react-icons";
import { Footer } from "../components/Footer";
import capteur from "../assets/img/capteur.png";

type Feature = {
  icon: IconType
  title: string
  description: string
}

const featuresCards: Feature[] = [
  {
    icon: FaClock,
    title: "Temps réel",
    description: "Analyse instantanée des répétitions : vitesse d’exécution, amplitude du mouvement, tempo et nombre de reps sont captés en direct pour vous donner un retour précis et exploitable, directement pendant votre séance.",
  },
  {
    icon: FaBullseye,
    title: "PR estimé",
    description: "Estimation intelligente de votre 1RM (répétition maximale) à partir de vos données réelles. BarTrack analyse la qualité et la régularité de vos mouvements pour vous fournir une prédiction fiable.",
  },
  {
    icon: FaChartBar,
    title: "Suivi & analyse",
    description: "Historique complet de vos sessions avec graphiques et indicateurs de performance. Identifiez vos progressions, vos plateaux et vos points d’amélioration pour adapter votre entraînement semaine après semaine.",
  }
];

export function Home() {
  return (
    <main className="min-h-screen bg-black w-screen overflow-x-hidden">
      <section className="relative text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-32 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6">
            Révolutionner Votre Entrainement
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-xl text-white/80 leading-relaxed mb-10">
            Le capteur BarTrack transforme chaque barre de musculation en un outil d'analyse de performance de pointe. Suivez votre vitesse, analysez votre amplitude et explosez vos records.
          </p>

          <div className="flex justify-center">
            <a
              className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 text-white font-semibold shadow-lg hover:from-cyan-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black"
            >
              Télécharger l’application
            </a>
          </div>
        </div>
      </section>

      <section className="bg-black py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 opacity-20 blur-2xl"></div>
              <img src={capteur} alt="Capteur BarTrack" className="relative rounded-2xl shadow-2xl w-full" />
            </div>
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Une technologie de pointe</h2>
              <p className="text-lg text-white/70 mb-8">
                Le capteur BarTrack est un concentré de technologie conçu pour les athlètes exigeants. Chaque détail a été pensé pour vous offrir une expérience d’entraînement inégalée.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                    <FaBullseye className="text-cyan-400 text-2xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Capteur 3 axes</h4>
                    <p className="text-white/60">Analyse complète et précise du mouvement.</p>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                    <FaClock className="text-cyan-400 text-2xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">40h d'autonomie</h4>
                    <p className="text-white/60">Des semaines d'entraînement sans recharge.</p>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                    <FaChartBar className="text-cyan-400 text-2xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Fixation universelle</h4>
                    <p className="text-white/60">S'adapte à toutes les barres et équipements.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-gray-950 text-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Fonctionnalités Clés</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">Des mesures précises pour optimiser chaque entraînement et atteindre vos objectifs plus rapidement.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featuresCards.map((feature, index) => (
              <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
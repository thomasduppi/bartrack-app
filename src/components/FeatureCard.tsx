import type { IconType } from "react-icons"

interface FeatureCardProps {
  icon: IconType
  title: string
  description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative rounded-3xl bg-black border border-[#5ce1e6]/30 p-8 transition-all duration-300 shadow-xl">
      <div className="relative">
        <div className="w-14 h-14 bg-[#5ce1e6]/20 rounded-2xl flex items-center justify-center mb-6 transition-colors">
          <Icon className="text-2xl text-[#5ce1e6]" />
        </div>

        <h3 className="text-2xl font-bold text-white mb-4">
          {title}
        </h3>

        <p className="text-[#5ce1e6] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

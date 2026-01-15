import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FaqItem } from '@/config/faq'

interface FaqSectionProps {
  faqs: FaqItem[]
}

export function FaqSection({ faqs }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (faqs.length === 0) return null

  return (
    <section className="mx-auto mt-20 max-w-3xl">
      <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-lg font-medium text-slate-900">
                {faq.question}
              </span>
              <ChevronDown
                className={cn(
                  'ml-4 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-200',
                  openIndex === index && 'rotate-180'
                )}
              />
            </button>
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-200',
                openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              )}
            >
              <div className="overflow-hidden">
                <p className="mt-4 leading-relaxed text-slate-600">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

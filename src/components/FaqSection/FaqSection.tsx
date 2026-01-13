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
    <section className="mt-12">
      <h2 className="mb-6 text-xl font-semibold text-zinc-900">
        Frequently Asked Questions
      </h2>
      <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
        {faqs.map((faq, index) => (
          <div key={index}>
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-zinc-50"
            >
              <span className="font-medium text-zinc-900">{faq.question}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 flex-shrink-0 text-zinc-500 transition-transform',
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
                <p className="px-6 pb-4 text-zinc-600">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

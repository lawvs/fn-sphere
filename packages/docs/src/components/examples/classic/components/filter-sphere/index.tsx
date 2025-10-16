import { type FilterGroup, type FilterSphereInput, FilterSphereProvider, useFilterSphere } from '@fn-sphere/filter'
import { useCallback, useMemo, useState } from 'react'
import { z } from 'zod'

import FilterButton from './filter-button'
import { useGetLocaleText } from './locale'
import { themeSpec } from './theme'
import { basicFilterFunction, createDefaultFilterRule, filterRuleTransform } from './utilities'

interface FilterBuilderProperties<Data> {
  className?: string
  schema: z.ZodType<Data>
  defaultParameter?: Partial<Data>
  onFilterChange?: (rule: Partial<Data>) => void
}

/**
 * FilterBuilder is a component that provides a UI for building filter rules.
 *
 * @example
 * ```tsx
 * import FilterBuilder from '@/components/filter-sphere'
 *
 * const yourSchema = z.object({
 *   ticket: z.string(),
 *   orderType: z.union([z.literal(0).describe('buy'), z.literal(1).describe('sell')]),
 *   status: z.union([
 *     z.literal('PENDING'),
 *     z.literal('COMPLETED'),
 *     z.literal('CANCELLED'),
 *   ]),
 * })
 *
 * <FilterBuilder className="mb-6" schema={yourSchema} onFilterChange={handleFilterChange} />
 * ```
 */
export default function FilterBuilder<Data>(properties: Readonly<FilterBuilderProperties<Data>>) {
  const { className, schema, defaultParameter, onFilterChange } = properties
  const getLocaleText = useGetLocaleText(schema)

  const [badge, setBadge] = useState(() => (defaultParameter ? Object.keys(defaultParameter).length : 0))
  const sphereConfig = useMemo(
    () =>
      ({
        schema,
        defaultRule: createDefaultFilterRule(schema, defaultParameter),
        filterFnList: [basicFilterFunction],
        getLocaleText,
      }) satisfies FilterSphereInput<Data>,
    [defaultParameter, getLocaleText, schema],
  )

  const { context } = useFilterSphere(sphereConfig)

  const handleApply = useCallback(
    (filterRule: FilterGroup) => {
      const transformedData: Partial<Data> = filterRuleTransform(filterRule)
      onFilterChange?.(transformedData)
      setBadge(Object.keys(transformedData).length)
    },
    [onFilterChange],
  )

  return (
    <FilterSphereProvider context={context} theme={themeSpec}>
      <FilterButton badge={badge} className={className} onApply={handleApply} />
    </FilterSphereProvider>
  )
}

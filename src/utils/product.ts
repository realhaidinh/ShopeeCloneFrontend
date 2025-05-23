import type { Variant } from 'src/types/product.type'

export function generateSKUs(variants: Variant[]) {
  // Helper function to create all combinations
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)), [''])
  }

  // Get array of options from variants
  const options = variants.map((variant) => variant.options)

  // Create all combinations
  const combinations = getCombinations(options)

  // Convert combinations to SKU objects
  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 100,
    image: ''
  }))
}

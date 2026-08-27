import { useQuery } from '@tanstack/react-query'
import { getAssetTreeApi, flattenAssetTree } from '@/api/services/assets'
import type { FlatAssetOption, AssetTree } from '@/types'

export function useAssets() {
  const query = useQuery<AssetTree, Error>({
    queryKey: ['assets-tree'],
    queryFn: getAssetTreeApi,
    staleTime: 5 * 60 * 1000, // 5 mins cache
  })

  const flatOptions: FlatAssetOption[] = query.data ? flattenAssetTree(query.data) : []

  // Default to a machine/line node if available (e.g. Line 1 / AOI) or the root
  const defaultAsset =
    flatOptions.find((opt) => opt.assetlevel_id === 20 || opt.assetlevel_id === 10) ||
    flatOptions[0] ||
    null

  return {
    ...query,
    tree: query.data || [],
    flatOptions,
    defaultAsset,
  }
}

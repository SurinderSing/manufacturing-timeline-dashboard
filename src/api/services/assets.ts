import { apiClient } from '@/api/client'
import type { ApiResponse, AssetTree, FlatAssetOption, AssetNode } from '@/types'

export async function getAssetTreeApi(): Promise<AssetTree> {
  const response = await apiClient.get<ApiResponse<AssetTree>>('/core/assets/tree')
  return response.data.data
}

/**
 * Level map for friendly display
 */
export function getLevelLabel(levelId: number): string {
  switch (levelId) {
    case 1:
      return 'Enterprise'
    case 2:
      return 'Plant'
    case 5:
      return 'Shop'
    case 10:
      return 'Line'
    case 20:
      return 'Machine'
    default:
      return `Level ${levelId}`
  }
}

/**
 * Helper to recursively flatten the asset tree into selectable options with clean breadcrumbs
 */
export function flattenAssetTree(tree: AssetTree): FlatAssetOption[] {
  const options: FlatAssetOption[] = []

  function traverse(nodes: AssetNode[], parentPath: string = '', depth: number = 0) {
    for (const node of nodes) {
      // Avoid duplicating name if codename is identical to name
      const hasDistinctCodename =
        node.codename &&
        node.codename.trim().toLowerCase() !== node.name.trim().toLowerCase()
      const cleanName = hasDistinctCodename
        ? `${node.name} (${node.codename})`
        : node.name

      const fullLabel = parentPath ? `${parentPath} > ${cleanName}` : cleanName

      options.push({
        id: node.id,
        name: node.name,
        codename: node.codename,
        assetlevel_id: node.assetlevel_id,
        levelLabel: getLevelLabel(node.assetlevel_id),
        displayName: fullLabel,
      })

      if (node.children && node.children.length > 0) {
        traverse(node.children, fullLabel, depth + 1)
      }
    }
  }

  traverse(tree)
  return options
}

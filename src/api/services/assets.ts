import { apiClient } from '@/api/client'
import type { ApiResponse, AssetTree, FlatAssetOption, AssetNode } from '@/types'

export async function getAssetTreeApi(): Promise<AssetTree> {
  const response = await apiClient.get<ApiResponse<AssetTree>>('/core/assets/tree')
  return response.data.data
}

/**
 * Helper to recursively flatten the asset tree into selectable options with breadcrumbs/labels
 */
export function flattenAssetTree(tree: AssetTree): FlatAssetOption[] {
  const options: FlatAssetOption[] = []

  function traverse(nodes: AssetNode[], parentPath: string = '') {
    for (const node of nodes) {
      const currentName = node.codename ? `${node.name} (${node.codename})` : node.name
      const fullLabel = parentPath ? `${parentPath} > ${currentName}` : currentName

      options.push({
        id: node.id,
        name: node.name,
        codename: node.codename,
        assetlevel_id: node.assetlevel_id,
        levelLabel: `Level ${node.assetlevel_id}`,
        displayName: fullLabel,
      })

      if (node.children && node.children.length > 0) {
        traverse(node.children, fullLabel)
      }
    }
  }

  traverse(tree)
  return options
}

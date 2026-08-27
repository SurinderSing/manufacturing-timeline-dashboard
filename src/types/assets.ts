export interface AssetNode {
  id: string
  name: string
  codename: string | null
  assetlevel_id: number
  hierarchy?: string | null
  children?: AssetNode[]
}

export type AssetTree = AssetNode[]

export interface FlatAssetOption {
  id: string
  name: string
  codename: string | null
  assetlevel_id: number
  levelLabel: string
  displayName: string
}

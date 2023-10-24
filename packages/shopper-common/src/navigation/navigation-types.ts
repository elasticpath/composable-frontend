export interface ISchema {
  name: string
  slug: string
  href: string
  id: string
  children: ISchema[]
}

export interface NavigationNode {
  name: string
  slug: string
  href: string
  id: string
  children: NavigationNode[]
}

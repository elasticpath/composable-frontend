// Workspace related rules and types
export {
  ProjectDefinition,
  TargetDefinition,
  WorkspaceDefinition,
  getWorkspace as readWorkspace,
  updateWorkspace,
  writeWorkspace,
} from "./workspace"
export { Builders as AngularBuilder } from "./workspace-models"

// Package dependency related rules and types
export {
  DependencyType,
  ExistingBehavior,
  InstallBehavior,
  addDependency,
} from "./dependency"

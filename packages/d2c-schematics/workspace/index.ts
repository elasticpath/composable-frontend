import {
  Rule,
  apply,
  applyTemplates,
  mergeWith,
  strings,
  url,
} from '@angular-devkit/schematics';
import { latestVersions } from '../utility/latest-versions';
import { Schema as WorkspaceOptions } from './schema';

export default function (options: WorkspaceOptions): Rule {
  return mergeWith(
    apply(url('./files'), [
      applyTemplates({
        utils: strings,
        ...options,
        'dot': '.',
        latestVersions,
      }),
    ]),
  );
}

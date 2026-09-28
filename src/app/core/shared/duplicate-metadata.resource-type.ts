import { ResourceType } from './resource-type';

/**
 * The resource type for DuplicateMetadata
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const DUPLICATE_METADATA = new ResourceType('duplicateMetadata');

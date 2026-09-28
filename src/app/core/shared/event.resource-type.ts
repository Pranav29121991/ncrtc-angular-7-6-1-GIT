import { ResourceType } from './resource-type';

/**
 * The resource type for Event
 *
 * Needs to be in a separate file to prevent circular
 * dependencies in webpack.
 */
export const EVENT = new ResourceType('event');

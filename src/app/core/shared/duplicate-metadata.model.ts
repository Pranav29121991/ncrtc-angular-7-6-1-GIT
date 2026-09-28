import { autoserialize, deserialize } from 'cerialize';
import { typedObject } from '../cache/builders/build-decorators';
import { excludeFromEquals } from '../utilities/equals.decorators';
import { ResourceType } from './resource-type';
import { DUPLICATE_METADATA } from './duplicate-metadata.resource-type';
import { HALLink } from './hal-link.model';
import { CacheableObject } from '../cache/cacheable-object.model';

/**
 * Model class for a DuplicateMetadata report entry
 * Returned by the items/search/findDuplicateMetadata endpoint
 */
@typedObject
export class DuplicateMetadata implements CacheableObject {
  static type = DUPLICATE_METADATA;

  /**
   * The object type
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType;

  /**
   * The metadata field checked for duplicates (e.g. dc.title)
   */
  @autoserialize
  metadata: string;

  /**
   * The metadata value that appears on multiple items
   */
  @autoserialize
  value: string;

  /**
   * The number of items sharing this metadata value
   */
  @autoserialize
  count: number;

  /**
   * The {@link HALLink}s for this DuplicateMetadata
   */
  @deserialize
  _links: {
    self: HALLink;
  };

}

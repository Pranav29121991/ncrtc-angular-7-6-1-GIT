import { inheritSerialization } from 'cerialize';
import { typedObject } from '../cache/builders/build-decorators';
import { EVENT } from './event.resource-type';
import { DmsEvent } from './dmsevent.model';

/**
 * Represents the objects returned by the `/api/event/events` endpoint
 * (rest type "event"), e.g. by the getEventByItemId search method.
 */
@typedObject
@inheritSerialization(DmsEvent)
export class DSpaceEvent extends DmsEvent {
    static type = EVENT;
}

import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FollowLinkConfig } from 'src/app/shared/utils/follow-link-config.model';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestParam } from '../cache/models/request-param.model';
import { ObjectCacheService } from '../cache/object-cache.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { DUPLICATE_METADATA } from '../shared/duplicate-metadata.resource-type';
import { DuplicateMetadata } from '../shared/duplicate-metadata.model';
import { dataService } from './base/data-service.decorator';
import { IdentifiableDataService } from './base/identifiable-data.service';
import { SearchData, SearchDataImpl } from './base/search-data';
import { FindListOptions } from './find-list-options.model';
import { PaginatedList } from './paginated-list.model';
import { RemoteData } from './remote-data';
import { RequestService } from './request.service';

/**
 * Data service for the duplicate metadata report
 * Calls api/core/items/search/findDuplicateMetadata
 */
@Injectable({
    providedIn: 'root'
})
@dataService(DUPLICATE_METADATA)
export class DuplicateMetadataDataService extends IdentifiableDataService<DuplicateMetadata> implements SearchData<DuplicateMetadata> {
    protected linkPath = 'items';
    protected findDuplicateMetadataMethod = 'findDuplicateMetadata';
    private searchData: SearchData<DuplicateMetadata>;

    constructor(
        protected requestService: RequestService,
        protected rdbService: RemoteDataBuildService,
        protected objectCache: ObjectCacheService,
        protected halService: HALEndpointService,
    ) {
        super('items', requestService, rdbService, objectCache, halService);
        this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
    }

    public searchBy(searchMethod: string, options?: FindListOptions, useCachedVersionIfAvailable?: boolean, reRequestOnStale?: boolean, ...linksToFollow: FollowLinkConfig<DuplicateMetadata>[]): Observable<RemoteData<PaginatedList<DuplicateMetadata>>> {
        return this.searchData.searchBy(searchMethod, options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
    }

    public findDuplicateMetadata(metadataField: string = 'dc.title', options: FindListOptions = {}, useCachedVersionIfAvailable = false, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<DuplicateMetadata>[]): Observable<RemoteData<PaginatedList<DuplicateMetadata>>> {
        options = Object.assign({}, options, {
            searchParams: [new RequestParam('metadata', metadataField)]
        });
        return this.searchBy(this.findDuplicateMetadataMethod, options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow).pipe(
            filter((results: RemoteData<PaginatedList<DuplicateMetadata>>) => !results.isResponsePending));
    }
}

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { RemoteData } from '../../../core/data/remote-data';
import { PaginatedList, buildPaginatedList } from '../../../core/data/paginated-list.model';
import { PaginationService } from '../../../core/pagination/pagination.service';
import { PageInfo } from '../../../core/shared/page-info.model';
import { DmsEvent } from '../../../core/shared/dmsevent.model';
import { Item } from '../../../core/shared/item.model';
import { DmseventSerive } from '../../../core/data/dmsevent.service';
import { PaginationComponentOptions } from '../../../shared/pagination/pagination-component-options.model';
import { hasValue } from '../../../shared/empty.util';

/**
 * This component renders a paginated table of events related to an item.
 * It is only shown to administrators on the item page.
 */
@Component({
  selector: 'ds-item-events',
  templateUrl: './item-events.component.html',
  styleUrls: ['./item-events.component.scss']
})
export class ItemEventsComponent implements OnInit, OnDestroy {

  /**
   * The item the events belong to
   */
  @Input() item: Item;

  /**
   * The paginated list of events
   */
  events$: BehaviorSubject<PaginatedList<DmsEvent>> = new BehaviorSubject(buildPaginatedList<DmsEvent>(new PageInfo(), []));

  /**
   * The current state of the pagination
   */
  pageInfoState$: BehaviorSubject<PageInfo> = new BehaviorSubject<PageInfo>(undefined);

  /**
   * The pagination options
   */
  config: PaginationComponentOptions;

  /**
   * The pagination id
   */
  pageId = 'itemEvents';

  loading = false;

  private currentPageSubscription: Subscription;

  constructor(
    protected dmseventSerive: DmseventSerive,
    protected paginationService: PaginationService
  ) {
    this.config = new PaginationComponentOptions();
    this.config.id = this.pageId;
    this.config.pageSize = 10;
    this.config.currentPage = 1;
  }

  ngOnInit(): void {
    this.currentPageSubscription = this.paginationService.getCurrentPagination(this.config.id, this.config).pipe(
      tap(() => this.loading = true),
      switchMap((currentPagination) => this.dmseventSerive.getEventsByItemId(this.item.id, {
        currentPage: currentPagination.currentPage,
        elementsPerPage: currentPagination.pageSize,
      }))
    ).subscribe((results: RemoteData<PaginatedList<DmsEvent>>) => {
      this.loading = false;
      if (results.hasSucceeded) {
        this.events$.next(results.payload);
        this.pageInfoState$.next(results.payload.pageInfo);
      }
    });
  }

  ngOnDestroy(): void {
    if (hasValue(this.currentPageSubscription)) {
      this.currentPageSubscription.unsubscribe();
    }
  }
}

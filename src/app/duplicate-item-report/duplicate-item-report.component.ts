import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { SortDirection, SortOptions } from '../core/cache/models/sort-options.model';
import { combineLatest as observableCombineLatest, Subscription, BehaviorSubject } from 'rxjs';
import { hasValue } from '../shared/empty.util';
import { filter, switchMap } from 'rxjs/operators';
import { PageInfo } from '../core/shared/page-info.model';
import { buildPaginatedList, PaginatedList } from '../core/data/paginated-list.model';
import { fadeIn, fadeInOut } from '../shared/animations/fade';
import { PaginationComponentOptions } from '../shared/pagination/pagination-component-options.model';
import { PaginationService } from '../core/pagination/pagination.service';
import { NotificationsService } from '../shared/notifications/notifications.service';
import { DuplicateMetadataDataService } from '../core/data/duplicate-metadata-data.service';
import { DuplicateMetadata } from '../core/shared/duplicate-metadata.model';
import { ItemDataService } from '../core/data/item-data.service';
import { Item } from '../core/shared/item.model';
import { getItemPageRoute } from '../item-page/item-page-routing-paths';

@Component({
  selector: 'ds-duplicate-item-report',
  templateUrl: './duplicate-item-report.component.html',
  styleUrls: ['./duplicate-item-report.component.scss'],
  animations: [
    fadeIn,
    fadeInOut
  ]
})
export class DuplicateItemReportComponent implements OnInit {
  items$: BehaviorSubject<PaginatedList<DuplicateMetadata>> = new BehaviorSubject(buildPaginatedList<DuplicateMetadata>(new PageInfo(), []));
  pageInfoState$: BehaviorSubject<PageInfo> = new BehaviorSubject<PageInfo>(undefined);
  config: PaginationComponentOptions;
  sortConfig: SortOptions;
  /**
   * The metadata field checked for duplicate values
   */
  metadataField = 'dc.title';
  /**
   * The pagination id
   */
  pageId = 'dir';
  currentPageSubscription: Subscription;
  loder = false;
  /**
   * The metadata value of the currently expanded row, null when all rows are collapsed
   */
  expandedValue: string | null = null;
  expandedItems: Item[] = [];
  expandedPageInfo: PageInfo;
  expandedLoading = false;
  expandedPageSize = 20;
  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() pageSizeChange: EventEmitter<number> = new EventEmitter<number>();

  constructor(
    private duplicateMetadataDataService: DuplicateMetadataDataService,
    private itemDataService: ItemDataService,
    private paginationService: PaginationService,
    private notificationsService: NotificationsService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.config = new PaginationComponentOptions();
    this.config.id = this.pageId;
    this.config.pageSize = 10;
    this.config.currentPage = 1;
    this.sortConfig = new SortOptions('value', SortDirection.ASC);
  }

  ngOnInit(): void {
    this.getresult();
  }

  getresult(): void {
    this.loder = true;
    if (hasValue(this.currentPageSubscription)) {
      this.currentPageSubscription.unsubscribe();
      this.paginationService.resetPage(this.config.id);
    }

    const pagination$ = this.paginationService.getCurrentPagination(this.config.id, this.config);
    const sort$ = this.paginationService.getCurrentSort(this.config.id, this.sortConfig);

    this.currentPageSubscription = observableCombineLatest([pagination$, sort$]).pipe(
      switchMap(([currentPagination, currentSort]) => {
        return this.duplicateMetadataDataService.findDuplicateMetadata(this.metadataField, {
          currentPage: currentPagination.currentPage,
          elementsPerPage: currentPagination.pageSize,
        });
      }),
      filter((results) => results.hasCompleted && !results.isStale),
    ).subscribe((results) => {
      this.loder = false;
      if (results.hasSucceeded) {
        this.expandedValue = null;
        this.expandedItems = [];
        this.expandedPageInfo = undefined;
        this.items$.next(results.payload);
        this.pageInfoState$.next(results.payload.pageInfo);
      } else {
        this.notificationsService.error('Failed to load the duplicate item report');
      }
      this.cdRef.detectChanges();
    });
  }

  /**
   * Expand a row to show the items sharing its metadata value,
   * or collapse it if it is already expanded
   */
  toggleExpand(duplicate: DuplicateMetadata): void {
    if (this.expandedValue === duplicate.value) {
      this.expandedValue = null;
      this.expandedItems = [];
      this.expandedPageInfo = undefined;
      return;
    }
    this.expandedValue = duplicate.value;
    this.expandedItems = [];
    this.expandedPageInfo = undefined;
    this.loadExpandedPage(duplicate.value, 1);
  }

  loadMoreItems(): void {
    if (hasValue(this.expandedPageInfo) && hasValue(this.expandedValue)) {
      this.loadExpandedPage(this.expandedValue, this.expandedPageInfo.currentPage + 1);
    }
  }

  private loadExpandedPage(value: string, page: number): void {
    this.expandedLoading = true;
    this.itemDataService.findDuplicateMetadataDetails(this.metadataField, value, {
      currentPage: page,
      elementsPerPage: this.expandedPageSize,
    }).pipe(
      filter((results) => results.hasCompleted && !results.isStale),
    ).subscribe((results) => {
      if (this.expandedValue !== value) {
        return;
      }
      this.expandedLoading = false;
      if (results.hasSucceeded) {
        this.expandedItems = this.expandedItems.concat(results.payload.page);
        this.expandedPageInfo = results.payload.pageInfo;
      } else {
        this.notificationsService.error('Failed to load the duplicate items');
      }
      this.cdRef.detectChanges();
    });
  }

  hasMoreExpandedItems(): boolean {
    return hasValue(this.expandedPageInfo) && this.expandedPageInfo.currentPage < this.expandedPageInfo.totalPages;
  }

  getItemLink(item: Item): string {
    return getItemPageRoute(item);
  }

  onPageChange(event) {
    this.loder = true;
    this.pageChange.emit(event);
  }

  onPageSizeChange(event) {
    this.pageSizeChange.emit(event);
  }

}

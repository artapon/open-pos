import {Component, OnInit, AfterViewInit} from '@angular/core';


import {
  TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn,
  TdLoadingService, LoadingType, LoadingMode
} from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import {Product, ItemsService} from "../../../services/items.service";
import {UsersService} from "../../../services/users.service";
import {Title} from "@angular/platform-browser";


@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})

export class ProductComponent implements AfterViewInit {

  selectedRows = [];

  data: Product[] = [

  ];

  columns: ITdDataTableColumn[] = [
    {name: 'id', label: 'id' },
    {name: 'name', label: 'name' },
    {name: 'brand.name', label: 'Brand' },
    {name: 'distributor.name', label: 'Distributor' },
    {name: 'mrp', label: 'Price (INR)', numeric: true, format: v=>v.toFixed(2) },
    {name: 'auto_discount', label: 'Auto Discount' , numeric: true, format: v=>v.toFixed(2)},
    {name: 'retail_shop.name', label: 'Retail Shop' },
    {name: 'available_stock', label: 'Available Stock', numeric: true},
    {name: 'min_stock', label: 'Min. Stock' , numeric: true},
  ];

  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;
  shops: number[];
  title: string;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 50;
  sortBy: string = 'id';
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  constructor(
              private _titleService: Title,
              private _loadingService: TdLoadingService,
              private _itemService: ItemsService,
              private _userService: UsersService) {
    this._loadingService.create({
      name: 'products',
      type: LoadingType.Circular,
      mode: LoadingMode.Indeterminate,
      color: 'warn',
    });
  }

  ngAfterViewInit(): void {
    this._titleService.setTitle('Product');
    this.title  = 'Products';
    if (this._userService.user) {
      this.shops = this._userService.user.retail_shops;
    }
    this._userService.user$.subscribe((data)=>{
      this.shops = data.retail_shops;
    });

  }

  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }

  search(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filter();
  }

  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }

  filter(): void {
    this._loadingService.register('products');
    let sortBy = this.sortBy;
    if (this.sortOrder.toString() == 'DESC'){
      sortBy = '-'.concat(sortBy);
    }
    this._itemService.query({__retail_shop_id__in: this.shops, __include: ['brand', 'distributor', 'retail_shop'],
      __limit: this.pageSize, __page: this.currentPage, __order_by: sortBy})
      .subscribe((resp: {data: Product[], total: number})=>{
      this.data = resp.data;
      this.filteredData = resp.data;
      this.filteredTotal = resp.total;
      this._loadingService.resolve('products');
    });
  }

  goBack():void {
    window.history.back();
  }
}

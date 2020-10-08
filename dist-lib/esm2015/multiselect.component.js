import * as tslib_1 from "tslib";
import { Component, HostListener, forwardRef, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ListItem } from "./multiselect.model";
import { ListFilterPipe } from "./list-filter.pipe";
export const DROPDOWN_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiSelectComponent),
    multi: true
};
const noop = () => { };
const ɵ0 = noop;
let MultiSelectComponent = class MultiSelectComponent {
    constructor(cdr, listFilterPipe) {
        this.cdr = cdr;
        this.listFilterPipe = listFilterPipe;
        this._data = [];
        this.selectedItems = [];
        this.isDropdownOpen = true;
        this._placeholder = "Select";
        this._sourceDataType = null; // to keep note of the source data type. could be array of string/number/object
        this._sourceDataFields = []; // store source data fields names
        this.filter = new ListItem(this.data);
        this.defaultSettings = {
            singleSelection: false,
            idField: "id",
            textField: "text",
            disabledField: "isDisabled",
            enableCheckAll: true,
            selectAllText: "Select All",
            unSelectAllText: "UnSelect All",
            allowSearchFilter: false,
            limitSelection: -1,
            clearSearchFilter: true,
            maxHeight: 197,
            itemsShowLimit: 999999999999,
            searchPlaceholderText: "Search",
            noDataAvailablePlaceholderText: "No data available",
            closeDropDownOnSelection: false,
            showSelectedItemsAtTop: false,
            defaultOpen: false,
            allowRemoteDataSearch: false,
            selectedLabel: "Selected",
            selectedAllLabel: "All UnSelected",
            unSelectedAllLabel: "All Selected",
            enableSelectedAllLabel: false,
            enableUnSelectedAllLabel: false
        };
        this.disabled = false;
        this.onFilterChange = new EventEmitter();
        this.onDropDownClose = new EventEmitter();
        this.onSelect = new EventEmitter();
        this.onDeSelect = new EventEmitter();
        this.onSelectAll = new EventEmitter();
        this.onDeSelectAll = new EventEmitter();
        this.onTouchedCallback = noop;
        this.onChangeCallback = noop;
    }
    set placeholder(value) {
        if (value) {
            this._placeholder = value;
        }
        else {
            this._placeholder = "Select";
        }
    }
    set settings(value) {
        if (value) {
            this._settings = Object.assign(this.defaultSettings, value);
        }
        else {
            this._settings = Object.assign(this.defaultSettings);
        }
    }
    set data(value) {
        if (!value) {
            this._data = [];
        }
        else {
            const firstItem = value[0];
            this._sourceDataType = typeof firstItem;
            this._sourceDataFields = this.getFields(firstItem);
            this._data = value.map((item) => typeof item === "string" || typeof item === "number"
                ? new ListItem(item)
                : new ListItem({
                    id: item[this._settings.idField],
                    text: item[this._settings.textField],
                    isDisabled: item[this._settings.disabledField]
                }));
        }
    }
    onFilterTextChange($event) {
        this.onFilterChange.emit($event);
    }
    onItemClick($event, item) {
        if (this.disabled || item.isDisabled) {
            return false;
        }
        const found = this.isSelected(item);
        const allowAdd = this._settings.limitSelection === -1 || (this._settings.limitSelection > 0 && this.selectedItems.length < this._settings.limitSelection);
        if (!found) {
            if (allowAdd) {
                this.addSelected(item);
            }
        }
        else {
            this.removeSelected(item);
        }
        if (this._settings.singleSelection && this._settings.closeDropDownOnSelection) {
            this.closeDropdown();
        }
    }
    writeValue(value) {
        if (value !== undefined && value !== null && value.length > 0) {
            if (this._settings.singleSelection) {
                try {
                    if (value.length >= 1) {
                        const firstItem = value[0];
                        this.selectedItems = [
                            typeof firstItem === "string" || typeof firstItem === "number"
                                ? new ListItem(firstItem)
                                : new ListItem({
                                    id: firstItem[this._settings.idField],
                                    text: firstItem[this._settings.textField],
                                    isDisabled: firstItem[this._settings.disabledField]
                                })
                        ];
                    }
                }
                catch (e) {
                    // console.error(e.body.msg);
                }
            }
            else {
                const _data = value.map((item) => typeof item === "string" || typeof item === "number"
                    ? new ListItem(item)
                    : new ListItem({
                        id: item[this._settings.idField],
                        text: item[this._settings.textField],
                        isDisabled: item[this._settings.disabledField]
                    }));
                if (this._settings.limitSelection > 0) {
                    this.selectedItems = _data.splice(0, this._settings.limitSelection);
                }
                else {
                    this.selectedItems = _data;
                }
            }
        }
        else {
            this.selectedItems = [];
        }
        this.onChangeCallback(value);
    }
    // From ControlValueAccessor interface
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    // From ControlValueAccessor interface
    registerOnTouched(fn) {
        this.onTouchedCallback = fn;
    }
    // Set touched on blur
    onTouched() {
        this.closeDropdown();
        this.onTouchedCallback();
    }
    trackByFn(index, item) {
        return item.id;
    }
    // isAllSelected(): boolean {
    //   return this.selectedItems.length === this._data.filter(i => !i[this._settings.disabledField]).length;
    // }
    // isAllUnselected(): boolean {
    //   return this.selectedItems.length === 0;
    // }
    isSelected(clickedItem) {
        let found = false;
        this.selectedItems.forEach(item => {
            if (clickedItem.id === item.id) {
                found = true;
            }
        });
        return found;
    }
    isLimitSelectionReached() {
        return this._settings.limitSelection === this.selectedItems.length;
    }
    isAllItemsSelected() {
        // get disabld item count
        let filteredItems = this.listFilterPipe.transform(this._data, this.filter);
        const itemDisabledCount = filteredItems.filter(item => item.isDisabled).length;
        // take disabled items into consideration when checking
        if ((!this.data || this.data.length === 0) && this._settings.allowRemoteDataSearch) {
            return false;
        }
        return filteredItems.length === this.selectedItems.length + itemDisabledCount;
    }
    showButton() {
        if (!this._settings.singleSelection) {
            if (this._settings.limitSelection > 0) {
                return false;
            }
            // this._settings.enableCheckAll = this._settings.limitSelection === -1 ? true : false;
            return true; // !this._settings.singleSelection && this._settings.enableCheckAll && this._data.length > 0;
        }
        else {
            // should be disabled in single selection mode
            return false;
        }
    }
    itemShowRemaining() {
        return this.selectedItems.length - this._settings.itemsShowLimit;
    }
    addSelected(item) {
        if (this._settings.singleSelection) {
            this.selectedItems = [];
            this.selectedItems.push(item);
        }
        else {
            this.selectedItems.push(item);
        }
        this.onChangeCallback(this.emittedValue(this.selectedItems));
        this.onSelect.emit(this.emittedValue(item));
    }
    removeSelected(itemSel) {
        this.selectedItems.forEach(item => {
            if (itemSel.id === item.id) {
                this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
            }
        });
        this.onChangeCallback(this.emittedValue(this.selectedItems));
        this.onDeSelect.emit(this.emittedValue(itemSel));
    }
    emittedValue(val) {
        const selected = [];
        if (Array.isArray(val)) {
            val.map(item => {
                selected.push(this.objectify(item));
            });
        }
        else {
            if (val) {
                return this.objectify(val);
            }
        }
        return selected;
    }
    objectify(val) {
        if (this._sourceDataType === 'object') {
            const obj = {};
            obj[this._settings.idField] = val.id;
            obj[this._settings.textField] = val.text;
            if (this._sourceDataFields.includes(this._settings.disabledField)) {
                obj[this._settings.disabledField] = val.isDisabled;
            }
            return obj;
        }
        if (this._sourceDataType === 'number') {
            return Number(val.id);
        }
        else {
            return val.text;
        }
    }
    toggleDropdown(evt) {
        evt.preventDefault();
        if (this.disabled && this._settings.singleSelection) {
            return;
        }
        this._settings.defaultOpen = !this._settings.defaultOpen;
        if (!this._settings.defaultOpen) {
            this.onDropDownClose.emit();
        }
    }
    closeDropdown() {
        this._settings.defaultOpen = false;
        // clear search text
        if (this._settings.clearSearchFilter) {
            this.filter.text = "";
        }
        this.onDropDownClose.emit();
    }
    toggleSelectAll() {
        if (this.disabled) {
            return false;
        }
        if (!this.isAllItemsSelected()) {
            // filter out disabled item first before slicing
            this.selectedItems = this.listFilterPipe.transform(this._data, this.filter).filter(item => !item.isDisabled).slice();
            this.onSelectAll.emit(this.emittedValue(this.selectedItems));
        }
        else {
            this.selectedItems = [];
            this.onDeSelectAll.emit(this.emittedValue(this.selectedItems));
        }
        this.onChangeCallback(this.emittedValue(this.selectedItems));
    }
    getFields(inputData) {
        const fields = [];
        if (typeof inputData !== "object") {
            return fields;
        }
        // tslint:disable-next-line:forin
        for (const prop in inputData) {
            fields.push(prop);
        }
        return fields;
    }
};
MultiSelectComponent.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: ListFilterPipe }
];
tslib_1.__decorate([
    Input()
], MultiSelectComponent.prototype, "placeholder", null);
tslib_1.__decorate([
    Input()
], MultiSelectComponent.prototype, "disabled", void 0);
tslib_1.__decorate([
    Input()
], MultiSelectComponent.prototype, "settings", null);
tslib_1.__decorate([
    Input()
], MultiSelectComponent.prototype, "data", null);
tslib_1.__decorate([
    Output("onFilterChange")
], MultiSelectComponent.prototype, "onFilterChange", void 0);
tslib_1.__decorate([
    Output("onDropDownClose")
], MultiSelectComponent.prototype, "onDropDownClose", void 0);
tslib_1.__decorate([
    Output("onSelect")
], MultiSelectComponent.prototype, "onSelect", void 0);
tslib_1.__decorate([
    Output("onDeSelect")
], MultiSelectComponent.prototype, "onDeSelect", void 0);
tslib_1.__decorate([
    Output("onSelectAll")
], MultiSelectComponent.prototype, "onSelectAll", void 0);
tslib_1.__decorate([
    Output("onDeSelectAll")
], MultiSelectComponent.prototype, "onDeSelectAll", void 0);
tslib_1.__decorate([
    HostListener("blur")
], MultiSelectComponent.prototype, "onTouched", null);
MultiSelectComponent = tslib_1.__decorate([
    Component({
        selector: "ng-multiselect-dropdown",
        template: "<div tabindex=\"=0\" (blur)=\"onTouched()\" class=\"multiselect-dropdown\" (clickOutside)=\"closeDropdown()\">\r\n  <div [class.disabled]=\"disabled\">\r\n    <span tabindex=\"-1\" class=\"dropdown-btn\" (click)=\"toggleDropdown($event)\">\r\n      <span *ngIf=\"selectedItems.length == 0\">{{_settings.enableUnSelectedAllLabel ? _settings.unSelectedAllLabel : _placeholder}}</span>\r\n      <span class=\"selected-item\" *ngIf=\"isAllItemsSelected() && _settings.enableSelectedAllLabel\">{{_settings.selectedAllLabel}}</span>\r\n      <span class=\"selected-item\" *ngIf=\"!isAllItemsSelected() && _settings.itemsShowLimit == 0 && selectedItems.length > 0\">{{itemShowRemaining()}} {{_settings.selectedLabel}}</span>\r\n      <span class=\"selected-item\" *ngFor=\"let item of selectedItems;trackBy: trackByFn;let k = index\" [hidden]=\"k > _settings.itemsShowLimit-1 || (isAllItemsSelected() && _settings.enableSelectedAllLabel)\">\r\n        {{item.text}}\r\n        <a style=\"padding-top:2px;padding-left:2px;color:white\" (click)=\"onItemClick($event,item)\">x</a>\r\n      </span>\r\n      <span style=\"float:right !important;padding-right:4px\">\r\n        <span style=\"padding-right: 6px;\" *ngIf=\"itemShowRemaining()>0 && !_settings.enableSelectedAllLabel\">+{{itemShowRemaining()}}</span>\r\n        <span [ngClass]=\"_settings.defaultOpen ? 'dropdown-up' : 'dropdown-down'\"></span>\r\n      </span>\r\n    </span>\r\n  </div>\r\n  <div class=\"dropdown-list\" [hidden]=\"!_settings.defaultOpen\">\r\n    <ul class=\"item1\">\r\n      <li (click)=\"toggleSelectAll()\" *ngIf=\"(_data.length > 0 || _settings.allowRemoteDataSearch) && !_settings.singleSelection && _settings.enableCheckAll && _settings.limitSelection===-1\" class=\"multiselect-item-checkbox\" style=\"border-bottom: 1px solid #ccc;padding:10px\">\r\n        <input type=\"checkbox\" aria-label=\"multiselect-select-all\" [checked]=\"isAllItemsSelected()\" [disabled]=\"disabled || isLimitSelectionReached()\" />\r\n        <div>{{!isAllItemsSelected() ? _settings.selectAllText : _settings.unSelectAllText}}</div>\r\n      </li>\r\n      <li class=\"filter-textbox\" *ngIf=\"(_data.length>0 || _settings.allowRemoteDataSearch) && _settings.allowSearchFilter\">\r\n        <input type=\"text\" aria-label=\"multiselect-search\" [readOnly]=\"disabled\" [placeholder]=\"_settings.searchPlaceholderText\" [(ngModel)]=\"filter.text\" (ngModelChange)=\"onFilterTextChange($event)\">\r\n      </li>\r\n    </ul>\r\n    <ul class=\"item2\" [style.maxHeight]=\"_settings.maxHeight+'px'\">\r\n      <li *ngFor=\"let item of _data | multiSelectFilter:filter; let i = index;\" (click)=\"onItemClick($event,item)\" class=\"multiselect-item-checkbox\">\r\n        <input type=\"checkbox\" aria-label=\"multiselect-item\" [checked]=\"isSelected(item)\" [disabled]=\"disabled || (isLimitSelectionReached() && !isSelected(item)) || item.isDisabled\" />\r\n        <div>{{item.text}}</div>\r\n      </li>\r\n      <li class='no-data' *ngIf=\"_data.length == 0 && !_settings.allowRemoteDataSearch\">\r\n        <h5>{{_settings.noDataAvailablePlaceholderText}}</h5>\r\n      </li>\r\n    </ul>\r\n  </div>\r\n</div>\r\n",
        providers: [DROPDOWN_CONTROL_VALUE_ACCESSOR],
        changeDetection: ChangeDetectionStrategy.OnPush,
        styles: [".multiselect-dropdown{position:relative;width:100%;font-size:inherit;font-family:inherit}.multiselect-dropdown .dropdown-btn{display:inline-block;border:1px solid #adadad;width:100%;padding:6px 12px;margin-bottom:0;font-weight:400;line-height:1.52857143;text-align:left;vertical-align:middle;cursor:pointer;background-image:none;border-radius:4px}.multiselect-dropdown .dropdown-btn .selected-item{border:1px solid #337ab7;margin-right:4px;background:#337ab7;padding:0 5px;color:#fff;border-radius:2px;float:left}.multiselect-dropdown .dropdown-btn .selected-item a{text-decoration:none}.multiselect-dropdown .dropdown-btn .selected-item:hover{box-shadow:1px 1px #959595}.multiselect-dropdown .dropdown-btn .dropdown-down{display:inline-block;top:10px;width:0;height:0;border-top:10px solid #adadad;border-left:10px solid transparent;border-right:10px solid transparent}.multiselect-dropdown .dropdown-btn .dropdown-up{display:inline-block;width:0;height:0;border-bottom:10px solid #adadad;border-left:10px solid transparent;border-right:10px solid transparent}.multiselect-dropdown .disabled>span{background-color:#eceeef}.dropdown-list{position:absolute;padding-top:6px;width:100%;z-index:9999;border:1px solid #ccc;border-radius:3px;background:#fff;margin-top:10px;box-shadow:0 1px 5px #959595}.dropdown-list ul{padding:0;list-style:none;overflow:auto;margin:0}.dropdown-list li{padding:6px 10px;cursor:pointer;text-align:left}.dropdown-list .filter-textbox{border-bottom:1px solid #ccc;position:relative;padding:10px}.dropdown-list .filter-textbox input{border:0;width:100%;padding:0 0 0 26px}.dropdown-list .filter-textbox input:focus{outline:0}.multiselect-item-checkbox input[type=checkbox]{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.multiselect-item-checkbox input[type=checkbox]:focus+div:before,.multiselect-item-checkbox input[type=checkbox]:hover+div:before{border-color:#337ab7;background-color:#f2f2f2}.multiselect-item-checkbox input[type=checkbox]:active+div:before{transition-duration:0s}.multiselect-item-checkbox input[type=checkbox]+div{position:relative;padding-left:2em;vertical-align:middle;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;margin:0;color:#000}.multiselect-item-checkbox input[type=checkbox]+div:before{box-sizing:content-box;content:\"\";color:#337ab7;position:absolute;top:50%;left:0;width:14px;height:14px;margin-top:-9px;border:2px solid #337ab7;text-align:center;transition:.4s}.multiselect-item-checkbox input[type=checkbox]+div:after{box-sizing:content-box;content:\"\";position:absolute;transform:scale(0);transform-origin:50%;transition:transform .2s ease-out;background-color:transparent;top:50%;left:4px;width:8px;height:3px;margin-top:-4px;border-style:solid;border-color:#fff;border-width:0 0 3px 3px;-o-border-image:none;border-image:none;transform:rotate(-45deg) scale(0)}.multiselect-item-checkbox input[type=checkbox]:disabled+div:before{border-color:#ccc}.multiselect-item-checkbox input[type=checkbox]:disabled:focus+div:before .multiselect-item-checkbox input[type=checkbox]:disabled:hover+div:before{background-color:inherit}.multiselect-item-checkbox input[type=checkbox]:disabled:checked+div:before{background-color:#ccc}.multiselect-item-checkbox input[type=checkbox]:checked+div:after{content:\"\";transition:transform .2s ease-out;transform:rotate(-45deg) scale(1)}.multiselect-item-checkbox input[type=checkbox]:checked+div:before{-webkit-animation:.2s ease-in borderscale;animation:.2s ease-in borderscale;background:#337ab7}@-webkit-keyframes borderscale{50%{box-shadow:0 0 0 2px #337ab7}}@keyframes borderscale{50%{box-shadow:0 0 0 2px #337ab7}}"]
    })
], MultiSelectComponent);
export { MultiSelectComponent };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlzZWxlY3QuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmctbXVsdGlzZWxlY3QtZHJvcGRvd24vIiwic291cmNlcyI6WyJtdWx0aXNlbGVjdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3SSxPQUFPLEVBQUUsaUJBQWlCLEVBQXdCLE1BQU0sZ0JBQWdCLENBQUM7QUFDekUsT0FBTyxFQUFFLFFBQVEsRUFBcUIsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFcEQsTUFBTSxDQUFDLE1BQU0sK0JBQStCLEdBQVE7SUFDbEQsT0FBTyxFQUFFLGlCQUFpQjtJQUMxQixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDO0lBQ25ELEtBQUssRUFBRSxJQUFJO0NBQ1osQ0FBQztBQUNGLE1BQU0sSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQzs7QUFTdEIsSUFBYSxvQkFBb0IsR0FBakMsTUFBYSxvQkFBb0I7SUFtRy9CLFlBQW9CLEdBQXNCLEVBQVMsY0FBNkI7UUFBNUQsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFBUyxtQkFBYyxHQUFkLGNBQWMsQ0FBZTtRQWpHekUsVUFBSyxHQUFvQixFQUFFLENBQUM7UUFDNUIsa0JBQWEsR0FBb0IsRUFBRSxDQUFDO1FBQ3BDLG1CQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzdCLGlCQUFZLEdBQUcsUUFBUSxDQUFDO1FBQ2hCLG9CQUFlLEdBQUcsSUFBSSxDQUFDLENBQUMsK0VBQStFO1FBQ3ZHLHNCQUFpQixHQUFrQixFQUFFLENBQUMsQ0FBQyxpQ0FBaUM7UUFD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QjtRQUNuQyx5bkdBQTRDO1FBRTVDLFNBQVMsRUFBRSxDQUFDLCtCQUErQixDQUFDO1FBQzVDLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNOztLQUNoRCxDQUFDO0dBQ1csb0JBQW9CLENBMFVoQztTQTFVWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEhvc3RMaXN0ZW5lciwgZm9yd2FyZFJlZiwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ2hhbmdlRGV0ZWN0b3JSZWYgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgeyBOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3IgfSBmcm9tIFwiQGFuZ3VsYXIvZm9ybXNcIjtcclxuaW1wb3J0IHsgTGlzdEl0ZW0sIElEcm9wZG93blNldHRpbmdzIH0gZnJvbSBcIi4vbXVsdGlzZWxlY3QubW9kZWxcIjtcclxuaW1wb3J0IHsgTGlzdEZpbHRlclBpcGUgfSBmcm9tIFwiLi9saXN0LWZpbHRlci5waXBlXCI7XHJcblxyXG5leHBvcnQgY29uc3QgRFJPUERPV05fQ09OVFJPTF9WQUxVRV9BQ0NFU1NPUjogYW55ID0ge1xyXG4gIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxyXG4gIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE11bHRpU2VsZWN0Q29tcG9uZW50KSxcclxuICBtdWx0aTogdHJ1ZVxyXG59O1xyXG5jb25zdCBub29wID0gKCkgPT4ge307XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogXCJuZy1tdWx0aXNlbGVjdC1kcm9wZG93blwiLFxyXG4gIHRlbXBsYXRlVXJsOiBcIi4vbXVsdGktc2VsZWN0LmNvbXBvbmVudC5odG1sXCIsXHJcbiAgc3R5bGVVcmxzOiBbXCIuL211bHRpLXNlbGVjdC5jb21wb25lbnQuc2Nzc1wiXSxcclxuICBwcm92aWRlcnM6IFtEUk9QRE9XTl9DT05UUk9MX1ZBTFVFX0FDQ0VTU09SXSxcclxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxyXG59KVxyXG5leHBvcnQgY2xhc3MgTXVsdGlTZWxlY3RDb21wb25lbnQgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciB7XHJcbiAgcHVibGljIF9zZXR0aW5nczogSURyb3Bkb3duU2V0dGluZ3M7XHJcbiAgcHVibGljIF9kYXRhOiBBcnJheTxMaXN0SXRlbT4gPSBbXTtcclxuICBwdWJsaWMgc2VsZWN0ZWRJdGVtczogQXJyYXk8TGlzdEl0ZW0+ID0gW107XHJcbiAgcHVibGljIGlzRHJvcGRvd25PcGVuID0gdHJ1ZTtcclxuICBfcGxhY2Vob2xkZXIgPSBcIlNlbGVjdFwiO1xyXG4gIHByaXZhdGUgX3NvdXJjZURhdGFUeXBlID0gbnVsbDsgLy8gdG8ga2VlcCBub3RlIG9mIHRoZSBzb3VyY2UgZGF0YSB0eXBlLiBjb3VsZCBiZSBhcnJheSBvZiBzdHJpbmcvbnVtYmVyL29iamVjdFxyXG4gIHByaXZhdGUgX3NvdXJjZURhdGFGaWVsZHM6IEFycmF5PFN0cmluZz4gPSBbXTsgLy8gc3RvcmUgc291cmNlIGRhdGEgZmllbGRzIG5hbWVzXHJcbiAgZmlsdGVyOiBMaXN0SXRlbSA9IG5ldyBMaXN0SXRlbSh0aGlzLmRhdGEpO1xyXG4gIGRlZmF1bHRTZXR0aW5nczogSURyb3Bkb3duU2V0dGluZ3MgPSB7XHJcbiAgICBzaW5nbGVTZWxlY3Rpb246IGZhbHNlLFxyXG4gICAgaWRGaWVsZDogXCJpZFwiLFxyXG4gICAgdGV4dEZpZWxkOiBcInRleHRcIixcclxuICAgIGRpc2FibGVkRmllbGQ6IFwiaXNEaXNhYmxlZFwiLFxyXG4gICAgZW5hYmxlQ2hlY2tBbGw6IHRydWUsXHJcbiAgICBzZWxlY3RBbGxUZXh0OiBcIlNlbGVjdCBBbGxcIixcclxuICAgIHVuU2VsZWN0QWxsVGV4dDogXCJVblNlbGVjdCBBbGxcIixcclxuICAgIGFsbG93U2VhcmNoRmlsdGVyOiBmYWxzZSxcclxuICAgIGxpbWl0U2VsZWN0aW9uOiAtMSxcclxuICAgIGNsZWFyU2VhcmNoRmlsdGVyOiB0cnVlLFxyXG4gICAgbWF4SGVpZ2h0OiAxOTcsXHJcbiAgICBpdGVtc1Nob3dMaW1pdDogOTk5OTk5OTk5OTk5LFxyXG4gICAgc2VhcmNoUGxhY2Vob2xkZXJUZXh0OiBcIlNlYXJjaFwiLFxyXG4gICAgbm9EYXRhQXZhaWxhYmxlUGxhY2Vob2xkZXJUZXh0OiBcIk5vIGRhdGEgYXZhaWxhYmxlXCIsXHJcbiAgICBjbG9zZURyb3BEb3duT25TZWxlY3Rpb246IGZhbHNlLFxyXG4gICAgc2hvd1NlbGVjdGVkSXRlbXNBdFRvcDogZmFsc2UsXHJcbiAgICBkZWZhdWx0T3BlbjogZmFsc2UsXHJcbiAgICBhbGxvd1JlbW90ZURhdGFTZWFyY2g6IGZhbHNlLFxyXG4gICAgc2VsZWN0ZWRMYWJlbDogXCJTZWxlY3RlZFwiLFxyXG4gICAgc2VsZWN0ZWRBbGxMYWJlbDogXCJBbGwgVW5TZWxlY3RlZFwiLFxyXG4gICAgdW5TZWxlY3RlZEFsbExhYmVsOiBcIkFsbCBTZWxlY3RlZFwiLFxyXG4gICAgZW5hYmxlU2VsZWN0ZWRBbGxMYWJlbDogZmFsc2UsXHJcbiAgICBlbmFibGVVblNlbGVjdGVkQWxsTGFiZWw6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgQElucHV0KClcclxuICBwdWJsaWMgc2V0IHBsYWNlaG9sZGVyKHZhbHVlOiBzdHJpbmcpIHtcclxuICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHZhbHVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fcGxhY2Vob2xkZXIgPSBcIlNlbGVjdFwiO1xyXG4gICAgfVxyXG4gIH1cclxuICBASW5wdXQoKVxyXG4gIGRpc2FibGVkID0gZmFsc2U7XHJcblxyXG4gIEBJbnB1dCgpXHJcbiAgcHVibGljIHNldCBzZXR0aW5ncyh2YWx1ZTogSURyb3Bkb3duU2V0dGluZ3MpIHtcclxuICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICB0aGlzLl9zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24odGhpcy5kZWZhdWx0U2V0dGluZ3MsIHZhbHVlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX3NldHRpbmdzID0gT2JqZWN0LmFzc2lnbih0aGlzLmRlZmF1bHRTZXR0aW5ncyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBASW5wdXQoKVxyXG4gIHB1YmxpYyBzZXQgZGF0YSh2YWx1ZTogQXJyYXk8YW55Pikge1xyXG4gICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICB0aGlzLl9kYXRhID0gW107XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBmaXJzdEl0ZW0gPSB2YWx1ZVswXTtcclxuICAgICAgdGhpcy5fc291cmNlRGF0YVR5cGUgPSB0eXBlb2YgZmlyc3RJdGVtO1xyXG4gICAgICB0aGlzLl9zb3VyY2VEYXRhRmllbGRzID0gdGhpcy5nZXRGaWVsZHMoZmlyc3RJdGVtKTtcclxuICAgICAgdGhpcy5fZGF0YSA9IHZhbHVlLm1hcCgoaXRlbTogYW55KSA9PlxyXG4gICAgICAgIHR5cGVvZiBpdGVtID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBpdGVtID09PSBcIm51bWJlclwiXHJcbiAgICAgICAgICA/IG5ldyBMaXN0SXRlbShpdGVtKVxyXG4gICAgICAgICAgOiBuZXcgTGlzdEl0ZW0oe1xyXG4gICAgICAgICAgICAgIGlkOiBpdGVtW3RoaXMuX3NldHRpbmdzLmlkRmllbGRdLFxyXG4gICAgICAgICAgICAgIHRleHQ6IGl0ZW1bdGhpcy5fc2V0dGluZ3MudGV4dEZpZWxkXSxcclxuICAgICAgICAgICAgICBpc0Rpc2FibGVkOiBpdGVtW3RoaXMuX3NldHRpbmdzLmRpc2FibGVkRmllbGRdXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBAT3V0cHV0KFwib25GaWx0ZXJDaGFuZ2VcIilcclxuICBvbkZpbHRlckNoYW5nZTogRXZlbnRFbWl0dGVyPExpc3RJdGVtPiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoXCJvbkRyb3BEb3duQ2xvc2VcIilcclxuICBvbkRyb3BEb3duQ2xvc2U6IEV2ZW50RW1pdHRlcjxMaXN0SXRlbT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuXHJcbiAgQE91dHB1dChcIm9uU2VsZWN0XCIpXHJcbiAgb25TZWxlY3Q6IEV2ZW50RW1pdHRlcjxMaXN0SXRlbT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuXHJcbiAgQE91dHB1dChcIm9uRGVTZWxlY3RcIilcclxuICBvbkRlU2VsZWN0OiBFdmVudEVtaXR0ZXI8TGlzdEl0ZW0+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcblxyXG4gIEBPdXRwdXQoXCJvblNlbGVjdEFsbFwiKVxyXG4gIG9uU2VsZWN0QWxsOiBFdmVudEVtaXR0ZXI8QXJyYXk8TGlzdEl0ZW0+PiA9IG5ldyBFdmVudEVtaXR0ZXI8QXJyYXk8YW55Pj4oKTtcclxuXHJcbiAgQE91dHB1dChcIm9uRGVTZWxlY3RBbGxcIilcclxuICBvbkRlU2VsZWN0QWxsOiBFdmVudEVtaXR0ZXI8QXJyYXk8TGlzdEl0ZW0+PiA9IG5ldyBFdmVudEVtaXR0ZXI8QXJyYXk8YW55Pj4oKTtcclxuXHJcbiAgcHJpdmF0ZSBvblRvdWNoZWRDYWxsYmFjazogKCkgPT4gdm9pZCA9IG5vb3A7XHJcbiAgcHJpdmF0ZSBvbkNoYW5nZUNhbGxiYWNrOiAoXzogYW55KSA9PiB2b2lkID0gbm9vcDtcclxuXHJcbiAgb25GaWx0ZXJUZXh0Q2hhbmdlKCRldmVudCkge1xyXG4gICAgdGhpcy5vbkZpbHRlckNoYW5nZS5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNkcjogQ2hhbmdlRGV0ZWN0b3JSZWYscHJpdmF0ZSBsaXN0RmlsdGVyUGlwZTpMaXN0RmlsdGVyUGlwZSkge31cclxuXHJcbiAgb25JdGVtQ2xpY2soJGV2ZW50OiBhbnksIGl0ZW06IExpc3RJdGVtKSB7XHJcbiAgICBpZiAodGhpcy5kaXNhYmxlZCB8fCBpdGVtLmlzRGlzYWJsZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZvdW5kID0gdGhpcy5pc1NlbGVjdGVkKGl0ZW0pO1xyXG4gICAgY29uc3QgYWxsb3dBZGQgPSB0aGlzLl9zZXR0aW5ncy5saW1pdFNlbGVjdGlvbiA9PT0gLTEgfHwgKHRoaXMuX3NldHRpbmdzLmxpbWl0U2VsZWN0aW9uID4gMCAmJiB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoIDwgdGhpcy5fc2V0dGluZ3MubGltaXRTZWxlY3Rpb24pO1xyXG4gICAgaWYgKCFmb3VuZCkge1xyXG4gICAgICBpZiAoYWxsb3dBZGQpIHtcclxuICAgICAgICB0aGlzLmFkZFNlbGVjdGVkKGl0ZW0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnJlbW92ZVNlbGVjdGVkKGl0ZW0pO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuX3NldHRpbmdzLnNpbmdsZVNlbGVjdGlvbiAmJiB0aGlzLl9zZXR0aW5ncy5jbG9zZURyb3BEb3duT25TZWxlY3Rpb24pIHtcclxuICAgICAgdGhpcy5jbG9zZURyb3Bkb3duKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpIHtcclxuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgaWYgKHRoaXMuX3NldHRpbmdzLnNpbmdsZVNlbGVjdGlvbikge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID49IDEpIHtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3RJdGVtID0gdmFsdWVbMF07XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IFtcclxuICAgICAgICAgICAgICB0eXBlb2YgZmlyc3RJdGVtID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBmaXJzdEl0ZW0gPT09IFwibnVtYmVyXCJcclxuICAgICAgICAgICAgICAgID8gbmV3IExpc3RJdGVtKGZpcnN0SXRlbSlcclxuICAgICAgICAgICAgICAgIDogbmV3IExpc3RJdGVtKHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogZmlyc3RJdGVtW3RoaXMuX3NldHRpbmdzLmlkRmllbGRdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGZpcnN0SXRlbVt0aGlzLl9zZXR0aW5ncy50ZXh0RmllbGRdLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzRGlzYWJsZWQ6IGZpcnN0SXRlbVt0aGlzLl9zZXR0aW5ncy5kaXNhYmxlZEZpZWxkXVxyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIC8vIGNvbnNvbGUuZXJyb3IoZS5ib2R5Lm1zZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IF9kYXRhID0gdmFsdWUubWFwKChpdGVtOiBhbnkpID0+XHJcbiAgICAgICAgICB0eXBlb2YgaXRlbSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgaXRlbSA9PT0gXCJudW1iZXJcIlxyXG4gICAgICAgICAgICA/IG5ldyBMaXN0SXRlbShpdGVtKVxyXG4gICAgICAgICAgICA6IG5ldyBMaXN0SXRlbSh7XHJcbiAgICAgICAgICAgICAgICBpZDogaXRlbVt0aGlzLl9zZXR0aW5ncy5pZEZpZWxkXSxcclxuICAgICAgICAgICAgICAgIHRleHQ6IGl0ZW1bdGhpcy5fc2V0dGluZ3MudGV4dEZpZWxkXSxcclxuICAgICAgICAgICAgICAgIGlzRGlzYWJsZWQ6IGl0ZW1bdGhpcy5fc2V0dGluZ3MuZGlzYWJsZWRGaWVsZF1cclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NldHRpbmdzLmxpbWl0U2VsZWN0aW9uID4gMCkge1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gX2RhdGEuc3BsaWNlKDAsIHRoaXMuX3NldHRpbmdzLmxpbWl0U2VsZWN0aW9uKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gX2RhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSBbXTtcclxuICAgIH1cclxuICAgIHRoaXMub25DaGFuZ2VDYWxsYmFjayh2YWx1ZSk7XHJcbiAgfVxyXG5cclxuICAvLyBGcm9tIENvbnRyb2xWYWx1ZUFjY2Vzc29yIGludGVyZmFjZVxyXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IGFueSkge1xyXG4gICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrID0gZm47XHJcbiAgfVxyXG5cclxuICAvLyBGcm9tIENvbnRyb2xWYWx1ZUFjY2Vzc29yIGludGVyZmFjZVxyXG4gIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBhbnkpIHtcclxuICAgIHRoaXMub25Ub3VjaGVkQ2FsbGJhY2sgPSBmbjtcclxuICB9XHJcblxyXG4gIC8vIFNldCB0b3VjaGVkIG9uIGJsdXJcclxuICBASG9zdExpc3RlbmVyKFwiYmx1clwiKVxyXG4gIHB1YmxpYyBvblRvdWNoZWQoKSB7XHJcbiAgICB0aGlzLmNsb3NlRHJvcGRvd24oKTtcclxuICAgIHRoaXMub25Ub3VjaGVkQ2FsbGJhY2soKTtcclxuICB9XHJcblxyXG4gIHRyYWNrQnlGbihpbmRleCwgaXRlbSkge1xyXG4gICAgcmV0dXJuIGl0ZW0uaWQ7XHJcbiAgfVxyXG5cclxuICAvLyBpc0FsbFNlbGVjdGVkKCk6IGJvb2xlYW4ge1xyXG4gIC8vICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRJdGVtcy5sZW5ndGggPT09IHRoaXMuX2RhdGEuZmlsdGVyKGkgPT4gIWlbdGhpcy5fc2V0dGluZ3MuZGlzYWJsZWRGaWVsZF0pLmxlbmd0aDtcclxuICAvLyB9XHJcblxyXG4gIC8vIGlzQWxsVW5zZWxlY3RlZCgpOiBib29sZWFuIHtcclxuICAvLyAgIHJldHVybiB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoID09PSAwO1xyXG4gIC8vIH1cclxuXHJcbiAgaXNTZWxlY3RlZChjbGlja2VkSXRlbTogTGlzdEl0ZW0pIHtcclxuICAgIGxldCBmb3VuZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zZWxlY3RlZEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgIGlmIChjbGlja2VkSXRlbS5pZCA9PT0gaXRlbS5pZCkge1xyXG4gICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gZm91bmQ7XHJcbiAgfVxyXG5cclxuICBpc0xpbWl0U2VsZWN0aW9uUmVhY2hlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9zZXR0aW5ncy5saW1pdFNlbGVjdGlvbiA9PT0gdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIGlzQWxsSXRlbXNTZWxlY3RlZCgpOiBib29sZWFuIHtcclxuICAgIC8vIGdldCBkaXNhYmxkIGl0ZW0gY291bnRcclxuICAgIGxldCBmaWx0ZXJlZEl0ZW1zID0gdGhpcy5saXN0RmlsdGVyUGlwZS50cmFuc2Zvcm0odGhpcy5fZGF0YSx0aGlzLmZpbHRlcik7XHJcbiAgICBjb25zdCBpdGVtRGlzYWJsZWRDb3VudCA9IGZpbHRlcmVkSXRlbXMuZmlsdGVyKGl0ZW0gPT4gaXRlbS5pc0Rpc2FibGVkKS5sZW5ndGg7XHJcbiAgICAvLyB0YWtlIGRpc2FibGVkIGl0ZW1zIGludG8gY29uc2lkZXJhdGlvbiB3aGVuIGNoZWNraW5nXHJcbiAgICBpZiAoKCF0aGlzLmRhdGEgfHwgdGhpcy5kYXRhLmxlbmd0aCA9PT0gMCkgJiYgdGhpcy5fc2V0dGluZ3MuYWxsb3dSZW1vdGVEYXRhU2VhcmNoKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmaWx0ZXJlZEl0ZW1zLmxlbmd0aCA9PT0gdGhpcy5zZWxlY3RlZEl0ZW1zLmxlbmd0aCArIGl0ZW1EaXNhYmxlZENvdW50O1xyXG4gIH1cclxuXHJcbiAgc2hvd0J1dHRvbigpOiBib29sZWFuIHtcclxuICAgIGlmICghdGhpcy5fc2V0dGluZ3Muc2luZ2xlU2VsZWN0aW9uKSB7XHJcbiAgICAgIGlmICh0aGlzLl9zZXR0aW5ncy5saW1pdFNlbGVjdGlvbiA+IDApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgLy8gdGhpcy5fc2V0dGluZ3MuZW5hYmxlQ2hlY2tBbGwgPSB0aGlzLl9zZXR0aW5ncy5saW1pdFNlbGVjdGlvbiA9PT0gLTEgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgIHJldHVybiB0cnVlOyAvLyAhdGhpcy5fc2V0dGluZ3Muc2luZ2xlU2VsZWN0aW9uICYmIHRoaXMuX3NldHRpbmdzLmVuYWJsZUNoZWNrQWxsICYmIHRoaXMuX2RhdGEubGVuZ3RoID4gMDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIHNob3VsZCBiZSBkaXNhYmxlZCBpbiBzaW5nbGUgc2VsZWN0aW9uIG1vZGVcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaXRlbVNob3dSZW1haW5pbmcoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLnNlbGVjdGVkSXRlbXMubGVuZ3RoIC0gdGhpcy5fc2V0dGluZ3MuaXRlbXNTaG93TGltaXQ7XHJcbiAgfVxyXG5cclxuICBhZGRTZWxlY3RlZChpdGVtOiBMaXN0SXRlbSkge1xyXG4gICAgaWYgKHRoaXMuX3NldHRpbmdzLnNpbmdsZVNlbGVjdGlvbikge1xyXG4gICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSBbXTtcclxuICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnNlbGVjdGVkSXRlbXMucHVzaChpdGVtKTtcclxuICAgIH1cclxuICAgIHRoaXMub25DaGFuZ2VDYWxsYmFjayh0aGlzLmVtaXR0ZWRWYWx1ZSh0aGlzLnNlbGVjdGVkSXRlbXMpKTtcclxuICAgIHRoaXMub25TZWxlY3QuZW1pdCh0aGlzLmVtaXR0ZWRWYWx1ZShpdGVtKSk7XHJcbiAgfVxyXG5cclxuICByZW1vdmVTZWxlY3RlZChpdGVtU2VsOiBMaXN0SXRlbSkge1xyXG4gICAgdGhpcy5zZWxlY3RlZEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgIGlmIChpdGVtU2VsLmlkID09PSBpdGVtLmlkKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zLnNwbGljZSh0aGlzLnNlbGVjdGVkSXRlbXMuaW5kZXhPZihpdGVtKSwgMSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrKHRoaXMuZW1pdHRlZFZhbHVlKHRoaXMuc2VsZWN0ZWRJdGVtcykpO1xyXG4gICAgdGhpcy5vbkRlU2VsZWN0LmVtaXQodGhpcy5lbWl0dGVkVmFsdWUoaXRlbVNlbCkpO1xyXG4gIH1cclxuXHJcbiAgZW1pdHRlZFZhbHVlKHZhbDogYW55KTogYW55IHtcclxuICAgIGNvbnN0IHNlbGVjdGVkID0gW107XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XHJcbiAgICAgIHZhbC5tYXAoaXRlbSA9PiB7XHJcbiAgICAgICAgc2VsZWN0ZWQucHVzaCh0aGlzLm9iamVjdGlmeShpdGVtKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHZhbCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9iamVjdGlmeSh2YWwpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc2VsZWN0ZWQ7XHJcbiAgfVxyXG5cclxuICBvYmplY3RpZnkodmFsOiBMaXN0SXRlbSkge1xyXG4gICAgaWYgKHRoaXMuX3NvdXJjZURhdGFUeXBlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICBjb25zdCBvYmogPSB7fTtcclxuICAgICAgb2JqW3RoaXMuX3NldHRpbmdzLmlkRmllbGRdID0gdmFsLmlkO1xyXG4gICAgICBvYmpbdGhpcy5fc2V0dGluZ3MudGV4dEZpZWxkXSA9IHZhbC50ZXh0O1xyXG4gICAgICBpZiAodGhpcy5fc291cmNlRGF0YUZpZWxkcy5pbmNsdWRlcyh0aGlzLl9zZXR0aW5ncy5kaXNhYmxlZEZpZWxkKSkge1xyXG4gICAgICAgIG9ialt0aGlzLl9zZXR0aW5ncy5kaXNhYmxlZEZpZWxkXSA9IHZhbC5pc0Rpc2FibGVkO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5fc291cmNlRGF0YVR5cGUgPT09ICdudW1iZXInKSB7XHJcbiAgICAgIHJldHVybiBOdW1iZXIodmFsLmlkKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB2YWwudGV4dDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHRvZ2dsZURyb3Bkb3duKGV2dCkge1xyXG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAodGhpcy5kaXNhYmxlZCAmJiB0aGlzLl9zZXR0aW5ncy5zaW5nbGVTZWxlY3Rpb24pIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fc2V0dGluZ3MuZGVmYXVsdE9wZW4gPSAhdGhpcy5fc2V0dGluZ3MuZGVmYXVsdE9wZW47XHJcbiAgICBpZiAoIXRoaXMuX3NldHRpbmdzLmRlZmF1bHRPcGVuKSB7XHJcbiAgICAgIHRoaXMub25Ecm9wRG93bkNsb3NlLmVtaXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNsb3NlRHJvcGRvd24oKSB7XHJcbiAgICB0aGlzLl9zZXR0aW5ncy5kZWZhdWx0T3BlbiA9IGZhbHNlO1xyXG4gICAgLy8gY2xlYXIgc2VhcmNoIHRleHRcclxuICAgIGlmICh0aGlzLl9zZXR0aW5ncy5jbGVhclNlYXJjaEZpbHRlcikge1xyXG4gICAgICB0aGlzLmZpbHRlci50ZXh0ID0gXCJcIjtcclxuICAgIH1cclxuICAgIHRoaXMub25Ecm9wRG93bkNsb3NlLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIHRvZ2dsZVNlbGVjdEFsbCgpIHtcclxuICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmICghdGhpcy5pc0FsbEl0ZW1zU2VsZWN0ZWQoKSkge1xyXG4gICAgICAvLyBmaWx0ZXIgb3V0IGRpc2FibGVkIGl0ZW0gZmlyc3QgYmVmb3JlIHNsaWNpbmdcclxuICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gdGhpcy5saXN0RmlsdGVyUGlwZS50cmFuc2Zvcm0odGhpcy5fZGF0YSx0aGlzLmZpbHRlcikuZmlsdGVyKGl0ZW0gPT4gIWl0ZW0uaXNEaXNhYmxlZCkuc2xpY2UoKTtcclxuICAgICAgdGhpcy5vblNlbGVjdEFsbC5lbWl0KHRoaXMuZW1pdHRlZFZhbHVlKHRoaXMuc2VsZWN0ZWRJdGVtcykpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gW107XHJcbiAgICAgIHRoaXMub25EZVNlbGVjdEFsbC5lbWl0KHRoaXMuZW1pdHRlZFZhbHVlKHRoaXMuc2VsZWN0ZWRJdGVtcykpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5vbkNoYW5nZUNhbGxiYWNrKHRoaXMuZW1pdHRlZFZhbHVlKHRoaXMuc2VsZWN0ZWRJdGVtcykpO1xyXG4gIH1cclxuXHJcbiAgZ2V0RmllbGRzKGlucHV0RGF0YSkge1xyXG4gICAgY29uc3QgZmllbGRzID0gW107XHJcbiAgICBpZiAodHlwZW9mIGlucHV0RGF0YSAhPT0gXCJvYmplY3RcIikge1xyXG4gICAgICByZXR1cm4gZmllbGRzO1xyXG4gICAgfVxyXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmZvcmluXHJcbiAgICBmb3IgKGNvbnN0IHByb3AgaW4gaW5wdXREYXRhKSB7XHJcbiAgICAgIGZpZWxkcy5wdXNoKHByb3ApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZpZWxkcztcclxuICB9XHJcbn1cclxuIl19
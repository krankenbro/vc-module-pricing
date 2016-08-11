﻿angular.module('virtoCommerce.pricingModule')
.controller('virtoCommerce.pricingModule.pricelistListController', ['$scope', 'virtoCommerce.pricingModule.pricelists', 'platformWebApp.dialogService', 'platformWebApp.uiGridHelper', 'platformWebApp.bladeUtils',
function ($scope, pricelists, dialogService, uiGridHelper, bladeUtils) {
    var blade = $scope.blade;
    var bladeNavigationService = bladeUtils.bladeNavigationService;

    blade.refresh = function () {
        blade.isLoading = true;

        pricelists.query({
            sort: uiGridHelper.getSortExpression($scope),
            skip: ($scope.pageSettings.currentPage - 1) * $scope.pageSettings.itemsPerPageCount,
            take: $scope.pageSettings.itemsPerPageCount
        }, function (data) {
            blade.isLoading = false;
            blade.currentEntities = data;
        }, function (error) {
            bladeNavigationService.setError('Error ' + error.status, blade);
        });
    };

    $scope.selectNode = function (node, isNew) {
        $scope.selectedNodeId = node.id;

        var newBlade = {
            id: 'listItemChild',
            controller: 'virtoCommerce.pricingModule.pricelistDetailController',
            template: 'Modules/$(VirtoCommerce.Pricing)/Scripts/blades/pricelist-detail.tpl.html'
        };

        if (isNew) {
            angular.extend(newBlade, {
                title: 'pricing.blades.pricelist-detail.title-new',
                isNew: true
                // onChangesConfirmedFn: callback,
            });
        } else {
            angular.extend(newBlade, {
                currentEntityId: node.id,
                title: node.name,
                subtitle: blade.subtitle
            });
        }

        bladeNavigationService.showBlade(newBlade, blade);
    };

    function isItemsChecked() {
        return $scope.gridApi && _.any($scope.gridApi.selection.getSelectedRows());
    }

    $scope.deleteList = function (list) {
        var dialog = {
            id: "confirmDeleteItem",
            title: "pricing.dialogs.pricelists-delete.title",
            message: "pricing.dialogs.pricelists-delete.message",
            callback: function (remove) {
                if (remove) {
                    bladeNavigationService.closeChildrenBlades(blade, function () {
                        pricelists.remove({ ids: _.pluck(list, 'id') },
                            blade.refresh,
                            function (error) { bladeNavigationService.setError('Error ' + error.status, blade); });
                    });
                }
            }
        }
        dialogService.showConfirmationDialog(dialog);
    }

    blade.headIcon = 'fa-usd';
    blade.subtitle = 'pricing.blades.pricelist-list.subtitle';

    blade.toolbarCommands = [
    {
        name: "platform.commands.refresh", icon: 'fa fa-refresh',
        executeMethod: blade.refresh,
        canExecuteMethod: function () { return true; }
    },
    {
        name: "platform.commands.add", icon: 'fa fa-plus',
        executeMethod: function () {
            $scope.selectNode({}, true);
        },
        canExecuteMethod: function () {
            return true;
        },
        permission: 'pricing:create'
    },
        //{
                    //    name: "Clone", icon: 'fa fa-files-o',
    //    executeMethod: function () {
    //    },
    //    canExecuteMethod: function () {
    //        return false;
    //    },
    //    permission: 'pricing:update'
    //},
    {
        name: "platform.commands.delete", icon: 'fa fa-trash-o',
        executeMethod: function () {
            $scope.deleteList($scope.gridApi.selection.getSelectedRows());
        },
        canExecuteMethod: isItemsChecked,
        permission: 'pricing:delete'
    }
    ];

    // ui-grid
    $scope.setGridOptions = function (gridOptions) {
        uiGridHelper.initialize($scope, gridOptions, function (gridApi) {
            uiGridHelper.bindRefreshOnSortChanged($scope);
        });

        bladeUtils.initializePagination($scope);
    };

    // actions on load
    //blade.refresh();
}]);
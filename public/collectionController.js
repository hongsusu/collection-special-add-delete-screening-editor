qingniwan.directive('onFinishRender', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                    /*  if(!!attr.onFinishRender){
                     $parse(attr.onFinishRender)(scope);
                     }*/
                });
            }
        }
    }
}]);
qingniwan.controller('collectionController', ['$scope', '$http', '$location', 'util', 'cityList', '$httpParamSerializerJQLike', function ($scope, $http, $location, util, cityList, $httpParamSerializerJQLike) {

    //针对手机端做的兼容
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/android/i) || ua.match(/iphone/i)) {
        $('.J_container_overflow').css('overflow', 'auto');

        //top nav
        $('.J_topnav-padding').css('padding-left', '0');

        //left nav
        $('.J_pc_nav').hide();
        $('#J_mobile_nav').show();
    }

    //全局变量
    $scope.cityList = cityList;
    $scope.collectionsData = {};
    $scope.filtercondition = {};
    $scope.collectionsData.dataList = [];
    $scope.filtercondition.pn = 1;
    $scope.filtercondition.cityID = "110000";
    $scope.pageNum = 20;
    $scope.pages;
    $scope.AssociatedActivitiesPageNum = 20;
    $scope.AssociatedActivitiesPages;
    $scope.searchKeywordText = "";
    var currentArrayForCheckedShow = [];
    $scope.API_getCollectionsData = "/interface?interface=collection&api=get&version=2.1";
    $scope.API_deleteCollectionsData = "/interface?interface=collection&api=delete&version=2.1";
    $scope.API_getAppActiveData = "/interface?interface=collection&api=getEventList&version=2.1";
    $scope.API_AssociatedActivitiesFinal = "interface?interface=collection&api=relevance&version=2.1";
    $scope.API_editorCollection = '/interface?interface=collection&api=update&version=2.1';
    $scope.API_HasBeenAssociated = '/interface?interface=collection&api=getEventListByTag&version=2.1';

    /**
     *获取首屏信息列表
     */
    $scope.initializeBaseData = function () {
        $scope.filtercondition = {};
        $scope.filtercondition.ps = $scope.pageNum;
        $scope.filtercondition.cityID = "110000";
        $scope.filtercondition.pn = 1;
        $http({
            url: $scope.API_getCollectionsData,
            method: 'post',
            data: $httpParamSerializerJQLike($scope.filtercondition),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function (res) {
            if (res.code == 200) {

                $scope.collectionsData.dataList = res.data.list;
                //当前条件下活动总数
                $scope.activetotals = res.data.count;
                //构建分页 参数为显示多少页码
                $scope.groupPage(5);
                debugger
            }
        })
            .error(function (err) {
                util.artDialogHint(err);

            });
    };

    /**
     *   根据条件筛选数据
     */
    $scope.filter = function (filterInterface, filterCondition, filterValue) {
        if (filterCondition == 'cityID') {
            $scope.filtercondition.cityID = filterValue;
            //   $scope.filtercondition.pn=1;
        } else if (filterCondition == 'page') {
            $scope.filtercondition.pn = filterValue;
        } else if (filterCondition == 'title') {
            $scope.filtercondition.title = filterValue;
            //$scope.filtercondition.pn=1;
        } else if (filterCondition == 'Refresh') {
        } else if (filterCondition == 'status') {
            $scope.filtercondition.status = filterValue;
        }
        $http({
            url: $scope.API_getCollectionsData,
            method: 'post',
            data: $httpParamSerializerJQLike($scope.filtercondition),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function (res) {
            if (res.code == 200) {
                $scope.collectionsData.dataList = res.data.list;
                //当前条件下活动总数
                $scope.activetotals = res.data.count;
                //构建分页 参数为显示多少页码
                $scope.groupPage(5);
            }
        })
            .error(function (err) {
                util.artDialogHint(err);

            });
    };

    /**
     * 分页
     * @param showPageNums 显示页码数量
     */
    $scope.groupPage = function (showPageNums) {

        //总页数
        $scope.pages = Math.ceil($scope.activetotals / $scope.pageNum);
        //当前页码改变时，
        $scope.pageHtml = '';
        //当前页码前面显示数量
        var curPageBeforeNums = (showPageNums / 2).toString().indexOf('.') > 0 ? Math.floor(showPageNums / 2) : showPageNums / 2;
        //当前页码后面显示数量
        var curPageAfterNums = (showPageNums / 2).toString().indexOf('.') > 0 ? Math.floor(showPageNums / 2) : (showPageNums / 2 - 1);
        //循环遍历页码 并且 特殊显示当前页码
        var groupPageHtml = function () {
            if (i == $scope.filtercondition.pn) {
                $scope.pageHtml += '<li><a class="active">' + i + '</a></li>';
            } else {
                $scope.pageHtml += '<li><a>' + i + '</a></li>';
            }
        };
        debugger;
        //当前页码等于第一页时
        if ($scope.filtercondition.page == 1) {
            $('#J_pagePre').hide();
        } else {
            $('#J_pagePre').show();
        }

        //当前页码等于最后一页时
        if ($scope.filtercondition.page == $scope.pages) {
            $('#J_pageNext').hide();
        } else {
            $('#J_pageNext').show();
        }

        var i;
        if ($scope.pages < showPageNums) { //总页数 < 设置的显示页码数量时
            debugger;
            for (i = 1; i <= $scope.pages; i++) {
                groupPageHtml();
            }

        } else if ($scope.filtercondition.page <= curPageBeforeNums) { //当前页码 < 当前页码前面显示数量时
            debugger;
            for (i = 1; i <= showPageNums; i++) {
                groupPageHtml();
            }

        } else if ($scope.filtercondition.page > curPageBeforeNums && (parseInt($scope.filtercondition.page) + curPageAfterNums) < $scope.pages) { //当前页码 > 当前页码后面显示数量 && 总页数 > （当前页码＋当前页码后面显示数量）
            debugger;
            for (i = ($scope.filtercondition.page - curPageBeforeNums); i <= (parseInt($scope.filtercondition.page) + curPageAfterNums); i++) {
                groupPageHtml();
            }

        } else if ($scope.filtercondition.page >= curPageBeforeNums && (parseInt($scope.filtercondition.page) + curPageAfterNums) >= $scope.pages) { //当当前页码 > 当前页码前面显示数量时 && 总页数 < （当前页码＋当前页码后面显示数量）
            debugger;
            for (i = ($scope.pages - (showPageNums - 1)); i <= $scope.pages; i++) {
                groupPageHtml();
            }

        }

        $('.J_main_page').html($scope.pageHtml);

        $('.J_main_page a').each(function () {
            $(this).click(function () {
                $scope.currentPage = parseInt($(this).html());
                $scope.filter($scope.API_getCollectionsData, 'page', $scope.currentPage);
                $scope.groupPage(5);
            })
        })

    };
    //上一页
    $('#J_pagePre').click(function () {
        $scope.prePage = $scope.filtercondition.pn - 1;
        $scope.filter($scope.API_getCollectionsData, 'page', $scope.prePage);
        $scope.groupPage(5);
        debugger
    });
    //下一页
    $('#J_pageNext').click(function () {
        $scope.nextPage = $scope.filtercondition.pn + 1;
        $scope.filter($scope.API_getCollectionsData, 'page', $scope.nextPage);
        $scope.groupPage(5);
        debugger
    });

    /**
     *关联活动分页
     */
    $scope.AssociatedActivitiesGroupPage = function (AssociatedActivitiesGroupPageShowPageNums) {

        //总页数
        $scope.AssociatedActivitiesPages = Math.ceil($scope.AssociatedActivitiesPagesActivetotals / $scope.AssociatedActivitiesPageNum);
        //当前页码改变时，
        $scope.AssociatedActivitiesPageHtml = '';
        //当前页码前面显示数量
        var AssociatedActivitiesCurPageBeforeNums = (AssociatedActivitiesGroupPageShowPageNums / 2).toString().indexOf('.') > 0 ? Math.floor(AssociatedActivitiesGroupPageShowPageNums / 2) : AssociatedActivitiesGroupPageShowPageNums / 2;
        //当前页码后面显示数量
        var AssociatedActivitiesCurPageAfterNums = (AssociatedActivitiesGroupPageShowPageNums / 2).toString().indexOf('.') > 0 ? Math.floor(AssociatedActivitiesGroupPageShowPageNums / 2) : (AssociatedActivitiesGroupPageShowPageNums / 2 - 1);
        debugger;
        //循环遍历页码 并且 特殊显示当前页码
        var AssociatedActivitiesGroupPageHtml = function () {
            if (i == $scope.getAppActiveDataConfig.page) {
                debugger;
                $scope.AssociatedActivitiesPageHtml += '<li><a class="AssociatedActivitiesActive">' + i + '</a></li>';
            } else {
                $scope.AssociatedActivitiesPageHtml += '<li><a>' + i + '</a></li>';
            }
        };
        debugger;
        //当前页码等于第一页时
        if ($scope.getAppActiveDataConfig.page == 1) {
            $('#J_AssociatedActivities_pagePre').hide();
        } else {
            $('#J_AssociatedActivities_pagePre').show();
        }

        //当前页码等于最后一页时
        if ($scope.getAppActiveDataConfig.page == $scope.AssociatedActivitiesPages) {
            $('#J_AssociatedActivities_pageNext').hide();
        } else {
            $('#J_AssociatedActivities_pageNext').show();
        }

        var i;
        if ($scope.AssociatedActivitiesPages < AssociatedActivitiesGroupPageShowPageNums) { //总页数 < 设置的显示页码数量时
            debugger;
            for (i = 1; i <= $scope.AssociatedActivitiesPages; i++) {
                AssociatedActivitiesGroupPageHtml();
            }

        } else if ($scope.getAppActiveDataConfig.page <= AssociatedActivitiesCurPageBeforeNums) { //当前页码 < 当前页码前面显示数量时
            debugger;
            for (i = 1; i <= AssociatedActivitiesGroupPageShowPageNums; i++) {
                AssociatedActivitiesGroupPageHtml();
            }

        } else if ($scope.getAppActiveDataConfig.page > AssociatedActivitiesCurPageBeforeNums && (parseInt($scope.getAppActiveDataConfig.page) + AssociatedActivitiesCurPageAfterNums) < $scope.AssociatedActivitiesPages) { //当前页码 > 当前页码后面显示数量 && 总页数 > （当前页码＋当前页码后面显示数量）
            debugger;
            for (i = ($scope.getAppActiveDataConfig.page - AssociatedActivitiesCurPageBeforeNums); i <= (parseInt($scope.getAppActiveDataConfig.page) + AssociatedActivitiesCurPageAfterNums); i++) {
                AssociatedActivitiesGroupPageHtml();
            }

        } else if ($scope.getAppActiveDataConfig.page >= AssociatedActivitiesCurPageBeforeNums && (parseInt($scope.getAppActiveDataConfig.page) + AssociatedActivitiesCurPageAfterNums) >= $scope.AssociatedActivitiesPages) { //当当前页码 > 当前页码前面显示数量时 && 总页数 < （当前页码＋当前页码后面显示数量）
            debugger;
            for (i = ($scope.AssociatedActivitiesPages - (AssociatedActivitiesGroupPageShowPageNums - 1)); i <= $scope.AssociatedActivitiesPages; i++) {
                AssociatedActivitiesGroupPageHtml();
            }

        }

        $('.J_AssociatedActivities_main_page').html($scope.AssociatedActivitiesPageHtml);

        $('.J_AssociatedActivities_main_page a').each(function () {
            $(this).click(function () {
                $scope.AssociatedActivitiesCurrentPage = parseInt($(this).html());
                $scope.filterAssociatedActivities($scope.API_getAppActiveData, 'page', $scope.AssociatedActivitiesCurrentPage);
                $scope.AssociatedActivitiesGroupPage(5);
            })
        })

    };
    //上一页
    $('#J_AssociatedActivities_pagePre').click(function () {
        $scope.AssociatedActivitiesPrePage = $scope.getAppActiveDataConfig.page - 1;
        $scope.filterAssociatedActivities($scope.API_getAppActiveData, 'page', $scope.AssociatedActivitiesPrePage);
        $scope.AssociatedActivitiesGroupPage(5);
        debugger
    });
    //下一页
    $('#J_AssociatedActivities_pageNext').click(function () {
        $scope.AssociatedActivitiesNextPage = $scope.getAppActiveDataConfig.page + 1;
        $scope.filterAssociatedActivities($scope.API_getAppActiveData, 'page', $scope.AssociatedActivitiesNextPage);
        $scope.AssociatedActivitiesGroupPage(5);
        debugger
    });


    /**
     * 构建删除条件
     * @param id 活动唯一ID
     * @param index 要操作的当前活动的索引
     */
    $scope.deleteCollection = function (id, index) {
        $scope.deleteCondition = {};
        $scope.deleteCondition.id = id;
    };

    /**
     * 添加删除事件
     */
    $scope.confirmDeleteCollectionBtn = function () {
        $scope.deleteCollectionConfig = $scope.deleteCondition;
        $http({
            url: $scope.API_deleteCollectionsData,
            method: 'post',
            data: $httpParamSerializerJQLike($scope.deleteCollectionConfig),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            // 后端返回数据
            .success(function (res) {
                if (res.code == 200) {
                    util.artDialogHint('删除成功');
                    $("#deleteCollectionModal").modal("hide");
                    $scope.filter($scope.API_getCollectionsData, 'Refresh', '');
                    //删除成功后刷新页面???
                    // $scope.initializeBaseData();
                }
            })
            // 后端返回异常
            .error(function (err) {
                util.artDialogHint(err);

            });
    };

    /**
     *编辑专集功能
     */
    $scope.editorCollections = function (infoDataObject, index) {
        console.log(" infoDataObject.title", infoDataObject.title);
        window.location.href = "/collectioneditor/index?model=editor&title=" + infoDataObject.title + "&content=" + infoDataObject.content + "&url=" + infoDataObject.url + "&name=" + infoDataObject.name + "&id=" + infoDataObject.id + "&cityID=" + infoDataObject.cityID+"&phone=" + infoDataObject.phone+"&userImg=" + encodeURIComponent(infoDataObject.userImg);
    };

    /**
     *关联活动功能 step1
     */
    $scope.AssociatedActivities = function (collectionObject) {
        $scope.AssociatedActivitiesDataList = {};
        $scope.getAppActiveDataConfig = {};
        $scope.currentArrayForCheckedShow = [];
        $scope.currentDataAssociatedActivities = {};
        $scope.currentDataAssociatedActivities = {};
        $scope.currentDataAssociatedActivities.tag = collectionObject.id;
        $scope.AssociatedActivitiesModalSearchByTitleText = "";
        $scope.getAppActiveDataConfig.page = 1;
        $scope.getAppActiveDataConfig.area = $scope.filtercondition.cityID;
        $scope.initeFilterAssociatedActivities();
        $scope.HasBeenAssociated();
        $("#AssociatedActivitiesModal").modal("show");

    };

    /**
     * 选中check是向选中列表展示数组中追加 关联活动功能 step2
     */
    $scope.itemAssociatedActivitiesCheckboxBtn = function (checkedItemObject) {
        currentArrayForCheckedShow = [];
        currentArrayForCheckedShow = checkedItemObject.tags;
        var currentArrayForCheckedShowtag = "";
        currentArrayForCheckedShowtag = $scope.currentDataAssociatedActivities.tag;
        if ($("#checkBoxId-" + checkedItemObject.uuid).prop("checked")) {
            currentArrayForCheckedShow.push(currentArrayForCheckedShowtag);
            debugger
        } else {

            for (var i = 0; i < currentArrayForCheckedShow.length; i++) {
                if (currentArrayForCheckedShow[i] == currentArrayForCheckedShowtag) {
                    currentArrayForCheckedShow.splice(i, 1);
                }
            }
            debugger
        }

        $scope.DataForAssociatedActivities = {};
        $scope.DataForAssociatedActivities.tag = currentArrayForCheckedShow.join(',');
        $scope.DataForAssociatedActivities.uuid = checkedItemObject.uuid;

        $http({
            url: '/interface?interface=collection&api=relevance&version=2.1',//$scope.API_AssociatedActivitiesFinal
            method: 'post',
            data: $httpParamSerializerJQLike($scope.DataForAssociatedActivities),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function (res) {
            util.artDialogHint(res.msg);
            $scope.HasBeenAssociated();
        })
            .error(function (err) {
                util.artDialogHint(err);

            });
    };

    /**
     * 上架或下架专集
     * @param id 活动唯一ID
     * @param status 上架或下架活动
     * @param index 筛选后数据 的索引
     */
    $scope.audit = function (id, status, index) {
        $scope.auditOperationCondition = {};
        $scope.auditOperationCondition.id = id;
        $scope.auditOperationCondition.status = status;
        $http({
            url: $scope.API_editorCollection,
            method: 'post',
            data: $httpParamSerializerJQLike($scope.auditOperationCondition),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function (res) {
            util.artDialogHint('操作成功');
            $scope.filter($scope.API_getCollectionsData, 'Refresh', '');
        }).error(function (err) {
            util.artDialogHint(err);

        });
    };

    /**
     * 菜单切换
     */
    $scope.$on('callMyCustomMethod', function (ngRepeatFinishedEvent) {
        $('.J_pc_nav ul li:nth-child(2)').addClass('active');
        $('.J_pc_nav ul li').each(function (val) {
            $(this).click(function () {
                $('.J_pc_nav ul li').removeClass('active');
                $(this).addClass('active');
                debugger

            });
        });
        debugger
    });

    /**
     *获取已关联活动的列表
     */
    $scope.HasBeenAssociated = function () {
        $scope.HasBeenAssociatedDataList = {};
        $scope.HasBeenAssociatedDataList.tag = $scope.currentDataAssociatedActivities.tag;
        $http({
            url: $scope.API_HasBeenAssociated,
            method: 'post',
            data: $httpParamSerializerJQLike($scope.HasBeenAssociatedDataList),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function (res) {
            if (res.code == 200) {
                $scope.HasBeenAssociatedDataListForShow = res.data;
                debugger

            }
        })
            .error(function (err) {
                util.artDialogHint(err);

            });
    };

    /**
     * 筛选关联活动信息
     */
    $scope.filterAssociatedActivities = function (AssociatedActivitiesFilterInterface, AssociatedActivitiesFilterCondition, AssociatedActivitiesFilterValue) {
        if (AssociatedActivitiesFilterCondition == 'title') {
            $scope.getAppActiveDataConfig.title = AssociatedActivitiesFilterValue;
            $scope.getAppActiveDataConfig.tag = $scope.currentDataAssociatedActivities.tag;
        } else if (AssociatedActivitiesFilterCondition == 'page') {
            $scope.getAppActiveDataConfig.page = AssociatedActivitiesFilterValue;
            $scope.getAppActiveDataConfig.tag = $scope.currentDataAssociatedActivities.tag;
        }
        $http({
            url: $scope.API_getAppActiveData,
            method: 'post',
            data: $httpParamSerializerJQLike($scope.getAppActiveDataConfig),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function (res) {
            if (res.code == 200) {
                $scope.AssociatedActivitiesDataList = res.data.list;
                $scope.AssociatedActivitiesPagesActivetotals = res.data.count;
                $scope.AssociatedActivitiesGroupPage(5);
                debugger;
            }
        })
            .error(function (err) {
                util.artDialogHint(err);

            });

    };

    /*  $scope.maxSize = 5;
     $scope.bigTotalItems = 175;
     $scope.bigCurrentPage = 1;
     */
    /**
     * 首次筛选活动列表
     */
    $scope.initeFilterAssociatedActivities = function () {
        $scope.getAppActiveDataConfig.page = 1;
        $scope.getAppActiveDataConfig.area = $scope.filtercondition.cityID;
        $scope.getAppActiveDataConfig.tag = $scope.currentDataAssociatedActivities.tag;


        $http({
            url: $scope.API_getAppActiveData,
            method: 'post',
            data: $httpParamSerializerJQLike($scope.getAppActiveDataConfig),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function (res) {
            if (res.code == 200) {
                $scope.AssociatedActivitiesDataList = res.data.list;
                $scope.AssociatedActivitiesPagesActivetotals = res.data.count;
                $scope.AssociatedActivitiesGroupPage(5);
                // $scope.bigTotalItems = res.data.total || 666;
                debugger;
            }
        })
            .error(function (err) {
                util.artDialogHint(err);

            });
    };

    /**
     * 关联活动弹窗里的angular-ui 分页
     */
    $scope.loadAssociatedActivitiesPageData = function () {
        $scope.getAppActiveDataConfig.page = $scope.bigCurrentPage;
        $scope.getAppActiveDataConfig.tag = $scope.currentDataAssociatedActivities.tag;
        $http({
            url: $scope.API_getAppActiveData,
            method: 'post',
            data: $httpParamSerializerJQLike($scope.getAppActiveDataConfig),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function (res) {
            if (res.code == 200) {
                $scope.AssociatedActivitiesDataList = res.data.list;
                // $scope.AssociatedActivitiesPagesActivetotals = res.data.page;
                // $scope.AssociatedActivitiesGroupPage(5);
                // $scope.bigTotalItems = res.data.total || 666;
                debugger;
            }
        })
            .error(function (err) {
                util.artDialogHint(err);

            });
    };

    /**
     *循环遍历获取的活动列表,把已经关联的显示出来
     */
    /*  $scope.$on('callMyCheckBoxMethod', function (ngRepeatFinishedEvent) {
     var currentAssociatedActivitiesIfChecked=[];
     currentAssociatedActivitiesIfChecked=$scope.AssociatedActivitiesDataList;
     for(var i=0;i<currentAssociatedActivitiesIfChecked.length;i++){
     if(currentAssociatedActivitiesIfChecked[i].tagStatus){
     $("#checkBoxId-"+currentAssociatedActivitiesIfChecked[i].uuid).prop("checked",true);

     }else{
     $("#checkBoxId-"+currentAssociatedActivitiesIfChecked[i].uuid).removeProp("checked");

     }

     }

     debugger
     });*/

    /**
     *通过标题快速搜索关联活动信息
     */
    $scope.AssociatedActivitiesSearchByTitle = function () {
        $scope.filterAssociatedActivities($scope.API_getAppActiveData, 'title', $scope.AssociatedActivitiesModalSearchByTitleText);
    };

    /**
     *通过标题快速搜索专集列表信息
     */
    $scope.searchByKeyword = function () {
        $scope.filter($scope.API_getCollectionsData, 'title', $scope.searchKeywordText);
    };


    //默认当前城市
    /* $scope.currentSelectedCity = {
     id: 110000,
     name: "北京市"
     };*/
    // 专题管理页面- 城市初始化
    /* $scope.cities = [
     {
     cityID: 888888,
     cityName: '全部地区'
     },
     {
     cityID: 110000,
     cityName: '北京'
     },
     {
     cityID: 310000,
     cityName: '上海'
     },
     {
     cityID: 440100,
     cityName: '广州'
     },
     {
     cityID: 440300,
     cityName: '深圳'
     },
     {
     cityID: 330100,
     cityName: '杭州'
     },
     {
     cityID: 320100,
     cityName: '南京'
     },
     {
     cityID: 510100,
     cityName: '成都'
     },
     {
     cityID: 350200,
     cityName: '厦门'
     },
     {
     cityID: 330200,
     cityName: '宁波'
     },
     {
     cityID: 320500,
     cityName: '苏州'
     },
     {
     cityID: 610100,
     cityName: '西安'
     },
     {
     cityID: 340100,
     cityName: '合肥'
     },
     {
     cityID: 420100,
     cityName: '武汉'
     },
     {
     cityID: 430100,
     cityName: '长沙'
     },
     {
     cityID: 500000,
     cityName: '重庆'
     }
     ];*/


    /**
     * 快速搜索功能??
     */
    /*  document.onkeydown = function (e) {
     if (!e) e = window.event;//火狐中是 window.event
     if ((e.keyCode || e.which) == 13) {
     $scope.searchByKeyword('$scope.API_getCollectionsData', 'title', $scope.searchKeywordText)
     }
     };
     */

    //下拉列表
    var dropdown = function (f, txt) {
        f.each(function (key, val) {
            $(this).click(function () {
                txt.html($(val).children('a').html());
            })
        })
    };
    dropdown($('.J_filter_from li'), $('.J_filter_from_txt'));
    dropdown($('#J_mobile_nav').find('li'), $('#J_mobile_nav_txt'));
    dropdown($('.J_filter_status li'), $('.J_filter_status_txt'));
    dropdown($('.J_filter_hot li'), $('.J_filter_hot_txt'));
    dropdown($('.J_filter_type li'), $('.J_filter_type_txt'));

    /**
     * 复制活动地址
     * @type {*|ZeroClipboard}
     */
    var zClipboard_activityURL = new ZeroClipboard(document.getElementById("btnCopyActivityURL"));
    zClipboard_activityURL.on("ready", function (readyEvent) {
        // console.log("ZeroClipboard SWF is ready!");
        zClipboard_activityURL.on("aftercopy", function (event) {
            // `this` === `client`
            // `event.target` === the element that was clicked
            //event.target.style.display = "none";
            util.artDialogBubble('<p>地址复制成功! :)</p><p>' + event.data["text/plain"] + '</p>', event.target);
        });
    });

    /**
     * 用户退出
     */
    $scope.logout = function () {
        $http.post('/login/logout').success(function (res) {
            window.location.href = '/login/index';
        })
    };

    /**
     * 用户关闭页面自动清理session
     */
    $(window).on('beforeunload', function (e) {
        if ((event.clientX > document.body.clientWidth && event.clientY < 0) || event.altKey) {
            $http.post('/login/logout').success(function (res) {
            });
            return "您确定要离开吗？"
        } else {

        }
    })

}]);
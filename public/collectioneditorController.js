var qingniwan = angular.module('qingniwan.admin', []);
qingniwan.controller('collectioneditorController', ['$scope', '$http', '$location', 'util', '$compile', '$httpParamSerializerJQLike', function ($scope, $http, $location, util, $compile, $httpParamSerializerJQLike) {

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
    //城市初始化
    $scope.cities = [
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
    ];
    $scope.API_createCollection = '/interface?interface=collection&api=create&version=2.1';
    $scope.API_editorCollection = '/interface?interface=collection&api=update&version=2.1';

    /**
     * 创建模式/编辑模式 检测并初始化
     */
    $scope.initializeBaseData = function () {
        if (getParams("model") == 'editor') {
            $scope.initWithEditingMode();
        } else if (getParams("model") == 'create') {
            $scope.initWithCreatingMode();
        } else {
            window.location.href = '/collectioneditor/index?model=create';
            //util.artDialogHint('默认为编辑模式');
            // $scope.initWithEditingMode();
        }
    };

    /**
     * 以 "创建模式" 加载
     */
    $scope.initWithCreatingMode = function () {
        //数据对象初始化
        var addSectionNum;
        $scope.htmlPageDataList = {};
        $scope.htmlPageDataList.btnText = "确认发布";
        $scope.htmlPageDataList.currentSelectedCity = $scope.cities[0];
        $scope.collectionPageModeIsCreate = true;
        $scope.API_dataListForConfig = $scope.API_createCollection;
        $scope.dataListForConfig = {};
    };

    /**
     * 以 "编辑模式" 加载
     */
    $scope.initWithEditingMode = function () {
        $scope.htmlPageDataList = {};
        $scope.htmlPageDataList.btnText = "确认修改";
        $scope.collectionPageModeIsCreate = false;
        $scope.API_dataListForConfig = $scope.API_editorCollection;
        $scope.dataListForConfig = {};
        $scope.htmlPageDataList.title = decodeURIComponent(getParams('title'));
        $scope.htmlPageDataList.content = decodeURIComponent(getParams('content'));
        $scope.htmlPageDataList.coverUrl = decodeURIComponent(getParams('url'));
        $scope.htmlPageDataList.name = decodeURIComponent(getParams('name'));
        $scope.htmlPageDataList.phone = decodeURIComponent(getParams('phone'));
        $scope.htmlPageDataList.id = decodeURIComponent(getParams('id'));
        $scope.htmlPageDataList.cityID = decodeURIComponent(getParams('cityID'));
        $scope.htmlPageDataList.userImg = decodeURIComponent(getParams('userImg'));
debugger
        //根据后台返回的海报地址,添加在海报图片区域
        if ($scope.htmlPageDataList.coverUrl) {

            $("#fileListofPoster").append($compile('<div id="MockImgShowOfPoster" class="file-item thumbnail">' +
                '    <img ng-src="{{htmlPageDataList.coverUrl}}">' +
                '     </div>')($scope));
            console.log("$watch海报变量coverUrl", $scope.htmlPageDataList.coverUrl);
        }
        //根据后台返回的城市ID,更新select的城市
        for (var i = 0; i < $scope.cities.length; i++) {
            if ($scope.cities[i].cityID == $scope.htmlPageDataList.cityID) {
                $scope.htmlPageDataList.currentSelectedCity = $scope.cities[i];
                //$scope.htmlPageDataList.currentSelectedCityID = $scope.htmlPageDataList.categoryid;
            }
        }
    };

    /**
     *上传海报功能初始化
     */
    if (typeof WebUploader != 'undefined') {

        var initWebUploaderConfig = {
            auto: true, // 选完文件后，是否自动上传
            swf: '../plugins/webuploader-0.1.5/Uploader.swf', // swf文件路径
            server: '/Uploadimage/index', // 文件接收服务端
            //server: 'http://wangkang.in.x-one.cc/ajax/upload', // 文件接收服务端
            fileVal: 'file1',
            pick: '#filePicker', // 选择文件的按钮 可选 - 内部根据当前运行是创建，可能是input元素，也可能是flash.
            //fileNumLimit: 1, // 限制文件上传数量
            fileSingleSizeLimit: 1.8 * 1024 * 1024, // 限制文件上传大小 2MB
            // 只允许选择图片文件
            accept: {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: 'image/*'
            }
        };
        // 初始化海报 Web Uploader
        initWebUploaderConfig.pick = '#filePickerofPoster';
        var uploaderofPoster = WebUploader.create(initWebUploaderConfig);
        // 为海报添加自定义行为
        addCustomEventListenerofPoster(uploaderofPoster, '#fileListofPoster');
    }

    /**
     * 为海报添加自定义行为 - 缩略图, 提示文本, 进度条等
     * @param uploader 通过WebUploader.create方法创建的uploader对象
     * @param fileList 要显示缩略图, 进度条的容器的selector
     */
    function addCustomEventListenerofPoster(uploader, fileList) {

        // 当有文件添加进来的时候
        uploader.on('fileQueued', function (file) {
            var $li = $(
                    '<div id="' + file.id + '" class="file-item thumbnail">' +
                    '</div>'
                ),
                $img = $li.find('img');

            // $list为容器jQuery实例
            $(fileList).html($li);

            // 创建缩略图
            // 如果为非图片文件，可以不用调用此方法。
            /*  var
             thumbnailWidth = 750,
             thumbnailHeight = 400;
             uploader.makeThumb(file, function (error, src) {
             if (error) {
             $img.replaceWith('<span>不能预览</span>');
             return;
             }
             $img.attr('src', src);
             }, thumbnailWidth, thumbnailHeight);*/
        });

        // 文件上传过程中创建进度条实时显示
        uploader.on('uploadProgress', function (file, percentage) {
            var $li = $('#' + file.id)
                , $percent = $li.find('.progress .progress-bar');

            // 避免重复创建
            if (!$percent.length) {
                $percent = $('<div class="progress">' +
                    '<div class="progress-bar progress-bar-danger progress-bar-striped active" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" style="width: 0%">' +
                    '</div>' +
                    '</div>').appendTo($li).find('.progress-bar');
            }
            $percent.text('上传中...');
            $percent.css('width', percentage * 100 + '%');
        });

        // 文件上传成功，给item添加成功class, 用样式标记上传成?
        uploader.on('uploadSuccess', function (file, data)

            //添加海报按钮样式
            /* $(".PosterForContainer .webuploader-pick").addClass('addSectionPictureBtn');
             $(".PosterForContainer .webuploader-pick + div").addClass('addSectionPictureBtnControls');*/ {

            var responseRaw = data._raw;
            var responsePosterObjectData = eval("(" + responseRaw + ")");
            $scope.htmlPageDataList.coverUrl = responsePosterObjectData.data.path;
            var numOfPoster = file.id;
            var SectionUrlOfPoster = $scope.htmlPageDataList.coverUrl;

            //把每个地址和相应的行为和事件 挂到对应的dom缩略图file.id上
            $('#' + numOfPoster).append('<img id="imgPreviewOfUploadSuccess' + numOfPoster + '" src="' + SectionUrlOfPoster + '" class="PreviewOfUploadSuccess"' + '>');

        });

        // 文件上传失败，显示上传出错
        uploader.on('error', function (errorType) {

            // 上传文件超出大小限制
            if (errorType == 'F_EXCEED_SIZE') {
                var friendlyFileSize = uploader.options.fileSingleSizeLimit / 1048576;
                var errorDialog = dialog({
                    content: '啊哦! 要上传的图片太大了 <br><br> 请确保在' + friendlyFileSize + 'MB以内哟~',
                    quickClose: true,
                    fixed: true
                });
                errorDialog.show();
                setTimeout(function () {
                    errorDialog.close().remove();
                }, 2000);
            }

        });

        // 文件上传失败，显示上传出错
        uploader.on('uploadError', function (file, reason) {
            var $li = $('#' + file.id)
                , $percent = $li.find('.progress .progress-bar');
            //
            $percent.text(reason);
        });

        // 完成上传之后，无论成功或者失败，先删除进度条
        uploader.on('uploadComplete', function (file) {
            setTimeout(function () {
                $('#' + file.id).find('.progress').slideUp();
            }, 1000);
        });

    }

    /**
     * 点击发布专题按钮事件
     */
    $scope.releaseBtnForSpecial = function () {

        //创建模式下配置要发送的数据
        if ($scope.collectionPageModeIsCreate) {
            $scope.dataListForConfig.title = $scope.htmlPageDataList.title;
            $scope.dataListForConfig.content = $scope.htmlPageDataList.content;
            $scope.dataListForConfig.url = $scope.htmlPageDataList.coverUrl;
            $scope.dataListForConfig.phone = $scope.htmlPageDataList.phone;
            $scope.dataListForConfig.cityID = $scope.htmlPageDataList.currentSelectedCity.cityID;
            console.log("modal形式的select数据", $scope.htmlPageDataList.currentSelectedCity);
            if (!$scope.dataListForConfig.title || (!$scope.dataListForConfig.content) || (!$scope.dataListForConfig.url) || (!$scope.dataListForConfig.phone) || (!$scope.dataListForConfig.cityID)) {
                util.artDialogHint('请填写完整信息');
                return
            }
        } else if (!$scope.collectionPageModeIsCreate) {
            $scope.dataListForConfig.title = $scope.htmlPageDataList.title;
            $scope.dataListForConfig.content = $scope.htmlPageDataList.content;
            $scope.dataListForConfig.url = $scope.htmlPageDataList.coverUrl;
            $scope.dataListForConfig.phone = $scope.htmlPageDataList.phone;
            $scope.dataListForConfig.cityID = $scope.htmlPageDataList.currentSelectedCity.cityID;
            $scope.dataListForConfig.id = $scope.htmlPageDataList.id;
        }
        $http({
            url: $scope.API_dataListForConfig,
            method: 'post',
            data: $httpParamSerializerJQLike($scope.dataListForConfig),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            // 后端返回数据
            .success(function (res) {
                if (res.code == 200) {
                    if (!$scope.collectionPageModeIsCreate) {
                        util.artDialogHint("修改成功~");
                    } else if ($scope.collectionPageModeIsCreate) {
                        util.artDialogHint("发布成功~");
                    }
                    //window.location.href = "collection/index";
                }
            })
            // 后端返回异常
            .error(function (err) {
                util.artDialogHint(err);

            });

    };

    /**
     * 自定义获取url参数方法
     */
    function getParams(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return r[2]
        } else {
            return null;
        }

    }


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


    //已下为内容区域代码  行为初始化
    $scope.actions = [
        {
            actionTemplateName: '请选择行为',
            actionName: 'actionDefault'
        },
        {
            actionTemplateName: '查看活动详情',
            actionName: 'activityDetail'
        },
        {
            actionTemplateName: '发起邀约',
            actionName: 'launchInvitation'
        },
        {
            actionTemplateName: '跳转到链接',
            actionName: 'jumpToHref'
        },
        {
            actionTemplateName: '查看邀约详情',
            actionName: 'invitationDetail'
        }
    ];
    /**
     * 内容区域 点击添加图片事件
     */
    $scope.addSectionImg = function () {
        if (addSectionNum) {
            addSectionNum += 1;
            console.log(addSectionNum);
            $scope.addSectionImgMethod(addSectionNum);

        } else {
            addSectionNum = 1;
            $scope.addSectionImgMethod(addSectionNum);

        }
    };
    /**
     *内容区域 添加图片上传对象
     */
    $scope.addSectionImgMethod = function (addSectionNum) {

        $('.J_sectionImgByRepeatArry').append('<div class="sectionImgFormContainer" >' +
            '  <p>' +
            '       <span id="webuploaderOfSectionImg' + addSectionNum + '"' + '>' +
            '           <span id="filePickerOfSectionImg' + addSectionNum + '"' + '>添加内容图片</span>' +
            '           <span id="fileListOfSectionImg' + addSectionNum + '"' + '></span>' +
            '       </span>' +
            '  </p>' +
            ' </div>');
        //调用创建对象
        uploaderOfSectionImg1 = $scope.createObject(addSectionNum);
        console.log('uploaderOfSectionImg1' + uploaderOfSectionImg1);

        var fileListOfSectionImgArry = '#fileListOfSectionImg' + addSectionNum;
        $scope.CreateObjectOfaddCustomEventListenerofSectionImg(uploaderOfSectionImg1, fileListOfSectionImgArry);
    };
    $scope.createObject = function (addSectionNum) {

        return WebUploader.create({
            auto: true, // 选完文件后，是否自动上传
            swf: '../plugins/webuploader-0.1.5/Uploader.swf', // swf文件路径
            server: '/Uploadimage/index', // 文件接收服务端
            //server: 'http://wangkang.in.x-one.cc/ajax/upload', // 文件接收服务端
            multiple: false,
            fileVal: 'file1',
            pick: '#filePickerOfSectionImg' + addSectionNum, // 选择文件的按钮 可选 - 内部根据当前运行是创建，可能是input元素，也可能是flash.
            //fileNumLimit: 1, // 限制文件上传数量
            fileSingleSizeLimit: 1.8 * 1024 * 1024, // 限制文件上传大小 2MB
            // 只允许选择图片文件
            accept: {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: 'image/*'
            }
        });

    };
    $scope.CreateObjectOfaddCustomEventListenerofSectionImg = function (uploader, fileList) {

        return addCustomEventListenerofSectionImg1(uploader, fileList)
    };
    function addCustomEventListenerofSectionImg1(uploader, fileList) {

        // 当有文件添加进来的时候
        uploader.on('fileQueued', function (file) {
            // $scope.SectionUrl = "tu";
            var $li = $(
                    '<div id="' + file.id + '" class="file-item thumbnail">' +
                    '</div>'
                ),
                $img = $li.find('img');

            // $list为容器jQuery实例
            $(fileList).html($li);


            // 创建缩略图
            // 如果为非图片文件，可以不用调用此方法。
            //   var
            // thumbnailWidth = 750,
            //  thumbnailHeight = 'auto';

            /* uploader.makeThumb(file, function (error, src) {
             if (error) {
             $img.replaceWith('<span>不能预览</span>');
             return;
             }
             $img.attr('src', src);
             });*/
        });

        // 文件上传过程中创建进度条实时显示
        uploader.on('uploadProgress', function (file, percentage) {
            var $li = $('#' + file.id)
                , $percent = $li.find('.progress .progress-bar');

            // 避免重复创建
            if (!$percent.length) {
                $percent = $('<div class="progress">' +
                    '<div class="progress-bar progress-bar-danger progress-bar-striped active" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" style="width: 0%">' +
                    '</div>' +
                    '</div>').appendTo($li).find('.progress-bar');
            }
            $percent.text('上传中...');
            $percent.css('width', percentage * 100 + '%');
        });

        // 文件上传成功，给item添加成功class, 用样式标记上传成功
        uploader.on('uploadSuccess', function (file, data) {
            var responseRaw = data._raw;
            var responsePosterObjectData = eval("(" + responseRaw + ")");
            var SectionUrl = responsePosterObjectData.data.path;
            var num = file.id;

            //把每个地址和相应的行为和事件 挂到对应的dom缩略图file.id上
            $('#' + num).append('<img id="imgPreviewOfUploadSuccess' + num + '" src="' + SectionUrl + '" class="PreviewOfUploadSuccess"' + '>');
            $('#' + num).append('<div id="customContainer' + num + '"' + 'class="bottomOperationGrunp"></div>');

            $('#customContainer' + num).append('<img id="img' + num + '" src="' + SectionUrl + '" class="sectionImgForPreview" style="display:none"' + '>');
            $('#customContainer' + num).append($compile(
                    '<button class="btn customBtnStyle" type="button" id="deleteBtn' + num + '" ng-click="deleteCurrentSectionObject($event)"' + '>删除</button>'
                )($scope)
            );
            $('#customContainer' + num).append($compile(
                    '<button class="btn customBtnStyle" type="button" id="actionBtn' + num + '" ng-click="actionOfCurrentSectionObject($event)">请选择行为</button>'
                )($scope)
            );
            $('#customContainer' + num).append($compile(
                    '<button class="btn customBtnStyle" type="button" id="deleteActionDataBtn' + num + '" ng-click="deleteCurrentSectionActionData($event)"' + '>清空行为</button>'
                )($scope)
            );
            /*  $('#customContainer' + num).append($compile(
             '<select class="form-control ifShowActionOptions" id="currentAction' + num + '"' + ' ng-options="item.actionTemplateName for item in actions track by item.actionName" ng-change="updateCurrentActionData($event)"></select>'
             )($scope)
             );*/

            /**
             *原生方式加载select
             */
            $('#customContainer' + num).append(
                '<select id="currentSelectDataForAction' + num + '"' + ' class="form-control ifShowActionOptions"> ' +
                '    <option value="actionDefault" >请选择行为</option>' +
                '  <optgroup label="活动">' +
                '  ' +
                '   <option value="activityDetail">查看活动详情</option> ' +
                '    <option value="launchInvitation">发起邀约</option>' +
                '  </optgroup>' +
                '  <optgroup label="邀约">' +
                '   <option value="invitationDetail">查看邀约详情</option>' +
                '  </optgroup>' +
                '  <optgroup label="自定义">' +
                '   <option value="jumpToHref">自定义链接</option>' +
                '  </optgroup>' +
                '</select>');

            $('#customContainer' + num).append($compile(
                    '<input class="form-control ifShowActionOptions" id="currentInputDataOfActionID' + num + '"' + '">'
                )($scope)
            );

            //为添加图片按钮添加一个class以供修改添加图片按钮样式
            $(".sectionImgFormContainer .webuploader-pick").addClass('addSectionPictureBtn');
            $(".sectionImgFormContainer .webuploader-pick + div").addClass('addSectionPictureBtnControls');
            /*    setTimeout(function(){
             $(".webuploader-pick + div").addClass('addSectionPictureBtnControls');
             console.log(".addSectionPictureBtn + div",  $(".webuploader-pick + div"));
             }, 1000);*/
        });

        // 文件上传失败，显示上传出错
        uploader.on('error', function (errorType) {

            // 上传文件超出大小限制
            if (errorType == 'F_EXCEED_SIZE') {
                var friendlyFileSize = uploader.options.fileSingleSizeLimit / 1048576;
                var errorDialog = dialog({
                    content: '啊哦! 要上传的图片太大了 <br><br> 请确保在' + friendlyFileSize + 'MB以内哟~',
                    quickClose: true,
                    fixed: true
                });
                errorDialog.show();
                setTimeout(function () {
                    errorDialog.close().remove();
                }, 2000);
            }

        });

        // 文件上传失败，显示上传出错
        uploader.on('uploadError', function (file, reason) {
            var $li = $('#' + file.id)
                , $percent = $li.find('.progress .progress-bar');
            //
            $percent.text(reason);
        });

        // 完成上传之后，无论成功或者失败，先删除进度条
        uploader.on('uploadComplete', function (file) {
            setTimeout(function () {
                $('#' + file.id).find('.progress').slideUp();
            }, 1000);
        });

    }

    /**
     *内容区域图片上传成功后动态加载事件 "删除SectionObject" 事件
     */
    $scope.deleteCurrentSectionObject = function ($event) {
        var targetOfdeleteEventObject = $event.target;
        var targetOfdeleteEventObjectID = targetOfdeleteEventObject.getAttribute('id');
        var deleteTreeByTargetIDfragment = targetOfdeleteEventObjectID.substring(targetOfdeleteEventObjectID.indexOf('_'));
        var deleteTreeByTargetID = "WU" + deleteTreeByTargetIDfragment;
        $("#" + deleteTreeByTargetID).parents(".sectionImgFormContainer").remove();

    };
    /**
     * 内容区域图片上传成功后动态加载事件 "currentSelectDataForAction" 和"currentInputDataOfActionID"显示与隐藏
     */
    $scope.actionOfCurrentSectionObject = function ($event) {
        //默认选择行为actionBtnWU_FILE_MOCK1
        var targetOfactionEventObject = $event.target;
        var targetOfactionEventObjectID = targetOfactionEventObject.getAttribute('id');
        var actionTargetIDfragment = targetOfactionEventObjectID.substring(targetOfactionEventObjectID.indexOf('_'));
        var actionSelectTargetID = "currentSelectDataForActionWU" + actionTargetIDfragment;
        var actioninputTargetID = "currentInputDataOfActionIDWU" + actionTargetIDfragment;

        if ($("#" + actionSelectTargetID).hasClass('ifShowActionOptions')) {
            $("#" + actionSelectTargetID).removeClass('ifShowActionOptions');
            $("#" + actioninputTargetID).removeClass('ifShowActionOptions');
            $("#" + targetOfactionEventObjectID).text('请选择行为')
        } else {
            $("#" + actionSelectTargetID).addClass('ifShowActionOptions');
            $("#" + actioninputTargetID).addClass('ifShowActionOptions');

            if (($("#" + actionSelectTargetID).val() != "actionDefault") && ($("#" + actioninputTargetID).val())) {

                $("#" + targetOfactionEventObjectID).text('行为已隐藏')
            }
        }
        /*  $("#" + actionSelectTargetID).toggleClass('ifShowActionOptions');
         $("#" + actioninputTargetID).toggleClass('ifShowActionOptions');*/


    };
    /**
     *内容区域图片上传成功后动态加载事件 "删除SectionActionData" 事件
     */
    $scope.deleteCurrentSectionActionData = function ($event) {
        var targetOfdeleteActionDataEventObject = $event.target;
        var targetOfdeleteActionDataEventObjectID = targetOfdeleteActionDataEventObject.getAttribute('id');
        var deleteTreeByTargetIDfragment = targetOfdeleteActionDataEventObjectID.substring(targetOfdeleteActionDataEventObjectID.indexOf('_'));
        var deleteTreeByTargetID = "WU" + deleteTreeByTargetIDfragment;
        $("#currentSelectDataForAction" + deleteTreeByTargetID).val("actionDefault");
        $("#currentInputDataOfActionID" + deleteTreeByTargetID).val("");
        $("#currentSelectDataForAction" + deleteTreeByTargetID).addClass("ifShowActionOptions");
        $("#currentInputDataOfActionID" + deleteTreeByTargetID).addClass("ifShowActionOptions");

    };
    /**
     * 内容区域图片上传成功后动态加载 监听"行为"改变
     */
    if (typeof jQuery.fn.live == 'undefined' || !(jQuery.isFunction(jQuery.fn.live))) {
        jQuery.fn.extend({
            live: function (event, callback) {
                if (this.selector) {
                    jQuery(document).on(event, this.selector, callback);
                }
            }
        });
    }
    $(document).on("change", "select", function (event) {
        var changeSelectTargetObject = event.target.getAttribute('id');
        var options = $('#' + changeSelectTargetObject + ' option:selected');
        console.log(changeSelectTargetObject + "当前值" + options.val());
        console.log(changeSelectTargetObject + "当前值" + options.text());

    });
    /**
     * 监听当前选择的城市, 发生变化时查询当前选中城市的ID
     */
    /*
     $scope.updatePulishData = function () {
     $scope.htmlPageDataList.currentSelectedCityID = $scope.htmlPageDataList.currentSelectedCity.cityID;
     console.log("城市选项改变时城市", $scope.htmlPageDataList.currentSelectedCity);
     console.log("城市选项改变时城市ID", $scope.htmlPageDataList.currentSelectedCityID);

     };
     */


}]);
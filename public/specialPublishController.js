var qingniwan = angular.module('qingniwan.admin', []);
qingniwan.controller('specialPublishController', ['$scope', '$http', '$location', 'util', '$compile', 'baseData', function ($scope, $http, $location, util, $compile, baseData) {

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

    //行为初始化
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

    //初始加载类型数据
    $scope.baseData = baseData;

    /**
     * 创建模式/编辑模式 检测并初始化
     */
    $scope.initializeBaseData = function () {
        if ($scope.baseData.mode == 'editor') {
            $scope.initWithEditingMode();
        } else if ($scope.baseData.mode == 'create') {
            $scope.initWithCreatingMode();
        } else {
            util.artDialogHint('未定义的页面交互模式')
        }
    };

    /**
     * 以 "创建模式" 加载
     */
    $scope.initWithCreatingMode = function () {

        $scope.specialPageModeIsCreate = true;
        //数据对象
        $scope.releaseForSpecial = {};
        $scope.API_releaseForSpecial = '/Special/collect';
        $scope.releaseForSpecial.btnText = "确认发布";
        $scope.releaseForSpecial.templateUrl = 'http://app.api.qingniwan.cc/Special/index';
        //默认当前选择的城市为"全部地区" 同步更新当前选中城市的ID
        $scope.releaseForSpecial.currentSelectedCity = $scope.cities[0];
        $scope.releaseForSpecial.currentSelectedCityID = $scope.releaseForSpecial.currentSelectedCity.cityID;
        console.log("初始化选中城市", $scope.releaseForSpecial.currentSelectedCity);
        console.log("初始化选中城市ID", $scope.releaseForSpecial.currentSelectedCityID);

    };

    /**
     * 以 "编辑模式" 加载
     */
    $scope.initWithEditingMode = function () {
        $scope.specialPageModeIsCreate = false;
        $scope.API_releaseForSpecial = '/Special/edit';

        //获取ID以便查找要编辑的对象
        $scope.getSpecialPageDataByID={};
        $scope.getSpecialPageDataByID.specialID= util.getParams('specialID');
      //  $scope.getSpecialPageDataByID.id= $scope.getSpecialPageDataByID.specialID;
        //将发送的数据转化为json格式
        $scope.getSpecialPageDataByIDConfig = JSON.stringify($scope.getSpecialPageDataByID);
        $scope.API_getSpecialPageDataList='/Special/sectionInfo';

        /**
         * 现根据ID向后发请求数据
         */
        $http.post($scope.API_getSpecialPageDataList, $scope.getSpecialPageDataByIDConfig).success(function (res) {
            if (res.err == false) {
                $scope.releaseForSpecial={};
                $scope.releaseForSpecial=res.data;
                $scope.releaseForSpecial.btnText = "确认修改";
                $scope.releaseForSpecial.templateUrl = $scope.releaseForSpecial.url.split('?')[0];

                //根据后台返回的城市ID,更新select的城市
                for (var i = 0; i < $scope.cities.length; i++) {
                    if ($scope.cities[i].cityID == $scope.releaseForSpecial.categoryid) {
                        $scope.releaseForSpecial.currentSelectedCity = $scope.cities[i];
                        $scope.releaseForSpecial.currentSelectedCityID = $scope.releaseForSpecial.categoryid;
                    }
                }
                //根据后台返回的海报地址,添加在海报图片区域
                if($scope.releaseForSpecial.coverUrl){

                    $("#fileListofPoster").append($compile('<div id="MockImgShowOfPoster" class="file-item thumbnail">' +
                        '    <img ng-src="{{releaseForSpecial.coverUrl}}">' +
                        '     </div>')($scope));
                    console.log("$watch海报变量coverUrl",$scope.releaseForSpecial.coverUrl);
                }

                //根据后台返回的内容区域对象,循环遍历生成多个上传对象,首次加载手动添加内容区域地址 
                if($scope.releaseForSpecial.SectionDataList){

                    for(var i= 0;i<$scope.releaseForSpecial.SectionDataList.length;i++){
                        var currentSectionMockImgURL=$scope.releaseForSpecial.SectionDataList[i].SectionImgURL;
                        var currentSectionMockImgActionValue=$scope.releaseForSpecial.SectionDataList[i].SectionImgActionName;
                        var currentSectionMockImgActionRelateID=$scope.releaseForSpecial.SectionDataList[i].SectionImgActionRelateID;
                        console.log("内容区域$scope.currentSectionMockImgURL+>",$scope.currentSectionMockImgURL);
                        $scope.addSectionImg();

                        //为添加图片按钮添加一个class以供修改添加图片按钮样式
                        $(".sectionImgFormContainer .webuploader-pick").addClass('addSectionPictureBtn');
                        $(".sectionImgFormContainer .webuploader-pick + div").addClass('addSectionPictureBtnControls');
                     /*   setTimeout(function(){

                            console.log("webuploader-pick + div `111",$(".webuploader-pick + div"))
                        }, 1000);*/

                        $("#fileListOfSectionImg"+addSectionNum).append('<div id="WU_FILE_MOCK'+addSectionNum+'" class="file-item thumbnail">' +
                            '    <img src="'+currentSectionMockImgURL+'">' +
                            '     </div>');

                        console.log("addSectionNum>",addSectionNum);

                        //根据后台返回数据 手动添加模拟事件
                        $("#WU_FILE_MOCK"+addSectionNum).append('<div id="customContainerWU_FILE_MOCK' + addSectionNum + '"' + 'class="bottomOperationGrunp"></div>');

                        $('#customContainerWU_FILE_MOCK' + addSectionNum).append('<img id="imgWU_FILE_MOCK' + addSectionNum + '" src="' + currentSectionMockImgURL + '" class="sectionImgForPreview" style="display:none"' + '>');

                        $('#customContainerWU_FILE_MOCK' + addSectionNum).append($compile(
                                '<button class="btn customBtnStyle" type="button" id="deleteBtnWU_FILE_MOCK' + addSectionNum + '" ng-click="deleteCurrentSectionObject($event)"' + '>删除</button>'
                            )($scope)
                        );
                        $('#customContainerWU_FILE_MOCK' + addSectionNum).append($compile(
                                '<button class="btn customBtnStyle" type="button" id="actionBtnWU_FILE_MOCK' + addSectionNum + '" ng-click="actionOfCurrentSectionObject($event)">请选择行为</button>'
                            )($scope)
                        );
                        $('#customContainerWU_FILE_MOCK' + addSectionNum).append($compile(
                                '<button class="btn customBtnStyle" type="button" id="deleteActionDataBtnWU_FILE_MOCK' + addSectionNum + '" ng-click="deleteCurrentSectionActionData($event)"' + '>清空行为</button>'
                            )($scope)
                        );
                        /**
                         *原生方式加载select
                         */
                        $('#customContainerWU_FILE_MOCK' + addSectionNum).append(
                            '<select id="currentSelectDataForActionWU_FILE_MOCK' + addSectionNum + '"' + ' class="form-control ifShowActionOptions"> ' +
                            '    <option value="actionDefault" >请选择行为</option>'+
                            '  <optgroup label="活动">'+
                            '  '+
                            '   <option value="activityDetail">查看活动详情</option> '+
                            '    <option value="launchInvitation">发起邀约</option>'+
                            '  </optgroup>'+
                            '  <optgroup label="邀约">'+
                            '   <option value="invitationDetail">查看邀约详情</option>'+
                            '  </optgroup>'+
                            '  <optgroup label="自定义">'+
                            '   <option value="jumpToHref">自定义链接</option>'+
                            '  </optgroup>'+
                            '</select>');

                        $('#customContainerWU_FILE_MOCK' + addSectionNum).append($compile(
                                '<input class="form-control ifShowActionOptions" id="currentInputDataOfActionIDWU_FILE_MOCK' + addSectionNum + '"' + '">'
                            )($scope)
                        );
                        //根据后台返回数据 手动添加行为数据
                        /* if(currentSectionMockImgActionValue){
                         //根据ActionID就可以判断是否有行为,否则还得判断默认值actionDefault
                         $("#currentSelectDataForActionWU_FILE_MOCK" + addSectionNum).val(currentSectionMockImgActionValue);
                         $("#currentSelectDataForActionWU_FILE_MOCK" + addSectionNum).removeClass('ifShowActionOptions')
                         }*/
                        if(currentSectionMockImgActionRelateID){
                            $("#currentSelectDataForActionWU_FILE_MOCK" + addSectionNum).val(currentSectionMockImgActionValue);
                            $("#currentSelectDataForActionWU_FILE_MOCK" + addSectionNum).removeClass('ifShowActionOptions');
                            $("#currentInputDataOfActionIDWU_FILE_MOCK" + addSectionNum).val(currentSectionMockImgActionRelateID);
                            $("#currentInputDataOfActionIDWU_FILE_MOCK" + addSectionNum).removeClass('ifShowActionOptions');
                        }

                    }

                }

            } else {
                alert(res.msg);
            }
        });
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
            $(".PosterForContainer .webuploader-pick + div").addClass('addSectionPictureBtnControls');*/{

            var responseRaw = data._raw;
            var responsePosterObjectData = eval("(" + responseRaw + ")");
            $scope.releaseForSpecial.coverUrl = responsePosterObjectData.data.path;
            var numOfPoster = file.id;
           var SectionUrlOfPoster=  $scope.releaseForSpecial.coverUrl;

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
     * 内容区域 点击添加图片事件
     */
        if($scope.baseData.specialPageMode == 'create'){
            var addSectionNum;
        }
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

//测试
        //   initWebUploaderConfig.pick = '#filePickerOfSectionImg1';
        //   var uploaderOfSectionImg1 = WebUploader.create(initWebUploaderConfig);
        //  addCustomEventListenerofSectionImg1(uploaderOfSectionImg1, '#fileListOfSectionImg1');

        /**
         * 为WebUploader添加自定义行为 - 缩略图, 提示文本, 进度条等
         * @param uploader 通过WebUploader.create方法创建的uploader对象
         * @param fileList 要显示缩略图, 进度条的容器的selector
         */
        /* function addCustomEventListenerofSectionImg1(uploader, fileList) {

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
         var
         thumbnailWidth = 240,
         thumbnailHeight = 320;
         uploader.makeThumb(file, function (error, src) {
         if (error) {
         $img.replaceWith('<span>不能预览</span>');
         return;
         }
         $img.attr('src', src);
         }, thumbnailWidth, thumbnailHeight);
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


         uploader.on('uploadAccept', function (file, response) {
         if (!response.IsSuccess) {

         // 通过return false来告诉组件，此文件上传有错。IsSuccess是后台返回的json的一个字段

         var responseRaw = response._raw;
         //  var finalData=responseraw.replace(/[\\]/g,"")
         // alert(typeof finalData)
         //  console.log("finalData",finalData)
         var responsePosterObjectData = eval("(" + responseRaw + ")");
         // alert(typeof objectData);
         //console.log(objectData);
         // console.log(objectData.data.path);

         $scope.releaseForSpecial.SectionImgCoverUrl1 = responsePosterObjectData.data.path;
         /!*  $scope.sectionImgArry.push($scope.releaseForSpecial.SectionImgCoverUrl1)
         console.log($scope.sectionImgArry)*!/


         return false;
         } else {

         console.log("response.IsSuccess=>", response,file);
         }
         });

         // 文件上传成功，给item添加成功class, 用样式标记上传成功
         //为什么成功之后进入uploadAccept方法不进入uploadSuccess方法??
         //为什么加入这个判断!response.IsSuccess ?
         /!* uploader.on('uploadSuccess', function (file, data) {

         console.log("进入了上传成功方法"+data._raw);
         var dataRaw=JSON.stringify(data._raw);
         alert(typeof dataRaw)
         dataRaws=JSON.parse(resData);
         $scope.releaseForSpecial.coverUrl = dataRaws.data.path;
         console.log("图片上传成功=>", $scope.releaseForSpecial.coverUrl);
         /!* var $li = $('#' + file.id)
         , $percent = $li.find('.progress .progress-bar')
         , formGirlShow = $('#formGirlShow')
         , questionuuid = $li.parents('[data-questionuuid]').attr('data-questionuuid')
         , hiddenQuestionInput = formGirlShow.find('input[name="' + questionuuid + '"]');
         $percent.text('上传成功');
         if (hiddenQuestionInput.length == 0) {
         formGirlShow.append('<input type="hidden" name="' + questionuuid + '" value="' + data.detail.uuid + '" />');
         } else {
         ////
         hiddenQuestionInput.val(data.detail.uuid);
         }*!/
         });*!/

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

         }*/
//测试

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
                '    <option value="actionDefault" >请选择行为</option>'+
                '  <optgroup label="活动">'+
                '  '+
                '   <option value="activityDetail">查看活动详情</option> '+
                '    <option value="launchInvitation">发起邀约</option>'+
                '  </optgroup>'+
                '  <optgroup label="邀约">'+
                '   <option value="invitationDetail">查看邀约详情</option>'+
                '  </optgroup>'+
                '  <optgroup label="自定义">'+
                '   <option value="jumpToHref">自定义链接</option>'+
                '  </optgroup>'+
                '</select>');

            $('#customContainer' + num).append($compile(
                    '<input class="form-control ifShowActionOptions" id="currentInputDataOfActionID' + num + '"' + '">'
                )($scope)
            );

            debugger
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

        if($("#" + actionSelectTargetID).hasClass('ifShowActionOptions')){
            $("#" + actionSelectTargetID).removeClass('ifShowActionOptions');
            $("#" + actioninputTargetID).removeClass('ifShowActionOptions');
            $("#"+targetOfactionEventObjectID).text('请选择行为')
        }else{
            $("#" + actionSelectTargetID).addClass('ifShowActionOptions');
            $("#" + actioninputTargetID).addClass('ifShowActionOptions');

            if(($("#"+actionSelectTargetID).val()!="actionDefault")&&($("#"+actioninputTargetID).val())){

                $("#"+targetOfactionEventObjectID).text('行为已隐藏')
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
       $("#currentSelectDataForAction" +deleteTreeByTargetID ).val("actionDefault");
        $("#currentInputDataOfActionID" +deleteTreeByTargetID ).val("");
        $("#currentSelectDataForAction" +deleteTreeByTargetID ).addClass("ifShowActionOptions");
        $("#currentInputDataOfActionID" +deleteTreeByTargetID ).addClass("ifShowActionOptions");

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
    $scope.updatePulishData = function () {
        $scope.releaseForSpecial.currentSelectedCityID = $scope.releaseForSpecial.currentSelectedCity.cityID;
        console.log("城市选项改变时城市", $scope.releaseForSpecial.currentSelectedCity);
        console.log("城市选项改变时城市ID", $scope.releaseForSpecial.currentSelectedCityID);
    };

    /**
     * 点击发布专题按钮事件
     */
    $scope.releaseBtnForSpecial = function () {

        //点击发布专题前先遍历获取到所有Section区域数据
        var SectionContainerNum = $(".J_sectionImgByRepeatArry img[class='sectionImgForPreview']");
        $scope.releaseForSpecial.SectionDataList=[];
        var SectionDatas=[];
        if(SectionContainerNum.length){

            for (var i = 0; i < SectionContainerNum.length; i++) {
                var currenSectionContainerNum = SectionContainerNum[i];
                var currentSectionImgID =$(currenSectionContainerNum).attr('id');
                var currentSectionIDfragment = currentSectionImgID.substring(currentSectionImgID.indexOf('_'));
                var currentSectionImgURL = $('#imgWU' + currentSectionIDfragment).attr('src');
                var currentSectionImgSelectActionOptions = $('#currentSelectDataForActionWU' + currentSectionIDfragment + ' option:selected');

                var currentSectionImgSelectActionValue = $(currentSectionImgSelectActionOptions).val();
                var currentSectionImgtInputValue = $('#currentInputDataOfActionIDWU' + currentSectionIDfragment).val();
                SectionDatas.push({'SectionImgURL':currentSectionImgURL,'SectionImgActionName':currentSectionImgSelectActionValue,'SectionImgActionRelateID':currentSectionImgtInputValue});

            }
        }
        $scope.releaseForSpecial.SectionDataList =SectionDatas;

        //配置要发送的数据
        $scope.releaseForSpecialConfig = {};
        $scope.releaseForSpecialConfig.title = $scope.releaseForSpecial.title;
        $scope.releaseForSpecialConfig.specialDescribe = $scope.releaseForSpecial.specialDescribe;
        $scope.releaseForSpecialConfig.cityID = $scope.releaseForSpecial.currentSelectedCityID;
        $scope.releaseForSpecialConfig.coverUrl = $scope.releaseForSpecial.coverUrl;

        //内容区域的数据
        $scope.releaseForSpecialConfig.SectionDataList= $scope.releaseForSpecial.SectionDataList;
        if (!$scope.specialPageModeIsCreate) {

            //编辑模式修改专题需要专题id
            $scope.releaseForSpecialConfig.id =  $scope.getSpecialPageDataByID.specialID;
        }

        //如果后端添加了此字段,可以和之前表单一起验证,就无需前端验证
        if (!$scope.releaseForSpecial.templateUrl) {
            alert('请填写完整信息');
            return
        }

        //编码URL
        $scope.releaseForSpecialParams = "&cityID=" + encodeURIComponent($scope.releaseForSpecialConfig.cityID) + "&title=" + encodeURIComponent($scope.releaseForSpecialConfig.title) + "&specialDescribe=" + encodeURIComponent($scope.releaseForSpecialConfig.specialDescribe) + "&coveUrl=" + encodeURIComponent($scope.releaseForSpecialConfig.coverUrl);
        if(/love/.test(location.href)){
           $scope.urlJoiningTogether= "http://app.api.qingniwan.love/Special/show?specialID="
        }else{
            $scope.urlJoiningTogether= "http://app.api.qingniwan.cc/Special/show?specialID="
        }
        $scope.releaseForSpecial.url = $scope.urlJoiningTogether+ $scope.releaseForSpecial.recomuuid+ $scope.releaseForSpecialParams;
        debugger
        $scope.releaseForSpecialConfig.url = $scope.releaseForSpecial.url;
        console.log("发布之前的配置数据=>", $scope.releaseForSpecialConfig);

        //将发送的数据转化为json格式
        $scope.releaseForSpecialFinalConfig = JSON.stringify($scope.releaseForSpecialConfig);

        //向后端发送数据
        $http.post($scope.API_releaseForSpecial, $scope.releaseForSpecialFinalConfig).success(function (res) {
            if (res.err == false) {

                // 发布成功提示消息及跳转到专题管理页面
                if (!$scope.specialPageModeIsCreate) {
                    alert("修改成功~")
                } else {
                    alert("发布成功~");
                }
               window.location.href = "/special/index";
            } else {
                alert(res.msg);
            }

        });

    };

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
var qingniwan = angular.module('qingniwan.admin', []);
qingniwan.directive('onFinishRender', ['$timeout', '$parse', function ($timeout, $parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                    /*  if(!!attr.onFinishRender){
                     debugger
                     $parse(attr.onFinishRender)(scope);
                     }*/
                });
            }
        }
    }
}])
qingniwan.controller('specialController', ['$scope', '$http', '$location', 'util', function ($scope, $http, $location, util) {

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
    $scope.publickSpecialData = {};
    $scope.publickSpecialData.currentData = {};
    //当前页数（初始值）
    $scope.publickSpecialData.currentData.page = 1;
    //当前条件下活动的总数量
    $scope.activetotals = 0;
    //每页数量
    $scope.pageNum = 20;
    //总页数
    $scope.pages;
    $scope.publickSpecialData.listInfoDatas = [];
    //默认接口
    $scope.publickSpecialData.interface = "/Special/specialRequest";
    //默认当前城市
    $scope.currentSelectedCity = {
        id: 110000,
        name: "北京市"
    };

    /**
     *  初始化首屏信息
     */
    $scope.getDataInfor = function () {
        $http.post($scope.publickSpecialData.interface, $scope.publickSpecialData.config).success(function (res) {

            $scope.publickSpecialData.listInfoDatas = res.data;
            //当前条件下活动总数
            $scope.activetotals = res.page;
            //构建分页 参数为显示多少页码
            $scope.groupPage(5);
            $scope.filter('/Special/specialRequest', 'cityID', $scope.currentSelectedCity.id);
        });

    };
    $scope.initializeBaseData = function () {
        $scope.publickSpecialData.config = JSON.stringify($scope.publickSpecialData.currentData);
        console.log("当前页页" + $scope.publickSpecialData.config);
        // $scope.CREATEPUBLICDATAS = JSON.stringify($scope.CREATEDATAS);
        //  $scope.publickSpecialData.config = '{page: ' + $scope.publickSpecialData.currentData.page + '}';
        $scope.publickSpecialData.interface = "/Special/specialRequest";
        $scope.getDataInfor();

    };

    /**
     * 发布专题&编辑专题 弹出框加载图片上传功能
     */
    $("#publicSpecial").on('shown.bs.modal', function () {


        /**
         * 发布玩事 - 上传海报
         */
        (function (factory) {
            if (!window.jQuery) {
                alert('jQuery is required.')
            }

            jQuery(function () {
                factory.call(null, jQuery);
            });
        })
        (function ($) {

            /**
             * START
             */

            /**
             * Uploader
             * @type {{init, crop, upload}}
             */

            var Uploader = (function () {

                // -------setting-------
                // 如果使用原始大小，超大的图片可能会出现 Croper UI 卡顿，所以这里建议先缩小后再crop.
                var FRAME_WIDTH = 1600;


                var _ = WebUploader;
                var Uploader = _.Uploader;
                var uploaderContainer = $('.uploader-container');
                var uploader, file;

                if (!Uploader.support()) {
                    alert('Web Uploader 不支持您的浏览器！');
                    throw new Error('WebUploader does not support the browser you are using.');
                }

                // hook,
                // 在文件开始上传前进行裁剪。
                Uploader.register({
                    'before-send-file': 'cropImage'
                }, {

                    cropImage: function (file) {

                        var data = file._cropData,
                            image, deferred;

                        file = this.request('get-file', file);
                        deferred = _.Deferred();

                        image = new _.Lib.Image();

                        deferred.always(function () {
                            image.destroy();
                            image = null;
                        });
                        image.once('error', deferred.reject);
                        image.once('load', function () {
                            image.crop(data.x, data.y, data.width, data.height, data.scale);
                        });

                        image.once('complete', function () {
                            var blob, size;

                            // 移动端 UC / qq 浏览器的无图模式下
                            // ctx.getImageData 处理大图的时候会报 Exception
                            // INDEX_SIZE_ERR: DOM Exception 1
                            try {
                                blob = image.getAsBlob();
                                size = file.size;
                                file.source = blob;
                                file.size = blob.size;

                                file.trigger('resize', blob.size, size);

                                deferred.resolve();
                            } catch (e) {
                                console.log(e);
                                // 出错了直接继续，让其上传原始图片
                                deferred.resolve();
                            }
                        });

                        file._info && image.info(file._info);
                        file._meta && image.meta(file._meta);
                        image.loadFromBlob(file.source);
                        return deferred.promise();
                    }
                });


                return {
                    init: function (selectCb) {
                        uploader = new Uploader({
                            pick: {
                                id: '#filePicker',
                                multiple: false
                            },

                            // 设置用什么方式去生成缩略图。
                            thumb: {
                                quality: 70,

                                // 不允许放大
                                allowMagnify: false,

                                // 是否采用裁剪模式。如果采用这样可以避免空白内容。
                                crop: false
                            },

                            // 禁掉分块传输，默认是开起的。
                            chunked: false,

                            // 禁掉上传前压缩功能，因为会手动裁剪。
                            compress: false,

                            // fileSingleSizeLimit: 2 * 1024 * 1024,

                            /*server: '../../server/fileupload.php',*/
                            server: '/Uploadimage/index',
                            fileVal: 'file1',
                            swf: '../../dist/Uploader.swf',
                            fileNumLimit: 1,
                            onError: function () {
                                var args = [].slice.call(arguments, 0);
                                alert(args.join('\n'));
                            }
                        });


                        uploader.on('fileQueued', function (_file) {
                            file = _file;

                            uploader.makeThumb(file, function (error, src) {

                                if (error) {
                                    alert('不能预览');
                                    return;
                                }

                                selectCb(src);

                            }, FRAME_WIDTH, 1);   // 注意这里的 height 值是 1，被当成了 100% 使用。
                        });

                        // 文件上传成功，给item添加成功class, 用样式标记上传成功
                        uploader.on('uploadSuccess', function (file, data) {
                            var cropperWrapper = $('.cropper-wraper'),
                                objData = {};

                            try {
                                objData = eval('(' + data._raw + ')');
                            } catch (e) {
                                console.log(e);
                                console.log('uploader.getFiles() before reset() =>', uploader.getFiles());
                                uploader.removeFile("WU_FILE_0", true);
                                console.log('uploader.getFiles() after reset() =>', uploader.getFiles());

                                cropperWrapper.hide();
                                $scope.uploaderContainerForPublish.removeClass('webuploader-element-invisible');
                                setTimeout(function () {
                                    (function () {
                                        $scope.initUploaderLogicForPublish();
                                    })()
                                }, 1000);
                                alert('上传服务出现问题, 请稍后再试 !');

                                return false;
                            }

                            cropperWrapper.hide();
                            $('#wrapper').append('<img src="' + objData.data.path + '" width="300" />');

                            alert('上传海报成功 !');

                            $scope.$apply(function () {
                                $scope.CREATEDATA.coverUrl = objData.data.path;
                            })

                        });

                        // 文件上传失败，显示上传出错
                        uploader.on('uploadError', function (file) {
                            alert('上传失败, 请重试 !')
                            container.removeClass('webuploader-element-invisible');
                            /*var $li        = $('#' + file.id)
                             , $percent = $li.find('.progress .progress-bar');

                             $percent.text('上传失败');*/
                        });

                        // 完成上传之后，无论成功或者失败，先删除进度条
                        uploader.on('uploadComplete', function (file) {
                            /*setTimeout(function () {
                             $('#' + file.id).find('.progress').fadeOut();
                             }, 500);*/
                        });

                        $scope.publishUploader = uploader;

                    },

                    crop: function (data) {

                        var scale = Croper.getImageSize().width / file._info.width;
                        data.scale = scale;

                        file._cropData = {
                            x: data.x1,
                            y: data.y1,
                            width: data.width,
                            height: data.height,
                            scale: data.scale
                        };
                    },

                    upload: function () {
                        uploader.upload();
                    }
                }

            })();

            /**
             * Cropper
             * @type {{setSource, getImageSize, setCallback, disable, enable}}
             */
            var Croper = (function () {
                var container = $('.cropper-wraper');
                var $image = container.find('.img-container img');
                var btn = $('.upload-btn');
                var isBase64Supported, callback;

                $image.cropper({
                    aspectRatio: 300 / 160,
                    preview: ".img-preview",
                    done: function (data) {
                        // console.log(data);
                    }
                });

                function srcWrap(src, cb) {

                    // we need to check this at the first time.
                    if (typeof isBase64Supported === 'undefined') {
                        (function () {
                            var data = new Image();
                            var support = true;
                            data.onload = data.onerror = function () {
                                if (this.width != 1 || this.height != 1) {
                                    support = false;
                                }
                            };
                            data.src = src;
                            isBase64Supported = support;
                        })();
                    }

                    if (isBase64Supported) {
                        cb(src);
                    } else {
                        // otherwise we need server support.
                        // convert base64 to a file.
                        $.ajax('../../server/preview.php', {
                            method: 'POST',
                            data: src,
                            dataType: 'json'
                        }).done(function (response) {
                            if (response.result) {
                                cb(response.result);
                            } else {
                                alert("预览出错");
                            }
                        });
                    }
                }

                btn.on('click', function () {
                    callback && callback($image.cropper("getData"));
                    return false;
                });

                return {
                    setSource: function (src) {

                        // 处理 base64 不支持的情况。
                        // 一般出现在 ie6-ie8
                        srcWrap(src, function (src) {
                            $image.cropper("setImgSrc", src);
                        });

                        container.removeClass('webuploader-element-invisible');

                        return this;
                    },

                    getImageSize: function () {
                        var img = $image.get(0);
                        return {
                            width: img.naturalWidth,
                            height: img.naturalHeight
                        }
                    },

                    setCallback: function (cb) {
                        callback = cb;
                        return this;
                    },

                    disable: function () {
                        $image.cropper("disable");
                        return this;
                    },

                    enable: function () {
                        $image.cropper("enable");
                        return this;
                    }

                }

            })();

            /**
             * Logic 发布完 - 初始化上传海报控件
             */
            $scope.initUploaderLogicForPublish = function () {

                // 如果已经有了上传控件实例, 则不需要再进行实例化了
                if ($('#filePicker').find('.webuploader-pick').length > 0) {
                    return false;
                }

                var container = $('.uploader-container');
                $scope.uploaderContainerForPublish = container;

                Uploader.init(function (src) {

                    Croper.setSource(src);

                    // 隐藏选择按钮。
                    container.addClass('webuploader-element-invisible');

                    // 当用户选择上传的时候，开始上传。
                    Croper.setCallback(function (data) {

                        Uploader.crop(data);

                        Uploader.upload();
                    });
                });
            };
            $scope.initUploaderLogicForPublish();


            //$('.create-event').on('shown.bs.modal', $scope.initUploaderLogicForPublish);

            /**
             * END
             */
            // console.log(uploader)

        });
    });
    $("#publicSpecial").on('hidden.bs.modal', function () {
        //  $scope.publishUploader.destroy();
//debugger;
        //console.log($scope.publishUploader)
        /*  debugger;
         delete window;
         destroy = function(){
         // uploader.destroy();
         delete window;
         console.log( $scope.initUploaderLogicForPublish);*/
        /* if(Uploader){
         // uploader.destroy();
         alert("123弹出")
         }*/
        /*     };*/

    });

    $("#editorSpecial").on('shown.bs.modal', function () {


        /**
         * 发布玩事 - 上传海报
         */
        (function (factory) {
            if (!window.jQuery) {
                alert('jQuery is required.')
            }

            jQuery(function () {
                factory.call(null, jQuery);
            });
        })
        (function ($) {




            /**
             * START
             */

            /**
             * Uploader
             * @type {{init, crop, upload}}
             */

            var Uploader = (function () {

                // -------setting-------
                // 如果使用原始大小，超大的图片可能会出现 Croper UI 卡顿，所以这里建议先缩小后再crop.
                var FRAME_WIDTH = 1600;


                var _ = WebUploader;
                var Uploader = _.Uploader;
                var uploaderContainer = $('.uploader-containers');
                var uploader, file;

                if (!Uploader.support()) {
                    alert('Web Uploader 不支持您的浏览器！');
                    throw new Error('WebUploader does not support the browser you are using.');
                }

                // hook,
                // 在文件开始上传前进行裁剪。
                Uploader.register({
                    'before-send-file': 'cropImage'
                }, {

                    cropImage: function (file) {

                        var data = file._cropData,
                            image, deferred;

                        file = this.request('get-file', file);
                        deferred = _.Deferred();

                        image = new _.Lib.Image();

                        deferred.always(function () {
                            image.destroy();
                            image = null;
                        });
                        image.once('error', deferred.reject);
                        image.once('load', function () {
                            image.crop(data.x, data.y, data.width, data.height, data.scale);
                        });

                        image.once('complete', function () {
                            var blob, size;

                            // 移动端 UC / qq 浏览器的无图模式下
                            // ctx.getImageData 处理大图的时候会报 Exception
                            // INDEX_SIZE_ERR: DOM Exception 1
                            try {
                                blob = image.getAsBlob();
                                size = file.size;
                                file.source = blob;
                                file.size = blob.size;

                                file.trigger('resize', blob.size, size);

                                deferred.resolve();
                            } catch (e) {
                                console.log(e);
                                // 出错了直接继续，让其上传原始图片
                                deferred.resolve();
                            }
                        });

                        file._info && image.info(file._info);
                        file._meta && image.meta(file._meta);
                        image.loadFromBlob(file.source);
                        return deferred.promise();
                    }
                });


                return {
                    init: function (selectCb) {
                        uploader = new Uploader({
                            pick: {
                                id: '#filePickers',
                                multiple: false
                            },

                            // 设置用什么方式去生成缩略图。
                            thumb: {
                                quality: 70,

                                // 不允许放大
                                allowMagnify: false,

                                // 是否采用裁剪模式。如果采用这样可以避免空白内容。
                                crop: false
                            },

                            // 禁掉分块传输，默认是开起的。
                            chunked: false,

                            // 禁掉上传前压缩功能，因为会手动裁剪。
                            compress: false,

                            // fileSingleSizeLimit: 2 * 1024 * 1024,

                            /*server: '../../server/fileupload.php',*/
                            server: '/Uploadimage/index',
                            fileVal: 'file1',
                            swf: '../../dist/Uploader.swf',
                            fileNumLimit: 1,
                            onError: function () {
                                var args = [].slice.call(arguments, 0);
                                alert(args.join('\n'));
                            }
                        });


                        uploader.on('fileQueued', function (_file) {
                            file = _file;

                            uploader.makeThumb(file, function (error, src) {

                                if (error) {
                                    alert('不能预览');
                                    return;
                                }

                                selectCb(src);

                            }, FRAME_WIDTH, 1);   // 注意这里的 height 值是 1，被当成了 100% 使用。
                        });

                        // 文件上传成功，给item添加成功class, 用样式标记上传成功
                        uploader.on('uploadSuccess', function (file, data) {
                            var cropperWrapper = $('.cropper-wrapers'),
                                objData = {};

                            try {
                                objData = eval('(' + data._raw + ')');
                            } catch (e) {
                                console.log(e);
                                console.log('uploader.getFiles() before reset() =>', uploader.getFiles());
                                uploader.removeFile("WU_FILE_0", true);
                                console.log('uploader.getFiles() after reset() =>', uploader.getFiles());

                                cropperWrapper.hide();
                                $scope.uploaderContainerForPublish.removeClass('webuploader-element-invisibles');
                                setTimeout(function () {
                                    (function () {
                                        $scope.initUploaderLogicForPublish();
                                    })()
                                }, 1000);
                                alert('上传服务出现问题, 请稍后再试 !');

                                return false;
                            }

                            cropperWrapper.hide();
                            $('#wrappers').append('<img src="' + objData.data.path + '" width="300" />');

                            alert('上传海报成功 !');

                            $scope.$apply(function () {
                                $scope.CREATEDATA.coverUrl = objData.data.path;
                            })

                        });

                        // 文件上传失败，显示上传出错
                        uploader.on('uploadError', function (file) {
                            alert('上传失败, 请重试 !')
                            container.removeClass('webuploader-element-invisibles');
                            /*var $li        = $('#' + file.id)
                             , $percent = $li.find('.progress .progress-bar');

                             $percent.text('上传失败');*/
                        });

                        // 完成上传之后，无论成功或者失败，先删除进度条
                        uploader.on('uploadComplete', function (file) {
                            /*setTimeout(function () {
                             $('#' + file.id).find('.progress').fadeOut();
                             }, 500);*/
                        });

                    },

                    crop: function (data) {

                        var scale = Croper.getImageSize().width / file._info.width;
                        data.scale = scale;

                        file._cropData = {
                            x: data.x1,
                            y: data.y1,
                            width: data.width,
                            height: data.height,
                            scale: data.scale
                        };
                    },

                    upload: function () {
                        uploader.upload();
                    }
                }
            })();

            /**
             * Cropper
             * @type {{setSource, getImageSize, setCallback, disable, enable}}
             */
            var Croper = (function () {
                var container = $('.cropper-wrapers');
                var $image = container.find('.img-containers img');
                var btn = $('.upload-btns');
                var isBase64Supported, callback;

                $image.cropper({
                    aspectRatio: 300 / 160,
                    preview: ".img-previews",
                    done: function (data) {
                        // console.log(data);
                    }
                });

                function srcWrap(src, cb) {

                    // we need to check this at the first time.
                    if (typeof isBase64Supported === 'undefined') {
                        (function () {
                            var data = new Image();
                            var support = true;
                            data.onload = data.onerror = function () {
                                if (this.width != 1 || this.height != 1) {
                                    support = false;
                                }
                            };
                            data.src = src;
                            isBase64Supported = support;
                        })();
                    }

                    if (isBase64Supported) {
                        cb(src);
                    } else {
                        // otherwise we need server support.
                        // convert base64 to a file.
                        $.ajax('../../server/preview.php', {
                            method: 'POST',
                            data: src,
                            dataType: 'json'
                        }).done(function (response) {
                            if (response.result) {
                                cb(response.result);
                            } else {
                                alert("预览出错");
                            }
                        });
                    }
                }

                btn.on('click', function () {
                    callback && callback($image.cropper("getData"));
                    return false;
                });

                return {
                    setSource: function (src) {

                        // 处理 base64 不支持的情况。
                        // 一般出现在 ie6-ie8
                        srcWrap(src, function (src) {
                            $image.cropper("setImgSrc", src);
                        });

                        container.removeClass('webuploader-element-invisibles');

                        return this;
                    },

                    getImageSize: function () {
                        var img = $image.get(0);
                        return {
                            width: img.naturalWidth,
                            height: img.naturalHeight
                        }
                    },

                    setCallback: function (cb) {
                        callback = cb;
                        return this;
                    },

                    disable: function () {
                        $image.cropper("disable");
                        return this;
                    },

                    enable: function () {
                        $image.cropper("enable");
                        return this;
                    }
                }

            })();

            /**
             * Logic 发布完 - 初始化上传海报控件
             */
            $scope.initUploaderLogicForPublish = function () {

                // 如果已经有了上传控件实例, 则不需要再进行实例化了
                if ($('#filePickers').find('.webuploader-pick').length > 0) {
                    return false;
                }

                var container = $('.uploader-containers');
                $scope.uploaderContainerForPublish = container;

                Uploader.init(function (src) {

                    Croper.setSource(src);

                    // 隐藏选择按钮。
                    container.addClass('webuploader-element-invisibles');

                    // 当用户选择上传的时候，开始上传。
                    Croper.setCallback(function (data) {

                        Uploader.crop(data);

                        Uploader.upload();
                    });
                });
            };
            $scope.initUploaderLogicForPublish();


            //$('.create-event').on('shown.bs.modal', $scope.initUploaderLogicForPublish);

            /**
             * END
             */

        });
    });

    //$('#publicSpecial').modal({backdrop: 'static', keyboard: false});
    // $('#editorSpecial').modal({backdrop: 'static', keyboard: false});

    // 专题管理页面 - 发布专题数据对象
    $scope.CREATEDATA = {};

    // 专题管理页面- 城市初始化
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

    //  监听当前选择的城市, 发生变化时同步更新 CREATEDATA.city
    $scope.updatePulishData = function () {
        $scope.CREATEDATA.city = $scope.currentSelectedCityForPublish.cityID;
        // console.log($scope.CREATEDATA.city);
    };

    //页面加载时, 初始化当前选择的城市
    $scope.currentSelectedCityForPublish = $scope.cities[0];

    // 页面加载时, 立即进行一次更新(根据当前选择的城市)
    $scope.updatePulishData();

    /**
     *发布新的专题
     */
    $('.J_publick_btn').click(function () {

        $scope.CREATEDATAS = {};
        $scope.CREATEDATAS.title = $scope.CREATEDATA.title;
        $scope.CREATEDATAS.specialDescribe = $scope.CREATEDATA.specialDescribe;
        $scope.CREATEDATAS.cityID = $scope.CREATEDATA.city;
        $scope.CREATEDATAS.coverUrl = $scope.CREATEDATA.coverUrl;

        if (!$scope.CREATEDATA.templateUrl) {
            alert('请填写完整信息');
            return
        }

        //编码后URL
        $scope.CREATEDATA.params = "?cityID=" + encodeURIComponent($scope.CREATEDATAS.cityID) + "&title=" + encodeURIComponent($scope.CREATEDATAS.title) + "&specialDescribe=" + encodeURIComponent($scope.CREATEDATAS.specialDescribe) + "&coveUrl=" + encodeURIComponent($scope.CREATEDATAS.coverUrl);
        $scope.CREATEDATA.url = $scope.CREATEDATA.templateUrl + $scope.CREATEDATA.params;
        $scope.CREATEDATAS.url = $scope.CREATEDATA.url;

        //  console.log($scope.CREATEDATAS);
        $scope.CREATEPUBLICDATAS = JSON.stringify($scope.CREATEDATAS);
        //  console.log($scope.CREATEPUBLICDATAS);

        $http.post('/Special/collect', $scope.CREATEPUBLICDATAS).success(function (res) {
            if (res.err == false) {
                alert(res.msg);
                // $scope.CREATEDATAS = {};
                $scope.CREATEDATA.title = "";
                $scope.CREATEDATA.specialDescribe = "";
                $scope.CREATEDATA.coverUrl = "";
                $scope.CREATEDATA.url = "";
                $scope.CREATEDATA.templateUrl = "";
                $scope.initializeBaseData();

                $("#publicSpecial").modal("hide");
            } else {
                alert(res.msg);
            }
        });
    });

    //发布专题关闭按钮
    $(".J_publick_btnClose").click(function () {
        delete window;
        $scope.publishUploader.destroy();
        //  debugger
        $("#publicSpecial").modal("hide");
        $scope.CREATEDATA.title = "";
        $scope.CREATEDATA.specialDescribe = "";
        $scope.CREATEDATA.coverUrl = "";
        $scope.CREATEDATA.url = "";
        $scope.CREATEDATA.templateUrl = ""
    });

    //编辑条件
    $scope.infoDataObject = {};
    $scope.editorData = function (infoDataObject, index) {
        // debugger
        $scope.infoDataObject = infoDataObject;
        $scope.infoDataObjectCityID = infoDataObject.categoryid;
        //console.log( "当前项城市"+$scope.infoDataObjectCityID);

        $scope.infoDataObject.templateUrl = $scope.infoDataObject.url.split('?')[0];
        for (var i = 0; i < $scope.cities.length; i++) {
            if ($scope.cities[i].cityID == $scope.infoDataObjectCityID) {
                $scope.currentSelectedCityForPublish = $scope.cities[i];
                /*return*/
            }
        }
    };

    /**
     * 添加编辑事件
     */
    $('.J_editorSpecial_btn').click(function () {
        $scope.editorCondition = {};
        /*  if ($scope.infoDataObject.id == undefined) {
         alert('id不能为空');
         }*/
        $scope.editorCondition.id = $scope.infoDataObject.id;
        $scope.editorCondition.cityID = $scope.currentSelectedCityForPublish.cityID;

        if ($scope.CREATEDATA.coverUrl) {
            $scope.editorCondition.coverUrl = $scope.CREATEDATA.coverUrl;
        } else {
            $scope.editorCondition.coverUrl = $scope.infoDataObject.coverUrl;
        }
        $scope.editorCondition.specialDescribe = $scope.infoDataObject.specialDescribe;
        $scope.editorCondition.title = $scope.infoDataObject.title;
        $scope.editorCondition.templateUrl = $scope.infoDataObject.templateUrl;
        //编码后URL
        $scope.editorCondition.params = "?cityID=" + encodeURIComponent($scope.editorCondition.cityID) + "&title=" + encodeURIComponent($scope.editorCondition.title) + "&specialDescribe=" + encodeURIComponent($scope.editorCondition.specialDescribe) + "&coveUrl=" + encodeURIComponent($scope.editorCondition.coverUrl);
        $scope.editorCondition.url = $scope.editorCondition.templateUrl + $scope.editorCondition.params;
        // $scope.editorCondition.url = $scope.infoDataObject.url;
        console.log("当前图片url" + $scope.editorCondition.coverUrl);

        $scope.editorConditions = JSON.stringify($scope.editorCondition);
        //console.log("编辑"+  $scope.editorConditions);
        $http.post('/Special/edit', $scope.editorConditions).success(function (data) {
            if (data.err == false) {
                alert(data.msg);
                $scope.initializeBaseData();

            } else {
                alert(data.msg);
            }
        });
    });

    /**
     *跳转到发布专题页面进行编辑
     */
    $scope.JumpToSpecialPublishPage = function (infoDataObject, index) {
        console.log("模拟数据对象", infoDataObject);
        $scope.JumpToSpecialPublishPageID = infoDataObject.id;
        window.location.href = "/special/editor?specialID=" + $scope.JumpToSpecialPublishPageID;
    };

    //删除条件
    $scope.deleteCondition = {};
    /**
     * 构建删除条件
     * @param id 活动唯一ID
     * @param index 要操作的当前活动的索引
     */
    $scope.delmodal = function (id, index) {
        $scope.deleteCondition.id = id;
        //$scope.deleteCondition.source = util.getParams('source');
        // $scope.deleteCondition.index = index;
    };

    /**
     * 添加删除事件
     */
    $('.J_delete_btn').click(function () {
        if ($scope.deleteCondition.id == undefined) {
            alert('id不能为空');
        }
        $scope.deleteConditions = JSON.stringify($scope.deleteCondition);
        $http.post('/Special/del', $scope.deleteConditions).success(function (data) {
            if (data.err == false) {
                alert('删除成功');
                $scope.initializeBaseData();
                // $($('.J_main_info').get($scope.deleteCondition.index)).hide();

            } else {
                alert(data.msg);
            }
        });
    });

    $scope.publicSpecialBtn = function () {
        $scope.currentSelectedCityForPublish = $scope.cities[0];
    };

    /**
     * 上架或下架活动
     * @param id 活动唯一ID
     * @param status 上架或下架活动
     * @param index 筛选后数据 的索引
     */
    $scope.audit = function (id, status, index) {
        $scope.operationCondition = {};
        $scope.operationCondition['id'] = id;
        $scope.operationCondition['status'] = status;

        $scope.operationConditions = JSON.stringify($scope.operationCondition);
        /*if ($scope.auditCondition.evaluation == '' && $scope.auditCondition.startTime == '' || $scope.auditCondition.endTime == '') {
         alert('注意："活动评价" 和 "活动的开始/结束时间" 不能都为空');
         } else */

        $http.post('/Special/mod', $scope.operationConditions).success(function (data) {
            if (data.err == false) {
                alert('操作成功');
                $scope.initializeBaseData();
                // $scope.listInfoDatas[index].status = data.status;
            } else {
                alert(data.msg);
            }
        });
    };

    /**
     *   根据条件筛选数据
     */
    $scope.filtercondition = {};
    $scope.filter = function (filterInterface, filterCondition, filterValue) {

        // $scope.interface = filterInterface

        $scope.filtercondition[filterCondition] = filterValue;

        if (filterCondition == 'cityID') {

            // init
            // 侧边所有城市的 DOM 列表
            var citiesList = $('.J_pc_nav li');
            // 当前用户选中的城市
            var currentSelectedCityBox = $('#J_area' + filterValue);

            // process
            // 更新 UI 状态
            citiesList.removeClass('active');
            currentSelectedCityBox.addClass('active');

            // 如果当前要做的filter是area类型, 则在随后的异步请求完成之后更新
            $scope.currentSelectedCity.needUpdate = true;
        }

        /*   if (filterCondition != 'page') {
         //初始化
         $scope.filtercondition.page = 1;
         }*/
        $scope.filterconditions = JSON.stringify($scope.filtercondition);
        $http.post(filterInterface, $scope.filtercondition).success(function (data) {

            // 如果此次做的异步请求的filter是area类型,
            // 则根据侧边菜单的选中状态, 更新当前选中的城市信息
            // 用于在活动列表中点击 "地图图标" 定位时, 自动列出当前城市下的商圈
            if ($scope.currentSelectedCity.needUpdate) {
                $scope.currentSelectedCity = {
                    id: filterValue,
                    name: $.trim(currentSelectedCityBox.text()),
                    needUpdate: false
                };
                console.warn('当前切换到城市 => ', $scope.currentSelectedCity)
            }

            $scope.publickSpecialData.listInfoDatas = data.data;

            //当前条件下活动总数
            $scope.activetotals = data.page;
            //构建分页 参数为显示多少页码
            $scope.groupPage(5);
            //预览当前条件下的第一个活动
            /*if ($scope.publickSpecialData.listInfoDatas.length == 0) {
             alert('没有数据~');
             console.warn('没有数据~ => ', $scope.publickSpecialData.listInfoDatas);
             } else {
             //$scope.preview($scope.publickSpecialData.listInfoDatas[0].url);
             }*/
            //显示活动列表回到顶部
            $('.J_main_scrollTop').scrollTop(0);
        })
    };

    /**
     * 当前来源下的 活动搜索
     * @param filterInterface 查询接口
     * @param filterCondition 查询类型
     * @param filterValue 要查询的值 用户输入的关键字
     * @returns {boolean}
     */
    $scope.searchKeywordText = "";
    $scope.searchByKeyword = function (filterInterface, filterCondition, filterValue) {
        $scope.filter(filterInterface, filterCondition, filterValue);
    };

    /**
     * 快速搜索功能
     */
    document.onkeydown = function (e) {
        if (!e) e = window.event;//火狐中是 window.event
        if ((e.keyCode || e.which) == 13) {
            $scope.searchByKeyword('/Special/specialRequest', 'title', $scope.searchKeywordText)
        }
    };

    /**
     * 菜单切换
     */
    $('.J_pc_nav ul li').each(function (val) {
        $(this).click(function () {
            $('.J_pc_nav ul li').removeClass('active');
            $('.J_usercontrol_tit .row').hide();

            $(this).addClass('active');
            $('.J_tit_' + $(this).attr('index')).show();
        });
    });

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
            if (i == $scope.publickSpecialData.currentData.page) {
                //  debugger;
                $scope.pageHtml += '<li><a class="active">' + i + '</a></li>';
            } else {
                $scope.pageHtml += '<li><a>' + i + '</a></li>';
            }
        };

        //当前页码等于第一页时
        if ($scope.publickSpecialData.currentData.page == 1) {
            $('#J_pagePre').hide();
        } else {
            $('#J_pagePre').show();
        }

        //当前页码等于最后一页时
        if ($scope.publickSpecialData.currentData.page == $scope.pages) {
            $('#J_pageNext').hide();
        } else {
            $('#J_pageNext').show();
        }

        var i;
        if ($scope.pages < showPageNums) { //总页数 < 设置的显示页码数量时

            for (i = 1; i <= $scope.pages; i++) {
                groupPageHtml();
            }

        } else if ($scope.publickSpecialData.currentData.page <= curPageBeforeNums) { //当前页码 < 当前页码前面显示数量时

            for (i = 1; i <= showPageNums; i++) {
                groupPageHtml();
            }

        } else if ($scope.publickSpecialData.currentData.page > curPageBeforeNums && (parseInt($scope.publickSpecialData.currentData.page) + curPageAfterNums) < $scope.pages) { //当前页码 > 当前页码后面显示数量 && 总页数 > （当前页码＋当前页码后面显示数量）

            for (i = ($scope.publickSpecialData.currentData.page - curPageBeforeNums); i <= (parseInt($scope.publickSpecialData.currentData.page) + curPageAfterNums); i++) {
                groupPageHtml();
            }

        } else if ($scope.publickSpecialData.currentData.page >= curPageBeforeNums && (parseInt($scope.publickSpecialData.currentData.page) + curPageAfterNums) >= $scope.pages) { //当当前页码 > 当前页码前面显示数量时 && 总页数 < （当前页码＋当前页码后面显示数量）

            for (i = ($scope.pages - (showPageNums - 1)); i <= $scope.pages; i++) {
                groupPageHtml();
            }

        }

        $('.J_main_page').html($scope.pageHtml);

        $('.J_main_page a').each(function () {
            $(this).click(function () {
                $scope.publickSpecialData.currentData.pageCityID = $scope.currentSelectedCity.id;
                $scope.publickSpecialData.currentData.page = parseInt($(this).html());
                // console.log( $scope.publickSpecialData.currentData.pageCityID);
                //  console.log("数字类型"+ $scope.publickSpecialData.currentData.page);
                // $scope.filter('/Special/specialRequest', 'cityID', $scope.currentSelectedCity.id);
                // 请求第二页
                // $scope.control($scope.publickSpecialData.currentData.page);
                $scope.config = {};
                $scope.config.cityID = $scope.publickSpecialData.currentData.pageCityID;
                $scope.config.page = $scope.publickSpecialData.currentData.page;
                $scope.configs = JSON.stringify($scope.config);
                // console.log("页码对象"+$scope.configs);
                $http.post("/Special/specialRequest", $scope.configs).success(function (res) {
                    //  console.log(res.data);
                    $scope.publickSpecialData.listInfoDatas = res.data;
                    //当前条件下活动总数
                    $scope.activetotals = res.page;
                    //构建分页 参数为显示多少页码
                    $scope.groupPage(5);
                });
            })
        })

    };
    //上一页
    $('#J_pagePre').click(function () {
        //groupPageHtml
        $scope.filter("/Special/specialRequest", 'page', $scope.publickSpecialData.currentData.page - 1);
        $scope.publickSpecialData.currentData.page = $scope.publickSpecialData.currentData.page - 1
        //debugger
        groupPageHtml()
    });
    //下一页
    $('#J_pageNext').click(function () {
        $scope.filter("/Special/specialRequest", 'page', parseInt($scope.publickSpecialData.currentData.page) + 1);
        $scope.publickSpecialData.currentData.page = $scope.publickSpecialData.currentData.page + 1
        //debugger
        groupPageHtml()
    });
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
     * 自定义粘贴方法
     */
    $scope.$on('callMyCustomMethod', function (ngRepeatFinishedEvent) {
        debugger;
        var currentZeroClipboardArry = [];
        for (var i = 0; i < $scope.publickSpecialData.listInfoDatas.length; i++) {
            var currentID = $scope.publickSpecialData.listInfoDatas[i].id;
            currentZeroClipboardObject = new ZeroClipboard(document.getElementById("copy-button" + currentID));
            currentZeroClipboardArry.push(currentZeroClipboardObject);
            /*   currentZeroClipboardObject.on( "aftercopy", function( event ) {
             console.log("当前复制数据222",event.data["text/plain"])
             })*/
        }
        for (var i = 0; i < currentZeroClipboardArry.length; i++) {
            (function () {
                var currentZeroClipboardArryCreateReady = currentZeroClipboardArry[i];
                currentZeroClipboardArryCreateReady.on("ready", function (readyEvent) {
                    currentZeroClipboardArryCreateReady.on("aftercopy", function (event) {
                        console.log("当前复制数据", event.data["text/plain"])
                        alert("复制成功~")

                    });
                })

            } )()

        }
    });


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
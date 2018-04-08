//index.js
//获取应用实例
const app = getApp()
const charts = require('../../utils/wcharts.js');

Page({
    data: {
        motto: 'Hello World',
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        array: ['250日均线', '120日均线', '60日均线'],
        dateArray: ['250', '120', '60'],
        value: 0,
        sorted60List: [],
        sorted120List: [],
        sorted250List: [],
        updateTime: 0,
        indexInfo: null,
        indexesList: null,
        chosenClass: '',
        indexNum: 0,
        toView: '',
        scrollTop: 0,
        height: 63

    },
    onLoad: function() {
        this.fetchList();
    },
    canvasIdErrorCallback: function (e) {
        console.error(e.detail.errMsg)
    },
    touchHandler: function(e) {
        charts.showToolTip(e);
    },
    onReady: function (e) {
        // 使用 wx.createContext 获取绘图上下文 context
    },
    onShow: function() {
    },
    // 获取设备的高宽
    getSystemSize: function() {
        try {
            var res = wx.getSystemInfoSync();
            return {
                w: res.windowWidth,
                h: res.windowHeight
            }
        }catch(err) {
            console.log(err);
        }
    },
    bindPickerChange: function(e) {
        var self = this;
        var value = e.detail.value;
        var list = [];
        switch(+value) {
            case 0:
                list = self.data.sorted250List;
                break;
            case 1:
                list = self.data.sorted120List;
                break;
            case 2:
                list = self.data.sorted60List;
                break;
        }
        self.setData({
            value: value,
            indexesList: list,
            toView: 'item'+self.data.indexInfo.indexcode
        });
        this.setCharts();

        this.navToFund();
    },
    setCharts: function() {
        var self = this;
        var indexInfo = self.data.indexInfo;
        var value = +self.data.value;
        var context = wx.createCanvasContext('charts');
        var systemSize = self.getSystemSize();
        var xDataList = indexInfo.alldates;
        var y2DataList = indexInfo.allindex;
        var maxIndex = indexInfo.max_index;
        var minIndex = indexInfo.min_index;
        var indexName = indexInfo.indexfullname;
        var box1Color = '';
        var box2Color = '';
        var tipsBoxes = [];
        var box1 = {
            width: 65,
            height: 20,
            fontColor: '#ffffff'
        };
        var box2 = {
            height: 20,
            fontColor: '#ffffff'
        };

        switch(value) {
            case 0:
                var maxAvange = indexInfo.ma_max_250;
                var minAvange = indexInfo.ma_min_250;
                var y1DataList = indexInfo.allma_250;
                var diffAvange = indexInfo.diff_250;
                var action = indexInfo.action_250;
                var avangeName = '250日均线';
                break;
            case 1:
                var maxAvange = indexInfo.ma_max_120;
                var minAvange = indexInfo.ma_min_120;
                var y1DataList = indexInfo.allma_120;
                var diffAvange = indexInfo.diff_120;
                var action = indexInfo.action_120;
                var avangeName = '120日均线';
                break;
            case 2:
                var maxAvange = indexInfo.ma_max_60;
                var minAvange = indexInfo.ma_min_60;
                var y1DataList = indexInfo.allma_60;
                var diffAvange = indexInfo.diff_60;
                var action = indexInfo.action_60;
                var avangeName = '60日均线';
                break;
        }

        if(diffAvange > 20) {
            box1Color = '#63C091';
            box2Color = '#a1d9be';
        }else{
            box1Color = '#E45E6C';
            box2Color = '#ef9ea7';
        }

        box1.backgroundColor = box1Color;
        box1.tipsContent = '偏移'+diffAvange+'%';

        box2.backgroundColor = box2Color;
        box2.tipsContent = action;
        box2.width = self.countWidth(box2.tipsContent);
        tipsBoxes.push(box1);

        if(value == 0) {
            tipsBoxes.push(box2);
        }

        var maxYArisData = Math.max(maxAvange, maxIndex)*1.2;
        var minYArisData = Math.min(minAvange, minIndex) * 0.8;

        charts.init(context, {
            series: [
                {
                    xArisData: {
                        data: (function() {
                            let _data = [];
                            let len = xDataList.length;
                            for(var i=0; i<len; i++) {
                                _data.push({
                                    value: xDataList[i]
                                })
                            }


                            return _data;
                        })()
                    },
                    yArisData: {
                        data: (function() {
                            let _data = [];
                            let len = y1DataList.length;
                            for(var i=len-1; i>=0; i--) {
                                if(!y1DataList[i]) {
                                    y1DataList[i] = y1DataList[i+1];
                                }
                                _data.push({
                                    value: y1DataList[i]
                                })
                            }

                            return _data;
                        })()
                    },
                    type: 'lineDash',
                    color: '#999999',
                    name: avangeName
                },
                {
                    xArisData: {
                        data: (function() {
                            let _data = [];
                            let len = xDataList.length;
                            for(var i=len-1; i>=0; i--) {
                                _data.push({
                                    value: xDataList[i]
                                })
                            }

                            return _data;
                        })()
                    },
                    yArisData: {
                        data: (function() {
                            let _data = [];
                            let len = y2DataList.length;
                            for(var i=len-1; i>=0; i--) {
                                if(!y2DataList[i]) {
                                    y2DataList[i] = y2DataList[i+1];
                                }
                                _data.push({
                                    value: y2DataList[i]
                                })
                            }

                            return _data;
                        })(),
                    },
                    type: 'line',
                    color: '#999999',
                    name: indexName,
                    drawPoint: {
                        point: (function(){
                            let pointsIndex = [];
                            let index = 249;
                            pointsIndex.push(index);
                            return pointsIndex;
                        })(),
                        pointColor: box1Color
                    },
                    tipsBoxes: tipsBoxes
                }
            ],
            minYArisData: minYArisData,
            maxYArisData: maxYArisData,
            width: systemSize.w*0.9,
            height: systemSize.w * 0.6
        });
    },
    countWidth: function(con) {
        return (14 * con.length > 70 ? 70 : 14 * con.length);
    },
    fetchList: function() {
        var url = "https://m.aniu.com.cn/superfund/ma_share/";
        var self = this;

        wx.request({
            url: url,
            header: {
                'content-type': 'application/json',
            },
            success: function(res) {
                self.setData({
                    updateTime: res.data.updatetime
                })
                self.setList(res.data);
                self.setData({
                    toView: 'item'+self.data.indexInfo.indexcode,
                })
                self.setCharts();
            }
        })
    },
    setList: function(data) {
        this.setData({
            sorted60List: data.sorted_60
        });
        this.setData({
            sorted120List: data.sorted_120
        });
        this.setData({
            sorted250List: data.sorted_250
        });
        this.setData({
            indexesList: data.sorted_250
        });
        this.setNowIndexInfo();
    },
    setNowIndexInfo: function() {
        var self = this;
        self.data.indexesList.forEach(function(item, index) {
            var i = index>0?index-1:index;
            if(item.indexfullname == '上证50指数') {
                self.setData({
                    indexInfo: item,
                    scrollTop: self.data.height * i
                })
            }
        })
    },
    choseIndex: function(e) {
        var fund = e.target.dataset.fund;
        var self = this;
        this.setData({
            indexInfo: fund,
            toView: 'item'+fund.indexcode
        });

        self.setCharts();
    },
    navToFund: function() {
        var self = this;
        var indexInfo = self.data.indexInfo;
        var indexesList = self.data.indexesList;
        var itemHeight = self.data.height;

        var i = 0;

        indexesList.forEach(function(item, index){
            if(item.indexfullname == indexInfo.indexfullname) {
                i = index>0?index-1:index;
            }
        });

        var top = itemHeight * i;

        self.setData({
            scrollTop: top
        })
    },
    bindNavToIndex: function() {
        this.navToFund();
    },
    onShareAppMessage: function(res) {
        if(res.from == 'button') {
            console.log(res.target);
        }

        return {
            title: '均线小程序',
            path: 'pages/index/index'
        }
    }
})
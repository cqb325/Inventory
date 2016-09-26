const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');
const MessageBox = require('../lib/MessageBox');
const moment = require('../lib/moment');
const classnames = require("../lib/classnames");
const echarts = require("../lib/echarts");
const DateRange = require("../lib/DateRange");
const FormControl = require("../lib/FormControl");

const InventoryService = require("../services/InventoryService");

let Page = React.createClass({

    getInitialState(){
        return {histories: null};
    },

    componentDidMount(){
        this.loadFundInfo();
    },

    search(){
        this.loadFundInfo();
    },

    loadFundInfo(){
        let times = this.refs.search_daterange.getValue();

        InventoryService.getFundHistory(times[0], times[1]+" 23:59:59", (list, err)=>{
            this.renderChart(list);
        });
    },

    renderChart(data){
        let x = data.map((item)=>{
            return moment(item.opdate).format("MM-DD");
        });
        let temp = [], totalFund = 0, inFund = [], outFund = [];
        let total = [];
        data.forEach(function (item) {
            totalFund += item.fund;
            total.push(totalFund);
            let top = 0;
            if(item.fund > 0){
                inFund.push(item.fund);
                outFund.push('-');
                top = item.fund;
            }else{
                inFund.push('-');
                outFund.push(Math.abs(item.fund));
            }
            temp.push(totalFund - top);
        });

        let ec = echarts.init(document.getElementById('fund_chart'));
        var option = {
            title: {
                text: '仓库资产变化',
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params) {
                    var tar;
                    if (params[1].value != '-') {
                        tar = params[1];
                    }
                    else {
                        tar = params[0];
                    }
                    return tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
                }
            },
            legend: {
                y: 'bottom',
                data:['付款','收款']
            },
            grid: {
                left: '3%',
                right: '4%'
            },
            xAxis: {
                type: 'category',
                data: x,
                splitLine: {
                    show: false
                }
            },
            yAxis: {type : 'value'},
            series: [{
                name: '辅助',
                type: 'bar',
                stack: '总量',
                itemStyle: {
                    normal: {
                        barBorderColor: 'rgba(0,0,0,0)',
                        color: 'rgba(0,0,0,0)'
                    },
                    emphasis: {
                        barBorderColor: 'rgba(0,0,0,0)',
                        color: 'rgba(0,0,0,0)'
                    }
                },
                data: temp
            },{
                name: '收款',
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                data: inFund
            },
                {
                    name: '付款',
                    type: 'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true,
                            position: 'bottom'
                        }
                    },
                    data: outFund
                },{
                    name: '总值',
                    type: 'line',
                    stack: '总值',
                    data: total
                }]
        };

        ec.setOption(option);
    },

    render(){
        let scope = this;
        let startDate = moment().add(-1,"month").format("YYYY-MM-DD");
        let endDate = moment().format("YYYY-MM-DD");
        return (
            <div className="main-container">
                <Label className="searchTools mt-30 mb-20" component="div">
                    <FormControl ref="search_daterange" label="统计时间: " type="daterange" value={startDate+"~"+endDate}></FormControl>
                    <Label className="text-right pull-right">
                        <Button icon="search" theme="success" raised={true} className="ml-10" onClick={this.search}>查 询</Button>
                    </Label>
                </Label>
                <div id="fund_chart" style={{width: "100%", height: "400px"}}>

                </div>
            </div>
        );
    }
});

module.exports = Page;
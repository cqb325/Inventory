/**
 * Created by cqb32_000 on 2016-07-19.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');
const Table = require('../lib/Table');
const Pagination = require('../lib/Pagination');
const Input = require('../lib/Input');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const moment = require('../lib/moment');
const classnames = require("../lib/classnames");
const echarts = require("../lib/echarts");
const echartsDark = require("../lib/echarts-dark");

const InventoryService = require("../services/InventoryService");

let Page = React.createClass({

    getInitialState(){
        return {histories: null};
    },

    componentDidMount(){
        this.loadProductInfo();
    },

    loadProductInfo(){
        InventoryService.getStockHistory(this.props.params.prod_id, (list, err)=>{
            this.setState({
                histories: list
            });
        });
    },

    renderTimeLine(){
        let histories = this.state.histories;

        let htmls = [];

        if(histories){

            this.renderChart(histories);

            histories.forEach((item, index)=>{
                let clazz = classnames("cls", {
                    "highlight": item.op == "入库"
                });
                htmls.push(<li key={index} className={clazz}>
                            <p className="date">{moment(item.time).format("YYYY年MM月DD日")}</p>
                            <p className="intro">{item.op}</p>
                            <p className="version">&nbsp;</p>
                            <div className="more">
                                <p>数量：{item.amount}</p>
                                <p>总价：{item.fund}</p>
                            </div>
                        </li>);
            });
        }

        return htmls;
    },

    renderChart(data){
        let x = data.map((item)=>{
            return moment(item.time).format("MM-DD");
        });
        x.reverse();
        let values = data.map(function (item) {
            return item.stoamount;
        });
        values.reverse();
        let ec = echarts.init(document.getElementById('stock_product_chart'), "dark");
        var option = {
            textStyle: {
                color: "#ffffff"
            },
            title: {
                text: '产品库存变化曲线',
                left: 'center',
                textStyle: {
                    color: '#ffffff'
                }
            },
            tooltip: {},
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: x,
                splitLine: {
                    show: false
                },
                boundaryGap: false
            },
            yAxis: {},
            series: [{
                name: '产品库存量',
                type: 'line',
                data: values
            }]
        };

        ec.setOption(option);
    },

    render(){
        let scope = this;

        let times = this.renderTimeLine();
        return (
            <div className="main-container timeline-bg content">
                <div id="stock_product_chart" style={{width: "100%", height: "400px"}}>

                </div>
                <div className="content">
                    <div className="wrapper">
                        <div className="light"><i></i></div>
                        <hr className="line-left"/>
                        <hr className="line-right"/>
                        <div className="main">
                            <p className="title">仓库中该产品记录</p>
                            <div className="year">
                                <h2><a href="javascript:void(0)">时间<i></i></a></h2>
                                <div className="list">
                                    <ul>
                                        {times}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = Page;
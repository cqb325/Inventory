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
    displayName: 'Page',


    getInitialState() {
        return { histories: null };
    },

    componentDidMount() {
        this.loadProductInfo();
    },

    loadProductInfo() {
        InventoryService.getStockHistory(this.props.params.prod_id, (list, err) => {
            this.setState({
                histories: list
            });
        });
    },

    renderTimeLine() {
        let histories = this.state.histories;

        let htmls = [];

        if (histories) {

            this.renderChart(histories);

            histories.forEach((item, index) => {
                let clazz = classnames("cls", {
                    "highlight": item.op == "入库"
                });
                htmls.push(React.createElement(
                    'li',
                    { key: index, className: clazz },
                    React.createElement(
                        'p',
                        { className: 'date' },
                        moment(item.time).format("YYYY年MM月DD日")
                    ),
                    React.createElement(
                        'p',
                        { className: 'intro' },
                        item.op
                    ),
                    React.createElement(
                        'p',
                        { className: 'version' },
                        ' '
                    ),
                    React.createElement(
                        'div',
                        { className: 'more' },
                        React.createElement(
                            'p',
                            null,
                            '数量：',
                            item.amount
                        ),
                        React.createElement(
                            'p',
                            null,
                            '总价：',
                            item.fund
                        )
                    )
                ));
            });
        }

        return htmls;
    },

    renderChart(data) {
        let x = data.map(item => {
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

    render() {
        let scope = this;

        let times = this.renderTimeLine();
        return React.createElement(
            'div',
            { className: 'main-container timeline-bg content' },
            React.createElement('div', { id: 'stock_product_chart', style: { width: "100%", height: "400px" } }),
            React.createElement(
                'div',
                { className: 'content' },
                React.createElement(
                    'div',
                    { className: 'wrapper' },
                    React.createElement(
                        'div',
                        { className: 'light' },
                        React.createElement('i', null)
                    ),
                    React.createElement('hr', { className: 'line-left' }),
                    React.createElement('hr', { className: 'line-right' }),
                    React.createElement(
                        'div',
                        { className: 'main' },
                        React.createElement(
                            'p',
                            { className: 'title' },
                            '仓库中该产品记录'
                        ),
                        React.createElement(
                            'div',
                            { className: 'year' },
                            React.createElement(
                                'h2',
                                null,
                                React.createElement(
                                    'a',
                                    { href: 'javascript:void(0)' },
                                    '时间',
                                    React.createElement('i', null)
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'list' },
                                React.createElement(
                                    'ul',
                                    null,
                                    times
                                )
                            )
                        )
                    )
                )
            )
        );
    }
});

module.exports = Page;

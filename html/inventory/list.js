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

const InventoryService = require("../services/InventoryService");

let List = React.createClass({
    displayName: 'List',


    getInitialState() {
        this.pageNum = 1;
        this.pageSize = 15;
        return {};
    },

    reloadTableData(pageNum, pageSize) {
        let params = Object.assign({}, {
            pageNum: pageNum,
            pageSize: pageSize,
            prod_name: this.refs.prod_name.getValue()
        });

        InventoryService.getPageList(params, ret => {
            if (!ret) {
                return;
            }
            this.refs.table.setData(ret.data);
            this.refs.pagination.update({
                current: ret.pageNum,
                pageSize: ret.pageSize,
                total: ret.total
            });

            this.pageNum = ret.pageNum;
            this.pageSize = ret.pageSize;
        });
    },

    search() {
        this.reloadTableData(this.pageNum, this.pageSize);
    },

    componentDidMount() {
        this.reloadTableData();
    },

    render() {
        let scope = this;
        let productFormat = function (value, column, row) {
            return React.createElement(
                'a',
                { href: "#inventory_detail/" + row.prod_id },
                value
            );
        };
        let header = [{ name: "prod_name", text: "名称", tip: true, format: productFormat }, { name: "prod_price", text: "单价" }, { name: "prod_brand", text: "品牌" }, { name: "prod_model", text: "型号" }, { name: "amount", text: "数量" }];
        return React.createElement(
            'div',
            { className: 'main-container' },
            React.createElement(
                Label,
                { className: 'searchTools mt-30 mb-20', component: 'div' },
                React.createElement(
                    Label,
                    { className: 'text-right', grid: 1 },
                    React.createElement(FormControl, { ref: 'prod_name', label: '产品名称: ', type: 'text' }),
                    React.createElement(
                        Button,
                        { icon: 'search', theme: 'success', raised: true, className: 'ml-10', onClick: this.search },
                        '查 询'
                    )
                )
            ),
            React.createElement(
                Tile,
                { header: '产品列表', contentStyle: { padding: "0px" } },
                React.createElement(
                    'div',
                    { style: { overflow: 'hidden' } },
                    React.createElement(Table, { ref: 'table', header: header, data: [], striped: true, className: 'text-center' }),
                    React.createElement(Pagination, { ref: 'pagination',
                        current: this.pageNum,
                        pageSize: this.pageSize,
                        total: 0,
                        onChange: this.reloadTableData,
                        onShowSizeChange: this.reloadTableData })
                )
            )
        );
    }
});

module.exports = List;
